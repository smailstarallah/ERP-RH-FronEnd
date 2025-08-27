import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useEffect, useState } from 'react'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, LabelList } from 'recharts';
import { addDays, differenceInMinutes, format, isSameDay, parseISO, startOfWeek } from "date-fns";
import { fr } from 'date-fns/locale';

type Punch = {
    id: string;
    employee: string;
    start: string; // ISO
    end?: string;  // ISO (if still running -> undefined)
    pauses: { start: string; end?: string }[];
    note?: string;
};

function range(n: number) { return Array.from({ length: n }).map((_, i) => i); }

function sumMinutes(p: Punch) {
    const end = p.end ? parseISO(p.end) : new Date();
    let total = differenceInMinutes(end, parseISO(p.start));
    for (const pause of p.pauses || []) {
        const pEnd = pause.end ? parseISO(pause.end) : new Date();
        total -= differenceInMinutes(pEnd, parseISO(pause.start));
    }
    return Math.max(0, total);
}

function minutesOnDate(punches: Punch[], d: Date) {
    return punches
        .filter(p => isSameDay(parseISO(p.start), d))
        .reduce((acc, p) => acc + sumMinutes(p), 0);
}

export default function EffectivenessChart() {
    const [data, setData] = useState<{ name: string; total: number }[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });

        const fetchData = async () => {
            setLoading(true);
            setError(null);
            try {
                const userData = localStorage.getItem('userData');
                const empId = userData ? JSON.parse(userData).id : null;
                if (!empId) throw new Error('Utilisateur non identifié');

                const mondayStr = format(weekStart, 'yyyy-MM-dd');
                const url = `http://localhost:8080/api/pointages/${empId}/week?start=${mondayStr}`;
                const token = localStorage.getItem('token') || '';

                const res = await fetch(url, {
                    headers: token ? { 'Authorization': `Bearer ${token}` } : {}
                });
                console.log('Fetch Response:', res);
                if (!res.ok) throw new Error(`Erreur ${res.status}`);
                const days = await res.json();
                // If API returns aggregated days (with date/totalMinutes) use them.
                if (Array.isArray(days) && days.length > 0 && days[0].date) {
                    const mapped = range(7).map(i => {
                        const d = addDays(weekStart, i);
                        const dateStr = format(d, 'yyyy-MM-dd');
                        const dayObj = days.find((x: any) => x.date === dateStr) || null;
                        const totalMin = dayObj ? (dayObj.totalMinutes ?? Math.round((dayObj.totalHours ?? 0) * 60)) : 0;
                        const name = dayObj && dayObj.name ? dayObj.name : format(d, 'EE', { locale: fr });
                        return { name, total: Math.round(totalMin / 60) };
                    });
                    // hide zero-days
                    const visible = mapped.filter(m => m.total > 0);
                    setData(visible);
                } else if (Array.isArray(days) && days.length > 0 && days[0].start) {
                    // API returned raw punches - aggregate locally
                    const punches = days as Punch[];
                    const mapped = range(7).map(i => {
                        const d = addDays(weekStart, i);
                        const totalMin = minutesOnDate(punches, d);
                        return { name: format(d, 'EE', { locale: fr }), total: Math.round(totalMin / 60) };
                    });
                    const visible = mapped.filter(m => m.total > 0);
                    setData(visible);
                } else {
                    // empty or unexpected format -> return zeros
                    setData([]);
                }
            } catch (err: any) {
                setError(err.message || 'Erreur de récupération');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    return (
        <Card>
            <CardHeader>
                <CardTitle>Efficacité hebdomadaire</CardTitle>
                <CardDescription>Heures total par jour</CardDescription>
            </CardHeader>
            <CardContent className="h-56 overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center h-full">Chargement...</div>
                ) : error ? (
                    <div className="text-red-600">{error}</div>
                ) : (
                    <>
                        {data.length === 0 ? (
                            <div className="flex items-center justify-center h-full text-sm text-slate-600">Aucune activité enregistrée cette semaine.</div>
                        ) : (
                            <>
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={data} margin={{ left: 0, right: 4, top: 28, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="grad" x1="0" x2="0" y1="0" y2="1">
                                                <stop offset="0%" stopColor="#60a5fa" stopOpacity={0.95} />
                                                <stop offset="100%" stopColor="#60a5fa" stopOpacity={0.3} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#e6eef8" />
                                        <XAxis dataKey="name" tick={{ fill: '#475569', fontSize: 12 }} axisLine={false} />
                                        <YAxis tickFormatter={(v) => `${v}h`} allowDecimals={false} tick={{ fill: '#475569', fontSize: 12 }} />
                                        <Tooltip formatter={(value: number) => `${value} h`} labelFormatter={(label) => `Jour: ${label}`} />
                                        <Bar dataKey="total" fill="url(#grad)" barSize={28} radius={[6, 6, 0, 0]}>
                                            <LabelList dataKey="total" position="insideTop" style={{ fill: '#0f172a', fontSize: 11 }} formatter={(label: any) => `${label}h`} />
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </>
                        )}
                    </>
                )}
            </CardContent>
        </Card>
    );
}
