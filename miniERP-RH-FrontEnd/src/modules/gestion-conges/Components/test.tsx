import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, ScatterChart, Scatter, Area, AreaChart } from 'recharts';
import { CalendarDays, Clock, DollarSign, Users, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';

const HRDashboard = () => {
    const [activeTab, setActiveTab] = useState('leaves');

    // Données simulées pour les congés
    const leaveData = [
        { department: 'IT', conges: 45, rtt: 20, maladie: 15, formation: 8 },
        { department: 'RH', conges: 38, rtt: 18, maladie: 12, formation: 15 },
        { department: 'Marketing', conges: 42, rtt: 22, maladie: 8, formation: 6 },
        { department: 'Finance', conges: 35, rtt: 16, maladie: 20, formation: 4 },
        { department: 'Commercial', conges: 48, rtt: 25, maladie: 10, formation: 12 }
    ];

    const leaveTypeData = [
        { name: 'Congés payés', value: 208, color: '#3B82F6' },
        { name: 'RTT', value: 101, color: '#10B981' },
        { name: 'Maladie', value: 65, color: '#EF4444' },
        { name: 'Formation', value: 45, color: '#F59E0B' }
    ];

    const monthlyTrendData = [
        { month: 'Jan', current: 25, previous: 30 },
        { month: 'Fév', current: 28, previous: 32 },
        { month: 'Mar', current: 35, previous: 38 },
        { month: 'Avr', current: 45, previous: 42 },
        { month: 'Mai', current: 52, previous: 48 },
        { month: 'Juin', current: 48, previous: 45 },
        { month: 'Jul', current: 65, previous: 62 },
        { month: 'Août', current: 58, previous: 55 }
    ];

    // Données simulées pour le time tracking
    const timeTrackingData = [
        { employee: 'Alice M.', heuresStandard: 35, heuresSupp: 8, projet: 'A', productivite: 85 },
        { employee: 'Bob L.', heuresStandard: 35, heuresSupp: 12, projet: 'B', productivite: 92 },
        { employee: 'Claire D.', heuresStandard: 35, heuresSupp: 15, projet: 'A', productivite: 78 },
        { employee: 'David R.', heuresStandard: 35, heuresSupp: 5, projet: 'C', productivite: 88 },
        { employee: 'Emma T.', heuresStandard: 35, heuresSupp: 18, projet: 'B', productivite: 95 }
    ];

    const projectTimeData = [
        { project: 'Projet A', heures: 180, budget: 200 },
        { project: 'Projet B', heures: 145, budget: 160 },
        { project: 'Projet C', heures: 90, budget: 100 },
        { project: 'Formation', heures: 65, budget: 80 },
        { project: 'Support', heures: 120, budget: 120 }
    ];

    // Données simulées pour la paie
    const salaryData = [
        { category: 'Salaire brut', montant: 180000, pourcentage: 60 },
        { category: 'Charges sociales', montant: 72000, pourcentage: 24 },
        { category: 'Avantages', montant: 24000, pourcentage: 8 },
        { category: 'Prime', montant: 24000, pourcentage: 8 }
    ];

    const salaryEvolutionData = [
        { month: 'Jan', masseSalariale: 295000, budget: 300000 },
        { month: 'Fév', masseSalariale: 298000, budget: 305000 },
        { month: 'Mar', masseSalariale: 302000, budget: 310000 },
        { month: 'Avr', masseSalariale: 305000, budget: 315000 },
        { month: 'Mai', masseSalariale: 308000, budget: 320000 },
        { month: 'Juin', masseSalariale: 312000, budget: 325000 }
    ];

    const salaryDistributionData = [
        { range: '2000-3000', cadres: 2, employes: 8, techniciens: 5 },
        { range: '3000-4000', cadres: 5, employes: 12, techniciens: 8 },
        { range: '4000-5000', cadres: 8, employes: 6, techniciens: 3 },
        { range: '5000-6000', cadres: 6, employes: 2, techniciens: 1 },
        { range: '6000+', cadres: 4, employes: 0, techniciens: 0 }
    ];

    const COLORS = ['#3B82F6', '#10B981', '#EF4444', '#F59E0B', '#8B5CF6'];

    const KPICard = ({ title, value, unit, change, icon: Icon, status = 'neutral' }) => (
        <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-gray-600">{title}</p>
                        <p className="text-2xl font-bold">{value}{unit}</p>
                        {change && (
                            <p className={`text-sm ${change > 0 ? 'text-red-600' : 'text-green-600'}`}>
                                {change > 0 ? '+' : ''}{change}% vs mois précédent
                            </p>
                        )}
                    </div>
                    <div className={`p-3 rounded-full ${status === 'warning' ? 'bg-yellow-100' :
                            status === 'danger' ? 'bg-red-100' :
                                status === 'success' ? 'bg-green-100' : 'bg-blue-100'
                        }`}>
                        <Icon className={`h-6 w-6 ${status === 'warning' ? 'text-yellow-600' :
                                status === 'danger' ? 'text-red-600' :
                                    status === 'success' ? 'text-green-600' : 'text-blue-600'
                            }`} />
                    </div>
                </div>
            </CardContent>
        </Card>
    );

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Tableau de Bord RH</h1>
                    <p className="text-gray-600 mt-2">Analyse prédictive et stratégique des ressources humaines</p>
                </div>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="leaves" className="flex items-center gap-2">
                            <CalendarDays className="h-4 w-4" />
                            Congés & Absences
                        </TabsTrigger>
                        <TabsTrigger value="time" className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            Time Tracking
                        </TabsTrigger>
                        <TabsTrigger value="payroll" className="flex items-center gap-2">
                            <DollarSign className="h-4 w-4" />
                            Fiches de Paie
                        </TabsTrigger>
                    </TabsList>

                    {/* Onglet Congés et Absences */}
                    <TabsContent value="leaves" className="space-y-6">
                        {/* KPIs */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <KPICard
                                title="Taux d'absentéisme"
                                value="3.2"
                                unit="%"
                                change={-0.5}
                                icon={Users}
                                status="success"
                            />
                            <KPICard
                                title="Congés consommés"
                                value="68"
                                unit="%"
                                change={5}
                                icon={CalendarDays}
                                status="warning"
                            />
                            <KPICard
                                title="Accidents du travail"
                                value="2.1"
                                unit="‰"
                                change={-15}
                                icon={AlertTriangle}
                                status="success"
                            />
                            <KPICard
                                title="Coût absentéisme"
                                value="45"
                                unit="k€"
                                change={8}
                                icon={TrendingUp}
                                status="warning"
                            />
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Histogramme par département */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Consommation par Département</CardTitle>
                                    <CardDescription>Répartition des congés par type et département</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <ResponsiveContainer width="100%" height={300}>
                                        <BarChart data={leaveData}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="department" />
                                            <YAxis />
                                            <Tooltip />
                                            <Bar dataKey="conges" stackId="a" fill="#3B82F6" />
                                            <Bar dataKey="rtt" stackId="a" fill="#10B981" />
                                            <Bar dataKey="maladie" stackId="a" fill="#EF4444" />
                                            <Bar dataKey="formation" stackId="a" fill="#F59E0B" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </CardContent>
                            </Card>

                            {/* Camembert des types de congés */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Répartition par Type</CardTitle>
                                    <CardDescription>Distribution globale des absences</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <ResponsiveContainer width="100%" height={300}>
                                        <PieChart>
                                            <Pie
                                                data={leaveTypeData}
                                                cx="50%"
                                                cy="50%"
                                                labelLine={false}
                                                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                                outerRadius={80}
                                                fill="#8884d8"
                                                dataKey="value"
                                            >
                                                {leaveTypeData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                                ))}
                                            </Pie>
                                            <Tooltip />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </CardContent>
                            </Card>

                            {/* Évolution mensuelle */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Tendances Mensuelles</CardTitle>
                                    <CardDescription>Comparaison année actuelle vs précédente</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <ResponsiveContainer width="100%" height={300}>
                                        <LineChart data={monthlyTrendData}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="month" />
                                            <YAxis />
                                            <Tooltip />
                                            <Line type="monotone" dataKey="current" stroke="#3B82F6" strokeWidth={2} name="2024" />
                                            <Line type="monotone" dataKey="previous" stroke="#94A3B8" strokeWidth={2} strokeDasharray="5 5" name="2023" />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </CardContent>
                            </Card>

                            {/* Alertes et indicateurs */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Alertes & Seuils</CardTitle>
                                    <CardDescription>Suivi des indicateurs critiques</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-sm font-medium">Budget congés IT</span>
                                            <span className="text-sm text-gray-600">85%</span>
                                        </div>
                                        <Progress value={85} className="h-2" />
                                        <Badge variant="destructive" className="mt-1">Seuil d'alerte atteint</Badge>
                                    </div>
                                    <div>
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-sm font-medium">Absences répétées</span>
                                            <span className="text-sm text-gray-600">3 salariés</span>
                                        </div>
                                        <Alert>
                                            <AlertTriangle className="h-4 w-4" />
                                            <AlertDescription>
                                                3 employés avec + de 4 arrêts courts ce trimestre
                                            </AlertDescription>
                                        </Alert>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    {/* Onglet Time Tracking */}
                    <TabsContent value="time" className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <KPICard
                                title="Taux d'utilisation"
                                value="78"
                                unit="%"
                                change={3}
                                icon={Clock}
                                status="success"
                            />
                            <KPICard
                                title="Heures supplémentaires"
                                value="12"
                                unit="%"
                                change={-2}
                                icon={TrendingUp}
                                status="success"
                            />
                            <KPICard
                                title="Productivité moyenne"
                                value="87"
                                unit="%"
                                change={4}
                                icon={CheckCircle}
                                status="success"
                            />
                            <KPICard
                                title="Surcharge équipes"
                                value="2"
                                unit=" équipes"
                                change={0}
                                icon={AlertTriangle}
                                status="warning"
                            />
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Charge de travail par employé */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Charge de Travail</CardTitle>
                                    <CardDescription>Répartition heures normales vs supplémentaires</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <ResponsiveContainer width="100%" height={300}>
                                        <BarChart data={timeTrackingData}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="employee" />
                                            <YAxis />
                                            <Tooltip />
                                            <Bar dataKey="heuresStandard" stackId="a" fill="#3B82F6" name="Heures standard" />
                                            <Bar dataKey="heuresSupp" stackId="a" fill="#EF4444" name="Heures supp." />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </CardContent>
                            </Card>

                            {/* Analyse productivité vs surcharge */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Productivité vs Surcharge</CardTitle>
                                    <CardDescription>Corrélation heures supplémentaires et performance</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <ResponsiveContainer width="100%" height={300}>
                                        <ScatterChart data={timeTrackingData}>
                                            <CartesianGrid />
                                            <XAxis dataKey="heuresSupp" name="Heures supp." />
                                            <YAxis dataKey="productivite" name="Productivité" />
                                            <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                                            <Scatter fill="#3B82F6" />
                                        </ScatterChart>
                                    </ResponsiveContainer>
                                </CardContent>
                            </Card>

                            {/* Répartition par projet */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Suivi Projets</CardTitle>
                                    <CardDescription>Heures consommées vs budget alloué</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <ResponsiveContainer width="100%" height={300}>
                                        <BarChart data={projectTimeData}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="project" />
                                            <YAxis />
                                            <Tooltip />
                                            <Bar dataKey="heures" fill="#10B981" name="Heures réelles" />
                                            <Bar dataKey="budget" fill="#94A3B8" name="Budget" fillOpacity={0.3} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </CardContent>
                            </Card>

                            {/* Alertes temps de travail */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Conformité & Alertes</CardTitle>
                                    <CardDescription>Respect du droit à la déconnexion</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-sm font-medium">Heures supp. équipe B</span>
                                            <Badge variant="destructive">Critique</Badge>
                                        </div>
                                        <p className="text-xs text-gray-600">15h/semaine en moyenne depuis 3 semaines</p>
                                    </div>
                                    <div>
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-sm font-medium">Télétravail - Déconnexion</span>
                                            <Badge variant="outline">À surveiller</Badge>
                                        </div>
                                        <p className="text-xs text-gray-600">5 employés connectés après 20h régulièrement</p>
                                    </div>
                                    <div>
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-sm font-medium">Projet A - Budget</span>
                                            <Badge className="bg-green-100 text-green-800">Conforme</Badge>
                                        </div>
                                        <p className="text-xs text-gray-600">90% du budget consommé, livraison prévue</p>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    {/* Onglet Fiches de Paie */}
                    <TabsContent value="payroll" className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <KPICard
                                title="Masse salariale"
                                value="312"
                                unit="k€"
                                change={1.3}
                                icon={DollarSign}
                                status="neutral"
                            />
                            <KPICard
                                title="% du CA"
                                value="28.5"
                                unit="%"
                                change={-0.8}
                                icon={TrendingUp}
                                status="success"
                            />
                            <KPICard
                                title="Taux d'erreur paie"
                                value="0.8"
                                unit="%"
                                change={-40}
                                icon={CheckCircle}
                                status="success"
                            />
                            <KPICard
                                title="Coût/bulletin"
                                value="12.50"
                                unit="€"
                                change={-5}
                                icon={Users}
                                status="success"
                            />
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Structure des coûts */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Structure des Coûts</CardTitle>
                                    <CardDescription>Répartition de la masse salariale</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <ResponsiveContainer width="100%" height={300}>
                                        <PieChart>
                                            <Pie
                                                data={salaryData}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={40}
                                                outerRadius={80}
                                                paddingAngle={5}
                                                dataKey="montant"
                                                label={({ category, pourcentage }) => `${category} ${pourcentage}%`}
                                            >
                                                {salaryData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip formatter={(value) => `${value.toLocaleString()}€`} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </CardContent>
                            </Card>

                            {/* Évolution masse salariale */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Évolution Masse Salariale</CardTitle>
                                    <CardDescription>Suivi mensuel vs budget</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <ResponsiveContainer width="100%" height={300}>
                                        <AreaChart data={salaryEvolutionData}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="month" />
                                            <YAxis />
                                            <Tooltip formatter={(value) => `${value.toLocaleString()}€`} />
                                            <Area type="monotone" dataKey="budget" stroke="#94A3B8" fill="#94A3B8" fillOpacity={0.3} name="Budget" />
                                            <Area type="monotone" dataKey="masseSalariale" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.6} name="Réel" />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </CardContent>
                            </Card>

                            {/* Distribution salariale */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Distribution Salariale</CardTitle>
                                    <CardDescription>Analyse par catégorie et tranche</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <ResponsiveContainer width="100%" height={300}>
                                        <BarChart data={salaryDistributionData}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="range" />
                                            <YAxis />
                                            <Tooltip />
                                            <Bar dataKey="cadres" stackId="a" fill="#3B82F6" name="Cadres" />
                                            <Bar dataKey="employes" stackId="a" fill="#10B981" name="Employés" />
                                            <Bar dataKey="techniciens" stackId="a" fill="#F59E0B" name="Techniciens" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </CardContent>
                            </Card>

                            {/* Indicateurs de performance */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Performance & Qualité</CardTitle>
                                    <CardDescription>Indicateurs de pilotage RH</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-sm font-medium">Index égalité F/H</span>
                                            <span className="text-sm font-bold text-green-600">94/100</span>
                                        </div>
                                        <Progress value={94} className="h-2" />
                                        <p className="text-xs text-gray-600 mt-1">Objectif légal: 75/100 - Excellent niveau</p>
                                    </div>
                                    <div>
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-sm font-medium">Budget augmentations</span>
                                            <span className="text-sm text-gray-600">82% consommé</span>
                                        </div>
                                        <Progress value={82} className="h-2" />
                                        <p className="text-xs text-gray-600 mt-1">Reste 18k€ sur 100k€ alloués</p>
                                    </div>
                                    <Alert>
                                        <CheckCircle className="h-4 w-4" />
                                        <AlertDescription>
                                            <strong>Qualité paie:</strong> 0.8% d'erreur ce mois (-40% vs objectif)
                                        </AlertDescription>
                                    </Alert>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
};

export default HRDashboard;