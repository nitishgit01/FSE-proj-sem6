/**
 * WageGlass — Currency & label formatters.
 * Used by both chart components and the submission form.
 */

// ─── Currency Formatting ─────────────────────────────────────────────

/**
 * Full currency string (e.g. "₹14,00,000" or "$1,400,000").
 */
export function formatCurrency(amount: number, currency: string): string {
  if (currency === 'INR') {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Compact form with SI-style suffixes.
 *
 * INR:   ≥ 1 Cr  → "₹1.2Cr"
 *         ≥ 1 L   → "₹9L"
 *         else    → formatCurrency (full)
 *
 * Others: ≥ 1 M   → "$1.2M"
 *          ≥ 1 K   → "$90K"
 *          else    → formatCurrency (full)
 */
export function formatCompact(amount: number, currency: string): string {
  const symbol =
    currency === 'INR' ? '₹'
    : currency === 'USD' ? '$'
    : currency === 'GBP' ? '£'
    : currency === 'EUR' ? '€'
    : currency === 'AUD' ? 'A$'
    : currency === 'SGD' ? 'S$'
    : currency === 'AED' ? 'د.إ'
    : currency;

  if (currency === 'INR') {
    if (amount >= 10_000_000) {
      const val = amount / 10_000_000;
      return `${symbol}${+val.toFixed(2).replace(/\.?0+$/, '')}Cr`;
    }
    if (amount >= 100_000) {
      const val = amount / 100_000;
      return `${symbol}${+val.toFixed(1).replace(/\.?0+$/, '')}L`;
    }
    return formatCurrency(amount, currency);
  }

  // Non-INR currencies
  if (amount >= 1_000_000) {
    const val = amount / 1_000_000;
    return `${symbol}${+val.toFixed(1).replace(/\.?0+$/, '')}M`;
  }
  if (amount >= 1_000) {
    const val = amount / 1_000;
    return `${symbol}${+val.toFixed(1).replace(/\.?0+$/, '')}K`;
  }
  return formatCurrency(amount, currency);
}

// ─── Percentile Labels ────────────────────────────────────────────────

/**
 * Human-readable position label for a computed percentile score.
 */
export function getPercentileLabel(percentile: number): string {
  if (percentile >= 90) return 'top 10%';
  if (percentile >= 75) return 'top 25%';
  if (percentile > 50)  return 'above average';
  if (percentile === 50) return 'exactly average';
  if (percentile >= 25) return 'below average';
  return 'bottom 25%';
}
