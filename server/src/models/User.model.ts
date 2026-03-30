import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';
import type { IUser } from '../../../shared/types/index';

export interface IUserDocument extends Omit<IUser, '_id'>, Document {
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new Schema<IUserDocument>(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      required: [true, 'Password is required'],
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    verificationToken: {
      type: String,
      select: false, // Don't return in queries by default
    },
    verificationTokenExpiry: {
      type: Date,
      select: false,
    },
    submissionCount: {
      type: Number,
      default: 0,
    },
    lastSubmittedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true, // createdAt + updatedAt
  }
);

// ── Indexes ──────────────────────────────────────────────
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ createdAt: 1 });

// ── Pre-save: hash password ──────────────────────────────
userSchema.pre('save', async function (next) {
  if (!this.isModified('passwordHash')) return next();
  const salt = await bcrypt.genSalt(12);
  this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
  next();
});

// ── Instance method: compare password ────────────────────
userSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.passwordHash);
};

// ── JSON serialisation: strip sensitive fields ───────────
userSchema.set('toJSON', {
  transform: (_doc, ret) => {
    delete ret.passwordHash;
    delete ret.verificationToken;
    delete ret.verificationTokenExpiry;
    delete ret.__v;
    return ret;
  },
});

export const User = mongoose.model<IUserDocument>('User', userSchema);
