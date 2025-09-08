import React, { useState } from 'react';
import { webSocketService } from '../services/WebSocketService';
import { useAlerts } from '../hooks/useAlerts';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
    Play,
    Square,
    Wifi,
    WifiOff,
    Send,
    TestTube,
    CheckCircle,
    XCircle,
    AlertTriangle
} from 'lucide-react';

/**
 * Composant de test pour le système WebSocket
 * Permet de tester la connexion et simuler des messages
 */
export const WebSocketTester: React.FC = () => {
    const [testUserId, setTestUserId] = useState<number>(1);
    const [isConnecting, setIsConnecting] = useState(false);
    const [connectionError, setConnectionError] = useState<string | null>(null);
    const [testResults, setTestResults] = useState<Array<{ id: string, message: string, success: boolean }>>([]);

    const {
        alerts,
        unreadCount,
        connectionStatus,
        loading,
        error,
        markAsRead,
        deleteAlert,
        isConnected
    } = useAlerts();

    // Test de connexion manuelle
    const handleConnect = async () => {
        try {
            setIsConnecting(true);
            setConnectionError(null);

            await webSocketService.connect();
            webSocketService.subscribeToUserAlerts(testUserId);
            webSocketService.subscribeToStatsUpdates();

            const testId = Date.now().toString();
            setTestResults(prev => [...prev, {
                id: testId,
                message: `Connexion réussie et abonnement au topic /topic/alertes/employe/${testUserId}`,
                success: true
            }]);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
            setConnectionError(errorMessage);

            const testId = Date.now().toString();
            setTestResults(prev => [...prev, {
                id: testId,
                message: `Échec de connexion: ${errorMessage}`,
                success: false
            }]);
        } finally {
            setIsConnecting(false);
        }
    };

    // Test de déconnexion
    const handleDisconnect = () => {
        webSocketService.disconnect();
        const testId = Date.now().toString();
        setTestResults(prev => [...prev, {
            id: testId,
            message: 'Déconnexion effectuée',
            success: true
        }]);
    };

    // Simuler l'envoi d'un message (pour test avec backend de développement)
    const sendTestMessage = () => {
        const testMessage = {
            id: Date.now(),
            message: `Message de test - ${new Date().toLocaleTimeString()}`,
            type: 'INFO' as const,
            status: 'UNREAD' as const,
            timestamp: new Date().toISOString(),
            userId: testUserId
        };

        // Simuler un message reçu (pour test sans backend)
        const testId = Date.now().toString();
        setTestResults(prev => [...prev, {
            id: testId,
            message: `Message de test simulé: ${JSON.stringify(testMessage, null, 2)}`,
            success: true
        }]);
    };

    // Nettoyer les résultats de test
    const clearResults = () => {
        setTestResults([]);
        setConnectionError(null);
    };

    const getStatusColor = () => {
        switch (connectionStatus) {
            case 'connected': return 'text-green-600';
            case 'connecting': return 'text-yellow-600';
            case 'disconnected': return 'text-slate-600';
            case 'error': return 'text-red-600';
            default: return 'text-slate-600';
        }
    };

    const getStatusIcon = () => {
        switch (connectionStatus) {
            case 'connected': return <Wifi className="w-5 h-5 text-green-500" />;
            case 'connecting': return <div className="w-5 h-5 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin" />;
            case 'disconnected': return <WifiOff className="w-5 h-5 text-slate-500" />;
            case 'error': return <XCircle className="w-5 h-5 text-red-500" />;
        }
    };

    return (
        <div className="space-y-6 p-6">
            <div className="text-center mb-8">
                <h1 className="text-2xl font-bold text-slate-900 flex items-center justify-center gap-2 mb-2">
                    <TestTube className="w-6 h-6" />
                    Testeur WebSocket STOMP
                </h1>
                <p className="text-slate-600">
                    Interface de test pour le système d'alertes temps réel
                </p>
            </div>

            {/* Panneau de contrôle */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Play className="w-5 h-5" />
                        Contrôles de Test
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center gap-4">
                        <div className="flex-1">
                            <label className="text-sm font-medium mb-2 block">User ID de test:</label>
                            <Input
                                type="number"
                                value={testUserId}
                                onChange={(e) => setTestUserId(Number(e.target.value))}
                                placeholder="ID utilisateur"
                                className="w-32"
                            />
                        </div>

                        <div className="flex items-center gap-2">
                            {getStatusIcon()}
                            <span className={`font-medium ${getStatusColor()}`}>
                                {connectionStatus.charAt(0).toUpperCase() + connectionStatus.slice(1)}
                            </span>
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <Button
                            onClick={handleConnect}
                            disabled={isConnecting || isConnected}
                            variant={isConnected ? "secondary" : "default"}
                        >
                            <Play className="w-4 h-4 mr-2" />
                            {isConnecting ? 'Connexion...' : 'Se Connecter'}
                        </Button>

                        <Button
                            onClick={handleDisconnect}
                            disabled={!isConnected}
                            variant="secondary"
                        >
                            <Square className="w-4 h-4 mr-2" />
                            Déconnecter
                        </Button>

                        <Button
                            onClick={sendTestMessage}
                            disabled={!isConnected}
                            variant="outline"
                        >
                            <Send className="w-4 h-4 mr-2" />
                            Test Message
                        </Button>

                        <Button onClick={clearResults} variant="ghost" size="sm">
                            Nettoyer
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* État de connexion et erreurs */}
            {connectionError && (
                <Alert variant="destructive">
                    <XCircle className="w-4 h-4" />
                    <AlertDescription>
                        Erreur de connexion: {connectionError}
                    </AlertDescription>
                </Alert>
            )}

            {error && (
                <Alert variant="destructive">
                    <XCircle className="w-4 h-4" />
                    <AlertDescription>
                        Erreur du hook: {error}
                    </AlertDescription>
                </Alert>
            )}

            {/* Statistiques en temps réel */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="p-4">
                        <div className="text-2xl font-bold text-blue-600">{alerts.length}</div>
                        <div className="text-sm text-slate-600">Alertes totales</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="text-2xl font-bold text-orange-600">{unreadCount}</div>
                        <div className="text-sm text-slate-600">Non lues</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="text-2xl font-bold text-green-600">{alerts.length - unreadCount}</div>
                        <div className="text-sm text-slate-600">Lues</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className={`text-2xl font-bold ${isConnected ? 'text-green-600' : 'text-red-600'}`}>
                            {isConnected ? '✓' : '✗'}
                        </div>
                        <div className="text-sm text-slate-600">WebSocket</div>
                    </CardContent>
                </Card>
            </div>

            {/* Résultats des tests */}
            {testResults.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Résultats des Tests</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2 max-h-64 overflow-y-auto">
                            {testResults.map((result) => (
                                <div key={result.id} className="flex items-start gap-2 p-2 bg-slate-50 rounded text-sm">
                                    {result.success ? (
                                        <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                                    ) : (
                                        <XCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                                    )}
                                    <pre className="font-mono text-xs whitespace-pre-wrap">{result.message}</pre>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Alertes en temps réel */}
            <Card>
                <CardHeader>
                    <CardTitle>Alertes en Temps Réel</CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="text-center py-4 text-slate-500">
                            Chargement...
                        </div>
                    ) : alerts.length === 0 ? (
                        <div className="text-center py-8 text-slate-500">
                            Aucune alerte. Connectez-vous et attendez les notifications du backend.
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {alerts.slice(0, 10).map((alert) => (
                                <div key={alert.id} className="flex items-center justify-between p-2 border rounded">
                                    <div className="flex items-center gap-2">
                                        <Badge variant={
                                            alert.type === 'ERROR' ? 'destructive' :
                                                alert.type === 'WARNING' ? 'secondary' :
                                                    'default'
                                        }>
                                            {alert.type}
                                        </Badge>
                                        <span className="text-sm">{alert.message}</span>
                                        {alert.status === 'UNREAD' && (
                                            <Badge variant="outline" className="bg-orange-50 text-orange-600 text-xs">
                                                NOUVEAU
                                            </Badge>
                                        )}
                                    </div>

                                    <div className="flex gap-1">
                                        {alert.status === 'UNREAD' && (
                                            <Button size="sm" variant="ghost" onClick={() => markAsRead(alert.id)}>
                                                Marquer lu
                                            </Button>
                                        )}
                                        <Button size="sm" variant="ghost" onClick={() => deleteAlert(alert.id)}>
                                            Supprimer
                                        </Button>
                                    </div>
                                </div>
                            ))}

                            {alerts.length > 10 && (
                                <div className="text-center text-sm text-slate-500 py-2">
                                    ... et {alerts.length - 10} autres alertes
                                </div>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Instructions */}
            <Card className="bg-blue-50 border-blue-200">
                <CardHeader>
                    <CardTitle className="text-blue-900 flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5" />
                        Instructions de Test
                    </CardTitle>
                </CardHeader>
                <CardContent className="text-blue-800 space-y-2">
                    <p><strong>1. Connexion:</strong> Cliquez sur "Se Connecter" pour établir la connexion WebSocket</p>
                    <p><strong>2. Backend:</strong> Assurez-vous que le backend Spring Boot tourne sur localhost:8080</p>
                    <p><strong>3. Topics:</strong> Le système s'abonne automatiquement aux topics appropriés</p>
                    <p><strong>4. Tests:</strong> Utilisez l'API REST du backend pour créer/modifier des alertes</p>
                    <p><strong>5. Temps Réel:</strong> L'UI se mettra à jour automatiquement via WebSocket</p>
                </CardContent>
            </Card>
        </div>
    );
};
