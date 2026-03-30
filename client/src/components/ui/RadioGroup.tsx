import React from 'react';

interface RadioOption {
  value: string;
  label: string;
  description?: string;
}

interface RadioGroupProps {
  label?: string;
  options: RadioOption[];
  value: string;
  onChange: (value: string) => void;
  error?: string | undefined;
  layout?: 'row' | 'grid';
  className?: string;
  disabled?: boolean;
}

/**
 * Premium RadioGroup Component.
 * 
 * Includes:
 * 1. Pill-style button layout (row or grid).
 * 2. Minimum touch target (44px height).
 * 3. Accessibility via screen reader support and keyboard nav.
 * 4. Refined selection states (blue-600 background).
 */
export const RadioGroup: React.FC<RadioGroupProps> = ({
  label,
  options,
  value,
  onChange,
  error,
  layout = 'row',
  className = '',
  disabled = false,
}) => {
  const radioGroupId = `radio-group-${label?.toLowerCase().replace(/\s+/g, '-')}`;

  return (
    <div className={`flex flex-col space-y-2.5 w-full ${className}`}>
      {label && (
        <label className="text-sm font-semibold text-gray-700 tracking-tight">
          {label}
        </label>
      )}

      <div
        id={radioGroupId}
        className={`
          flex flex-wrap gap-2.5 
          ${layout === 'grid' ? 'grid grid-cols-2 md:grid-cols-3' : ''}
        `}
        role="radiogroup"
        aria-invalid={!!error}
        aria-describedby={error ? `${radioGroupId}-error` : undefined}
      >
        {options.map((option) => {
          const isSelected = value === option.value;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => !disabled && onChange(option.value)}
              disabled={disabled}
              className={`
                flex flex-col items-center justify-center 
                min-h-[44px] px-6 py-2.5 text-sm font-medium rounded-xl border-2
                transition-all duration-200 outline-none
                ${isSelected 
                  ? 'bg-blue-600 text-white border-blue-600 shadow-md ring-2 ring-blue-500/20' 
                  : 'bg-white text-gray-700 border-gray-100 hover:border-gray-200 hover:bg-gray-50'
                }
                ${disabled ? 'opacity-50 cursor-not-allowed ' : 'cursor-pointer'}
                flex-1 text-center whitespace-nowrap
              `}
              aria-checked={isSelected}
              role="radio"
              tabIndex={isSelected ? 0 : -1}
            >
              <span>{option.label}</span>
              {option.description && (
                <span className={`text-[10px] mt-0.5 opacity-80 ${isSelected ? 'text-blue-100' : 'text-gray-400'}`}>
                  {option.description}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {error && (
        <p
          id={`${radioGroupId}-error`}
          className="text-xs font-medium text-red-500 leading-none"
          role="alert"
        >
          {error}
        </p>
      )}
    </div>
  );
};

export default RadioGroup;
