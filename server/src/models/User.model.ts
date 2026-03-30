import mongoose, { Schema, Model, Document } from 'mongoose';
import type { IUser } from '../../../shared/types/index';

// ────────────────────────────────────────────────────────────────────
// Document Interface
// ────────────────────────────────────────────────────────────────────

/**
 * Mongoose document type for User.
 * Extends IUser (shared) with Mongoose Document internals.
 * Instance methods are declared here so they appear on the document.
 */
export interface IUserDocument extends Omit<IUser, '_id'>, Document {
  /** Compare a plain-text candidate against the stored passwordHash. */
  comparePassword(candidate: string): Promise<boolean>;
}

// ────────────────────────────────────────────────────────────────────
// Schema
// ────────────────────────────────────────────────────────────────────

export const userSchema = new Schema<IUserDocument>(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },

    passwordHash: {
      type: String,
      required: [true, 'Password hash is required'],
      select: false, // never returned in queries by default
    },

    isVerified: {
      type: Boolean,
      default: false,
    },

    verificationToken: {
      type: String,
      select: false, // sensitive — never returned by default
    },

    verificationTokenExpiry: {
      type: Date,
      select: false,
    },

    submissionCount: {
      type: Number,
      default: 0,
      min: 0,
    },

    lastSubmittedAt: {
      type: Date,
      default: null,
    },
  },
  {
    // Mongoose auto-manages createdAt + updatedAt via pre-save hook
    timestamps: true,
  }
);

// ────────────────────────────────────────────────────────────────────
// Indexes
// ────────────────────────────────────────────────────────────────────

userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ createdAt: 1 });

// ────────────────────────────────────────────────────────────────────
// Instance Methods
// ────────────────────────────────────────────────────────────────────

/**
 * Constant-time comparison of a candidate password against the
 * stored bcrypt hash.  The controller must `select('+passwordHash')`
 * before calling this.
 */
userSchema.methods.comparePassword = async function (
  this: IUserDocument,
  candidate: string
): Promise<boolean> {
  // Dynamic import avoids pulling bcrypt into the shared types
  const bcrypt = await import('bcryptjs');
  return bcrypt.compare(candidate, this.passwordHash);
};

// ────────────────────────────────────────────────────────────────────
// JSON Transform — strip sensitive fields before sending to client
// ────────────────────────────────────────────────────────────────────

userSchema.set('toJSON', {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  transform: (_doc: any, ret: any) => {
    delete ret.passwordHash;
    delete ret.verificationToken;
    delete ret.verificationTokenExpiry;
    delete ret.__v;
    return ret;
  },
});

// ────────────────────────────────────────────────────────────────────
// Model
// ────────────────────────────────────────────────────────────────────

export const User: Model<IUserDocument> = mongoose.model<IUserDocument>(
  'User',
  userSchema
);
