// src/modules/Alertes/services/AlerteWebSocketService.ts
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

// Configuration temporaire inline pour éviter les problèmes d'import
const config = {
  websocket: {
    url: 'http://localhost:8080/ws/alertes',
    reconnectInterval: 3000,
    maxReconnectAttempts: 5,
    heartbeatInterval: 30000,
    connectionTimeout: 10000
  },
  topics: {
    global: '/topic/alertes/global',
    user: '/topic/alertes/user',
    employe: '/topic/alertes/employe'
  },
  destinations: {
    nouvelleAlerte: '/app/nouvelle-alerte',
    marquerLu: '/app/marquer-lu'
  }
};

export interface AlerteMessage {
  id: string;
  titre: string;
  message: string;
  type: 'INFO' | 'WARNING' | 'ERROR' | 'SUCCESS';
  status: 'READ' | 'UNREAD';
  userId?: string;
  employeId?: string;
  dateCreation: string;
  moduleOrigine?: string;
}

export type AlerteEventType = 'ALL_ALERTS' | 'STATS_UPDATE' | 'USER_ALERT' | 'GLOBAL_ALERT' | 'NOTIFICATION_CLICK';

class AlerteWebSocketService {
  private client: Client | null = null;
  private connected: boolean = false;
  private subscriptions = new Map<string, any>();
  private messageHandlers = new Map<AlerteEventType, ((data: any) => void)[]>();
  private eventListeners = new Map<string, ((data: any) => void)[]>(); // Nouveau: pour les événements génériques
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 10;

  // 🔌 Connexion automatique au WebSocket
  async connect(userId?: string, userRole?: string): Promise<any> {
    return new Promise((resolve, reject) => {
      console.log('🔌 Connexion WebSocket pour synchronisation alertes...', { userId, userRole });

      this.client = new Client({
        webSocketFactory: () => new SockJS(config.websocket.url),

        debug: (str) => console.log('📡 STOMP:', str),

        onConnect: (frame) => {
          console.log('✅ WebSocket connecté pour alertes!');
          this.connected = true;
          this.reconnectAttempts = 0;

          // Émettre l'événement de connexion
          this.emit('connect', frame);

          // Auto-abonnement aux topics essentiels
          this.setupAutoSubscriptions();
          resolve(frame);
        },

        onStompError: (frame) => {
          console.error('❌ Erreur WebSocket alertes:', frame);
          this.connected = false;
          this.emit('error', frame);
          reject(frame);
        },

        onDisconnect: () => {
          console.log('🔌 WebSocket alertes déconnecté');
          this.connected = false;
          this.emit('disconnect');
        },

        reconnectDelay: 5000,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,
      });

      this.client.activate();
    });
  }

  // 📡 Configuration automatique des abonnements essentiels
  private setupAutoSubscriptions(): void {
    console.log('📋 Configuration des abonnements automatiques...');
    
    // Topic global pour toutes les alertes
    this.subscribeToTopic(config.topics.global, (alerte) => {
      console.log('🌐 Nouvelle alerte globale:', alerte);
      this.emit('message', {
        type: 'NOUVELLE_ALERTE',
        data: alerte,
        source: 'global'
      });
    });

    console.log('✅ Abonnements automatiques configurés');
  }

  // 👤 S'abonner aux alertes d'un utilisateur spécifique
  subscribeToUserAlerts(userId: string, onNewAlert?: (alerte: AlerteMessage) => void): any {
    if (!userId) {
      console.error('❌ UserID requis pour l\'abonnement');
      return null;
    }

    // Convertir en Long pour correspondre au backend
    const userIdLong = parseInt(userId);
    if (isNaN(userIdLong)) {
      console.error('❌ UserID doit être un nombre valide');
      return null;
    }

    const topic = `${config.topics.employe}/${userIdLong}`;
    console.log(`📥 Abonnement alertes utilisateur: ${topic}`);

    return this.subscribeToTopic(topic, (alerte: AlerteMessage) => {
      console.log('🚨 Nouvelle alerte personnelle:', alerte);

      // Émettre l'événement pour le hook useRealTimeAlerts
      this.emit('message', {
        type: 'NOUVELLE_ALERTE',
        data: alerte,
        source: 'user'
      });

      // Callback personnalisé
      if (onNewAlert && typeof onNewAlert === 'function') {
        onNewAlert(alerte);
      }

      // Handler générique
      this.triggerHandler('USER_ALERT', alerte);
    });
  }

  // 🌐 S'abonner aux alertes globales (managers/RH)
  subscribeToGlobalAlerts(onGlobalAlert?: (alerte: AlerteMessage) => void): any {
    const topic = '/topic/alertes/global';
    console.log(`📥 Abonnement alertes globales: ${topic}`);

    return this.subscribeToTopic(topic, (alerte: AlerteMessage) => {
      console.log('🚨 Nouvelle alerte globale:', alerte);

      this.showNotification(alerte, true);

      if (onGlobalAlert && typeof onGlobalAlert === 'function') {
        onGlobalAlert(alerte);
      }

      this.triggerHandler('GLOBAL_ALERT', alerte);
    });
  }

  // 📡 Méthode générique d'abonnement
  private subscribeToTopic(topic: string, handler: (data: any) => void): any {
    if (!this.connected) {
      console.error('❌ WebSocket non connecté');
      return null;
    }

    try {
      const subscription = this.client!.subscribe(topic, (message) => {
        try {
          const data = JSON.parse(message.body);
          
          // Émettre l'événement message générique
          this.emit('message', { type: topic.includes('stats') ? 'STATS_UPDATE' : 'NOUVELLE_ALERTE', data });
          
          handler(data);
        } catch (parseError) {
          console.error('❌ Erreur parsing message:', parseError);
        }
      });

      this.subscriptions.set(topic, subscription);
      console.log(`✅ Abonné au topic: ${topic}`);
      return subscription;

    } catch (error) {
      console.error(`❌ Erreur abonnement ${topic}:`, error);
      return null;
    }
  }

  // 🔔 Affichage des notifications navigateur
  private showNotification(alerte: AlerteMessage, isGlobal: boolean = false): void {
    if (Notification.permission === 'granted') {
      const options: NotificationOptions = {
        body: alerte.message,
        icon: '/favicon.ico',
        tag: `alerte-${alerte.id}`,
        requireInteraction: alerte.type === 'ERROR',
        actions: [
          { action: 'view', title: 'Voir' },
          { action: 'dismiss', title: 'Ignorer' }
        ]
      };

      const notification = new Notification(
        `${isGlobal ? '[GLOBAL] ' : ''}${alerte.titre}`,
        options
      );

      // Auto-fermeture pour les infos
      if (alerte.type === 'INFO') {
        setTimeout(() => notification.close(), 5000);
      }

      // Gestion des clics
      notification.onclick = () => {
        this.triggerHandler('NOTIFICATION_CLICK', alerte);
        window.focus();
        notification.close();
      };
    }
  }

  // 🎯 Gestion des handlers d'événements
  onMessage(eventType: AlerteEventType, handler: (data: any) => void): void {
    if (!this.messageHandlers.has(eventType)) {
      this.messageHandlers.set(eventType, []);
    }
    this.messageHandlers.get(eventType)!.push(handler);
  }

  private triggerHandler(eventType: AlerteEventType, data: any): void {
    const handlers = this.messageHandlers.get(eventType);
    if (handlers) {
      handlers.forEach(handler => {
        try {
          handler(data);
        } catch (error) {
          console.error(`❌ Erreur handler ${eventType}:`, error);
        }
      });
    }
  }

  // 📤 Envoyer un message (optionnel)
  sendMessage(destination: string, message: any): boolean {
    if (!this.connected) {
      console.error('❌ Impossible d\'envoyer: WebSocket non connecté');
      return false;
    }

    try {
      this.client!.publish({
        destination,
        body: JSON.stringify(message)
      });
      return true;
    } catch (error) {
      console.error('❌ Erreur envoi message:', error);
      return false;
    }
  }

  // 🚀 Créer une nouvelle alerte via WebSocket
  async creerAlerteWebSocket(alerteData: any): Promise<boolean> {
    try {
      if (!this.isConnected()) {
        console.error('❌ Pas de connexion WebSocket pour créer l\'alerte');
        return false;
      }

      // Adapter les données pour le backend
      const backendData = {
        titre: alerteData.titre,
        message: alerteData.message || alerteData.contenu,
        type: alerteData.type?.toUpperCase() || 'INFO',
        status: 'unread'.toUpperCase(),
        userId: parseInt(alerteData.userId || alerteData.employeId || '0'),
        employeId: parseInt(alerteData.employeId || alerteData.userId || '0')
      };

      console.log('🚀 Envoi nouvelle alerte via WebSocket:', backendData);
      
      this.client!.publish({
        destination: config.destinations.nouvelleAlerte,
        body: JSON.stringify(backendData)
      });
      
      return true;
    } catch (error) {
      console.error('❌ Erreur création alerte WebSocket:', error);
      return false;
    }
  }

  // ✅ Marquer comme lue via WebSocket
  async marquerCommeLueWebSocket(alerteId: string): Promise<boolean> {
    try {
      if (!this.isConnected()) {
        console.error('❌ Pas de connexion WebSocket pour marquer comme lue');
        return false;
      }

      const alerteIdLong = parseInt(alerteId);
      if (isNaN(alerteIdLong)) {
        console.error('❌ AlerteId doit être un nombre valide');
        return false;
      }

      console.log('✅ Marquage comme lue via WebSocket:', alerteIdLong);
      
      this.client!.publish({
        destination: config.destinations.marquerLu,
        body: JSON.stringify(alerteIdLong)
      });
      
      return true;
    } catch (error) {
      console.error('❌ Erreur marquage WebSocket:', error);
      return false;
    }
  }

  // 🔌 Déconnexion propre
  disconnect(): void {
    console.log('🔌 Déconnexion WebSocket alertes...');

    this.subscriptions.forEach((subscription, topic) => {
      try {
        subscription.unsubscribe();
        console.log(`📤 Désabonné de: ${topic}`);
      } catch (error) {
        console.error(`❌ Erreur désabonnement ${topic}:`, error);
      }
    });

    this.subscriptions.clear();
    this.messageHandlers.clear();

    if (this.client) {
      this.client.deactivate();
      this.client = null;
    }

    this.connected = false;
    console.log('✅ WebSocket alertes déconnecté');
  }

  // 📊 État de la connexion
  isConnected(): boolean {
    return this.connected && this.client !== null && this.client.connected;
  }

  getStats(): { connected: boolean; subscriptions: number; handlers: number; reconnectAttempts: number } {
    return {
      connected: this.connected,
      subscriptions: this.subscriptions.size,
      handlers: this.messageHandlers.size,
      reconnectAttempts: this.reconnectAttempts
    };
  }

  // 🎧 Méthodes d'événements génériques (pour compatibilité avec les hooks)
  on(eventType: string, handler: (data?: any) => void): void {
    if (!this.eventListeners.has(eventType)) {
      this.eventListeners.set(eventType, []);
    }
    this.eventListeners.get(eventType)!.push(handler);
  }

  off(eventType: string, handler: (data?: any) => void): void {
    const handlers = this.eventListeners.get(eventType);
    if (handlers) {
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    }
  }

  private emit(eventType: string, data?: any): void {
    const handlers = this.eventListeners.get(eventType);
    if (handlers) {
      handlers.forEach(handler => {
        try {
          handler(data);
        } catch (error) {
          console.error(`❌ Erreur émission événement ${eventType}:`, error);
        }
      });
    }
  }
}

// Instance singleton
export const alerteWebSocketService = new AlerteWebSocketService();
export default AlerteWebSocketService;
