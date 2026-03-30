import React, { useState, useRef, useEffect, useMemo } from 'react';

interface Option {
  value: string;
  label: string;
}

interface SearchableSelectProps {
  label?: string;
  error?: string | undefined;
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  isLoading?: boolean;
  className?: string;
  disabled?: boolean;
}

/**
 * Premium Searchable Select Component.
 * 
 * Includes:
 * 1. Filtered dropdown with client-side searching.
 * 2. Full keyboard navigation (Arrows/Enter/Escape).
 * 3. Loading state with SVG spinner.
 * 4. Ref-based click-outside detection.
 * 5. Precise accessibility attributes.
 */
export const SearchableSelect: React.FC<SearchableSelectProps> = ({
  label,
  error,
  options,
  value,
  onChange,
  placeholder = 'Search...',
  isLoading = false,
  className = '',
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeIndex, setActiveIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const selectedOption = useMemo(
    () => options.find((opt) => opt.value === value),
    [options, value]
  );

  const filteredOptions = useMemo(() => {
    if (!searchTerm) return options;
    const lowerSearch = searchTerm.toLowerCase();
    return options.filter((opt) =>
      opt.label.toLowerCase().includes(lowerSearch)
    );
  }, [options, searchTerm]);

  // Sync searchTerm with selected label when closed
  useEffect(() => {
    if (!isOpen) {
      setSearchTerm(selectedOption?.label || '');
      setActiveIndex(-1);
    }
  }, [isOpen, selectedOption]);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        if (!isOpen) setIsOpen(true);
        setActiveIndex((prev) => (prev + 1 < filteredOptions.length ? prev + 1 : prev));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setActiveIndex((prev) => (prev > 0 ? prev - 1 : 0));
        break;
      case 'Enter':
        e.preventDefault();
        if (isOpen && activeIndex >= 0 && filteredOptions[activeIndex]) {
          onChange(filteredOptions[activeIndex].value);
          setIsOpen(false);
        } else if (!isOpen) {
          setIsOpen(true);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        break;
      case 'Tab':
        setIsOpen(false);
        break;
    }
  };

  const handleOptionClick = (val: string) => {
    onChange(val);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className={`flex flex-col space-y-1.5 w-full relative ${className}`}>
      {label && (
        <label className="text-sm font-semibold text-gray-700 tracking-tight">
          {label}
        </label>
      )}

      <div className="relative group">
        <input
          type="text"
          className={`
            w-full px-4 py-2.5 bg-white border rounded-lg 
            text-gray-900 placeholder-gray-400
            transition-all duration-200 outline-none
            ${error 
              ? 'border-red-500 ring-red-500 focus:ring-red-500' 
              : 'border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500'
            }
            ${disabled ? 'bg-gray-50 text-gray-400 cursor-not-allowed' : 'cursor-pointer'}
          `}
          placeholder={placeholder}
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            if (!isOpen) setIsOpen(true);
          }}
          onFocus={() => !disabled && setIsOpen(true)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          autoComplete="off"
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          aria-invalid={!!error}
        />

        {/* Icons Overlay */}
        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center space-x-2 pointer-events-none">
          {isLoading && (
            <svg
              className="animate-spin h-4 w-4 text-blue-500"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          )}
          <svg
            className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="m6 9 6 6 6-6" />
          </svg>
        </div>

        {/* Dropdown List */}
        {isOpen && (
          <ul
            ref={listRef}
            className="absolute z-50 w-full mt-2 py-1 bg-white border border-gray-100 rounded-xl shadow-xl max-h-60 overflow-auto scrollbar-hide focus:outline-none ring-1 ring-black ring-opacity-5 animate-in fade-in zoom-in duration-200"
            role="listbox"
          >
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option, index) => (
                <li
                  key={option.value}
                  className={`
                    px-4 py-2.5 text-sm cursor-pointer transition-colors duration-150
                    ${index === activeIndex || option.value === value
                      ? 'bg-blue-50 text-blue-700 font-medium'
                      : 'text-gray-700 hover:bg-gray-50'
                    }
                  `}
                  role="option"
                  aria-selected={option.value === value}
                  onClick={() => handleOptionClick(option.value)}
                  onMouseEnter={() => setActiveIndex(index)}
                >
                  {option.label}
                </li>
              ))
            ) : (
              <li className="px-4 py-3 text-sm text-gray-400 italic">No results found</li>
            )}
          </ul>
        )}
      </div>

      {error && (
        <p className="text-xs font-medium text-red-500 leading-none" role="alert">
          {error}
        </p>
      )}
    </div>
  );
};

export default SearchableSelect;
