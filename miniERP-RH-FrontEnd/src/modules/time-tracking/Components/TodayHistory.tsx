import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "lucide-react";

interface TimeEntry {
    id: number;
    type: 'checkin' | 'checkout' | 'break_start' | 'break_end';
    time: string;
    location: string;
    status: 'success' | 'error' | 'info';
}

interface TodayHistoryProps {
    todayEntries: TimeEntry[];
}

export const TodayHistory: React.FC<TodayHistoryProps> = ({ todayEntries }) => {
    const getStatusBadge = (type: TimeEntry['type']) => {
        switch (type) {
            case 'checkin':
                return <Badge className="bg-green-100 text-green-800">Arrivée</Badge>;
            case 'checkout':
                return <Badge className="bg-red-100 text-red-800">Sortie</Badge>;
            case 'break_start':
                return <Badge className="bg-orange-100 text-orange-800">Pause début</Badge>;
            case 'break_end':
                return <Badge className="bg-blue-100 text-blue-800">Pause fin</Badge>;
            default:
                return <Badge>Action</Badge>;
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    Historique d'aujourd'hui
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    {todayEntries.length === 0 ? (
                        <div className="text-center py-8 text-slate-500">
                            Aucun pointage enregistré aujourd'hui
                        </div>
                    ) : (
                        todayEntries.map((entry: TimeEntry) => (
                            <div key={entry.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <div className={`w-2 h-2 rounded-full ${entry.status === 'success' ? 'bg-green-500' :
                                        entry.status === 'info' ? 'bg-blue-500' : 'bg-red-500'
                                        }`} />
                                    <div>
                                        <div className="font-medium">{entry.time}</div>
                                        <div className="text-sm text-slate-600">{entry.location}</div>
                                    </div>
                                </div>
                                {getStatusBadge(entry.type)}
                            </div>
                        ))
                    )}
                </div>
            </CardContent>
        </Card>
    );
};
