import React, { useState, useCallback, useId } from 'react';
import type { PercentileBreakpoints } from '@shared/types/index';
import { computePercentile } from '../../lib/percentile';
import { getPercentileMessage } from '../../lib/percentile';
import { getPercentileLabel } from '../../lib/formatters';
import { isValidSalary } from '../../lib/percentile';

// ─── Types ─────────────────────────────────────────────────────────────

interface WhereDoIStandWidgetProps {
  percentiles: PercentileBreakpoints;
  currency: string;
  role: string;
  location: string;
  onSalaryChange: (salary: number | undefined) => void;
}

// ─── Currency symbol lookup ────────────────────────────────────────────

const CURRENCY_SYMBOLS: Record<string, string> = {
  INR: '₹', USD: '$', GBP: '£', EUR: '€',
  AUD: 'A$', SGD: 'S$', AED: 'د.إ',
};

// ─── Percentile colour ─────────────────────────────────────────────────

function percentileColor(p: number): string {
  if (p >= 75) return 'text-green-600';
  if (p >= 50) return 'text-blue-600';
  if (p >= 25) return 'text-gray-700';
  return 'text-orange-600';
}

function progressColor(p: number): string {
  if (p >= 75) return 'bg-green-500';
  if (p >= 50) return 'bg-blue-600';
  if (p >= 25) return 'bg-gray-500';
  return 'bg-orange-500';
}

// ─── Percentile marker labels on the track ────────────────────────────

const TRACK_MARKERS = [
  { pct: 10,  label: 'P10' },
  { pct: 25,  label: 'P25' },
  { pct: 50,  label: 'Mid' },
  { pct: 75,  label: 'P75' },
  { pct: 90,  label: 'P90' },
];

// ─── Component ─────────────────────────────────────────────────────────

export const WhereDoIStandWidget: React.FC<WhereDoIStandWidgetProps> = ({
  percentiles,
  currency,
  role,
  location,
  onSalaryChange,
}) => {
  const inputId = useId();
  const [inputValue, setInputValue]         = useState('');
  const [displayPercentile, setDisplayPercentile] = useState<number | null>(null);

  const currencySymbol = CURRENCY_SYMBOLS[currency] ?? currency;
  const placeholder =
    currency === 'INR' ? '12,00,000' : '120,000';

  // ── Input handler ──────────────────────────────────────────────────────
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value.replace(/[^0-9]/g, '');

      // Format for display
      const formatted = raw ? Number(raw).toLocaleString() : '';
      setInputValue(formatted);

      if (raw && isValidSalary(raw)) {
        const salary  = parseInt(raw, 10);
        const pct     = computePercentile(salary, percentiles);
        setDisplayPercentile(pct);
        onSalaryChange(salary);
      } else {
        setDisplayPercentile(null);
        onSalaryChange(undefined);
      }
    },
    [percentiles, onSalaryChange]
  );

  // ── Ordinal suffix ─────────────────────────────────────────────────────
  const ordinal = (n: number): string => {
    const s = ['th', 'st', 'nd', 'rd'];
    const v = n % 100;
    return n + (s[(v - 20) % 10] ?? s[v] ?? s[0]);
  };

  const hasResult = displayPercentile !== null;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-6 py-6">
      {/* ── Heading ──────────────────────────────────────────────────── */}
      <div className="mb-5">
        <h2 className="text-base font-semibold text-gray-900 leading-snug">
          Where do I stand?
        </h2>
        <p className="text-sm text-gray-500 mt-0.5">
          Enter your current salary to see your position
        </p>
      </div>

      {/* ── Input ────────────────────────────────────────────────────── */}
      <div className="relative max-w-xs">
        {/* Currency symbol */}
        <span
          aria-hidden="true"
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-medium text-sm select-none"
        >
          {currencySymbol}
        </span>

        <input
          id={inputId}
          type="text"
          inputMode="numeric"
          value={inputValue}
          onChange={handleChange}
          placeholder={placeholder}
          aria-label={`Enter your ${currency} annual salary`}
          className={`
            w-full pl-8 pr-4 py-2.5 border rounded-xl text-sm outline-none
            transition-all duration-200 placeholder-gray-300 text-gray-900 font-medium
            ${hasResult
              ? 'border-blue-300 ring-2 ring-blue-100'
              : 'border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100'
            }
          `}
        />
      </div>

      {/* ── Result panel ─────────────────────────────────────────────── */}
      {hasResult && displayPercentile !== null && (
        <div className="mt-5 space-y-3">
          {/* Percentile number + label */}
          <div className="flex items-baseline gap-3 flex-wrap">
            <span className={`text-4xl font-bold tabular-nums leading-none ${percentileColor(displayPercentile)}`}>
              {ordinal(displayPercentile)}
            </span>
            <span className="text-sm font-semibold text-gray-500">
              percentile · {getPercentileLabel(displayPercentile)}
            </span>
          </div>

          {/* Narrative message */}
          <p className="text-sm text-gray-600 leading-relaxed">
            {getPercentileMessage(displayPercentile, role, location)}
          </p>

          {/* ── Progress track ──────────────────────────────────────── */}
          <div className="pt-1">
            {/* Marker labels */}
            <div className="relative h-4 mb-1">
              {TRACK_MARKERS.map(({ pct, label }) => (
                <span
                  key={pct}
                  className="absolute -translate-x-1/2 text-[10px] text-gray-400 font-medium"
                  style={{ left: `${pct}%` }}
                >
                  {label}
                </span>
              ))}
            </div>

            {/* Track */}
            <div className="relative h-2 bg-gray-100 rounded-full overflow-hidden">
              {/* Fill */}
              <div
                className={`h-full rounded-full transition-all duration-500 ${progressColor(displayPercentile)}`}
                style={{ width: `${displayPercentile}%`, minWidth: '4px' }}
                role="progressbar"
                aria-valuenow={displayPercentile}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`${displayPercentile}th percentile`}
              />

              {/* Thumb dot */}
              <div
                className={`
                  absolute top-1/2 -translate-y-1/2 -translate-x-1/2
                  w-3.5 h-3.5 rounded-full border-2 border-white shadow-md
                  transition-all duration-500
                  ${displayPercentile >= 75 ? 'bg-green-500'
                    : displayPercentile >= 50 ? 'bg-blue-600'
                    : displayPercentile >= 25 ? 'bg-gray-500'
                    : 'bg-orange-500'}
                `}
                style={{ left: `${Math.max(2, Math.min(98, displayPercentile))}%` }}
              />
            </div>

            {/* Floor / ceiling labels */}
            <div className="flex justify-between mt-1 text-[10px] text-gray-300">
              <span>Bottom</span>
              <span>Top</span>
            </div>
          </div>

          {/* ── Nudge card ───────────────────────────────────────────── */}
          {displayPercentile < 40 && (
            <div className="mt-2 bg-orange-50 border border-orange-100 rounded-xl px-4 py-3 flex items-start gap-3">
              <span className="text-orange-400 text-lg leading-none mt-0.5">💡</span>
              <p className="text-xs text-orange-700 leading-relaxed">
                Most <strong>{role}</strong> professionals in {location} earn more.
                Check the distribution above and consider benchmarking your next salary negotiation.
              </p>
            </div>
          )}

          {displayPercentile >= 75 && (
            <div className="mt-2 bg-green-50 border border-green-100 rounded-xl px-4 py-3 flex items-start gap-3">
              <span className="text-green-500 text-lg leading-none mt-0.5">🏆</span>
              <p className="text-xs text-green-700 leading-relaxed">
                You're earning well above most <strong>{role}</strong> professionals in {location}.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default WhereDoIStandWidget;
