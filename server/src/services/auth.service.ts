import crypto from 'crypto';
import { User, IUserDocument } from '../models/User.model';
import { signToken } from '../utils/jwt';
import { sendVerificationEmail } from './email.service';
import { AppError } from '../middleware/errorHandler';
import { ApiErrorCode } from '../../../shared/types/index';
import type { UserProfile } from '../../../shared/types/index';

/**
 * Register a new user.
 * - Creates user with hashed password
 * - Generates verification token (24hr expiry)
 * - Sends verification email
 */
export const register = async (
  email: string,
  password: string
): Promise<{ user: IUserDocument; token: string }> => {
  // Check if email already exists
  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    throw new AppError(
      'An account with this email already exists.',
      409,
      ApiErrorCode.DUPLICATE_EMAIL
    );
  }

  // Generate verification token
  const verificationToken = crypto.randomBytes(32).toString('hex');
  const verificationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

  // Create user (password hashed by pre-save hook)
  const user = await User.create({
    email: email.toLowerCase(),
    passwordHash: password, // Will be hashed by pre-save hook
    isVerified: false,
    verificationToken,
    verificationTokenExpiry,
    submissionCount: 0,
  });

  // Send verification email
  await sendVerificationEmail(email, verificationToken);

  // Sign JWT (user can access limited features while unverified)
  const jwtToken = signToken(user._id.toString());

  return { user, token: jwtToken };
};

/**
 * Login an existing user.
 * - Validates credentials
 * - Checks email verification status
 * - Returns JWT
 */
export const login = async (
  email: string,
  password: string
): Promise<{ user: IUserDocument; token: string }> => {
  // Find user by email
  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) {
    throw new AppError(
      'Invalid email or password.',
      401,
      ApiErrorCode.INVALID_CREDENTIALS
    );
  }

  // Compare password
  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new AppError(
      'Invalid email or password.',
      401,
      ApiErrorCode.INVALID_CREDENTIALS
    );
  }

  // Check verification status
  if (!user.isVerified) {
    throw new AppError(
      'Please verify your email before logging in.',
      403,
      ApiErrorCode.EMAIL_NOT_VERIFIED
    );
  }

  // Sign JWT
  const token = signToken(user._id.toString());

  return { user, token };
};

/**
 * Verify a user's email address using the verification token.
 */
export const verifyEmail = async (token: string): Promise<IUserDocument> => {
  const user = await User.findOne({
    verificationToken: token,
    verificationTokenExpiry: { $gt: new Date() },
  }).select('+verificationToken +verificationTokenExpiry');

  if (!user) {
    throw new AppError(
      'Verification link is invalid or has expired.',
      400,
      ApiErrorCode.VALIDATION_ERROR
    );
  }

  user.isVerified = true;
  user.verificationToken = undefined;
  user.verificationTokenExpiry = undefined;
  await user.save();

  return user;
};

/**
 * Resend verification email for an unverified user.
 */
export const resendVerification = async (email: string): Promise<void> => {
  const user = await User.findOne({ email: email.toLowerCase() }).select(
    '+verificationToken +verificationTokenExpiry'
  );

  if (!user) {
    // Don't reveal whether the email exists
    return;
  }

  if (user.isVerified) {
    throw new AppError(
      'Email is already verified.',
      400,
      ApiErrorCode.VALIDATION_ERROR
    );
  }

  // Generate new token
  const verificationToken = crypto.randomBytes(32).toString('hex');
  const verificationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);

  user.verificationToken = verificationToken;
  user.verificationTokenExpiry = verificationTokenExpiry;
  await user.save();

  await sendVerificationEmail(email, verificationToken);
};

/**
 * Get user profile (safe fields only).
 */
export const getProfile = async (userId: string): Promise<UserProfile> => {
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError('User not found.', 404, ApiErrorCode.NOT_FOUND);
  }

  return {
    _id: user._id.toString(),
    email: user.email,
    isVerified: user.isVerified,
    submissionCount: user.submissionCount,
    lastSubmittedAt: user.lastSubmittedAt,
    createdAt: user.createdAt,
  };
};
