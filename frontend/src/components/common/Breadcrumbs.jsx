import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import { cn } from '../../utils/cn.js';

export const Breadcrumbs = ({ items = [], className = '' }) => {
  return (
    <nav className={cn("flex items-center gap-1.5 text-xs text-warm-500", className)} aria-label="Breadcrumb">
      <Link
        to="/dashboard"
        className="hover:text-warm-800 transition-colors p-0.5 rounded focus:outline-none"
        aria-label="Dashboard"
      >
        <Home className="w-3.5 h-3.5" />
      </Link>

      {items.map((item, index) => {
        const isLast = index === items.length - 1;

        return (
          <React.Fragment key={index}>
            <ChevronRight className="w-3 h-3 text-warm-300 flex-shrink-0" />
            {isLast || !item.to ? (
              <span className="font-semibold text-warm-800 truncate max-w-[200px]">
                {item.label}
              </span>
            ) : (
              <Link
                to={item.to}
                className="hover:text-warm-800 transition-colors truncate max-w-[150px]"
              >
                {item.label}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};

export default Breadcrumbs;
