import React from 'react';
import { cn } from '../../utils/cn.js';

export const Card = ({
  children,
  className = '',
  elevation = 'sm',
  padding = 'md',
  ...props
}) => {
  const elevations = {
    none: 'border border-warm-200',
    sm: 'border border-warm-200 bg-white shadow-warm-sm',
    md: 'border border-warm-200 bg-white shadow-warm-md',
    lg: 'border border-warm-300 bg-white shadow-warm-lg',
  };

  const paddings = {
    none: 'p-0',
    sm: 'p-3',
    md: 'p-5',
    lg: 'p-8',
  };

  return (
    <div
      className={cn(
        'rounded-xl transition-all duration-150',
        elevations[elevation],
        paddings[padding],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;
