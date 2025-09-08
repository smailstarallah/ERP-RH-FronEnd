// src/modules/Alertes/components/TestCompatibilityPanel.tsx
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { testCompatibilityService } from '../services/TestCompatibilityService';
import { Play, CheckCircle, XCircle, Loader2 } from 'lucide-react';

interface TestCompatibilityPanelProps {
  defaultEmployeId?: string;
}

export const TestCompatibilityPanel: React.FC<TestCompatibilityPanelProps> = ({
  defaultEmployeId = '1'
}) => {
  const [employeId, setEmployeId] = useState(defaultEmployeId);
  const [isRunning, setIsRunning] = useState(false);
  const [testResults, setTestResults] = useState<{[key: string]: 'success' | 'error' | 'running'}>({});
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()} - ${message}`]);
  };

  const updateTestResult = (testName: string, result: 'success' | 'error' | 'running') => {
    setTestResults(prev => ({ ...prev, [testName]: result }));
  };

  const runTest = async (testName: string, testFunction: () => Promise<void>) => {
    updateTestResult(testName, 'running');
    addLog(`🧪 Début ${testName}...`);
    
    try {
      await testFunction();
      updateTestResult(testName, 'success');
      addLog(`✅ ${testName} réussi`);
    } catch (error) {
      updateTestResult(testName, 'error');
      addLog(`❌ ${testName} échoué: ${error}`);
    }
  };

  const runAllTests = async () => {
    if (!employeId.trim()) {
      addLog('❌ Veuillez saisir un ID employé valide');
      return;
    }

    setIsRunning(true);
    setTestResults({});
    setLogs([]);
    addLog('🚀 Début des tests de compatibilité...');

    try {
      await runTest('Compatibilité Backend', () => 
        testCompatibilityService.testBackendCompatibility(employeId)
      );
      
      await runTest('Création d\'Alerte', () => 
        testCompatibilityService.testCreateAlerte(employeId)
      );
      
      await runTest('Temps Réel WebSocket', () => 
        testCompatibilityService.testRealTimeAlerts(employeId)
      );

      addLog('🎉 Tous les tests terminés !');
    } catch (error) {
      addLog(`💥 Erreur générale: ${error}`);
    } finally {
      setIsRunning(false);
    }
  };

  const getStatusBadge = (testName: string) => {
    const status = testResults[testName];
    if (!status) return null;

    switch (status) {
      case 'running':
        return <Badge variant="secondary"><Loader2 className="w-3 h-3 mr-1 animate-spin" />En cours</Badge>;
      case 'success':
        return <Badge variant="default" className="bg-green-500"><CheckCircle className="w-3 h-3 mr-1" />Réussi</Badge>;
      case 'error':
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Échoué</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Panel de configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Play className="w-5 h-5" />
            Tests de Compatibilité Backend
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <label htmlFor="employeId" className="block text-sm font-medium mb-2">
                ID Employé pour les tests
              </label>
              <Input
                id="employeId"
                type="number"
                value={employeId}
                onChange={(e) => setEmployeId(e.target.value)}
                placeholder="Entrez un ID employé valide"
                disabled={isRunning}
              />
            </div>
            <Button 
              onClick={runAllTests} 
              disabled={isRunning || !employeId.trim()}
              className="min-w-[120px]"
            >
              {isRunning ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Tests en cours
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Lancer les tests
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Panel des résultats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center justify-between">
              Compatibilité Backend
              {getStatusBadge('Compatibilité Backend')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              Test des endpoints REST : GET alertes, comptage, statuts, etc.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center justify-between">
              Création d'Alerte
              {getStatusBadge('Création d\'Alerte')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              Test de création, marquage et suppression d'alertes.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center justify-between">
              Temps Réel WebSocket
              {getStatusBadge('Temps Réel WebSocket')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              Test de la connexion WebSocket et des abonnements temps réel.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Panel des logs */}
      {logs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Logs d'exécution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-50 p-4 rounded-lg max-h-64 overflow-y-auto">
              <pre className="text-xs space-y-1">
                {logs.map((log, index) => (
                  <div key={index} className="text-gray-700">
                    {log}
                  </div>
                ))}
              </pre>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
