import React, { useEffect, useMemo, useState } from 'react';
import KPICard from './KPICard';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
} from 'recharts';
import { CalendarDays, Users, AlertTriangle, TrendingUp, ChartLine, Clock, Target, Activity, Heart, ShieldAlert, CheckCircle } from 'lucide-react';
import { useDashboardData } from './useDashboardData';

// Schéma colorimétrique institutionnel identique à TimeModule
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

/**
 * Strict typing for dashboard data coming from useDashboardData
 */
interface LeaveTypesMap {
    [key: string]: number;
}

interface LeaveData {
    department?: string;
    departement?: string;
    leaveTypes?: LeaveTypesMap;
    leaveTypeColors?: Record<string, string>;
}

interface LeaveType {
    name: string;
    value: number;
    color?: string;
}

interface MonthlyTrend {
    month: string;
    current: number;
    previous?: number;
}

interface CongesAlloues {
    department?: string;
    departement?: string;
    employe?: string;
    pris?: number;
    alloues?: number;
}

interface SoldeConges {
    department?: string;
    departement?: string;
    employe?: string;
    solde?: number | string;
}

interface AbsenceByDay {
    jour: string;
    absences: number;
}

interface DashboardData {
    leaveData?: LeaveData[];
    leaveTypeData?: LeaveType[];
    monthlyTrendData?: MonthlyTrend[];
    congesVsAlloues?: CongesAlloues[];
    soldeConges?: SoldeConges[];
    absencesParJourSemaine?: AbsenceByDay[];
    leaveTypeColors?: Record<string, string>;
}

const LeavesModule: React.FC = () => {
    const { data, loading, kpiList } = useDashboardData();

    // KPI status union matching KPICard expected values
    type KPIStatus = 'success' | 'neutral' | 'warning' | 'danger';

    // API returns a list of KPI objects (shape documented in code comments)

    // normalize helpers
    const normalizeStatus = (s: any): KPIStatus | undefined => {
        if (s == null) return undefined;
        const allowed = new Set<KPIStatus>(['success', 'neutral', 'warning', 'danger']);
        if (typeof s === 'string') {
            const low = s.toLowerCase();
            if (allowed.has(low as KPIStatus)) return low as KPIStatus;
        }
        return undefined;
    };

    const getIconComponent = (icon?: string) => {
        if (!icon) return Users;
        switch ((icon || '').toLowerCase()) {
            case 'calendar-days':
            case 'calendar':
                return CalendarDays;
            case 'chart-line':
            case 'chart':
                return ChartLine;
            case 'users':
                return Users;
            case 'clock':
                return Clock;
            case 'alert-triangle':
            case 'alert':
                return AlertTriangle;
            case 'trending-up':
            case 'trending':
                return TrendingUp;
            default:
                return Users;
        }
    };

    // Safe, typed defaults
    const typedData = (data ?? {}) as DashboardData;
    const leaveData = Array.isArray(typedData.leaveData) ? typedData.leaveData : ([] as LeaveData[]);
    const leaveTypeData = Array.isArray(typedData.leaveTypeData) ? typedData.leaveTypeData : ([] as LeaveType[]);
    const monthlyTrendData = Array.isArray(typedData.monthlyTrendData) ? typedData.monthlyTrendData : ([] as MonthlyTrend[]);
    const congesVsAlloues = Array.isArray(typedData.congesVsAlloues) ? typedData.congesVsAlloues : ([] as CongesAlloues[]);
    const soldeConges = Array.isArray(typedData.soldeConges) ? typedData.soldeConges : ([] as SoldeConges[]);
    const absencesParJourSemaine = Array.isArray(typedData.absencesParJourSemaine)
        ? typedData.absencesParJourSemaine
        : ([] as AbsenceByDay[]);

    // UI state
    const [selectedDept, setSelectedDept] = useState<string>('');

    // Memoized derived values for performance
    const departments = useMemo<string[]>(() => {
        if (!leaveData || leaveData.length === 0) return [];
        const setDeps = new Set<string>();
        for (const d of leaveData) {
            const val = String(d.department ?? d.departement ?? '').trim();
            if (val) setDeps.add(val);
        }
        return Array.from(setDeps);
    }, [leaveData]);

    useEffect(() => {
        if (departments.length && !selectedDept) {
            setSelectedDept(departments[0]);
        }
        // Intentionally only depend on departments to set initial selection
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [departments]);

    const leaveTypesKeys = useMemo<string[]>(() => {
        if (!leaveData || leaveData.length === 0) return [];
        const first = leaveData.find((d) => d.leaveTypes && Object.keys(d.leaveTypes!).length > 0);
        return first ? Object.keys(first.leaveTypes!) : [];
    }, [leaveData]);

    const chartData = useMemo(() => {
        return leaveData.map((d) => ({
            department: d.department ?? d.departement ?? '—',
            ...(d.leaveTypes ?? {}),
        }));
    }, [leaveData]);

    const congesBySelected = useMemo(() => {
        if (!selectedDept) return congesVsAlloues;
        return congesVsAlloues.filter(
            (c) => c.department === selectedDept || c.departement === selectedDept
        );
    }, [congesVsAlloues, selectedDept]);

    const soldeBySelected = useMemo(() => {
        if (!selectedDept) return soldeConges;
        return soldeConges.filter((s) => s.department === selectedDept || s.departement === selectedDept);
    }, [soldeConges, selectedDept]);

    if (loading || !data) {
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
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="h-72 bg-slate-200 rounded-lg"></div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-3 lg:space-y-4">
            {/* Header Section avec métriques institutionnelles */}
            <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 space-y-3 sm:space-y-0">
                    <div>
                        <h2 className="text-lg sm:text-xl font-semibold text-slate-900">Analyse Gestion des Congés</h2>
                        <p className="text-sm text-slate-600 mt-1">Tableau de bord institutionnel de suivi des absences et congés</p>
                    </div>
                    <div className="flex items-center space-x-2 flex-wrap gap-2">
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-xs">
                            <CalendarDays className="w-3 h-3 mr-1" />
                            Juin 2025
                        </Badge>
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-xs">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Conformité RH
                        </Badge>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                    {kpiList.slice(0, 4).map((item, i) => {
                        const rawValue = item.value;
                        const formattedValue =
                            typeof rawValue === 'number'
                                ? (Number.isInteger(rawValue) ? rawValue : Number(rawValue.toFixed(2)))
                                : rawValue ?? '—';

                        const formattedChange = typeof item.change === 'number' ? Number(item.change.toFixed(2)) : undefined;

                        return (
                            <KPICard
                                key={i}
                                title={item.title}
                                value={formattedValue}
                                unit={item.unit ?? ''}
                                change={formattedChange}
                                icon={getIconComponent(item.icon)}
                                status={normalizeStatus(item.status) ?? 'neutral'}
                            />
                        );
                    })}
                </div>
            </div>

            {/* Analytics Grid principal avec design institutionnel */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                <Card className="bg-white border border border-slate-200 shadow-sm">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-slate-900 font-semibold flex items-center gap-2">
                            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                                <Users className="w-4 h-4 text-white" />
                            </div>
                            Consommation par Département
                        </CardTitle>
                        <CardDescription className="text-slate-600">Répartition des congés par type et département</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0">
                        <ResponsiveContainer width="100%" height={280}>
                            <BarChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                <XAxis
                                    dataKey="department"
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
                                <Legend />
                                {leaveTypesKeys.map((key, index) => (
                                    <Bar
                                        key={key}
                                        dataKey={key}
                                        stackId="a"
                                        fill={CHART_COLORS[index % CHART_COLORS.length]}
                                        name={key}
                                    />
                                ))}
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Répartition par Type avec style institutionnel */}
                <Card className="bg-white border border border-slate-200 shadow-sm">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-slate-900 font-semibold flex items-center gap-2">
                            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                                <CalendarDays className="w-4 h-4 text-white" />
                            </div>
                            Répartition par Type
                        </CardTitle>
                        <CardDescription className="text-slate-600">Distribution globale des absences</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0">
                        <ResponsiveContainer width="100%" height={280}>
                            <PieChart>
                                <Pie
                                    data={leaveTypeData}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ name, percent = 0 }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {leaveTypeData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color ?? CHART_COLORS[index % CHART_COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'white',
                                        border: '1px solid #e2e8f0',
                                        borderRadius: '8px',
                                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                                    }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Tendances Mensuelles avec style institutionnel */}
                <Card className="bg-white border border border-slate-200 shadow-sm">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-slate-900 font-semibold flex items-center gap-2">
                            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                                <TrendingUp className="w-4 h-4 text-white" />
                            </div>
                            Tendances Mensuelles
                        </CardTitle>
                        <CardDescription className="text-slate-600">Comparaison année actuelle vs précédente</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0">
                        <ResponsiveContainer width="100%" height={280}>
                            <LineChart data={monthlyTrendData}>
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
                                    contentStyle={{
                                        backgroundColor: 'white',
                                        border: '1px solid #e2e8f0',
                                        borderRadius: '8px',
                                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                                    }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="current"
                                    stroke={INSTITUTIONAL_COLORS.primary}
                                    strokeWidth={2}
                                    name="2025"
                                    dot={{ fill: INSTITUTIONAL_COLORS.primary, strokeWidth: 2, r: 3 }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="previous"
                                    stroke={INSTITUTIONAL_COLORS.secondary}
                                    strokeWidth={2}
                                    strokeDasharray="5 5"
                                    name="2024"
                                    dot={{ fill: INSTITUTIONAL_COLORS.secondary, strokeWidth: 2, r: 3 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Alertes & Conformité avec style institutionnel */}
                <Card className="bg-white border border border-slate-200 shadow-sm">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-slate-900 font-semibold flex items-center gap-2">
                            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                                <AlertTriangle className="w-4 h-4 text-white" />
                            </div>
                            Alertes & Conformité
                        </CardTitle>
                        <CardDescription className="text-slate-600">Suivi des indicateurs critiques RH</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0 space-y-4">
                        <div className="border border-slate-200 rounded-lg p-3">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-sm font-medium text-slate-700">Budget congés IT</span>
                                <Badge variant="destructive" className="bg-red-100 text-red-800 border-red-200">Critique</Badge>
                            </div>
                            <Progress
                                value={85}
                                className="h-2 [&>div]:bg-red-500"
                            />
                            <p className="text-xs text-slate-500 mt-1">85% consommé - Seuil d'alerte atteint</p>
                        </div>
                        <div className="border border-slate-200 rounded-lg p-3">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-sm font-medium text-slate-700">Absences répétées</span>
                                <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-200">À surveiller</Badge>
                            </div>
                            <p className="text-xs text-slate-500">3 employés avec + de 4 arrêts courts ce trimestre</p>
                        </div>
                        <div className="border border-slate-200 rounded-lg p-3">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-sm font-medium text-slate-700">Planification équipes</span>
                                <Badge className="bg-green-100 text-green-800 border-green-200">Optimal</Badge>
                            </div>
                            <p className="text-xs text-slate-500">Couverture maintenue sur tous les services</p>
                        </div>
                    </CardContent>
                </Card>

                {/* Congés pris vs alloués avec style institutionnel */}
                <Card className="bg-white border border border-slate-200 shadow-sm">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-slate-900 font-semibold flex items-center gap-2">
                            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                                <Clock className="w-4 h-4 text-white" />
                            </div>
                            Congés pris vs alloués
                        </CardTitle>
                        <CardDescription className="text-slate-600">
                            <div className="flex items-center gap-2 mt-2">
                                <label className="text-sm font-medium">Département:</label>
                                <select
                                    aria-label="Département"
                                    className="px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                                    value={selectedDept}
                                    onChange={(e) => setSelectedDept(e.target.value)}
                                >
                                    {departments.length === 0 ? <option value="">Tous</option> : null}
                                    {departments.map((d) => (
                                        <option key={d} value={d}>
                                            {d}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0">
                        {congesBySelected && congesBySelected.length ? (
                            <ResponsiveContainer width="100%" height={280}>
                                <BarChart data={congesBySelected}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                    <XAxis
                                        dataKey="employe"
                                        tick={{ fontSize: 11, fill: '#64748b' }}
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
                                    <Legend />
                                    <Bar dataKey="pris" fill={INSTITUTIONAL_COLORS.primary} name="Pris" />
                                    <Bar dataKey="alloues" fill={INSTITUTIONAL_COLORS.success} name="Alloués" fillOpacity={0.7} />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex items-center justify-center h-[280px] text-slate-500">
                                <p className="text-sm">Aucune donnée pour ce département.</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Solde de congés restants avec style institutionnel */}
                <Card className="bg-white border border border-slate-200 shadow-sm">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-slate-900 font-semibold flex items-center gap-2">
                            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                                <ChartLine className="w-4 h-4 text-white" />
                            </div>
                            Solde de congés restants
                        </CardTitle>
                        <CardDescription className="text-slate-600">
                            Département sélectionné: {selectedDept || 'Tous'}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0">
                        {soldeBySelected && soldeBySelected.length ? (
                            <div className="max-h-[280px] overflow-y-auto">
                                <table className="w-full">
                                    <thead className="bg-slate-50 sticky top-0">
                                        <tr>
                                            <th className="p-3 text-left text-sm font-medium text-slate-700 border-b border-slate-200">Employé</th>
                                            <th className="p-3 text-center text-sm font-medium text-slate-700 border-b border-slate-200">Solde</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {soldeBySelected.map((e, i) => (
                                            <tr key={i} className="border-b border-slate-100 hover:bg-slate-50">
                                                <td className="p-3 text-sm text-slate-900">{e.employe}</td>
                                                <td className="p-3 text-center">
                                                    <Badge
                                                        variant="outline"
                                                        className={`${Number(e.solde) > 10
                                                            ? 'bg-green-50 text-green-700 border-green-200'
                                                            : Number(e.solde) > 5
                                                                ? 'bg-yellow-50 text-yellow-700 border-yellow-200'
                                                                : 'bg-red-50 text-red-700 border-red-200'
                                                            }`}
                                                    >
                                                        {e.solde}j
                                                    </Badge>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="flex items-center justify-center h-[280px] text-slate-500">
                                <p className="text-sm">Aucune donnée de solde pour ce département.</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Absences par jour de la semaine avec style institutionnel */}
                <Card className="bg-white border border border-slate-200 shadow-sm">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-slate-900 font-semibold flex items-center gap-2">
                            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                                <CalendarDays className="w-4 h-4 text-white" />
                            </div>
                            Absences par jour de la semaine
                        </CardTitle>
                        <CardDescription className="text-slate-600">Analyse des tendances hebdomadaires</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0">
                        <ResponsiveContainer width="100%" height={280}>
                            <BarChart data={absencesParJourSemaine}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                <XAxis
                                    dataKey="jour"
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
                                <Bar
                                    dataKey="absences"
                                    fill={INSTITUTIONAL_COLORS.warning}
                                    radius={[4, 4, 0, 0]}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>
            <div className="mt-6 mb-0">
                <span className="ml-2 px-2 py-0.5 text-xs bg-yellow-100 text-yellow-800 rounded-full font-medium">(avec données statiques provisoires, à améliorer ultérieurement à titre d’exemple)</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                <Card className="bg-white border border-slate-200 shadow-sm">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-slate-900 font-semibold flex items-center gap-2">
                            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                                <TrendingUp className="w-4 h-4 text-white" />
                            </div>
                            Prédiction des Congés
                        </CardTitle>
                        <CardDescription className="text-slate-600">Tendances prévisionnelles sur 6 mois</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0">
                        <ResponsiveContainer width="100%" height={200}>
                            <LineChart
                                data={[
                                    { mois: 'Juil', prevu: 18, actuel: 15, tendance: 16 },
                                    { mois: 'Août', prevu: 25, actuel: 22, tendance: 24 },
                                    { mois: 'Sept', prevu: 12, actuel: 14, tendance: 13 },
                                    { mois: 'Oct', prevu: 8, actuel: null, tendance: 9 },
                                    { mois: 'Nov', prevu: 15, actuel: null, tendance: 14 },
                                    { mois: 'Déc', prevu: 22, actuel: null, tendance: 20 }
                                ]}
                            >
                                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                <XAxis
                                    dataKey="mois"
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
                                    dataKey="actuel"
                                    stroke={INSTITUTIONAL_COLORS.primary}
                                    strokeWidth={2}
                                    dot={{ fill: INSTITUTIONAL_COLORS.primary, strokeWidth: 2, r: 3 }}
                                    name="Réalisé"
                                />
                                <Line
                                    type="monotone"
                                    dataKey="prevu"
                                    stroke={INSTITUTIONAL_COLORS.secondary}
                                    strokeWidth={2}
                                    strokeDasharray="5 5"
                                    dot={{ fill: INSTITUTIONAL_COLORS.secondary, strokeWidth: 2, r: 3 }}
                                    name="Prévu"
                                />
                                <Line
                                    type="monotone"
                                    dataKey="tendance"
                                    stroke={INSTITUTIONAL_COLORS.success}
                                    strokeWidth={2}
                                    dot={{ fill: INSTITUTIONAL_COLORS.success, strokeWidth: 2, r: 3 }}
                                    name="Tendance IA"
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Module Impact Opérationnel */}
                <Card className="bg-white border border-slate-200 shadow-sm">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-slate-900 font-semibold flex items-center gap-2">
                            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                                <Activity className="w-4 h-4 text-white" />
                            </div>
                            Impact Opérationnel
                        </CardTitle>
                        <CardDescription className="text-slate-600">Analyse des risques de sous-effectif</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0">
                        <ResponsiveContainer width="100%" height={200}>
                            <BarChart
                                data={[
                                    { service: 'IT', risque: 85, couverture: 65, critique: true },
                                    { service: 'RH', risque: 45, couverture: 80, critique: false },
                                    { service: 'Compta', risque: 60, couverture: 70, critique: false },
                                    { service: 'Ventes', risque: 30, couverture: 85, critique: false },
                                    { service: 'Support', risque: 70, couverture: 60, critique: true }
                                ]}
                            >
                                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                <XAxis
                                    dataKey="service"
                                    tick={{ fontSize: 11, fill: '#64748b' }}
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
                                <Bar dataKey="risque" fill={INSTITUTIONAL_COLORS.danger} name="Risque %" radius={[2, 2, 0, 0]} />
                                <Bar dataKey="couverture" fill={INSTITUTIONAL_COLORS.success} name="Couverture %" radius={[2, 2, 0, 0]} fillOpacity={0.7} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                <Card className="bg-white border border-slate-200 shadow-sm">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-slate-900 font-semibold flex items-center gap-2">
                            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                                <Heart className="w-4 h-4 text-white" />
                            </div>
                            Bien-être & Équilibre
                        </CardTitle>
                        <CardDescription className="text-slate-600">Indicateurs de qualité de vie au travail</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0 space-y-3">
                        {[
                            { indicateur: 'Équilibre vie-travail', valeur: 78, cible: 75, statut: 'success' },
                            { indicateur: 'Stress lié aux congés', valeur: 25, cible: 30, statut: 'success' },
                            { indicateur: 'Satisfaction planification', valeur: 82, cible: 80, statut: 'success' },
                            { indicateur: 'Retours au travail', valeur: 65, cible: 70, statut: 'warning' }
                        ].map((item, index) => (
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

            <div className="grid grid-cols-1 gap-3">
                <Card className="bg-white border border-slate-200 shadow-sm">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-slate-900 font-semibold flex items-center gap-2">
                            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                                <Users className="w-4 h-4 text-white" />
                            </div>
                            Analyse des Équipes & Conformité <span className="ml-2 px-2 py-0.5 text-xs bg-yellow-100 text-yellow-800 rounded-full font-medium">(avec données statiques provisoires, à améliorer ultérieurement à titre d’exemple)</span>
                        </CardTitle>
                        <CardDescription className="text-slate-600">Performance et respect des réglementations par équipe</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
                            {[
                                { equipe: 'Développement', planification: 92, urgence: 8, conformite: 95, satisfaction: 88 },
                                { equipe: 'Design', planification: 85, urgence: 15, conformite: 90, satisfaction: 82 },
                                { equipe: 'Support', planification: 78, urgence: 22, conformite: 88, satisfaction: 75 },
                                { equipe: 'Marketing', planification: 88, urgence: 12, conformite: 92, satisfaction: 90 },
                                { equipe: 'Ventes', planification: 82, urgence: 18, conformite: 89, satisfaction: 85 }
                            ].map((team, index) => (
                                <div key={index} className="border border-slate-200 rounded-lg p-4 text-center">
                                    <h4 className="font-semibold text-slate-900 mb-3">{team.equipe}</h4>
                                    <div className="space-y-3">
                                        <div>
                                            <div className="flex justify-between items-center mb-1">
                                                <span className="text-xs text-slate-600">Planification</span>
                                                <span className="text-xs font-semibold text-blue-600">{team.planification}%</span>
                                            </div>
                                            <Progress value={team.planification} className="h-2 [&>div]:bg-blue-500" />
                                        </div>
                                        <div>
                                            <div className="flex justify-between items-center mb-1">
                                                <span className="text-xs text-slate-600">Conformité</span>
                                                <span className="text-xs font-semibold text-green-600">{team.conformite}%</span>
                                            </div>
                                            <Progress value={team.conformite} className="h-2 [&>div]:bg-green-500" />
                                        </div>
                                        <div>
                                            <div className="flex justify-between items-center mb-1">
                                                <span className="text-xs text-slate-600">Urgences</span>
                                                <span className={`text-xs font-semibold ${team.urgence > 20 ? 'text-red-600' : team.urgence > 10 ? 'text-yellow-600' : 'text-green-600'}`}>
                                                    {team.urgence}%
                                                </span>
                                            </div>
                                            <Progress
                                                value={team.urgence}
                                                className={`h-2 ${team.urgence > 20 ? '[&>div]:bg-red-500' : team.urgence > 10 ? '[&>div]:bg-yellow-500' : '[&>div]:bg-green-500'}`}
                                            />
                                        </div>
                                        <div>
                                            <div className="flex justify-between items-center mb-1">
                                                <span className="text-xs text-slate-600">Satisfaction</span>
                                                <span className="text-xs font-semibold text-purple-600">{team.satisfaction}%</span>
                                            </div>
                                            <Progress value={team.satisfaction} className="h-2 [&>div]:bg-purple-500" />
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

export default LeavesModule;
