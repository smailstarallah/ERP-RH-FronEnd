// Types strictement conformes aux spécifications backend WebSocket
export type TypeAlerte = 'INFO' | 'WARNING' | 'ERROR';
export type StatusAlerte = 'UNREAD' | 'READ';

// DTO Backend - Structure EXACTE selon les spécifications WebSocket
export interface AlerteDTO {
  id: number;
  message: string;
  type: TypeAlerte;
  status: StatusAlerte;
  timestamp: string; // Format ISO (ex: "2025-09-08T14:30:00Z")
  userId: number;
}

// Message de suppression d'alerte via WebSocket
export interface DeleteAlerteMessage {
  action: 'DELETE';
  alerteId: number;
}

// Message de mise à jour des statistiques via WebSocket
export interface StatsUpdateMessage {
  type: 'STATS_UPDATE';
  userId: number;
  timestamp: string;
}

// Union des types de messages WebSocket possibles
export type WebSocketMessage = AlerteDTO | DeleteAlerteMessage | StatsUpdateMessage;

// Types pour la gestion des connexions WebSocket
export type ConnectionStatus = 'connected' | 'connecting' | 'disconnected' | 'error';

// Interface pour les statistiques d'alertes
export interface AlerteStats {
  total: number;
  unreadCount: number;
  readCount: number;
  byType: {
    INFO: number;
    WARNING: number;
    ERROR: number;
  };
}

// Request pour les actions REST
export interface MarkAsReadRequest {
  alerteId: number;
}

export interface DeleteAlerteRequest {
  alerteId: number;
}

// Callback types pour les hooks
export type AlerteCallback = (alerte: AlerteDTO) => void;
export type DeleteCallback = (alerteId: number) => void;
export type StatsCallback = (userId: number) => void;

// Configuration WebSocket
export interface WebSocketConfig {
  url: string;
  reconnectInterval: number;
  maxReconnectAttempts: number;
  heartbeatInterval: number;
}
