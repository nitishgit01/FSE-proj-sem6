import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'react-hot-toast';

import { StepProgress } from '../ui/StepProgress';
import { Button } from '../ui/Button';
import { Step1RoleEmployer } from './Step1RoleEmployer';
import { Step2Compensation } from './Step2Compensation';
import { Step3LocationContext } from './Step3LocationContext';
import { fullSchema, STEP_FIELDS, type FormData } from './submissionSchema';

// Re-export FormData for consumers that need it (no circular dep)
export type { FormData };

const STEP_LABELS = ['Your Role', 'Compensation', 'Location'];

const SubmissionForm: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const { register, control, formState: { errors }, trigger, watch, handleSubmit } = form;

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

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 1200));
    console.log('Form data:', data);
    toast.success('Mock submit — API not connected yet', {
      duration: 4000,
      icon: '🚀',
    });
    setIsSubmitting(false);
  };

  const commonProps = { register, control, errors, watch };

  return (
    <div className="flex flex-col space-y-8">
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
            isLoading={isSubmitting}
            onClick={handleSubmit(onSubmit)}
            type="button"
          >
            Submit →
          </Button>
        )}
      </div>
    </div>
  );
};

export default SubmissionForm;
