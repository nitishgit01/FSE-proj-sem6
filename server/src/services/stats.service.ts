import { Submission } from '../models/Submission.model';
import { checkAnonymisationThreshold } from '../middleware/anonGuard';
import type { StatsQuery, StatsResult, HistogramBucket } from '../../../shared/types/index';

/**
 * Get aggregated salary statistics for a given filter combination.
 * Enforces N≥5 anonymisation guard.
 * Uses MongoDB aggregation pipeline for server-side computation.
 */
export const getStats = async (filters: StatsQuery): Promise<StatsResult> => {
  // ── Step 1: Check anonymisation threshold ───────────
  const { passes, count } = await checkAnonymisationThreshold(filters);

  if (!passes) {
    return {
      count,
      insufficient: true,
      percentiles: { p10: 0, p25: 0, p50: 0, p75: 0, p90: 0 },
      histogram: [],
      currency: '',
    };
  }

  // ── Step 2: Build match stage ───────────────────────
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

  // ── Step 3: Run aggregation pipeline ────────────────
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pipeline: any[] = [
    { $match: matchStage },
    {
      $facet: {
        count: [{ $count: 'total' }],
        percentiles: [
          {
            $group: {
              _id: null,
              p10: { $percentile: { input: '$totalComp', p: [0.1], method: 'approximate' } },
              p25: { $percentile: { input: '$totalComp', p: [0.25], method: 'approximate' } },
              p50: { $percentile: { input: '$totalComp', p: [0.5], method: 'approximate' } },
              p75: { $percentile: { input: '$totalComp', p: [0.75], method: 'approximate' } },
              p90: { $percentile: { input: '$totalComp', p: [0.9], method: 'approximate' } },
              minSalary: { $min: '$totalComp' },
              maxSalary: { $max: '$totalComp' },
            },
          },
        ],
        currency: [
          { $group: { _id: '$currency', count: { $sum: 1 } } },
          { $sort: { count: -1 } },
          { $limit: 1 },
        ],
      },
    },
  ];

  const [result] = await Submission.aggregate(pipeline);

  const totalCount = result.count[0]?.total || 0;
  const percentilesData = result.percentiles[0];
  const currency = result.currency[0]?._id || 'USD';

  if (!percentilesData) {
    return {
      count: totalCount,
      insufficient: true,
      percentiles: { p10: 0, p25: 0, p50: 0, p75: 0, p90: 0 },
      histogram: [],
      currency,
    };
  }

  // ── Step 4: Build histogram buckets ─────────────────
  const minSalary = percentilesData.minSalary;
  const maxSalary = percentilesData.maxSalary;
  const bucketCount = 10;
  const bucketWidth = Math.ceil((maxSalary - minSalary) / bucketCount);

  const histogram: HistogramBucket[] = [];

  if (bucketWidth > 0) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const histogramPipeline: any[] = [
      { $match: matchStage },
      {
        $bucket: {
          groupBy: '$totalComp',
          boundaries: Array.from(
            { length: bucketCount + 1 },
            (_, i) => minSalary + i * bucketWidth
          ),
          default: 'overflow',
          output: { count: { $sum: 1 } },
        },
      },
    ];

    const histogramResult = await Submission.aggregate(histogramPipeline);

    for (let i = 0; i < bucketCount; i++) {
      const rangeMin = minSalary + i * bucketWidth;
      const rangeMax = rangeMin + bucketWidth;
      const bucket = histogramResult.find(
        (b: Record<string, unknown>) => b._id === rangeMin
      );

      histogram.push({
        rangeMin,
        rangeMax,
        count: bucket ? (bucket.count as number) : 0,
      });
    }

    // Add any overflow bucket entries to the last bucket
    const overflowBucket = histogramResult.find(
      (b: Record<string, unknown>) => b._id === 'overflow'
    );
    if (overflowBucket && histogram.length > 0) {
      histogram[histogram.length - 1].count += overflowBucket.count as number;
    }
  }

  return {
    count: totalCount,
    insufficient: false,
    percentiles: {
      p10: percentilesData.p10[0],
      p25: percentilesData.p25[0],
      p50: percentilesData.p50[0],
      p75: percentilesData.p75[0],
      p90: percentilesData.p90[0],
    },
    histogram,
    currency,
  };
};
