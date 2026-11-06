import React from 'react';
import { Check } from 'lucide-react';
import { cn } from '../../utils/cn.js';

export const Checkbox = React.forwardRef(({
  label,
  description,
  checked = false,
  onChange,
  disabled = false,
  className = '',
  id,
  ...props
}, ref) => {
  const checkboxId = id || Math.random().toString(36).substring(2, 9);

  return (
    <label
      htmlFor={checkboxId}
      className={cn(
        "flex items-start gap-3 select-none cursor-pointer group",
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
    >
      <div className="relative flex items-center justify-center mt-0.5">
        <input
          ref={ref}
          id={checkboxId}
          type="checkbox"
          checked={checked}
          disabled={disabled}
          onChange={(e) => onChange && onChange(e.target.checked)}
          className="sr-only peer"
          {...props}
        />
        <div
          className={cn(
            "w-4 h-4 rounded border transition-all duration-150 flex items-center justify-center",
            checked
              ? "bg-terracotta-500 border-terracotta-500 text-white"
              : "bg-white border-warm-300 group-hover:border-warm-400 peer-focus:ring-2 peer-focus:ring-terracotta-200"
          )}
        >
          {checked && <Check className="w-3 h-3 stroke-[3]" />}
        </div>
      </div>

      {(label || description) && (
        <div className="text-left">
          {label && <span className="text-sm font-medium text-warm-800 leading-none">{label}</span>}
          {description && <p className="text-xs text-warm-500 mt-0.5">{description}</p>}
        </div>
      )}
    </label>
  );
});

Checkbox.displayName = 'Checkbox';

export const Toggle = ({
  checked = false,
  onChange,
  label,
  disabled = false,
  className = '',
}) => {
  return (
    <label
      className={cn(
        "flex items-center justify-between gap-4 cursor-pointer select-none",
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
    >
      {label && <span className="text-sm font-medium text-warm-800">{label}</span>}
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange && onChange(!checked)}
        className={cn(
          "w-11 h-6 rounded-full transition-colors duration-200 ease-in-out relative p-0.5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-terracotta-400",
          checked ? "bg-terracotta-500" : "bg-warm-300"
        )}
      >
        <span
          className={cn(
            "w-5 h-5 rounded-full bg-white shadow-warm-sm block transition-transform duration-200 ease-in-out",
            checked ? "translate-x-5" : "translate-x-0"
          )}
        />
      </button>
    </label>
  );
};
