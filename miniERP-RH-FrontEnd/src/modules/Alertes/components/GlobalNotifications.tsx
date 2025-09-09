import React, { useState, useEffect } from 'react';
import { Bell, X, Check, Trash2, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { useAlertesContext, useAlertesActions } from '../contexts/AlertesContext';
import { useNotificationToasts } from '../hooks/useNotificationToasts';
import type { TypeAlerte } from '../types';

/**
 * Composant de notifications globales
 * S'affiche en position fixe en haut à droite sur toutes les pages
 */
export const GlobalNotifications: React.FC = () => {
    const {
        alertes,
        stats,
        connectionStatus,
        isConnected
    } = useAlertesContext();

    const { marquerCommeLue, supprimerAlerte } = useAlertesActions();

    const { toastAlerts, detectNewAlerts, removeToast } = useNotificationToasts();

    const [isOpen, setIsOpen] = useState(false);

    // Détecter les nouvelles alertes pour les toasts
    useEffect(() => {
        detectNewAlerts(alertes);
    }, [alertes, detectNewAlerts]);

    // Obtenir l'icône selon le type d'alerte
    const getAlertIcon = (type: TypeAlerte) => {
        switch (type) {
            case 'ERROR':
                return '🚨';
            case 'WARNING':
                return '⚠️';
            case 'INFO':
            default:
                return 'ℹ️';
        }
    };

    // Formater la date
    const formatDate = (timestamp: string) => {
        try {
            const date = new Date(timestamp);
            const now = new Date();
            const diffMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

            if (diffMinutes < 1) return 'À l\'instant';
            if (diffMinutes < 60) return `Il y a ${diffMinutes}m`;
            if (diffMinutes < 1440) return `Il y a ${Math.floor(diffMinutes / 60)}h`;
            return date.toLocaleDateString('fr-FR', {
                day: '2-digit',
                month: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (error) {
            return timestamp;
        }
    };

    // Gérer le clic sur "marquer comme lu"
    const handleMarkAsRead = async (alerteId: number) => {
        try {
            await marquerCommeLue(alerteId.toString());
        } catch (error) {
            console.error('Erreur lors du marquage comme lu:', error);
        }
    };

    // Gérer le clic sur "supprimer"
    const handleDelete = async (alerteId: number) => {
        try {
            await supprimerAlerte(alerteId.toString());
        } catch (error) {
            console.error('Erreur lors de la suppression:', error);
        }
    };

    return (
        <>
            <div className="fixed top-4 right-4 z-50">
                <Sheet open={isOpen} onOpenChange={setIsOpen}>
                    <SheetTrigger asChild>
                        <Button
                            variant="outline"
                            size="lg"
                            className={`
    relative group h-12 w-12 rounded-xl transition-all duration-500 ease-out 
    transform hover:scale-110 active:scale-95 hover:rotate-3
    ${!isConnected
                                    ? 'bg-gradient-to-br from-red-50 to-red-100 border-2 border-red-300 hover:from-red-100 hover:to-red-200 hover:border-red-400 hover:shadow-2xl hover:shadow-red-200'
                                    : stats.nonLues > 0
                                        ? 'bg-gradient-to-br from-blue-50 via-blue-100 to-indigo-100 border-2 border-blue-300 hover:from-blue-100 hover:via-blue-200 hover:to-indigo-200 hover:border-blue-400 hover:shadow-2xl hover:shadow-blue-300'
                                        : 'bg-gradient-to-br from-white to-gray-50 border-2 border-gray-200 hover:from-gray-50 hover:to-gray-100 hover:border-gray-300 hover:shadow-xl'
                                }
    shadow-lg before:absolute before:inset-0 before:rounded-xl before:bg-gradient-to-br 
    ${stats.nonLues > 0 ? 'before:from-blue-400/20 before:to-purple-400/20' : 'before:from-transparent before:to-transparent'}
    before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-300
  `}
                        >
                            {/* Cercle de background animé */}
                            <div className="absolute inset-2 rounded-lg bg-white/40 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-300" />

                            {/* Icône avec animation complexe */}
                            <Bell className={`
    w-6 h-6 transition-all duration-500 z-10 relative
    group-hover:scale-125 group-hover:rotate-12 group-active:scale-90
    ${stats.nonLues > 0
                                    ? 'text-blue-600 drop-shadow-sm'
                                    : !isConnected
                                        ? 'text-red-500 drop-shadow-sm'
                                        : 'text-gray-600'
                                }
    ${stats.nonLues > 0 ? 'animate-pulse' : ''}
  `} />

                            {/* Badge des notifications XXL */}
                            {stats.nonLues > 0 && (
                                <Badge
                                    variant="destructive"
                                    className="absolute -top-3 -right-3 px-2 py-1 text-sm min-w-[24px] h-6 flex items-center justify-center font-bold animate-bounce shadow-xl border-2 border-white"
                                >
                                    {stats.nonLues > 99 ? '99+' : stats.nonLues}
                                </Badge>
                            )}

                            {/* Indicateur de connexion XXL avec triple animation */}
                            {!isConnected && (
                                <div className="absolute -top-2 -right-2 flex items-center justify-center">
                                    <div className="w-4 h-4 bg-red-500 rounded-full animate-pulse shadow-lg border-2 border-white" />
                                    <div className="absolute w-4 h-4 bg-red-400 rounded-full animate-ping opacity-75" />
                                    <div className="absolute w-6 h-6 bg-red-300 rounded-full animate-ping opacity-50 animation-delay-150" />
                                </div>
                            )}

                            {/* Effet de particules pour les notifications */}
                            {stats.nonLues > 0 && (
                                <>
                                    <div className="absolute top-0 right-0 w-2 h-2 bg-blue-400 rounded-full animate-ping opacity-60" />
                                    <div className="absolute top-1 right-1 w-1 h-1 bg-purple-400 rounded-full animate-pulse animation-delay-300" />
                                    <div className="absolute bottom-1 left-1 w-1 h-1 bg-indigo-400 rounded-full animate-pulse animation-delay-500" />
                                </>
                            )}

                            {/* Barre de statut élargie */}
                            <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">

                            </div>

                            {/* Cercles concentriques pour l'effet "wow" */}
                            {stats.nonLues > 0 && (
                                <div className="absolute inset-0 pointer-events-none">
                                    <div className="absolute inset-0 rounded-xl border-2 border-blue-300 animate-ping opacity-20" />
                                    <div className="absolute inset-1 rounded-lg border border-purple-300 animate-pulse opacity-30 animation-delay-200" />
                                </div>
                            )}
                        </Button>
                    </SheetTrigger>

                    <SheetContent side="right" className="w-96 p-0">
                        <SheetHeader className="p-6 pb-2 border-b">
                            <div className="flex items-center justify-between">
                                <SheetTitle className="flex items-center gap-2">
                                    <Bell className="w-5 h-5" />
                                    Notifications
                                    {stats.nonLues > 0 && (
                                        <Badge variant="secondary" className="ml-2">
                                            {stats.nonLues} nouvelles
                                        </Badge>
                                    )}
                                </SheetTitle>
                                <div className="flex items-center gap-2">
                                    {isConnected ? (
                                        <div className="flex items-center gap-1">
                                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                                            <span className="text-xs text-green-600">En ligne</span>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-1">
                                            <div className="w-2 h-2 bg-red-500 rounded-full" />
                                            <span className="text-xs text-red-600">Hors ligne</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </SheetHeader>

                        <div className="flex-1 h-[calc(100vh-120px)] overflow-y-auto">
                            <div className="p-4 space-y-3">
                                {alertes.length === 0 ? (
                                    <div className="text-center py-12 text-slate-500">
                                        <Bell className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                        <p className="text-sm">Aucune notification</p>
                                        <p className="text-xs mt-1">
                                            Vous recevrez ici vos alertes en temps réel
                                        </p>
                                    </div>
                                ) : (
                                    alertes.map((alert) => (
                                        <Card
                                            key={alert.id}
                                            className={`border-l-4 transition-all duration-200 ${alert.status === 'UNREAD'
                                                ? 'border-l-blue-500 bg-blue-50'
                                                : 'border-l-slate-300 bg-slate-50 opacity-75'
                                                }`}
                                        >
                                            <CardContent className="p-4">
                                                <div className="flex items-start gap-3">
                                                    <span className="text-lg flex-shrink-0 mt-0.5">
                                                        {getAlertIcon(alert.type)}
                                                    </span>

                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <Badge
                                                                variant={
                                                                    alert.type === 'ERROR' ? 'destructive' :
                                                                        alert.type === 'WARNING' ? 'secondary' :
                                                                            'default'
                                                                }
                                                                className="text-xs"
                                                            >
                                                                {alert.type}
                                                            </Badge>

                                                            {alert.status === 'UNREAD' && (
                                                                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                                                            )}
                                                        </div>

                                                        <p className="text-sm text-slate-800 mb-2 line-clamp-3">
                                                            {alert.message}
                                                        </p>

                                                        <div className="flex items-center justify-between">
                                                            <p className="text-xs text-slate-500">
                                                                {formatDate(alert.timestamp)}
                                                            </p>

                                                            <div className="flex gap-1">
                                                                {alert.status === 'UNREAD' && (
                                                                    <Button
                                                                        size="sm"
                                                                        variant="ghost"
                                                                        onClick={() => handleMarkAsRead(alert.id)}
                                                                        className="h-6 w-6 p-0 hover:bg-green-100"
                                                                    >
                                                                        <Check className="w-3 h-3 text-green-600" />
                                                                    </Button>
                                                                )}

                                                                <Button
                                                                    size="sm"
                                                                    variant="ghost"
                                                                    onClick={() => handleDelete(alert.id)}
                                                                    className="h-6 w-6 p-0 hover:bg-red-100"
                                                                >
                                                                    <Trash2 className="w-3 h-3 text-red-600" />
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Footer avec actions */}
                        <div className="border-t p-4 bg-slate-50">
                            <div className="flex justify-between items-center text-xs text-slate-500">
                                <span>
                                    Connexion: {connectionStatus}
                                </span>
                                <Button variant="ghost" size="sm" className="h-8 px-3">
                                    <Settings className="w-3 h-3 mr-1" />
                                    Paramètres
                                </Button>
                            </div>
                        </div>
                    </SheetContent>
                </Sheet>
            </div>

            {/* Notifications toast pour les nouvelles alertes */}
            <div className="fixed top-16 right-4 z-40 space-y-2 max-w-sm">
                {toastAlerts.slice(0, 2).map((alert, index) => (
                    <Card
                        key={alert.toastId}
                        className={`transform transition-all duration-500 ease-out ${index === 0 ? 'translate-x-0 opacity-100' : 'translate-x-2 opacity-90'
                            } shadow-lg border-l-4 ${alert.type === 'ERROR' ? 'border-l-red-500 bg-red-50' :
                                alert.type === 'WARNING' ? 'border-l-orange-500 bg-orange-50' :
                                    'border-l-blue-500 bg-blue-50'
                            }`}
                    >
                        <CardContent className="p-3">
                            <div className="flex items-start gap-2">
                                <span className="text-sm flex-shrink-0">
                                    {getAlertIcon(alert.type)}
                                </span>

                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-slate-800 line-clamp-2 mb-1">
                                        {alert.message}
                                    </p>
                                    <p className="text-xs text-slate-500">
                                        {formatDate(alert.timestamp)}
                                    </p>
                                </div>

                                <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => alert.toastId && removeToast(alert.toastId)}
                                    className="h-6 w-6 p-0 flex-shrink-0"
                                >
                                    <X className="w-3 h-3" />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </>
    );
};
