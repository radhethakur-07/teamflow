import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const addToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = Date.now() + Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  }, [removeToast]);

  const toast = {
    success: (msg, duration) => addToast(msg, 'success', duration),
    error: (msg, duration) => addToast(msg, 'error', duration),
    warning: (msg, duration) => addToast(msg, 'warning', duration),
    info: (msg, duration) => addToast(msg, 'info', duration),
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      {/* Toast Render Viewport */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
        {toasts.map((t) => {
          const typeConfigs = {
            success: {
              icon: CheckCircle2,
              bg: 'bg-white border-sage-300 text-warm-900',
              iconColor: 'text-sage-500',
            },
            error: {
              icon: XCircle,
              bg: 'bg-white border-terracotta-300 text-warm-900',
              iconColor: 'text-terracotta-500',
            },
            warning: {
              icon: AlertTriangle,
              bg: 'bg-white border-mustard-300 text-warm-900',
              iconColor: 'text-mustard-600',
            },
            info: {
              icon: Info,
              bg: 'bg-white border-warm-300 text-warm-900',
              iconColor: 'text-warm-600',
            },
          };

          const config = typeConfigs[t.type] || typeConfigs.info;
          const Icon = config.icon;

          return (
            <div
              key={t.id}
              className={`pointer-events-auto flex items-center justify-between gap-3 p-4 rounded-xl border shadow-warm-md transition-all duration-200 animate-in fade-in slide-in-from-bottom-2 ${config.bg}`}
              role="status"
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-5 h-5 flex-shrink-0 ${config.iconColor}`} />
                <p className="text-sm font-medium text-warm-800 leading-snug">{t.message}</p>
              </div>
              <button
                type="button"
                onClick={() => removeToast(t.id)}
                className="text-warm-400 hover:text-warm-700 transition-colors p-1 rounded-lg focus:outline-none"
                aria-label="Close notification"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
