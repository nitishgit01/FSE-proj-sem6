import mongoose, { Schema, Model, Document } from 'mongoose';
import type { ISubmission } from '../../../shared/types/index';

// ────────────────────────────────────────────────────────────────────
// Document Interface
// ────────────────────────────────────────────────────────────────────

/**
 * Mongoose document type for Submission.
 * Extends ISubmission (shared) with Mongoose Document internals.
 */
export interface ISubmissionDocument extends Omit<ISubmission, '_id'>, Document {}

// ────────────────────────────────────────────────────────────────────
// Schema
// ────────────────────────────────────────────────────────────────────

export const submissionSchema = new Schema<ISubmissionDocument>(
  {
    // ── User Link ─────────────────────────────────────────────────
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null, // null for guest (anonymous) submissions
    },

    // ── Role ──────────────────────────────────────────────────────
    jobTitle: {
      type: String,
      required: [true, 'Job title is required'],
      trim: true,
      index: true,
    },

    jobTitleRaw: {
      type: String,
      required: [true, 'Raw job title is required'],
      trim: true,
    },

    industry: {
      type: String,
      required: [true, 'Industry is required'],
      enum: {
        values: ['technology', 'finance', 'healthcare', 'design', 'marketing', 'education', 'legal', 'other'],
        message: '{VALUE} is not a supported industry',
      },
    },

    company: {
      type: String,
      trim: true,
      default: null,
    },

    companySize: {
      type: String,
      required: [true, 'Company size is required'],
      enum: {
        values: ['startup', 'mid', 'enterprise'],
        message: '{VALUE} is not a supported company size',
      },
    },

    // ── Compensation ──────────────────────────────────────────────
    baseSalary: {
      type: Number,
      required: [true, 'Base salary is required'],
      min: [1000, 'Salary must be at least 1,000'],
      max: [10_000_000, 'Salary cannot exceed 10,000,000'],
    },

    bonus: {
      type: Number,
      default: 0,
      min: [0, 'Bonus cannot be negative'],
    },

    equity: {
      type: Number,
      default: 0,
      min: [0, 'Equity cannot be negative'],
    },

    totalComp: {
      type: Number,
      required: [true, 'Total compensation is required'],
      // Computed in the controller as baseSalary + bonus + equity
    },

    currency: {
      type: String,
      required: [true, 'Currency is required'],
      uppercase: true,
      trim: true,
      minlength: 3,
      maxlength: 3, // ISO 4217
    },

    // ── Location ──────────────────────────────────────────────────
    country: {
      type: String,
      required: [true, 'Country is required'],
      uppercase: true,
      trim: true,
      minlength: 2,
      maxlength: 2, // ISO 3166-1 alpha-2
    },

    city: {
      type: String,
      required: [true, 'City is required'],
      trim: true,
    },

    workMode: {
      type: String,
      required: [true, 'Work mode is required'],
      enum: {
        values: ['remote', 'hybrid', 'onsite'],
        message: '{VALUE} is not a supported work mode',
      },
    },

    // ── Experience ────────────────────────────────────────────────
    yearsExp: {
      type: Number,
      required: [true, 'Years of experience is required'],
      min: [0, 'Experience cannot be negative'],
      max: [50, 'Experience cannot exceed 50 years'],
    },

    // ── Optional ──────────────────────────────────────────────────
    gender: {
      type: String,
      enum: {
        values: ['man', 'woman', 'non-binary', 'prefer_not_to_say'],
        message: '{VALUE} is not a supported gender option',
      },
      default: null,
    },

    skills: {
      type: [String],
      default: [],
    },

    // ── Metadata ──────────────────────────────────────────────────
    verified: {
      type: Boolean,
      default: false,
    },

    submittedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// ────────────────────────────────────────────────────────────────────
// Compound Indexes (performance-critical for aggregation queries)
// ────────────────────────────────────────────────────────────────────

submissionSchema.index({ jobTitle: 1, country: 1, city: 1 }); // most critical — stats API
submissionSchema.index({ jobTitle: 1, country: 1 });           // stats API without city
submissionSchema.index({ submittedAt: -1 });                   // recent submissions sort
submissionSchema.index({ totalComp: 1 });                      // histogram bucketing
submissionSchema.index({ userId: 1 });                         // user's own submissions

// ────────────────────────────────────────────────────────────────────
// Pre-save Hook — auto-update updatedAt on every save
// ────────────────────────────────────────────────────────────────────

submissionSchema.pre('save', function (next) {
  // Mongoose timestamps handles this, but this hook is here as a
  // safety net and to demonstrate the pattern per project requirements.
  if (this.isNew) {
    this.submittedAt = this.submittedAt || new Date();
  }
  next();
});

// ────────────────────────────────────────────────────────────────────
// JSON Transform — strip Mongoose internal fields
// ────────────────────────────────────────────────────────────────────

submissionSchema.set('toJSON', {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  transform: (_doc: any, ret: any) => {
    delete ret.__v;
    return ret;
  },
});

// ────────────────────────────────────────────────────────────────────
// Model
// ────────────────────────────────────────────────────────────────────

export const Submission: Model<ISubmissionDocument> = mongoose.model<ISubmissionDocument>(
  'Submission',
  submissionSchema
);
