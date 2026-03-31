/**
 * stats.service.ts — WageGlass Salary Aggregation Pipeline
 *
 * Architecture:
 *   • Single MongoDB round-trip via $facet — no separate countDocuments call.
 *   • All filter strings sanitised before entering the pipeline.
 *   • $percentile (MongoDB 7.0+) with $bucketAuto histogram, both in one $facet.
 *   • Falls back gracefully when data is insufficient (< 5 submissions).
 *
 * ─── EXPLAIN PREDICTION ──────────────────────────────────────────────────────
 *
 *   With jobTitle + country + city (most common case):
 *     IXSCAN { jobTitle:1, country:1, city:1 }  ← compound index hit
 *     fetchedKeys << totalDocs  →  very fast
 *
 *   With jobTitle + country (no city):
 *     IXSCAN { jobTitle:1, country:1 }  ← second compound index hit
 *
 *   With jobTitle only:
 *     IXSCAN { jobTitle:1 }  ← single-field index on jobTitle
 *
 *   The aggregation stage operates on the IXSCAN result set, not the full
 *   collection. $facet then runs meta + histogram in a single pipeline pass
 *   over the filtered documents — zero extra reads.
 *
 * ─── FALLBACK FOR MONGODB < 7.0 (no $percentile operator) ───────────────────
 *
 *   Replace the $group inside the "meta" facet with:
 *
 *   {
 *     $group: {
 *       _id: null,
 *       count:    { $sum: 1 },
 *       currency: { $first: '$currency' },
 *       // Collect all values, sort client-side or use $push + $arrayElemAt
 *       allValues: { $push: '$totalComp' },
 *     }
 *   },
 *   // Then in a $project stage:
 *   {
 *     $project: {
 *       count: 1,
 *       currency: 1,
 *       // First sort allValues in the pipeline (requires $setWindowFields or
 *       // client-side sort), then extract positions:
 *       // p10: { $arrayElemAt: ['$sorted', { $floor: { $multiply: [0.10, '$count'] } }] }
 *       // ... repeat for p25, p50, p75, p90
 *     }
 *   }
 *
 *   WARNING: $push collects ALL matching totalComp values into memory.
 *   For large datasets (> 10K docs) this causes OOM. Use $percentile if on
 *   MongoDB Atlas (7.0+) or self-hosted MongoDB 7.0+.
 *   For older MongoDB: pre-sort and store a running rank field on each doc,
 *   or use a client-side sampling approach.
 *
 * ─── ATLAS PLAYGROUND QUERY ──────────────────────────────────────────────────
 *
 *   Paste into Atlas → Collections → submissions → Aggregation tab:
 *
 *   [
 *     {
 *       $match: {
 *         jobTitle: "Software Engineer",
 *         country: "IN",
 *         // city: { $regex: "bang", $options: "i" },
 *         // workMode: "remote",
 *         // companySize: "startup",
 *         // yearsExp: { $gte: 3, $lte: 7 },
 *       }
 *     },
 *     {
 *       $facet: {
 *         meta: [
 *           {
 *             $group: {
 *               _id: null,
 *               count:    { $sum: 1 },
 *               p10:      { $percentile: { input: "$totalComp", p: [0.10], method: "approximate" } },
 *               p25:      { $percentile: { input: "$totalComp", p: [0.25], method: "approximate" } },
 *               p50:      { $percentile: { input: "$totalComp", p: [0.50], method: "approximate" } },
 *               p75:      { $percentile: { input: "$totalComp", p: [0.75], method: "approximate" } },
 *               p90:      { $percentile: { input: "$totalComp", p: [0.90], method: "approximate" } },
 *               currency: { $first: "$currency" },
 *             }
 *           }
 *         ],
 *         histogram: [
 *           {
 *             $bucketAuto: {
 *               groupBy: "$totalComp",
 *               buckets: 10,
 *               output: { count: { $sum: 1 } }
 *             }
 *           }
 *         ]
 *       }
 *     }
 *   ]
 *
 *   Expected shape of meta[0]:
 *   {
 *     _id: null, count: 47,
 *     p10: [600000], p25: [900000], p50: [1400000], p75: [1900000], p90: [2600000],
 *     currency: "INR"
 *   }
 *   Note: $percentile returns arrays — extract [0] in the transform step.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { PipelineStage } from 'mongoose';
import { Submission } from '../models/Submission.model';
import { buildMatchStage } from '../utils/matchBuilder';
import type { FilterParams, StatsResult, HistogramBucket, PercentileBreakpoints } from '../../../shared/types/index';

// ─── Facet result types ────────────────────────────────────────────────────────

/** Raw shape returned by MongoDB $percentile — always an array. */
interface RawMeta {
  _id:      null;
  count:    number;
  p10:      number[];
  p25:      number[];
  p50:      number[];
  p75:      number[];
  p90:      number[];
  currency: string;
}

/** Raw histogram bucket from $bucketAuto. */
interface RawBucket {
  _id:   { min: number; max: number };
  count: number;
}

interface FacetResult {
  meta:      RawMeta[];
  histogram: RawBucket[];
}

// ─── Insufficient sentinel ────────────────────────────────────────────────────

const INSUFFICIENT = (_count: number, currency: string): StatsResult => ({
  count:        0,     // F4 fix: never expose exact sub-threshold count
  insufficient: true,
  percentiles:  { p10: 0, p25: 0, p50: 0, p75: 0, p90: 0 },
  histogram:    [],
  currency,
});

// ─── Main service function ────────────────────────────────────────────────────

/**
 * Compute aggregated salary statistics for a given filter combination.
 *
 * Uses a single MongoDB aggregation with $facet to compute:
 *   • count, percentiles (p10/p25/p50/p75/p90), dominant currency  ← "meta" facet
 *   • 10-bucket salary histogram                                    ← "histogram" facet
 *
 * The anonymisation guard (N ≥ 5) is enforced inside this function
 * from the count returned by the meta facet — no extra DB round-trip.
 *
 * @param filters  Validated FilterParams from the request query.
 * @returns        StatsResult ready for JSON serialisation.
 */
export const getStats = async (filters: FilterParams): Promise<StatsResult> => {
  const matchStage = buildMatchStage(filters);

  /**
   * The $percentile accumulator landed in MongoDB 7.0 (Atlas default since 2024).
   * Mongoose's PipelineStage types lag behind — cast the $group stage through
   * unknown so the type checker is satisfied without losing type safety elsewhere.
   */
  const percentileGroup = {
    $group: {
      _id:      null,
      count:    { $sum: 1 },
      p10:      { $percentile: { input: '$totalComp', p: [0.10], method: 'approximate' } },
      p25:      { $percentile: { input: '$totalComp', p: [0.25], method: 'approximate' } },
      p50:      { $percentile: { input: '$totalComp', p: [0.50], method: 'approximate' } },
      p75:      { $percentile: { input: '$totalComp', p: [0.75], method: 'approximate' } },
      p90:      { $percentile: { input: '$totalComp', p: [0.90], method: 'approximate' } },
      currency: { $first: '$currency' },
    },
  } as unknown as PipelineStage.Group;

  const pipeline: PipelineStage[] = [
    // ── Stage 1: Filter ────────────────────────────────────────────
    { $match: matchStage },

    // ── Stage 2: Compute everything in one pass ────────────────────
    {
      $facet: {
        /**
         * meta: count + all five percentiles + dominant currency.
         * $percentile (MongoDB 7.0+, Atlas) returns arrays → extract [0] later.
         */
        meta: [
          percentileGroup,
        ],

        /**
         * histogram: auto-bucket totalComp into 10 equal-population buckets.
         * $bucketAuto calculates optimal boundaries — no min/max pre-scan needed.
         * Each _id.min / _id.max maps to rangeMin / rangeMax in HistogramBucket.
         */
        histogram: [
          {
            $bucketAuto: {
              groupBy: '$totalComp',
              buckets: 10,
              output:  { count: { $sum: 1 } },
            },
          },
        ],
      },
    },
  ];

  // ── Stage 3: Execute and transform ──────────────────────────────────────────

  const [raw] = await Submission.aggregate<FacetResult>(pipeline);

  // $facet always returns one document, even if the $match finds nothing.
  // When empty: meta = [], histogram = [].
  const meta = raw?.meta?.[0] as RawMeta | undefined;

  if (!meta || meta.count === 0) {
    return INSUFFICIENT(0, '');
  }

  const { count, currency } = meta;

  // Anonymisation guard — do NOT reveal data for tiny cohorts
  if (count < 5) {
    return INSUFFICIENT(count, currency ?? '');
  }

  // ── Percentile extraction ─────────────────────────────────────────
  // $percentile returns arrays of length matching the `p` input array.
  // Index [0] = the single percentile value we requested per stat.
  const percentiles: PercentileBreakpoints = {
    p10: meta.p10?.[0] ?? 0,
    p25: meta.p25?.[0] ?? 0,
    p50: meta.p50?.[0] ?? 0,
    p75: meta.p75?.[0] ?? 0,
    p90: meta.p90?.[0] ?? 0,
  };

  // ── Histogram mapping ─────────────────────────────────────────────
  // $bucketAuto _id: { min, max } → HistogramBucket { rangeMin, rangeMax, count }
  // The last bucket's max is inclusive (MongoDB convention).
  const histogram: HistogramBucket[] = (raw.histogram ?? []).map(
    (bucket: RawBucket): HistogramBucket => ({
      rangeMin: bucket._id.min,
      rangeMax: bucket._id.max,
      count:    bucket.count,
    })
  );

  return {
    count,
    insufficient: false,
    percentiles,
    histogram,
    currency: currency ?? 'USD',
  };
};

// ─── Landing page counter ─────────────────────────────────────────────────────

/**
 * Total number of salary submissions in the database.
 * Used by the landing page hero counter ("X salaries shared").
 * countDocuments({}) is O(1) from the collection metadata on MongoDB Atlas.
 */
export const getSubmissionCount = (): Promise<number> =>
  Submission.countDocuments({});
