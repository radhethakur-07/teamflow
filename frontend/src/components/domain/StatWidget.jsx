import React from 'react';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';
import Card from '../common/Card.jsx';
import { cn } from '../../utils/cn.js';

export const StatWidget = ({
  title,
  value,
  trend,
  trendLabel,
  change,
  icon: Icon,
  variant,
  color,
}) => {
  // Gracefully handle color vs variant alias
  const activeVariant = variant || color || 'terracotta';
  const activeLabel = trendLabel || change || '';

  // Defensively format value: never crash if an aggregation object was passed
  let displayValue = value;
  if (typeof value === 'object' && value !== null) {
    displayValue = value.totalEvents ?? value.count ?? value.total ?? value.value ?? 0;
  } else if (displayValue === null || displayValue === undefined) {
    displayValue = 0;
  }

  // Trend detection supporting 'up', 'down', '+5%', '-2%', 'neutral'
  const isPositive = trend === 'up' || (typeof trend === 'string' && trend.startsWith('+'));
  const isNegative = trend === 'down' || (typeof trend === 'string' && trend.startsWith('-'));

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
          <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center border", variants[activeVariant] || variants.terracotta)}>
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>

      <div className="flex items-baseline justify-between gap-2">
        <span className="text-2xl font-heading font-extrabold text-warm-900 tracking-tight">
          {displayValue}
        </span>

        {trend && (
          <div className="flex items-center gap-1 text-xs">
            <span
              className={cn(
                "inline-flex items-center font-bold px-1.5 py-0.5 rounded",
                isPositive
                  ? "text-sage-700 bg-sage-100"
                  : isNegative
                  ? "text-terracotta-700 bg-terracotta-100"
                  : "text-warm-600 bg-warm-100"
              )}
            >
              {isPositive ? (
                <ArrowUpRight className="w-3 h-3 stroke-[2.5]" />
              ) : isNegative ? (
                <ArrowDownRight className="w-3 h-3 stroke-[2.5]" />
              ) : (
                <Minus className="w-3 h-3 stroke-[2]" />
              )}
              {trend}
            </span>
          </div>
        )}
      </div>

      {activeLabel && (
        <p className="text-[11px] text-warm-500 font-medium pt-1 border-t border-warm-100">
          {activeLabel}
        </p>
      )}
    </Card>
  );
};

export default StatWidget;
