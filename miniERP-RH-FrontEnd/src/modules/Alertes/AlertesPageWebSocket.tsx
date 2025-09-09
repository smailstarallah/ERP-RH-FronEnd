import React from 'react';
import { WebSocketProvider } from './contexts/WebSocketProvider';
import { AlertsDashboard } from './components/AlertsDashboard';
import { useAlerts } from './hooks/useAlerts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Bell, RefreshCw, Wifi, WifiOff, Activity, AlertTriangle, Info, XCircle } from 'lucide-react';

/**
 * Composant interne qui utilise le nouveau hook WebSocket
 */
const NewAlertes: React.FC = () => {
    const {
        alerts,
        unreadCount,
        connectionStatus,
        loading,
        error,
        markAsRead,
        deleteAlert,
        refresh,
        isConnected
    } = useAlerts();

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

    const getAlertIcon = (type: string) => {
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

    const handleMarkAsRead = async (alerteId: number) => {
        try {
            await markAsRead(alerteId);
        } catch (error) {
            console.error('Erreur lors du marquage comme lu:', error);
        }
    };

    const handleDelete = async (alerteId: number) => {
        try {
            await deleteAlert(alerteId);
        } catch (error) {
            console.error('Erreur lors de la suppression:', error);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header avec statut */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        {isConnected ? (
                            <Wifi className="w-5 h-5 text-green-500" />
                        ) : (
                            <WifiOff className="w-5 h-5 text-red-500" />
                        )}
                        <span className={`text-sm font-medium ${isConnected ? 'text-green-600' : 'text-red-600'
                            }`}>
                            {isConnected ? 'Temps Réel Actif' : 'Hors Ligne'}
                        </span>
                    </div>
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                        WebSocket STOMP
                    </Badge>
                </div>

                <Button onClick={refresh} variant="outline" size="sm" disabled={loading}>
                    <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                    Actualiser
                </Button>
            </div>

            {/* Statistiques */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <Bell className="w-8 h-8 text-blue-500" />
                            <div>
                                <p className="text-2xl font-bold text-slate-900">{alerts.length}</p>
                                <p className="text-sm text-slate-600">Total des alertes</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <Activity className="w-8 h-8 text-orange-500" />
                            <div>
                                <p className="text-2xl font-bold text-slate-900">{unreadCount}</p>
                                <p className="text-sm text-slate-600">Non lues</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'
                                }`} />
                            <div>
                                <p className="text-sm font-medium text-slate-900">
                                    {connectionStatus.charAt(0).toUpperCase() + connectionStatus.slice(1)}
                                </p>
                                <p className="text-sm text-slate-600">État connexion</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Liste des alertes */}
            <Card>
                <CardHeader>
                    <CardTitle>Alertes Temps Réel</CardTitle>
                </CardHeader>
                <CardContent>
                    {loading && alerts.length === 0 ? (
                        <div className="flex items-center justify-center py-8 text-slate-500">
                            <RefreshCw className="w-5 h-5 animate-spin mr-2" />
                            Chargement des alertes...
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
                                    className={`p-4 border rounded-lg transition-all duration-200 ${alert.status === 'UNREAD'
                                        ? 'bg-blue-50 border-blue-200'
                                        : 'bg-slate-50 border-slate-200 opacity-75'
                                        }`}
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-start gap-3 flex-1">
                                            {getAlertIcon(alert.type)}
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <Badge
                                                        variant={
                                                            alert.type === 'ERROR' ? 'destructive' :
                                                                alert.type === 'WARNING' ? 'secondary' :
                                                                    'default'
                                                        }
                                                    >
                                                        {alert.type}
                                                    </Badge>
                                                    {alert.status === 'UNREAD' && (
                                                        <Badge variant="outline" className="bg-orange-50 text-orange-600">
                                                            Nouveau
                                                        </Badge>
                                                    )}
                                                </div>
                                                <p className="text-slate-800 mb-2">{alert.message}</p>
                                                <p className="text-sm text-slate-500">
                                                    {formatDate(alert.timestamp)}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex gap-2">
                                            {alert.status === 'UNREAD' && (
                                                <Button
                                                    onClick={() => handleMarkAsRead(alert.id)}
                                                    size="sm"
                                                    variant="outline"
                                                >
                                                    Marquer lu
                                                </Button>
                                            )}
                                            <Button
                                                onClick={() => handleDelete(alert.id)}
                                                size="sm"
                                                variant="destructive"
                                            >
                                                Supprimer
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Informations de debug */}
            {process.env.NODE_ENV === 'development' && (
                <Card className="bg-slate-50">
                    <CardHeader>
                        <CardTitle className="text-sm">Debug Info</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm space-y-2">
                        <p><strong>WebSocket Status:</strong> {connectionStatus}</p>
                        <p><strong>Connected:</strong> {isConnected ? 'Yes' : 'No'}</p>
                        <p><strong>Alerts in memory:</strong> {alerts.length}</p>
                        <p><strong>Unread count:</strong> {unreadCount}</p>
                        {error && <p className="text-red-600"><strong>Error:</strong> {error}</p>}
                    </CardContent>
                </Card>
            )}
        </div>
    );
};

/**
 * Composant principal qui compare l'ancien et le nouveau système
 */
const AlertesPageContent: React.FC = () => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white">
            <div className="bg-white border-b border-slate-200 px-4 py-6">
                <div className="max-w-7xl mx-auto">
                    <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                        <Bell className="w-6 h-6" />
                        Centre de Notifications - WebSocket Temps Réel
                    </h1>
                    <p className="text-sm text-slate-600 mt-1">
                        Système d'alertes avec communication WebSocket/STOMP bidirectionnelle
                    </p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto p-6">
                <Tabs defaultValue="new" className="space-y-6">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="new" className="flex items-center gap-2">
                            <Activity className="w-4 h-4" />
                            Nouveau Système WebSocket
                        </TabsTrigger>
                        <TabsTrigger value="demo" className="flex items-center gap-2">
                            <Bell className="w-4 h-4" />
                            Dashboard Complet
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="new" className="space-y-6">
                        <NewAlertes />
                    </TabsContent>

                    <TabsContent value="demo" className="space-y-6">
                        <AlertsDashboard />
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
};

/**
 * Page principale avec Provider WebSocket
 */
export const AlertesPage: React.FC = () => {
    return (
        <WebSocketProvider>
            <AlertesPageContent />
        </WebSocketProvider>
    );
};
