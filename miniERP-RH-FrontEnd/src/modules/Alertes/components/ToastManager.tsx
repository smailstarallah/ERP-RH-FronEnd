import React from 'react';
import { ToastProvider } from './ToastProvider';

interface ToastManagerProps {
  userId: string;
  maxToasts?: number;
  toastDuration?: number;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
}

/**
 * ToastManager - Gestionnaire global des toasts
 * Ce composant wraps ToastProvider pour une utilisation simple depuis App.tsx
 */
export const ToastManager: React.FC<ToastManagerProps> = ({
  userId,
  maxToasts = 5,
  toastDuration = 5000,
  position = 'top-right'
}) => {
  return (
    <ToastProvider
      maxToasts={maxToasts}
      defaultDuration={toastDuration}
      position={position}
    >
      {/* Le ToastProvider gère automatiquement l'affichage des toasts */}
      <div />
    </ToastProvider>
  );
};
