import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { cn } from '../../utils/cn.js';

export const Modal = ({
  isOpen = false,
  onClose,
  title,
  description,
  children,
  maxWidth = 'md',
  showClose = true,
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

  const maxWidths = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-xl',
    xl: 'max-w-3xl',
  };

  const modalContent = (
    <div className="fixed inset-0 z-[9999] overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-warm-900/50 backdrop-blur-[2px] transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Container */}
      <div className="flex min-h-full items-center justify-center p-4 text-center">
        <div
          className={cn(
            "relative z-10 w-full transform rounded-2xl bg-white p-6 text-left align-middle shadow-warm-xl transition-all animate-in zoom-in-95 duration-200 border border-warm-200",
            maxWidths[maxWidth]
          )}
          role="dialog"
          aria-modal="true"
        >
          {/* Header */}
          {(title || showClose) && (
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-warm-200">
              <div>
                {title && (
                  <h3 className="text-lg font-heading font-bold text-warm-900">
                    {title}
                  </h3>
                )}
                {description && (
                  <p className="text-xs text-warm-500 mt-1 leading-relaxed">
                    {description}
                  </p>
                )}
              </div>

              {showClose && (
                <button
                  type="button"
                  onClick={onClose}
                  className="text-warm-400 hover:text-warm-700 transition-colors p-1 rounded-lg focus:outline-none focus:ring-2 focus:ring-warm-300"
                  aria-label="Close modal"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
          )}

          {/* Content */}
          <div className="mt-4">{children}</div>
        </div>
      </div>
    </div>
  );

  return typeof document !== 'undefined'
    ? createPortal(modalContent, document.body)
    : modalContent;
};

export default Modal;
