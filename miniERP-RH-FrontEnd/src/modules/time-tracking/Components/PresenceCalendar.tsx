// components/ProfessionalTimeSheetCalendar.tsx

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { ChevronLeft, ChevronRight, Clock, Briefcase, Paperclip, MoreHorizontal, Coffee, Loader2 } from 'lucide-react';
import { addDays, startOfWeek, format, eachDayOfInterval, isSameDay, startOfDay, getMinutes, getHours, set, getDay, isSameWeek } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Separator } from '@/components/ui/separator';

//================================================================================
// 1. TYPES ET CONFIGURATION
//================================================================================

// Types internes utilisés par le composant pour une manipulation facile
type ActivityType = 'WORK' | 'BREAK';
interface Project { id: number; name: string; color: string; client?: string; }
interface Activity {
    id: string; type: ActivityType; description: string;
    startTime: Date; endTime: Date; project: Project;
}
interface PlannedActivity { project: Project; plannedHours: number; }

// Types correspondant à la structure de la réponse de l'API
interface ApiActivity {
    id: string | number; type: 'WORK' | 'BREAK'; description: string;
    startTime: string; endTime: string; project: Project;
}
interface ApiPlanned { dayOfWeek: number; project: Project; plannedHours: number; }
interface ApiResponse { activities: ApiActivity[]; planned: ApiPlanned[]; }

// Constantes pour le design et la mise en page
const PIXELS_PER_MINUTE = 1.4;
const BREAK_COLOR = '#64748b'; // gris-bleu pour les pauses
const PROJECT_COLORS = ['#3b82f6', '#ec4899', '#f97316', '#10b981', '#8b5cf6', '#ef4444'];
let projectColorMap = new Map<number, string>(); // Cache pour garder des couleurs de projet cohérentes

// Fonction pour assigner une couleur stable à un projet
const getColorForProject = (projectId: number): string => {
    if (!projectColorMap.has(projectId)) {
        projectColorMap.set(projectId, PROJECT_COLORS[projectColorMap.size % PROJECT_COLORS.length]);
    }
    return projectColorMap.get(projectId)!;
};

//================================================================================
// 2. LOGIQUE D'API
//================================================================================

// Fonction pour récupérer et transformer les données de la semaine depuis le backend
const fetchDataForWeek = async (weekStart: Date): Promise<{ activities: Activity[], planned: Record<number, PlannedActivity[]> }> => {
    // Dans un vrai projet, l'employeId et le token viendraient d'un Contexte d'Authentification
    const employeId = localStorage.getItem('userData') ? JSON.parse(localStorage.getItem('userData') || '{}').id : '1';
    const token = localStorage.getItem('token');

    try {
        const weekStartString = format(weekStart, 'yyyy-MM-dd');
        const response = await fetch(`http://localhost:8080/api/pointages/week-pointages/${employeId}?weekStart=${weekStartString}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error(`Erreur HTTP: ${response.status}`);
        const data: ApiResponse = await response.json();

        // **Pour la démo, nous utilisons des données simulées qui imitent la réponse de l'API**
        // const data = generateFakeApiResponse(weekStart);

        projectColorMap = new Map<number, string>(); // Réinitialise le cache de couleurs pour la démo

        const activities: Activity[] = data.activities.map(apiActivity => ({
            id: String(apiActivity.id),
            type: apiActivity.type,
            description: apiActivity.description,
            startTime: new Date(apiActivity.startTime), // JS parse directement les strings ISO 8601
            endTime: new Date(apiActivity.endTime),
            project: {
                ...apiActivity.project,
                color: apiActivity.type === 'BREAK' ? BREAK_COLOR : getColorForProject(apiActivity.project.id)
            },
        }));

        const planned: Record<number, PlannedActivity[]> = {};
        data.planned.forEach(apiPlanned => {
            if (!planned[apiPlanned.dayOfWeek]) planned[apiPlanned.dayOfWeek] = [];
            planned[apiPlanned.dayOfWeek].push({
                ...apiPlanned,
                project: {
                    ...apiPlanned.project,
                    color: getColorForProject(apiPlanned.project.id)
                }
            });
        });

        return { activities, planned };

    } catch (error) {
        console.error('Erreur lors de la récupération des pointages:', error);
        return { activities: [], planned: {} }; // Retourne un état vide en cas d'erreur
    }
};

const generateFakeApiResponse = (weekStart: Date): ApiResponse => {
    const projects: Record<string, Project> = {
        aura: { id: 1, name: 'Project X', color: '', client: 'Aura' },
        nexus: { id: 2, name: 'ACME', color: '', client: 'ACME' },
        office: { id: 3, name: 'Office', color: '' },
        break: { id: 4, name: 'Break', color: '' }
    };
    const createApi = (day: number, start: string, end: string, proj: Project, desc: string): ApiActivity => {
        const d = addDays(weekStart, day);
        const [sh, sm] = start.split(':').map(Number);
        const [eh, em] = end.split(':').map(Number);
        return {
            id: `${day}-${start}`, type: proj.id === 4 ? 'BREAK' : 'WORK',
            startTime: set(d, { hours: sh, minutes: sm, seconds: 0, milliseconds: 0 }).toISOString(),
            endTime: set(d, { hours: eh, minutes: em, seconds: 0, milliseconds: 0 }).toISOString(),
            project: proj, description: desc
        };
    };
    return {
        activities: [
            createApi(0, "13:00", "16:00", projects.office, "Formazione aziendale"),
            createApi(0, "16:00", "17:00", projects.break, "Pausa pranzo"),
            createApi(0, "17:00", "19:00", projects.nexus, "Sviluppo"),
            createApi(1, "13:00", "14:00", projects.aura, "Riunione"),
            createApi(1, "14:00", "15:00", projects.break, "Pausa pranzo"),
            createApi(1, "15:00", "17:00", projects.aura, "UI/UX"),
            createApi(1, "17:00", "18:00", projects.office, "Email"),
        ],
        planned: [
            { dayOfWeek: 0, project: projects.office, plannedHours: 4 },
            { dayOfWeek: 0, project: projects.nexus, plannedHours: 2 },
            { dayOfWeek: 1, project: projects.aura, plannedHours: 4 },
            { dayOfWeek: 1, project: projects.office, plannedHours: 1 },
        ]
    };
}

interface ProcessedActivity extends Activity { top: number; height: number; left: number; width: number; }

const useMediaQuery = (query: string) => {
    const [matches, setMatches] = useState(false);
    useEffect(() => {
        const media = window.matchMedia(query);
        const updateMatch = () => setMatches(media.matches);
        updateMatch();
        media.addEventListener('change', updateMatch);
        return () => media.removeEventListener('change', updateMatch);
    }, [query]);
    return matches;
};

//================================================================================
// 3. SOUS-COMPOSANTS D'UI
//================================================================================
const ActivityBlock = React.memo(({ activity }: { activity: ProcessedActivity }) => {
    // **AMÉLIORATION : Affichage distinct et clair pour les pauses**
    if (activity.type === 'BREAK') {
        return (
            <div
                className="absolute z-5 p-2 rounded-md overflow-hidden w-full flex items-center justify-center"
                style={{
                    top: `${activity.top}px`, height: `${activity.height}px`,
                    // Fond hachuré pour un look plus léger
                    backgroundImage: `repeating-linear-gradient(-45deg, transparent, transparent 4px, ${activity.project.color}20 4px, ${activity.project.color}20 5px)`
                }}
            >
                <div className="flex items-center gap-2 text-xs font-medium" style={{ color: activity.project.color }}>
                    <Coffee className="h-4 w-4" /> {activity.description}
                </div>
            </div>
        );
    }

    // Affichage standard pour les activités de travail
    return (
        <Popover>
            <PopoverTrigger asChild>
                <motion.div
                    layoutId={`activity-${activity.id}`}
                    initial={{ opacity: 0, scaleY: 0.8 }} animate={{ opacity: 1, scaleY: 1 }} exit={{ opacity: 0 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    className="absolute z-10 p-2 rounded-md overflow-hidden cursor-pointer group hover:shadow-lg hover:z-20 transition-shadow"
                    style={{
                        top: `${activity.top}px`, height: `${activity.height}px`,
                        left: `${activity.left}%`, width: `${activity.width}%`,
                        backgroundColor: `${activity.project.color}20`,
                        borderLeft: `3px solid ${activity.project.color}`
                    }}
                >
                    <p className="font-semibold text-xs leading-tight" style={{ color: activity.project.color }}>{activity.description}</p>
                    <p className="text-xs text-muted-foreground">{activity.project.name}</p>
                </motion.div>
            </PopoverTrigger>
            <PopoverContent className="w-64">
                <div className="flex justify-between items-start">
                    <h4 className="font-semibold">{activity.description}</h4>
                    <Badge variant="outline" style={{ borderColor: activity.project.color, color: activity.project.color }}>{activity.project.client || "Interne"}</Badge>
                </div>
                <p className="text-sm text-muted-foreground">{activity.project.name}</p>
                <Separator className="my-2" />
                <p className="text-sm flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    {format(activity.startTime, 'p', { locale: fr })} - {format(activity.endTime, 'p', { locale: fr })}
                </p>
                <div className="mt-4 flex justify-end gap-2">
                    <Button variant="ghost" size="icon" className="h-8 w-8"><Paperclip className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button>
                </div>
            </PopoverContent>
        </Popover>
    );
});

const TimeAxis = React.memo(({ startHour, endHour, pixelsPerMinute }: { startHour: number, endHour: number, pixelsPerMinute: number }) => {
    const hours = [];
    for (let i = startHour; i < endHour; i++) {
        hours.push(i);
    }
    return <div className="relative col-start-1 row-start-3 text-right pr-2 select-none">
        {hours.map(hour => (
            <div key={hour} style={{ height: `${60 * pixelsPerMinute}px` }} className="-mt-3.5 flex justify-end items-start pt-3.5">
                <span className="text-xs text-muted-foreground">{format(new Date(0, 0, 0, hour), 'p', { locale: fr })}</span>
            </div>
        ))}
    </div>;
});

const LiveTimeIndicator = React.memo(({ startHour, pixelsPerMinute }: { startHour: number, pixelsPerMinute: number }) => {
    const [top, setTop] = useState(0);
    useEffect(() => {
        const update = () => {
            const now = new Date();
            const minutes = getHours(now) * 60 + getMinutes(now);
            const startMinutes = startHour * 60;
            const minutesFromStart = minutes - startMinutes;
            setTop(minutesFromStart * pixelsPerMinute);
        };
        const interval = setInterval(update, 60000); update();
        return () => clearInterval(interval);
    }, [startHour, pixelsPerMinute]);

    return (
        <div className="absolute left-12 right-0 z-20 pointer-events-none" style={{ top: `${top}px` }}>
            <div className="relative h-px bg-red-500"><div className="absolute -left-1 -top-1 w-2 h-2 bg-red-500 rounded-full" /></div>
        </div>
    );
});
//================================================================================
// 4. LOGIQUE & COMPOSANT PRINCIPAL
//================================================================================

// Hook pour calculer la plage horaire dynamiquement
const useCalendarView = (activities: Activity[]) => {
    return useMemo(() => {
        if (activities.length === 0) return { viewStartHour: 8, viewEndHour: 19, totalViewHeight: (11 * 60) * PIXELS_PER_MINUTE };
        let minHour = 23, maxHour = 0;
        activities.forEach(act => {
            const startH = getHours(act.startTime); const endH = getHours(act.endTime); const endM = getMinutes(act.endTime);
            if (startH < minHour) minHour = startH;
            if (endH + (endM > 0 ? 1 : 0) > maxHour) maxHour = endH + (endM > 0 ? 1 : 0);
        });
        const viewStartHour = Math.max(0, minHour - 1);
        const viewEndHour = Math.min(24, maxHour);
        return { viewStartHour, viewEndHour, totalViewHeight: (viewEndHour - viewStartHour) * 60 * PIXELS_PER_MINUTE };
    }, [activities]);
};

export const ProfessionalTimeSheetCalendar = () => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [data, setData] = useState<{ activities: Activity[], planned: Record<number, PlannedActivity[]> }>({ activities: [], planned: {} });
    const [isLoading, setIsLoading] = useState(true);
    const [selectedMobileDay, setSelectedMobileDay] = useState(() => startOfDay(new Date()));

    const isMobile = useMediaQuery("(max-width: 1023px)");

    const weekStart = useMemo(() => startOfWeek(currentDate, { weekStartsOn: 1 }), [currentDate]);
    const daysInWeek = useMemo(() => eachDayOfInterval({ start: weekStart, end: addDays(weekStart, 6) }), [weekStart]);

    useEffect(() => {
        setIsLoading(true);
        fetchDataForWeek(weekStart).then(weekData => {
            setData(weekData);
            setIsLoading(false);
        });
    }, [weekStart]);

    const { viewStartHour, viewEndHour, totalViewHeight } = useCalendarView(data.activities);

    const goToCurrentWeek = useCallback(() => {
        const today = new Date();
        setCurrentDate(today);
        setSelectedMobileDay(startOfDay(today));
    }, []);
    const goToLastWeek = useCallback(() => {
        const today = new Date();
        const lastWeek = addDays(today, -7);
        setCurrentDate(lastWeek);
        setSelectedMobileDay(startOfDay(lastWeek));
    }, []);


    // Algorithme de gestion des chevauchements
    const processedActivitiesByDay = useMemo(() => {
        const grouped = new Map<string, ProcessedActivity[]>();
        daysInWeek.forEach(day => {
            const dayKey = format(day, 'yyyy-MM-dd');
            const dayActivities = data.activities.filter(act => {
                const isSame = isSameDay(act.startTime, day);
                if (isSame) {
                    console.log(`✅ Activité trouvée pour ${dayKey}:`, {
                        id: act.id,
                        description: act.description,
                        startTime: act.startTime.toISOString(),
                        endTime: act.endTime.toISOString()
                    });
                }
                return isSame;
            }).sort((a, b) => a.startTime.getTime() - b.startTime.getTime());

            console.log(`📅 ${dayKey}: ${dayActivities.length} activités trouvées`);

            const processed: ProcessedActivity[] = [];
            const columns: Activity[][] = [];
            dayActivities.forEach(activity => {
                let placed = false;
                for (const col of columns) {
                    if (col[col.length - 1].endTime <= activity.startTime) {
                        col.push(activity);
                        placed = true;
                        break;
                    }
                }
                if (!placed) columns.push([activity]);
            });

            const numColumns = columns.length;
            columns.forEach((col, colIndex) => {
                col.forEach(activity => {
                    const startMinutes = getHours(activity.startTime) * 60 + getMinutes(activity.startTime);
                    const endMinutes = getHours(activity.endTime) * 60 + getMinutes(activity.endTime);
                    const startOffset = viewStartHour * 60;

                    processed.push({
                        ...activity,
                        top: (startMinutes - startOffset) * PIXELS_PER_MINUTE,
                        height: (endMinutes - startMinutes) * PIXELS_PER_MINUTE,
                        left: (colIndex / numColumns) * 100,
                        width: (1 / numColumns) * 100,
                    });
                });
            });
            grouped.set(dayKey, processed);
        });
        return grouped;
    }, [data.activities, daysInWeek, viewStartHour]);

    const changeWeek = useCallback((dir: 'next' | 'prev') => setCurrentDate(d => addDays(d, dir === 'next' ? 7 : -7)), []);
    const goToToday = useCallback(() => { const today = new Date(); setCurrentDate(today); setSelectedMobileDay(startOfDay(today)); }, []);

    const dayHeaders = (days: Date[]) => (
        days.map(day => (
            <div key={day.toISOString()} className={`p-2 text-center ${isSameDay(day, new Date()) ? 'bg-blue-50 dark:bg-blue-900/50' : ''}`}>
                <p className="text-xs text-muted-foreground">{format(day, 'E', { locale: fr })}</p>
                <p className="font-bold text-lg">{format(day, 'd')}</p>
            </div>
        ))
    );

    const plannedRow = (days: Date[]) => (
        days.map((day) => {
            const dayOfWeek = getDay(day) === 0 ? 6 : getDay(day) - 1; // Lundi=0, Dimanche=6
            const plannedForDay = data.planned[dayOfWeek] || [];
            return (
                <div key={format(day, 'T')} className="p-1 min-h-[50px] space-y-1">
                    {plannedForDay.map(p => (
                        <Badge key={p.project.id} variant="secondary" className="w-full justify-between h-5" style={{ backgroundColor: `${p.project.color}20`, borderColor: `${p.project.color}50` }}>
                            <span className="font-semibold text-xs truncate" style={{ color: p.project.color }}>{p.project.name}</span>
                            <span className="text-muted-foreground text-xs">{p.plannedHours}h</span>
                        </Badge>
                    ))}
                </div>
            );
        })
    );

    const contentGrid = (days: Date[]) => (
        <div className={`col-start-2 grid ${isMobile ? 'grid-cols-1' : 'grid-cols-7'}`}>
            {days.map(day => {
                const dayKey = format(day, 'yyyy-MM-dd');
                return (
                    <div key={dayKey} className="relative border-r" style={{ height: `${totalViewHeight}px` }}>
                        {Array.from({ length: viewEndHour - viewStartHour }).map((_, i) => <div key={i} style={{ height: `${60 * PIXELS_PER_MINUTE}px` }} className="border-b border-dashed border-border/30"></div>)}
                        <AnimatePresence>
                            {(processedActivitiesByDay.get(dayKey) || []).map(act => <ActivityBlock key={act.id} activity={act} />)}
                        </AnimatePresence>
                    </div>
                );
            })}
            <LiveTimeIndicator startHour={viewStartHour} pixelsPerMinute={PIXELS_PER_MINUTE} />
        </div>
    );


    return (
        <Card className="w-full shadow-lg overflow-hidden">
            <CardContent className="p-2 sm:p-4">
                <div className="p-2 flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                    <h2 className="text-lg font-semibold">{format(weekStart, 'MMMM yyyy', { locale: fr })}</h2>
                    <p className="text-sm text-muted-foreground">
                        Semaine du {format(weekStart, 'd MMM', { locale: fr })} au {format(addDays(weekStart, 6), 'd MMM yyyy', { locale: fr })}
                        {isSameWeek(weekStart, new Date()) && " (semaine actuelle)"}
                        {isSameWeek(weekStart, addDays(new Date(), -7)) && " (semaine dernière)"}
                        {isLoading && " - Chargement..."}
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                            console.log('🔍 Debug Info:');
                            console.log('Current weekStart:', format(weekStart, 'yyyy-MM-dd'));
                            console.log('Data state:', data);
                            console.log('Activities count:', data.activities.length);
                            console.log('Planned keys:', Object.keys(data.planned));
                        }}
                    >
                        Debug
                    </Button>
                    <Button variant="outline" size="icon" onClick={() => changeWeek('prev')}><ChevronLeft className="h-4 w-4" /></Button>
                    <Button variant="outline" size="sm" onClick={goToLastWeek}>Semaine dernière</Button>
                    <Button variant="outline" size="sm" onClick={goToCurrentWeek}>Cette semaine</Button>
                    <Button variant="outline" size="icon" onClick={() => changeWeek('next')}><ChevronRight className="h-4 w-4" /></Button>
                </div>

                {isLoading ? (
                    <div className="flex items-center justify-center h-96">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                ) : isMobile ? (
                    // === LAYOUT MOBILE ===
                    <div className="mt-2">
                        <ToggleGroup type="single" value={format(selectedMobileDay, 'yyyy-MM-dd')} onValueChange={val => val && setSelectedMobileDay(new Date(val))} className="grid grid-cols-7 gap-1">
                            {daysInWeek.map(d => <ToggleGroupItem key={format(d, 'd')} value={format(d, 'yyyy-MM-dd')} variant="outline" className={`flex flex-col h-14 ${isSameDay(d, new Date()) ? 'border-blue-500' : ''}`}>{format(d, 'E', { locale: fr })}<span className="font-bold">{format(d, 'd')}</span></ToggleGroupItem>)}
                        </ToggleGroup>
                        <div className="mt-4 grid grid-cols-[48px_1fr] border-t border-l">
                            <div className="col-start-2 border-r border-b">{dayHeaders([selectedMobileDay])}</div>
                            <div className="col-start-2 border-r border-b bg-slate-50">{plannedRow([selectedMobileDay])}</div>
                            <div className="row-start-3"><TimeAxis startHour={viewStartHour} endHour={viewEndHour} pixelsPerMinute={PIXELS_PER_MINUTE} /></div>
                            {contentGrid([selectedMobileDay])}
                        </div>
                    </div>) : (
                    // === LAYOUT DESKTOP AVEC SCROLL ===
                    <div className="mt-2 overflow-x-auto">
                        <div className="min-w-[1050px]">
                            <div className="grid grid-cols-[52px_repeat(7,_1fr)]">
                                {/* Headers et rangées "sticky" */}
                                <div className="col-start-2 col-span-7 grid grid-cols-7 sticky top-0 z-20 bg-background border-l border-t">{dayHeaders(daysInWeek)}</div>
                                <div className="col-start-2 col-span-7 grid grid-cols-7 sticky top-[61px] z-20 bg-background/80 backdrop-blur-sm border-l">
                                    {plannedRow(daysInWeek)}
                                </div>
                                <div className="row-start-3 col-start-1 border-t"><TimeAxis startHour={viewStartHour} endHour={viewEndHour} pixelsPerMinute={PIXELS_PER_MINUTE} /></div>
                                <div className="row-start-3 col-start-2 col-span-7 relative border-t border-l">
                                    {contentGrid(daysInWeek)}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};