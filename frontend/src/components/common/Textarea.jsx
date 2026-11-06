import React from 'react';
import { cn } from '../../utils/cn.js';

export const Textarea = React.forwardRef(({
  label,
  error,
  helperText,
  className = '',
  id,
  rows = 3,
  disabled = false,
  ...props
}, ref) => {
  const textareaId = id || props.name || Math.random().toString(36).substring(2, 9);

  return (
    <div className="w-full space-y-1.5 text-left">
      {label && (
        <label
          htmlFor={textareaId}
          className="block text-xs font-semibold uppercase tracking-wider text-warm-700"
        >
          {label}
        </label>
      )}

      <textarea
        ref={ref}
        id={textareaId}
        rows={rows}
        disabled={disabled}
        className={cn(
          "w-full bg-white text-warm-900 border rounded-lg py-2 px-3.5 text-sm transition-all duration-150 placeholder:text-warm-400 focus:outline-none focus:ring-2 disabled:bg-warm-100 disabled:cursor-not-allowed shadow-warm-sm resize-none",
          error
            ? "border-terracotta-500 focus:border-terracotta-500 focus:ring-terracotta-200"
            : "border-warm-300 hover:border-warm-400 focus:border-terracotta-500 focus:ring-terracotta-100",
          className
        )}
        {...props}
      />

      {error ? (
        <p className="text-xs text-terracotta-600 font-medium">{error}</p>
      ) : helperText ? (
        <p className="text-xs text-warm-500">{helperText}</p>
      ) : null}
    </div>
  );
});

Textarea.displayName = 'Textarea';
export default Textarea;
