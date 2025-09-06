import React, { useState, useEffect } from 'react';
import KPICard from './KPICard';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { PieChart, Pie, Cell, AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip, BarChart, Bar, ResponsiveContainer } from 'recharts';
import { DollarSign, TrendingUp, CheckCircle, Users, Target, Shield, Award, CreditCard, AlertTriangle, RefreshCw, Calendar, Clock } from 'lucide-react';
import { payrollApiService } from '@/services/payrollApi';
import type { PayrollApiResponse } from '@/services/payrollApi';

// Types pour les données API (utilisation des types du service API)
type PayrollData = PayrollApiResponse;

// Schéma colorimétrique institutionnel 50/30/20
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

// Service API réel utilisant le service centralisé
const payrollService = {
    async fetchPayrollData(): Promise<PayrollData> {
        try {
            // Utilisation du service API centralisé
            const data = await payrollApiService.fetchPayrollData();
            return data;
        } catch (error) {
            console.error('Erreur PayrollModule:', error);
            throw error;
        }
    }
};

// Composant de chargement amélioré
const LoadingCard: React.FC<{ title: string }> = ({ title }) => (
    <Card className="bg-white border-slate-200 shadow-sm">
        <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-slate-200 rounded-lg flex items-center justify-center animate-pulse">
                    <RefreshCw className="w-4 h-4 text-slate-400 animate-spin" />
                </div>
                <CardTitle className="text-slate-900 font-semibold">{title}</CardTitle>
            </div>
        </CardHeader>
        <CardContent className="pt-0">
            <div className="space-y-3">
                <div className="h-4 bg-slate-200 rounded animate-pulse"></div>
                <div className="h-4 bg-slate-200 rounded animate-pulse w-3/4"></div>
                <div className="h-32 bg-slate-200 rounded animate-pulse"></div>
            </div>
        </CardContent>
    </Card>
);

// Composant d'erreur amélioré
const ErrorCard: React.FC<{ title: string; onRetry: () => void }> = ({ title, onRetry }) => (
    <Card className="bg-white border-red-200 shadow-sm">
        <CardHeader className="pb-3">
            <CardTitle className="text-slate-900 font-semibold flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-500" />
                {title}
            </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
            <Alert className="border-red-200 bg-red-50">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800">
                    Erreur de chargement des données.
                    <button
                        onClick={onRetry}
                        className="ml-2 text-blue-600 underline hover:text-blue-800 transition-colors"
                    >
                        Réessayer
                    </button>
                </AlertDescription>
            </Alert>
        </CardContent>
    </Card>
);

const PayrollModule: React.FC = () => {
    const [data, setData] = useState<PayrollData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
    const [isRefreshing, setIsRefreshing] = useState(false);

    const fetchData = async (isManualRefresh = false) => {
        if (isManualRefresh) {
            setIsRefreshing(true);
        } else {
            setLoading(true);
        }
        setError(null);

        try {
            const payrollData = await payrollService.fetchPayrollData();

            setData(payrollData);
            setLastRefresh(new Date());

            // Message de succès pour les rafraîchissements manuels
            if (isManualRefresh) {
                console.log('Données mises à jour avec succès');
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue lors de la récupération des données';
            setError(errorMessage);
            console.error('Erreur API PayrollModule:', err);

            // En cas d'erreur lors d'un rafraîchissement manuel, on garde les anciennes données si elles existent
            if (isManualRefresh && data) {
                console.warn('Erreur lors du rafraîchissement, conservation des données précédentes');
            }
        } finally {
            setLoading(false);
            setIsRefreshing(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Auto-refresh toutes les 5 minutes
    useEffect(() => {
        const interval = setInterval(fetchData, 5 * 60 * 1000);
        return () => clearInterval(interval);
    }, []);

    const getPriorityConfig = (priority: string) => {
        switch (priority) {
            case 'urgent':
                return {
                    borderColor: 'border-red-500',
                    bgColor: 'bg-red-50',
                    textColor: 'text-red-800',
                    badgeClass: 'bg-red-100 text-red-800 border-red-200'
                };
            case 'attention':
                return {
                    borderColor: 'border-yellow-500',
                    bgColor: 'bg-yellow-50',
                    textColor: 'text-yellow-800',
                    badgeClass: 'bg-yellow-100 text-yellow-800 border-yellow-200'
                };
            case 'opportunity':
                return {
                    borderColor: 'border-blue-500',
                    bgColor: 'bg-blue-50',
                    textColor: 'text-blue-800',
                    badgeClass: 'bg-blue-100 text-blue-800 border-blue-200'
                };
            case 'success':
                return {
                    borderColor: 'border-green-500',
                    bgColor: 'bg-green-50',
                    textColor: 'text-green-800',
                    badgeClass: 'bg-green-100 text-green-800 border-green-200'
                };
            default:
                return {
                    borderColor: 'border-slate-500',
                    bgColor: 'bg-slate-50',
                    textColor: 'text-slate-800',
                    badgeClass: 'bg-slate-100 text-slate-800 border-slate-200'
                };
        }
    };

    if (loading) {
        return (
            <div className="space-y-4 lg:space-y-6">
                <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-4 sm:p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <RefreshCw className="w-6 h-6 text-blue-600 animate-spin" />
                            <div>
                                <h2 className="text-lg sm:text-xl font-semibold text-slate-900">Chargement des données...</h2>
                                <p className="text-sm text-slate-600 mt-1">Récupération des données de paie en cours</p>
                            </div>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="h-24 bg-slate-200 rounded-lg animate-pulse"></div>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {[1, 2, 3, 4].map((i) => (
                        <LoadingCard key={i} title={`Chargement ${i}`} />
                    ))}
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="space-y-4 lg:space-y-6">
                <Alert className="border-red-200 bg-red-50">
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                    <AlertDescription className="text-red-800">
                        <strong>Erreur de chargement :</strong> {error}
                        <button
                            onClick={() => fetchData(true)}
                            className="ml-2 text-blue-600 underline hover:text-blue-800 transition-colors"
                        >
                            Réessayer
                        </button>
                    </AlertDescription>
                </Alert>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {[1, 2, 3, 4].map((i) => (
                        <ErrorCard key={i} title={`Module ${i}`} onRetry={() => fetchData(true)} />
                    ))}
                </div>
            </div>
        );
    }

    if (!data) return null;

    return (
        <div className="space-y-4 lg:space-y-6">
            {/* Header Section avec métriques institutionnelles */}
            <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 space-y-3 sm:space-y-0">
                    <div>
                        <h2 className="text-lg sm:text-xl font-semibold text-slate-900">Analyse de la Masse Salariale</h2>
                        <p className="text-sm text-slate-600 mt-1">Tableau de bord institutionnel et analytique</p>
                    </div>
                    <div className="flex items-center space-x-2 flex-wrap gap-2">
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-xs">
                            <Calendar className="w-3 h-3 mr-1" />
                            Juin 2024
                        </Badge>
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-xs">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Conforme
                        </Badge>
                        <Badge variant="outline" className="bg-slate-50 text-slate-600 border-slate-200 text-xs">
                            <Clock className="w-3 h-3 mr-1" />
                            MAJ: {lastRefresh.toLocaleTimeString('fr-FR', {
                                hour: '2-digit',
                                minute: '2-digit'
                            })}
                        </Badge>
                        <button
                            onClick={() => fetchData(true)}
                            className="p-1 text-slate-400 hover:text-slate-600 transition-colors"
                            title="Actualiser les données"
                        >
                            <RefreshCw className={`w-4 h-4 ${loading || isRefreshing ? 'animate-spin' : ''}`} />
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <KPICard
                        title="Masse salariale"
                        value={Math.round(data.kpis.masseSalariale.value / 1000)}
                        unit="kDH"
                        change={Math.round(data.kpis.masseSalariale.change * 10) / 10}
                        icon={DollarSign}
                        status="neutral"
                    />
                    <KPICard
                        title="% du CA"
                        value={Math.round(data.kpis.pourcentageCA.value * 10) / 10}
                        unit="%"
                        change={Math.round(data.kpis.pourcentageCA.change * 10) / 10}
                        icon={TrendingUp}
                        status="success"
                    />
                    <KPICard
                        title="Taux d'erreur paie"
                        value={Math.round(data.kpis.tauxErreur.value * 10) / 10}
                        unit="%"
                        change={Math.round(data.kpis.tauxErreur.change * 10) / 10}
                        icon={CheckCircle}
                        status="success"
                    />
                    <KPICard
                        title="Coût/bulletin"
                        value={Math.round(data.kpis.coutBulletin.value)}
                        unit="DH"
                        change={Math.round(data.kpis.coutBulletin.change * 10) / 10}
                        icon={Users}
                        status="success"
                    />
                </div>
            </div>

            {/* Analytics Grid avec design institutionnel */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 lg:gap-4">
                <Card className="bg-white border-slate-200 shadow-sm">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-slate-900 font-semibold flex items-center gap-2">
                            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                                <DollarSign className="w-4 h-4 text-white" />
                            </div>
                            Structure des Coûts
                        </CardTitle>
                        <CardDescription className="text-slate-600">Répartition institutionnelle de la masse salariale</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0">
                        <ResponsiveContainer width="100%" height={280}>
                            <PieChart>
                                <Pie
                                    data={data.salaryStructure}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={50}
                                    outerRadius={90}
                                    paddingAngle={2}
                                    dataKey="montant"
                                    label={({ category, pourcentage }) => `${category}: ${pourcentage}%`}
                                    labelLine={false}
                                >
                                    {data.salaryStructure.map((_, index) => (
                                        <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    formatter={(value: number, _: string, props: any) => [
                                        `${value.toLocaleString()} DH`,
                                        props.payload.category
                                    ]}
                                    contentStyle={{
                                        backgroundColor: 'white',
                                        border: '1px solid #e2e8f0',
                                        borderRadius: '8px',
                                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                                    }}
                                />
                            </PieChart>
                        </ResponsiveContainer>

                        {/* Légende des catégories */}
                        <div className="mt-4 space-y-3">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {data.salaryStructure.map((item, index) => {
                                    const colorIndex = index % CHART_COLORS.length;
                                    let colorClass = '';

                                    switch (colorIndex) {
                                        case 0: colorClass = 'bg-blue-600'; break;
                                        case 1: colorClass = 'bg-green-500'; break;
                                        case 2: colorClass = 'bg-orange-500'; break;
                                        case 3: colorClass = 'bg-red-500'; break;
                                        case 4: colorClass = 'bg-slate-500'; break;
                                        default: colorClass = 'bg-gray-500';
                                    }

                                    return (
                                        <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-4 h-4 rounded-full ${colorClass}`}></div>
                                                <span className="text-sm font-medium text-slate-700">
                                                    {item.category}
                                                </span>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-sm font-semibold text-slate-900">
                                                    {item.montant.toLocaleString()} DH
                                                </div>
                                                <div className="text-xs text-slate-500">
                                                    {item.pourcentage}%
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-white border-slate-200 shadow-sm">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-slate-900 font-semibold flex items-center gap-2">
                            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                                <TrendingUp className="w-4 h-4 text-white" />
                            </div>
                            Évolution Masse Salariale
                        </CardTitle>
                        <CardDescription className="text-slate-600">Analyse prédictive : réel vs budget</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0">
                        <ResponsiveContainer width="100%" height={280}>
                            <AreaChart data={data.salaryEvolution}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                <XAxis
                                    dataKey="month"
                                    tick={{ fontSize: 12, fill: '#64748b' }}
                                    axisLine={{ stroke: '#e2e8f0' }}
                                />
                                <YAxis
                                    tick={{ fontSize: 12, fill: '#64748b' }}
                                    axisLine={{ stroke: '#e2e8f0' }}
                                />
                                <Tooltip
                                    formatter={(value: number, name: string) => [`${value.toLocaleString()}DH`, name]}
                                    contentStyle={{
                                        backgroundColor: 'white',
                                        border: '1px solid #e2e8f0',
                                        borderRadius: '8px',
                                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                                    }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="budget"
                                    stroke={INSTITUTIONAL_COLORS.secondary}
                                    fill={INSTITUTIONAL_COLORS.secondary}
                                    fillOpacity={0.2}
                                    name="Budget"
                                />
                                <Area
                                    type="monotone"
                                    dataKey="masseSalariale"
                                    stroke={INSTITUTIONAL_COLORS.primary}
                                    fill={INSTITUTIONAL_COLORS.primary}
                                    fillOpacity={0.3}
                                    name="Réalisé"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                <Card className="bg-white border-slate-200 shadow-sm">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-slate-900 font-semibold flex items-center gap-2">
                            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                                <Users className="w-4 h-4 text-white" />
                            </div>
                            Distribution par Tranches Salariales
                        </CardTitle>
                        <CardDescription className="text-slate-600">Répartition empilée des employés par département et tranche de salaire</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0">
                        <ResponsiveContainer width="100%" height={320}>
                            <BarChart
                                data={data.salaryDistribution ? data.salaryDistribution.map(dept => ({
                                    departement: dept.departement,
                                    '< 5000 DH': dept.tranches?.moins_5000 || 0,
                                    '5000-8000 DH': dept.tranches?._5000_8000 || 0,
                                    '8000-12000 DH': dept.tranches?._8000_12000 || 0,
                                    '12000-20000 DH': dept.tranches?._12000_20000 || 0,
                                    '> 20000 DH': dept.tranches?.plus_20000 || 0
                                })) : []}
                                margin={{ top: 20, right: 30, left: 20, bottom: 80 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                <XAxis
                                    dataKey="departement"
                                    tick={{ fontSize: 12, fill: '#64748b' }}
                                    axisLine={{ stroke: '#e2e8f0' }}
                                    angle={-45}
                                    textAnchor="end"
                                    height={80}
                                />
                                <YAxis
                                    tick={{ fontSize: 12, fill: '#64748b' }}
                                    axisLine={{ stroke: '#e2e8f0' }}
                                    label={{ value: 'Nombre d\'employés', angle: -90, position: 'insideLeft' }}
                                />
                                <Tooltip
                                    formatter={(value: number, name: string) => {
                                        return [`${value} employé${value > 1 ? 's' : ''}`, name];
                                    }}
                                    contentStyle={{
                                        backgroundColor: 'white',
                                        border: '1px solid #e2e8f0',
                                        borderRadius: '8px',
                                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                                    }}
                                />
                                <Bar dataKey="< 5000 DH" stackId="salary" fill="#ef4444" name="< 5000 DH" />
                                <Bar dataKey="5000-8000 DH" stackId="salary" fill="#f59e0b" name="5000-8000 DH" />
                                <Bar dataKey="8000-12000 DH" stackId="salary" fill="#10b981" name="8000-12000 DH" />
                                <Bar dataKey="12000-20000 DH" stackId="salary" fill="#3b82f6" name="12000-20000 DH" />
                                <Bar dataKey="> 20000 DH" stackId="salary" fill="#8b5cf6" name="> 20000 DH" />
                            </BarChart>
                        </ResponsiveContainer>

                        {/* Légende et statistiques sous le graphique */}
                        <div className="mt-6 space-y-4">
                            {/* Légende des couleurs */}
                            <div className="flex flex-wrap gap-4 justify-center">
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 bg-red-500 rounded"></div>
                                    <span className="text-sm text-slate-600">&lt; 5000 DH</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 bg-orange-500 rounded"></div>
                                    <span className="text-sm text-slate-600">5000-8000 DH</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 bg-green-500 rounded"></div>
                                    <span className="text-sm text-slate-600">8000-12000 DH</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 bg-blue-500 rounded"></div>
                                    <span className="text-sm text-slate-600">12000-20000 DH</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 bg-purple-500 rounded"></div>
                                    <span className="text-sm text-slate-600">&gt; 20000 DH</span>
                                </div>
                            </div>

                            {/* Tableau récapitulatif amélioré */}
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-slate-200">
                                            <th className="text-left py-2 px-3 font-medium text-slate-700">Département</th>
                                            <th className="text-right py-2 px-3 font-medium text-slate-700">Total Employés</th>
                                            <th className="text-right py-2 px-3 font-medium text-slate-700">Masse Salariale</th>
                                            <th className="text-right py-2 px-3 font-medium text-slate-700">Salaire Moyen</th>
                                            <th className="text-center py-2 px-3 font-medium text-slate-700">Répartition Dominante</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {(data.salaryDistribution || []).map((dept, index) => {
                                            if (!dept.tranches) {
                                                console.warn('⚠️ Département sans données de tranches:', dept.departement);
                                                return (
                                                    <tr key={index} className="border-b border-slate-100 hover:bg-slate-50">
                                                        <td className="py-2 px-3 font-medium text-slate-900">{dept.departement}</td>
                                                        <td className="py-2 px-3 text-right text-slate-600">{dept.nombreEmployes || 0}</td>
                                                        <td className="py-2 px-3 text-right text-slate-600">{(dept.masseSalariale || 0).toLocaleString()} DH</td>
                                                        <td className="py-2 px-3 text-right text-slate-600">{(dept.salaireMoyen || 0).toLocaleString()} DH</td>
                                                        <td className="py-2 px-3 text-center">
                                                            <Badge className="bg-gray-100 text-gray-700 text-xs px-2 py-1">
                                                                Données manquantes
                                                            </Badge>
                                                        </td>
                                                    </tr>
                                                );
                                            }

                                            const totalTranches = Object.values(dept.tranches);
                                            const maxTranche = Math.max(...totalTranches);
                                            const dominantTranche = Object.entries(dept.tranches).find(
                                                ([_, value]) => value === maxTranche
                                            );

                                            let dominantRange = '';
                                            let dominantColor = '';

                                            switch (dominantTranche?.[0]) {
                                                case 'moins_5000':
                                                    dominantRange = '< 5000 DH';
                                                    dominantColor = 'bg-red-100 text-red-700';
                                                    break;
                                                case '_5000_8000':
                                                    dominantRange = '5000-8000 DH';
                                                    dominantColor = 'bg-orange-100 text-orange-700';
                                                    break;
                                                case '_8000_12000':
                                                    dominantRange = '8000-12000 DH';
                                                    dominantColor = 'bg-green-100 text-green-700';
                                                    break;
                                                case '_12000_20000':
                                                    dominantRange = '12000-20000 DH';
                                                    dominantColor = 'bg-blue-100 text-blue-700';
                                                    break;
                                                case 'plus_20000':
                                                    dominantRange = '> 20000 DH';
                                                    dominantColor = 'bg-purple-100 text-purple-700';
                                                    break;
                                                default:
                                                    dominantRange = 'Non défini';
                                                    dominantColor = 'bg-gray-100 text-gray-700';
                                            }

                                            return (
                                                <tr key={index} className="border-b border-slate-100 hover:bg-slate-50">
                                                    <td className="py-2 px-3 font-medium text-slate-900">{dept.departement}</td>
                                                    <td className="py-2 px-3 text-right text-slate-600">{dept.nombreEmployes}</td>
                                                    <td className="py-2 px-3 text-right text-slate-600">{dept.masseSalariale.toLocaleString()} DH</td>
                                                    <td className="py-2 px-3 text-right text-slate-600">{dept.salaireMoyen.toLocaleString()} DH</td>
                                                    <td className="py-2 px-3 text-center">
                                                        <Badge className={`${dominantColor} text-xs px-2 py-1`}>
                                                            {dominantRange} ({maxTranche} emp.)
                                                        </Badge>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Section Éléments Variables */}
            <Card className="bg-white border-slate-200 shadow-sm">
                <CardHeader className="pb-3">
                    <CardTitle className="text-slate-900 font-semibold flex items-center gap-2">
                        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                            <CreditCard className="w-4 h-4 text-white" />
                        </div>
                        Éléments Variables
                    </CardTitle>
                    <CardDescription className="text-slate-600">Budget vs réalisé par catégorie</CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {data.variableElements.map((item, index) => (
                            <div key={index} className="border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                                <div className="flex justify-between items-start mb-3">
                                    <span className="text-sm font-medium text-slate-700">{item.element}</span>
                                    <Badge
                                        variant="outline"
                                        className={`${item.taux <= 100 ? 'bg-green-50 text-green-700 border-green-200' :
                                            item.taux <= 110 ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                                                'bg-red-50 text-red-700 border-red-200'
                                            }`}
                                    >
                                        {item.taux}%
                                    </Badge>
                                </div>
                                <Progress
                                    value={Math.min(item.taux, 100)}
                                    className={`h-2 mb-3 ${item.taux <= 100 ? '[&>div]:bg-green-500' :
                                        item.taux <= 110 ? '[&>div]:bg-yellow-500' :
                                            '[&>div]:bg-red-500'
                                        }`}
                                />
                                <div className="flex justify-between items-center">
                                    <span className="text-xs text-slate-500">
                                        {item.consomme.toLocaleString()}DH / {item.budget.toLocaleString()}DH
                                    </span>
                                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${item.impact === 'Positif' || item.impact === 'Conforme' ? 'bg-green-100 text-green-600' :
                                        item.impact === 'Sous-consommé' ? 'bg-blue-100 text-blue-600' : 'bg-red-100 text-red-600'
                                        }`}>
                                        {item.impact}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Section Actions et Recommandations Paie */}
            <Card className="bg-white border-slate-200 shadow-sm">
                <CardHeader className="pb-3">
                    <CardTitle className="text-slate-900 font-semibold flex items-center gap-2">
                        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                            <Target className="w-4 h-4 text-white" />
                        </div>
                        Actions Prioritaires Paie
                    </CardTitle>
                    <CardDescription className="text-slate-600">Recommandations intelligentes basées sur l'analyse des données</CardDescription>
                </CardHeader>
                <CardContent className="pt-0 space-y-4">
                    {data.complianceActions.map((action) => {
                        const config = getPriorityConfig(action.priority);
                        return (
                            <div key={action.id} className={`border-l-4 ${config.borderColor} ${config.bgColor} p-4 rounded-r-lg transition-all hover:shadow-md`}>
                                <div className="flex justify-between items-start mb-3">
                                    <span className={`text-sm font-semibold ${config.textColor}`}>
                                        {action.priority === 'urgent' ? '🚨 Urgent - ' :
                                            action.priority === 'attention' ? '⚠️ Attention - ' :
                                                action.priority === 'opportunity' ? '💡 Opportunité - ' : '✅ Succès - '}
                                        {action.title}
                                    </span>
                                    <div className="flex items-center gap-2">
                                        {action.deadline && (
                                            <Badge variant="outline" className={config.badgeClass}>
                                                <Calendar className="w-3 h-3 mr-1" />
                                                {action.deadline}
                                            </Badge>
                                        )}
                                        {action.progress && (
                                            <Badge variant="outline" className={config.badgeClass}>
                                                {action.progress}%
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                                <p className={`text-sm ${config.textColor.replace('800', '700')} mb-3`}>
                                    {action.description}
                                </p>
                                <div className={`text-xs ${config.textColor.replace('800', '600')} space-y-1`}>
                                    {action.actions.map((actionItem, index) => (
                                        <div key={index} className="flex items-start gap-2">
                                            <span className="text-xs mt-0.5">•</span>
                                            <span>{actionItem}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </CardContent>
            </Card>

            {/* Section Performance et Conformité - Modules futurs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="bg-white border-slate-200 shadow-sm">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-slate-900 font-semibold flex items-center gap-2">
                            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                                <Shield className="w-4 h-4 text-white" />
                            </div>
                            Radar Conformité Paie
                        </CardTitle>
                        <CardDescription className="text-slate-600">Évaluation multidimensionnelle du processus</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0">
                        <Alert className="border-blue-200 bg-blue-50">
                            <Shield className="h-4 w-4 text-blue-600" />
                            <AlertDescription className="text-blue-800">
                                <strong>Module en développement</strong><br />
                                Intégration prévue Q3 2024 - Données de conformité légale et audit automatisé
                            </AlertDescription>
                        </Alert>
                    </CardContent>
                </Card>

                <Card className="bg-white border-slate-200 shadow-sm">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-slate-900 font-semibold flex items-center gap-2">
                            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                                <Award className="w-4 h-4 text-white" />
                            </div>
                            Benchmark Salaires vs Marché
                        </CardTitle>
                        <CardDescription className="text-slate-600">Positionnement concurrentiel par poste</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0">
                        <Alert className="border-blue-200 bg-blue-50">
                            <Award className="h-4 w-4 text-blue-600" />
                            <AlertDescription className="text-blue-800">
                                <strong>Module en développement</strong><br />
                                Intégration prévue Q4 2024 - Données marché et analyse comparative
                            </AlertDescription>
                        </Alert>
                    </CardContent>
                </Card>
            </div>

            {/* Footer avec informations sur les données */}
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                <div className="flex items-center justify-between text-xs text-slate-600">
                    <div className="flex items-center gap-4">
                        <span>📊 Données mises à jour automatiquement toutes les 5 minutes</span>
                        <span>🔒 Conforme RGPD et sécurité bancaire</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span>Dernière synchronisation :</span>
                        <Badge variant="outline" className="bg-white text-slate-600 border-slate-300">
                            {new Date(data.lastUpdate).toLocaleString('fr-FR')}
                        </Badge>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PayrollModule;