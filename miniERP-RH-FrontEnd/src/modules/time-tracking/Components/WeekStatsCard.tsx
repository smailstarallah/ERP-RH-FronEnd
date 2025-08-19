import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";

interface WeekStats {
    totalHours: number;
    averageArrival: string;
    overtimeHours: number;
    absences: number;
    lateArrivals: number;
}

interface WeekStatsProps {
    weekStats: WeekStats;
}

export const WeekStatsCard: React.FC<WeekStatsProps> = ({ weekStats }) => {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                    <TrendingUp className="w-5 h-5" />
                    Cette semaine
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex justify-between">
                    <span className="text-slate-600">Total heures</span>
                    <span className="font-semibold">{(() => {
                        const hours = Math.floor(weekStats.totalHours);
                        const minutes = Math.round((weekStats.totalHours - hours) * 60);
                        return `${hours}h${minutes > 0 ? ` ${minutes}m` : ''}`;
                    })()}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-slate-600">Arrivée moyenne</span>
                    <span className="font-semibold">{weekStats.averageArrival}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-slate-600">Heures sup.</span>
                    <span className="font-semibold text-orange-600">{weekStats.overtimeHours}h</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-slate-600">Retards</span>
                    <span className="font-semibold text-red-600">{weekStats.lateArrivals}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-slate-600">Absences</span>
                    <span className="font-semibold">{weekStats.absences}</span>
                </div>
            </CardContent>
        </Card>
    );
};
