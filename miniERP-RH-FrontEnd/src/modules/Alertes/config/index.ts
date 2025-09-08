// Configuration du module Alertes - Version simplifiée

const config = {
  api: {
    baseUrl: 'http://localhost:8080',
    alertesEndpoint: '/api/alertes',
    statsEndpoint: '/api/alertes/stats',
    markAsReadEndpoint: '/api/alertes/marquer-lue',
    deleteEndpoint: '/api/alertes'
  },
  websocket: {
    url: 'ws://localhost:8080/ws',
    reconnectInterval: 3000,
    maxReconnectAttempts: 5,
    heartbeatInterval: 30000,
    connectionTimeout: 10000
  },
  notifications: {
    defaultDuration: 5000,
    maxToasts: 5,
    position: 'top-right' as const,
    enableSound: false,
    enableBrowserNotifications: true
  },
  pagination: {
    defaultPageSize: 20,
    maxPageSize: 100
  },
  polling: {
    enabled: true,
    interval: 30000,
    maxRetries: 3
  }
};

export { config };
export { config as alertesConfig };
export { config as devConfig };
export { config as prodConfig };
export default config;
