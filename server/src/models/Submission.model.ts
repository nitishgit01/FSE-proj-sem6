import mongoose, { Schema, Document } from 'mongoose';
import type { ISubmission } from '../../../shared/types/index';

export interface ISubmissionDocument extends Omit<ISubmission, '_id'>, Document {}

const submissionSchema = new Schema<ISubmissionDocument>(
  {
    // User link (null for guest submissions)
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },

    // ── Role ───────────────────────────────────────────
    jobTitle: {
      type: String,
      required: [true, 'Job title is required'],
      trim: true,
      index: true,
    },
    jobTitleRaw: {
      type: String,
      required: true,
      trim: true,
    },
    industry: {
      type: String,
      required: true,
      enum: ['technology', 'finance', 'healthcare', 'design', 'marketing', 'education', 'legal', 'other'],
    },
    company: {
      type: String,
      trim: true,
      default: null,
    },
    companySize: {
      type: String,
      required: true,
      enum: ['startup', 'mid', 'enterprise'],
    },

    // ── Compensation ───────────────────────────────────
    baseSalary: {
      type: Number,
      required: [true, 'Base salary is required'],
      min: [1000, 'Salary must be at least 1,000'],
      max: [10_000_000, 'Salary cannot exceed 10,000,000'],
    },
    bonus: {
      type: Number,
      default: 0,
      min: 0,
    },
    equity: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalComp: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
    },

    // ── Location ───────────────────────────────────────
    country: {
      type: String,
      required: [true, 'Country is required'],
      uppercase: true,
      trim: true,
    },
    city: {
      type: String,
      required: [true, 'City is required'],
      trim: true,
    },
    workMode: {
      type: String,
      required: true,
      enum: ['remote', 'hybrid', 'onsite'],
    },

    // ── Experience ─────────────────────────────────────
    yearsExp: {
      type: Number,
      required: true,
      min: 0,
      max: 50,
    },

    // ── Optional ───────────────────────────────────────
    gender: {
      type: String,
      enum: ['man', 'woman', 'non-binary', 'prefer_not_to_say'],
      default: null,
    },
    skills: {
      type: [String],
      default: [],
    },

    // ── Metadata ───────────────────────────────────────
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

// ── Compound indexes (performance-critical) ─────────────
submissionSchema.index({ jobTitle: 1, country: 1, city: 1 });
submissionSchema.index({ jobTitle: 1, country: 1 });
submissionSchema.index({ submittedAt: -1 });
submissionSchema.index({ totalComp: 1 });
submissionSchema.index({ userId: 1 });
submissionSchema.index({ company: 1 });

// ── Pre-save: compute totalComp server-side ─────────────
submissionSchema.pre('save', function (next) {
  this.totalComp = this.baseSalary + (this.bonus || 0) + (this.equity || 0);
  next();
});

// ── JSON: strip internal fields ─────────────────────────
submissionSchema.set('toJSON', {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  transform: (_doc: any, ret: any) => {
    delete ret.__v;
    return ret;
  },
});

export const Submission = mongoose.model<ISubmissionDocument>('Submission', submissionSchema);
