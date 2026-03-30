import React from 'react';

interface SliderProps {
  label: string;
  min: number;
  max: number;
  step?: number;
  value: number;
  onChange: (value: number) => void;
  formatValue?: (v: number) => string;
  error?: string | undefined;
  className?: string;
  disabled?: boolean;
}

/**
 * Premium Slider Component.
 * 
 * Includes:
 * 1. Dynamic track coloring (linear-gradient) for current value.
 * 2. Visual value readout above the slider.
 * 3. Custom Tailwind CSS thumb styling.
 * 4. Error state support.
 */
export const Slider: React.FC<SliderProps> = ({
  label,
  min,
  max,
  step = 1,
  value,
  onChange,
  formatValue = (v) => v.toString(),
  error,
  className = '',
  disabled = false,
}) => {
  const percentage = ((value - min) / (max - min)) * 100;
  
  const sliderId = `slider-${label.toLowerCase().replace(/\s+/g, '-')}`;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(Number(e.target.value));
  };

  return (
    <div className={`flex flex-col space-y-2 w-full ${className}`}>
      <div className="flex justify-between items-end">
        <label
          htmlFor={sliderId}
          className="text-sm font-semibold text-gray-700 tracking-tight"
        >
          {label}
        </label>
        <span className="text-sm font-bold text-blue-600 tabular-nums">
          {formatValue(value)}
        </span>
      </div>

      <div className="relative h-6 flex items-center">
        <input
          id={sliderId}
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={handleChange}
          disabled={disabled}
          className={`
            w-full h-1.5 bg-gray-200 rounded-full appearance-none cursor-pointer
            transition-all duration-200 outline-none
            focus:ring-2 focus:ring-blue-500/20
            disabled:cursor-not-allowed disabled:grayscale
            slider-thumb
          `}
          style={{
            background: error
              ? `linear-gradient(to right, #ef4444 ${percentage}%, #e5e7eb ${percentage}%)`
              : `linear-gradient(to right, #2563eb ${percentage}%, #e5e7eb ${percentage}%)`,
          }}
          aria-invalid={!!error}
          aria-describedby={error ? `${sliderId}-error` : undefined}
        />
        
        {/*
          Custom styles for the range input (usually handled in CSS, but here inline for vanilla Tailwind context)
          Note: In a real project, these pseudo-classes would go into index.css
        */}
        <style dangerouslySetInnerHTML={{ __html: `
          input[type='range']::-webkit-slider-thumb {
            -webkit-appearance: none;
            appearance: none;
            width: 20px;
            height: 20px;
            background: #ffffff;
            border: 2px solid ${error ? '#ef4444' : '#2563eb'};
            border-radius: 50%;
            cursor: pointer;
            box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
            transition: all 0.2s ease;
          }
          input[type='range']:focus::-webkit-slider-thumb {
            transform: scale(1.15);
            box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.15);
          }
          input[type='range']::-moz-range-thumb {
            width: 18px;
            height: 18px;
            background: #ffffff;
            border: 2px solid ${error ? '#ef4444' : '#2563eb'};
            border-radius: 50%;
            cursor: pointer;
            box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
            transition: all 0.2s ease;
          }
        `}} />
      </div>

      {error && (
        <p
          id={`${sliderId}-error`}
          className="text-xs font-medium text-red-500 leading-none"
          role="alert"
        >
          {error}
        </p>
      )}
    </div>
  );
};

export default Slider;
