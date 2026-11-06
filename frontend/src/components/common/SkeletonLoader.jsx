import React from 'react';
import { cn } from '../../utils/cn.js';

export const Skeleton = ({ className = '', ...props }) => {
  return (
    <div
      className={cn("animate-pulse rounded-lg bg-warm-200/70", className)}
      {...props}
    />
  );
};

export const CardSkeleton = () => {
  return (
    <div className="bg-white rounded-xl border border-warm-200 p-5 space-y-4 shadow-warm-sm">
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-5 w-16 rounded-full" />
      </div>
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-4/5" />
      <div className="pt-3 border-t border-warm-100 flex items-center justify-between">
        <div className="flex -space-x-2">
          <Skeleton className="w-6 h-6 rounded-full" />
          <Skeleton className="w-6 h-6 rounded-full" />
        </div>
        <Skeleton className="h-3 w-16" />
      </div>
    </div>
  );
};

export const TableSkeleton = ({ rows = 5 }) => {
  return (
    <div className="bg-white rounded-xl border border-warm-200 p-4 divide-y divide-warm-100 shadow-warm-sm">
      <div className="flex items-center justify-between pb-3">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-4 w-24" />
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="py-3.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Skeleton className="w-8 h-8 rounded-full" />
            <div className="space-y-1.5">
              <Skeleton className="h-3 w-28" />
              <Skeleton className="h-2.5 w-40" />
            </div>
          </div>
          <Skeleton className="h-5 w-20 rounded-full" />
        </div>
      ))}
    </div>
  );
};

export default Skeleton;
