import React, { useCallback, useEffect, useMemo, useState } from 'react';
import KPICard from './KPICard';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend,
} from 'recharts';
import { CalendarDays, Users, AlertTriangle, TrendingUp, ChartLine, Clock } from 'lucide-react';
import { useDashboardData } from './useDashboardData';

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

    const topLevelColors = useMemo(() => typedData.leaveTypeColors ?? {}, [typedData.leaveTypeColors]);

    const getColor = useCallback(
        (key: string) => {

            if (topLevelColors && topLevelColors[key]) return topLevelColors[key];

            for (const item of leaveData) {
                if (item.leaveTypeColors && item.leaveTypeColors[key]) return item.leaveTypeColors[key];
            }
            return '#cccccc';
        },
        [topLevelColors, leaveData]
    );


    if (loading || !data) {
        return (
            <div className="space-y-6 animate-pulse">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="h-20 rounded bg-gray-200 dark:bg-gray-700" />
                    <div className="h-20 rounded bg-gray-200 dark:bg-gray-700" />
                    <div className="h-20 rounded bg-gray-200 dark:bg-gray-700" />
                    <div className="h-20 rounded bg-gray-200 dark:bg-gray-700" />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="h-72 rounded bg-gray-200 dark:bg-gray-700" />
                    <div className="h-72 rounded bg-gray-200 dark:bg-gray-700" />
                    <div className="h-72 rounded bg-gray-200 dark:bg-gray-700" />
                    <div className="h-72 rounded bg-gray-200 dark:bg-gray-700" />
                    <div className="h-72 rounded bg-gray-200 dark:bg-gray-700" />
                    <div className="h-72 rounded bg-gray-200 dark:bg-gray-700" />
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
                })
                }
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Consommation par Département</CardTitle>
                        <CardDescription>Répartition des congés par type et département</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={350}>
                            <BarChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="department" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                {leaveTypesKeys.map((key) => (
                                    <Bar key={key} dataKey={key} stackId="a" fill={getColor(key)} name={key} />
                                ))}
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

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
                                    label={({ name, percent = 0 }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {leaveTypeData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color ?? getColor(entry.name)} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

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
                            <Badge variant="destructive" className="mt-1">
                                Seuil d'alerte atteint
                            </Badge>
                        </div>

                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-sm font-medium">Absences répétées</span>
                                <span className="text-sm text-gray-600">3 salariés</span>
                            </div>
                            <Alert>
                                <AlertTriangle className="h-4 w-4" />
                                <AlertDescription>3 employés avec + de 4 arrêts courts ce trimestre</AlertDescription>
                            </Alert>
                        </div>
                    </CardContent>
                </Card>

                {/* Congés pris vs alloués */}
                <Card>
                    <CardHeader>
                        <CardTitle>Congés pris vs alloués (par employé)</CardTitle>
                        <CardDescription>
                            <div className="flex items-center gap-2">
                                <label className="text-sm">Département:</label>
                                <select
                                    aria-label="Département"
                                    className="border rounded p-1"
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
                    <CardContent className="h-72">
                        {congesBySelected && congesBySelected.length ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={congesBySelected}>
                                    <XAxis dataKey="employe" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="pris" fill="#8884d8" name="Pris" />
                                    <Bar dataKey="alloues" fill="#82ca9d" name="Alloués" />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="p-4 text-sm text-gray-600">Aucune donnée pour ce département.</div>
                        )}
                    </CardContent>
                </Card>

                {/* Solde de congés restants */}
                <Card>
                    <CardHeader>
                        <CardTitle>Solde de congés restants</CardTitle>
                        <CardDescription>
                            <div className="text-sm">Département sélectionné: {selectedDept || 'Tous'}</div>
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {soldeBySelected && soldeBySelected.length ? (
                            <table className="w-full border-collapse">
                                <thead>
                                    <tr className="bg-gray-100">
                                        <th className="p-2 text-left">Employé</th>
                                        <th className="p-2">Solde</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {soldeBySelected.map((e, i) => (
                                        <tr key={i} className="border-b">
                                            <td className="p-2">{e.employe}</td>
                                            <td className="p-2 text-center">{e.solde}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <div className="p-4 text-sm text-gray-600">Aucune donnée de solde pour ce département.</div>
                        )}
                    </CardContent>
                </Card>

                {/* Absences par jour de la semaine */}
                <Card>
                    <CardHeader>
                        <CardTitle>Absences par jour de la semaine</CardTitle>
                    </CardHeader>
                    <CardContent className="h-72">
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={absencesParJourSemaine}>
                                <XAxis dataKey="jour" />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="absences" fill="#ffc658" />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>
        </>
    );
};

export default LeavesModule;
