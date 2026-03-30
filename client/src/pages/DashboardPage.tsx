import React, { useState } from 'react';
import { ChartContainer, MOCK_STATS } from '../components/charts/ChartContainer';
import { Input } from '../components/ui/Input';
import { formatCurrency } from '../lib/formatters';
import { getPercentileMessage, computePercentile } from '../lib/percentile';
import type { FilterParams } from '@shared/types/index';

/**
 * Dashboard page — currently wired to MOCK_STATS.
 * API will be connected in a later prompt.
 */
const DashboardPage: React.FC = () => {
  const [salaryInput, setSalaryInput] = useState('');

  const userSalary = salaryInput && !isNaN(Number(salaryInput))
    ? Number(salaryInput)
    : undefined;

  const mockFilters: FilterParams = {
    jobTitle: 'Software Engineer II',
    country: 'India',
  };

  const percentile = userSalary
    ? computePercentile(userSalary, MOCK_STATS.percentiles)
    : undefined;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-slate-50">
      {/* Header */}
      <header className="border-b border-gray-100 bg-white/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <span className="text-lg font-extrabold text-blue-600 tracking-tight">WageGlass</span>
          <a href="/submit" className="text-sm text-blue-600 font-semibold hover:underline">
            Submit your salary →
          </a>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 pt-10 pb-20 space-y-8">
        {/* Page title */}
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900">
            Salary Explorer
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Real, anonymous salary data from professionals like you. · <strong>Dev mode:</strong> using mock data.
          </p>
        </div>

        {/* "Where do I stand?" panel */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-6 py-5">
          <h2 className="text-sm font-bold text-gray-700 uppercase tracking-widest mb-3">
            Where do I stand?
          </h2>
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
            <Input
              label="Enter your total compensation (annual)"
              type="number"
              placeholder="e.g. 1400000"
              hint="Compare your salary against the distribution below"
              value={salaryInput}
              onChange={(e) => setSalaryInput(e.target.value)}
              className="max-w-xs"
            />
            {userSalary !== undefined && percentile !== undefined && (
              <div className="flex-1 bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 text-sm">
                <p className="text-blue-700 font-semibold">
                  {formatCurrency(userSalary, MOCK_STATS.currency)} → {percentile}th percentile
                </p>
                <p className="text-blue-500 mt-0.5 text-xs">
                  {getPercentileMessage(percentile, mockFilters.jobTitle!, mockFilters.country!)}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Chart */}
        <ChartContainer
          stats={MOCK_STATS}
          isLoading={false}
          userSalary={userSalary}
          filters={mockFilters}
        />
      </main>
    </div>
  );
};

export default DashboardPage;
