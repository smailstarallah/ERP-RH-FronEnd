import React from 'react';
import { useAlerts } from '../hooks/useAlerts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
    Bell,
    BellRing,
    Wifi,
    WifiOff,
    Loader2,
    Trash2,
    Check,
    RefreshCw,
    AlertTriangle,
    Info,
    XCircle
} from 'lucide-react';
import type { TypeAlerte } from '../types';

/**
 * Composant Dashboard des Alertes - Démontre l'utilisation du hook useAlerts
 * 
 * Ce composant :
 * 1. Utilise le hook useAlerts pour récupérer les données temps réel
 * 2. Affiche la liste des alertes avec leur statut
 * 3. Permet de marquer comme lu / supprimer via les fonctions du hook
 * 4. Montre l'état de la connexion WebSocket
 * 5. Se met à jour automatiquement via les notifications WebSocket
 */
export const AlertsDashboard: React.FC = () => {
    const {
        alerts,
        unreadCount,
        connectionStatus,
        loading,
        error,
        markAsRead,
        deleteAlert,
        refresh,
        isConnected,
        isReconnecting
    } = useAlerts();

    // Fonction pour obtenir l'icône selon le type d'alerte
    const getAlertIcon = (type: TypeAlerte) => {
        switch (type) {
            case 'ERROR':
                return <XCircle className="w-4 h-4 text-red-500" />;
            case 'WARNING':
                return <AlertTriangle className="w-4 h-4 text-orange-500" />;
            case 'INFO':
            default:
                return <Info className="w-4 h-4 text-blue-500" />;
        }
    };

    // Fonction pour obtenir le style selon le type d'alerte
    const getAlertStyle = (type: TypeAlerte, isRead: boolean) => {
        const baseStyle = isRead ? 'opacity-60' : '';

        switch (type) {
            case 'ERROR':
                return `border-l-4 border-red-500 ${baseStyle}`;
            case 'WARNING':
                return `border-l-4 border-orange-500 ${baseStyle}`;
            case 'INFO':
            default:
                return `border-l-4 border-blue-500 ${baseStyle}`;
        }
    };

    // Gestionnaire pour marquer comme lu
    const handleMarkAsRead = async (alerteId: number) => {
        try {
            await markAsRead(alerteId);
            // L'UI se mettra à jour automatiquement via WebSocket
        } catch (error) {
            console.error('Erreur lors du marquage comme lu:', error);
        }
    };

    // Gestionnaire pour supprimer
    const handleDelete = async (alerteId: number) => {
        try {
            await deleteAlert(alerteId);
            // L'UI se mettra à jour automatiquement via WebSocket
        } catch (error) {
            console.error('Erreur lors de la suppression:', error);
        }
    };

    // Formatage de la date
    const formatDate = (timestamp: string) => {
        try {
            return new Date(timestamp).toLocaleString('fr-FR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (error) {
            return timestamp;
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white p-4">
            <div className="max-w-6xl mx-auto space-y-6">
                {/* Header avec statut de connexion */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
                            <Bell className="w-8 h-8" />
                            Dashboard des Alertes
                        </h1>
                        <p className="text-slate-600 mt-2">
                            Système d'alertes temps réel avec WebSocket
                        </p>
                    </div>

                    <div className="flex items-center gap-4">
                        {/* Statut de connexion */}
                        <div className="flex items-center gap-2">
                            {isConnected ? (
                                <Wifi className="w-5 h-5 text-green-500" />
                            ) : isReconnecting ? (
                                <Loader2 className="w-5 h-5 text-yellow-500 animate-spin" />
                            ) : (
                                <WifiOff className="w-5 h-5 text-red-500" />
                            )}
                            <span className={`text-sm font-medium ${isConnected ? 'text-green-600' :
                                    isReconnecting ? 'text-yellow-600' : 'text-red-600'
                                }`}>
                                {isConnected ? 'Connecté' :
                                    isReconnecting ? 'Reconnexion...' : 'Déconnecté'}
                            </span>
                        </div>

                        {/* Bouton de rafraîchissement */}
                        <Button
                            onClick={refresh}
                            variant="outline"
                            size="sm"
                            disabled={loading}
                        >
                            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                            Actualiser
                        </Button>
                    </div>
                </div>

                {/* Statistiques */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-100 rounded-lg">
                                    <Bell className="w-6 h-6 text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-slate-600">Total</p>
                                    <p className="text-2xl font-bold text-slate-900">{alerts.length}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-orange-100 rounded-lg">
                                    <BellRing className="w-6 h-6 text-orange-600" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-slate-600">Non lues</p>
                                    <p className="text-2xl font-bold text-slate-900">{unreadCount}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-green-100 rounded-lg">
                                    <Check className="w-6 h-6 text-green-600" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-slate-600">Lues</p>
                                    <p className="text-2xl font-bold text-slate-900">{alerts.length - unreadCount}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Affichage des erreurs */}
                {error && (
                    <Alert variant="destructive">
                        <XCircle className="w-4 h-4" />
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                {/* Liste des alertes */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Bell className="w-5 h-5" />
                            Alertes ({alerts.length})
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {loading && alerts.length === 0 ? (
                            <div className="flex items-center justify-center py-8">
                                <Loader2 className="w-6 h-6 animate-spin mr-2" />
                                <span className="text-slate-600">Chargement des alertes...</span>
                            </div>
                        ) : alerts.length === 0 ? (
                            <div className="text-center py-8 text-slate-500">
                                <Bell className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                <p>Aucune alerte disponible</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {alerts.map((alert) => (
                                    <div
                                        key={alert.id}
                                        className={`p-4 bg-white rounded-lg border transition-all duration-200 ${getAlertStyle(alert.type, alert.status === 'READ')}`}
                                    >
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex items-start gap-3 flex-1">
                                                {getAlertIcon(alert.type)}

                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <Badge variant={
                                                            alert.type === 'ERROR' ? 'destructive' :
                                                                alert.type === 'WARNING' ? 'secondary' :
                                                                    'default'
                                                        }>
                                                            {alert.type}
                                                        </Badge>

                                                        {alert.status === 'UNREAD' && (
                                                            <Badge variant="outline" className="bg-blue-50 text-blue-600">
                                                                Non lu
                                                            </Badge>
                                                        )}
                                                    </div>

                                                    <p className="text-slate-800 mb-2">{alert.message}</p>

                                                    <p className="text-sm text-slate-500">
                                                        {formatDate(alert.timestamp)} • Utilisateur {alert.userId}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                {alert.status === 'UNREAD' && (
                                                    <Button
                                                        onClick={() => handleMarkAsRead(alert.id)}
                                                        variant="outline"
                                                        size="sm"
                                                        className="text-green-600 hover:text-green-700"
                                                    >
                                                        <Check className="w-4 h-4 mr-1" />
                                                        Marquer lu
                                                    </Button>
                                                )}

                                                <Button
                                                    onClick={() => handleDelete(alert.id)}
                                                    variant="outline"
                                                    size="sm"
                                                    className="text-red-600 hover:text-red-700"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Informations techniques */}
                <Card className="border-slate-200 bg-slate-50">
                    <CardHeader>
                        <CardTitle className="text-lg">Informations Techniques</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div>
                                <p><strong>Statut WebSocket:</strong> {connectionStatus}</p>
                                <p><strong>Alertes en mémoire:</strong> {alerts.length}</p>
                                <p><strong>Dernier refresh:</strong> {new Date().toLocaleTimeString()}</p>
                            </div>
                            <div>
                                <p><strong>Endpoint:</strong> /ws</p>
                                <p><strong>Topics abonnés:</strong> personnel, stats{localStorage.getItem('userRole')?.includes('MANAGER') ? ', global' : ''}</p>
                                <p><strong>Protocole:</strong> STOMP sur SockJS</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};
