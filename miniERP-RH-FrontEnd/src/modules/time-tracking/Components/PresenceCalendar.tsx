// components/ProfessionalTimeSheetCalendar.tsx

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { ChevronLeft, ChevronRight, Clock, Paperclip, MoreHorizontal, Coffee, Loader2, CalendarDays, Users } from 'lucide-react';
import { addDays, startOfWeek, format, eachDayOfInterval, isSameDay, startOfDay, getMinutes, getHours, getDay, isSameWeek } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Separator } from '@/components/ui/separator';

//================================================================================
// 1. TYPES ET CONFIGURATION
//================================================================================

// Types internes utilisés par le composant pour une manipulation facile
type ActivityType = 'WORK' | 'BREAK' | 'MEETING';
interface Project { id: number; name: string; color: string; client?: string; }
interface Activity { id: string; type: ActivityType; description: string; startTime: Date; endTime: Date; project: Project; }
interface PlannedActivity { project: Project; plannedHours: number; }
interface ApiActivity { id: string | number; type: 'WORK' | 'BREAK' | 'MEETING'; description: string; startTime: string; endTime: string; project: Project; }
interface ApiPlanned { dayOfWeek: number; project: Project; plannedHours: number; }
interface ApiResponse { activities: ApiActivity[]; planned: ApiPlanned[]; }
const PIXELS_PER_MINUTE = 0.7;
const BREAK_COLOR = '#64748b';
const MEETING_COLOR = '#10b981'; // Couleur verte pour les réunions
const PROJECT_COLORS = ['#3b82f6', '#ec4899', '#f97316', '#10b981', '#8b5cf6', '#ef4444'];
let projectColorMap = new Map<number, string>();
const getColorForProject = (projectId: number): string => {
    if (!projectColorMap.has(projectId)) projectColorMap.set(projectId, PROJECT_COLORS[projectColorMap.size % PROJECT_COLORS.length]);
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

        projectColorMap = new Map<number, string>(); // Réinitialise le cache de couleurs

        const activities: Activity[] = data.activities.map(apiActivity => ({
            id: String(apiActivity.id),
            type: apiActivity.type,
            description: apiActivity.description,
            startTime: new Date(apiActivity.startTime), // JS parse directement les strings ISO 8601
            endTime: new Date(apiActivity.endTime),
            project: {
                ...apiActivity.project,
                color: apiActivity.type === 'BREAK' ? BREAK_COLOR :
                    apiActivity.type === 'MEETING' ? MEETING_COLOR :
                        getColorForProject(apiActivity.project.id)
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
                className="absolute z-5 p-1 rounded-md overflow-hidden w-full flex items-center justify-center text-xs"
                style={{
                    top: `${activity.top}px`,
                    height: `${Math.max(activity.height, 12)}px`,
                    // Fond hachuré pour un look plus léger
                    backgroundImage: `repeating-linear-gradient(-45deg, transparent, transparent 2px, ${activity.project.color}20 2px, ${activity.project.color}20 3px)`
                }}
            >
                <div className="flex items-center gap-1 text-xs font-medium truncate" style={{ color: activity.project.color }}>
                    <Coffee className="h-3 w-3 flex-shrink-0" />
                    <span className="truncate">{activity.description}</span>
                </div>
            </div>
        );
    }

    // **NOUVEAU : Affichage distinct pour les réunions**
    if (activity.type === 'MEETING') {
        return (
            <Popover>
                <PopoverTrigger asChild>
                    <div
                        className="absolute z-5 p-1 rounded-md overflow-hidden w-full flex items-center justify-center text-xs cursor-pointer hover:shadow-lg transition-shadow"
                        style={{
                            top: `${activity.top}px`,
                            height: `${Math.max(activity.height, 12)}px`,
                            // Fond avec motif en points pour les réunions
                            backgroundImage: `radial-gradient(circle, ${activity.project.color}30 1px, transparent 1px)`,
                            backgroundSize: '6px 6px',
                            backgroundColor: `${activity.project.color}10`,
                            border: `1px solid ${activity.project.color}40`
                        }}
                    >
                        <div className="flex items-center gap-1 text-xs font-medium truncate" style={{ color: activity.project.color }}>
                            <Users className="h-3 w-3 flex-shrink-0" />
                            <span className="truncate">{activity.description}</span>
                        </div>
                    </div>
                </PopoverTrigger>
                <PopoverContent className="w-64">
                    <div className="flex justify-between items-start">
                        <h4 className="font-semibold">{activity.description}</h4>
                        <Badge variant="outline" style={{ borderColor: activity.project.color, color: activity.project.color }}>
                            Réunion
                        </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{activity.project.name}</p>
                    <Separator className="my-2" />
                    <p className="text-sm flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        {format(activity.startTime, 'p', { locale: fr })} - {format(activity.endTime, 'p', { locale: fr })}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">Temps comptabilisé comme travail</p>
                    <div className="mt-4 flex justify-end gap-2">
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Paperclip className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </div>
                </PopoverContent>
            </Popover>
        );
    }

    return (
        <Popover>
            <PopoverTrigger asChild>
                <motion.div
                    layoutId={`activity-${activity.id}`}
                    initial={{ opacity: 0, scaleY: 0.8 }}
                    animate={{ opacity: 1, scaleY: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    className="absolute z-10 p-1 rounded-md overflow-hidden cursor-pointer group hover:shadow-lg hover:z-20 transition-shadow"
                    style={{
                        top: `${activity.top}px`,
                        height: `${Math.max(activity.height, 16)}px`,
                        left: `${activity.left}%`,
                        width: `${activity.width}%`,
                        backgroundColor: `${activity.project.color}20`,
                        borderLeft: `2px solid ${activity.project.color}`
                    }}
                >
                    <p className="font-semibold text-xs leading-tight truncate" style={{ color: activity.project.color }}>
                        {activity.description}
                    </p>
                    {activity.height > 20 && (
                        <p className="text-xs text-muted-foreground truncate">{activity.project.name}</p>
                    )}
                </motion.div>
            </PopoverTrigger>
            <PopoverContent className="w-64">
                <div className="flex justify-between items-start">
                    <h4 className="font-semibold">{activity.description}</h4>
                    <Badge variant="outline" style={{ borderColor: activity.project.color, color: activity.project.color }}>
                        {activity.project.client || "Interne"}
                    </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{activity.project.name}</p>
                <Separator className="my-2" />
                <p className="text-sm flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    {format(activity.startTime, 'p', { locale: fr })} - {format(activity.endTime, 'p', { locale: fr })}
                </p>
                <div className="mt-4 flex justify-end gap-2">
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Paperclip className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                    </Button>
                </div>
            </PopoverContent>
        </Popover>
    );
});

const TimeAxis = React.memo(({ startHour, endHour }: { startHour: number; endHour: number }) => {
    // Calculer les heures à afficher en fonction de la plage
    const duration = endHour - startHour;
    let step = 1; // Par défaut, afficher toutes les heures

    // Si la plage est grande, afficher toutes les 2 heures
    if (duration > 8) step = 2;
    // Si la plage est très grande, afficher toutes les 3 heures
    if (duration > 12) step = 3;

    const hours = [];
    for (let hour = Math.ceil(startHour); hour <= Math.floor(endHour); hour += step) {
        hours.push(hour);
    }

    // Toujours inclure l'heure de fin si elle n'est pas déjà incluse
    if (Math.floor(endHour) !== hours[hours.length - 1]) {
        hours.push(Math.floor(endHour));
    }

    return (
        <div className="relative h-full text-right select-none pr-1 text-xs">
            {hours.map(hour => {
                const minutesFromStart = (hour - startHour) * 60;
                const topPosition = minutesFromStart * PIXELS_PER_MINUTE;
                return (
                    <div
                        key={hour}
                        className="absolute w-full"
                        style={{ top: `${topPosition}px` }}
                    >
                        <span className="text-xs text-muted-foreground transform -translate-y-1/2 mr-4" >
                            {hour.toString().padStart(2, '0')}:00
                        </span>
                    </div>
                );
            })}
        </div>
    );
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

const useCalendarView = (activities: Activity[]) => {
    return useMemo(() => {
        if (activities.length === 0) return { viewStartHour: 8, viewEndHour: 18 };
        let minHour = 23, maxHour = 0;
        activities.forEach(act => {
            const startH = getHours(act.startTime);
            const endH = getHours(act.endTime);
            const endM = getMinutes(act.endTime);
            if (startH < minHour) minHour = startH;
            if (endH + (endM > 0 ? 1 : 0) > maxHour) maxHour = endH + (endM > 0 ? 1 : 0);
        });

        // Adapter la plage horaire aux activités réelles
        const viewStartHour = Math.max(0, minHour - 0.5); // 30 minutes avant la première activité
        const viewEndHour = Math.min(24, maxHour + 0.5); // 30 minutes après la dernière activité

        // Assurer une hauteur minimale de 4h pour une bonne lisibilité
        const minDuration = 4;
        if (viewEndHour - viewStartHour < minDuration) {
            const center = Math.floor((viewStartHour + viewEndHour) / 2);
            return {
                viewStartHour: Math.max(0, center - Math.floor(minDuration / 2)),
                viewEndHour: Math.min(24, center + Math.ceil(minDuration / 2))
            };
        }

        return { viewStartHour, viewEndHour };
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

    // Références pour synchroniser le scroll
    const timeAxisScrollRef = React.useRef<HTMLDivElement>(null);
    const contentScrollRef = React.useRef<HTMLDivElement>(null);

    // Fonction pour synchroniser le scroll
    const syncScroll = useCallback((source: 'timeAxis' | 'content', scrollTop: number) => {
        if (source === 'content' && timeAxisScrollRef.current) {
            timeAxisScrollRef.current.scrollTop = scrollTop;
        } else if (source === 'timeAxis' && contentScrollRef.current) {
            contentScrollRef.current.scrollTop = scrollTop;
        }
    }, []);

    useEffect(() => {
        setIsLoading(true);
        fetchDataForWeek(weekStart).then(weekData => {
            setData(weekData);
            setIsLoading(false);
        });
    }, [weekStart]);

    useEffect(() => {
        setIsLoading(true);
        fetchDataForWeek(weekStart).then(weekData => {
            setData(weekData);
            setIsLoading(false);
        });
    }, [weekStart]);



    const { viewStartHour, viewEndHour } = useCalendarView(data.activities);

    // Algorithme de gestion des chevauchements
    const processedActivitiesByDay = useMemo(() => {
        const grouped = new Map<string, ProcessedActivity[]>();
        daysInWeek.forEach(day => {
            const dayKey = format(day, 'yyyy-MM-dd');
            const dayActivities = data.activities.filter(act => isSameDay(act.startTime, day))
                .sort((a, b) => a.startTime.getTime() - b.startTime.getTime());

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

    const totalViewHeight = useMemo(() => (viewEndHour - viewStartHour) * 60 * PIXELS_PER_MINUTE, [viewStartHour, viewEndHour]);

    // Calculer la hauteur maximale dynamique basée sur le contenu
    const maxCalendarHeight = useMemo(() => {
        const baseHeight = 120; // Header seulement (réduit après suppression de plannedRow)
        const contentHeight = totalViewHeight;
        const maxScreenHeight = typeof window !== 'undefined' ? window.innerHeight * 0.80 : 450;
        return Math.min(baseHeight + contentHeight, maxScreenHeight);
    }, [totalViewHeight]);

    const goToCurrentWeek = useCallback(() => setCurrentDate(new Date()), []);
    const goToLastWeek = useCallback(() => setCurrentDate(addDays(new Date(), -7)), []);
    const changeWeek = useCallback((dir: 'next' | 'prev') => setCurrentDate(d => addDays(d, dir === 'next' ? 7 : -7)), []);

    // Calculer les heures de travail par jour
    const getDayWorkHours = useCallback((day: Date) => {
        const dayActivities = data.activities.filter(act =>
            isSameDay(act.startTime, day) && (act.type === 'WORK' || act.type === 'MEETING')
        );

        const totalMinutes = dayActivities.reduce((acc, act) => {
            const duration = (act.endTime.getTime() - act.startTime.getTime()) / (1000 * 60);
            return acc + duration;
        }, 0);

        return Math.round(totalMinutes / 60 * 10) / 10; // Arrondi à 1 décimale
    }, [data.activities]);

    // Obtenir les projets uniques d'un jour
    const getDayProjects = useCallback((day: Date) => {
        const dayActivities = data.activities.filter(act =>
            isSameDay(act.startTime, day) && act.type === 'WORK'
        );

        const projectsMap = new Map();
        dayActivities.forEach(act => {
            const projectId = act.project.id;
            if (!projectsMap.has(projectId)) {
                projectsMap.set(projectId, {
                    ...act.project,
                    hours: 0
                });
            }
            const duration = (act.endTime.getTime() - act.startTime.getTime()) / (1000 * 60 * 60);
            projectsMap.get(projectId).hours += duration;
        });

        return Array.from(projectsMap.values()).map(p => ({
            ...p,
            hours: Math.round(p.hours * 10) / 10
        }));
    }, [data.activities]);

    const headerHeight = useMemo(() => {
        // Calculer la hauteur nécessaire basée sur le contenu des en-têtes
        const hasWorkHours = daysInWeek.some(day => getDayWorkHours(day) > 0);
        const hasProjects = daysInWeek.some(day => getDayProjects(day).length > 0);

        let baseHeight = 40; // Hauteur de base pour jour + nom
        if (hasWorkHours) baseHeight += 20; // Badge des heures
        if (hasProjects) baseHeight += 24; // Indicateurs de projets

        return Math.max(baseHeight, 88); // Minimum 88px pour une bonne lisibilité
    }, [daysInWeek, data.activities]);

    const dayHeaders = (days: Date[]) => (
        days.map(day => {
            const workHours = getDayWorkHours(day);
            const projects = getDayProjects(day);
            const isToday = isSameDay(day, new Date());

            return (
                <div key={day.toISOString()} className={`p-1 text-center border-r last:border-r-0 ${isToday ? 'bg-blue-50 dark:bg-blue-900/50' : ''}`}>
                    <div className="flex flex-col items-center">
                        <p className="text-xs text-muted-foreground">{format(day, 'E', { locale: fr })}</p>
                        <p className="font-bold text-sm">{format(day, 'd')}</p>
                        {workHours > 0 && (
                            <div className="mt-1 w-full">
                                <Badge variant="outline" className="text-xs px-1 py-0 h-4" style={{ fontSize: '10px' }}>
                                    {workHours}h
                                </Badge>
                                {projects.length > 0 && (
                                    <div className="mt-1 space-y-0.5 max-w-full">
                                        {projects.slice(0, 2).map(project => (
                                            <div
                                                key={project.id}
                                                className="w-full h-1 rounded-sm"
                                                style={{ backgroundColor: project.color }}
                                                title={`${project.name}: ${project.hours}h`}
                                            />
                                        ))}
                                        {projects.length > 2 && (
                                            <div className="text-xs text-muted-foreground" style={{ fontSize: '9px' }}>
                                                +{projects.length - 2}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            );
        })
    );




    const contentGrid = (days: Date[]) => (
        <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-7'}`}>
            {days.map(day => {
                const dayKey = format(day, 'yyyy-MM-dd');
                return (
                    <div key={dayKey} className="relative border-r last:border-r-0 dark:border-slate-700 min-h-0" style={{ height: `${totalViewHeight}px` }}>
                        {Array.from({ length: viewEndHour - viewStartHour }).map((_, i) =>
                            <div key={i} style={{ height: `${60 * PIXELS_PER_MINUTE}px` }} className="border-b border-dashed border-border/30 dark:border-slate-700/50"></div>
                        )}
                        <AnimatePresence>
                            {(processedActivitiesByDay.get(dayKey) || []).map(act =>
                                <ActivityBlock key={act.id} activity={act} />
                            )}
                        </AnimatePresence>
                    </div>
                );
            })}
            {isSameWeek(new Date(), days[0]) && <LiveTimeIndicator startHour={viewStartHour} pixelsPerMinute={PIXELS_PER_MINUTE} />}
        </div>
    );


    return (
        <div className="w-full flex flex-col">
            <Card className="shadow-lg border-gray-200/80 flex flex-col" style={{ maxHeight: `${maxCalendarHeight}px` }}>
                <CardHeader className="bg-blue-600 text-white rounded-t-lg p-3 flex-shrink-0">
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                        {/* Partie gauche : Titre et date */}
                        <div className="flex items-center space-x-3">
                            <CalendarDays className="h-6 w-6 flex-shrink-0" />
                            <div>
                                <CardTitle className="text-xl font-bold capitalize">
                                    {format(weekStart, 'MMMM yyyy', { locale: fr })}
                                </CardTitle>
                                <CardDescription className="text-blue-200 text-sm">
                                    Semaine du {format(weekStart, 'd')} au {format(addDays(weekStart, 6), 'd MMMM', { locale: fr })}
                                </CardDescription>
                            </div>
                        </div>

                        {/* Partie droite : Navigation */}
                        <div className="flex items-center gap-2 justify-between">
                            <div className="flex items-center gap-2">
                                <Button variant="ghost" size="icon" onClick={() => changeWeek('prev')} className="text-white hover:bg-white/10 h-8 w-8">
                                    <ChevronLeft className="h-4 w-4" />
                                </Button>
                                <div className="hidden md:flex items-center gap-2">
                                    <Button variant="outline" size="sm" onClick={goToLastWeek} className="bg-white/10 border-white/20 text-white hover:bg-white/20 text-xs px-2 py-1">Sem. dernière</Button>
                                    <Button variant="outline" size="sm" onClick={goToCurrentWeek} className="bg-white text-blue-600 hover:bg-blue-50 text-xs px-2 py-1">Aujourd'hui</Button>
                                </div>
                                <Button variant="ghost" size="icon" onClick={() => changeWeek('next')} className="text-white hover:bg-white/10 h-8 w-8">
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            </div>
                            {isLoading && <Loader2 className="h-4 w-4 animate-spin text-white/80 ml-2" />}
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="p-0 flex-1 overflow-hidden">
                    {isLoading ? (
                        <div className="flex items-center justify-center h-96">
                            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                        </div>
                    ) : isMobile ? (
                        // === LAYOUT MOBILE (optimisé pour les petits écrans) ===
                        <div className="p-2">
                            <ToggleGroup type="single" value={format(selectedMobileDay, 'yyyy-MM-dd')} onValueChange={val => val && setSelectedMobileDay(new Date(val))} className="grid grid-cols-7 gap-1 mb-2">
                                {daysInWeek.map(d =>
                                    <ToggleGroupItem key={format(d, 'd')} value={format(d, 'yyyy-MM-dd')} variant="outline" className={`flex flex-col h-10 text-xs ${isSameDay(d, new Date()) ? 'border-blue-500' : ''}`}>
                                        {format(d, 'E', { locale: fr })}
                                        <span className="font-bold">{format(d, 'd')}</span>
                                    </ToggleGroupItem>
                                )}
                            </ToggleGroup>
                            <div className="grid grid-cols-[60px_1fr] border rounded-lg overflow-hidden">
                                <div className="col-start-2 border-b p-1 bg-slate-50 dark:bg-slate-800/50" style={{ minHeight: `${headerHeight}px` }}>{dayHeaders([selectedMobileDay])}</div>
                                <div className="border-r bg-slate-50 dark:bg-slate-800/50 text-xs"><TimeAxis startHour={viewStartHour} endHour={viewEndHour} /></div>
                                <div className="relative" style={{ maxHeight: `${Math.min(totalViewHeight, 350)}px`, overflowY: totalViewHeight > 350 ? 'auto' : 'visible' }}>{contentGrid([selectedMobileDay])}</div>
                            </div>
                        </div>
                    ) : (
                        // === LAYOUT DESKTOP OPTIMISÉ ===
                        <div className="grid grid-cols-[80px_1fr]" style={{ height: `${Math.min(totalViewHeight + 60, maxCalendarHeight - 60)}px` }}>
                            <div className="border-r dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 flex flex-col">
                                {/* Headers spacer - hauteur dynamique synchronisée avec dayHeaders */}
                                <div className="border-b dark:border-slate-700" style={{ height: `${headerHeight}px` }}></div>
                                {/* Time axis - sticky qui suit le scroll */}
                                <div className="flex-1 relative">
                                    <div
                                        ref={timeAxisScrollRef}
                                        className="absolute inset-0 overflow-y-auto overflow-x-hidden [&::-webkit-scrollbar]:hidden"
                                        onScroll={(e) => syncScroll('timeAxis', e.currentTarget.scrollTop)}
                                        style={{
                                            scrollbarWidth: 'none',
                                            msOverflowStyle: 'none'
                                        }}
                                    >
                                        <TimeAxis startHour={viewStartHour} endHour={viewEndHour} />
                                    </div>
                                </div>
                            </div>
                            <div className="flex flex-col overflow-hidden">
                                <div className="flex-shrink-0 bg-background border-b dark:border-slate-700">
                                    <div className="grid grid-cols-7 border-b dark:border-slate-700" style={{ minHeight: `${headerHeight}px` }}>{dayHeaders(daysInWeek)}</div>
                                </div>
                                <div className="flex-1 relative">
                                    <div
                                        ref={contentScrollRef}
                                        className="absolute inset-0"
                                        style={{
                                            overflowY: totalViewHeight > (maxCalendarHeight - 120) ? 'auto' : 'visible',
                                            overflowX: 'hidden'
                                        }}
                                        onScroll={(e) => syncScroll('content', e.currentTarget.scrollTop)}
                                    >
                                        {contentGrid(daysInWeek)}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};
