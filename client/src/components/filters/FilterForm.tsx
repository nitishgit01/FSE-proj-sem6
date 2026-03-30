import React from 'react';
import { Input } from '../ui/Input';
import { SearchableSelect } from '../ui/SearchableSelect';
import { RadioGroup } from '../ui/RadioGroup';
import { Button } from '../ui/Button';
import type { Filters } from '../../hooks/useFilters';

// ─── Country list (same 30 as submission form) ────────────────────────

const COUNTRIES = [
  { value: 'IN', label: '🇮🇳 India' },
  { value: 'US', label: '🇺🇸 United States' },
  { value: 'GB', label: '🇬🇧 United Kingdom' },
  { value: 'CA', label: '🇨🇦 Canada' },
  { value: 'AU', label: '🇦🇺 Australia' },
  { value: 'DE', label: '🇩🇪 Germany' },
  { value: 'SG', label: '🇸🇬 Singapore' },
  { value: 'AE', label: '🇦🇪 UAE' },
  { value: 'NL', label: '🇳🇱 Netherlands' },
  { value: 'FR', label: '🇫🇷 France' },
  { value: 'JP', label: '🇯🇵 Japan' },
  { value: 'BR', label: '🇧🇷 Brazil' },
  { value: 'NZ', label: '🇳🇿 New Zealand' },
  { value: 'SE', label: '🇸🇪 Sweden' },
  { value: 'NO', label: '🇳🇴 Norway' },
  { value: 'DK', label: '🇩🇰 Denmark' },
  { value: 'CH', label: '🇨🇭 Switzerland' },
  { value: 'IE', label: '🇮🇪 Ireland' },
  { value: 'PT', label: '🇵🇹 Portugal' },
  { value: 'ES', label: '🇪🇸 Spain' },
  { value: 'IT', label: '🇮🇹 Italy' },
  { value: 'PL', label: '🇵🇱 Poland' },
  { value: 'ZA', label: '🇿🇦 South Africa' },
  { value: 'MX', label: '🇲🇽 Mexico' },
  { value: 'AR', label: '🇦🇷 Argentina' },
  { value: 'KR', label: '🇰🇷 South Korea' },
  { value: 'HK', label: '🇭🇰 Hong Kong' },
  { value: 'MY', label: '🇲🇾 Malaysia' },
  { value: 'ID', label: '🇮🇩 Indonesia' },
  { value: 'PH', label: '🇵🇭 Philippines' },
];

// ─── Experience bands ─────────────────────────────────────────────────

interface ExpBand {
  label: string;
  min:   number;
  max:   number;
}

const EXP_BANDS: ExpBand[] = [
  { label: '0–2 yrs',  min: 0,  max: 2  },
  { label: '3–5 yrs',  min: 3,  max: 5  },
  { label: '6–10 yrs', min: 6,  max: 10 },
  { label: '10+ yrs',  min: 10, max: 50 },
];

// ─── Static options ────────────────────────────────────────────────────

const WORK_MODE_OPTIONS = [
  { value: 'remote', label: 'Remote'  },
  { value: 'hybrid', label: 'Hybrid'  },
  { value: 'onsite', label: 'On-site' },
];

const COMPANY_SIZE_OPTIONS = [
  { value: 'startup',    label: 'Startup'    },
  { value: 'mid',        label: 'Mid-size'   },
  { value: 'enterprise', label: 'Enterprise' },
];

// ─── Section heading ──────────────────────────────────────────────────

const SectionTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 mt-5 first:mt-0">
    {children}
  </p>
);

// ─── Props ────────────────────────────────────────────────────────────

interface FilterFormProps {
  filters:          Filters;
  setFilter:        <K extends keyof Filters>(key: K, value: Filters[K]) => void;
  setFilters:       (partial: Partial<Filters>) => void;
  resetFilters:     () => void;
  hasActiveFilters: boolean;
  onApply?:         () => void;   // called by drawer "Apply" button
}

// ─── Component ────────────────────────────────────────────────────────

export const FilterForm: React.FC<FilterFormProps> = ({
  filters,
  setFilter,
  setFilters,
  resetFilters,
  hasActiveFilters,
  onApply,
}) => {
  // Which exp band is currently active (both bounds must match)
  const activeExpBand = EXP_BANDS.find(
    (b) => b.min === filters.expMin && b.max === filters.expMax
  );

  const handleExpBand = (band: ExpBand) => {
    if (activeExpBand?.label === band.label) {
      // Deselect
      setFilters({ expMin: undefined, expMax: undefined });
    } else {
      setFilters({ expMin: band.min, expMax: band.max });
    }
  };

  return (
    <div className="flex flex-col">
      {/* ── Role ────────────────────────────────────────────────────── */}
      <SectionTitle>Role</SectionTitle>
      {/* TODO Prompt 15: wire autocomplete. Basic input for now. */}
      <Input
        placeholder="Search job titles..."
        value={filters.jobTitle}
        onChange={(e) => setFilter('jobTitle', e.target.value)}
        aria-label="Filter by job title"
      />

      {/* ── Location ────────────────────────────────────────────────── */}
      <SectionTitle>Location</SectionTitle>
      <SearchableSelect
        options={COUNTRIES}
        value={filters.country}
        onChange={(v) => {
          setFilter('country', v);
          // Reset city when country changes
          if (v !== filters.country) setFilter('city', '');
        }}
        placeholder="Country..."
        aria-label="Filter by country"
      />

      {filters.country && (
        <div className="mt-2">
          <Input
            placeholder="City (optional)"
            value={filters.city}
            onChange={(e) => setFilter('city', e.target.value)}
            aria-label="Filter by city"
          />
        </div>
      )}

      {/* ── Experience ──────────────────────────────────────────────── */}
      <SectionTitle>Experience</SectionTitle>
      <div className="flex flex-wrap gap-2">
        {EXP_BANDS.map((band) => {
          const isActive = activeExpBand?.label === band.label;
          return (
            <button
              key={band.label}
              type="button"
              onClick={() => handleExpBand(band)}
              className={`
                px-3 py-1.5 text-xs font-medium rounded-lg border transition-all duration-150
                ${isActive
                  ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }
              `}
              aria-pressed={isActive}
            >
              {band.label}
            </button>
          );
        })}
      </div>

      {/* ── Work Mode ────────────────────────────────────────────────── */}
      <SectionTitle>Work Mode</SectionTitle>
      <RadioGroup
        options={WORK_MODE_OPTIONS}
        value={filters.workMode}
        onChange={(v) =>
          setFilter('workMode', v === filters.workMode ? '' : v as Filters['workMode'])
        }
        layout="row"
      />

      {/* ── Company Size ─────────────────────────────────────────────── */}
      <SectionTitle>Company Size</SectionTitle>
      <RadioGroup
        options={COMPANY_SIZE_OPTIONS}
        value={filters.companySize}
        onChange={(v) =>
          setFilter('companySize', v === filters.companySize ? '' : v as Filters['companySize'])
        }
        layout="row"
      />

      {/* ── Reset ────────────────────────────────────────────────────── */}
      {hasActiveFilters && (
        <div className="mt-5">
          <Button
            variant="ghost"
            fullWidth
            onClick={() => {
              resetFilters();
              onApply?.();
            }}
            type="button"
            className="text-gray-500 hover:text-red-500 hover:bg-red-50"
          >
            ✕ Reset all filters
          </Button>
        </div>
      )}

      {/* ── Apply (drawer only) ──────────────────────────────────────── */}
      {onApply && (
        <div className="mt-4">
          <Button variant="primary" fullWidth onClick={onApply} type="button">
            Apply filters
          </Button>
        </div>
      )}
    </div>
  );
};
