import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface DaySummaryProps {
    totalWorkedTime: number;
    totalBreakTime: number;
    effectiveWorkTime: number;
    formatTimeShort: (seconds: number) => string;
}

export const DaySummary: React.FC<DaySummaryProps> = ({
    totalWorkedTime,
    totalBreakTime,
    effectiveWorkTime,
    formatTimeShort
}) => {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-lg">Aujourd'hui</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex justify-between">
                    <span className="text-slate-600">Temps total</span>
                    <span className="font-semibold">
                        {formatTimeShort(totalWorkedTime)}
                    </span>
                </div>
                <div className="flex justify-between">
                    <span className="text-slate-600">Temps pause</span>
                    <span className="font-semibold">
                        {formatTimeShort(totalBreakTime)}
                    </span>
                </div>
                <div className="flex justify-between">
                    <span className="text-slate-600">Temps effectif</span>
                    <span className="font-semibold text-blue-600">
                        {formatTimeShort(effectiveWorkTime)}
                    </span>
                </div>
            </CardContent>
        </Card>
    );
};
