/**
 * WageGlass — Percentile computation helpers.
 */

import type { HistogramBucket, PercentileBreakpoints } from '@shared/types/index';
import { formatCompact } from './formatters';

// ─── Percentile Engine ────────────────────────────────────────────────

/**
 * Linear interpolation helper.
 * Maps value within [lo, hi] → [resultLo, resultHi].
 */
function lerp(
  value: number,
  lo: number,
  hi: number,
  resultLo: number,
  resultHi: number
): number {
  if (hi === lo) return resultLo;
  const t = (value - lo) / (hi - lo);
  return resultLo + t * (resultHi - resultLo);
}

/**
 * Compute the approximate percentile of a user's salary within the
 * known distribution via linear interpolation across percentile bands.
 *
 * Returns an integer in [0, 100].
 */
export function computePercentile(
  userSalary: number,
  percentiles: PercentileBreakpoints
): number {
  const { p10, p25, p50, p75, p90 } = percentiles;

  let result: number;

  if (userSalary < p10) {
    // Below P10 — extrapolate down toward 0
    result = lerp(userSalary, 0, p10, 0, 10);
  } else if (userSalary < p25) {
    result = lerp(userSalary, p10, p25, 10, 25);
  } else if (userSalary < p50) {
    result = lerp(userSalary, p25, p50, 25, 50);
  } else if (userSalary < p75) {
    result = lerp(userSalary, p50, p75, 50, 75);
  } else if (userSalary < p90) {
    result = lerp(userSalary, p75, p90, 75, 90);
  } else {
    // Above P90 — extrapolate toward 100 (cap the upper bound loosely)
    const upperBound = p90 * 1.5; // estimate top of range
    result = lerp(userSalary, p90, upperBound, 90, 100);
  }

  return Math.round(Math.min(100, Math.max(0, result)));
}

// ─── Histogram Helpers ────────────────────────────────────────────────

/**
 * Find which histogram bucket a salary falls in and return the formatted
 * midpoint — used to place reference lines on the X axis.
 */
export function getBucketPosition(
  salary: number,
  histogram: HistogramBucket[],
  currency = 'INR'
): string {
  const bucket = histogram.find(
    (b) => salary >= b.rangeMin && salary < b.rangeMax
  ) ?? histogram[histogram.length - 1]; // fall back to last bucket

  const midpoint = (bucket.rangeMin + bucket.rangeMax) / 2;
  return formatCompact(midpoint, currency);
}

// ─── Narrative Messages ───────────────────────────────────────────────

/**
 * Human-friendly sentence explaining where the user stands.
 */
export function getPercentileMessage(
  percentile: number,
  role: string,
  location: string
): string {
  if (percentile >= 90) {
    return `You're in the top 10% of ${role} earners in ${location}. Exceptional.`;
  }
  if (percentile >= 75) {
    return `You earn more than ${percentile}% of ${role} professionals in ${location}.`;
  }
  if (percentile >= 50) {
    return `You're above the median for ${role} in ${location}.`;
  }
  if (percentile >= 25) {
    return `You earn below the median ${role} salary in ${location}.`;
  }
  return `You're in the bottom 25% for ${role} in ${location}. Consider negotiating.`;
}

// ─── Input Validation ─────────────────────────────────────────────────

/**
 * Returns true if the string represents a valid salary (1K – 100M).
 */
export function isValidSalary(value: string): boolean {
  const n = parseInt(value.replace(/,/g, ''), 10);
  return !isNaN(n) && n >= 1_000 && n <= 100_000_000;
}
