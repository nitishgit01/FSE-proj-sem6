import mongoose, { Schema, Model, Document } from 'mongoose';

// ────────────────────────────────────────────────────────────────────
// Document Interface
// ────────────────────────────────────────────────────────────────────

/**
 * Mongoose document type for Alert.
 *
 * We define fields inline instead of extending IAlert because the
 * `userId` field is a Mongoose ObjectId reference in the DB but a
 * plain string in the shared interface.  This avoids type conflicts
 * between Mongoose's `Schema.Types.ObjectId` and TypeScript's `string`.
 */
export interface IAlertDocument extends Document {
  /** Reference to the user who created this alert. */
  userId: mongoose.Types.ObjectId;

  /** Canonical job title to monitor. */
  jobTitle: string;

  /** ISO 3166-1 alpha-2 country code. */
  country: string;

  /** Salary threshold that triggers the alert. */
  targetSalary: number;

  /** ISO 4217 currency code (e.g. "USD"). */
  currency: string;

  /** Whether the alert has already been triggered. */
  triggered: boolean;

  /** Alert creation timestamp. */
  createdAt: Date;

  /** Last update timestamp. */
  updatedAt: Date;
}

// ────────────────────────────────────────────────────────────────────
// Schema
// ────────────────────────────────────────────────────────────────────

export const alertSchema = new Schema<IAlertDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true,
    },

    jobTitle: {
      type: String,
      required: [true, 'Job title is required'],
      trim: true,
    },

    country: {
      type: String,
      required: [true, 'Country is required'],
      uppercase: true,
      trim: true,
      minlength: 2,
      maxlength: 2,
    },

    targetSalary: {
      type: Number,
      required: [true, 'Target salary is required'],
      min: [0, 'Target salary cannot be negative'],
    },

    currency: {
      type: String,
      required: [true, 'Currency is required'],
      uppercase: true,
      trim: true,
      minlength: 3,
      maxlength: 3,
    },

    triggered: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true, // createdAt + updatedAt
  }
);

// ────────────────────────────────────────────────────────────────────
// Indexes
// ────────────────────────────────────────────────────────────────────

alertSchema.index({ userId: 1 });                           // user's alerts lookup
alertSchema.index({ jobTitle: 1, country: 1 });             // matching new submissions
alertSchema.index({ triggered: 1, jobTitle: 1, country: 1 }); // untriggered alerts scan

// ────────────────────────────────────────────────────────────────────
// JSON Transform
// ────────────────────────────────────────────────────────────────────

alertSchema.set('toJSON', {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  transform: (_doc: any, ret: any) => {
    delete ret.__v;
    return ret;
  },
});

// ────────────────────────────────────────────────────────────────────
// Model
// ────────────────────────────────────────────────────────────────────

export const Alert: Model<IAlertDocument> = mongoose.model<IAlertDocument>(
  'Alert',
  alertSchema
);
