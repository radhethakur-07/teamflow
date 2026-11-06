import React from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '../../utils/cn.js';

export const Select = React.forwardRef(({
  label,
  error,
  helperText,
  options = [],
  className = '',
  id,
  children,
  ...props
}, ref) => {
  const selectId = id || props.name || Math.random().toString(36).substring(2, 9);

  return (
    <div className="w-full space-y-1.5 text-left">
      {label && (
        <label
          htmlFor={selectId}
          className="block text-xs font-semibold uppercase tracking-wider text-warm-700"
        >
          {label}
        </label>
      )}

      <div className="relative rounded-lg shadow-warm-sm">
        <select
          ref={ref}
          id={selectId}
          className={cn(
            "w-full appearance-none bg-white text-warm-900 border rounded-lg py-2 pl-3.5 pr-9 text-sm transition-all duration-150 focus:outline-none focus:ring-2 disabled:bg-warm-100 disabled:cursor-not-allowed",
            error
              ? "border-terracotta-500 focus:border-terracotta-500 focus:ring-terracotta-200"
              : "border-warm-300 hover:border-warm-400 focus:border-terracotta-500 focus:ring-terracotta-100",
            className
          )}
          {...props}
        >
          {children || options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-warm-400">
          <ChevronDown className="w-4 h-4" />
        </div>
      </div>

      {error ? (
        <p className="text-xs text-terracotta-600 font-medium">{error}</p>
      ) : helperText ? (
        <p className="text-xs text-warm-500">{helperText}</p>
      ) : null}
    </div>
  );
});

Select.displayName = 'Select';
export default Select;
