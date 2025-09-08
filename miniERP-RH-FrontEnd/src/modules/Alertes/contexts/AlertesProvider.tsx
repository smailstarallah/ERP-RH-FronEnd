import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAlertesWS } from '../hooks/useAlertesWS';
import type { Alerte } from '../types';
import type { AlerteDTO } from '../hooks/useAlertesWS';

interface AlertesContextType {
  // État des alertes
  alertes: Alerte[];
  loading: boolean;
  error: string | null;
  
  // État de la connexion WebSocket
  connectionStatus: 'connecting' | 'connected' | 'disconnected' | 'error';
  isConnected: boolean;
  
  // Statistiques globales
  stats: {
    total: number;
    nonLues: number;
    urgentes: number;
    lues: number;
  };
  
  // Actions
  envoyerAlerte: (alerteDto: AlerteDTO) => Promise<void>;
  marquerCommeLue: (alerteId: string) => Promise<void>;
  supprimerAlerte: (alerteId: string) => Promise<void>;
  rafraichirAlertes: () => Promise<void>;
  
  // Fonctions utilitaires
  getAlertesByType: (type: 'info' | 'success' | 'urgent') => Alerte[];
  getAlertesNonLues: () => Alerte[];
  marquerToutCommeLu: () => Promise<void>;
  
  // Notifications
  requestNotificationPermission: () => Promise<NotificationPermission>;
  notificationsEnabled: boolean;
}

const AlertesContext = createContext<AlertesContextType | undefined>(undefined);

interface AlertesProviderProps {
  children: React.ReactNode;
  employeId: string;
  enableNotifications?: boolean;
}

export const AlertesProvider: React.FC<AlertesProviderProps> = ({ 
  children, 
  employeId,
  enableNotifications = true 
}) => {
  const {
    alertes,
    loading,
    error,
    connectionStatus,
    isConnected,
    envoyerAlerte,
    marquerCommeLue,
    supprimerAlerte,
    rafraichirAlertes
  } = useAlertesWS(employeId);
  
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  // Calcul des statistiques
  const stats = React.useMemo(() => {
    const alertesList = alertes || [];
    console.log('[AlertesProvider] Calcul stats pour alertes:', alertesList.length, 'alertes');
    console.log('[AlertesProvider] Liste complète des alertes:', alertesList);
    
    const nonLues = alertesList.filter(a => !a.lue).length;
    const urgentes = alertesList.filter(a => a.type === 'urgent').length;
    
    const statsCalculees = {
      total: alertesList.length,
      nonLues,
      urgentes,
      lues: alertesList.length - nonLues
    };
    
    console.log('[AlertesProvider] Statistiques calculées:', statsCalculees);
    return statsCalculees;
  }, [alertes]);

  // Fonctions utilitaires
  const getAlertesByType = React.useCallback((type: 'info' | 'success' | 'urgent') => {
    return (alertes || []).filter(alerte => alerte.type === type);
  }, [alertes]);

  const getAlertesNonLues = React.useCallback(() => {
    return (alertes || []).filter(alerte => !alerte.lue);
  }, [alertes]);

  const marquerToutCommeLu = React.useCallback(async () => {
    const alertesNonLues = getAlertesNonLues();
    
    try {
      // Marquer toutes les alertes non lues
      await Promise.allSettled(
        alertesNonLues.map(alerte => marquerCommeLue(alerte.id))
      );
      console.log(`[Alertes] ${alertesNonLues.length} alertes marquées comme lues`);
    } catch (error) {
      console.error('[Alertes] Erreur lors du marquage en masse:', error);
      throw new Error('Impossible de marquer toutes les alertes comme lues');
    }
  }, [getAlertesNonLues, marquerCommeLue]);

  const requestNotificationPermission = React.useCallback(async (): Promise<NotificationPermission> => {
    if (!('Notification' in window)) {
      console.warn('[Notifications] Non supportées par ce navigateur');
      return 'denied';
    }

    if (Notification.permission === 'granted') {
      setNotificationsEnabled(true);
      return 'granted';
    }

    if (Notification.permission === 'denied') {
      return 'denied';
    }

    // Demander la permission
    const permission = await Notification.requestPermission();
    setNotificationsEnabled(permission === 'granted');
    
    return permission;
  }, []);

  // Initialiser les notifications si activées
  useEffect(() => {
    if (enableNotifications && 'Notification' in window) {
      if (Notification.permission === 'granted') {
        setNotificationsEnabled(true);
      } else if (Notification.permission === 'default') {
        // Demander automatiquement la permission au premier rendu
        requestNotificationPermission();
      }
    }
  }, [enableNotifications, requestNotificationPermission]);

  // Valeur du contexte
  const contextValue: AlertesContextType = {
    // État des alertes
    alertes,
    loading,
    error,
    
    // État de la connexion
    connectionStatus,
    isConnected,
    
    // Statistiques
    stats,
    
    // Actions
    envoyerAlerte,
    marquerCommeLue,
    supprimerAlerte,
    rafraichirAlertes,
    
    // Utilitaires
    getAlertesByType,
    getAlertesNonLues,
    marquerToutCommeLu,
    
    // Notifications
    requestNotificationPermission,
    notificationsEnabled
  };

  return (
    <AlertesContext.Provider value={contextValue}>
      {children}
      
      {/* Indicateur de statut de connexion (optionnel) */}
      {connectionStatus === 'error' && (
        <div className="fixed bottom-4 left-4 bg-red-100 border border-red-300 text-red-700 px-3 py-2 rounded-lg text-sm z-50">
          ⚠️ Connexion aux notifications interrompue
        </div>
      )}
      
      {connectionStatus === 'connecting' && (
        <div className="fixed bottom-4 left-4 bg-blue-100 border border-blue-300 text-blue-700 px-3 py-2 rounded-lg text-sm z-50">
          🔄 Connexion aux notifications...
        </div>
      )}
    </AlertesContext.Provider>
  );
};

// Hook pour utiliser le contexte des alertes
export const useAlertes = (): AlertesContextType => {
  const context = useContext(AlertesContext);
  
  if (context === undefined) {
    throw new Error('useAlertes doit être utilisé dans un AlertesProvider');
  }
  
  return context;
};

// Hook pour obtenir seulement les statistiques (optimisé)
export const useAlertesStats = () => {
  const { stats, connectionStatus, isConnected } = useAlertes();
  return { stats, connectionStatus, isConnected };
};

// Hook pour les actions seulement (optimisé)
export const useAlertesActions = () => {
  const { 
    envoyerAlerte, 
    marquerCommeLue, 
    supprimerAlerte, 
    rafraichirAlertes,
    marquerToutCommeLu 
  } = useAlertes();
  
  return { 
    envoyerAlerte, 
    marquerCommeLue, 
    supprimerAlerte, 
    rafraichirAlertes,
    marquerToutCommeLu 
  };
};
