import { useState, useRef } from 'react';
import type { AlerteDTO } from '../types';

interface ToastNotification extends AlerteDTO {
    id: number;
    showToast?: boolean;
    toastId?: string;
}

/**
 * Hook pour gérer les notifications toast des nouvelles alertes
 */
export const useNotificationToasts = () => {
    const [toastAlerts, setToastAlerts] = useState<ToastNotification[]>([]);
    const previousAlertsRef = useRef<AlerteDTO[]>([]);

    // Fonction pour ajouter une nouvelle notification toast
    const addToast = (alert: AlerteDTO) => {
        const toastId = `toast-${alert.id}-${Date.now()}`;
        const toastAlert: ToastNotification = {
            ...alert,
            showToast: true,
            toastId
        };

        setToastAlerts(prev => [toastAlert, ...prev].slice(0, 3)); // Max 3 toasts

        // Auto-remove après 5 secondes
        setTimeout(() => {
            removeToast(toastId);
        }, 5000);
    };

    // Fonction pour supprimer un toast
    const removeToast = (toastId: string) => {
        setToastAlerts(prev => prev.filter(toast => toast.toastId !== toastId));
    };

    // Fonction pour marquer un toast comme lu
    const markToastAsRead = (toastId: string, markAsReadFn: (id: number) => Promise<void>) => {
        const toast = toastAlerts.find(t => t.toastId === toastId);
        if (toast) {
            markAsReadFn(toast.id);
            removeToast(toastId);
        }
    };

    // Détecter les nouvelles alertes et créer des toasts
    const detectNewAlerts = (currentAlerts: AlerteDTO[]) => {
        const previousAlerts = previousAlertsRef.current;

        // Trouver les nouvelles alertes non lues
        const newAlerts = currentAlerts.filter(current =>
            current.status === 'UNREAD' &&
            !previousAlerts.some(prev => prev.id === current.id)
        );

        // Créer des toasts pour les nouvelles alertes
        newAlerts.forEach(alert => {
            // Ne pas créer de toast si c'est le premier chargement avec beaucoup d'alertes
            if (previousAlerts.length > 0 || currentAlerts.length <= 3) {
                addToast(alert);
            }
        });

        // Mettre à jour la référence
        previousAlertsRef.current = [...currentAlerts];
    };

    return {
        toastAlerts,
        addToast,
        removeToast,
        markToastAsRead,
        detectNewAlerts
    };
};
