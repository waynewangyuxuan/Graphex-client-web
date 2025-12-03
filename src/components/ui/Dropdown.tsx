import { useState, useRef, useEffect } from 'react';

interface DropdownOption<T extends string> {
  value: T;
  label: string;
}

interface DropdownProps<T extends string> {
  options: DropdownOption<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
}

const ChevronIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
  </svg>
);

export function Dropdown<T extends string>({ options, value, onChange, className = '' }: DropdownProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find(opt => opt.value === value);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => { document.removeEventListener('mousedown', handleClickOutside); };
  }, []);

  // Close on escape key
  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    }

    document.addEventListener('keydown', handleEscape);
    return () => { document.removeEventListener('keydown', handleEscape); };
  }, []);

  return (
    <div ref={dropdownRef} className={`relative ${className}`}>
      {/* Trigger button */}
      <button
        type="button"
        onClick={() => { setIsOpen(!isOpen); }}
        className={`
          flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-md text-sm
          cursor-pointer transition-all outline-none min-w-[140px]
          border border-sand-300 text-sand-700
          ${isOpen
            ? 'border-terra-500 shadow-[0_0_0_3px_rgba(201,100,66,0.1)]'
            : 'hover:border-sand-400'
          }
        `}
        style={{
          background: 'linear-gradient(180deg, #FFFEFA 0%, #FAF6EF 100%)',
        }}
      >
        <span>{selectedOption?.label || 'Select...'}</span>
        <ChevronIcon className={`w-4 h-4 text-sand-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown menu */}
      {isOpen && (
        <div
          className="absolute top-full left-0 right-0 mt-1 py-1 rounded-md shadow-warm-lg z-50 border border-sand-200 overflow-hidden"
          style={{
            background: 'linear-gradient(180deg, #FFFEFA 0%, #FAF6EF 100%)',
          }}
        >
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
              className={`
                w-full text-left px-3.5 py-2 text-sm transition-colors
                ${option.value === value
                  ? 'bg-terra-500/10 text-terra-700 font-medium'
                  : 'text-sand-700 hover:bg-sand-100'
                }
              `}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
