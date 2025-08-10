"use client";

import React, { useState, useEffect } from 'react';
import type { ReactNode } from 'react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
}

// Global toast state
let toastState: Toast[] = [];
let toastListeners: Array<(toasts: Toast[]) => void> = [];

// Global functions to manage toasts
const addToast = (toast: Omit<Toast, 'id'>) => {
  const id = Math.random().toString(36).substring(2, 11);
  const newToast: Toast = { ...toast, id };
  
  toastState = [...toastState, newToast];
  toastListeners.forEach(listener => listener([...toastState]));
  
  // Auto remove after 5 seconds
  setTimeout(() => {
    removeToast(id);
  }, 5000);
};

const removeToast = (id: string) => {
  toastState = toastState.filter(t => t.id !== id);
  toastListeners.forEach(listener => listener([...toastState]));
};

// Simple hook that just returns the toast function
export function useToast() {
  return {
    toast: (params: Omit<Toast, 'id'>) => {
      addToast(params);
    }
  };
}

// Component that renders toasts
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    const listener = (newToasts: Toast[]) => {
      setToasts(newToasts);
    };
    
    toastListeners.push(listener);
    
    return () => {
      toastListeners = toastListeners.filter(l => l !== listener);
    };
  }, []);

  return (
    <>
      {children}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {toasts.map(toastItem => (
          <div
            key={toastItem.id}
            className={`
              max-w-sm p-4 rounded-lg shadow-lg border transition-all transform
              ${toastItem.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' : ''}
              ${toastItem.type === 'error' ? 'bg-red-50 border-red-200 text-red-800' : ''}
              ${toastItem.type === 'warning' ? 'bg-yellow-50 border-yellow-200 text-yellow-800' : ''}
              ${toastItem.type === 'info' ? 'bg-blue-50 border-blue-200 text-blue-800' : ''}
            `}
          >
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-medium">{toastItem.title}</h4>
                {toastItem.description && (
                  <p className="text-sm mt-1 opacity-90">{toastItem.description}</p>
                )}
              </div>
              <button
                onClick={() => removeToast(toastItem.id)}
                className="ml-3 text-current opacity-50 hover:opacity-75"
              >
                ×
              </button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}