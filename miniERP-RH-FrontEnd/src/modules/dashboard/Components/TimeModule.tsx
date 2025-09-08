import React, { useState, useEffect } from 'react';
import KPICard from './KPICard';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ScatterChart, Scatter, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { Clock, TrendingUp, CheckCircle, AlertTriangle, Users, Target, Calendar, Timer, Activity, Zap } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Schéma colorimétrique institutionnel identique à PayrollModule
const INSTITUTIONAL_COLORS = {
    primary: '#2563eb',    // 50% - Bleu principal
    secondary: '#64748b',  // 30% - Gris
    accent: '#ffffff',     // 20% - Blanc
    success: '#10b981',
    warning: '#f59e0b',
    danger: '#ef4444',
    info: '#3b82f6'
};

const CHART_COLORS = [
    INSTITUTIONAL_COLORS.primary,
    INSTITUTIONAL_COLORS.success,
    INSTITUTIONAL_COLORS.warning,
    INSTITUTIONAL_COLORS.danger,
    INSTITUTIONAL_COLORS.secondary
];

const TimeModule: React.FC = () => {
    const [timeData, setTimeData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedDepartment, setSelectedDepartment] = useState<string>('');

    // Récupération du token depuis le localStorage
    const token = localStorage.getItem('token');

    useEffect(() => {
        const fetchTimeData = async () => {
            try {
                setLoading(true);
                const response = await fetch('http://localhost:8080/api/pointages/dashboard', {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (!response.ok) {
                    throw new Error('Erreur lors de la récupération des données');
                }

                const data = await response.json();
                console.log('Données Time Tracking reçues:', data);

                // Traitement des données pour obtenir la liste des départements
                let processedData = data;
                if (data.workloadData && Array.isArray(data.workloadData)) {
                    // Extraction des départements uniques
                    const departments = [...new Set(data.workloadData.map((emp: any) => emp.departement || 'Non assigné'))];

                    // Sélectionner automatiquement le premier département si aucun n'est sélectionné
                    if (!selectedDepartment && departments.length > 0) {
                        setSelectedDepartment(departments[0] as string);
                    }

                    processedData = {
                        ...data,
                        departments: departments,
                        originalWorkloadData: data.workloadData
                    };
                }

                setTimeData(processedData);
                setError(null);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Erreur inconnue');
                console.error('Erreur API Time Tracking:', err);
            } finally {
                setLoading(false);
            }
        };

        if (token) {
            fetchTimeData();
        }
    }, [token]);

    if (loading) {
        return (
            <div className="space-y-4 lg:space-y-6">
                <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-4 sm:p-6">
                    <div className="animate-pulse">
                        <div className="h-4 bg-slate-200 rounded w-1/4 mb-2"></div>
                        <div className="h-3 bg-slate-200 rounded w-1/2 mb-4"></div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                            {[...Array(4)].map((_, i) => (
                                <div key={i} className="h-24 bg-slate-200 rounded"></div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (error || !timeData) {
        return (
            <div className="space-y-4 lg:space-y-6">
                <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-4 sm:p-6">
                    <div className="text-center py-8">
                        <p className="text-red-600">Erreur lors du chargement des données: {error}</p>
                    </div>
                </div>
            </div>
        );
    }

    // Fonction pour filtrer les employés par département
    const getFilteredEmployees = () => {
        if (!timeData?.originalWorkloadData || !selectedDepartment) return [];

        return timeData.originalWorkloadData
            .filter((emp: any) => (emp.departement || 'Non assigné') === selectedDepartment)
            .slice(0, 15);
    };

    return (
        <div className="space-y-3 lg:space-y-4">
            {/* Header Section avec métriques institutionnelles */}
            <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 space-y-3 sm:space-y-0">
                    <div>
                        <h2 className="text-lg sm:text-xl font-semibold text-slate-900">Analyse Time Tracking</h2>
                        <p className="text-sm text-slate-600 mt-1">Tableau de bord institutionnel de suivi du temps</p>
                    </div>
                    <div className="flex items-center space-x-2 flex-wrap gap-2">
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-xs">
                            <Calendar className="w-3 h-3 mr-1" />
                            Semaine 25
                        </Badge>
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-xs">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Performances optimales
                        </Badge>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                    <KPICard
                        title="Taux d'utilisation"
                        value={timeData.kpis.utilisationRate.toString()}
                        unit="%"
                        change={timeData.kpis.utilisationChange}
                        icon={Clock}
                        status="success"
                    />
                    <KPICard
                        title="Heures supplémentaires"
                        value={timeData.kpis.overtimeRate.toString()}
                        unit="%"
                        change={timeData.kpis.overtimeChange}
                        icon={TrendingUp}
                        status="success"
                    />
                    <KPICard
                        title="Productivité moyenne"
                        value={timeData.kpis.averageProductivity.toString()}
                        unit="%"
                        change={timeData.kpis.productivityChange}
                        icon={CheckCircle}
                        status="success"
                    />
                    <KPICard
                        title="Surcharge équipes"
                        value={timeData.kpis.overloadedTeams.toString()}
                        unit=" équipes"
                        change={timeData.kpis.overloadChange}
                        icon={AlertTriangle}
                        status="warning"
                    />
                </div>
            </div>

            {/* Analytics Grid principal avec design institutionnel */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                <Card className="bg-white border border-slate-200 shadow-sm">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-slate-900 font-semibold flex items-center gap-2">
                            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                                <Users className="w-4 h-4 text-white" />
                            </div>
                            Charge de Travail par Employé
                        </CardTitle>
                        <CardDescription className="text-slate-600">
                            Répartition heures normales vs supplémentaires - {selectedDepartment}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0">
                        {/* Sélecteur de département */}
                        <div className="mb-4">
                            <label className="text-sm font-medium text-slate-700 mb-2 block">
                                Filtrer par département :
                            </label>
                            <select
                                value={selectedDepartment}
                                onChange={(e) => setSelectedDepartment(e.target.value)}
                                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                                title="Sélectionner un département"
                            >
                                {timeData?.departments && timeData.departments.map((dept: string, index: number) => (
                                    <option key={index} value={dept}>{dept}</option>
                                ))}
                            </select>
                        </div>

                        {/* Graphique */}
                        {timeData?.originalWorkloadData && getFilteredEmployees().length > 0 ? (
                            <ResponsiveContainer width="100%" height={280}>
                                <BarChart data={getFilteredEmployees()}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                    <XAxis
                                        dataKey="employee"
                                        tick={{ fontSize: 10, fill: '#64748b' }}
                                        axisLine={{ stroke: '#e2e8f0' }}
                                        angle={-45}
                                        textAnchor="end"
                                        height={70}
                                    />
                                    <YAxis
                                        tick={{ fontSize: 12, fill: '#64748b' }}
                                        axisLine={{ stroke: '#e2e8f0' }}
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: 'white',
                                            border: '1px solid #e2e8f0',
                                            borderRadius: '8px',
                                            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                                        }}
                                        formatter={(value: any, name: string) => {
                                            if (name === 'Heures standard') return [`${value}h`, name];
                                            if (name === 'Heures supp.') return [`${value}h`, name];
                                            return [value, name];
                                        }}
                                        labelFormatter={(label) => `Employé: ${label}`}
                                    />
                                    <Bar dataKey="heuresStandard" stackId="a" fill={INSTITUTIONAL_COLORS.primary} name="Heures standard" />
                                    <Bar dataKey="heuresSupp" stackId="a" fill={INSTITUTIONAL_COLORS.danger} name="Heures supp." />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex items-center justify-center h-[280px] text-slate-500">
                                <div className="text-center">
                                    <Users className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                                    <p className="text-sm">
                                        {!selectedDepartment ?
                                            'Sélectionnez un département' :
                                            `Aucun employé dans le département "${selectedDepartment}"`
                                        }
                                    </p>
                                    <p className="text-xs text-slate-400 mt-1">
                                        {timeData?.originalWorkloadData ?
                                            `${timeData.originalWorkloadData.length || 0} employés au total` :
                                            'En attente des données...'
                                        }
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Statistiques du département sélectionné */}
                        {selectedDepartment && getFilteredEmployees().length > 0 && (
                            <div className="mt-4 bg-slate-50 rounded-lg p-4">
                                <h4 className="font-semibold text-slate-900 mb-2">Statistiques - {selectedDepartment}</h4>
                                <div className="grid grid-cols-3 gap-3 text-center">
                                    <div>
                                        <p className="text-lg font-bold text-blue-600">
                                            {getFilteredEmployees().length}
                                        </p>
                                        <p className="text-xs text-slate-600">Employés</p>
                                    </div>
                                    <div>
                                        <p className="text-lg font-bold text-green-600">
                                            {Math.round(getFilteredEmployees().reduce((acc: number, emp: any) => acc + (emp.productivite || 0), 0) / getFilteredEmployees().length)}%
                                        </p>
                                        <p className="text-xs text-slate-600">Prod. moyenne</p>
                                    </div>
                                    <div>
                                        <p className="text-lg font-bold text-slate-700">
                                            {getFilteredEmployees().reduce((acc: number, emp: any) => acc + (emp.heuresStandard || 0) + (emp.heuresSupp || 0), 0)}h
                                        </p>
                                        <p className="text-xs text-slate-600">Total heures</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card className="bg-white border border-slate-200 shadow-sm">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-slate-900 font-semibold flex items-center gap-2">
                            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                                <Activity className="w-4 h-4 text-white" />
                            </div>
                            Productivité vs Surcharge
                        </CardTitle>
                        <CardDescription className="text-slate-600">Corrélation heures supplémentaires et performance</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0">
                        <ResponsiveContainer width="100%" height={280}>
                            <ScatterChart data={timeData.productivityData}>
                                <CartesianGrid stroke="#e2e8f0" />
                                <XAxis
                                    dataKey="heuresSupp"
                                    name="Heures supp."
                                    tick={{ fontSize: 12, fill: '#64748b' }}
                                    axisLine={{ stroke: '#e2e8f0' }}
                                />
                                <YAxis
                                    dataKey="productivite"
                                    name="Productivité"
                                    tick={{ fontSize: 12, fill: '#64748b' }}
                                    axisLine={{ stroke: '#e2e8f0' }}
                                />
                                <Tooltip
                                    cursor={{ strokeDasharray: '3 3', stroke: INSTITUTIONAL_COLORS.secondary }}
                                    contentStyle={{
                                        backgroundColor: 'white',
                                        border: '1px solid #e2e8f0',
                                        borderRadius: '8px',
                                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                                    }}
                                />
                                <Scatter fill={INSTITUTIONAL_COLORS.primary} />
                            </ScatterChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                <Card className="bg-white border border-slate-200 shadow-sm">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-slate-900 font-semibold flex items-center gap-2">
                            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                                <Target className="w-4 h-4 text-white" />
                            </div>
                            Suivi Projets
                        </CardTitle>
                        <CardDescription className="text-slate-600">Heures consommées vs budget alloué</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0">
                        <ResponsiveContainer width="100%" height={280}>
                            <BarChart data={timeData.projectData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                <XAxis
                                    dataKey="project"
                                    tick={{ fontSize: 12, fill: '#64748b' }}
                                    axisLine={{ stroke: '#e2e8f0' }}
                                />
                                <YAxis
                                    tick={{ fontSize: 12, fill: '#64748b' }}
                                    axisLine={{ stroke: '#e2e8f0' }}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'white',
                                        border: '1px solid #e2e8f0',
                                        borderRadius: '8px',
                                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                                    }}
                                />
                                <Bar dataKey="heures" fill={INSTITUTIONAL_COLORS.success} name="Heures réelles" />
                                <Bar dataKey="budget" fill={INSTITUTIONAL_COLORS.secondary} name="Budget" fillOpacity={0.3} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                <Card className="bg-white border border-slate-200 shadow-sm">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-slate-900 font-semibold flex items-center gap-2">
                            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                                <AlertTriangle className="w-4 h-4 text-white" />
                            </div>
                            Conformité & Alertes
                        </CardTitle>
                        <CardDescription className="text-slate-600">Respect du droit à la déconnexion</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0 space-y-4">
                        <div className="border border-slate-200 rounded-lg p-3">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-sm font-medium text-slate-700">Heures supp. équipe B</span>
                                <Badge variant="destructive" className="bg-red-100 text-red-800 border-red-200">Critique</Badge>
                            </div>
                            <p className="text-xs text-slate-500">15h/semaine en moyenne depuis 3 semaines</p>
                        </div>
                        <div className="border border-slate-200 rounded-lg p-3">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-sm font-medium text-slate-700">Télétravail - Déconnexion</span>
                                <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-200">À surveiller</Badge>
                            </div>
                            <p className="text-xs text-slate-500">5 employés connectés après 20h régulièrement</p>
                        </div>
                        <div className="border border-slate-200 rounded-lg p-3">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-sm font-medium text-slate-700">Projet A - Budget</span>
                                <Badge className="bg-green-100 text-green-800 border-green-200">Conforme</Badge>
                            </div>
                            <p className="text-xs text-slate-500">90% du budget consommé, livraison prévue</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Section Analytique Avancée Time Tracking - NOUVEAUTÉ */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {/* Module Productivité Hebdomadaire */}
                <Card className="bg-white border border-slate-200 shadow-sm">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-slate-900 font-semibold flex items-center gap-2">
                            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                                <Calendar className="w-4 h-4 text-white" />
                            </div>
                            Productivité Hebdomadaire
                        </CardTitle>
                        <CardDescription className="text-slate-600">Tendances et optimisation du temps</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0">
                        <ResponsiveContainer width="100%" height={200}>
                            <LineChart data={timeData.weeklyProductivity}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                <XAxis
                                    dataKey="jour"
                                    tick={{ fontSize: 10, fill: '#64748b' }}
                                    axisLine={{ stroke: '#e2e8f0' }}
                                />
                                <YAxis
                                    tick={{ fontSize: 10, fill: '#64748b' }}
                                    axisLine={{ stroke: '#e2e8f0' }}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'white',
                                        border: '1px solid #e2e8f0',
                                        borderRadius: '8px',
                                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                                        fontSize: '12px'
                                    }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="productivite"
                                    stroke={INSTITUTIONAL_COLORS.primary}
                                    strokeWidth={2}
                                    dot={{ fill: INSTITUTIONAL_COLORS.primary, strokeWidth: 2, r: 3 }}
                                    name="Productivité %"
                                />
                                <Line
                                    type="monotone"
                                    dataKey="heuresActives"
                                    stroke={INSTITUTIONAL_COLORS.success}
                                    strokeWidth={2}
                                    dot={{ fill: INSTITUTIONAL_COLORS.success, strokeWidth: 2, r: 3 }}
                                    name="Heures actives"
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Module Distribution du Temps */}
                <Card className="bg-white border border-slate-200 shadow-sm">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-slate-900 font-semibold flex items-center gap-2">
                            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                                <Timer className="w-4 h-4 text-white" />
                            </div>
                            Distribution du Temps
                        </CardTitle>
                        <CardDescription className="text-slate-600">Répartition par activité</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0">
                        <ResponsiveContainer width="100%" height={200}>
                            <PieChart>
                                <Pie
                                    data={timeData.timeDistribution}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={40}
                                    outerRadius={70}
                                    paddingAngle={2}
                                    dataKey="heures"
                                    label={({ pourcentage }) => `${pourcentage}%`}
                                >
                                    {timeData.timeDistribution.map((_: any, index: number) => (
                                        <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    formatter={(value: number) => [`${value}h`, 'Heures']}
                                    contentStyle={{
                                        backgroundColor: 'white',
                                        border: '1px solid #e2e8f0',
                                        borderRadius: '8px',
                                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                                        fontSize: '12px'
                                    }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Module Bien-être et Équilibre */}
                <Card className="bg-white border border-slate-200 shadow-sm">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-slate-900 font-semibold flex items-center gap-2">
                            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                                <Zap className="w-4 h-4 text-white" />
                            </div>
                            Bien-être & Équilibre
                        </CardTitle>
                        <CardDescription className="text-slate-600">Indicateurs de qualité de vie au travail</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0 space-y-3">
                        {timeData.wellnessData.map((item: any, index: number) => (
                            <div key={index} className="border border-slate-200 rounded-lg p-3">
                                <div className="flex justify-between items-start mb-2">
                                    <span className="text-sm font-medium text-slate-700">{item.indicateur}</span>
                                    <Badge
                                        variant="outline"
                                        className={`${item.statut === 'success' ? 'bg-green-50 text-green-700 border-green-200' :
                                            item.statut === 'warning' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                                                'bg-blue-50 text-blue-700 border-blue-200'
                                            }`}
                                    >
                                        {item.valeur}%
                                    </Badge>
                                </div>
                                <Progress
                                    value={item.valeur}
                                    className={`h-2 ${item.statut === 'success' ? '[&>div]:bg-green-500' :
                                        item.statut === 'warning' ? '[&>div]:bg-yellow-500' :
                                            '[&>div]:bg-blue-500'
                                        }`}
                                />
                                <div className="flex justify-between items-center mt-2">
                                    <span className="text-xs text-slate-500">Cible: {item.cible}%</span>
                                    <span className={`text-xs font-medium ${item.valeur >= item.cible ? 'text-green-600' : 'text-orange-600'
                                        }`}>
                                        {item.valeur >= item.cible ? '✓ Atteint' : '⚠ Amélioration'}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>

            {/* Section Efficacité des Équipes */}
            <div className="grid grid-cols-1 gap-3">
                <Card className="bg-white border border-slate-200 shadow-sm">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-slate-900 font-semibold flex items-center gap-2">
                            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                                <Users className="w-4 h-4 text-white" />
                            </div>
                            Efficacité des Équipes
                        </CardTitle>
                        <CardDescription className="text-slate-600">Analyse comparative des performances par équipe</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
                            {timeData.teamEfficiency.map((team: any, index: number) => (
                                <div key={index} className="border border-slate-200 rounded-lg p-4 text-center">
                                    <h4 className="font-semibold text-slate-900 mb-3">{team.equipe}</h4>
                                    <div className="space-y-3">
                                        <div>
                                            <div className="flex justify-between items-center mb-1">
                                                <span className="text-xs text-slate-600">Efficacité</span>
                                                <span className="text-xs font-semibold text-blue-600">{team.efficacite}%</span>
                                            </div>
                                            <Progress value={team.efficacite} className="h-2 [&>div]:bg-blue-500" />
                                        </div>
                                        <div>
                                            <div className="flex justify-between items-center mb-1">
                                                <span className="text-xs text-slate-600">Satisfaction</span>
                                                <span className="text-xs font-semibold text-green-600">{team.satisfaction}%</span>
                                            </div>
                                            <Progress value={team.satisfaction} className="h-2 [&>div]:bg-green-500" />
                                        </div>
                                        <div>
                                            <div className="flex justify-between items-center mb-1">
                                                <span className="text-xs text-slate-600">Risque burnout</span>
                                                <span className={`text-xs font-semibold ${team.burnout > 15 ? 'text-red-600' : 'text-green-600'}`}>
                                                    {team.burnout}%
                                                </span>
                                            </div>
                                            <Progress
                                                value={team.burnout}
                                                className={`h-2 ${team.burnout > 15 ? '[&>div]:bg-red-500' : '[&>div]:bg-green-500'}`}
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default TimeModule;
