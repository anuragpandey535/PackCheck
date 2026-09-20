import React from 'react';
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from 'lucide-react';
import { ToastMessage } from '../types';

interface ToastContainerProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div
      id="toast-notification-container"
      className="fixed z-50 top-4 right-4 max-w-sm w-full pointer-events-none flex flex-col space-y-2.5 sm:top-5 sm:right-5"
    >
      {toasts.map((toast) => {
        const icons = {
          success: <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />,
          warning: <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />,
          error: <XCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />,
          info: <Info className="w-5 h-5 text-blue-600 flex-shrink-0" />,
        };

        const borders = {
          success: 'border-emerald-200 bg-white/95 text-slate-900 shadow-emerald-500/10',
          warning: 'border-amber-200 bg-white/95 text-slate-900 shadow-amber-500/10',
          error: 'border-rose-200 bg-white/95 text-slate-900 shadow-rose-500/10',
          info: 'border-blue-200 bg-white/95 text-slate-900 shadow-blue-500/10',
        };

        const accents = {
          success: 'bg-emerald-500',
          warning: 'bg-amber-500',
          error: 'bg-rose-500',
          info: 'bg-blue-500',
        };

        return (
          <div
            key={toast.id}
            id={`toast-${toast.id}`}
            className={`pointer-events-auto relative overflow-hidden rounded-xl border p-3.5 shadow-xl backdrop-blur-md transition-all animate-in slide-in-from-top-3 duration-200 flex items-start space-x-3 ${borders[toast.type]}`}
            role="alert"
          >
            <div className={`absolute top-0 left-0 bottom-0 w-1.5 ${accents[toast.type]}`} />
            <div className="pt-0.5">{icons[toast.type]}</div>
            <div className="flex-1 min-w-0 pr-2">
              <h4 className="text-xs sm:text-sm font-semibold text-slate-900 leading-tight">
                {toast.title}
              </h4>
              <p className="text-xs text-slate-600 mt-0.5 leading-snug break-words">
                {toast.message}
              </p>
            </div>
            <button
              type="button"
              onClick={() => onDismiss(toast.id)}
              className="text-slate-400 hover:text-slate-700 p-1 rounded-md transition-colors"
              aria-label="Dismiss toast"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
