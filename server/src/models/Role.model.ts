import mongoose, { Schema, Model, Document } from 'mongoose';
import type { IRole } from '../../../shared/types/index';

// ────────────────────────────────────────────────────────────────────
// Document Interface
// ────────────────────────────────────────────────────────────────────

/**
 * Mongoose document type for Role.
 * Extends IRole (shared) with Mongoose Document internals.
 */
export interface IRoleDocument extends Omit<IRole, '_id'>, Document {}

// ────────────────────────────────────────────────────────────────────
// Schema
// ────────────────────────────────────────────────────────────────────

export const roleSchema = new Schema<IRoleDocument>(
  {
    canonical: {
      type: String,
      required: [true, 'Canonical title is required'],
      unique: true,
      trim: true,
    },

    aliases: {
      type: [String],
      default: [],
      // Each alias is trimmed on insert; de-duplication is the
      // responsibility of the seed script / admin UI.
    },

    category: {
      type: String,
      required: [true, 'Role category is required'],
      enum: {
        values: [
          'engineering', 'design', 'product', 'data',
          'marketing', 'finance', 'other',
        ],
        message: '{VALUE} is not a supported role category',
      },
    },
  },
  {
    timestamps: true, // createdAt + updatedAt
  }
);

// ────────────────────────────────────────────────────────────────────
// Text Index — enables autocomplete search across title + aliases
// ────────────────────────────────────────────────────────────────────

/**
 * Full-text index on canonical and aliases.
 *
 * Supports queries like:
 *   Role.find({ $text: { $search: "software engineer" } })
 *
 * The controller also uses regex fallback for prefix matching
 * (e.g. "softw" → "Software Engineer").
 */
roleSchema.index(
  { canonical: 'text', aliases: 'text' },
  {
    name: 'role_text_search',
    weights: { canonical: 10, aliases: 5 }, // canonical matches ranked higher
  }
);

// Also add a regular index on canonical for exact lookups
roleSchema.index({ canonical: 1 }, { unique: true });

// ────────────────────────────────────────────────────────────────────
// JSON Transform
// ────────────────────────────────────────────────────────────────────

roleSchema.set('toJSON', {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  transform: (_doc: any, ret: any) => {
    delete ret.__v;
    return ret;
  },
});

// ────────────────────────────────────────────────────────────────────
// Model
// ────────────────────────────────────────────────────────────────────

export const Role: Model<IRoleDocument> = mongoose.model<IRoleDocument>(
  'Role',
  roleSchema
);
