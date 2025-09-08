// src/modules/Alertes/components/RealTimeNotifications.tsx
import React, { useEffect, useState } from 'react';
import { useRealTimeAlerts } from '../hooks/useRealTimeAlerts';
import { Bell, X, CheckCircle, AlertTriangle, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

interface RealTimeNotificationsProps {
  userId: string;
  userRole?: string;
  className?: string;
}

export const RealTimeNotifications: React.FC<RealTimeNotificationsProps> = ({ 
  userId, 
  userRole = 'EMPLOYEE',
  className = '' 
}) => {
  const {
    isConnected,
    connectionStatus,
    newAlert,
    showToast,
    hideToast,
    reconnect
  } = useRealTimeAlerts(userId, userRole);

  const [showNotifications, setShowNotifications] = useState(false);

  // 🔔 Afficher la nouvelle alerte quand elle arrive
  useEffect(() => {
    if (newAlert && showToast) {
      setShowNotifications(true);
      
      // Auto-masquer après 10 secondes
      const timer = setTimeout(() => {
        setShowNotifications(false);
        hideToast();
      }, 10000);
      
      return () => clearTimeout(timer);
    }
  }, [newAlert, showToast, hideToast]);

  // 🎨 Obtenir l'icône selon le type d'alerte
  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'urgent': return <AlertTriangle className="w-4 h-4 text-red-600" />;
      case 'success': return <CheckCircle className="w-4 h-4 text-green-600" />;
      default: return <Info className="w-4 h-4 text-blue-600" />;
    }
  };

  // 🎨 Obtenir les styles selon le type d'alerte
  const getAlertStyles = (type: string) => {
    switch (type) {
      case 'urgent': return 'border-red-200 bg-red-50 text-red-800';
      case 'success': return 'border-green-200 bg-green-50 text-green-800';
      default: return 'border-blue-200 bg-blue-50 text-blue-800';
    }
  };

  // 🔔 Composant d'indicateur de connexion
  const ConnectionIndicator = () => (
    <div className={`flex items-center gap-2 text-xs ${
      isConnected ? 'text-green-600' : 'text-red-600'
    }`}>
      <div className={`w-2 h-2 rounded-full ${
        isConnected ? 'bg-green-600 animate-pulse' : 'bg-red-600'
      }`} />
      <span className="font-medium">
        {connectionStatus === 'connected' && '🔗 Temps réel'}
        {connectionStatus === 'connecting' && '🔄 Connexion...'}
        {connectionStatus === 'disconnected' && '❌ Déconnecté'}
        {connectionStatus === 'error' && '⚠️ Erreur'}
      </span>
    </div>
  );

  return (
    <div className={`relative ${className}`}>
      {/* Indicateur de notification avec compteur */}
      <Button
        variant="ghost"
        size="sm"
        className="relative p-2"
        onClick={() => setShowNotifications(!showNotifications)}
      >
        <Bell className="w-5 h-5" />
        {newAlert && showToast && (
          <Badge
            variant="destructive"
            className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
          >
            1
          </Badge>
        )}
      </Button>

      {/* Panel de notifications temps réel */}
      {showNotifications && newAlert && (
        <div className="absolute top-full right-0 mt-2 w-80 max-h-96 overflow-y-auto z-50 shadow-lg">
          <Card>
            <CardContent className="p-0">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <div>
                  <h3 className="font-semibold text-gray-900">Nouvelle Alerte</h3>
                  <ConnectionIndicator />
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs">
                    Nouvelle
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowNotifications(false)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Actions rapides */}
              <div className="p-3 border-b border-gray-100 bg-gray-50">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full text-xs"
                  onClick={() => {
                    hideToast();
                    setShowNotifications(false);
                  }}
                >
                  Fermer
                </Button>
              </div>

              {/* Alerte actuelle */}
              <div className="max-h-64 overflow-y-auto">
                {newAlert ? (
                  <div className="p-3 border-b border-gray-100 last:border-b-0">
                    <div className={`p-3 rounded-lg border ${getAlertStyles(newAlert.niveau || 'info')}`}>
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 mt-0.5">
                          {getAlertIcon(newAlert.niveau || 'info')}
                        </div>
                        <div className="flex-grow">
                          <h4 className="font-medium text-sm mb-1">
                            {newAlert.titre || 'Nouvelle Alerte'}
                          </h4>
                          <p className="text-sm opacity-90 mb-2">
                            {newAlert.message || newAlert.contenu || 'Message d\'alerte'}
                          </p>
                          <div className="flex items-center justify-between text-xs opacity-70">
                            <span>
                              {newAlert.createdAt ? new Date(newAlert.createdAt).toLocaleString() : 'Maintenant'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};
                            