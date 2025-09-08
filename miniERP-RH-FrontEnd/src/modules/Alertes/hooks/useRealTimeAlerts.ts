import { useState, useEffect, useCallback } from 'react';
import { alerteWebSocketService } from '../services/AlerteWebSocketService';
import type { Alerte, WebSocketMessage } from '../types';

interface UseRealTimeAlertsReturn {
  isConnected: boolean;
  connectionStatus: string;
  newAlert: Alerte | null;
  showToast: boolean;
  hideToast: () => void;
  reconnect: () => void;
}

export function useRealTimeAlerts(userId: string, userRole: string = 'EMPLOYEE'): UseRealTimeAlertsReturn {
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('Déconnecté');
  const [newAlert, setNewAlert] = useState<Alerte | null>(null);
  const [showToast, setShowToast] = useState(false);

  const hideToast = useCallback(() => {
    setShowToast(false);
    setNewAlert(null);
  }, []);

  const reconnect = useCallback(() => {
    alerteWebSocketService.disconnect();
    alerteWebSocketService.connect(userId, userRole);
  }, [userId, userRole]);

  useEffect(() => {
    // Gestion des événements de connexion
    const handleConnect = () => {
      setIsConnected(true);
      setConnectionStatus('Connecté');
    };

    const handleDisconnect = () => {
      setIsConnected(false);
      setConnectionStatus('Déconnecté');
    };

    const handleError = () => {
      setIsConnected(false);
      setConnectionStatus('Erreur de connexion');
    };

    const handleMessage = (message: WebSocketMessage) => {
      if (message.type === 'NOUVELLE_ALERTE' && message.data) {
        setNewAlert(message.data);
        setShowToast(true);
        
        // Auto-hide toast après 5 secondes
        setTimeout(() => {
          setShowToast(false);
        }, 5000);
      }
    };

    // S'abonner aux événements
    alerteWebSocketService.on('connect', handleConnect);
    alerteWebSocketService.on('disconnect', handleDisconnect);
    alerteWebSocketService.on('error', handleError);
    alerteWebSocketService.on('message', handleMessage);

    // Se connecter
    alerteWebSocketService.connect(userId, userRole);

    return () => {
      // Nettoyer les listeners
      alerteWebSocketService.off('connect', handleConnect);
      alerteWebSocketService.off('disconnect', handleDisconnect);
      alerteWebSocketService.off('error', handleError);
      alerteWebSocketService.off('message', handleMessage);
    };
  }, [userId, userRole]);

  return {
    isConnected,
    connectionStatus,
    newAlert,
    showToast,
    hideToast,
    reconnect
  };
}
