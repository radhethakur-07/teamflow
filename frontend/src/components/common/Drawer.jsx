import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { cn } from '../../utils/cn.js';

export const Drawer = ({
  isOpen = false,
  onClose,
  title,
  subtitle,
  children,
  width = 'md',
  footer,
}) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen && onClose) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const widths = {
    sm: 'max-w-md',
    md: 'max-w-xl',
    lg: 'max-w-2xl',
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-warm-900/40 backdrop-blur-[2px] transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="fixed inset-y-0 right-0 flex pl-10 max-w-full">
        <div
          className={cn(
            "w-screen bg-white shadow-warm-lg flex flex-col border-l border-warm-200 animate-in slide-in-from-right duration-250",
            widths[width]
          )}
          role="dialog"
          aria-modal="true"
        >
          {/* Header */}
          <div className="p-5 border-b border-warm-200 flex items-start justify-between gap-4">
            <div>
              {title && (
                <h3 className="text-lg font-heading font-bold text-warm-900">
                  {title}
                </h3>
              )}
              {subtitle && (
                <p className="text-xs text-warm-500 mt-0.5">{subtitle}</p>
              )}
            </div>

            <button
              type="button"
              onClick={onClose}
              className="text-warm-400 hover:text-warm-700 transition-colors p-1.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-warm-300"
              aria-label="Close drawer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {children}
          </div>

          {/* Footer */}
          {footer && (
            <div className="p-4 border-t border-warm-200 bg-warm-50/50">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Drawer;
