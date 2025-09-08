import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Polyfill pour SockJS - définir 'global' pour la compatibilité navigateur
if (typeof global === 'undefined') {
  (globalThis as any).global = globalThis;
}

// Charger les outils de développement en mode dev
if (import.meta.env.DEV) {
  import('./services/userDevTools');
}



createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
