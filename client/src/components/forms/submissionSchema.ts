/**
 * Zod schemas and shared FormData type for the 3-step salary submission form.
 * Extracted here to avoid circular dependencies between SubmissionForm and Steps.
 */

import { z } from 'zod';

// ─── Per-Step Schemas ────────────────────────────────────────────────

export const step1Schema = z.object({
  jobTitle:    z.string().min(2, 'Job title must be at least 2 characters').max(100),
  industry:    z.enum(['technology','finance','healthcare','design','marketing','education','legal','other'], {
    errorMap: () => ({ message: 'Please select an industry' }),
  }),
  company:     z.string().max(100).optional(),
  companySize: z.enum(['startup','mid','enterprise'], {
    errorMap: () => ({ message: 'Please select a company size' }),
  }),
  yearsExp:    z.number({ invalid_type_error: 'Please set your experience' }).min(0).max(50),
});

export const step2Schema = z.object({
  currency:   z.string().min(2).max(5),
  baseSalary: z.number({ invalid_type_error: 'Enter a valid salary' })
    .min(1000, 'Enter a realistic salary (minimum 1,000)')
    .max(10_000_000, 'Salary exceeds maximum allowed'),
  bonus:  z.number({ invalid_type_error: 'Must be a number' }).min(0).max(10_000_000).optional().default(0),
  equity: z.number({ invalid_type_error: 'Must be a number' }).min(0).max(10_000_000).optional().default(0),
});

export const step3Schema = z.object({
  country:  z.string().min(2, 'Please select a country').max(3),
  city:     z.string().min(2, 'City must be at least 2 characters').max(100),
  workMode: z.enum(['remote','hybrid','onsite'], {
    errorMap: () => ({ message: 'Please select a work mode' }),
  }),
  gender: z.enum(['man','woman','non-binary','prefer_not_to_say']).optional(),
});

// ─── Combined Schema ─────────────────────────────────────────────────

export const fullSchema = step1Schema.merge(step2Schema).merge(step3Schema);

/** Single source of truth for the form's TypeScript type across all 3 steps. */
export type FormData = z.infer<typeof fullSchema>;

/** Fields validated per step (used with react-hook-form's trigger()). */
export const STEP_FIELDS: Record<number, (keyof FormData)[]> = {
  1: ['jobTitle', 'industry', 'company', 'companySize', 'yearsExp'],
  2: ['currency', 'baseSalary', 'bonus', 'equity'],
  3: ['country',  'city',      'workMode', 'gender'],
};
