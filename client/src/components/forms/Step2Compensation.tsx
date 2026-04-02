import React, { useMemo } from 'react';
import { UseFormRegister, Control, FieldErrors, UseFormWatch, Controller } from 'react-hook-form';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Slider } from '../ui/Slider';
import type { FormData } from './submissionSchema';

interface Step2Props {
  register: UseFormRegister<FormData>;
  control: Control<FormData>;
  errors: FieldErrors<FormData>;
  watch: UseFormWatch<FormData>;
}

const CURRENCY_OPTIONS = [
  { value: 'INR', label: 'INR (₹) — Indian Rupee' },
  { value: 'USD', label: 'USD ($) — US Dollar' },
  { value: 'GBP', label: 'GBP (£) — British Pound' },
  { value: 'EUR', label: 'EUR (€) — Euro' },
  { value: 'AUD', label: 'AUD (A$) — Australian Dollar' },
  { value: 'SGD', label: 'SGD (S$) — Singapore Dollar' },
  { value: 'AED', label: 'AED (د.إ) — UAE Dirham' },
];

const CURRENCY_SYMBOLS: Record<string, string> = {
  INR: '₹', USD: '$', GBP: '£', EUR: '€',
  AUD: 'A$', SGD: 'S$', AED: 'د.إ',
};

const CURRENCY_LOCALES: Record<string, string> = {
  INR: 'en-IN', USD: 'en-US', GBP: 'en-GB', EUR: 'de-DE',
  AUD: 'en-AU', SGD: 'en-SG', AED: 'ar-AE',
};

function formatSalary(value: number, currency: string): string {
  const locale = CURRENCY_LOCALES[currency] ?? 'en-US';
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    }).format(value);
  } catch {
    return `${CURRENCY_SYMBOLS[currency] ?? ''}${value.toLocaleString()}`;
  }
}

export const Step2Compensation: React.FC<Step2Props> = ({
  register,
  control,
  errors,
  watch,
}) => {
  const currency   = watch('currency')   ?? 'INR';
  const baseSalary = watch('baseSalary') ?? 0;
  const bonus      = watch('bonus')      ?? 0;
  const equity     = watch('equity')     ?? 0;

  const totalComp = useMemo(
    () => (Number(baseSalary) || 0) + (Number(bonus) || 0) + (Number(equity) || 0),
    [baseSalary, bonus, equity]
  );

  return (
    <div className="flex flex-col space-y-7">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Compensation</h2>
        <p className="text-sm text-gray-500 mt-1">
          All figures are annual and remain completely anonymous.
        </p>
      </div>

      {/* Currency */}
      <Controller
        name="currency"
        control={control}
        render={({ field }) => (
          <Select
            label="Currency"
            options={CURRENCY_OPTIONS}
            error={errors.currency?.message}
            value={field.value ?? 'INR'}
            onChange={field.onChange}
            onBlur={field.onBlur}
          />
        )}
      />

      {/* Base Salary — slider + synced number input */}
      <Controller
        name="baseSalary"
        control={control}
        render={({ field }) => (
          <div className="flex flex-col space-y-3">
            <Slider
              label="Base Salary (Annual)"
              min={10_000}
              max={10_000_000}
              step={10_000}
              value={field.value ?? 10_000}
              onChange={field.onChange}
              formatValue={(v) => formatSalary(v, currency)}
              error={errors.baseSalary?.message}
            />

            {/* Synced raw number input */}
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold text-gray-500 whitespace-nowrap">
                Or type exact value:
              </span>
              <Input
                type="number"
                placeholder="e.g. 1200000"
                error={undefined}
                className="max-w-xs"
                value={field.value === 0 ? '' : field.value}
                onChange={(e) => {
                  const val = e.target.value;
                  field.onChange(val === '' ? 0 : Number(val));
                }}
                onBlur={field.onBlur}
                name={field.name}
              />
            </div>
          </div>
        )}
      />

      {/* Bonus (optional) */}
      <Controller
        name="bonus"
        control={control}
        render={({ field }) => (
          <Input
            {...field}
            type="number"
            label="Annual Bonus"
            placeholder="0"
            hint="Approximate annual variable or performance bonus."
            error={errors.bonus?.message}
            value={field.value === 0 ? '' : field.value}
            onChange={(e) => {
              const val = e.target.value;
              field.onChange(val === '' ? 0 : Number(val));
            }}
          />
        )}
      />

      {/* Equity (optional) */}
      <Controller
        name="equity"
        control={control}
        render={({ field }) => (
          <Input
            {...field}
            type="number"
            label="Annual Equity Value"
            placeholder="0"
            hint="RSUs, ESOPs, or stock grants — annual vesting value."
            error={errors.equity?.message}
            value={field.value === 0 ? '' : field.value}
            onChange={(e) => {
              const val = e.target.value;
              field.onChange(val === '' ? 0 : Number(val));
            }}
          />
        )}
      />

      {/* Total Compensation (read-only) */}
      <div className="rounded-2xl bg-blue-50 border border-blue-100 px-5 py-4 flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-blue-500 uppercase tracking-widest">
            Total Compensation (calculated)
          </p>
          <p className="text-2xl font-extrabold text-blue-700 mt-1 tabular-nums">
            {formatSalary(totalComp, currency)}
          </p>
        </div>
        <div className="text-4xl opacity-20 select-none">💰</div>
      </div>
    </div>
  );
};
