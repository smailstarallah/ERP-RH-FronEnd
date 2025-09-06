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

    const formatHours = (hours: number) => {
        const h = Math.floor(hours);
        const minutes = Math.round((hours - h) * 60);
        return `${h.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    };

    return (
        <div className="lg:col-span-3 bg-white border border-slate-200 rounded-lg shadow-sm">
            <div className="p-3 sm:p-4 border-b border-slate-200">
                <div className="flex items-center justify-between">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                                <Calendar className="w-4 h-4 text-white" />
                            </div>
                            <h3 className="text-base sm:text-lg font-semibold text-slate-900">Rapport Hebdomadaire</h3>
                        </div>
                        <p className="text-sm text-slate-600 mt-1">Suivi des horaires de travail</p>
                    </div>

                    {/* Indicateurs principaux */}
                    <div className="hidden md:flex items-center gap-2 lg:gap-3">
                        <div className="text-center px-3 py-2 bg-blue-100 border border-blue-200 rounded-lg">
                            <div className="text-xs font-medium text-blue-800 uppercase tracking-wide">Total</div>
                            <div className="text-lg font-semibold text-blue-900">{formatHours(weekStats.totalHours)}</div>
                        </div>
                        {weekStats.overtimeHours > 0 && (
                            <div className="text-center px-3 py-2 bg-slate-100 border border-slate-300 rounded-lg">
                                <div className="text-xs font-medium text-slate-700 uppercase tracking-wide">Sup.</div>
                                <div className="text-lg font-semibold text-slate-800">{formatHours(weekStats.overtimeHours)}</div>
                            </div>
                        )}
                        {weekStats.absences > 0 && (
                            <div className="text-center px-3 py-2 bg-slate-100 border border-slate-300 rounded-lg">
                                <div className="text-xs font-medium text-slate-700 uppercase tracking-wide">Abs.</div>
                                <div className="text-lg font-semibold text-slate-800">{weekStats.absences}</div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Indicateurs mobiles */}
                <div className="md:hidden mt-4">
                    <div className="grid grid-cols-3 gap-2">
                        <div className="text-center px-2 py-2 bg-blue-100 border border-blue-200 rounded-lg">
                            <div className="text-xs font-medium text-blue-800">TOTAL</div>
                            <div className="text-sm font-semibold text-blue-900">{formatHours(weekStats.totalHours)}</div>
                        </div>
                        <div className="text-center px-2 py-2 bg-slate-100 border border-slate-300 rounded-lg">
                            <div className="text-xs font-medium text-slate-700">SUP.</div>
                            <div className="text-sm font-semibold text-slate-800">{formatHours(weekStats.overtimeHours)}</div>
                        </div>
                        <div className="text-center px-2 py-2 bg-slate-100 border border-slate-300 rounded-lg">
                            <div className="text-xs font-medium text-slate-700">ABS.</div>
                            <div className="text-sm font-semibold text-slate-800">{weekStats.absences}</div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="p-3 sm:p-4">
                {/* Table pour écrans moyens et grands */}
                <div className="hidden md:block overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-slate-50 border-b border-slate-200">
                                <tr>
                                    <th className="text-left px-4 py-3 text-sm font-medium text-slate-900">Jour</th>
                                    <th className="text-left px-4 py-3 text-sm font-medium text-slate-900">Arrivée</th>
                                    <th className="text-left px-4 py-3 text-sm font-medium text-slate-900">Sortie</th>
                                    <th className="text-left px-4 py-3 text-sm font-medium text-slate-900">Temps effectif</th>
                                    <th className="text-left px-4 py-3 text-sm font-medium text-slate-900">Pauses</th>
                                    <th className="text-left px-4 py-3 text-sm font-medium text-slate-900">Statut</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200">
                                {weekRows.map((r, i) => (
                                    <tr
                                        key={i}
                                        className="hover:bg-slate-50 transition-colors duration-200"
                                    >
                                        <td className="px-4 py-3 font-medium text-slate-900">
                                            {format(r.day, "EEEE", { locale: fr }).charAt(0).toUpperCase() + format(r.day, "EEEE", { locale: fr }).slice(1)}
                                            <div className="text-xs text-slate-500">{format(r.day, "dd/MM", { locale: fr })}</div>
                                        </td>
                                        <td className="px-4 py-3 text-slate-700">
                                            <div className="flex items-center gap-1">
                                                <Clock className="w-3 h-3 text-slate-400" />
                                                <span className="text-sm">{r.arrivee}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-slate-700">
                                            <div className="flex items-center gap-1">
                                                <Clock className="w-3 h-3 text-slate-400" />
                                                <span className="text-sm">{r.sortie}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 font-medium text-slate-900">
                                            {minutesToHHmm(r.effective)}
                                        </td>
                                        <td className="px-4 py-3 text-slate-600">
                                            {minutesToHHmm(r.pauses)}
                                        </td>
                                        <td className="px-4 py-3">
                                            {r.retard && r.retard !== '—' ? (
                                                <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-slate-100 text-slate-800 border border-slate-300 rounded">
                                                    <AlertCircle className="w-3 h-3" />
                                                    {r.retard}
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200 rounded">
                                                    À l'heure
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Liste empilée pour petits écrans */}
                <div className="md:hidden space-y-3">
                    {weekRows.map((r, i) => (
                        <div key={i} className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                            <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-200">
                                <div>
                                    <div className="font-medium text-slate-900">
                                        {format(r.day, "EEEE", { locale: fr }).charAt(0).toUpperCase() + format(r.day, "EEEE", { locale: fr }).slice(1)}
                                    </div>
                                    <div className="text-sm text-slate-600">{format(r.day, "dd/MM", { locale: fr })}</div>
                                </div>
                                <div className="text-right">
                                    <div className="font-medium text-slate-900">{minutesToHHmm(r.effective)}</div>
                                    <div className="text-xs text-slate-600">Temps effectif</div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3 mb-3">
                                <div>
                                    <div className="text-xs font-medium text-slate-700 uppercase tracking-wide mb-1">Arrivée</div>
                                    <div className="flex items-center gap-1 text-sm font-medium text-slate-900">
                                        <Clock className="w-3 h-3 text-slate-500" />
                                        {r.arrivee}
                                    </div>
                                </div>
                                <div>
                                    <div className="text-xs font-medium text-slate-700 uppercase tracking-wide mb-1">Sortie</div>
                                    <div className="flex items-center gap-1 text-sm font-medium text-slate-900">
                                        <Clock className="w-3 h-3 text-slate-500" />
                                        {r.sortie}
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="text-xs font-medium text-slate-700 uppercase tracking-wide mb-1">Pauses</div>
                                    <div className="text-sm font-medium text-slate-900">{minutesToHHmm(r.pauses)}</div>
                                </div>
                                <div>
                                    {r.retard && r.retard !== '—' ? (
                                        <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-slate-100 text-slate-800 border border-slate-300 rounded">
                                            <AlertCircle className="w-3 h-3" />
                                            {r.retard}
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200 rounded">
                                            À l'heure
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};