import React from 'react';
import { Inbox } from 'lucide-react';
import Button from './Button.jsx';
import { cn } from '../../utils/cn.js';

export const EmptyState = ({
  icon: Icon = Inbox,
  title = 'No items found',
  description = 'There are no records to display at this moment.',
  actionLabel,
  onAction,
  actionIcon,
  className = '',
}) => {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center p-8 md:p-12 text-center bg-white rounded-2xl border border-warm-200 shadow-warm-sm max-w-lg mx-auto space-y-4",
        className
      )}
    >
      <div className="w-14 h-14 rounded-2xl bg-warm-100 text-warm-600 flex items-center justify-center border border-warm-200">
        <Icon className="w-7 h-7 text-warm-600 stroke-[1.5]" />
      </div>

      <div className="space-y-1.5 max-w-sm">
        <h4 className="font-heading font-bold text-base text-warm-900">{title}</h4>
        <p className="text-xs text-warm-500 leading-relaxed">{description}</p>
      </div>

      {actionLabel && (
        <div className="pt-2">
          <Button
            variant="primary"
            size="sm"
            leftIcon={actionIcon}
            onClick={onAction}
          >
            {actionLabel}
          </Button>
        </div>
      )}
    </div>
  );
};

export default EmptyState;
