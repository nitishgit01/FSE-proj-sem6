import React from 'react';
import type { Filters } from '../../hooks/useFilters';

// ─── Country label lookup ──────────────────────────────────────────────

const COUNTRY_LABELS: Record<string, string> = {
  IN: '🇮🇳 India',     US: '🇺🇸 United States', GB: '🇬🇧 United Kingdom',
  CA: '🇨🇦 Canada',    AU: '🇦🇺 Australia',      DE: '🇩🇪 Germany',
  SG: '🇸🇬 Singapore', AE: '🇦🇪 UAE',            NL: '🇳🇱 Netherlands',
  FR: '🇫🇷 France',    JP: '🇯🇵 Japan',          BR: '🇧🇷 Brazil',
  NZ: '🇳🇿 New Zealand', SE: '🇸🇪 Sweden',       NO: '🇳🇴 Norway',
  DK: '🇩🇰 Denmark',   CH: '🇨🇭 Switzerland',    IE: '🇮🇪 Ireland',
  PT: '🇵🇹 Portugal',  ES: '🇪🇸 Spain',          IT: '🇮🇹 Italy',
  PL: '🇵🇱 Poland',    ZA: '🇿🇦 South Africa',   MX: '🇲🇽 Mexico',
  AR: '🇦🇷 Argentina', KR: '🇰🇷 South Korea',    HK: '🇭🇰 Hong Kong',
  MY: '🇲🇾 Malaysia',  ID: '🇮🇩 Indonesia',      PH: '🇵🇭 Philippines',
};

const WORK_MODE_LABELS: Record<string, string> = {
  remote: 'Remote', hybrid: 'Hybrid', onsite: 'On-site',
};

const COMPANY_SIZE_LABELS: Record<string, string> = {
  startup: 'Startup', mid: 'Mid-size', enterprise: 'Enterprise',
};

// ─── Props ────────────────────────────────────────────────────────────

interface ActiveFilterChipsProps {
  filters:   Filters;
  setFilter: <K extends keyof Filters>(key: K, value: Filters[K]) => void;
  setFilters: (partial: Partial<Filters>) => void;
}

// ─── Chip ─────────────────────────────────────────────────────────────

interface ChipDef {
  key:     string;
  label:   string;
  onDismiss: () => void;
}

const Chip: React.FC<ChipDef> = ({ label, onDismiss }) => (
  <span className="
    inline-flex items-center gap-1.5 flex-shrink-0
    bg-blue-50 text-blue-700 border border-blue-200
    text-xs font-medium px-3 py-1 rounded-full
    transition-colors hover:bg-blue-100
  ">
    {label}
    <button
      type="button"
      onClick={(e) => { e.stopPropagation(); onDismiss(); }}
      aria-label={`Remove ${label} filter`}
      className="ml-0.5 text-blue-400 hover:text-blue-700 leading-none"
    >
      ×
    </button>
  </span>
);

// ─── Component ────────────────────────────────────────────────────────

export const ActiveFilterChips: React.FC<ActiveFilterChipsProps> = ({
  filters,
  setFilter,
  setFilters,
}) => {
  const chips: ChipDef[] = [];

  if (filters.jobTitle) {
    chips.push({
      key:       'jobTitle',
      label:     `"${filters.jobTitle}"`,
      onDismiss: () => setFilter('jobTitle', ''),
    });
  }

  if (filters.country) {
    chips.push({
      key:       'country',
      label:     COUNTRY_LABELS[filters.country] ?? filters.country,
      onDismiss: () => { setFilter('country', ''); setFilter('city', ''); },
    });
  }

  if (filters.city) {
    chips.push({
      key:       'city',
      label:     `📍 ${filters.city}`,
      onDismiss: () => setFilter('city', ''),
    });
  }

  if (filters.workMode) {
    chips.push({
      key:       'workMode',
      label:     WORK_MODE_LABELS[filters.workMode] ?? filters.workMode,
      onDismiss: () => setFilter('workMode', ''),
    });
  }

  if (filters.companySize) {
    chips.push({
      key:       'companySize',
      label:     COMPANY_SIZE_LABELS[filters.companySize] ?? filters.companySize,
      onDismiss: () => setFilter('companySize', ''),
    });
  }

  if (filters.expMin !== undefined && filters.expMax !== undefined) {
    const label = filters.expMax >= 50
      ? `${filters.expMin}+ yrs`
      : `${filters.expMin}–${filters.expMax} yrs`;
    chips.push({
      key:       'exp',
      label,
      onDismiss: () => setFilters({ expMin: undefined, expMax: undefined }),
    });
  }

  if (chips.length === 0) return null;

  return (
    <div
      className="
        flex overflow-x-auto gap-2 pb-1
        scrollbar-none [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]
      "
      role="list"
      aria-label="Active filters"
    >
      {chips.map((chip) => (
        <div key={chip.key} role="listitem">
          <Chip {...chip} />
        </div>
      ))}
    </div>
  );
};
