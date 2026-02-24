'use client';

import { useCallback, useEffect, useState, useSyncExternalStore } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

type ToastVariant = 'success' | 'error' | 'info' | 'warning';

interface Toast {
  id: string;
  message: string;
  variant: ToastVariant;
  duration?: number;
}

// Simple external store for toasts
let toasts: Toast[] = [];
let listeners: Array<() => void> = [];

function emitChange() {
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.push(listener);
  return () => {
    listeners = listeners.filter((l) => l !== listener);
  };
}

function getSnapshot() {
  return toasts;
}

function addToast(message: string, variant: ToastVariant = 'info', duration = 5000) {
  const id = Math.random().toString(36).slice(2);
  toasts = [...toasts, { id, message, variant, duration }];
  emitChange();
  return id;
}

function removeToast(id: string) {
  toasts = toasts.filter((t) => t.id !== id);
  emitChange();
}

export function useToast() {
  const toast = useCallback((message: string, variant: ToastVariant = 'info', duration?: number) => {
    return addToast(message, variant, duration);
  }, []);

  return {
    toast,
    success: (msg: string) => addToast(msg, 'success'),
    error: (msg: string) => addToast(msg, 'error'),
    info: (msg: string) => addToast(msg, 'info'),
    warning: (msg: string) => addToast(msg, 'warning'),
  };
}

const icons: Record<ToastVariant, typeof CheckCircle> = {
  success: CheckCircle,
  error: AlertCircle,
  info: Info,
  warning: AlertTriangle,
};

const variantStyles: Record<ToastVariant, string> = {
  success: 'border-green-500/30 bg-green-500/10',
  error: 'border-red-500/30 bg-red-500/10',
  info: 'border-blue-500/30 bg-blue-500/10',
  warning: 'border-amber-500/30 bg-amber-500/10',
};

const iconStyles: Record<ToastVariant, string> = {
  success: 'text-green-400',
  error: 'text-red-400',
  info: 'text-blue-400',
  warning: 'text-amber-400',
};

function ToastItem({ toast }: { toast: Toast }) {
  const [exiting, setExiting] = useState(false);
  const Icon = icons[toast.variant];

  useEffect(() => {
    const timeout = setTimeout(() => setExiting(true), (toast.duration || 5000) - 300);
    const removeTimeout = setTimeout(() => removeToast(toast.id), toast.duration || 5000);
    return () => {
      clearTimeout(timeout);
      clearTimeout(removeTimeout);
    };
  }, [toast.id, toast.duration]);

  return (
    <div
      className={cn(
        'flex items-start gap-3 rounded-lg border p-4 shadow-lg transition-all duration-300',
        variantStyles[toast.variant],
        exiting ? 'opacity-0 translate-x-4' : 'opacity-100 animate-slide-up'
      )}
    >
      <Icon className={cn('h-5 w-5 mt-0.5 shrink-0', iconStyles[toast.variant])} />
      <p className="text-sm text-white flex-1">{toast.message}</p>
      <button
        onClick={() => removeToast(toast.id)}
        className="shrink-0 rounded p-0.5 text-gray-400 hover:text-white"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

export function ToastContainer() {
  const currentToasts = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  if (currentToasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 w-80">
      {currentToasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} />
      ))}
    </div>
  );
}
