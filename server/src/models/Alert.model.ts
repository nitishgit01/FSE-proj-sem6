import mongoose, { Schema, Document } from 'mongoose';
import type { IAlert } from '../../../shared/types/index';

export interface IAlertDocument extends Omit<IAlert, '_id'>, Document {}

const alertSchema = new Schema<IAlertDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    jobTitle: {
      type: String,
      required: true,
      trim: true,
    },
    country: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
    },
    targetSalary: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
    },
    triggered: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// ── Indexes ──────────────────────────────────────────────
alertSchema.index({ userId: 1 });
alertSchema.index({ jobTitle: 1, country: 1 });

export const Alert = mongoose.model<IAlertDocument>('Alert', alertSchema);
