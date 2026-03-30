import React from 'react';
import { ChartContainer, MOCK_STATS } from '../components/charts/ChartContainer';
import type { FilterParams } from '@shared/types/index';

/**
 * Dashboard page — wired to MOCK_STATS for now.
 * Real API + filter bar will be connected in a later prompt.
 */
const DashboardPage: React.FC = () => {
  const mockFilters: FilterParams = {
    jobTitle: 'Software Engineer II',
    country: 'India',
  };

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
          <h1 className="text-3xl font-extrabold text-gray-900">Salary Explorer</h1>
          <p className="text-sm text-gray-500 mt-1">
            Real, anonymous salary data from professionals like you.{' '}
            <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 text-xs font-semibold px-2 py-0.5 rounded-full border border-amber-200">
              ⚡ Dev — mock data
            </span>
          </p>
        </div>

        {/* Chart area — userSalary state is managed inside ChartContainer */}
        <ChartContainer
          stats={MOCK_STATS}
          isLoading={false}
          filters={mockFilters}
        />
      </main>
    </div>
  );
};

export default DashboardPage;
