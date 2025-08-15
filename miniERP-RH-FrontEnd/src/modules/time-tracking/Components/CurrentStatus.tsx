import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity } from "lucide-react";

interface CurrentStatusProps {
    isWorking: boolean;
    isOnBreak: boolean;
    formatTime: (seconds: number) => string;
    currentSessionDuration: number;
    totalBreakTime: number;
}

export const CurrentStatus: React.FC<CurrentStatusProps> = ({
    isWorking,
    isOnBreak,
    formatTime,
    currentSessionDuration,
    totalBreakTime
}) => {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Activity className="w-5 h-5" />
                    Statut actuel
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-slate-50 rounded-lg">
                        <div className="text-2xl font-bold text-slate-800">
                            {isWorking ? 'En cours' : 'Hors service'}
                        </div>
                        <div className="text-sm text-slate-600 mt-1">
                            {isWorking ? (isOnBreak ? 'En pause' : 'Au travail') : 'Non connecté'}
                        </div>
                    </div>
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-800">
                            {isWorking ? formatTime(currentSessionDuration) : '00:00:00'}
                        </div>
                        <div className="text-sm text-blue-600 mt-1">Session actuelle</div>
                    </div>
                    <div className="text-center p-4 bg-orange-50 rounded-lg">
                        <div className="text-2xl font-bold text-orange-800">
                            {formatTime(totalBreakTime)}
                        </div>
                        <div className="text-sm text-orange-600 mt-1">Temps de pause</div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};
