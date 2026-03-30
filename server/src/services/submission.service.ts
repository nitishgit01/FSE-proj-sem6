import { Submission, ISubmissionDocument } from '../models/Submission.model';
import { User } from '../models/User.model';
import { normaliseTitle } from '../utils/normaliseTitle';
import { AppError } from '../middleware/errorHandler';
import { ApiErrorCode } from '../../../shared/types/index';
import type { SubmissionRequest } from '../../../shared/types/index';
import type { IUserDocument } from '../models/User.model';

/**
 * Create a new salary submission.
 * - Normalises job title against canonical roles
 * - Computes totalComp server-side
 * - Enforces 30-day rate limit for logged-in users
 */
export const createSubmission = async (
  data: SubmissionRequest,
  user?: IUserDocument
): Promise<ISubmissionDocument> => {
  // Enforce 30-day rate limit for logged-in users
  if (user) {
    if (user.lastSubmittedAt) {
      const daysSinceLastSubmission =
        (Date.now() - user.lastSubmittedAt.getTime()) / (1000 * 60 * 60 * 24);

      if (daysSinceLastSubmission < 30) {
        const nextEligibleDate = new Date(
          user.lastSubmittedAt.getTime() + 30 * 24 * 60 * 60 * 1000
        );
        throw new AppError(
          `You've already submitted recently. You can submit again on ${nextEligibleDate.toLocaleDateString()}.`,
          429,
          ApiErrorCode.RATE_LIMITED
        );
      }
    }
  }

  // Normalise job title
  const canonicalTitle = await normaliseTitle(data.jobTitle);

  // Compute total compensation server-side (never trust client)
  const bonus = data.bonus || 0;
  const equity = data.equity || 0;
  const totalComp = data.baseSalary + bonus + equity;

  // Create submission
  const submission = await Submission.create({
    userId: user?._id || null,
    jobTitle: canonicalTitle,
    jobTitleRaw: data.jobTitle,
    industry: data.industry,
    company: data.company || null,
    companySize: data.companySize,
    baseSalary: data.baseSalary,
    bonus,
    equity,
    totalComp,
    currency: data.currency,
    country: data.country,
    city: data.city,
    workMode: data.workMode,
    yearsExp: data.yearsExp,
    gender: data.gender || null,
    skills: [],
    verified: false,
    submittedAt: new Date(),
  });

  // Update user submission tracking
  if (user) {
    await User.findByIdAndUpdate(user._id, {
      $inc: { submissionCount: 1 },
      $set: { lastSubmittedAt: new Date() },
    });
  }

  return submission;
};
