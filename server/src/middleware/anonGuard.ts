import { Submission } from '../models/Submission.model';
import type { StatsQuery } from '../../../shared/types/index';

/**
 * Check if a stats query filter combination has at least N submissions.
 * Used by the stats service to enforce the anonymisation guard.
 */
export const checkAnonymisationThreshold = async (
  filters: StatsQuery,
  minCount: number = 5
): Promise<{ passes: boolean; count: number }> => {
  const matchStage: Record<string, unknown> = {
    jobTitle: filters.jobTitle,
  };

  if (filters.country) matchStage.country = filters.country;
  if (filters.city) matchStage.city = { $regex: filters.city, $options: 'i' };
  if (filters.workMode) matchStage.workMode = filters.workMode;
  if (filters.companySize) matchStage.companySize = filters.companySize;
  if (filters.expMin !== undefined && filters.expMax !== undefined) {
    matchStage.yearsExp = { $gte: filters.expMin, $lte: filters.expMax };
  }

  const count = await Submission.countDocuments(matchStage);

  return {
    passes: count >= minCount,
    count,
  };
};
