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
                            className="relative h-12 w-12 rounded-lg bg-white border border-slate-300 hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-blue-600 transition-colors duration-200"
                        >
                            <Bell className={`w-6 h-6 ${stats.nonLues > 0 ? 'text-blue-600' : !isConnected ? 'text-red-600' : 'text-slate-700'}`} />
                            {stats.nonLues > 0 && (
                                <Badge
                                    variant="destructive"
                                    className="absolute -top-2 -right-2 px-1.5 py-0.5 text-xs min-w-[20px] h-5 flex items-center justify-center font-semibold shadow-sm border border-white"
                                >
                                    {stats.nonLues > 99 ? '99+' : stats.nonLues}
                                </Badge>
                            )}
                            {!isConnected && (
                                <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white" />
                            )}
                        </Button>
                    </SheetTrigger>

                    <SheetContent side="right" className="w-96 p-0">
                        <SheetHeader className="p-4 border-b bg-white">
                            <div className="flex items-center justify-between">
                                <SheetTitle className="flex items-center gap-3 text-lg font-semibold text-slate-900">
                                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                                        <Bell className="w-4 h-4 text-white" />
                                    </div>
                                    Notifications
                                    {stats.nonLues > 0 && (
                                        <Badge variant="secondary" className="ml-2 bg-blue-100 text-blue-800">
                                            {stats.nonLues} nouvelles
                                        </Badge>
                                    )}
                                </SheetTitle>
                                <div className="flex items-center gap-2">
                                    {isConnected ? (
                                        <div className="flex items-center gap-1">
                                            <div className="w-2 h-2 bg-green-500 rounded-full" />
                                            <span className="text-xs text-slate-600">En ligne</span>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-1">
                                            <div className="w-2 h-2 bg-red-500 rounded-full" />
                                            <span className="text-xs text-slate-600">Hors ligne</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </SheetHeader>

                        <div className="flex-1 h-[calc(100vh-120px)] overflow-y-auto bg-slate-50">
                            <div className="p-4 space-y-3">
                                {alertes.length === 0 ? (
                                    <div className="text-center py-12 text-slate-600">
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
                                            className={`border border-slate-200 rounded-lg shadow-sm transition-colors duration-200 ${alert.status === 'UNREAD'
                                                ? 'bg-blue-50'
                                                : 'bg-white'
                                                }`}
                                        >
                                            <CardContent className="p-4">
                                                <div className="flex items-start gap-3">
                                                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 text-white text-sm">
                                                        {getAlertIcon(alert.type)}
                                                    </div>

                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <Badge
                                                                variant={
                                                                    alert.type === 'ERROR' ? 'destructive' :
                                                                        alert.type === 'WARNING' ? 'secondary' :
                                                                            'default'
                                                                }
                                                                className="text-xs bg-blue-100 text-blue-800"
                                                            >
                                                                {alert.type}
                                                            </Badge>

                                                            {alert.status === 'UNREAD' && (
                                                                <div className="w-2 h-2 bg-blue-600 rounded-full" />
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
                                                                        className="h-6 w-6 p-0 hover:bg-slate-100"
                                                                    >
                                                                        <Check className="w-3 h-3 text-slate-900" />
                                                                    </Button>
                                                                )}

                                                                <Button
                                                                    size="sm"
                                                                    variant="ghost"
                                                                    onClick={() => handleDelete(alert.id)}
                                                                    className="h-6 w-6 p-0 hover:bg-slate-100"
                                                                >
                                                                    <Trash2 className="w-3 h-3 text-slate-900" />
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
                        <div className="border-t p-4 bg-white">
                            <div className="flex justify-between items-center text-xs text-slate-600">
                                <span>
                                    Connexion: {connectionStatus}
                                </span>
                                <Button variant="ghost" size="sm" className="h-8 px-3 hover:bg-slate-100">
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
