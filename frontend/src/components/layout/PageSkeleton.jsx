import React from 'react';

export const PageSkeleton = () => {
  return (
    <div className="w-full min-h-[60vh] flex flex-col items-center justify-center p-8 space-y-4 animate-pulse text-warm-400">
      <div className="w-10 h-10 rounded-2xl bg-warm-200 border border-warm-300 flex items-center justify-center">
        <div className="w-4 h-4 rounded-full bg-terracotta-400 animate-ping" />
      </div>
      <div className="space-y-2 text-center">
        <div className="h-4 w-32 bg-warm-200 rounded mx-auto" />
        <div className="h-3 w-48 bg-warm-100 rounded mx-auto" />
      </div>
    </div>
  );
};

export default PageSkeleton;
