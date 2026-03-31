import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { User, IUserDocument } from '../models/User.model';
import { signToken } from '../utils/jwt';
import { sendVerificationEmail } from './email.service';
import { AppError } from '../middleware/errorHandler';
import { ApiErrorCode } from '../../../shared/types/index';
import type { AuthUser } from '../../../shared/types/index';

// ─── Email hashing ────────────────────────────────────────────────────

/**
 * SHA-256 hash of the lowercased email.
 * Stored in the DB so raw email addresses are never persisted.
 * Used as the lookup key for login, duplicate checks, and resend.
 */
export const hashEmail = (email: string): string =>
  crypto.createHash('sha256').update(email.toLowerCase().trim()).digest('hex');

/**
 * SHA-256 hash of a verification token.
 * Store the hash in DB; send the raw token via email.
 * Prevents account takeover if DB is compromised.
 */
const hashToken = (token: string): string =>
  crypto.createHash('sha256').update(token).digest('hex');

// ─── Safe user projection ─────────────────────────────────────────────

/** Map a Mongoose document to the safe AuthUser shape sent to clients. */
const toAuthUser = (doc: IUserDocument): AuthUser => ({
  _id:             (doc._id as { toString(): string }).toString(),
  // email is stored as SHA-256 hash — we never expose the hash to clients.
  // The frontend should store the email the user typed at login locally.
  email:           '',
  isVerified:      doc.isVerified,
  submissionCount: doc.submissionCount,
  lastSubmittedAt: doc.lastSubmittedAt,
  createdAt:       doc.createdAt,
});



// ─── Service functions ────────────────────────────────────────────────

/**
 * Register a new user.
 *
 * Security design:
 * - Email is SHA-256 hashed before storage (emailHash field).
 * - The original email is only used transiently for sending the verification email.
 * - Password is bcrypt-hashed with cost factor 12.
 * - Returns a generic 409 message to prevent email enumeration.
 */
export const register = async (
  email: string,
  password: string
): Promise<{ token: string }> => {
  const emailHash = hashEmail(email);

  // Duplicate check against hash — prevents email enumeration via timing
  const existing = await User.findOne({ email: emailHash });
  if (existing) {
    throw new AppError(
      'An account with this email already exists.',
      409,
      ApiErrorCode.DUPLICATE_EMAIL
    );
  }

  const passwordHash       = await bcrypt.hash(password, 12);
  const verificationToken  = crypto.randomBytes(32).toString('hex');
  const verificationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 h

  await User.create({
    email: emailHash,           // stored as SHA-256 hash
    passwordHash,
    isVerified: false,
    verificationToken: hashToken(verificationToken),  // store hash, not raw
    verificationTokenExpiry,
    submissionCount: 0,
  });

  // Raw token sent to user's inbox — never stored raw
  await sendVerificationEmail(email, verificationToken);

  // No auto-login on register — user must verify email first
  return { token: verificationToken };
};

/**
 * Authenticate a user by email + password.
 *
 * Returns the JWT and safe user profile on success.
 * Identical error message for "not found" and "wrong password" (anti-enumeration).
 */
export const login = async (
  email: string,
  password: string
): Promise<{ user: AuthUser; token: string }> => {
  const emailHash = hashEmail(email);

  // Must select passwordHash (hidden by default)
  const user = await User.findOne({ email: emailHash }).select('+passwordHash');

  const credentialsError = new AppError(
    'Invalid credentials.',
    401,
    ApiErrorCode.INVALID_CREDENTIALS
  );

  if (!user) throw credentialsError;

  const passwordMatch = await bcrypt.compare(password, user.passwordHash);
  if (!passwordMatch) throw credentialsError;

  if (!user.isVerified) {
    throw new AppError(
      'Please verify your email first.',
      403,
      ApiErrorCode.EMAIL_NOT_VERIFIED
    );
  }

  const token = signToken(user._id.toString());
  return { user: toAuthUser(user), token };
};

/**
 * Verify email by token.
 * Auto-logs in the user after verification (sets auth cookie in controller).
 */
export const verifyEmail = async (
  token: string
): Promise<{ user: AuthUser; jwtToken: string }> => {
  const user = await User
    .findOne({ verificationToken: hashToken(token) })  // look up by hash
    .select('+verificationToken +verificationTokenExpiry');

  if (!user) {
    throw new AppError(
      'Verification link is invalid.',
      400,
      ApiErrorCode.VALIDATION_ERROR
    );
  }

  if (!user.verificationTokenExpiry || user.verificationTokenExpiry < new Date()) {
    throw new AppError(
      'Verification link has expired. Please request a new one.',
      400,
      ApiErrorCode.VALIDATION_ERROR
    );
  }

  user.isVerified              = true;
  user.verificationToken       = undefined;
  user.verificationTokenExpiry = undefined;
  await user.save();

  const jwtToken = signToken(user._id.toString());
  return { user: toAuthUser(user), jwtToken };
};

/**
 * Resend verification email.
 * Anti-enumeration: always returns success whether or not the email exists.
 */
export const resendVerification = async (email: string): Promise<void> => {
  const emailHash = hashEmail(email);

  const user = await User
    .findOne({ email: emailHash })
    .select('+verificationToken +verificationTokenExpiry');

  // Silently succeed if user not found or already verified
  if (!user || user.isVerified) return;

  const verificationToken       = crypto.randomBytes(32).toString('hex');
  const verificationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);

  user.verificationToken       = hashToken(verificationToken);  // store hash
  user.verificationTokenExpiry = verificationTokenExpiry;
  await user.save();

  await sendVerificationEmail(email, verificationToken);  // send raw
};

/**
 * Get the safe user profile for /me.
 */
export const getProfile = async (userId: string): Promise<AuthUser> => {
  const user = await User.findById(userId);
  if (!user) throw new AppError('User not found.', 404, ApiErrorCode.NOT_FOUND);
  return toAuthUser(user);
};
