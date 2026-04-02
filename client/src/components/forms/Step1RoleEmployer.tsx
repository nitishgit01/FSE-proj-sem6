import React from 'react';
import { UseFormRegister, Control, FieldErrors, UseFormWatch, Controller } from 'react-hook-form';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { RadioGroup } from '../ui/RadioGroup';
import { Slider } from '../ui/Slider';
import type { FormData } from './submissionSchema';

interface Step1Props {
  register: UseFormRegister<FormData>;
  control: Control<FormData>;
  errors: FieldErrors<FormData>;
  watch: UseFormWatch<FormData>;
}

const INDUSTRY_OPTIONS = [
  { value: 'technology',  label: 'Technology' },
  { value: 'finance',     label: 'Finance' },
  { value: 'healthcare',  label: 'Healthcare' },
  { value: 'design',      label: 'Design' },
  { value: 'marketing',   label: 'Marketing' },
  { value: 'education',   label: 'Education' },
  { value: 'legal',       label: 'Legal' },
  { value: 'other',       label: 'Other' },
];

const COMPANY_SIZE_OPTIONS = [
  { value: 'startup',    label: 'Startup',    description: '1–50 employees' },
  { value: 'mid',        label: 'Mid-size',   description: '51–500 employees' },
  { value: 'enterprise', label: 'Enterprise', description: '500+ employees' },
];

export const Step1RoleEmployer: React.FC<Step1Props> = ({
  register,
  control,
  errors,
}) => {
  return (
    <div className="flex flex-col space-y-7">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Your Role</h2>
        <p className="text-sm text-gray-500 mt-1">Tell us about your position and employer.</p>
      </div>

      {/* Job Title */}
      <Controller
        name="jobTitle"
        control={control}
        render={({ field }) => (
          <Input
            {...field}
            label="Job Title"
            placeholder="e.g. Software Engineer II"
            error={errors.jobTitle?.message}
            hint="Use your official job title for accurate comparisons."
          />
        )}
      />

      {/* Industry */}
      <Controller
        name="industry"
        control={control}
        render={({ field }) => (
          <Select
            {...field}
            label="Industry"
            options={INDUSTRY_OPTIONS}
            placeholder="Select your industry"
            error={errors.industry?.message}
            value={field.value ?? ''}
          />
        )}
      />

      {/* Company (optional) */}
      <Controller
        name="company"
        control={control}
        render={({ field }) => (
          <Input
            {...field}
            label="Company"
            placeholder="Company name (optional)"
            error={errors.company?.message}
            hint="Leave blank to stay fully anonymous. We never display company names."
          />
        )}
      />

      {/* Company Size */}
      <Controller
        name="companySize"
        control={control}
        render={({ field }) => (
          <RadioGroup
            label="Company Size"
            options={COMPANY_SIZE_OPTIONS}
            value={field.value ?? ''}
            onChange={field.onChange}
            error={errors.companySize?.message}
            layout="row"
          />
        )}
      />

      {/* Years of Experience */}
      <Controller
        name="yearsExp"
        control={control}
        render={({ field }) => (
          <Slider
            label="Years of Experience"
            min={0}
            max={30}
            step={1}
            value={field.value ?? 0}
            onChange={field.onChange}
            formatValue={(v) => (v === 0 ? 'Fresher' : `${v} yr${v === 1 ? '' : 's'}`)}
            error={errors.yearsExp?.message}
          />
        )}
      />
    </div>
  );
};
