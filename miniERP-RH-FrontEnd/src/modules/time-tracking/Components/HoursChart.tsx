import { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Clock, Loader2 } from 'lucide-react';


interface TeamStatus {
    employeeId: string;
    employeeName: string;
    role: string;
    isConnected: boolean;
    todayHours: number; // en minutes
    avatar?: string;
}
export const HoursChart = ({ teamStatus, isLoading }: { teamStatus: TeamStatus[], isLoading: boolean }) => {
    const chartData = useMemo(() => {
        return teamStatus.map(member => ({
            name: member.employeeName.split(" ")[0],
            heures: Math.round(member.todayHours / 60 * 10) / 10, // Arrondi à 1 décimale
            employeeId: member.employeeId
        }));
    }, [teamStatus]);

    if (isLoading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Clock className="h-5 w-5" />
                        Heures par employé
                    </CardTitle>
                    <CardDescription>Aujourd'hui</CardDescription>
                </CardHeader>
                <CardContent className="flex items-center justify-center h-64">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Heures par employé
                </CardTitle>
                <CardDescription>Aujourd'hui</CardDescription>
            </CardHeader>
            <CardContent className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ left: 4, right: 4, top: 10, bottom: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                        <XAxis
                            dataKey="name"
                            fontSize={12}
                            tick={{ fill: 'hsl(var(--muted-foreground))' }}
                        />
                        <YAxis
                            fontSize={12}
                            tick={{ fill: 'hsl(var(--muted-foreground))' }}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: 'hsl(var(--card))',
                                border: '1px solid hsl(var(--border))',
                                borderRadius: '8px'
                            }}
                            formatter={(value: number) => [`${value}h`, 'Heures travaillées']}
                        />
                        <Bar
                            dataKey="heures"
                            fill="hsl(var(--primary))"
                            radius={[4, 4, 0, 0]}
                            animationDuration={800}
                            animationEasing="ease"
                            barSize={18}
                        />
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
};