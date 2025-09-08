import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { NotificationToast } from './NotificationToast';
import type { Alerte } from '../types';

interface Toast {
  id: string;
  alert: Alerte;
  autoHideDuration?: number;
}

interface ToastContextType {
  showToast: (alert: Alerte, autoHideDuration?: number) => void;
  hideToast: (id: string) => void;
  clearAllToasts: () => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

interface ToastProviderProps {
  children: ReactNode;
  maxToasts?: number;
  defaultDuration?: number;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
}

export const ToastProvider: React.FC<ToastProviderProps> = ({
  children,
  maxToasts = 5,
  defaultDuration = 5000,
  position = 'top-right'
}) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((alert: Alerte, autoHideDuration = defaultDuration) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newToast: Toast = { id, alert, autoHideDuration };

    setToasts(prev => {
      const updated = [newToast, ...prev];
      return updated.slice(0, maxToasts);
    });
  }, [maxToasts, defaultDuration]);

  const hideToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const clearAllToasts = useCallback(() => {
    setToasts([]);
  }, []);

  const positionClasses = {
    'top-right': 'fixed top-4 right-4 z-50',
    'top-left': 'fixed top-4 left-4 z-50',
    'bottom-right': 'fixed bottom-4 right-4 z-50',
    'bottom-left': 'fixed bottom-4 left-4 z-50'
  };

  return (
    <ToastContext.Provider value={{ showToast, hideToast, clearAllToasts }}>
      {children}
      <div className={positionClasses[position]}>
        <div className="flex flex-col gap-2 max-w-sm">
          {toasts.map(toast => (
            <NotificationToast
              key={toast.id}
              alert={toast.alert}
              onDismiss={() => hideToast(toast.id)}
              onMarkAsRead={() => {
                // Ici vous pouvez ajouter la logique pour marquer comme lu
                hideToast(toast.id);
              }}
              autoHideDuration={toast.autoHideDuration}
              position={position}
            />
          ))}
        </div>
      </div>
    </ToastContext.Provider>
  );
};