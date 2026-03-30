import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import type { StatsResult, FilterParams } from '@shared/types/index';
import { StatCards } from './StatCards';
import { DistributionChart } from './DistributionChart';
import { WhereDoIStandWidget } from './WhereDoIStandWidget';

// ─── Mock data for development ─────────────────────────────────────────

export const MOCK_STATS: StatsResult = {
  count: 47,
  insufficient: false,
  percentiles: { p10: 600_000, p25: 900_000, p50: 1_400_000, p75: 1_900_000, p90: 2_600_000 },
  histogram: [
    { rangeMin: 400_000,   rangeMax: 700_000,   count: 5  },
    { rangeMin: 700_000,   rangeMax: 1_000_000, count: 9  },
    { rangeMin: 1_000_000, rangeMax: 1_300_000, count: 12 },
    { rangeMin: 1_300_000, rangeMax: 1_600_000, count: 10 },
    { rangeMin: 1_600_000, rangeMax: 1_900_000, count: 6  },
    { rangeMin: 1_900_000, rangeMax: 2_200_000, count: 3  },
    { rangeMin: 2_200_000, rangeMax: 2_500_000, count: 2  },
  ],
  currency: 'INR',
};

// ─── Props ─────────────────────────────────────────────────────────────

interface ChartContainerProps {
  stats: StatsResult | null;
  isLoading: boolean;
  filters: FilterParams;
}

// ─── Skeleton ──────────────────────────────────────────────────────────

const ChartSkeleton: React.FC = () => {
  const barHeights = [40, 60, 85, 100, 75, 45, 20];

  return (
    <div className="flex flex-col gap-5 animate-pulse">
      {/* Stat card skeletons */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="rounded-xl p-4 bg-gray-100 h-20" />
        ))}
      </div>

      {/* Chart skeleton */}
      <div className="rounded-2xl bg-gray-50 border border-gray-100 p-6">
        {/* Title skeleton */}
        <div className="h-4 w-64 bg-gray-200 rounded mb-6" />

        {/* Bars */}
        <div className="flex items-end gap-2 h-44 px-4">
          {barHeights.map((h, i) => (
            <div
              key={i}
              className="flex-1 rounded-t-md bg-gray-200"
              style={{ height: `${h}%` }}
            />
          ))}
        </div>

        {/* X-axis skeleton */}
        <div className="flex gap-2 mt-3 px-4">
          {barHeights.map((_, i) => (
            <div key={i} className="flex-1 h-3 bg-gray-100 rounded" />
          ))}
        </div>
      </div>
    </div>
  );
};

// ─── Empty filters state ───────────────────────────────────────────────

const EmptyFiltersState: React.FC = () => (
  <div className="flex flex-col items-center justify-center py-20 text-center">
    {/* Chart outline illustration */}
    <svg
      className="w-20 h-20 text-gray-200 mb-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      viewBox="0 0 80 80"
    >
      {/* Frame */}
      <rect x="4" y="4" width="72" height="60" rx="6" strokeDasharray="4 3" />
      {/* Bars */}
      <rect x="14" y="44" width="8" height="12" rx="2" fill="currentColor" opacity="0.3" />
      <rect x="28" y="32" width="8" height="24" rx="2" fill="currentColor" opacity="0.3" />
      <rect x="42" y="20" width="8" height="36" rx="2" fill="currentColor" opacity="0.3" />
      <rect x="56" y="36" width="8" height="20" rx="2" fill="currentColor" opacity="0.3" />
      {/* X-axis */}
      <line x1="10" y1="56" x2="70" y2="56" strokeWidth="1" />
    </svg>

    <h3 className="text-lg font-bold text-gray-700 mb-2">
      Select a role to explore salary data
    </h3>
    <p className="text-sm text-gray-400 max-w-xs leading-relaxed">
      Use the filters above to choose a job title and see how salaries compare
      across experience, location, and company size.
    </p>
  </div>
);

// ─── Insufficient data state ───────────────────────────────────────────

interface InsufficientDataStateProps {
  count: number;
  filters: FilterParams;
}

const InsufficientDataState: React.FC<InsufficientDataStateProps> = ({ count, filters }) => (
  <div className="flex flex-col items-center justify-center py-20 text-center">
    {/* People group SVG */}
    <svg
      className="w-20 h-20 text-blue-200 mb-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      viewBox="0 0 80 80"
    >
      {/* Person 1 */}
      <circle cx="22" cy="22" r="7" />
      <path d="M8 50c0-7.732 6.268-14 14-14h0c7.732 0 14 6.268 14 14" />
      {/* Person 2 */}
      <circle cx="58" cy="22" r="7" />
      <path d="M44 50c0-7.732 6.268-14 14-14h0c7.732 0 14 6.268 14 14" />
      {/* Person 3 (center, slightly lower) */}
      <circle cx="40" cy="28" r="7" />
      <path d="M26 58c0-7.732 6.268-14 14-14h0c7.732 0 14 6.268 14 14" />
    </svg>

    <div className="inline-flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-full px-3 py-1 mb-4">
      <span className="w-2 h-2 rounded-full bg-amber-400 flex-shrink-0" />
      <span className="text-xs font-semibold text-amber-700">
        {count} submission{count !== 1 ? 's' : ''} so far
      </span>
    </div>

    <h3 className="text-lg font-bold text-gray-700 mb-2">Not enough data yet</h3>
    <p className="text-sm text-gray-400 max-w-xs leading-relaxed mb-6">
      We need at least 5 anonymised submissions for{' '}
      <strong className="text-gray-600">{filters.jobTitle}</strong> before showing
      results to protect everyone's privacy.
    </p>

    <Link
      to="/submit"
      className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white
        text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors"
    >
      Be the first to submit →
    </Link>
  </div>
);

// ─── Container ────────────────────────────────────────────────────────

export const ChartContainer: React.FC<ChartContainerProps> = ({
  stats,
  isLoading,
  filters,
}) => {
  const [userSalary, setUserSalary] = useState<number | undefined>();

  const currency = stats?.currency ?? 'INR';
  const role     = filters.jobTitle  ?? 'This role';
  const location = filters.country   ?? filters.city ?? 'your region';

  // ── State machine ────────────────────────────────────────────────────

  if (isLoading) {
    return <ChartSkeleton />;
  }

  if (!filters.jobTitle) {
    return <EmptyFiltersState />;
  }

  if (!stats) {
    return <EmptyFiltersState />;
  }

  if (stats.insufficient) {
    return <InsufficientDataState count={stats.count} filters={filters} />;
  }

  // ── Populated chart ───────────────────────────────────────────────────

  return (
    <div className="flex flex-col gap-5">
      <StatCards stats={stats} userSalary={userSalary} currency={currency} />

      <WhereDoIStandWidget
        percentiles={stats.percentiles}
        currency={currency}
        role={role}
        location={location}
        onSalaryChange={setUserSalary}
      />

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <DistributionChart
          stats={stats}
          userSalary={userSalary}
          currency={currency}
          role={role}
          location={location}
        />
      </div>
    </div>
  );
};

export default ChartContainer;
