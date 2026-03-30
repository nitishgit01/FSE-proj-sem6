import React from 'react';
import type { StatsResult } from '@shared/types/index';
import { formatCurrency, getPercentileLabel } from '../../lib/formatters';
import { computePercentile } from '../../lib/percentile';

interface StatCardsProps {
  stats: StatsResult;
  userSalary?: number;
  currency: string;
}

interface CardDef {
  label: string;
  value: React.ReactNode;
  sub?: string;
  highlight?: boolean;
}

export const StatCards: React.FC<StatCardsProps> = ({ stats, userSalary, currency }) => {
  const userPct = userSalary !== undefined
    ? computePercentile(userSalary, stats.percentiles)
    : undefined;

  const cards: CardDef[] = [
    {
      label: 'Median salary',
      value: formatCurrency(stats.percentiles.p50, currency),
    },
    {
      label: '75th percentile',
      value: formatCurrency(stats.percentiles.p75, currency),
    },
    {
      label: 'Submissions',
      value: stats.count.toLocaleString(),
      sub: 'anonymised responses',
    },
    {
      label: 'Your percentile',
      value: userPct !== undefined ? `${userPct}th` : '—',
      sub: userPct !== undefined ? getPercentileLabel(userPct) : 'Enter your salary below',
      highlight: userPct !== undefined,
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {cards.map((card, i) => (
        <div
          key={i}
          className={`
            rounded-xl p-4 border transition-colors
            ${card.highlight
              ? 'bg-blue-50 border-blue-200'
              : 'bg-gray-50 border-gray-200'
            }
          `}
        >
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 leading-none">
            {card.label}
          </p>
          <p className={`text-2xl font-bold tabular-nums leading-none
            ${card.highlight ? 'text-blue-700' : 'text-gray-900'}
          `}>
            {card.value}
          </p>
          {card.sub && (
            <p className={`text-xs mt-1.5 ${card.highlight ? 'text-blue-500' : 'text-gray-400'}`}>
              {card.sub}
            </p>
          )}
        </div>
      ))}
    </div>
  );
};
