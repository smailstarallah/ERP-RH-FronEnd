import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bell, Home, Settings, User, FileText } from 'lucide-react';

/**
 * Exemple de page normale de l'application
 * Les notifications s'afficheront automatiquement en haut à droite
 */
export const ExamplePage: React.FC = () => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white">
            {/* Header de navigation */}
            <header className="bg-white border-b border-slate-200 px-6 py-4">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <h1 className="text-xl font-semibold text-slate-900">MiniERP RH</h1>
                        <nav className="hidden md:flex space-x-6">
                            <a href="#" className="flex items-center gap-2 text-slate-600 hover:text-slate-900">
                                <Home className="w-4 h-4" />
                                Dashboard
                            </a>
                            <a href="#" className="flex items-center gap-2 text-slate-600 hover:text-slate-900">
                                <User className="w-4 h-4" />
                                Employés
                            </a>
                            <a href="#" className="flex items-center gap-2 text-slate-600 hover:text-slate-900">
                                <FileText className="w-4 h-4" />
                                Paies
                            </a>
                            <a href="#" className="flex items-center gap-2 text-slate-600 hover:text-slate-900">
                                <Bell className="w-4 h-4" />
                                Alertes
                            </a>
                        </nav>
                    </div>

                    <div className="flex items-center space-x-4">
                        <Button variant="ghost" size="sm">
                            <Settings className="w-4 h-4" />
                        </Button>
                        {/* 
              Note: Les notifications s'afficheront automatiquement ici 
              grâce au NotificationLayout qui entoure cette page 
            */}
                    </div>
                </div>
            </header>

            {/* Contenu principal */}
            <main className="max-w-7xl mx-auto p-6">
                <div className="mb-8">
                    <h2 className="text-2xl font-bold text-slate-900 mb-2">Dashboard</h2>
                    <p className="text-slate-600">
                        Bienvenue sur votre tableau de bord RH
                    </p>
                </div>

                {/* Grille de cartes */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <User className="w-5 h-5" />
                                Employés
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-blue-600 mb-2">156</div>
                            <p className="text-sm text-slate-600">Employés actifs</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <FileText className="w-5 h-5" />
                                Paies
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-green-600 mb-2">89%</div>
                            <p className="text-sm text-slate-600">Paies traitées ce mois</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Bell className="w-5 h-5" />
                                Alertes
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-orange-600 mb-2">7</div>
                            <p className="text-sm text-slate-600">Alertes en attente</p>
                            <p className="text-xs text-slate-500 mt-2">
                                📱 Regardez en haut à droite pour voir les notifications temps réel !
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Section principale */}
                <Card>
                    <CardHeader>
                        <CardTitle>Notifications Temps Réel</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-center py-8">
                            <Bell className="w-16 h-16 mx-auto mb-4 text-slate-400" />
                            <h3 className="text-lg font-semibold text-slate-900 mb-2">
                                Système de Notifications Actif
                            </h3>
                            <p className="text-slate-600 mb-4 max-w-md mx-auto">
                                Cette page démontre comment les notifications s'affichent automatiquement
                                en haut à droite sur n'importe quelle page de votre application.
                            </p>

                            <div className="space-y-2 text-sm text-slate-500">
                                <p>🔔 <strong>Notifications en temps réel</strong> via WebSocket STOMP</p>
                                <p>📱 <strong>Badge avec compteur</strong> des alertes non lues</p>
                                <p>🎯 <strong>Toasts automatiques</strong> pour les nouvelles alertes</p>
                                <p>⚡ <strong>Mise à jour instantanée</strong> sans rechargement</p>
                            </div>

                            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                                <p className="text-blue-800 text-sm">
                                    <strong>💡 Astuce :</strong> Utilisez votre API backend pour créer une nouvelle alerte
                                    et regardez-la apparaître instantanément en haut à droite !
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </main>
        </div>
    );
};
