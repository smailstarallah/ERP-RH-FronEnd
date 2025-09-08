import React, { createContext, useContext, useEffect, useState } from 'react';
import { webSocketService } from '../services/WebSocketService';
import type { ConnectionStatus } from '../types';

interface WebSocketContextType {
    connectionStatus: ConnectionStatus;
    isConnected: boolean;
    connect: () => Promise<void>;
    disconnect: () => void;
}

const WebSocketContext = createContext<WebSocketContextType | null>(null);

/**
 * Provider WebSocket pour initialiser la connexion au niveau de l'application
 * Ce composant doit entourer les composants qui utilisent les alertes temps réel
 */
export const WebSocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('disconnected');

    useEffect(() => {
        // Configurer le service avec l'URL du backend
        webSocketService.configure({
            url: 'http://localhost:8080/ws',
            reconnectInterval: 3000,
            maxReconnectAttempts: 10,
            heartbeatInterval: 10000
        });

        // S'abonner aux changements de statut
        const unsubscribe = webSocketService.onConnectionStatus(setConnectionStatus);

        // Nettoyage au démontage
        return () => {
            unsubscribe();
        };
    }, []);

    const connect = async () => {
        try {
            await webSocketService.connect();
        } catch (error) {
            console.error('Erreur de connexion WebSocket:', error);
        }
    };

    const disconnect = () => {
        webSocketService.disconnect();
    };

    const value: WebSocketContextType = {
        connectionStatus,
        isConnected: connectionStatus === 'connected',
        connect,
        disconnect
    };

    return (
        <WebSocketContext.Provider value={value}>
            {children}
        </WebSocketContext.Provider>
    );
};

/**
 * Hook pour utiliser le contexte WebSocket
 */
export const useWebSocket = () => {
    const context = useContext(WebSocketContext);
    if (!context) {
        throw new Error('useWebSocket must be used within a WebSocketProvider');
    }
    return context;
};
