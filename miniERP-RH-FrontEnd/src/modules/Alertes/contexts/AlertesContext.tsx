// src/modules/Alertes/contexts/AlertesContext.tsx
import React, { createContext, useContext } from 'react';
import { useAlertes } from '../hooks/useAlertes';
import type { Alerte } from '../types';

interface AlertesContextType {
  // État des données
  alertes: Alerte[];
  loading: boolean;
  error: string | null;
  
  // État WebSocket
  isConnected: boolean;
  connectionStatus: string;
  
  // Statistiques
  stats: {
    total: number;
    nonLues: number;
    urgentes: number;
    lues: number;
  };
  
  // Actions
  marquerCommeLue: (alerteId: string) => Promise<void>;
  supprimerAlerte: (alerteId: string) => Promise<void>;
  rafraichirAlertes: () => Promise<void>;
}

const AlertesContext = createContext<AlertesContextType | undefined>(undefined);

interface AlertesProviderProps {
  children: React.ReactNode;
  employeId: string;
}

export const AlertesProvider: React.FC<AlertesProviderProps> = ({
  children,
  employeId
}) => {
  const alertesData = useAlertes(employeId);

  return (
    <AlertesContext.Provider value={alertesData}>
      {children}
    </AlertesContext.Provider>
  );
};

// Hook pour utiliser le contexte des alertes
export const useAlertesContext = () => {
  const context = useContext(AlertesContext);
  if (context === undefined) {
    throw new Error('useAlertesContext must be used within an AlertesProvider');
  }
  return context;
};

// Hooks compatibles avec l'ancien code
export const useAlertes_OLD = () => useAlertesContext();
export const useAlertesActions = () => {
  const context = useAlertesContext();
  return {
    marquerCommeLue: context.marquerCommeLue,
    supprimerAlerte: context.supprimerAlerte,
    rafraichirAlertes: context.rafraichirAlertes
  };
};
