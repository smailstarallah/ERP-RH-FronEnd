// src/modules/Alertes/components/NotificationToast.tsx
import React, { useEffect, useState } from 'react';
import { X, Bell, CheckCircle, AlertTriangle, Info, Wifi, WifiOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Alerte } from '../types';

interface NotificationToastProps {
  alert: Alerte;
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
      case 'urgent': return <AlertTriangle className="w-5 h-5 text-red-500" />;
      case 'success': return <CheckCircle className="w-5 h-5 text-green-500" />;
      default: return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  // 🎨 Obtenir les styles selon le type d'alerte
  const getBorderColor = () => {
    switch (alert.type) {
      case 'urgent': return 'border-l-red-500 bg-red-50/90';
      case 'success': return 'border-l-green-500 bg-green-50/90';
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

  // ⏰ Auto-hide après la durée spécifiée
  useEffect(() => {
    if (autoHideDuration && alert.type !== 'urgent') {
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

  if (!isVisible) {
    return null;
  }

  return (
    <div className={`${getPositionClasses()} z-50 animate-in slide-in-from-top-2 duration-300`}>
      <Card className={`w-80 shadow-lg backdrop-blur-sm border-l-4 ${getBorderColor()}`}>
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              {getIcon()}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <h4 className="font-semibold text-sm text-gray-900 truncate">
                  {alert.titre}
                </h4>
                <div className="flex items-center gap-1">
                  {alert.isGlobal && (
                    <Badge variant="secondary" className="text-xs px-1.5 py-0.5">
                      Global
                    </Badge>
                  )}
                  <Badge 
                    variant={alert.type === 'urgent' ? 'destructive' : alert.type === 'success' ? 'default' : 'secondary'}
                    className="text-xs px-1.5 py-0.5"
                  >
                    {alert.type}
                  </Badge>
                </div>
              </div>
              
              <p className="text-sm text-gray-700 mb-3 line-clamp-2">
                {alert.message}
              </p>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">
                    {new Date(alert.dateCreation).toLocaleTimeString('fr-FR', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                  {alert.moduleOrigine && (
                    <Badge variant="outline" className="text-xs">
                      {alert.moduleOrigine}
                    </Badge>
                  )}
                </div>
                
                <div className="flex gap-2">
                  {!alert.lue && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 px-2 text-xs hover:bg-white/50"
                      onClick={handleMarkAsRead}
                    >
                      Marquer lu
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 hover:bg-white/50"
                    onClick={handleDismiss}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
          
          {/* Barre de progression pour auto-hide */}
          {autoHideDuration && alert.type !== 'urgent' && (
            <div className="mt-3 -mb-1">
              <div className="h-0.5 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className={`h-full bg-gray-400 rounded-full animate-[shrink_linear] origin-right duration-[${autoHideDuration}ms]`}
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
