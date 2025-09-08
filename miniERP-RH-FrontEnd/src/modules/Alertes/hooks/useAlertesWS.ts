import { useState, useEffect, useCallback } from 'react';
import { alerteWebSocketService } from '../services/AlerteWebSocketService';
import type { Alerte, WebSocketMessage, ConnectionStatus } from '../types';

interface UseAlertesWSReturn {
  isConnected: boolean;
  connectionStatus: ConnectionStatus;
  lastMessage: WebSocketMessage | null;
  newAlerts: Alerte[];
  clearNewAlerts: () => void;
  sendMessage: (message: WebSocketMessage) => void;
  reconnect: () => void;
  disconnect: () => void;
}

/**
 * Hook pour gérer la connexion WebSocket des alertes
 */
export function useAlertesWS(employeId: string, userRole: string = 'EMPLOYEE'): UseAlertesWSReturn {
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('disconnected');
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);
  const [newAlerts, setNewAlerts] = useState<Alerte[]>([]);

  const clearNewAlerts = useCallback(() => {
    setNewAlerts([]);
  }, []);

  const sendMessage = useCallback((message: WebSocketMessage) => {
    if (isConnected) {
      alerteWebSocketService.sendMessage(message);
    }
  }, [isConnected]);

  const reconnect = useCallback(() => {
    alerteWebSocketService.disconnect();
    alerteWebSocketService.connect(employeId, userRole);
  }, [employeId, userRole]);

  const disconnect = useCallback(() => {
    alerteWebSocketService.disconnect();
  }, []);

  useEffect(() => {
    const handleConnect = () => {
      setIsConnected(true);
      setConnectionStatus('connected');
    };

    const handleDisconnect = () => {
      setIsConnected(false);
      setConnectionStatus('disconnected');
    };

    const handleConnecting = () => {
      setConnectionStatus('connecting');
    };

    const handleError = (error: any) => {
      setIsConnected(false);
      setConnectionStatus('error');
      console.error('WebSocket error:', error);
    };

    const handleMessage = (message: WebSocketMessage) => {
      setLastMessage(message);
      
      if (message.type === 'NOUVELLE_ALERTE' && message.data) {
        setNewAlerts(prev => [message.data, ...prev]);
      }
    };

    // S'abonner aux événements
    alerteWebSocketService.on('connect', handleConnect);
    alerteWebSocketService.on('disconnect', handleDisconnect);
    alerteWebSocketService.on('connecting', handleConnecting);
    alerteWebSocketService.on('error', handleError);
    alerteWebSocketService.on('message', handleMessage);

    // Se connecter au montage
    alerteWebSocketService.connect(employeId, userRole);

    return () => {
      // Nettoyer les listeners
      alerteWebSocketService.off('connect', handleConnect);
      alerteWebSocketService.off('disconnect', handleDisconnect);
      alerteWebSocketService.off('connecting', handleConnecting);
      alerteWebSocketService.off('error', handleError);
      alerteWebSocketService.off('message', handleMessage);
    };
  }, [employeId, userRole]);

  return {
    isConnected,
    connectionStatus,
    lastMessage,
    newAlerts,
    clearNewAlerts,
    sendMessage,
    reconnect,
    disconnect
  };
}