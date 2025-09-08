// src/modules/Alertes/hooks/useAlertes.ts
import { useState, useEffect, useCallback } from 'react';
import { alertesApiService } from '../services/alertesApi';
import { useRealTimeAlerts } from './useRealTimeAlerts';
import type { Alerte, AlerteResponse } from '../types';

interface UseAlertesReturn {
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

export function useAlertes(employeId: string): UseAlertesReturn {
  const [alertes, setAlertes] = useState<Alerte[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Hook pour les notifications temps réel
  const { 
    isConnected, 
    connectionStatus, 
    newAlert, 
    showToast,
    hideToast 
  } = useRealTimeAlerts(employeId, 'EMPLOYEE');

  // Charger les alertes initiales
  const loadAlertes = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('🔄 Chargement des alertes pour employeId:', employeId);

      // Essayer d'abord l'API réelle
      let response: AlerteResponse;
      try {
        response = await alertesApiService.getAlertes(employeId);
        console.log('✅ Alertes chargées depuis l\'API:', response);
      } catch (apiError) {
        console.warn('⚠️ API non disponible, utilisation des données de test:', apiError);
        // Fallback vers les données de test
        response = await alertesApiService.getTestAlertes(employeId);
        console.log('🧪 Alertes de test chargées:', response);
      }

      setAlertes(response.alertes || []);
    } catch (err) {
      console.error('❌ Erreur lors du chargement des alertes:', err);
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
      setAlertes([]);
    } finally {
      setLoading(false);
    }
  }, [employeId]);

  // Charger les alertes au montage et quand employeId change
  useEffect(() => {
    if (employeId) {
      loadAlertes();
    }
  }, [employeId, loadAlertes]);

  // Ajouter la nouvelle alerte temps réel à la liste
  useEffect(() => {
    if (newAlert && showToast) {
      console.log('🆕 Nouvelle alerte temps réel reçue:', newAlert);
      
      setAlertes(prevAlertes => {
        // Vérifier si l'alerte existe déjà
        const alerteExists = prevAlertes.some(a => a.id === newAlert.id);
        if (alerteExists) {
          console.log('⚠️ Alerte déjà présente, pas d\'ajout');
          return prevAlertes;
        }
        
        // Ajouter la nouvelle alerte en début de liste
        const nouvellesAlertes = [newAlert, ...prevAlertes];
        console.log('✅ Alerte ajoutée, nouveau total:', nouvellesAlertes.length);
        return nouvellesAlertes;
      });
      
      // Cacher automatiquement le toast après ajout
      setTimeout(() => {
        hideToast();
      }, 5000);
    }
  }, [newAlert, showToast, hideToast]);

  // Calculer les statistiques
  const stats = useCallback(() => {
    const nonLues = alertes.filter(a => !a.lue).length;
    const urgentes = alertes.filter(a => a.niveau === 'urgent' || a.type === 'urgent').length;
    
    return {
      total: alertes.length,
      nonLues,
      urgentes,
      lues: alertes.length - nonLues
    };
  }, [alertes])();

  // Actions
  const marquerCommeLue = useCallback(async (alerteId: string) => {
    try {
      console.log('📖 Marquage comme lue:', alerteId);
      await alertesApiService.marquerCommeLue(alerteId);
      
      // Mettre à jour l'état local
      setAlertes(prev => 
        prev.map(alerte => 
          alerte.id === alerteId 
            ? { ...alerte, lue: true, status: 'READ' }
            : alerte
        )
      );
      
      console.log('✅ Alerte marquée comme lue localement');
    } catch (err) {
      console.error('❌ Erreur marquage comme lue:', err);
      throw err;
    }
  }, []);

  const supprimerAlerte = useCallback(async (alerteId: string) => {
    try {
      console.log('🗑️ Suppression alerte:', alerteId);
      await alertesApiService.supprimerAlerte(alerteId);
      
      // Supprimer de l'état local
      setAlertes(prev => prev.filter(alerte => alerte.id !== alerteId));
      console.log('✅ Alerte supprimée localement');
    } catch (err) {
      console.error('❌ Erreur suppression alerte:', err);
      throw err;
    }
  }, []);

  const rafraichirAlertes = useCallback(async () => {
    console.log('🔄 Rafraîchissement manuel des alertes');
    await loadAlertes();
  }, [loadAlertes]);

  return {
    alertes,
    loading,
    error,
    isConnected,
    connectionStatus,
    stats,
    marquerCommeLue,
    supprimerAlerte,
    rafraichirAlertes
  };
}
