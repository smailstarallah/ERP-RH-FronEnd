import { useState, useEffect, useCallback, useRef } from 'react';
import { webSocketService } from '../services/WebSocketService';
import type {
    AlerteDTO,
    ConnectionStatus
} from '../types';

/**
 * Hook React personnalisé pour gérer les alertes en temps réel
 * 
 * Ce hook :
 * 1. Gère l'état local des alertes et statistiques
 * 2. Se connecte automatiquement au WebSocket
 * 3. S'abonne aux topics appropriés selon le rôle utilisateur
 * 4. Met à jour l'état en réponse aux notifications WebSocket
 * 5. Expose des fonctions pour les actions REST (markAsRead, deleteAlert)
 */
export const useAlerts = () => {
    // État local
    const [alerts, setAlerts] = useState<AlerteDTO[]>([]);
    const [unreadCount, setUnreadCount] = useState<number>(0);
    const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('disconnected');
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    // Refs pour éviter les re-renders inutiles
    const userIdRef = useRef<number | null>(null);
    const isManagerRef = useRef<boolean>(false);
    const isInitializedRef = useRef<boolean>(false);

    // Configuration API
    const API_BASE_URL = 'http://localhost:8080';

    /**
     * Récupère les informations utilisateur depuis localStorage
     */
    const getUserInfo = useCallback(() => {
        try {
            const userData = localStorage.getItem('userData');
            const userRole = localStorage.getItem('userRole') || 'EMPLOYEE';

            if (userData) {
                const parsedData = JSON.parse(userData);
                userIdRef.current = parsedData.id;
                isManagerRef.current = ['MANAGER', 'ADMIN'].includes(userRole.toUpperCase());
                return { userId: parsedData.id, isManager: isManagerRef.current };
            }
        } catch (error) {
            console.error('[useAlerts] Erreur parsing userData:', error);
        }

        // Valeurs par défaut
        userIdRef.current = 1;
        isManagerRef.current = false;
        return { userId: 1, isManager: false };
    }, []);

    /**
     * Effectue un appel API avec gestion d'erreurs
     */
    const apiCall = useCallback(async (url: string, options: RequestInit = {}) => {
        const token = localStorage.getItem('token');

        const response = await fetch(`${API_BASE_URL}${url}`, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...(token && { 'Authorization': `Bearer ${token}` }),
                ...options.headers,
            },
        });

        if (!response.ok) {
            throw new Error(`API Error: ${response.status} ${response.statusText}`);
        }

        return response.json();
    }, []);

    /**
     * Charge la liste initiale des alertes depuis l'API REST
     */
    const loadInitialAlerts = useCallback(async (userId: number) => {
        try {
            setLoading(true);
            setError(null);

            const data = await apiCall(`/api/alertes/employe/${userId}`);

            // Supposons que l'API retourne un tableau d'AlerteDTO
            if (Array.isArray(data)) {
                setAlerts(data);
                const unread = data.filter(alert => alert.status === 'UNREAD').length;
                setUnreadCount(unread);
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Erreur lors du chargement des alertes';
            console.error('[useAlerts] Erreur chargement initial:', errorMessage);
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    }, [apiCall]);

    /**
     * Charge les statistiques depuis l'API REST
     */
    const loadStats = useCallback(async (userId: number) => {
        try {
            const count = await apiCall(`/api/alertes/employe/${userId}/non-lues/count`);
            setUnreadCount(typeof count === 'number' ? count : 0);
        } catch (error) {
            console.error('[useAlerts] Erreur chargement stats:', error);
        }
    }, [apiCall]);

    /**
     * Marque une alerte comme lue via l'API REST
     * L'UI se mettra à jour automatiquement via la notification WebSocket
     */
    const markAsRead = useCallback(async (alerteId: number) => {
        try {
            await apiCall(`/api/alertes/${alerteId}/lu`, {
                method: 'PUT',
            });
            // Ne pas mettre à jour l'état local - attendre la notification WebSocket
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Erreur lors du marquage comme lu';
            console.error('[useAlerts] Erreur markAsRead:', errorMessage);
            setError(errorMessage);
            throw error; // Re-lancer pour que l'UI puisse gérer l'erreur
        }
    }, [apiCall]);

    /**
     * Supprime une alerte via l'API REST
     * L'UI se mettra à jour automatiquement via la notification WebSocket
     */
    const deleteAlert = useCallback(async (alerteId: number) => {
        try {
            await apiCall(`/api/alertes/${alerteId}`, {
                method: 'DELETE',
            });
            // Ne pas mettre à jour l'état local - attendre la notification WebSocket
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Erreur lors de la suppression';
            console.error('[useAlerts] Erreur deleteAlert:', errorMessage);
            setError(errorMessage);
            throw error; // Re-lancer pour que l'UI puisse gérer l'erreur
        }
    }, [apiCall]);

    /**
     * Rafraîchit manuellement les données
     */
    const refresh = useCallback(async () => {
        if (userIdRef.current) {
            await Promise.all([
                loadInitialAlerts(userIdRef.current),
                loadStats(userIdRef.current)
            ]);
        }
    }, [loadInitialAlerts, loadStats]);

    // Gestionnaire pour les nouvelles alertes/mises à jour reçues via WebSocket
    const handleNewAlert = useCallback((alerte: AlerteDTO) => {
        setAlerts(prevAlerts => {
            const existingIndex = prevAlerts.findIndex(alert => alert.id === alerte.id);

            if (existingIndex >= 0) {
                // Mise à jour d'une alerte existante
                const updatedAlerts = [...prevAlerts];
                updatedAlerts[existingIndex] = alerte;
                return updatedAlerts;
            } else {
                // Nouvelle alerte
                return [alerte, ...prevAlerts];
            }
        });

        // Mettre à jour le compteur
        setUnreadCount(prevCount => {
            // Recalculer à partir de l'état mis à jour
            setAlerts(currentAlerts => {
                const unread = currentAlerts.filter(alert =>
                    alert.id === alerte.id ? alerte.status === 'UNREAD' : alert.status === 'UNREAD'
                ).length;
                setUnreadCount(unread);
                return currentAlerts;
            });
            return prevCount;
        });
    }, []);

    // Gestionnaire pour les suppressions d'alertes reçues via WebSocket
    const handleDeleteAlert = useCallback((alerteId: number) => {
        setAlerts(prevAlerts => {
            const filteredAlerts = prevAlerts.filter(alert => alert.id !== alerteId);

            // Recalculer le compteur après suppression
            const unread = filteredAlerts.filter(alert => alert.status === 'UNREAD').length;
            setUnreadCount(unread);

            return filteredAlerts;
        });
    }, []);

    // Gestionnaire pour les mises à jour de statistiques reçues via WebSocket
    const handleStatsUpdate = useCallback((userId: number) => {
        // Ne recharger que si c'est pour l'utilisateur actuel
        if (userIdRef.current === userId) {
            loadStats(userId);
        }
    }, [loadStats]);

    // Effet principal : initialisation et gestion des connexions
    useEffect(() => {
        if (isInitializedRef.current) return;

        const { userId, isManager } = getUserInfo();

        const initializeWebSocket = async () => {
            try {
                // Charger les données initiales
                await loadInitialAlerts(userId);

                // Se connecter au WebSocket
                await webSocketService.connect();

                // S'abonner aux topics appropriés
                webSocketService.subscribeToUserAlerts(userId);
                webSocketService.subscribeToStatsUpdates();

                if (isManager) {
                    webSocketService.subscribeToGlobalAlerts();
                }

                // Enregistrer les callbacks
                const unsubscribeAlert = webSocketService.onAlerte(handleNewAlert);
                const unsubscribeDelete = webSocketService.onDelete(handleDeleteAlert);
                const unsubscribeStats = webSocketService.onStatsUpdate(handleStatsUpdate);
                const unsubscribeConnection = webSocketService.onConnectionStatus(setConnectionStatus);

                isInitializedRef.current = true;

                // Cleanup au démontage
                return () => {
                    unsubscribeAlert();
                    unsubscribeDelete();
                    unsubscribeStats();
                    unsubscribeConnection();
                    webSocketService.disconnect();
                    isInitializedRef.current = false;
                };
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Erreur d\'initialisation WebSocket';
                console.error('[useAlerts] Erreur initialisation:', errorMessage);
                setError(errorMessage);
                setLoading(false);
            }
        };

        const cleanup = initializeWebSocket();

        return () => {
            cleanup.then(cleanupFn => cleanupFn?.());
        };
    }, []); // Dépendances vides pour n'exécuter qu'une fois

    // Effet pour surveiller les changements de statut de connexion
    useEffect(() => {
        const currentStatus = webSocketService.getConnectionStatus();
        setConnectionStatus(currentStatus);
    }, []);

    return {
        // État
        alerts,
        unreadCount,
        connectionStatus,
        loading,
        error,

        // Actions
        markAsRead,
        deleteAlert,
        refresh,

        // Informations de connexion
        isConnected: connectionStatus === 'connected',
        isReconnecting: connectionStatus === 'connecting',
    };
};
