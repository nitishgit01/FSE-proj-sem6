import React, { useState, useEffect } from 'react';
import { FilterForm } from './FilterForm';
import type { Filters } from '../../hooks/useFilters';

interface FilterDrawerProps {
  filters:          Filters;
  setFilter:        <K extends keyof Filters>(key: K, value: Filters[K]) => void;
  setFilters:       (partial: Partial<Filters>) => void;
  resetFilters:     () => void;
  hasActiveFilters: boolean;
}

/**
 * Mobile-only filter drawer — hidden on md+ (md:hidden).
 *
 * Renders a fixed floating FAB button that opens a bottom sheet drawer.
 * Semi-transparent backdrop closes the drawer when clicked.
 */
export const FilterDrawer: React.FC<FilterDrawerProps> = (props) => {
  const { hasActiveFilters } = props;
  const [isOpen, setIsOpen] = useState(false);

  // Count active filters for badge
  const activeCount = [
    props.filters.jobTitle,
    props.filters.country,
    props.filters.city,
    props.filters.workMode,
    props.filters.companySize,
    props.filters.expMin !== undefined ? '1' : '',
  ].filter(Boolean).length;

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const handleClose = () => setIsOpen(false);

  return (
    <div className="md:hidden">
      {/* ── Floating trigger button ─────────────────────────────────── */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        aria-label="Open filters"
        aria-expanded={isOpen}
        className="
          fixed bottom-5 right-4 z-50
          flex items-center gap-2
          bg-white border border-gray-200 shadow-lg
          rounded-full px-4 py-2.5
          text-sm font-semibold text-gray-700
          transition-shadow hover:shadow-xl active:scale-95
        "
      >
        {/* Funnel icon */}
        <svg
          className="w-4 h-4 text-gray-500"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 4h18M6 9h12M9 14h6M11 19h2" />
        </svg>

        Filters

        {/* Active count badge */}
        {hasActiveFilters && (
          <span className="
            ml-0.5 flex items-center justify-center
            w-5 h-5 rounded-full
            bg-blue-600 text-white text-[10px] font-bold
          ">
            {activeCount}
          </span>
        )}
      </button>

      {/* ── Backdrop ────────────────────────────────────────────────── */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity"
          aria-hidden="true"
          onClick={handleClose}
        />
      )}

      {/* ── Drawer panel ────────────────────────────────────────────── */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Salary filters"
        className={`
          fixed bottom-0 left-0 right-0 z-50
          bg-white rounded-t-2xl shadow-2xl
          h-3/4 flex flex-col
          transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-y-0' : 'translate-y-full'}
        `}
      >
        {/* Drag indicator + header */}
        <div className="flex-shrink-0 px-4">
          <div className="mx-auto mt-3 mb-1 w-10 h-1 bg-gray-200 rounded-full" />
          <div className="flex items-center justify-between py-3 border-b border-gray-100">
            <h2 className="text-sm font-bold text-gray-800">
              Filters
              {hasActiveFilters && (
                <span className="ml-2 text-xs bg-blue-600 text-white font-semibold px-2 py-0.5 rounded-full">
                  {activeCount} active
                </span>
              )}
            </h2>
            <button
              type="button"
              onClick={handleClose}
              aria-label="Close filters"
              className="
                w-7 h-7 flex items-center justify-center
                rounded-full text-gray-400 hover:text-gray-700
                hover:bg-gray-100 transition-colors
              "
            >
              ✕
            </button>
          </div>
        </div>

        {/* Scrollable form area */}
        <div className="flex-1 overflow-y-auto px-4 pb-4">
          <FilterForm
            {...props}
            onApply={handleClose}
          />
        </div>
      </div>
    </div>
  );
};
