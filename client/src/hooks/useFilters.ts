import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';

// ─── Filter types ──────────────────────────────────────────────────────

export interface Filters {
  jobTitle:    string;
  country:     string;
  city:        string;
  workMode:    '' | 'remote' | 'hybrid' | 'onsite';
  companySize: '' | 'startup' | 'mid' | 'enterprise';
  expMin:      number | undefined;
  expMax:      number | undefined;
}

const DEFAULTS: Filters = {
  jobTitle:    '',
  country:     '',
  city:        '',
  workMode:    '',
  companySize: '',
  expMin:      undefined,
  expMax:      undefined,
};

// ─── URL ↔ Filters helpers ─────────────────────────────────────────────

function paramsToFilters(params: URLSearchParams): Filters {
  const expMinRaw = params.get('expMin');
  const expMaxRaw = params.get('expMax');

  return {
    jobTitle:    params.get('jobTitle')    ?? '',
    country:     params.get('country')     ?? '',
    city:        params.get('city')        ?? '',
    workMode:    (params.get('workMode')   ?? '') as Filters['workMode'],
    companySize: (params.get('companySize') ?? '') as Filters['companySize'],
    expMin:      expMinRaw != null ? Number(expMinRaw) : undefined,
    expMax:      expMaxRaw != null ? Number(expMaxRaw) : undefined,
  };
}

/**
 * Convert Filters → plain Record<string,string> for URL params or API calls.
 * Strips empty strings and undefined values.
 */
export function filtersToQueryParams(filters: Filters): Record<string, string> {
  const out: Record<string, string> = {};
  if (filters.jobTitle)                out.jobTitle    = filters.jobTitle;
  if (filters.country)                 out.country     = filters.country;
  if (filters.city)                    out.city        = filters.city;
  if (filters.workMode)                out.workMode    = filters.workMode;
  if (filters.companySize)             out.companySize = filters.companySize;
  if (filters.expMin !== undefined)    out.expMin      = String(filters.expMin);
  if (filters.expMax !== undefined)    out.expMax      = String(filters.expMax);
  return out;
}

// ─── Hook ──────────────────────────────────────────────────────────────

export interface UseFiltersReturn {
  filters:          Filters;
  setFilter:        <K extends keyof Filters>(key: K, value: Filters[K]) => void;
  setFilters:       (partial: Partial<Filters>) => void;
  resetFilters:     () => void;
  hasActiveFilters: boolean;
}

export function useFilters(): UseFiltersReturn {
  const [searchParams, setSearchParams] = useSearchParams();

  // Derive filters directly from URL — no separate local state needed
  const filters = useMemo(() => paramsToFilters(searchParams), [searchParams]);

  const hasActiveFilters = useMemo(
    () =>
      !!(
        filters.jobTitle ||
        filters.country  ||
        filters.city     ||
        filters.workMode ||
        filters.companySize ||
        filters.expMin !== undefined ||
        filters.expMax !== undefined
      ),
    [filters]
  );

  /**
   * Write a single filter key back to the URL.
   * Uses `replace: true` to avoid history spam on every keystroke.
   */
  const setFilter = useCallback(
    <K extends keyof Filters>(key: K, value: Filters[K]) => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          if (value === '' || value === undefined) {
            next.delete(key);
          } else {
            next.set(key, String(value));
          }
          return next;
        },
        { replace: true }
      );
    },
    [setSearchParams]
  );

  /**
   * Write multiple filter keys at once (e.g. expMin + expMax together).
   */
  const setFilters = useCallback(
    (partial: Partial<Filters>) => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          for (const [k, v] of Object.entries(partial)) {
            if (v === '' || v === undefined) {
              next.delete(k);
            } else {
              next.set(k, String(v));
            }
          }
          return next;
        },
        { replace: true }
      );
    },
    [setSearchParams]
  );

  /** Clear all filter params from the URL. */
  const resetFilters = useCallback(() => {
    setSearchParams({}, { replace: true });
  }, [setSearchParams]);

  return { filters, setFilter, setFilters, resetFilters, hasActiveFilters };
}
