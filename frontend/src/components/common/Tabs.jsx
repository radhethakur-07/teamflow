import React from 'react';
import { cn } from '../../utils/cn.js';

export const Tabs = ({
  tabs = [],
  activeTab,
  onChange,
  variant = 'pill',
  className = '',
}) => {
  return (
    <div
      className={cn(
        variant === 'pill'
          ? "flex items-center gap-1.5 p-1 bg-warm-100 rounded-xl"
          : "flex items-center gap-6 border-b border-warm-200",
        className
      )}
      role="tablist"
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        const Icon = tab.icon;

        if (variant === 'pill') {
          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={isActive}
              onClick={() => onChange(tab.id)}
              className={cn(
                "flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 select-none focus:outline-none",
                isActive
                  ? "bg-white text-warm-900 shadow-warm-sm"
                  : "text-warm-500 hover:text-warm-800 hover:bg-warm-200/50"
              )}
            >
              {Icon && <Icon className="w-3.5 h-3.5" />}
              <span>{tab.label}</span>
              {tab.badge !== undefined && (
                <span
                  className={cn(
                    "text-[10px] px-1.5 py-0.2 rounded-full font-bold",
                    isActive ? "bg-terracotta-100 text-terracotta-600" : "bg-warm-200 text-warm-600"
                  )}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        }

        // Underline variant
        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tab.id)}
            className={cn(
              "flex items-center gap-2 py-3 text-sm font-semibold border-b-2 transition-all duration-150 -mb-[2px] select-none focus:outline-none",
              isActive
                ? "border-terracotta-500 text-warm-900"
                : "border-transparent text-warm-500 hover:text-warm-800"
            )}
          >
            {Icon && <Icon className="w-4 h-4" />}
            <span>{tab.label}</span>
            {tab.badge !== undefined && (
              <span className="text-xs px-1.5 py-0.5 rounded-full bg-warm-100 text-warm-600 font-bold">
                {tab.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};

export const TabPanel = ({ id, activeTab, children, className = '' }) => {
  if (id !== activeTab) return null;
  return (
    <div role="tabpanel" className={className}>
      {children}
    </div>
  );
};

export default Tabs;
