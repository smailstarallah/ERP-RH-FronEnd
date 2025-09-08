// Configuration centralisée pour l'application
export const config = {
  // Configuration API
  api: {
    baseUrl: (() => {
      if (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL) {
        return import.meta.env.VITE_API_URL;
      }
      return 'http://localhost:8080/api';
    })(),
  },
  
  // Configuration WebSocket
  websocket: {
    url: (() => {
      if (typeof import.meta !== 'undefined' && import.meta.env?.VITE_WS_URL) {
        return import.meta.env.VITE_WS_URL;
      }
      return 'ws://localhost:8080/ws';
    })(),
  },
  
  // Configuration générale
  app: {
    name: 'ERP RH',
    version: '1.0.0',
    environment: (() => {
      if (typeof import.meta !== 'undefined' && import.meta.env?.MODE) {
        return import.meta.env.MODE;
      }
      return 'development';
    })(),
  }
};

export default config;
