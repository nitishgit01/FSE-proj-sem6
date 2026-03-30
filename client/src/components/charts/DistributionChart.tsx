import React from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  ReferenceLine,
  Tooltip,
} from 'recharts';
import type { StatsResult } from '@shared/types/index';
import { formatCompact, formatCurrency } from '../../lib/formatters';

// ─── Types ─────────────────────────────────────────────────────────────

interface DistributionChartProps {
  stats: StatsResult;
  userSalary?: number;
  currency: string;
  role: string;
  location: string;
}

interface ChartBucket {
  label: string;
  count: number;
  rangeMin: number;
  rangeMax: number;
}

// ─── Custom Tooltip ────────────────────────────────────────────────────

interface TooltipProps {
  active?: boolean;
  payload?: Array<{ payload: ChartBucket }>;
  currency: string;
}

const CustomTooltip: React.FC<TooltipProps> = ({ active, payload, currency }) => {
  if (!active || !payload?.length) return null;
  const { rangeMin, rangeMax, count } = payload[0].payload;

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-md p-3 text-sm min-w-[170px]">
      <p className="font-semibold text-gray-800 mb-1">
        {formatCompact(rangeMin, currency)} – {formatCompact(rangeMax, currency)}
      </p>
      <p className="text-gray-500">
        <span className="text-gray-900 font-bold">{count}</span>{' '}
        {count === 1 ? 'person earns' : 'people earn'} this amount
      </p>
    </div>
  );
};

// ─── X-Axis Tick ───────────────────────────────────────────────────────

interface AxisTickProps {
  x?: number;
  y?: number;
  payload?: { value: string };
}

const AngledTick: React.FC<AxisTickProps> = ({ x = 0, y = 0, payload }) => (
  <g transform={`translate(${x},${y})`}>
    <text
      x={0}
      y={0}
      dy={10}
      textAnchor="end"
      fill="#9CA3AF"
      fontSize={11}
      transform="rotate(-30)"
    >
      {payload?.value ?? ''}
    </text>
  </g>
);

// ─── Main Chart ────────────────────────────────────────────────────────

export const DistributionChart: React.FC<DistributionChartProps> = ({
  stats,
  userSalary,
  currency,
  role,
  location,
}) => {
  const { percentiles, histogram, count } = stats;

  // Build chart data
  const chartData: ChartBucket[] = histogram.map((bucket) => ({
    label: formatCompact(bucket.rangeMin, currency),
    count: bucket.count,
    rangeMin: bucket.rangeMin,
    rangeMax: bucket.rangeMax,
  }));

  // Find which bucket contains P50 for dark-blue highlight
  const p50Bucket = histogram.findIndex(
    (b) => percentiles.p50 >= b.rangeMin && percentiles.p50 < b.rangeMax
  );

  // X-axis value for reference lines: use closest rangeMin value in data
  const findRefX = (value: number): string => {
    const bucket = histogram.find((b) => value >= b.rangeMin && value < b.rangeMax)
      ?? histogram[histogram.length - 1];
    return formatCompact(bucket.rangeMin, currency);
  };

  const refP25  = findRefX(percentiles.p25);
  const refP50  = findRefX(percentiles.p50);
  const refP75  = findRefX(percentiles.p75);
  const refUser = userSalary !== undefined ? findRefX(userSalary) : null;

  return (
    <div className="flex flex-col gap-3">
      {/* Dynamic title */}
      <div className="flex items-baseline gap-2 flex-wrap">
        <h3 className="text-base font-bold text-gray-900">
          {role} salaries in {location}
        </h3>
        <span className="text-xs text-gray-400 font-medium">
          · {count.toLocaleString()} submission{count !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-xs text-gray-500">
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-3 rounded-sm bg-[#93C5FD]" />
          Distribution
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-3 rounded-sm bg-[#1D4ED8]" />
          Median bucket
        </span>
        {userSalary !== undefined && (
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-3 h-0.5 bg-red-600" />
            Your salary
          </span>
        )}
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={320}>
        <ComposedChart
          data={chartData}
          margin={{ top: 20, right: 20, left: 10, bottom: 55 }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />

          <XAxis
            dataKey="label"
            tick={<AngledTick />}
            height={55}
            axisLine={false}
            tickLine={false}
          />

          <YAxis
            label={{
              value: 'People',
              angle: -90,
              position: 'insideLeft',
              offset: 10,
              style: { fill: '#9CA3AF', fontSize: 12 },
            }}
            allowDecimals={false}
            tickLine={false}
            axisLine={false}
            tick={{ fill: '#9CA3AF', fontSize: 11 }}
            width={40}
          />

          <Tooltip
            content={<CustomTooltip currency={currency} />}
            cursor={{ fill: 'rgba(0,0,0,0.04)' }}
          />

          {/* Bars with per-cell coloring */}
          <Bar dataKey="count" radius={[4, 4, 0, 0]}>
            {chartData.map((_, index) => (
              <Cell
                key={`cell-${index}`}
                fill={index === p50Bucket ? '#1D4ED8' : '#93C5FD'}
              />
            ))}
          </Bar>

          {/* P25 reference */}
          <ReferenceLine
            x={refP25}
            stroke="#9CA3AF"
            strokeDasharray="5 5"
            label={{ value: 'P25', position: 'top', fill: '#9CA3AF', fontSize: 11 }}
          />

          {/* Median reference */}
          <ReferenceLine
            x={refP50}
            stroke="#1D4ED8"
            strokeWidth={2}
            label={{
              value: `Median ${formatCompact(percentiles.p50, currency)}`,
              position: 'top',
              fill: '#1D4ED8',
              fontSize: 11,
              fontWeight: 600,
            }}
          />

          {/* P75 reference */}
          <ReferenceLine
            x={refP75}
            stroke="#9CA3AF"
            strokeDasharray="5 5"
            label={{ value: 'P75', position: 'top', fill: '#9CA3AF', fontSize: 11 }}
          />

          {/* User salary reference (conditional) */}
          {refUser && (
            <ReferenceLine
              x={refUser}
              stroke="#DC2626"
              strokeWidth={2.5}
              label={{
                value: 'You',
                position: 'insideTopRight',
                fill: '#DC2626',
                fontSize: 13,
                fontWeight: 600,
              }}
            />
          )}
        </ComposedChart>
      </ResponsiveContainer>

      {/* P10–P90 range bar below chart */}
      <div className="flex items-center justify-between text-xs text-gray-400 px-1 mt-1">
        <span>P10: {formatCurrency(percentiles.p10, currency)}</span>
        <span>P90: {formatCurrency(percentiles.p90, currency)}</span>
      </div>
    </div>
  );
};
