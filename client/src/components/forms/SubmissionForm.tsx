import React, { useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

import { StepProgress } from '../ui/StepProgress';
import { Button } from '../ui/Button';
import { Step1RoleEmployer } from './Step1RoleEmployer';
import { Step2Compensation } from './Step2Compensation';
import { Step3LocationContext } from './Step3LocationContext';
import { fullSchema, STEP_FIELDS, type FormData } from './submissionSchema';
import { useSubmitSalary } from '../../hooks/useSubmitSalary';
import { useAuth } from '../../hooks/useAuth';

// Re-export FormData for consumers that need it (no circular dep)
export type { FormData };

const STEP_LABELS = ['Your Role', 'Compensation', 'Location'];

// ── Rate-limit helpers ────────────────────────────────────────────────────────

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

function getNextEligibleDate(lastSubmittedAt: Date | string | undefined): Date | null {
  if (!lastSubmittedAt) return null;
  const last = new Date(lastSubmittedAt);
  if (isNaN(last.getTime())) return null;
  const elapsed = Date.now() - last.getTime();
  if (elapsed >= THIRTY_DAYS_MS) return null;
  return new Date(last.getTime() + THIRTY_DAYS_MS);
}

// ── Component ─────────────────────────────────────────────────────────────────

const SubmissionForm: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const navigate = useNavigate();
  const { mutate: submitSalary, isPending } = useSubmitSalary();
  const { user } = useAuth();

  // ── Client-side rate-limit check ─────────────────────────────────────────────
  // If the user is logged in and submitted within the last 30 days, show a banner
  // and disable the submit button. The server enforces this too — this is just UX.
  const rateLimitDate = useMemo(
    () => getNextEligibleDate(user?.lastSubmittedAt),
    [user?.lastSubmittedAt]
  );
  const isRateLimited = rateLimitDate !== null;

  const form = useForm<FormData>({
    resolver: zodResolver(fullSchema),
    mode: 'onTouched',
    defaultValues: {
      jobTitle:    '',
      industry:    undefined,
      company:     '',
      companySize: undefined,
      yearsExp:    0,
      currency:    'INR',
      baseSalary:  500_000,
      bonus:       0,
      equity:      0,
      country:     '',
      city:        '',
      workMode:    undefined,
      gender:      undefined,
    },
  });

  const { register, control, formState: { errors }, trigger, watch, handleSubmit, setError } = form;

  const handleNext = async () => {
    const fields = STEP_FIELDS[currentStep];
    const valid = await trigger(fields);
    if (valid) {
      setCurrentStep((prev) => (prev < 3 ? (prev + 1) as 1 | 2 | 3 : prev));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleBack = () => {
    setCurrentStep((prev) => (prev > 1 ? (prev - 1) as 1 | 2 | 3 : prev));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ── Real API submit ──────────────────────────────────────────────────────────
  const onSubmit = (data: FormData) => {
    submitSalary(data, {
      onSuccess: (response) => {
        navigate('/submit/success', {
          state: {
            submissionId: response.data.submissionId,
            formData: data,
          },
        });
      },
      onError: (error: unknown) => {
        const err = error as {
          code?: string;
          message?: string;
          fields?: Record<string, string>;
          nextEligibleDate?: string;
        };

        if (err.code === 'RATE_LIMITED') {
          const nextDate = err.nextEligibleDate
            ? new Date(err.nextEligibleDate).toLocaleDateString('en-IN', {
                day: 'numeric', month: 'long', year: 'numeric',
              })
            : 'next month';
          toast.error(`Already submitted this month. Next eligible: ${nextDate}`, {
            duration: 6000,
          });
        } else if (err.code === 'VALIDATION_ERROR' && err.fields) {
          // Server-side field errors → wire back into react-hook-form
          Object.entries(err.fields).forEach(([field, message]) => {
            setError(field as keyof FormData, { message: message as string });
          });
          toast.error('Please fix the errors below.');
        } else {
          toast.error(err.message ?? 'Something went wrong. Please try again.');
        }
      },
    });
  };

  const commonProps = { register, control, errors, watch };

  return (
    <div className="flex flex-col space-y-8">

      {/* ── Rate-limit banner (non-dismissable) ────────────────────────── */}
      {isRateLimited && (
        <div
          role="alert"
          className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-2xl px-5 py-4"
        >
          <span className="text-xl flex-shrink-0">⏳</span>
          <div>
            <p className="text-sm font-semibold text-amber-800">
              You've already submitted this month.
            </p>
            <p className="text-xs text-amber-700 mt-0.5">
              Next eligible submission date:{' '}
              <strong>
                {rateLimitDate!.toLocaleDateString('en-IN', {
                  day: 'numeric', month: 'long', year: 'numeric',
                })}
              </strong>
            </p>
          </div>
        </div>
      )}

      <StepProgress
        currentStep={currentStep}
        totalSteps={3}
        stepLabels={STEP_LABELS}
      />

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 px-6 py-8 md:px-10">
        {currentStep === 1 && <Step1RoleEmployer {...commonProps} />}
        {currentStep === 2 && <Step2Compensation {...commonProps} />}
        {currentStep === 3 && <Step3LocationContext control={control} errors={errors} />}
      </div>

      <div className="flex items-center justify-between gap-4 pb-2">
        {currentStep > 1 ? (
          <Button variant="secondary" size="md" onClick={handleBack} type="button">
            ← Back
          </Button>
        ) : (
          <div />
        )}

        {currentStep < 3 ? (
          <Button variant="primary" size="md" onClick={handleNext} type="button">
            Next →
          </Button>
        ) : (
          <Button
            variant="primary"
            size="md"
            isLoading={isPending}
            disabled={isPending || isRateLimited}
            onClick={handleSubmit(onSubmit)}
            type="button"
            id="submit-salary-btn"
          >
            {isPending ? 'Submitting…' : 'Submit →'}
          </Button>
        )}
      </div>
    </div>
  );
};

export default SubmissionForm;
