import React, { useState } from 'react';
import { Download, Eye, FileText, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';

interface PdfTestState {
    isLoading: boolean;
    error: string | null;
    success: string | null;
    pdfUrl: string | null;
}

const PdfTesterComponent: React.FC = () => {
    const [fichePaieId, setFichePaieId] = useState('');
    const [apiBaseUrl, setApiBaseUrl] = useState('http://localhost:8080/api/fiche-paie');
    const [testState, setTestState] = useState<PdfTestState>({
        isLoading: false,
        error: null,
        success: null,
        pdfUrl: null
    });

    const resetState = () => {
        setTestState({
            isLoading: false,
            error: null,
            success: null,
            pdfUrl: null
        });
    };

    const downloadPdf = async () => {
        if (!fichePaieId.trim()) {
            setTestState(prev => ({ ...prev, error: 'Veuillez saisir un ID de fiche de paie' }));
            return;
        }
        setTestState({ isLoading: true, error: null, success: null, pdfUrl: null });
        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`${apiBaseUrl}/${fichePaieId}/pdf`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/pdf',
                    'Authorization': token ? `Bearer ${token}` : ''
                },
            });
            if (!response.ok) {
                let errorMessage = `Erreur HTTP: ${response.status}`;
                if (response.status === 404) {
                    errorMessage = 'Fiche de paie non trouvée';
                } else if (response.status === 500) {
                    errorMessage = 'Erreur serveur interne';
                } else {
                    try {
                        const errorData = await response.json();
                        errorMessage = errorData.message || errorMessage;
                    } catch {
                        errorMessage = `Erreur ${response.status}: ${response.statusText}`;
                    }
                }
                throw new Error(errorMessage);
            }
            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/pdf')) {
                throw new Error('Le serveur n\'a pas retourné un fichier PDF');
            }
            const blob = await response.blob();
            if (blob.size === 0) {
                throw new Error('Le fichier PDF est vide');
            }
            const pdfUrl = URL.createObjectURL(blob);
            // Déclencher le téléchargement
            const link = document.createElement('a');
            link.href = pdfUrl;
            link.download = `fiche_paie_${fichePaieId}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            setTestState({
                isLoading: false,
                error: null,
                success: `PDF téléchargé avec succès (${(blob.size / 1024).toFixed(2)} KB)`,
                pdfUrl: pdfUrl
            });
        } catch (error) {
            setTestState({
                isLoading: false,
                error: error instanceof Error ? error.message : 'Erreur inconnue lors du téléchargement',
                success: null,
                pdfUrl: null
            });
        }
    };

    const previewPdf = async () => {
        if (!fichePaieId.trim()) {
            setTestState(prev => ({ ...prev, error: 'Veuillez saisir un ID de fiche de paie' }));
            return;
        }
        setTestState({ isLoading: true, error: null, success: null, pdfUrl: null });
        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`${apiBaseUrl}/${fichePaieId}/pdf`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/pdf',
                    'Authorization': token ? `Bearer ${token}` : ''
                },
            });
            if (!response.ok) {
                let errorMessage = `Erreur HTTP: ${response.status}`;
                if (response.status === 404) {
                    errorMessage = 'Fiche de paie non trouvée';
                } else if (response.status === 500) {
                    errorMessage = 'Erreur serveur interne';
                } else {
                    try {
                        const errorData = await response.json();
                        errorMessage = errorData.message || errorMessage;
                    } catch {
                        errorMessage = `Erreur ${response.status}: ${response.statusText}`;
                    }
                }
                throw new Error(errorMessage);
            }
            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/pdf')) {
                throw new Error('Le serveur n\'a pas retourné un fichier PDF');
            }
            const blob = await response.blob();
            if (blob.size === 0) {
                throw new Error('Le fichier PDF est vide');
            }
            const pdfUrl = URL.createObjectURL(blob);
            window.open(pdfUrl, '_blank');
            setTestState({
                isLoading: false,
                error: null,
                success: `PDF ouvert dans un nouvel onglet (${(blob.size / 1024).toFixed(2)} KB)`,
                pdfUrl: pdfUrl
            });
        } catch (error) {
            setTestState({
                isLoading: false,
                error: error instanceof Error ? error.message : 'Erreur lors de la prévisualisation',
                success: null,
                pdfUrl: null
            });
        }
    };

    const testApiConnection = async () => {
        setTestState({ isLoading: true, error: null, success: null, pdfUrl: null });
        try {
            // Test de base sur l'URL de l'API
            const response = await fetch(`${apiBaseUrl}/health`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
            });
            if (response.ok) {
                setTestState({
                    isLoading: false,
                    error: null,
                    success: 'Connexion API réussie',
                    pdfUrl: null
                });
            } else {
                // Si pas de endpoint health, tester avec une requête sur les fiches
                const testResponse = await fetch(`${apiBaseUrl}/2/pdf`, {
                    method: 'HEAD'
                });
                if (testResponse.ok) {
                    setTestState({
                        isLoading: false,
                        error: null,
                        success: 'API accessible (endpoint PDF détecté)',
                        pdfUrl: null
                    });
                } else {
                    throw new Error('API inaccessible ou endpoint PDF indisponible');
                }
            }
        } catch (error) {
            setTestState({
                isLoading: false,
                error: `Impossible de se connecter à l'API: ${error instanceof Error ? error.message : 'Erreur réseau'}`,
                success: null,
                pdfUrl: null
            });
        }
    };

    // Nettoyer l'URL du blob quand le composant se démonte
    React.useEffect(() => {
        return () => {
            if (testState.pdfUrl) {
                URL.revokeObjectURL(testState.pdfUrl);
            }
        };
    }, [testState.pdfUrl]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
            <div className="max-w-2xl mx-auto">
                <div className="bg-white rounded-xl shadow-lg p-8">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <FileText className="w-12 h-12 text-indigo-600 mx-auto mb-4" />
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">
                            Testeur API PDF
                        </h1>
                        <p className="text-gray-600">
                            Testez votre endpoint de téléchargement de fiches de paie
                        </p>
                    </div>

                    {/* Configuration */}
                    <div className="space-y-6 mb-8">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                URL de base de l'API
                            </label>
                            <input
                                type="text"
                                value={apiBaseUrl}
                                onChange={(e) => setApiBaseUrl(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                placeholder="http://localhost:8080/api"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                ID de la fiche de paie
                            </label>
                            <input
                                type="number"
                                value={fichePaieId}
                                onChange={(e) => setFichePaieId(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                placeholder="1"
                                min="1"
                            />
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <button
                            onClick={testApiConnection}
                            disabled={testState.isLoading}
                            className="flex items-center justify-center px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            {testState.isLoading ? (
                                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                            ) : (
                                <CheckCircle className="w-5 h-5 mr-2" />
                            )}
                            Test Connexion
                        </button>

                        <button
                            onClick={previewPdf}
                            disabled={testState.isLoading || !fichePaieId.trim()}
                            className="flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            {testState.isLoading ? (
                                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                            ) : (
                                <Eye className="w-5 h-5 mr-2" />
                            )}
                            Prévisualiser
                        </button>

                        <button
                            onClick={downloadPdf}
                            disabled={testState.isLoading || !fichePaieId.trim()}
                            className="flex items-center justify-center px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            {testState.isLoading ? (
                                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                            ) : (
                                <Download className="w-5 h-5 mr-2" />
                            )}
                            Télécharger
                        </button>
                    </div>

                    {/* Messages d'état */}
                    {testState.error && (
                        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start">
                            <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" />
                            <div>
                                <h3 className="text-sm font-medium text-red-800 mb-1">Erreur</h3>
                                <p className="text-sm text-red-700">{testState.error}</p>
                            </div>
                        </div>
                    )}

                    {testState.success && (
                        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start">
                            <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                            <div>
                                <h3 className="text-sm font-medium text-green-800 mb-1">Succès</h3>
                                <p className="text-sm text-green-700">{testState.success}</p>
                            </div>
                        </div>
                    )}

                    {/* Bouton de reset */}
                    {(testState.error || testState.success) && (
                        <div className="text-center">
                            <button
                                onClick={resetState}
                                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                            >
                                Effacer les messages
                            </button>
                        </div>
                    )}

                    {/* Informations techniques */}
                    <div className="mt-8 p-4 bg-gray-50 rounded-lg">
                        <h3 className="text-sm font-medium text-gray-900 mb-2">Informations techniques</h3>
                        <ul className="text-xs text-gray-600 space-y-1">
                            <li><strong>Endpoint testé:</strong> GET {apiBaseUrl}/fiches-paie/{fichePaieId || '{id}'}/pdf</li>
                            <li><strong>Content-Type attendu:</strong> application/pdf</li>
                            <li><strong>Headers:</strong> Content-Disposition avec filename</li>
                            <li><strong>CORS:</strong> Assurez-vous que votre API autorise les requêtes depuis ce domaine</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PdfTesterComponent;