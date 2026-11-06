import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import Card from '../common/Card.jsx';
import { cn } from '../../utils/cn.js';

export const StatWidget = ({
  title,
  value,
  trend,
  trendLabel = 'vs last sprint',
  icon: Icon,
  variant = 'terracotta',
}) => {
  const isPositive = trend && trend.startsWith('+');

  const variants = {
    terracotta: 'text-terracotta-500 bg-terracotta-50 border-terracotta-100',
    sage: 'text-sage-500 bg-sage-50 border-sage-100',
    mustard: 'text-mustard-600 bg-mustard-50 border-mustard-100',
    lavender: 'text-lavender-600 bg-lavender-50 border-lavender-100',
    charcoal: 'text-warm-700 bg-warm-100 border-warm-200',
  };

  return (
    <Card padding="md" className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs uppercase font-bold tracking-wider text-warm-400">
          {title}
        </span>
        {Icon && (
          <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center border", variants[variant])}>
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>

      <div className="flex items-baseline justify-between gap-2">
        <span className="text-2xl font-heading font-extrabold text-warm-900 tracking-tight">
          {value}
        </span>

        {trend && (
          <div className="flex items-center gap-1 text-xs">
            <span
              className={cn(
                "inline-flex items-center font-bold px-1.5 py-0.5 rounded",
                isPositive ? "text-sage-600 bg-sage-100" : "text-terracotta-600 bg-terracotta-100"
              )}
            >
              {isPositive ? (
                <ArrowUpRight className="w-3 h-3 stroke-[2.5]" />
              ) : (
                <ArrowDownRight className="w-3 h-3 stroke-[2.5]" />
              )}
              {trend}
            </span>
          </div>
        )}
      </div>

      {trendLabel && (
        <p className="text-[11px] text-warm-400 font-medium pt-1 border-t border-warm-100">
          {trendLabel}
        </p>
      )}
    </Card>
  );
};

export default StatWidget;
