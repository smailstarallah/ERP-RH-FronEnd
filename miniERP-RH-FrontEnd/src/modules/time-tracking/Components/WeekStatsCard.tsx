import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TableBody, Table, TableHeader, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Clock, Calendar, AlertCircle } from "lucide-react";
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface WeekStats {
    totalHours: number;
    averageArrival: string;
    overtimeHours: number;
    absences: number;
    lateArrivals: number;
}

interface WeekRow {
    day: Date;
    arrivee: string;
    sortie: string;
    effective: number; // minutes
    pauses: number; // minutes
    retard: string;
}

interface WeekStatsProps {
    weekStats: WeekStats;
    weekRows?: WeekRow[];
}

export const WeekStatsCard: React.FC<WeekStatsProps> = ({ weekStats, weekRows = [] }) => {
    const minutesToHHmm = (m: number) => {
        const h = Math.floor(m / 60);
        const min = Math.floor(m % 60);
        return `${h}h${min.toString().padStart(2, '0')}`;
    };

    return (
        <Card className="lg:col-span-3 border-slate-200 shadow-sm">
            <CardHeader className="pb-4 border-b border-slate-100">
                <div className="flex items-center justify-between">
                    <div className="space-y-1">
                        <CardTitle className="flex items-center gap-2 text-lg font-semibold text-slate-800">
                            <Calendar className="w-5 h-5 text-blue-600" />
                            Rapport Hebdomadaire
                        </CardTitle>
                        <CardDescription className="text-sm text-slate-600">
                            Suivi des horaires de travail
                        </CardDescription>
                    </div>

                    {/* Indicateurs principaux */}
                    <div className="hidden md:flex items-center gap-3">
                        <div className="text-center px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg">
                            <div className="text-xs font-medium text-blue-700 uppercase tracking-wide">Total</div>
                            <div className="text-lg font-bold text-blue-900">{weekStats.totalHours}h</div>
                        </div>
                        {weekStats.overtimeHours > 0 && (
                            <div className="text-center px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg">
                                <div className="text-xs font-medium text-amber-700 uppercase tracking-wide">Sup.</div>
                                <div className="text-lg font-bold text-amber-800">{Math.floor(weekStats.overtimeHours)}h</div>
                            </div>
                        )}
                        {weekStats.absences > 0 && (
                            <div className="text-center px-3 py-2 bg-red-50 border border-red-200 rounded-lg">
                                <div className="text-xs font-medium text-red-700 uppercase tracking-wide">Abs.</div>
                                <div className="text-lg font-bold text-red-800">{weekStats.absences}</div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Indicateurs mobiles */}
                <div className="md:hidden mt-4">
                    <div className="grid grid-cols-3 gap-2">
                        <div className="text-center px-2 py-2 bg-blue-50 border border-blue-200 rounded">
                            <div className="text-xs font-medium text-blue-700">TOTAL</div>
                            <div className="text-sm font-bold text-blue-900">{weekStats.totalHours}h</div>
                        </div>
                        <div className="text-center px-2 py-2 bg-amber-50 border border-amber-200 rounded">
                            <div className="text-xs font-medium text-amber-700">SUP.</div>
                            <div className="text-sm font-bold text-amber-800">{Math.floor(weekStats.overtimeHours)}h</div>
                        </div>
                        <div className="text-center px-2 py-2 bg-red-50 border border-red-200 rounded">
                            <div className="text-xs font-medium text-red-700">ABS.</div>
                            <div className="text-sm font-bold text-red-800">{weekStats.absences}</div>
                        </div>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="pt-6">
                {/* Table pour écrans moyens et grands */}
                <div className="hidden md:block">
                    <Table className="w-full">
                        <TableHeader>
                            <TableRow className="border-slate-200 hover:bg-slate-50">
                                <TableHead className="font-semibold text-slate-700 py-3">Jour</TableHead>
                                <TableHead className="font-semibold text-slate-700 py-3">Arrivée</TableHead>
                                <TableHead className="font-semibold text-slate-700 py-3">Sortie</TableHead>
                                <TableHead className="font-semibold text-slate-700 py-3">Temps effectif</TableHead>
                                <TableHead className="font-semibold text-slate-700 py-3">Pauses</TableHead>
                                <TableHead className="font-semibold text-slate-700 py-3">Statut</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {weekRows.map((r, i) => (
                                <TableRow
                                    key={i}
                                    className="border-slate-100 hover:bg-slate-25 transition-colors"
                                >
                                    <TableCell className="py-4 font-medium text-slate-800">
                                        {format(r.day, "EEEE", { locale: fr }).charAt(0).toUpperCase() + format(r.day, "EEEE", { locale: fr }).slice(1)}
                                        <div className="text-xs text-slate-500">{format(r.day, "dd/MM", { locale: fr })}</div>
                                    </TableCell>
                                    <TableCell className="py-4 text-slate-700">
                                        <div className="flex items-center gap-1">
                                            <Clock className="w-3 h-3 text-slate-400" />
                                            {r.arrivee}
                                        </div>
                                    </TableCell>
                                    <TableCell className="py-4 text-slate-700">
                                        <div className="flex items-center gap-1">
                                            <Clock className="w-3 h-3 text-slate-400" />
                                            {r.sortie}
                                        </div>
                                    </TableCell>
                                    <TableCell className="py-4 font-medium text-slate-800">
                                        {minutesToHHmm(r.effective)}
                                    </TableCell>
                                    <TableCell className="py-4 text-slate-600">
                                        {minutesToHHmm(r.pauses)}
                                    </TableCell>
                                    <TableCell className="py-4">
                                        {r.retard && r.retard !== '—' ? (
                                            <div className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-red-50 text-red-700 border border-red-200 rounded-full">
                                                <AlertCircle className="w-3 h-3" />
                                                {r.retard}
                                            </div>
                                        ) : (
                                            <div className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-green-50 text-green-700 border border-green-200 rounded-full">
                                                À l'heure
                                            </div>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>

                {/* Liste empilée pour petits écrans */}
                <div className="md:hidden space-y-4">
                    {weekRows.map((r, i) => (
                        <div key={i} className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
                            <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
                                <div>
                                    <div className="font-semibold text-slate-800">
                                        {format(r.day, "EEEE", { locale: fr }).charAt(0).toUpperCase() + format(r.day, "EEEE", { locale: fr }).slice(1)}
                                    </div>
                                    <div className="text-sm text-slate-500">{format(r.day, "dd/MM", { locale: fr })}</div>
                                </div>
                                <div className="text-right">
                                    <div className="font-semibold text-slate-800">{minutesToHHmm(r.effective)}</div>
                                    <div className="text-xs text-slate-500">Temps effectif</div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 mb-3">
                                <div>
                                    <div className="text-xs font-medium text-slate-600 uppercase tracking-wide mb-1">Arrivée</div>
                                    <div className="flex items-center gap-1 text-sm font-medium text-slate-800">
                                        <Clock className="w-3 h-3 text-slate-400" />
                                        {r.arrivee}
                                    </div>
                                </div>
                                <div>
                                    <div className="text-xs font-medium text-slate-600 uppercase tracking-wide mb-1">Sortie</div>
                                    <div className="flex items-center gap-1 text-sm font-medium text-slate-800">
                                        <Clock className="w-3 h-3 text-slate-400" />
                                        {r.sortie}
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="text-xs font-medium text-slate-600 uppercase tracking-wide mb-1">Pauses</div>
                                    <div className="text-sm font-medium text-slate-700">{minutesToHHmm(r.pauses)}</div>
                                </div>
                                <div>
                                    {r.retard && r.retard !== '—' ? (
                                        <div className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-red-50 text-red-700 border border-red-200 rounded-full">
                                            <AlertCircle className="w-3 h-3" />
                                            {r.retard}
                                        </div>
                                    ) : (
                                        <div className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-green-50 text-green-700 border border-green-200 rounded-full">
                                            À l'heure
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
};