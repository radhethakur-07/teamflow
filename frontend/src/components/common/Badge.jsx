import React from 'react';
import { cn } from '../../utils/cn.js';

export const Badge = ({
  children,
  variant = 'sage',
  size = 'md',
  dot = false,
  className = '',
}) => {
  const baseStyles = "inline-flex items-center font-medium rounded-full transition-colors";

  const variants = {
    sage: "bg-sage-100 text-sage-600 border border-sage-200",
    mustard: "bg-mustard-100 text-mustard-600 border border-mustard-200",
    terracotta: "bg-terracotta-100 text-terracotta-600 border border-terracotta-200",
    lavender: "bg-lavender-100 text-lavender-600 border border-lavender-200",
    charcoal: "bg-warm-100 text-warm-800 border border-warm-200",
  };

  const dotColors = {
    sage: "bg-sage-500",
    mustard: "bg-mustard-500",
    terracotta: "bg-terracotta-500",
    lavender: "bg-lavender-500",
    charcoal: "bg-warm-500",
  };

  const sizes = {
    sm: "text-[11px] px-2 py-0.5 gap-1.5",
    md: "text-xs px-2.5 py-1 gap-1.5",
    lg: "text-sm px-3 py-1.5 gap-2",
  };

  return (
    <span className={cn(baseStyles, variants[variant], sizes[size], className)}>
      {dot && <span className={cn("w-1.5 h-1.5 rounded-full animate-pulse", dotColors[variant])} />}
      <span>{children}</span>
    </span>
  );
};

export default Badge;
