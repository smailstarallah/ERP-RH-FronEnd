// Module Alertes - Exports centralisés

// Pages principales
export { AlertesPage } from './AlertesPage';

// NOUVEAU SYSTÈME WEBSOCKET TEMPS RÉEL
// Types
export type {
    AlerteDTO,
    TypeAlerte,
    StatusAlerte,
    DeleteAlerteMessage,
    StatsUpdateMessage,
    WebSocketMessage,
    ConnectionStatus,
    WebSocketConfig,
    AlerteStats,
    AlerteCallback,
    DeleteCallback,
    StatsCallback
} from './types';

// Service WebSocket principal (singleton)
export { webSocketService } from './services/WebSocketService';

// Hook React principal
export { useAlerts } from './hooks/useAlerts';

// Provider pour l'initialisation
export { WebSocketProvider, useWebSocket } from './contexts/WebSocketProvider';

// Composants d'exemple
export { AlertsDashboard } from './components/AlertsDashboard';

// Page complète avec le nouveau système
export { AlertesPage as AlertesPageWebSocket } from './AlertesPageWebSocket';

// Composants UI (ancien système)
export { AlertCard } from './components/AlertCard';
export { AlertList } from './components/AlertList';
export { AlertesBadge } from './components/AlertesBadge';
export { RealTimeNotifications } from './components/RealTimeNotifications';
export { NotificationToast } from './components/NotificationToast';
export { ToastProvider, useToast } from './components/ToastProvider';
export { ToastManager } from './components/ToastManager';

// Contextes et providers
export { AlertesProvider, useAlertes, useAlertesStats, useAlertesActions } from './contexts/AlertesProvider';

// Hooks
export { useRealTimeAlerts } from './hooks/useRealTimeAlerts';
export { useAlertesWS } from './hooks/useAlertesWS';

// Services
export { alerteWebSocketService } from './services/AlerteWebSocketService';
export { alertesApiService } from './services/alertesApi';

// Utilitaires
export * from './utils/dateUtils';

// Types
export type * from './types';
