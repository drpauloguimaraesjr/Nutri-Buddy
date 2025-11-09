"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, Info, AlertTriangle, X } from 'lucide-react';
import { cn } from '@/lib/utils';

type ToastVariant = 'default' | 'success' | 'error' | 'warning';

interface ToastConfig {
  title: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number;
}

interface ToastState extends ToastConfig {
  id: string;
}

interface ToastContextValue {
  showToast: (config: ToastConfig) => string;
  dismissToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const getDefaultDuration = (variant: ToastVariant | undefined) => {
  switch (variant) {
    case 'error':
      return 7000;
    case 'warning':
      return 6000;
    default:
      return 4500;
  }
};

const iconMap: Record<ToastVariant, JSX.Element> = {
  default: <Info className="h-4 w-4" />,
  success: <CheckCircle2 className="h-4 w-4" />,
  error: <AlertTriangle className="h-4 w-4" />,
  warning: <AlertTriangle className="h-4 w-4" />,
};

const baseStyles: Record<ToastVariant, string> = {
  default: 'border-blue-100 bg-blue-50 text-blue-700',
  success: 'border-emerald-100 bg-emerald-50 text-emerald-700',
  error: 'border-red-100 bg-red-50 text-red-700',
  warning: 'border-amber-100 bg-amber-50 text-amber-700',
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastState[]>([]);

  const dismissToast = useCallback((id: string) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback(
    ({ title, description, variant = 'default', duration }: ToastConfig) => {
      const id = `toast-${Date.now()}-${Math.random().toString(16).slice(2)}`;
      const toastDuration = duration ?? getDefaultDuration(variant);

      const toast: ToastState = { id, title, description, variant, duration: toastDuration };
      setToasts((current) => [...current, toast]);

      if (toastDuration > 0) {
        window.setTimeout(() => {
          dismissToast(id);
        }, toastDuration);
      }

      return id;
    },
    [dismissToast]
  );

  const value = useMemo(() => ({ showToast, dismissToast }), [showToast, dismissToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3">
        <AnimatePresence>
          {toasts.map((toast) => {
            const variant = toast.variant ?? 'default';
            return (
              <motion.div
                key={toast.id}
                initial={{ opacity: 0, x: 50, scale: 0.95 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 50, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className={cn(
                  'w-80 rounded-xl border p-4 shadow-lg backdrop-blur-sm',
                  baseStyles[variant]
                )}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">{iconMap[variant]}</div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold leading-5">{toast.title}</p>
                    {toast.description && (
                      <p className="mt-1 text-xs leading-4 text-current/80">{toast.description}</p>
                    )}
                  </div>
                  <button
                    onClick={() => dismissToast(toast.id)}
                    className="rounded-md p-1 text-current/70 transition hover:bg-black/5 hover:text-current"
                    aria-label="Fechar notificação"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast deve ser usado dentro de um ToastProvider');
  }
  return context;
}


