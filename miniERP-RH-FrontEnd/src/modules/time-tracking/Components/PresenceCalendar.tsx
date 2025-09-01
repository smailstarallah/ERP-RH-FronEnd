// components/WeeklyTimeSheetCalendar.tsx

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { ChevronLeft, ChevronRight, Clock, Briefcase, Coffee, Info } from 'lucide-react';
import { addDays, startOfWeek, format, eachDayOfInterval, getDay, isSameDay, startOfDay } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Separator } from '@/components/ui/separator';

//================================================================================
// 1. TYPES ET DONNÉES SYNTHÉTIQUES
//================================C================================================

type ActivityType = 'WORK' | 'BREAK';
interface Activity {
    id: number;
    type: ActivityType;
    description: string;
    startTime: Date;
    endTime: Date;
    project: { id: number; name: string; color: string; };
}

// Fonction pour générer des données dynamiques et réalistes
const generateRealisticActivities = (weekStart: Date): Activity[] => {
    const createActivity = (dayOffset: number, startHour: number, startMinute: number, durationMinutes: number, project: { id: number; name: string; color: string; }, description: string, type: ActivityType = 'WORK'): Activity => {
        const startTime = new Date(weekStart);
        startTime.setDate(startTime.getDate() + dayOffset);
        startTime.setHours(startHour, startMinute, 0, 0);
        const endTime = new Date(startTime.getTime() + durationMinutes * 60 * 1000);
        return { id: Math.random(), type, startTime, endTime, project, description };
    };

    const projects = {
        aura: { id: 1, name: 'Plateforme Aura', color: '#3b82f6' }, // blue
        nexus: { id: 2, name: 'App Nexus', color: '#ec4899' },     // pink
        office: { id: 3, name: 'Interne', color: '#f97316' },     // orange
        break: { id: 4, name: 'Pause', color: '#64748b' } // slate
    };

    return [
        // Lundi
        createActivity(0, 9, 0, 180, projects.office, "Formation entreprise"),
        createActivity(0, 12, 0, 60, projects.break, "Pause déjeuner", 'BREAK'),
        createActivity(0, 13, 0, 240, projects.nexus, "Développement UI/UX"),

        // Mardi
        createActivity(1, 9, 30, 90, projects.aura, "Réunion de planification"),
        createActivity(1, 11, 0, 60, projects.break, "Pause déjeuner", 'BREAK'),
        createActivity(1, 12, 0, 180, projects.nexus, "Intégration API"),
        createActivity(1, 15, 0, 120, projects.office, "Gestion des e-mails"),

        // Mercredi
        createActivity(2, 9, 0, 240, projects.aura, "Correction de bugs critiques"),
        createActivity(2, 13, 0, 180, projects.nexus, "Session de feedback utilisateur"),
    ];
};

// Interface pour les activités une fois traitées pour l'affichage
interface ProcessedActivity extends Activity {
    top: number;      // Position en % depuis le haut
    height: number;   // Hauteur en %
    left: number;     // Position en % depuis la gauche (pour les chevauchements)
    width: number;    // Largeur en % (pour les chevauchements)
}

// Hook simple pour la détection de la taille de l'écran
const useMediaQuery = (query: string) => {
    const [matches, setMatches] = useState(false);
    useEffect(() => {
        const media = window.matchMedia(query);
        if (media.matches !== matches) setMatches(media.matches);
        const listener = () => setMatches(media.matches);
        window.addEventListener("resize", listener);
        return () => window.removeEventListener("resize", listener);
    }, [matches, query]);
    return matches;
};


//================================================================================
// 2. SOUS-COMPOSANTS DU CALENDRIER
//================================================================================

// Axe des heures sur la gauche
const TimeAxis = React.memo(({ startHour, endHour }: { startHour: number; endHour: number }) => {
    const hours = Array.from({ length: endHour - startHour + 1 }, (_, i) => i + startHour);
    return (
        <div className="relative col-start-1 text-right pr-2">
            {hours.map(hour => (
                <div key={hour} className="h-24 -mt-2.5">
                    <span className="text-xs text-muted-foreground">{format(new Date(0, 0, 0, hour), 'ha')}</span>
                </div>
            ))}
        </div>
    );
});

// Indicateur de l'heure actuelle
const LiveTimeIndicator = ({ startHour, endHour }: { startHour: number; endHour: number }) => {
    const [top, setTop] = useState(0);

    useEffect(() => {
        const updatePosition = () => {
            const now = new Date();
            const startOfDay = new Date();
            startOfDay.setHours(startHour, 0, 0, 0);
            const totalMinutesInView = (endHour - startHour) * 60;
            const minutesFromStart = (now.getTime() - startOfDay.getTime()) / 60000;
            setTop((minutesFromStart / totalMinutesInView) * 100);
        };
        updatePosition();
        const interval = setInterval(updatePosition, 60000); // Met à jour chaque minute
        return () => clearInterval(interval);
    }, [startHour, endHour]);

    if (top < 0 || top > 100) return null;

    return (
        <div className="absolute left-10 right-0 z-20" style={{ top: `${top}%` }}>
            <div className="relative h-px bg-red-500">
                <div className="absolute -left-1 -top-1 w-2 h-2 rounded-full bg-red-500" />
            </div>
        </div>
    );
};

// Bloc représentant une activité
const ActivityBlock = ({ activity }: { activity: ProcessedActivity }) => (
    <Popover>
        <PopoverTrigger asChild>
            <motion.div
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="absolute z-10 p-2 rounded-md overflow-hidden cursor-pointer"
                style={{
                    top: `${activity.top}%`,
                    height: `${activity.height}%`,
                    left: `${activity.left}%`,
                    width: `${activity.width}%`,
                    backgroundColor: `${activity.project.color}20`, // 20 pour la transparence
                    borderLeft: `3px solid ${activity.project.color}`
                }}
            >
                <p className="font-semibold text-xs leading-tight" style={{ color: activity.project.color }}>{activity.description}</p>
                <p className="text-xs text-muted-foreground">{activity.project.name}</p>
            </motion.div>
        </PopoverTrigger>
        <PopoverContent className="w-64">
            <h4 className="font-semibold">{activity.description}</h4>
            <p className="text-sm text-muted-foreground" style={{ color: activity.project.color }}>
                <Briefcase className="inline-block mr-2 h-4 w-4" />{activity.project.name}
            </p>
            <Separator className="my-2" />
            <p className="text-sm">
                <Clock className="inline-block mr-2 h-4 w-4 text-muted-foreground" />
                {format(activity.startTime, 'p', { locale: fr })} - {format(activity.endTime, 'p', { locale: fr })}
                <span className="text-muted-foreground ml-2">({format(activity.endTime.getTime() - activity.startTime.getTime() - 3600000, 'H:mm')})</span>
            </p>
        </PopoverContent>
    </Popover>
);


//================================================================================
// 3. COMPOSANT PRINCIPAL : Le Calendrier
//================================================================================

const WeeklyTimeSheetCalendar = () => {
    // --- ÉTATS ---
    const [currentDate, setCurrentDate] = useState(new Date());
    const [activities, setActivities] = useState<Activity[]>([]);

    // Gère la vue responsive
    const isMobile = useMediaQuery("(max-width: 768px)");
    const [selectedMobileDay, setSelectedMobileDay] = useState(startOfDay(new Date()));

    // --- LOGIQUE DES DATES ---
    const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
    const daysInWeek = eachDayOfInterval({ start: weekStart, end: addDays(weekStart, 6) });
    const visibleDays = isMobile ? [selectedMobileDay] : daysInWeek;

    // --- LOGIQUE DE TRAITEMENT DES DONNÉES ---
    useEffect(() => {
        // Simule un fetch API à chaque changement de semaine
        const data = generateRealisticActivities(weekStart);
        setActivities(data);
    }, [weekStart]);

    const processedActivitiesByDay = useMemo(() => {
        const grouped = new Map<string, ProcessedActivity[]>();

        visibleDays.forEach(day => {
            const dayKey = format(day, 'yyyy-MM-dd');
            const dayActivities = activities
                .filter(act => isSameDay(act.startTime, day))
                .sort((a, b) => a.startTime.getTime() - b.startTime.getTime());

            // Algorithme de gestion des chevauchements (simplifié)
            const processed: ProcessedActivity[] = [];
            dayActivities.forEach((activity, index) => {
                const startOfDay = new Date(day);
                startOfDay.setHours(8, 0, 0, 0); // La vue commence à 8h
                const totalMinutesInView = (20 - 8) * 60;

                const minutesFromStart = (activity.startTime.getTime() - startOfDay.getTime()) / 60000;
                const durationMinutes = (activity.endTime.getTime() - activity.startTime.getTime()) / 60000;

                processed.push({
                    ...activity,
                    top: (minutesFromStart / totalMinutesInView) * 100,
                    height: (durationMinutes / totalMinutesInView) * 100,
                    left: 0, // Simplifié, pas de gestion d'overlap pour cette démo
                    width: 100,
                });
            });
            grouped.set(dayKey, processed);
        });
        return grouped;
    }, [activities, visibleDays]);

    const changeWeek = (direction: 'next' | 'prev') => {
        setCurrentDate(current => addDays(current, direction === 'next' ? 7 : -7));
    };

    return (
        <Card className="w-full shadow-lg">
            <CardContent className="p-4">
                {/* --- HEADER DE NAVIGATION --- */}
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold">{format(weekStart, 'MMMM yyyy', { locale: fr })}</h2>
                    <div className="flex gap-2">
                        <Button variant="outline" size="icon" onClick={() => changeWeek('prev')}><ChevronLeft className="h-4 w-4" /></Button>
                        <Button variant="outline" onClick={() => setCurrentDate(new Date())}>Aujourd'hui</Button>
                        <Button variant="outline" size="icon" onClick={() => changeWeek('next')}><ChevronRight className="h-4 w-4" /></Button>
                    </div>
                </div>

                {isMobile && (
                    <ToggleGroup type="single" value={format(selectedMobileDay, 'yyyy-MM-dd')} onValueChange={(val) => val && setSelectedMobileDay(new Date(val))} className="grid grid-cols-4 sm:grid-cols-7 gap-2 mb-4">
                        {daysInWeek.map(day => {
                            const dayKey = format(day, 'yyyy-MM-dd');
                            return <ToggleGroupItem key={dayKey} value={dayKey} variant="outline" className="flex flex-col h-14">{format(day, 'E', { locale: fr })}<span className="font-bold">{format(day, 'd')}</span></ToggleGroupItem>
                        })}
                    </ToggleGroup>
                )}

                {/* --- GRILLE PRINCIPALE DU CALENDRIER --- */}
                <div className={`grid ${isMobile ? 'grid-cols-[auto_1fr]' : 'grid-cols-[auto_repeat(7,_1fr)]'} border-t border-l border-border`}>
                    {/* Headers des jours */}
                    <div className="col-start-1"></div> {/* Espace vide au-dessus de l'axe du temps */}
                    {visibleDays.map(day => (
                        <div key={day.toISOString()} className={`p-2 border-r text-center ${isSameDay(day, new Date()) ? 'bg-blue-50 dark:bg-blue-900/50' : ''}`}>
                            <p className="text-xs text-muted-foreground">{format(day, 'E', { locale: fr })}</p>
                            <p className="font-bold text-lg">{format(day, 'd')}</p>
                        </div>
                    ))}

                    {/* Contenu de la grille */}
                    <TimeAxis startHour={8} endHour={20} />
                    {visibleDays.map(day => {
                        const dayKey = format(day, 'yyyy-MM-dd');
                        const activitiesForDay = processedActivitiesByDay.get(dayKey) || [];
                        return (
                            <div key={dayKey} className="relative border-r col-span-1 min-h-[72rem]">
                                {Array.from({ length: 12 }).map((_, i) => <div key={i} className="h-24 border-b"></div>)}
                                <AnimatePresence>
                                    {activitiesForDay.map(act => <ActivityBlock key={act.id} activity={act} />)}
                                </AnimatePresence>
                            </div>
                        );
                    })}
                    <LiveTimeIndicator startHour={8} endHour={20} />
                </div>

            </CardContent>
        </Card>
    );
};

export default WeeklyTimeSheetCalendar;