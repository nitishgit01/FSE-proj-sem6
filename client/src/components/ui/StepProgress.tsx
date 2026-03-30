import React from 'react';

interface StepProgressProps {
  currentStep: 1 | 2 | 3;
  totalSteps?: number;
  stepLabels: string[];
  className?: string;
}

/**
 * Premium StepProgress Component.
 * 
 * Includes:
 * 1. Visual numbered dots connected by lines.
 * 2. Active/Completed/Future states.
 * 3. Mobile responsiveness: Hides labels on small screens.
 * 4. Status text (Step X of Y) above the bar.
 * 5. Smooth transitions between states.
 */
export const StepProgress: React.FC<StepProgressProps> = ({
  currentStep,
  totalSteps = 3,
  stepLabels,
  className = '',
}) => {
  return (
    <div className={`w-full max-w-lg mx-auto ${className}`}>
      {/* Header Stat Text */}
      <div className="flex justify-between items-center mb-6">
        <span className="text-sm font-semibold text-gray-500 uppercase tracking-widest">
          Progress
        </span>
        <span className="text-sm font-bold text-blue-600">
          Step {currentStep} <span className="text-gray-300 mx-1">/</span> {totalSteps}
        </span>
      </div>

      <div className="relative">
        {/* Connection Line Background */}
        <div 
          className="absolute top-1/2 left-0 w-full h-0.5 bg-gray-100 -translate-y-1/2 pointer-events-none" 
        />
        
        {/* Active/Completed Line Foreground */}
        <div 
          className="absolute top-1/2 left-0 h-0.5 bg-blue-600 -translate-y-1/2 transition-all duration-500 ease-in-out pointer-events-none"
          style={{ width: `${((currentStep - 1) / (totalSteps - 1)) * 100}%` }}
        />

        <div className="relative flex justify-between">
          {stepLabels.map((label, index) => {
            const stepNumber = index + 1;
            const isCompleted = currentStep > stepNumber;
            const isActive = currentStep === stepNumber;
            
            return (
              <div 
                key={stepNumber} 
                className="flex flex-col items-center group relative z-10"
              >
                {/* Step Circle */}
                <div 
                  className={`
                    w-10 h-10 flex items-center justify-center rounded-full text-sm font-bold border-2 transition-all duration-300
                    ${isCompleted 
                      ? 'bg-blue-600 border-blue-600 text-white shadow-lg' 
                      : isActive 
                        ? 'bg-white border-blue-600 text-blue-600 ring-2 ring-blue-500/20 ring-offset-2' 
                        : 'bg-white border-gray-200 text-gray-400'
                    }
                  `}
                >
                  {isCompleted ? (
                    <svg 
                      className="w-5 h-5" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth="3" 
                        d="M5 13l4 4L19 7" 
                      />
                    </svg>
                  ) : (
                    stepNumber
                  )}
                </div>

                {/* Step Label (Hidden under 400px via sr-only on small mobile) */}
                <span 
                  className={`
                    mt-3 text-xs font-semibold whitespace-nowrap transition-colors duration-300
                    hidden min-[400px]:block
                    ${isActive ? 'text-blue-600' : isCompleted ? 'text-gray-900' : 'text-gray-400'}
                  `}
                >
                  {label}
                </span>

                {/* Screen Reader Label for Mobile below 400px */}
                <span className="sr-only min-[400px]:hidden">
                  {label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default StepProgress;
