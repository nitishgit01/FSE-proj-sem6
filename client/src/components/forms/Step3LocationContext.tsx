import React from 'react';
import { Control, FieldErrors, Controller } from 'react-hook-form';
import { Input } from '../ui/Input';
import { SearchableSelect } from '../ui/SearchableSelect';
import { RadioGroup } from '../ui/RadioGroup';
import type { FormData } from './submissionSchema';

interface Step3Props {
  control: Control<FormData>;
  errors: FieldErrors<FormData>;
}

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

const WORK_MODE_OPTIONS = [
  { value: 'remote', label: 'Remote',  description: 'Fully distributed' },
  { value: 'hybrid', label: 'Hybrid',  description: 'Split office/home' },
  { value: 'onsite', label: 'On-site', description: 'Office-based' },
];

const GENDER_OPTIONS = [
  { value: 'man',               label: 'Man' },
  { value: 'woman',             label: 'Woman' },
  { value: 'non-binary',        label: 'Non-binary' },
  { value: 'prefer_not_to_say', label: 'Prefer not to say' },
];

export const Step3LocationContext: React.FC<Step3Props> = ({ control, errors }) => {
  return (
    <div className="flex flex-col space-y-7">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Location & Context</h2>
        <p className="text-sm text-gray-500 mt-1">
          Location data helps users compare salaries in their market.
        </p>
      </div>

      {/* Country */}
      <Controller
        name="country"
        control={control}
        render={({ field }) => (
          <SearchableSelect
            label="Country"
            options={COUNTRIES}
            value={field.value ?? ''}
            onChange={field.onChange}
            placeholder="Search countries…"
            error={errors.country?.message}
          />
        )}
      />

      {/* City */}
      <Controller
        name="city"
        control={control}
        render={({ field }) => (
          <Input
            label="City"
            placeholder="e.g. Pune, Bangalore, New York"
            error={errors.city?.message}
            hint="Your metro area helps surface local salary data."
            value={field.value ?? ''}
            onChange={field.onChange}
            onBlur={field.onBlur}
          />
        )}
      />

      {/* Work Mode */}
      <Controller
        name="workMode"
        control={control}
        render={({ field }) => (
          <RadioGroup
            label="Work Mode"
            options={WORK_MODE_OPTIONS}
            value={field.value ?? ''}
            onChange={field.onChange}
            error={errors.workMode?.message}
            layout="row"
          />
        )}
      />

      {/* Gender (optional) */}
      <div className="flex flex-col space-y-2">
        <Controller
          name="gender"
          control={control}
          render={({ field }) => (
            <RadioGroup
              label="Gender (optional)"
              options={GENDER_OPTIONS}
              value={field.value ?? ''}
              onChange={field.onChange}
              error={errors.gender?.message}
              layout="row"
            />
          )}
        />
        <p className="text-xs text-gray-400 flex items-center gap-1.5">
          <svg className="w-3 h-3 text-blue-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          Optional. Helps identify pay gaps. Your gender is <strong>never</strong> shown alongside your data.
        </p>
      </div>
    </div>
  );
};
