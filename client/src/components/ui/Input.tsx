import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string | undefined;
  hint?: string | undefined;
}

/**
 * Premium Input Component for WageGlass.
 * 
 * Includes label, error message, and secondary hint support.
 * Focus ring-offset is set to 0 for a cleaner look.
 */
export const Input = React.forwardRef<HTMLInputElement, InputProps>(({
  label,
  error,
  hint,
  id,
  className = '',
  ...props
}, ref) => {
  const inputId = id || `input-${label?.toLowerCase().replace(/\s+/g, '-')}`;

  return (
    <div className={`flex flex-col space-y-1.5 w-full ${className}`}>
      {label && (
        <label
          htmlFor={inputId}
          className="text-sm font-semibold text-gray-700 tracking-tight"
        >
          {label}
        </label>
      )}
      
      <div className="relative">
        <input
          ref={ref}
          id={inputId}
          className={`
            w-full px-4 py-2.5 bg-white border rounded-lg 
            text-gray-900 placeholder-gray-400
            transition-all duration-200 outline-none
            ${error 
              ? 'border-red-500 ring-red-500 focus:ring-red-500' 
              : 'border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500'
            }
            disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed
          `}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
          {...props}
        />
      </div>

      {error ? (
        <p
          id={`${inputId}-error`}
          className="text-xs font-medium text-red-500 leading-none"
          role="alert"
        >
          {error}
        </p>
      ) : hint ? (
        <p
          id={`${inputId}-hint`}
          className="text-xs text-gray-400 italic leading-none"
        >
          {hint}
        </p>
      ) : null}
    </div>
  );
});

export default Input;
