import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '../../utils/cn.js';

export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  className = '',
  leftIcon: LeftIcon,
  rightIcon: RightIcon,
  type = 'button',
  onClick,
  ...props
}) => {
  const baseStyles = "inline-flex items-center justify-center font-medium transition-all duration-150 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-[0.98]";

  const variants = {
    primary: "bg-terracotta-500 hover:bg-terracotta-600 text-white shadow-warm-sm focus:ring-terracotta-500 focus:ring-offset-warm-50",
    secondary: "bg-white hover:bg-warm-100 text-warm-900 border border-warm-300 shadow-warm-sm focus:ring-warm-400 focus:ring-offset-warm-50",
    ghost: "bg-transparent hover:bg-warm-100 text-warm-700 hover:text-warm-900 focus:ring-warm-300",
    danger: "bg-red-600 hover:bg-red-700 text-white shadow-warm-sm focus:ring-red-500",
  };

  const sizes = {
    sm: "text-xs px-3 py-1.5 gap-1.5",
    md: "text-sm px-4 py-2 gap-2",
    lg: "text-base px-5 py-2.5 gap-2.5",
  };

  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      onClick={onClick}
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin text-current" />
      ) : LeftIcon ? (
        <LeftIcon className="w-4 h-4 text-current" />
      ) : null}
      <span>{children}</span>
      {!isLoading && RightIcon ? (
        <RightIcon className="w-4 h-4 text-current" />
      ) : null}
    </button>
  );
};

export default Button;
