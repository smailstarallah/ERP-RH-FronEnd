import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, ScatterChart, Scatter, Area, AreaChart } from 'recharts';
import { useMemo } from 'react';
import { ArrowDownRight, ArrowUpRight, BarChart2 } from 'lucide-react';
import { CalendarCheck, ShieldCheck, Target } from 'lucide-react';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

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

    const employee_projectDistribution = [
        { name: 'Plateforme Aura', value: 85 },
        { name: 'App Nexus', value: 45 },
        { name: 'Réunions & Admin', value: 20 },
    ];

    return { rh_overtimeTrend, rh_topOvertimeEmployees, rh_kpis, pm_projectHealth, pm_taskTypeDistribution, pm_burnDownChart, employee_weeklyFocus, employee_skillRadar, employee_kpis, employee_projectDistribution };
};
export const KpiAndStatistics = () => {
    const data = useMemo(() => generateAdvancedSyntheticData(), []);

    return (
        <div>
            <div>
                <h2 className="text-2xl font-bold tracking-tight mb-4 flex items-center gap-2"><BarChart2 className="text-green-500" /> Ma Vue Personnelle (Alice)</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                    <KpiCard title="Taux de Focus Hebdomadaire" value={`${data.employee_kpis.avgFocus}`} icon={Target} description="Temps sur tâches / Temps de présence" />
                    <KpiCard title="Jour le plus productif" value={data.employee_kpis.mostProductiveDay} icon={CalendarCheck} />
                    <KpiCard title="Tâches terminées" value={data.employee_kpis.totalTasksCompleted} icon={ShieldCheck} />
                </div>
                <div className="grid grid-cols-1 gap-6">
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

                </div>
            </div>
            <div>
                <h2 className="text-2xl font-bold tracking-tight mb-4 flex items-center gap-2"><BarChart2 className="text-green-500" /> Vue Employé (Alice)</h2>
                <div className="grid grid-cols-1  gap-6">
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
    )
}
