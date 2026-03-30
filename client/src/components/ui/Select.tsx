import React from 'react';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string | undefined;
  options: SelectOption[];
  placeholder?: string;
}

/**
 * Premium Select Component.
 * 
 * Styled native select element with a custom SVG chevron.
 * Shared stylistic tokens with Input.tsx.
 */
export const Select: React.FC<SelectProps> = ({
  label,
  error,
  options,
  placeholder,
  id,
  className = '',
  required,
  ...props
}) => {
  const selectId = id || `select-${label?.toLowerCase().replace(/\s+/g, '-')}`;

  return (
    <div className={`flex flex-col space-y-1.5 w-full ${className}`}>
      {label && (
        <label
          htmlFor={selectId}
          className="text-sm font-semibold text-gray-700 tracking-tight"
        >
          {label}
          {required && <span className="ml-1 text-red-500">*</span>}
        </label>
      )}

      <div className="relative group">
        <select
          id={selectId}
          className={`
            w-full px-4 py-2.5 bg-white border rounded-lg 
            text-gray-900 appearance-none
            transition-all duration-200 outline-none
            ${error 
              ? 'border-red-500 ring-red-500 focus:ring-red-500' 
              : 'border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500'
            }
            disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed
          `}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? `${selectId}-error` : undefined}
          required={required}
          {...props}
        >
          {placeholder && (
            <option value="" disabled hidden>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        {/* Custom Chevron SVG */}
        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 group-focus-within:text-blue-500 transition-colors">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
        </div>
      </div>

      {error && (
        <p
          id={`${selectId}-error`}
          className="text-xs font-medium text-red-500 leading-none"
          role="alert"
        >
          {error}
        </p>
      )}
    </div>
  );
};

export default Select;
