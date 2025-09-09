// src/modules/Alertes/components/NotificationToast.tsx
import React, { useEffect, useState } from 'react';
import { X, Bell, CheckCircle, AlertTriangle, Info, Wifi, WifiOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { AlerteDTO } from '../types';

interface NotificationToastProps {
  alert: AlerteDTO;
  onDismiss: () => void;
  onMarkAsRead: () => void;
  autoHideDuration?: number;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
}

export const NotificationToast: React.FC<NotificationToastProps> = ({
  alert,
  onDismiss,
  onMarkAsRead,
  autoHideDuration = 5000,
  position = 'top-right'
}) => {
  const [isVisible, setIsVisible] = useState(true);

  // 🎨 Obtenir l'icône selon le type d'alerte
  const getIcon = () => {
    switch (alert.type) {
      case 'ERROR': return <AlertTriangle className="w-5 h-5 text-red-500" />;
      case 'WARNING': return <AlertTriangle className="w-5 h-5 text-orange-500" />;
      case 'INFO': return <Info className="w-5 h-5 text-blue-500" />;
      default: return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  // 🎨 Obtenir les styles selon le type d'alerte
  const getBorderColor = () => {
    switch (alert.type) {
      case 'ERROR': return 'border-l-red-500 bg-red-50/90';
      case 'WARNING': return 'border-l-orange-500 bg-orange-50/90';
      case 'INFO': return 'border-l-blue-500 bg-blue-50/90';
      default: return 'border-l-blue-500 bg-blue-50/90';
    }
  };

  // 🎨 Obtenir la position CSS
  const getPositionClasses = () => {
    switch (position) {
      case 'top-left': return 'fixed top-4 left-4';
      case 'bottom-right': return 'fixed bottom-4 right-4';
      case 'bottom-left': return 'fixed bottom-4 left-4';
      default: return 'fixed top-4 right-4';
    }
  };

  // 🎨 Obtenir le label français pour le type d'alerte
  const getTypeLabel = () => {
    switch (alert.type) {
      case 'ERROR': return 'Erreur';
      case 'WARNING': return 'Attention';
      case 'INFO': return 'Info';
      default: return 'Info';
    }
  };

  // ⏰ Auto-hide après la durée spécifiée (sauf pour les erreurs)
  useEffect(() => {
    if (autoHideDuration && alert.type !== 'ERROR') {
      const timer = setTimeout(() => {
        handleDismiss();
      }, autoHideDuration);

      return () => clearTimeout(timer);
    }
  }, [autoHideDuration, alert.type]);

  const handleDismiss = () => {
    setIsVisible(false);
    setTimeout(() => {
      onDismiss();
    }, 300); // Délai pour l'animation de sortie
  };

  const handleMarkAsRead = () => {
    onMarkAsRead();
    handleDismiss();
  };

  // Formater le timestamp ISO en heure locale
  const formatTime = (timestamp: string) => {
    try {
      return new Date(timestamp).toLocaleTimeString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'N/A';
    }
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className={`${getPositionClasses()} z-50 animate-in slide-in-from-top-2 duration-300`}>
      <Card className={`w-80 shadow-lg border border-slate-200 rounded-lg bg-white ${getBorderColor()}`}>
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                {getIcon()}
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <h4 className="font-semibold text-sm text-slate-900 truncate">
                  Alerte #{alert.id}
                </h4>
                <div className="flex items-center gap-1">
                  <Badge
                    variant={alert.type === 'ERROR' ? 'destructive' : alert.type === 'WARNING' ? 'secondary' : 'default'}
                    className="text-xs px-1.5 py-0.5 bg-blue-100 text-blue-800"
                  >
                    {getTypeLabel()}
                  </Badge>
                </div>
              </div>

              <p className="text-sm text-slate-700 mb-3 line-clamp-2">
                {alert.message}
              </p>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500">
                    {formatTime(alert.timestamp)}
                  </span>
                  {alert.status === 'UNREAD' && (
                    <Badge variant="outline" className="text-xs px-1.5 py-0.5 bg-blue-50 text-blue-800">
                      Non lu
                    </Badge>
                  )}
                </div>

                <div className="flex gap-2">
                  {alert.status === 'UNREAD' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 px-2 text-xs hover:bg-slate-100"
                      onClick={handleMarkAsRead}
                    >
                      Marquer lu
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 hover:bg-slate-100"
                    onClick={handleDismiss}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Barre de progression pour auto-hide */}
          {autoHideDuration && alert.type !== 'ERROR' && (
            <div className="mt-3 -mb-1">
              <div className="h-0.5 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className={`h-full bg-slate-400 rounded-full animate-[shrink_linear] origin-right`}
                  style={{
                    animationDuration: `${autoHideDuration}ms`
                  }}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default NotificationToast;