import React from 'react';
import { AlertList } from './components/AlertList';
import { AlertesProvider, useAlertesContext, useAlertesActions } from './contexts/AlertesContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bell, RefreshCw, Wifi, WifiOff } from 'lucide-react';
import { RealTimeNotifications } from './components/RealTimeNotifications';

// Composant interne qui utilise le contexte
const AlertesContent: React.FC = () => {
  const { alertes, loading, error, connectionStatus, isConnected, stats } = useAlertesContext();
  const { marquerCommeLue, supprimerAlerte, rafraichirAlertes } = useAlertesActions();

  // Récupérer l'employeId depuis userData dans localStorage
  const getEmployeId = (): string => {
    try {
      const userData = localStorage.getItem('userData');
      if (userData) {
        const parsedData = JSON.parse(userData);
        return parsedData.id?.toString();
      }
      return '1';
    } catch (error) {
      console.error('Erreur parsing userData:', error);
      return '1';
    }
  };

  const employeId = getEmployeId();
  const userRole = localStorage.getItem('userRole') || 'EMPLOYEE';

  console.log(" ----> Alertes dans le contexte:", alertes);
  console.log(" ----> Stats:", stats);
  console.log(" ----> Loading:", loading);
  console.log(" ----> Error:", error);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white">
      {/* Header de la page */}
      <div className="bg-white border-b border-slate-200 px-4 py-6 md:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                <Bell className="w-6 h-6" />
                Centre de Notifications
              </h1>
              <p className="text-sm text-slate-600 mt-1">
                Gérez vos alertes et notifications RH
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              {/* Composant notifications temps réel */}
              <RealTimeNotifications 
                userId={employeId}
                userRole={userRole}
                className="mr-2"
              />
              
              <Badge 
                variant={isConnected ? "default" : "destructive"}
                className="flex items-center gap-1"
              >
                {isConnected ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
                {connectionStatus}
              </Badge>
              
              <Button 
                onClick={rafraichirAlertes} 
                variant="outline" 
                size="sm"
                disabled={loading}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Actualiser
              </Button>
            </div>
          </div>

          {/* Statistiques rapides avec indicateur temps réel */}
          {!loading && stats && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="text-2xl font-bold text-blue-700">{stats.total}</div>
                <div className="text-xs text-blue-600 font-medium">Total</div>
              </div>
              
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                <div className="text-2xl font-bold text-amber-700">{stats.nonLues}</div>
                <div className="text-xs text-amber-600 font-medium flex items-center gap-1">
                  Non lues
                  {isConnected && (
                    <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" title="Mise à jour temps réel" />
                  )}
                </div>
              </div>
              
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <div className="text-2xl font-bold text-red-700">{stats.urgentes}</div>
                <div className="text-xs text-red-600 font-medium">Urgentes</div>
              </div>
              
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <div className="text-2xl font-bold text-green-700">{stats.lues}</div>
                <div className="text-xs text-green-600 font-medium">Lues</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Contenu principal */}
      <div className="max-w-7xl mx-auto px-4 py-6 md:px-6 space-y-6">
        {error && (
          <Card className="mb-6 border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <div className="text-red-800">
                <strong>Erreur :</strong> {error}
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Mes Alertes</span>
              {loading && <div className="text-sm text-slate-500">Chargement...</div>}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <AlertList
              alertes={alertes || []}
              loading={loading}
              error={error}
              totalPages={1}
              currentPage={0}
              onMarquerCommeLue={marquerCommeLue}
              onSupprimer={supprimerAlerte}
              onChangerPage={async () => {}} // Pas de pagination pour l'instant
              onRafraichir={rafraichirAlertes}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
// Composant principal avec provider
export const AlertesPage: React.FC = () => {
  // Récupérer l'employeId depuis userData dans localStorage
  const getEmployeId = (): string => {
    try {
      const userData = localStorage.getItem('userData');
      if (userData) {
        const parsedData = JSON.parse(userData);
        return parsedData.id?.toString() || '1';
      }
      return '1';
    } catch (error) {
      console.error('Erreur parsing userData:', error);
      return '1';
    }
  };

  const employeId = getEmployeId();
  
  return (
    <AlertesProvider employeId={employeId}>
      <AlertesContent />
    </AlertesProvider>
  );
};
