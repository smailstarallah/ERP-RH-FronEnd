import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, Square, Pause, Timer } from "lucide-react";

interface TimeActionsProps {
    isWorking: boolean;
    isOnBreak: boolean;
    loading: boolean;
    onCheckIn: () => void;
    onCheckOut: () => void;
    onBreakStart: () => void;
    onBreakEnd: () => void;
}

export const TimeActions: React.FC<TimeActionsProps> = ({
    isWorking,
    isOnBreak,
    loading,
    onCheckIn,
    onCheckOut,
    onBreakStart,
    onBreakEnd
}) => {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Actions</CardTitle>
                <CardDescription>Enregistrer vos heures de travail</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Button
                        onClick={onCheckIn}
                        disabled={isWorking || loading}
                        className="h-16 flex flex-col gap-1 bg-green-600 hover:bg-green-700"
                    >
                        <Play className="w-5 h-5" />
                        <span className="text-sm">Arrivée</span>
                    </Button>

                    <Button
                        onClick={onCheckOut}
                        disabled={!isWorking || loading}
                        className="h-16 flex flex-col gap-1 bg-red-600 hover:bg-red-700"
                    >
                        <Square className="w-5 h-5" />
                        <span className="text-sm">Sortie</span>
                    </Button>

                    <Button
                        onClick={isOnBreak ? onBreakEnd : onBreakStart}
                        disabled={!isWorking || loading}
                        variant={isOnBreak ? "default" : "outline"}
                        className="h-16 flex flex-col gap-1"
                    >
                        {isOnBreak ? <Play className="w-5 h-5" /> : <Pause className="w-5 h-5" />}
                        <span className="text-sm">
                            {isOnBreak ? 'Fin pause' : 'Pause'}
                        </span>
                    </Button>

                    <Button
                        variant="outline"
                        className="h-16 flex flex-col gap-1"
                        disabled={loading}
                    >
                        <Timer className="w-5 h-5" />
                        <span className="text-sm">Pointage manuel</span>
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
};
