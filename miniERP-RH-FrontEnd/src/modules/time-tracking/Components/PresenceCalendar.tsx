import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    ChevronLeft, ChevronRight, Loader2, AlertTriangle, UserCheck, Clock, Coffee, TrendingUp, PauseCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { startOfWeek, addDays, format, isSameDay, startOfMonth, getDay, endOfMonth } from 'date-fns';
import { fr } from 'date-fns/locale';

// --- TYPES (inchangés) ---
interface Anomaly { id: string; type: string; message: string; severity: 'info' | 'warning' | 'error'; }
interface Pause { id: string; type: string; start: string; end?: string; duration?: number; }
interface DailyPunch {
    id: string; date: string; start: string; end?: string; status: 'PRESENT' | 'PARTIAL' | 'ABSENT' | 'IN_PROGRESS';
    effectiveWorkMinutes: number; totalPauseMinutes: number; overtime?: number; location?: string; pauses: Pause[]; anomalies: Anomaly[];
}
interface CalendarDay { date: Date; dateKey: string; punch?: DailyPunch; isCurrentMonth: boolean; isToday: boolean; }

// --- SOUS-COMPOSANTS DE VUE (Harmonisés et Responsives) ---

// La cellule de la vue mensuelle, compacte et visuelle
const CalendarDayCell = ({ day, onDaySelect }: { day: CalendarDay, onDaySelect?: (date: Date) => void }) => {
    const hasAnomalies = day.punch && day.punch.anomalies.length > 0;
    const isWeekend = getDay(day.date) === 0 || getDay(day.date) === 6;

    if (!day.isCurrentMonth) {
        return (
            <div className="h-16 sm:h-20 md:h-24 p-1 sm:p-2 border-b border-r bg-slate-50 text-slate-400 flex items-center justify-center">
                <span className="text-xs sm:text-sm font-medium opacity-60">{day.date.getDate()}</span>
            </div>
        );
    }

    const getStatusColors = () => {
        if (isWeekend) return {
            bg: "bg-red-50",
            border: "border-red-200",
            text: "text-red-600"
        };
        if (!day.punch) return {
            bg: "bg-slate-50",
            border: "border-slate-200",
            text: "text-slate-500"
        };
        return {
            bg: "bg-green-50",
            border: "border-green-200",
            text: "text-green-700"
        };
    };

    const getProgressColor = () => {
        if (!day.punch) return "bg-slate-300";
        const hours = day.punch.effectiveWorkMinutes / 60;
        if (hours >= 8) return "bg-green-500";
        if (hours >= 6) return "bg-yellow-500";
        return "bg-red-400";
    };

    const progressWidth = day.punch ? Math.min((day.punch.effectiveWorkMinutes / 480) * 100, 100) : 0;
    const colors = getStatusColors();

    return (
        <div
            className={cn(
                "h-16 sm:h-20 md:h-24 p-1 sm:p-2 flex flex-col border-b border-r relative cursor-pointer transition-all duration-200",
                colors.bg,
                colors.border,
                "hover:shadow-sm hover:scale-[1.01]",
                day.isToday && "ring-1 ring-blue-500 ring-inset",
                day.punch && "hover:shadow-md"
            )}
            onClick={() => day.punch && onDaySelect?.(day.date)}
        >
            {/* Header avec numéro du jour */}
            <div className="flex justify-between items-start mb-1">
                <span className={cn(
                    "text-xs sm:text-sm font-semibold",
                    day.isToday ? "bg-blue-600 text-white rounded-full w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center text-[10px] sm:text-xs" :
                        colors.text
                )}>
                    {day.date.getDate()}
                </span>
                <div className="flex items-center gap-1">
                    {hasAnomalies && <AlertTriangle className="w-2 h-2 sm:w-3 sm:h-3 text-amber-500" />}
                    {day.punch?.overtime && day.punch.overtime > 0 && (
                        <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-orange-500 rounded-full"></div>
                    )}
                </div>
            </div>

            {/* Contenu principal */}
            <div className="flex-1 flex flex-col justify-end">
                {day.punch ? (
                    <div className="space-y-1">
                        {/* Barre de progression - uniquement sur sm+ */}
                        <div className="hidden sm:block mb-1">
                            <div className="h-1 bg-white/60 rounded-full overflow-hidden">
                                <div
                                    className={cn(
                                        "h-full transition-all duration-500",
                                        getProgressColor(),
                                        progressWidth >= 75 ? "w-3/4" :
                                            progressWidth >= 50 ? "w-1/2" :
                                                progressWidth >= 25 ? "w-1/4" : "w-0"
                                    )}
                                ></div>
                            </div>
                        </div>

                        {/* Temps de travail */}
                        <p className="font-bold text-slate-800 text-[10px] sm:text-xs leading-tight">
                            {`${Math.floor(day.punch.effectiveWorkMinutes / 60)}h${String(day.punch.effectiveWorkMinutes % 60).padStart(2, '0')}`}
                        </p>

                        {/* Horaires - uniquement sur md+ */}
                        <p className="hidden md:block text-[9px] sm:text-[10px] text-slate-600 leading-tight">
                            {format(new Date(day.punch.start), 'HH:mm')} - {day.punch.end ? format(new Date(day.punch.end), 'HH:mm') : '...'}
                        </p>
                    </div>
                ) : (
                    !isWeekend && (
                        <div className="text-center">
                            <UserCheck className="w-3 h-3 sm:w-4 sm:h-4 mx-auto mb-1 text-slate-400" />
                            <p className="text-[9px] sm:text-xs text-slate-500 font-medium">Absent</p>
                        </div>
                    )
                )}

                {isWeekend && (
                    <div className="text-center">
                        <p className="text-[9px] sm:text-xs text-red-500 font-medium">Weekend</p>
                    </div>
                )}
            </div>
        </div>
    );
};

const WeeklyView = ({ week, punches, onDateSelect }: { week: Date, punches: DailyPunch[], onDateSelect: (date: Date) => void }) => {
    const weekDays = Array.from({ length: 7 }).map((_, i) => addDays(startOfWeek(week, { weekStartsOn: 1 }), i));
    const weeklyTotals = useMemo(() => {
        const weekPunches = punches.filter(p => weekDays.some(day => isSameDay(new Date(p.date), day)));
        const totalWork = weekPunches.reduce((sum, p) => sum + p.effectiveWorkMinutes, 0);
        const totalPauses = weekPunches.reduce((sum, p) => sum + p.totalPauseMinutes, 0);
        const totalOvertime = weekPunches.reduce((sum, p) => sum + (p.overtime || 0), 0);
        return { totalWork, totalPauses, totalOvertime, workingDays: weekPunches.length };
    }, [punches, weekDays]);

    return (
        <div className="p-3 sm:p-4 md:p-6 bg-white">
            {/* En-tête avec statistiques */}
            <div className="mb-4 sm:mb-6">
                <div className="flex flex-col gap-4">
                    <div className="text-center sm:text-left">
                        <h3 className="text-xl sm:text-2xl font-bold text-slate-800">Semaine {format(week, 'w', { locale: fr })}</h3>
                        <p className="text-sm text-slate-600 mt-1">
                            Du {format(weekDays[0], 'dd MMM', { locale: fr })} au {format(weekDays[6], 'dd MMM yyyy', { locale: fr })}
                        </p>
                    </div>

                    {/* Cartes de statistiques - responsive grid */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-2 sm:p-3 text-center">
                            <div className="text-xs font-medium text-blue-600 mb-1">Jours</div>
                            <div className="text-sm sm:text-lg font-bold text-blue-800">{weeklyTotals.workingDays}</div>
                        </div>
                        <div className="bg-green-50 border border-green-200 rounded-lg p-2 sm:p-3 text-center">
                            <div className="text-xs font-medium text-green-600 mb-1">Total</div>
                            <div className="text-sm sm:text-lg font-bold text-green-800">
                                {Math.floor(weeklyTotals.totalWork / 60)}h{String(weeklyTotals.totalWork % 60).padStart(2, '0')}
                            </div>
                        </div>
                        <div className="bg-purple-50 border border-purple-200 rounded-lg p-2 sm:p-3 text-center">
                            <div className="text-xs font-medium text-purple-600 mb-1">Pauses</div>
                            <div className="text-sm sm:text-lg font-bold text-purple-800">
                                {Math.floor(weeklyTotals.totalPauses / 60)}h{String(weeklyTotals.totalPauses % 60).padStart(2, '0')}
                            </div>
                        </div>
                        <div className="bg-orange-50 border border-orange-200 rounded-lg p-2 sm:p-3 text-center">
                            <div className="text-xs font-medium text-orange-600 mb-1">Sup.</div>
                            <div className="text-sm sm:text-lg font-bold text-orange-800">
                                {Math.floor(weeklyTotals.totalOvertime / 60)}h{String(weeklyTotals.totalOvertime % 60).padStart(2, '0')}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Liste des jours */}
            <div className="space-y-2 sm:space-y-3">
                {weekDays.map((day) => {
                    const punch = punches.find(p => isSameDay(new Date(p.date), day));
                    const hasAnomalies = punch && punch.anomalies.length > 0;
                    const isWeekend = getDay(day) === 0 || getDay(day) === 6;

                    return (
                        <div
                            key={day.toString()}
                            onClick={() => punch && onDateSelect(day)}
                            className={cn(
                                "p-3 sm:p-4 rounded-lg sm:rounded-xl border transition-all duration-200",
                                punch ? "hover:shadow-sm sm:hover:shadow-md hover:scale-[1.01] cursor-pointer bg-white border-slate-200" :
                                    isWeekend ? "bg-red-50 border-red-200" : "bg-slate-50 border-slate-200",
                                hasAnomalies && "border-amber-300 bg-amber-50"
                            )}
                        >
                            <div className="flex items-center justify-between gap-2 sm:gap-4">
                                <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">
                                    {/* Jour de la semaine */}
                                    <div className="flex flex-col items-center flex-shrink-0">
                                        <div className={cn(
                                            "w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center font-bold text-xs sm:text-sm border-2",
                                            isWeekend ? "bg-red-100 border-red-300 text-red-700" :
                                                punch ? "bg-green-100 border-green-300 text-green-700" :
                                                    "bg-slate-100 border-slate-300 text-slate-500"
                                        )}>
                                            {format(day, 'dd', { locale: fr })}
                                        </div>
                                        <div className="text-[10px] sm:text-xs font-medium text-slate-600 mt-1">
                                            {format(day, 'EEE', { locale: fr }).toUpperCase()}
                                        </div>
                                    </div>

                                    {/* Informations de pointage */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-1 sm:gap-2 mb-1 sm:mb-2">
                                            <h4 className="font-semibold text-slate-800 text-sm sm:text-base truncate">
                                                <span className="sm:hidden">{format(day, 'EEE dd/MM', { locale: fr })}</span>
                                                <span className="hidden sm:inline">{format(day, 'eeee dd MMMM', { locale: fr })}</span>
                                            </h4>
                                            {hasAnomalies && (
                                                <div className="flex items-center gap-1 text-amber-600 flex-shrink-0">
                                                    <AlertTriangle className="h-3 w-3 sm:h-4 sm:w-4" />
                                                    <span className="hidden sm:inline text-xs font-medium">{punch?.anomalies.length}</span>
                                                </div>
                                            )}
                                        </div>

                                        {punch ? (
                                            <div className="flex items-center gap-2 sm:gap-4 text-xs sm:text-sm">
                                                <div className="flex items-center gap-1 text-slate-600">
                                                    <Clock className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                                                    <span className="truncate">
                                                        {format(new Date(punch.start), 'HH:mm')} - {punch.end ? format(new Date(punch.end), 'HH:mm') : '...'}
                                                    </span>
                                                </div>
                                                {punch.location && (
                                                    <div className="hidden sm:flex items-center gap-1 text-slate-500">
                                                        <span>📍</span>
                                                        <span className="text-xs truncate">{punch.location}</span>
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <div className="text-xs sm:text-sm text-slate-500">
                                                {isWeekend ? "Weekend" : "Aucun pointage"}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Temps de travail */}
                                <div className="text-right flex-shrink-0">
                                    {punch ? (
                                        <div>
                                            <div className="text-sm sm:text-lg md:text-xl font-bold text-slate-800">
                                                {Math.floor(punch.effectiveWorkMinutes / 60)}h{String(punch.effectiveWorkMinutes % 60).padStart(2, '0')}
                                            </div>
                                            {punch.totalPauseMinutes > 0 && (
                                                <div className="text-[10px] sm:text-xs text-slate-500">
                                                    {punch.totalPauseMinutes}min pause
                                                </div>
                                            )}
                                            {punch.overtime && punch.overtime > 0 && (
                                                <div className="text-[10px] sm:text-xs text-orange-600 font-medium">
                                                    +{Math.floor(punch.overtime / 60)}h{String(punch.overtime % 60).padStart(2, '0')}
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="text-sm sm:text-lg font-bold text-slate-400">--:--</div>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

const StatCard = ({ icon, label, value, className }: { icon: React.ReactNode, label: string, value: string, className?: string }) => (
    <div className="p-4 sm:p-6 bg-white rounded-lg sm:rounded-2xl border border-slate-200 hover:shadow-sm transition-all duration-200">
        <div className="flex items-center gap-3 sm:gap-4">
            <div className="flex-shrink-0">{icon}</div>
            <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm font-medium text-slate-600 truncate">{label}</p>
                <p className={cn("text-base sm:text-lg lg:text-xl font-bold truncate", className || 'text-slate-800')}>
                    {value}
                </p>
            </div>
        </div>
    </div>
);

const DailyView = ({ day, punch }: { day: Date | null, punch?: DailyPunch }) => {
    if (!day) return null;

    const AnomalyCard = ({ anomaly }: { anomaly: Anomaly }) => (
        <div className="flex items-start gap-2 sm:gap-3 p-3 sm:p-4 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-lg sm:rounded-xl hover:shadow-sm transition-all duration-200">
            <div className="p-1 sm:p-2 bg-amber-100 rounded-lg flex-shrink-0">
                <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 text-amber-600" />
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                    <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-amber-100 text-amber-800">
                        {anomaly.severity.toUpperCase()}
                    </span>
                </div>
                <p className="text-sm text-amber-800 font-medium leading-relaxed">{anomaly.message}</p>
            </div>
        </div>
    );

    return (
        <div className="max-w-6xl mx-auto p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6 md:space-y-8">
            {/* En-tête avec date */}
            <div className="text-center py-4 sm:py-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg sm:rounded-2xl border border-blue-200">
                <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-800 mb-2">
                    {format(day, 'eeee dd MMMM yyyy', { locale: fr })}
                </h3>
                <p className="text-sm sm:text-base text-slate-600">
                    {punch ? `Pointage effectué • ${punch.status}` : "Aucun pointage enregistré"}
                </p>
            </div>

            {!punch ? (
                <div className="text-center p-8 sm:p-12 bg-slate-50 rounded-lg sm:rounded-2xl border border-slate-200">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 sm:mb-6 bg-slate-200 rounded-full flex items-center justify-center">
                        <UserCheck className="h-8 w-8 sm:h-10 sm:w-10 text-slate-400" />
                    </div>
                    <h4 className="text-lg sm:text-xl font-semibold text-slate-600 mb-2">Aucune donnée disponible</h4>
                    <p className="text-slate-500 text-sm sm:text-base">Aucun pointage n'a été enregistré pour cette journée.</p>
                </div>
            ) : (
                <div className="space-y-6 sm:space-y-8">
                    {/* Anomalies */}
                    {punch.anomalies.length > 0 && (
                        <div>
                            <div className="flex items-center gap-2 mb-3 sm:mb-4">
                                <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 text-amber-500" />
                                <h4 className="text-lg sm:text-xl font-bold text-slate-800">Anomalies détectées</h4>
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                                    {punch.anomalies.length}
                                </span>
                            </div>
                            <div className="grid gap-2 sm:gap-3">
                                {punch.anomalies.map(a => <AnomalyCard key={a.id} anomaly={a} />)}
                            </div>
                        </div>
                    )}

                    {/* Résumé de la journée */}
                    <div>
                        <h4 className="text-lg sm:text-xl font-bold text-slate-800 mb-4 sm:mb-6 flex items-center gap-2">
                            <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500" />
                            Résumé de la journée
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                            <StatCard
                                icon={<Clock className="h-5 w-5 sm:h-6 sm:w-6 text-blue-500" />}
                                label="Temps effectif"
                                value={`${Math.floor(punch.effectiveWorkMinutes / 60)}h ${String(punch.effectiveWorkMinutes % 60).padStart(2, '0')}m`}
                            />
                            <StatCard
                                icon={<Coffee className="h-5 w-5 sm:h-6 sm:w-6 text-purple-500" />}
                                label="Temps de pause"
                                value={`${Math.floor(punch.totalPauseMinutes / 60)}h ${String(punch.totalPauseMinutes % 60).padStart(2, '0')}m`}
                            />
                            <StatCard
                                icon={<TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 text-orange-500" />}
                                label="Heures supplémentaires"
                                value={punch.overtime ? `${Math.floor(punch.overtime / 60)}h ${String(punch.overtime % 60).padStart(2, '0')}m` : '0h 00m'}
                                className={punch.overtime ? "text-orange-600" : "text-slate-600"}
                            />
                        </div>
                    </div>

                    {/* Chronologie et détails des pauses */}
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
                        {/* Chronologie de la journée */}
                        <div className="bg-white rounded-lg sm:rounded-2xl border border-slate-200 p-4 sm:p-6">
                            <h4 className="text-base sm:text-lg font-bold text-slate-800 mb-4 sm:mb-6 flex items-center gap-2">
                                <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-green-500" />
                                Chronologie
                            </h4>
                            <div className="space-y-3 sm:space-y-4">
                                {/* Arrivée */}
                                <div className="flex items-center gap-3 sm:gap-4 p-3 bg-green-50 rounded-lg border border-green-200">
                                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                                        <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-green-800 text-sm sm:text-base">Arrivée</p>
                                        <p className="text-sm text-green-600">{format(new Date(punch.start), 'HH:mm')}</p>
                                    </div>
                                </div>

                                {/* Départ */}
                                {punch.end && (
                                    <div className="flex items-center gap-3 sm:gap-4 p-3 bg-red-50 rounded-lg border border-red-200">
                                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                                            <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-red-600" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-red-800 text-sm sm:text-base">Départ</p>
                                            <p className="text-sm text-red-600">{format(new Date(punch.end), 'HH:mm')}</p>
                                        </div>
                                    </div>
                                )}

                                {/* Localisation */}
                                {punch.location && (
                                    <div className="flex items-center gap-3 sm:gap-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                                            <span className="text-sm sm:text-lg">📍</span>
                                        </div>
                                        <div>
                                            <p className="font-semibold text-blue-800 text-sm sm:text-base">Localisation</p>
                                            <p className="text-sm text-blue-600">{punch.location}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Détail des pauses */}
                        <div className="bg-white rounded-lg sm:rounded-2xl border border-slate-200 p-4 sm:p-6">
                            <h4 className="text-base sm:text-lg font-bold text-slate-800 mb-4 sm:mb-6 flex items-center gap-2">
                                <PauseCircle className="h-4 w-4 sm:h-5 sm:w-5 text-purple-500" />
                                Détail des pauses
                            </h4>
                            <div className="space-y-2 sm:space-y-3">
                                {punch.pauses.length > 0 ? punch.pauses.map(p => (
                                    <div key={p.id} className="flex items-center justify-between p-3 sm:p-4 bg-purple-50 rounded-lg border border-purple-200 hover:shadow-sm transition-shadow">
                                        <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                                            <div className="w-6 h-6 sm:w-8 sm:h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                                                <PauseCircle className="h-3 w-3 sm:h-4 sm:w-4 text-purple-600" />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="font-semibold text-purple-800 capitalize text-sm sm:text-base">{p.type.toLowerCase()}</p>
                                                <p className="text-xs sm:text-sm text-purple-600">
                                                    {format(new Date(p.start), 'HH:mm')} - {p.end ? format(new Date(p.end), 'HH:mm') : 'En cours'}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right flex-shrink-0">
                                            <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-purple-100 text-purple-800">
                                                {p.duration ?? 0} min
                                            </span>
                                        </div>
                                    </div>
                                )) : (
                                    <div className="text-center py-6 sm:py-8">
                                        <PauseCircle className="h-10 w-10 sm:h-12 sm:w-12 text-slate-300 mx-auto mb-3" />
                                        <p className="text-slate-500 font-medium text-sm sm:text-base">Aucune pause enregistrée</p>
                                        <p className="text-xs sm:text-sm text-slate-400 mt-1">Les pauses seront affichées ici</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// --- COMPOSANT PRINCIPAL ---
export default function PresenceCalendar() {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [view, setView] = useState<'month' | 'week' | 'day'>('month');
    const [punches, setPunches] = useState<DailyPunch[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    useEffect(() => {
        const fetchPresenceData = async () => {
            setIsLoading(true);
            setError(null);
            const userData = localStorage.getItem('userData');
            const employeeId = userData ? JSON.parse(userData).id : null;
            if (!employeeId) { setError("ID de l'employé non trouvé. Veuillez vous reconnecter."); setIsLoading(false); return; }
            const startDate = format(startOfMonth(currentDate), 'yyyy-MM-dd');
            const endDate = format(endOfMonth(currentDate), 'yyyy-MM-dd');
            const API_URL = `http://localhost:8080/api/pointages/presence/${employeeId}?startDate=${startDate}&endDate=${endDate}`;
            try {
                const token = localStorage.getItem('token');
                const response = await fetch(API_URL, {
                    method: 'GET',
                    headers: { 'Accept': 'application/json', ...(token ? { 'Authorization': `Bearer ${token}` } : {}) }
                });
                if (!response.ok) throw new Error(`Erreur HTTP: ${response.status}`);
                const data: DailyPunch[] = await response.json();
                console.log("Données de l'API:", data);
                setPunches(data);
            } catch (err) {
                console.error("Erreur de l'API:", err);
                setError("Impossible de charger les données. Le serveur est peut-être indisponible.");
            } finally {
                setIsLoading(false);
            }
        };
        fetchPresenceData();
    }, [currentDate]);

    const calendarDays = useMemo((): CalendarDay[] => {
        const firstDayOfMonth = startOfMonth(currentDate);
        const firstDayOfGrid = startOfWeek(firstDayOfMonth, { weekStartsOn: 1 });
        const days: CalendarDay[] = [];
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        for (let i = 0; i < 42; i++) { // 6 semaines max pour couvrir tous les cas
            const date = addDays(firstDayOfGrid, i);
            const dateKey = format(date, 'yyyy-MM-dd');
            const punch = punches.find(p => p.date === dateKey);

            days.push({
                date,
                dateKey,
                punch,
                isCurrentMonth: date.getMonth() === currentDate.getMonth(),
                isToday: isSameDay(date, today)
            });
        }
        return days;
    }, [currentDate, punches]);

    const handleNavigation = (offset: number) => {
        setCurrentDate(prev => {
            const newDate = new Date(prev);
            if (view === 'month') newDate.setMonth(newDate.getMonth() + offset, 1);
            else if (view === 'week') newDate.setDate(newDate.getDate() + (offset * 7));
            else newDate.setDate(newDate.getDate() + offset);
            return newDate;
        });
    };

    const handleDateSelect = useCallback((date: Date) => {
        setCurrentDate(date);
        setView('day');
    }, []);

    const selectedPunch = punches.find(p => isSameDay(new Date(p.date), currentDate));

    return (
        <div className="bg-slate-50 min-h-screen p-2 sm:p-4">
            <div className="max-w-7xl mx-auto">
                <div className="bg-white rounded-lg sm:rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
                    <CardHeader className="p-3 sm:p-4 md:p-6 border-b bg-gradient-to-r from-blue-50 to-indigo-50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
                        <div className="flex items-center gap-2 sm:gap-4 w-full sm:w-auto">
                            <div className="text-left flex-1 sm:flex-none">
                                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-slate-800 capitalize flex items-center gap-2">
                                    <Clock className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-blue-600" />
                                    {format(currentDate, 'MMMM', { locale: fr })}
                                </h2>
                                <p className="text-sm sm:text-base text-slate-600 font-medium">{format(currentDate, 'yyyy')}</p>
                            </div>
                            <div className="flex items-center gap-1">
                                <Button variant="outline" size="icon" className="h-8 w-8 sm:h-9 sm:w-9 md:h-10 md:w-10 hover:bg-blue-50 hover:border-blue-300 transition-colors" onClick={() => handleNavigation(-1)}>
                                    <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5" />
                                </Button>
                                <Button variant="outline" size="icon" className="h-8 w-8 sm:h-9 sm:w-9 md:h-10 md:w-10 hover:bg-blue-50 hover:border-blue-300 transition-colors" onClick={() => handleNavigation(1)}>
                                    <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5" />
                                </Button>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto justify-between">
                            <div className="inline-flex rounded-lg bg-white p-1 shadow-sm border border-slate-200">
                                <Button
                                    onClick={() => setView('month')}
                                    size="sm"
                                    variant={view === 'month' ? 'default' : 'ghost'}
                                    className={cn(
                                        "px-2 sm:px-3 md:px-4 h-7 sm:h-8 md:h-9 rounded-md text-xs sm:text-sm transition-all duration-200",
                                        view === 'month' ? "bg-blue-600 text-white shadow-sm" : "hover:bg-slate-50"
                                    )}
                                >
                                    Mois
                                </Button>
                                <Button
                                    onClick={() => setView('week')}
                                    size="sm"
                                    variant={view === 'week' ? 'default' : 'ghost'}
                                    className={cn(
                                        "px-2 sm:px-3 md:px-4 h-7 sm:h-8 md:h-9 rounded-md text-xs sm:text-sm transition-all duration-200",
                                        view === 'week' ? "bg-blue-600 text-white shadow-sm" : "hover:bg-slate-50"
                                    )}
                                >
                                    Semaine
                                </Button>
                                <Button
                                    onClick={() => setView('day')}
                                    size="sm"
                                    variant={view === 'day' ? 'default' : 'ghost'}
                                    className={cn(
                                        "px-2 sm:px-3 md:px-4 h-7 sm:h-8 md:h-9 rounded-md text-xs sm:text-sm transition-all duration-200",
                                        view === 'day' ? "bg-blue-600 text-white shadow-sm" : "hover:bg-slate-50"
                                    )}
                                >
                                    Jour
                                </Button>
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                className="h-7 sm:h-8 md:h-10 px-2 sm:px-3 md:px-4 bg-white hover:bg-blue-50 hover:border-blue-300 transition-colors font-medium text-xs sm:text-sm"
                                onClick={() => setCurrentDate(new Date())}
                            >
                                <span className="hidden sm:inline">Aujourd'hui</span>
                                <span className="sm:hidden">Auj.</span>
                            </Button>
                        </div>
                    </CardHeader>

                    <CardContent className="p-0 relative min-h-[300px] sm:min-h-[400px] md:min-h-[500px]">
                        {isLoading && (
                            <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-10">
                                <div className="flex flex-col items-center gap-2 sm:gap-3">
                                    <Loader2 className="h-6 w-6 sm:h-8 sm:w-8 md:h-10 md:w-10 text-blue-600 animate-spin" />
                                    <p className="text-slate-600 font-medium text-sm sm:text-base">Chargement...</p>
                                </div>
                            </div>
                        )}
                        {error && (
                            <div className="p-4 sm:p-6 md:p-8 text-center">
                                <div className="max-w-md mx-auto bg-red-50 border border-red-200 rounded-lg sm:rounded-xl p-4 sm:p-6">
                                    <AlertTriangle className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 text-red-500 mx-auto mb-3 sm:mb-4" />
                                    <h3 className="text-base sm:text-lg font-semibold text-red-800 mb-2">Erreur</h3>
                                    <p className="text-red-600 text-sm sm:text-base">{error}</p>
                                </div>
                            </div>
                        )}
                        {!isLoading && !error && (
                            <>
                                {view === 'month' && (
                                    <div className="grid grid-cols-7">
                                        {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((day, index) => (
                                            <div key={day} className="text-center py-2 sm:py-3 text-xs font-bold text-slate-600 bg-slate-50 border-b border-r">
                                                <span className="sm:hidden">{day}</span>
                                                <span className="hidden sm:inline">{['LUN', 'MAR', 'MER', 'JEU', 'VEN', 'SAM', 'DIM'][index]}</span>
                                            </div>
                                        ))}
                                        {calendarDays.map((day) => (
                                            <CalendarDayCell key={day.dateKey} day={day} onDaySelect={handleDateSelect} />
                                        ))}
                                    </div>
                                )}
                                {view === 'week' && <WeeklyView week={currentDate} punches={punches} onDateSelect={handleDateSelect} />}
                                {view === 'day' && <DailyView day={currentDate} punch={selectedPunch} />}
                            </>
                        )}
                    </CardContent>
                </div>
            </div>
        </div>
    );
}