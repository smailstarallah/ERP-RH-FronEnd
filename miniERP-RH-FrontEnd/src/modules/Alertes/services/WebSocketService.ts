import { Client } from '@stomp/stompjs';
import type { StompSubscription } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import type {
    WebSocketMessage,
    AlerteDTO,
    DeleteAlerteMessage,
    StatsUpdateMessage,
    ConnectionStatus,
    WebSocketConfig,
    AlerteCallback,
    DeleteCallback,
    StatsCallback
} from '../types';

/**
 * Service WebSocket Singleton pour gérer les connexions STOMP
 * Conforme aux spécifications backend :
 * - Endpoint: /ws
 * - Topics: /topic/alertes/employe/{userId}, /topic/alertes/global, /topic/alertes/stats
 * - Protocole: STOMP sur SockJS
 */
class WebSocketService {
    private static instance: WebSocketService;
    private client: Client | null = null;
    private subscriptions: Map<string, StompSubscription> = new Map();
    private connectionStatus: ConnectionStatus = 'disconnected';
    private reconnectAttempts = 0;
    private reconnectTimer: NodeJS.Timeout | null = null;

    // Configuration par défaut
    private config: WebSocketConfig = {
        url: 'http://localhost:8080/ws',
        reconnectInterval: 3000,
        maxReconnectAttempts: 5,
        heartbeatInterval: 10000
    };

    // Callbacks pour les différents types de messages
    private alerteCallbacks: AlerteCallback[] = [];
    private deleteCallbacks: DeleteCallback[] = [];
    private statsCallbacks: StatsCallback[] = [];
    private connectionCallbacks: ((status: ConnectionStatus) => void)[] = [];

    private constructor() { }

    public static getInstance(): WebSocketService {
        if (!WebSocketService.instance) {
            WebSocketService.instance = new WebSocketService();
        }
        return WebSocketService.instance;
    }

    /**
     * Configure le service avec des paramètres personnalisés
     */
    public configure(config: Partial<WebSocketConfig>): void {
        this.config = { ...this.config, ...config };
    }

    /**
     * Établit la connexion WebSocket
     */
    public connect(): Promise<void> {
        return new Promise((resolve, reject) => {
            if (this.client?.connected) {
                resolve();
                return;
            }

            this.setConnectionStatus('connecting');

            this.client = new Client({
                webSocketFactory: () => new SockJS(this.config.url),
                heartbeatIncoming: this.config.heartbeatInterval,
                heartbeatOutgoing: this.config.heartbeatInterval,
                reconnectDelay: 0, // Nous gérons la reconnexion manuellement
                debug: (str) => {
                    console.log('[WebSocket Debug]', str);
                }
            });

            this.client.onConnect = () => {
                console.log('[WebSocket] Connexion établie');
                this.setConnectionStatus('connected');
                this.reconnectAttempts = 0;
                if (this.reconnectTimer) {
                    clearTimeout(this.reconnectTimer);
                    this.reconnectTimer = null;
                }
                resolve();
            };

            this.client.onStompError = (frame) => {
                console.error('[WebSocket] Erreur STOMP:', frame.headers['message']);
                console.error('[WebSocket] Détails:', frame.body);
                this.setConnectionStatus('error');
                reject(new Error(frame.headers['message'] || 'Erreur de connexion STOMP'));
            };

            this.client.onWebSocketError = (error) => {
                console.error('[WebSocket] Erreur WebSocket:', error);
                this.setConnectionStatus('error');
                this.handleReconnection();
            };

            this.client.onDisconnect = () => {
                console.log('[WebSocket] Connexion fermée');
                this.setConnectionStatus('disconnected');
                this.handleReconnection();
            };

            this.client.activate();
        });
    }

    /**
     * Ferme la connexion WebSocket
     */
    public disconnect(): void {
        if (this.reconnectTimer) {
            clearTimeout(this.reconnectTimer);
            this.reconnectTimer = null;
        }

        this.subscriptions.forEach(subscription => subscription.unsubscribe());
        this.subscriptions.clear();

        if (this.client?.connected) {
            this.client.deactivate();
        }

        this.setConnectionStatus('disconnected');
    }

    /**
     * S'abonne aux notifications personnelles de l'utilisateur
     */
    public subscribeToUserAlerts(userId: number): void {
        if (!this.client?.connected) {
            console.warn('[WebSocket] Tentative d\'abonnement sans connexion active');
            return;
        }

        const topic = `/topic/alertes/employe/${userId}`;

        if (this.subscriptions.has(topic)) {
            console.log(`[WebSocket] Déjà abonné au topic: ${topic}`);
            return;
        }

        const subscription = this.client.subscribe(topic, (message) => {
            try {
                const data = JSON.parse(message.body);
                this.handleUserMessage(data);
            } catch (error) {
                console.error('[WebSocket] Erreur parsing message utilisateur:', error);
            }
        });

        this.subscriptions.set(topic, subscription);
        console.log(`[WebSocket] Abonné au topic: ${topic}`);
    }

    /**
     * S'abonne aux notifications globales (pour managers/admins)
     */
    public subscribeToGlobalAlerts(): void {
        if (!this.client?.connected) {
            console.warn('[WebSocket] Tentative d\'abonnement sans connexion active');
            return;
        }

        const topic = '/topic/alertes/global';

        if (this.subscriptions.has(topic)) {
            console.log(`[WebSocket] Déjà abonné au topic: ${topic}`);
            return;
        }

        const subscription = this.client.subscribe(topic, (message) => {
            try {
                const data = JSON.parse(message.body);
                this.handleGlobalMessage(data);
            } catch (error) {
                console.error('[WebSocket] Erreur parsing message global:', error);
            }
        });

        this.subscriptions.set(topic, subscription);
        console.log(`[WebSocket] Abonné au topic: ${topic}`);
    }

    /**
     * S'abonne aux mises à jour des statistiques
     */
    public subscribeToStatsUpdates(): void {
        if (!this.client?.connected) {
            console.warn('[WebSocket] Tentative d\'abonnement sans connexion active');
            return;
        }

        const topic = '/topic/alertes/stats';

        if (this.subscriptions.has(topic)) {
            console.log(`[WebSocket] Déjà abonné au topic: ${topic}`);
            return;
        }

        const subscription = this.client.subscribe(topic, (message) => {
            try {
                const data = JSON.parse(message.body) as StatsUpdateMessage;
                this.handleStatsMessage(data);
            } catch (error) {
                console.error('[WebSocket] Erreur parsing message stats:', error);
            }
        });

        this.subscriptions.set(topic, subscription);
        console.log(`[WebSocket] Abonné au topic: ${topic}`);
    }

    /**
     * Enregistre un callback pour les nouvelles alertes/mises à jour
     */
    public onAlerte(callback: AlerteCallback): () => void {
        this.alerteCallbacks.push(callback);
        return () => {
            const index = this.alerteCallbacks.indexOf(callback);
            if (index > -1) {
                this.alerteCallbacks.splice(index, 1);
            }
        };
    }

    /**
     * Enregistre un callback pour les suppressions d'alertes
     */
    public onDelete(callback: DeleteCallback): () => void {
        this.deleteCallbacks.push(callback);
        return () => {
            const index = this.deleteCallbacks.indexOf(callback);
            if (index > -1) {
                this.deleteCallbacks.splice(index, 1);
            }
        };
    }

    /**
     * Enregistre un callback pour les mises à jour de statistiques
     */
    public onStatsUpdate(callback: StatsCallback): () => void {
        this.statsCallbacks.push(callback);
        return () => {
            const index = this.statsCallbacks.indexOf(callback);
            if (index > -1) {
                this.statsCallbacks.splice(index, 1);
            }
        };
    }

    /**
     * Enregistre un callback pour les changements de statut de connexion
     */
    public onConnectionStatus(callback: (status: ConnectionStatus) => void): () => void {
        this.connectionCallbacks.push(callback);
        return () => {
            const index = this.connectionCallbacks.indexOf(callback);
            if (index > -1) {
                this.connectionCallbacks.splice(index, 1);
            }
        };
    }

    /**
     * Retourne le statut actuel de la connexion
     */
    public getConnectionStatus(): ConnectionStatus {
        return this.connectionStatus;
    }

    /**
     * Retourne si la connexion est active
     */
    public isConnected(): boolean {
        return this.client?.connected === true;
    }

    // MÉTHODES PRIVÉES

    private handleUserMessage(data: WebSocketMessage): void {
        if (this.isAlerteDTO(data)) {
            this.alerteCallbacks.forEach(callback => callback(data));
        } else if (this.isDeleteMessage(data)) {
            this.deleteCallbacks.forEach(callback => callback(data.alerteId));
        }
    }

    private handleGlobalMessage(data: WebSocketMessage): void {
        // Même logique que les messages utilisateur pour les alertes WARNING/ERROR
        if (this.isAlerteDTO(data)) {
            this.alerteCallbacks.forEach(callback => callback(data));
        } else if (this.isDeleteMessage(data)) {
            this.deleteCallbacks.forEach(callback => callback(data.alerteId));
        }
    }

    private handleStatsMessage(data: StatsUpdateMessage): void {
        this.statsCallbacks.forEach(callback => callback(data.userId));
    }

    private setConnectionStatus(status: ConnectionStatus): void {
        if (this.connectionStatus !== status) {
            this.connectionStatus = status;
            this.connectionCallbacks.forEach(callback => callback(status));
        }
    }

    private handleReconnection(): void {
        if (this.reconnectAttempts < this.config.maxReconnectAttempts) {
            this.reconnectAttempts++;
            console.log(`[WebSocket] Tentative de reconnexion ${this.reconnectAttempts}/${this.config.maxReconnectAttempts}`);

            this.reconnectTimer = setTimeout(() => {
                this.connect().catch(error => {
                    console.error('[WebSocket] Échec de reconnexion:', error);
                });
            }, this.config.reconnectInterval);
        } else {
            console.error('[WebSocket] Nombre maximum de tentatives de reconnexion atteint');
            this.setConnectionStatus('error');
        }
    }

    // Type guards pour identifier les types de messages
    private isAlerteDTO(data: any): data is AlerteDTO {
        return data && typeof data.id === 'number' && typeof data.message === 'string' &&
            ['INFO', 'WARNING', 'ERROR'].includes(data.type) &&
            ['UNREAD', 'READ'].includes(data.status);
    }

    private isDeleteMessage(data: any): data is DeleteAlerteMessage {
        return data && data.action === 'DELETE' && typeof data.alerteId === 'number';
    }
}

// Export de l'instance singleton
export const webSocketService = WebSocketService.getInstance();
