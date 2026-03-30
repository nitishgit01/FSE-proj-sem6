import React from 'react';
import { FilterForm } from './FilterForm';
import type { Filters } from '../../hooks/useFilters';

interface FilterSidebarProps {
  filters:          Filters;
  setFilter:        <K extends keyof Filters>(key: K, value: Filters[K]) => void;
  setFilters:       (partial: Partial<Filters>) => void;
  resetFilters:     () => void;
  hasActiveFilters: boolean;
}

/**
 * Desktop filter sidebar — hidden on mobile.
 *
 * Sticky left panel at w-64. The parent layout must use a flex row
 * so the sidebar and chart area share the full viewport height.
 *
 * Example parent layout:
 * <div className="flex">
 *   <FilterSidebar ... />
 *   <main className="flex-1 min-w-0">...</main>
 * </div>
 */
export const FilterSidebar: React.FC<FilterSidebarProps> = (props) => (
  <aside
    className="
      hidden md:block
      w-64 flex-shrink-0
      border-r border-gray-100
      h-full min-h-screen
      overflow-y-auto
      px-4 py-6
      bg-white
    "
    aria-label="Salary filters"
  >
    {/* Panel Header */}
    <div className="flex items-center justify-between mb-5">
      <h2 className="text-sm font-bold text-gray-800">Filters</h2>
      {props.hasActiveFilters && (
        <span className="text-xs bg-blue-600 text-white font-semibold px-2 py-0.5 rounded-full">
          Active
        </span>
      )}
    </div>

    <FilterForm {...props} />
  </aside>
);
