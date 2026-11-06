import React from 'react';
import { cn } from '../../utils/cn.js';

export const Input = React.forwardRef(({
  label,
  error,
  helperText,
  leftIcon: LeftIcon,
  rightIcon: RightIcon,
  rightElement,
  onRightIconClick,
  className = '',
  id,
  type = 'text',
  disabled = false,
  ...props
}, ref) => {
  const inputId = id || props.name || Math.random().toString(36).substring(2, 9);

  return (
    <div className="w-full space-y-1.5 text-left">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-xs font-semibold uppercase tracking-wider text-warm-700"
        >
          {label}
        </label>
      )}

      <div className="relative rounded-lg shadow-warm-sm">
        {LeftIcon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-warm-400">
            <LeftIcon className="w-4 h-4" />
          </div>
        )}

        <input
          ref={ref}
          id={inputId}
          type={type}
          disabled={disabled}
          className={cn(
            "w-full bg-white text-warm-900 border rounded-lg py-2 text-sm transition-all duration-150 placeholder:text-warm-400 focus:outline-none focus:ring-2 disabled:bg-warm-100 disabled:cursor-not-allowed",
            LeftIcon ? "pl-9" : "pl-3.5",
            RightIcon || rightElement ? "pr-10" : "pr-3.5",
            error
              ? "border-terracotta-500 focus:border-terracotta-500 focus:ring-terracotta-200"
              : "border-warm-300 hover:border-warm-400 focus:border-terracotta-500 focus:ring-terracotta-100",
            className
          )}
          {...props}
        />

        {rightElement ? (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            {rightElement}
          </div>
        ) : RightIcon ? (
          <div
            className={cn(
              "absolute inset-y-0 right-0 pr-3 flex items-center text-warm-400",
              onRightIconClick ? "cursor-pointer hover:text-warm-600 transition-colors" : "pointer-events-none"
            )}
            onClick={onRightIconClick}
          >
            <RightIcon className="w-4 h-4" />
          </div>
        ) : null}
      </div>

      {error ? (
        <p className="text-xs text-terracotta-600 font-medium">{error}</p>
      ) : helperText ? (
        <p className="text-xs text-warm-500">{helperText}</p>
      ) : null}
    </div>
  );
});

Input.displayName = 'Input';
export default Input;
