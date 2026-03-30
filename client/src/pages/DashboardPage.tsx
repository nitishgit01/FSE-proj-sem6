import React from 'react';
import { ChartContainer, MOCK_STATS } from '../components/charts/ChartContainer';
import { FilterSidebar } from '../components/filters/FilterSidebar';
import { FilterDrawer } from '../components/filters/FilterDrawer';
import { ActiveFilterChips } from '../components/filters/ActiveFilterChips';
import { useFilters } from '../hooks/useFilters';

/**
 * Dashboard page — wired to MOCK_STATS.
 * Real API + query integration deferred to a later prompt.
 */
const DashboardPage: React.FC = () => {
  const { filters, setFilter, setFilters, resetFilters, hasActiveFilters } = useFilters();

  const filterProps = { filters, setFilter, setFilters, resetFilters, hasActiveFilters };

  // For mock: use URL filters as display context; still show MOCK_STATS
  const mockFilters = {
    jobTitle: filters.jobTitle || 'Software Engineer II',
    country:  filters.country  || 'India',
    city:     filters.city,
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* ── Top nav ────────────────────────────────────────────────── */}
      <header className="border-b border-gray-100 bg-white/90 backdrop-blur-sm sticky top-0 z-30">
        <div className="max-w-screen-xl mx-auto px-4 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-lg font-extrabold text-blue-600 tracking-tight">WageGlass</span>
            <span className="hidden sm:inline text-gray-200">·</span>
            <span className="hidden sm:inline text-sm text-gray-500">Salary Explorer</span>
          </div>
          <a
            href="/submit"
            className="text-sm bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-1.5 rounded-xl transition-colors"
          >
            Submit salary →
          </a>
        </div>
      </header>

      {/* ── Layout: sidebar + main ─────────────────────────────────── */}
      <div className="flex flex-1 max-w-screen-xl mx-auto w-full">

        {/* Desktop sidebar */}
        <FilterSidebar {...filterProps} />

        {/* Main content */}
        <main className="flex-1 min-w-0 px-4 md:px-8 pt-6 pb-20 space-y-5">
          {/* Page heading */}
          <div className="flex items-start justify-between flex-wrap gap-2">
            <div>
              <h1 className="text-2xl font-extrabold text-gray-900">Salary Explorer</h1>
              <p className="text-sm text-gray-500 mt-0.5">
                Anonymous, real salary data from professionals.{' '}
                <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-600 text-xs font-semibold px-2 py-0.5 rounded-full border border-amber-200">
                  ⚡ Dev — mock data
                </span>
              </p>
            </div>
          </div>

          {/* Active filter chips */}
          <ActiveFilterChips
            filters={filters}
            setFilter={setFilter}
            setFilters={setFilters}
          />

          {/* Chart area */}
          <ChartContainer
            stats={MOCK_STATS}
            isLoading={false}
            filters={mockFilters}
          />
        </main>
      </div>

      {/* Mobile filter drawer (FAB + sheet) */}
      <FilterDrawer {...filterProps} />
    </div>
  );
};

export default DashboardPage;
