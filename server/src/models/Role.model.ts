import mongoose, { Schema, Document } from 'mongoose';
import type { IRole } from '../../../shared/types/index';

export interface IRoleDocument extends Omit<IRole, '_id'>, Document {}

const roleSchema = new Schema<IRoleDocument>(
  {
    canonical: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    aliases: {
      type: [String],
      default: [],
    },
    category: {
      type: String,
      required: true,
      enum: ['engineering', 'design', 'product', 'data', 'marketing', 'finance', 'other'],
    },
  },
  {
    timestamps: true,
  }
);

// ── Indexes ──────────────────────────────────────────────
roleSchema.index({ canonical: 1 }, { unique: true });
roleSchema.index({ aliases: 'text', canonical: 'text' }); // Text search for autocomplete

export const Role = mongoose.model<IRoleDocument>('Role', roleSchema);
