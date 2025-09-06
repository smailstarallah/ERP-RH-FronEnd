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


// components/AnalyticsDashboard.tsx

import { useMemo } from 'react';
import { Legend, ReferenceLine } from 'recharts';
import { Tooltip as ShadTooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { AlertCircle, ArrowDownRight, ArrowUpRight, BarChart2, Briefcase, UserCheck } from 'lucide-react';

//================================================================================
// 1. GÉNÉRATION DE DONNÉES SYNTHÉTIQUES
//================================================================================
const generateSyntheticData = () => {
    // --- Pour le Manager RH ---
    const rh_weeklyHours = [
        { name: 'Alice', planifie: 35, reel: 38.5 }, // Heures supp
        { name: 'Bob', planifie: 35, reel: 34 },   // Heures en moins
        { name: 'Carla', planifie: 39, reel: 39 },
        { name: 'David', planifie: 35, reel: 42 }, // Beaucoup d'heures supp
        { name: 'Eve', planifie: 20, reel: 21 },   // Temps partiel
    ];
    const rh_workDistribution = [
        { name: 'Travail sur Projets', value: 750 },
        { name: 'Pauses (déjeuner, café)', value: 150 },
        { name: 'Réunions Internes', value: 80 },
        { name: 'Administratif', value: 45 },
    ];

    // --- Pour le Chef de Projet ---
    const pm_projectBudgets = [
        { name: 'Plateforme Aura', consomme: 180, budget: 200, status: 'on_track' },
        { name: 'App Nexus', consomme: 310, budget: 300, status: 'at_risk' }, // Dépassement
        { name: 'Site Interne', consomme: 50, budget: 120, status: 'on_track' },
        { name: 'Migration Cloud', consomme: 450, budget: 450, status: 'completed' },
    ];
    const pm_teamContribution = [
        { name: 'Alice', heures: 45 },
        { name: 'David', heures: 38 },
        { name: 'Frank', heures: 22 },
        { name: 'Grace', heures: 18 },
    ];

    // --- Pour l'Employé (ex: Alice) ---
    const employee_projectDistribution = [
        { name: 'Plateforme Aura', value: 85 },
        { name: 'App Nexus', value: 45 },
        { name: 'Réunions & Admin', value: 20 },
    ];

    return { rh_weeklyHours, rh_workDistribution, pm_projectBudgets, pm_teamContribution, employee_projectDistribution };
};


//================================================================================
// 2. COMPOSANTS DE GRAPHIQUES INDIVIDUELS
//================================================================================

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

// --- Graphiques RH ---

const WeeklyHoursChart = ({ data }: { data: any[] }) => (
    <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis label={{ value: 'Heures', angle: -90, position: 'insideLeft' }} />
            <Tooltip formatter={(value) => `${value}h`} />
            <Legend />
            <ReferenceLine y={35} label="Standard (35h)" stroke="red" strokeDasharray="3 3" />
            <Bar dataKey="planifie" name="Planifié" fill="#8884d8" />
            <Bar dataKey="reel" name="Réel" fill="#82ca9d" />
        </BarChart>
    </ResponsiveContainer>
);

const WorkDistributionPieChart = ({ data }: { data: any[] }) => (
    <ResponsiveContainer width="100%" height={300}>
        <PieChart>
            <Pie data={data} cx="50%" cy="50%" innerRadius={60} outerRadius={80} fill="#8884d8" paddingAngle={5} dataKey="value" label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}>
                {data.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
            </Pie>
            <Tooltip formatter={(value) => `${value} heures`} />
        </PieChart>
    </ResponsiveContainer>
);

// --- Graphiques Chef de Projet ---

const ProjectBudgetsList = ({ data }: { data: any[] }) => (
    <div className="space-y-4">
        {data.map(project => (
            <TooltipProvider key={project.name}>
                <ShadTooltip>
                    <TooltipTrigger className="w-full text-left">
                        <div className="space-y-1">
                            <div className="flex justify-between text-sm font-medium">
                                <span>{project.name}</span>
                                <span className={project.status === 'at_risk' ? 'text-destructive' : 'text-muted-foreground'}>
                                    {project.consomme} / {project.budget}h
                                </span>
                            </div>
                            <Progress value={(project.consomme / project.budget) * 100}
                                className={project.status === 'at_risk' ? '[&>div]:bg-destructive' : ''} />
                        </div>
                    </TooltipTrigger>
                    <TooltipContent>{`${((project.consomme / project.budget) * 100).toFixed(0)}% du budget temps utilisé`}</TooltipContent>
                </ShadTooltip>
            </TooltipProvider>
        ))}
    </div>
);

const TeamContributionChart = ({ data }: { data: any[] }) => (
    <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" label={{ value: 'Heures Contribuées', position: 'insideBottom', offset: -5 }} />
            <YAxis type="category" dataKey="name" width={80} />
            <Tooltip formatter={(value) => `${value}h`} />
            <Bar dataKey="heures" name="Heures" fill="#3b82f6" />
        </BarChart>
    </ResponsiveContainer>
);


//================================================================================
// 3. COMPOSANT DE DASHBOARD PRINCIPAL
//================================================================================

export const AnalyticsDashboard = () => {
    const data = useMemo(() => generateSyntheticData(), []);

    return (
        <div className="p-4 md:p-8 bg-slate-50 dark:bg-slate-900 min-h-screen">
            <div className="max-w-7xl mx-auto space-y-12">

                {/* === SECTION MANAGER RH === */}
                <div>
                    <h2 className="text-2xl font-bold tracking-tight mb-4 flex items-center gap-2"><UserCheck className="text-indigo-500" /> Vue Manager RH</h2>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <Card><CardHeader>
                            <CardTitle>Conformité des Heures Hebdomadaires</CardTitle>
                            <CardDescription>Comparaison entre le temps de travail planifié et le temps réel par employé.</CardDescription>
                        </CardHeader><CardContent><WeeklyHoursChart data={data.rh_weeklyHours} /></CardContent>
                        </Card>
                        <Card><CardHeader>
                            <CardTitle>Répartition Globale du Temps</CardTitle>
                            <CardDescription>Vision d'ensemble sur la manière dont le temps est utilisé dans l'entreprise.</CardDescription>
                        </CardHeader><CardContent><WorkDistributionPieChart data={data.rh_workDistribution} /></CardContent>
                        </Card>
                    </div>
                </div>

                {/* === SECTION CHEF DE PROJET === */}
                <div>
                    <h2 className="text-2xl font-bold tracking-tight mb-4 flex items-center gap-2"><Briefcase className="text-blue-500" /> Vue Chef de Projet</h2>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <Card><CardHeader>
                            <CardTitle>Avancement du Budget Temps par Projet</CardTitle>
                            <CardDescription>Suivi de la consommation des heures allouées à chaque projet.</CardDescription>
                        </CardHeader><CardContent><ProjectBudgetsList data={data.pm_projectBudgets} /></CardContent>
                        </Card>
                        <Card><CardHeader>
                            <CardTitle>Contribution par Membre (Projet 'Aura')</CardTitle>
                            <CardDescription>Temps passé par chaque membre sur ce projet spécifique.</CardDescription>
                        </CardHeader><CardContent><TeamContributionChart data={data.pm_teamContribution} /></CardContent>
                        </Card>
                    </div>
                </div>

                {/* === SECTION EMPLOYÉ === */}
                <div>
                    <h2 className="text-2xl font-bold tracking-tight mb-4 flex items-center gap-2"><BarChart2 className="text-green-500" /> Vue Employé (Alice)</h2>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <Card><CardHeader>
                            <CardTitle>Ma Répartition de Temps (30 derniers jours)</CardTitle>
                            <CardDescription>Visualisation de votre contribution sur les différents projets.</CardDescription>
                        </CardHeader><CardContent><WorkDistributionPieChart data={data.employee_projectDistribution} /></CardContent>
                        </Card>
                        <Card><CardHeader>
                            <CardTitle>Mon Activité Récente</CardTitle>
                            <CardDescription>Résumé de vos statistiques de la semaine.</CardDescription>
                        </CardHeader><CardContent className="space-y-4">
                                <div className="flex items-center justify-between p-3 bg-slate-100 rounded-md">
                                    <span className="font-medium">Heures travaillées cette semaine</span>
                                    <span className="text-lg font-bold">38.5h</span>
                                </div>
                                <div className="flex items-center justify-between p-3 bg-slate-100 rounded-md">
                                    <span className="font-medium">Écart / Standard (35h)</span>
                                    <span className="text-lg font-bold text-green-600 flex items-center gap-1">+3.5h <ArrowUpRight className="h-4 w-4" /></span>
                                </div>
                                <div className="flex items-center justify-between p-3 bg-slate-100 rounded-md">
                                    <span className="font-medium">Projet Principal</span>
                                    <Badge variant="default">Plateforme Aura</Badge>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
            <AdvancedAnalyticsDashboard />
            <HRDashboard />
        </div>
    );
};

// components/AdvancedAnalyticsDashboard.tsx

import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CalendarCheck, ShieldCheck, Target } from 'lucide-react';

//================================================================================
// 1. GÉNÉRATION DE DONNÉES SYNTHÉTIQUES (PLUS RICHES)
//================================================================================
const generateAdvancedSyntheticData = () => {
    // --- Pour le Manager RH ---
    const rh_overtimeTrend = [
        { week: 'S-4', heures_supp: 15 }, { week: 'S-3', heures_supp: 25 },
        { week: 'S-2', heures_supp: 22 }, { week: 'S-1', heures_supp: 35 },
    ];
    const rh_topOvertimeEmployees = [
        { name: 'David', heures_supp: 7, departement: 'Dev' },
        { name: 'Alice', heures_supp: 3.5, departement: 'Dev' },
        { name: 'Grace', heures_supp: 2, departement: 'Design' },
    ];
    const rh_kpis = { totalEmployees: 12, onTimeArrivalRate: '92%', totalOvertimeHoursThisWeek: 35 };

    // --- Pour le Chef de Projet ---
    const pm_projectHealth = {
        name: "App Nexus", budgetProgression: 103, // en %
        deadlineProgression: 95, // en %
        tasksCompleted: 25, tasksTotal: 30,
    };
    const pm_taskTypeDistribution = [
        { task_type: 'Features', heures: 150 }, { task_type: 'Bugs', heures: 90 },
        { task_type: 'Réunions', heures: 45 }, { task_type: 'Tests', heures: 25 },
    ];
    const pm_burnDownChart = [
        { day: 'Lun 1', restant: 80 }, { day: 'Mar 2', restant: 75 },
        { day: 'Mer 3', restant: 68 }, { day: 'Jeu 4', restant: 65 },
        { day: 'Ven 5', restant: 62 }, { day: 'Lun 8', restant: 55 },
        { day: 'Mar 9', restant: 50 },
    ];

    // --- Pour l'Employé (Alice) ---
    const employee_weeklyFocus = [
        { day: 'Lundi', focus: 85 }, { day: 'Mardi', focus: 75 },
        { day: 'Mercredi', focus: 60 }, // a eu bcp de réunions
        { day: 'Jeudi', focus: 90 }, { day: 'Vendredi', focus: 80 },
    ];
    const employee_skillRadar = [
        { skill: 'React', heures: 60, fullMark: 100 }, { skill: 'Java', heures: 40, fullMark: 100 },
        { skill: 'Tests', heures: 15, fullMark: 100 }, { skill: 'Design UI', heures: 10, fullMark: 100 },
        { skill: 'Gestion BDD', heures: 30, fullMark: 100 },
    ];
    const employee_kpis = { avgFocus: '78%', mostProductiveDay: 'Jeudi', totalTasksCompleted: 5 };

    return { rh_overtimeTrend, rh_topOvertimeEmployees, rh_kpis, pm_projectHealth, pm_taskTypeDistribution, pm_burnDownChart, employee_weeklyFocus, employee_skillRadar, employee_kpis };
};

//================================================================================
// 2. PETITS COMPOSANTS DE KPI
//================================================================================
const KpiCard = ({ title, value, icon: Icon, trend, trendValue }: { title: string, value: string | number, icon: React.ElementType, trend?: 'up' | 'down', trendValue?: string }) => (
    <div className="flex items-center justify-between p-4 bg-slate-100 dark:bg-slate-800 rounded-lg">
        <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
        </div>
        <div className="flex items-center">
            {trend && trendValue && (
                <span className={`text-xs mr-2 flex items-center ${trend === 'up' ? 'text-red-500' : 'text-green-500'}`}>
                    {trend === 'up' ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
                    {trendValue}
                </span>
            )}
            <div className="bg-white dark:bg-slate-700 p-2 rounded-md">
                <Icon className="h-6 w-6 text-blue-500" />
            </div>
        </div>
    </div>
);


//================================================================================
// 3. COMPOSANT DE DASHBOARD PRINCIPAL
//================================================================================

export const AdvancedAnalyticsDashboard = () => {
    const data = useMemo(() => generateAdvancedSyntheticData(), []);

    return (
        <div className="p-4 md:p-8 bg-slate-50 dark:bg-slate-900 min-h-screen">
            <div className="max-w-7xl mx-auto space-y-12">

                {/* === SECTION MANAGER RH === */}
                <div>
                    <h2 className="text-2xl font-bold tracking-tight mb-4 flex items-center gap-2"><UserCheck className="text-indigo-500" /> Vue Manager RH</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                        <KpiCard title="Employés Actifs" value={data.rh_kpis.totalEmployees} icon={Users} />
                        <KpiCard title="Taux de Ponctualité" value={`${data.rh_kpis.onTimeArrivalRate}`} icon={CalendarCheck} />
                        <KpiCard title="Heures Supp. (semaine)" value={data.rh_kpis.totalOvertimeHoursThisWeek} icon={Clock} trend="up" trendValue="+13h vs S-1" />
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                        <Card className="lg:col-span-3"><CardHeader>
                            <CardTitle>Tendance des Heures Supplémentaires</CardTitle>
                            <CardDescription>Évolution du volume total d'heures supplémentaires sur les 4 dernières semaines.</CardDescription>
                        </CardHeader><CardContent>
                                <ResponsiveContainer width="100%" height={300}>
                                    <AreaChart data={data.rh_overtimeTrend}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="week" /><YAxis /><Tooltip />
                                        <Area type="monotone" dataKey="heures_supp" name="Heures Supp." stroke="#ef4444" fill="#ef4444" fillOpacity={0.3} />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </CardContent></Card>
                        <Card className="lg:col-span-2"><CardHeader>
                            <CardTitle>Employés les plus concernés</CardTitle>
                            <CardDescription>Top 3 des employés par heures supplémentaires cette semaine.</CardDescription>
                        </CardHeader><CardContent>
                                <Table><TableHeader><TableRow><TableHead>Nom</TableHead><TableHead>Dépt.</TableHead><TableHead className="text-right">Heures Supp.</TableHead></TableRow></TableHeader>
                                    <TableBody>{data.rh_topOvertimeEmployees.map(e => <TableRow key={e.name}><TableCell className="font-medium">{e.name}</TableCell><TableCell>{e.departement}</TableCell><TableCell className="text-right font-bold text-red-500">{e.heures_supp}h</TableCell></TableRow>)}</TableBody>
                                </Table>
                            </CardContent></Card>
                    </div>
                </div>

                {/* === SECTION CHEF DE PROJET (focus sur "App Nexus") === */}
                <div>
                    <h2 className="text-2xl font-bold tracking-tight mb-4 flex items-center gap-2"><Briefcase className="text-blue-500" /> Vue Chef de Projet - <span className="text-muted-foreground">App Nexus</span></h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                        <div className="space-y-1"><p className="text-sm font-medium">Santé du Budget</p><Progress value={data.pm_projectHealth.budgetProgression} className="h-3 [&>div]:bg-red-500" /><p className="text-xs text-muted-foreground">Utilisé à {data.pm_projectHealth.budgetProgression}%</p></div>
                        <div className="space-y-1"><p className="text-sm font-medium">Avancement vs Deadline</p><Progress value={data.pm_projectHealth.deadlineProgression} className="h-3" /><p className="text-xs text-muted-foreground">Temps écoulé à {data.pm_projectHealth.deadlineProgression}%</p></div>
                        <div className="space-y-1"><p className="text-sm font-medium">Tâches Terminées</p><Progress value={(data.pm_projectHealth.tasksCompleted / data.pm_projectHealth.tasksTotal) * 100} className="h-3" /><p className="text-xs text-muted-foreground">{data.pm_projectHealth.tasksCompleted} / {data.pm_projectHealth.tasksTotal}</p></div>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                        <Card className="lg:col-span-3"><CardHeader>
                            <CardTitle>Burndown Chart (Sprint Actuel)</CardTitle>
                            <CardDescription>Visualisation du reste à faire par rapport au temps. L'équipe est-elle dans les temps ?</CardDescription>
                        </CardHeader><CardContent>
                                <ResponsiveContainer width="100%" height={300}>
                                    <AreaChart data={data.pm_burnDownChart}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="day" /><YAxis label={{ value: 'Heures restantes', angle: -90, position: 'insideLeft' }} /><Tooltip />
                                        <Area type="monotone" dataKey="restant" name="Heures restantes" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
                                        {/* Idéalement, la ligne "idéale" serait calculée dynamiquement */}
                                        <ReferenceLine y={0} stroke="green" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </CardContent></Card>
                        <Card className="lg:col-span-2"><CardHeader>
                            <CardTitle>Répartition du Temps par Type d'Activité</CardTitle>
                            <CardDescription>Où partent les heures de l'équipe sur ce projet ?</CardDescription>
                        </CardHeader><CardContent>
                                <ResponsiveContainer width="100%" height={300}>
                                    <PieChart><Pie data={data.pm_taskTypeDistribution} dataKey="heures" nameKey="task_type" cx="50%" cy="50%" outerRadius={80} fill="#8884d8" label>
                                        {data.pm_taskTypeDistribution.map((entry, index) => <Cell key={`cell-${index}`} fill={['#0088FE', '#FF8042', '#FFBB28', '#00C49F'][index]} />)}
                                    </Pie><Tooltip formatter={(value) => `${value} heures`} /></PieChart>
                                </ResponsiveContainer>
                            </CardContent></Card>
                    </div>
                </div>


                {/* === SECTION EMPLOYÉ (Alice) === */}
                <div>
                    <h2 className="text-2xl font-bold tracking-tight mb-4 flex items-center gap-2"><BarChart2 className="text-green-500" /> Ma Vue Personnelle (Alice)</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                        <KpiCard title="Taux de Focus Hebdomadaire" value={`${data.employee_kpis.avgFocus}`} icon={Target} />
                        <KpiCard title="Jour le plus productif" value={data.employee_kpis.mostProductiveDay} icon={CalendarCheck} />
                        <KpiCard title="Tâches terminées" value={data.employee_kpis.totalTasksCompleted} icon={ShieldCheck} />
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <Card><CardHeader>
                            <CardTitle>Focus Quotidien</CardTitle>
                            <CardDescription>Pourcentage du temps de présence passé sur des tâches de projet cette semaine.</CardDescription>
                        </CardHeader><CardContent>
                                <ResponsiveContainer width="100%" height={300}>
                                    <BarChart data={data.employee_weeklyFocus}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="day" /><YAxis unit="%" /><Tooltip />
                                        <Bar dataKey="focus" name="Taux de Focus" fill="#16a34a" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </CardContent></Card>
                        <Card><CardHeader>
                            <CardTitle>Répartition par Compétence Technique</CardTitle>
                            <CardDescription>Temps passé sur différentes technologies (basé sur les tags des tâches).</CardDescription>
                        </CardHeader><CardContent>
                                <ResponsiveContainer width="100%" height={300}>
                                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data.employee_skillRadar}>
                                        <PolarGrid /><PolarAngleAxis dataKey="skill" /><PolarRadiusAxis />
                                        <Radar name="Alice" dataKey="heures" stroke="#16a34a" fill="#16a34a" fillOpacity={0.6} />
                                        <Tooltip />
                                    </RadarChart>
                                </ResponsiveContainer>
                            </CardContent></Card>
                    </div>
                </div>

            </div>
        </div>
    );
};