import { useState, useEffect, useCallback } from 'react';

interface LocationData {
    latitude: number | null;
    longitude: number | null;
    address: string;
}

interface Message {
    type: 'success' | 'error' | 'info' | '';
    text: string;
}

interface TimeEntry {
    id: number;
    type: 'checkin' | 'checkout' | 'break_start' | 'break_end';
    time: string;
    location: string;
    status: 'success' | 'error' | 'info';
}

interface WeekStats {
    totalHours: number;
    averageArrival: string;
    overtimeHours: number;
    absences: number;
    lateArrivals: number;
}

interface WeekRow {
    day: Date;
    arrivee: string; // HH:mm or '—'
    sortie: string; // HH:mm or '—'
    effective: number; // minutes
    pauses: number; // minutes
    retard: string; // e.g. '15m' or '—'
}

interface CurrentSession {
    duration: number;
    breakDuration: number;
}

interface PointageRequest {
    typePointage: 'ENTREE' | 'SORTIE' | 'PAUSE' | 'FIN_PAUSE';
    empId: number;
    timestamp: string;
}

export const useTimeTracking = () => {
    // États principaux
    const [currentTime, setCurrentTime] = useState<Date>(new Date());
    const [isWorking, setIsWorking] = useState<boolean>(false);
    const [startTime, setStartTime] = useState<number | null>(null);
    const [totalWorkedToday, setTotalWorkedToday] = useState<number>(0);
    const [breakTime, setBreakTime] = useState<number>(0);
    const [isOnBreak, setIsOnBreak] = useState<boolean>(false);
    const [breakStartTime, setBreakStartTime] = useState<number | null>(null);
    const [location, setLocation] = useState<LocationData>({
        latitude: null,
        longitude: null,
        address: 'Localisation en cours...'
    });
    const [message, setMessage] = useState<Message>({ type: '', text: '' });
    const [loading, setLoading] = useState<boolean>(false);
    const [todayEntries, setTodayEntries] = useState<TimeEntry[]>([]);
    const [weekStats, setWeekStats] = useState<WeekStats>({
        totalHours: 0,
        averageArrival: '--:--',
        overtimeHours: 0,
        absences: 0,
        lateArrivals: 0
    });
    const [weekRows, setWeekRows] = useState<WeekRow[]>([]);
    const [currentSession, setCurrentSession] = useState<CurrentSession>({
        duration: 0,
        breakDuration: 0
    });

    // Token et employeeId
    const [token] = useState<string>(() => {
        const storedToken = localStorage.getItem('token');
        return storedToken ? storedToken : '';
    });

    const userData = localStorage.getItem('userData');
    const empId = userData ? JSON.parse(userData).id : null;

    // Fonctions utilitaires
    const formatLocalDate = useCallback((date: Date): string => {
        return date.getFullYear() + '-' +
            String(date.getMonth() + 1).padStart(2, '0') + '-' +
            String(date.getDate()).padStart(2, '0');
    }, []);

    const formatTime = useCallback((seconds: number): string => {
        const hours: number = Math.floor(seconds / 3600);
        const minutes: number = Math.floor((seconds % 3600) / 60);
        const secs: number = seconds % 60;
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }, []);

    const formatTimeShort = useCallback((seconds: number): string => {
        const hours: number = Math.floor(seconds / 3600);
        const minutes: number = Math.floor((seconds % 3600) / 60);
        return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
    }, []);

    const getCurrentTimeString = useCallback((): string => {
        return currentTime.toLocaleTimeString('fr-FR', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    }, [currentTime]);

    // API Functions
    const createPointage = async (typePointage: 'ENTREE' | 'SORTIE' | 'PAUSE' | 'FIN_PAUSE'): Promise<boolean> => {
        try {
            const pointageRequest: PointageRequest = {
                typePointage,
                empId,
                timestamp: new Date().toISOString()
            };

            setLoading(true);
            const response = await fetch('http://localhost:8080/api/pointages/create', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(pointageRequest)
            });

            if (!response.ok) {
                if (response.status === 401) {
                    throw new Error('Non autorisé. Veuillez vous reconnecter.');
                }
                throw new Error(`Erreur ${response.status}: ${response.statusText}`);
            }

            return true;
        } catch (error: unknown) {
            console.error('Erreur API:', error);
            const errorMessage: string = error instanceof Error ? error.message : 'Erreur lors de la requête API';
            setMessage({ type: 'error', text: errorMessage });
            return false;
        } finally {
            setLoading(false);
        }
    };

    const getPointages = async (periode: 'jour' | 'semaine', date: string): Promise<any> => {
        try {
            setLoading(true);
            const response = await fetch(`http://localhost:8080/api/pointages/get/${empId}/${periode}?date=${date}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                if (response.status === 401) {
                    throw new Error('Non autorisé. Veuillez vous reconnecter.');
                }
                throw new Error(`Erreur ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            console.log('Pointages récupérés:', data);
            return data;
        } catch (error: unknown) {
            console.error('Erreur API:', error);
            const errorMessage: string = error instanceof Error ? error.message : 'Erreur lors de la récupération des pointages';
            setMessage({ type: 'error', text: errorMessage });
            return null;
        } finally {
            setLoading(false);
        }
    };

    // Actions de pointage
    const handleCheckIn = async (): Promise<void> => {
        const result = await createPointage('ENTREE');
        if (result) {
            setIsWorking(true);
            setStartTime(Date.now());
            setMessage({ type: 'success', text: 'Arrivée enregistrée avec succès!' });

            const newEntry: TimeEntry = {
                id: Date.now(),
                type: 'checkin',
                time: getCurrentTimeString(),
                location: location.address,
                status: 'success'
            };
            setTodayEntries(prev => [...prev, newEntry]);
        }
    };

    const handleCheckOut = async (): Promise<void> => {
        const result = await createPointage('SORTIE');
        if (result) {
            setIsWorking(false);
            setIsOnBreak(false);
            setTotalWorkedToday(prev => prev + currentSession.duration);
            setStartTime(null);
            setBreakStartTime(null);
            setMessage({ type: 'success', text: 'Sortie enregistrée avec succès!' });

            const newEntry: TimeEntry = {
                id: Date.now(),
                type: 'checkout',
                time: getCurrentTimeString(),
                location: location.address,
                status: 'success'
            };
            setTodayEntries(prev => [...prev, newEntry]);
        }
    };

    const handleBreakStart = async (): Promise<void> => {
        const result = await createPointage('PAUSE');
        if (result) {
            setIsOnBreak(true);
            setBreakStartTime(Date.now());
            setMessage({ type: 'info', text: 'Pause commencée' });

            const newEntry: TimeEntry = {
                id: Date.now(),
                type: 'break_start',
                time: getCurrentTimeString(),
                location: location.address,
                status: 'info'
            };
            setTodayEntries(prev => [...prev, newEntry]);
        }
    };

    const handleBreakEnd = async (): Promise<void> => {
        const result = await createPointage('FIN_PAUSE');
        if (result) {
            setIsOnBreak(false);
            setBreakTime(prev => prev + currentSession.breakDuration);
            setBreakStartTime(null);
            setMessage({ type: 'info', text: 'Pause terminée' });

            const newEntry: TimeEntry = {
                id: Date.now(),
                type: 'break_end',
                time: getCurrentTimeString(),
                location: location.address,
                status: 'info'
            };
            setTodayEntries(prev => [...prev, newEntry]);
        }
    };

    // Effects
    useEffect(() => {
        const timer: NodeJS.Timeout = setInterval(() => {
            setCurrentTime(new Date());

            if (isWorking && startTime) {
                const workDuration: number = Math.floor((Date.now() - startTime) / 1000);
                setCurrentSession(prev => ({ ...prev, duration: workDuration }));
            }

            if (isOnBreak && breakStartTime) {
                const breakDuration: number = Math.floor((Date.now() - breakStartTime) / 1000);
                setCurrentSession(prev => ({ ...prev, breakDuration: breakDuration }));
            }
        }, 1000);

        return () => clearInterval(timer);
    }, [isWorking, startTime, isOnBreak, breakStartTime]);

    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position: GeolocationPosition) => {
                    setLocation({
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                        address: `Position: ${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)}`
                    });
                },
                (error: GeolocationPositionError) => {
                    console.error('Erreur géolocalisation:', error);
                    setLocation({
                        latitude: null,
                        longitude: null,
                        address: 'Localisation non disponible'
                    });
                }
            );
        }
    }, []);

    // Effet pour charger les pointages dès que empId est disponible
    const [todayPointage, setTodayPointage] = useState<any>(null);
    useEffect(() => {
        if (empId) {
            const loadTodayPointages = async () => {
                const today = new Date();
                const todayString = formatLocalDate(today);
                const pointageData = await getPointages('jour', todayString);
                setTodayPointage(pointageData);

                if (pointageData) {
                    const entries: TimeEntry[] = [];
                    const currentLocation = location.address || 'Localisation en cours...';

                    if (pointageData.heureEntree) {
                        entries.push({
                            id: pointageData.id * 10 + 1,
                            type: 'checkin',
                            time: pointageData.heureEntree.substring(0, 5),
                            location: currentLocation,
                            status: 'success'
                        });
                    }

                    if (pointageData.pauseDebutee) {
                        entries.push({
                            id: pointageData.id * 10 + 2,
                            type: 'break_start',
                            time: pointageData.pauseDebutee.substring(0, 5),
                            location: currentLocation,
                            status: 'info'
                        });
                    }

                    if (pointageData.pauseTerminee) {
                        entries.push({
                            id: pointageData.id * 10 + 3,
                            type: 'break_end',
                            time: pointageData.pauseTerminee.substring(0, 5),
                            location: currentLocation,
                            status: 'info'
                        });
                    }

                    if (pointageData.heureSortie) {
                        entries.push({
                            id: pointageData.id * 10 + 4,
                            type: 'checkout',
                            time: pointageData.heureSortie.substring(0, 5),
                            location: currentLocation,
                            status: 'success'
                        });
                    }

                    setTodayEntries(entries);

                    // Calcul du temps de pause (en secondes)
                    let pauseSeconds = 0;
                    if (pointageData.pauseDebutee && pointageData.pauseTerminee) {
                        const [h1, m1, s1] = pointageData.pauseDebutee.split(':').map(Number);
                        const [h2, m2, s2] = pointageData.pauseTerminee.split(':').map(Number);
                        const t1 = h1 * 3600 + m1 * 60 + (s1 || 0);
                        const t2 = h2 * 3600 + m2 * 60 + (s2 || 0);
                        pauseSeconds = t2 - t1 > 0 ? t2 - t1 : 0;
                        setBreakTime(pauseSeconds);
                    } else {
                        setBreakTime(0);
                    }

                    // Calcul du temps total travaillé (en secondes)
                    let totalSeconds = 0;
                    if (pointageData.heureEntree && pointageData.heureSortie) {
                        const [h1, m1, s1] = pointageData.heureEntree.split(':').map(Number);
                        const [h2, m2, s2] = pointageData.heureSortie.split(':').map(Number);
                        const t1 = h1 * 3600 + m1 * 60 + (s1 || 0);
                        const t2 = h2 * 3600 + m2 * 60 + (s2 || 0);
                        totalSeconds = t2 - t1 > 0 ? t2 - t1 : 0;
                        setTotalWorkedToday(totalSeconds);
                    } else if (pointageData.heuresTravaillees) {
                        // Extraction plus robuste du format ISO 8601 duration
                        const match = pointageData.heuresTravaillees.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
                        if (match) {
                            const hours = parseInt(match[1] || '0', 10);
                            const minutes = parseInt(match[2] || '0', 10);
                            const seconds = parseInt(match[3] || '0', 10);
                            setTotalWorkedToday(hours * 3600 + minutes * 60 + seconds);
                        }
                    } else {
                        setTotalWorkedToday(0);
                    }

                    const hasEntree = pointageData.heureEntree;
                    const hasSortie = pointageData.heureSortie;
                    const hasPauseDebutee = pointageData.pauseDebutee;
                    const hasPauseTerminee = pointageData.pauseTerminee;

                    // Déterminer le statut actuel
                    if (hasEntree && !hasSortie) {
                        setIsWorking(true);

                        // Calculer le temps de début de travail
                        const entreeTime = new Date();
                        const [hours, minutes, seconds] = pointageData.heureEntree.split(':').map(Number);
                        entreeTime.setHours(hours, minutes, seconds || 0, 0);
                        setStartTime(entreeTime.getTime());

                        if (hasPauseDebutee && !hasPauseTerminee) {
                            setIsOnBreak(true);

                            // Calculer le temps de début de pause
                            const pauseTime = new Date();
                            const [pauseHours, pauseMinutes, pauseSeconds] = pointageData.pauseDebutee.split(':').map(Number);
                            pauseTime.setHours(pauseHours, pauseMinutes, pauseSeconds || 0, 0);
                            setBreakStartTime(pauseTime.getTime());
                        } else {
                            setIsOnBreak(false);
                            setBreakStartTime(null);
                        }
                    } else {
                        setIsWorking(false);
                        setIsOnBreak(false);
                        setStartTime(null);
                        setBreakStartTime(null);
                    }
                }
            };

            loadTodayPointages();
        }
    }, [empId, formatLocalDate]);

    useEffect(() => {
        const loadWeekStats = async () => {
            if (empId) {
                const today = new Date();
                // Trouver le lundi de la semaine courante
                const dayOfWeek = today.getDay() === 0 ? 7 : today.getDay(); // 1=lundi, 7=dimanche
                const monday = new Date(today);
                monday.setDate(today.getDate() - dayOfWeek + 1);
                const mondayStr = formatLocalDate(monday);

                const weekPointages = await getPointages('semaine', mondayStr);

                if (weekPointages && Array.isArray(weekPointages)) {
                    let totalSeconds = 0;
                    let arrivals: string[] = [];
                    let lateArrivals = 0;
                    let absences = 0;

                    // Calculer le nombre de jours écoulés dans la semaine (lundi = 1)
                    const todayDayOfWeek = today.getDay() === 0 ? 7 : today.getDay();
                    const daysElapsed = todayDayOfWeek; // ex: lundi=1, mardi=2...

                    // Pour chaque jour écoulé, construire une ligne réutilisable par le composant WeekStatsCard
                    // weekPointages doit contenir les jours pointés, mais il peut manquer des jours (absences)
                    // On suppose que chaque pointage a une propriété 'date' au format YYYY-MM-DD
                    const pointagesByDate = new Map<string, any>();
                    weekPointages.forEach((p: any) => {
                        if (p.date) pointagesByDate.set(p.date, p);
                    });

                    const rows: WeekRow[] = [];
                    for (let i = 0; i < daysElapsed; i++) {
                        const d = new Date(monday);
                        d.setDate(monday.getDate() + i);
                        const dateStr = formatLocalDate(d);
                        const pointage = pointagesByDate.get(dateStr);

                        let arrivee = '—';
                        let sortie = '—';
                        let effectiveMinutes = 0;
                        let pausesMinutes = 0;
                        let retard = '—';

                        if (pointage) {
                            if (pointage.heureEntree) arrivee = pointage.heureEntree.substring(0, 5);
                            if (pointage.heureSortie) sortie = pointage.heureSortie.substring(0, 5);

                            // calcul pauses (en minutes)
                            if (pointage.pauseDebutee && pointage.pauseTerminee) {
                                const [ph1, pm1, ps1] = pointage.pauseDebutee.split(':').map(Number);
                                const [ph2, pm2, ps2] = pointage.pauseTerminee.split(':').map(Number);
                                const pt1 = ph1 * 3600 + pm1 * 60 + (ps1 || 0);
                                const pt2 = ph2 * 3600 + pm2 * 60 + (ps2 || 0);
                                const pauseSec = pt2 - pt1 > 0 ? pt2 - pt1 : 0;
                                pausesMinutes = Math.round(pauseSec / 60);
                            }

                            // calcul temps travaillé (en minutes)
                            if (pointage.heureEntree && pointage.heureSortie) {
                                const [h1, m1, s1] = pointage.heureEntree.split(':').map(Number);
                                const [h2, m2, s2] = pointage.heureSortie.split(':').map(Number);
                                const t1 = h1 * 3600 + m1 * 60 + (s1 || 0);
                                const t2 = h2 * 3600 + m2 * 60 + (s2 || 0);
                                const workedSec = t2 - t1 > 0 ? t2 - t1 : 0;
                                effectiveMinutes = Math.round(workedSec / 60) - pausesMinutes;
                                if (effectiveMinutes < 0) effectiveMinutes = 0;
                            } else if (pointage.heuresTravaillees) {
                                const match = pointage.heuresTravaillees.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
                                if (match) {
                                    const hours = parseInt(match[1] || '0', 10);
                                    const minutes = parseInt(match[2] || '0', 10);
                                    const seconds = parseInt(match[3] || '0', 10);
                                    effectiveMinutes = hours * 60 + minutes + Math.round(seconds / 60);
                                }
                            }

                            // retard en minutes (comparé à 09:00)
                            if (pointage.heureEntree && pointage.heureEntree > '09:00:00') {
                                const [ah, am] = pointage.heureEntree.split(':').map(Number);
                                const late = ah * 60 + am - 9 * 60;
                                if (late > 0) retard = `${late}m`;
                            }
                        } else {
                            absences++;
                        }

                        rows.push({
                            day: d,
                            arrivee,
                            sortie,
                            effective: effectiveMinutes,
                            pauses: pausesMinutes,
                            retard
                        });
                    }

                    // calculer les agrégats semaine à partir des lignes construites
                    const totalMinutes = rows.reduce((sum, r) => sum + (r.effective || 0), 0);
                    const totalHours = Math.round((totalMinutes / 60) * 10) / 10;

                    const arrivalTimes = rows.filter(r => r.arrivee && r.arrivee !== '—').map(r => r.arrivee);
                    let averageArrival = '--:--';
                    if (arrivalTimes.length > 0) {
                        const totalArrivalMinutes = arrivalTimes.reduce((sum, t) => {
                            const [h, m] = t.split(':').map(Number);
                            return sum + (h * 60 + m);
                        }, 0);
                        const avg = Math.round(totalArrivalMinutes / arrivalTimes.length);
                        const ah = Math.floor(avg / 60);
                        const am = avg % 60;
                        averageArrival = `${ah.toString().padStart(2, '0')}:${am.toString().padStart(2, '0')}`;
                    }

                    const lateArrivalsCount = rows.reduce((c, r) => c + (r.retard && r.retard !== '—' ? 1 : 0), 0);

                    setWeekRows(rows);
                    setWeekStats({
                        totalHours,
                        averageArrival,
                        overtimeHours: Math.max(0, totalHours - 40),
                        absences,
                        lateArrivals: lateArrivalsCount
                    });
                }
            }
        };

        loadWeekStats();
    }, [empId]);

    useEffect(() => {
        if (message.text) {
            const timer: NodeJS.Timeout = setTimeout(() => {
                setMessage({ type: '', text: '' });
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [message]);

    // Calculs pour l'affichage
    const totalWorkedTime: number = totalWorkedToday + (isWorking ? currentSession.duration : 0);
    const totalBreakTime: number = breakTime + (isOnBreak ? currentSession.breakDuration : 0);
    const effectiveWorkTime: number = totalWorkedTime - totalBreakTime;

    return {
        // États
        currentTime,
        isWorking,
        isOnBreak,
        loading,
        message,
        location,
        todayEntries,
        weekStats,
        weekRows, // <-- expose les lignes de la semaine pour le composant WeekStatsCard
        currentSession,
        totalWorkedTime,
        totalBreakTime,
        effectiveWorkTime,

        // Fonctions
        formatTime,
        formatTimeShort,
        getCurrentTimeString,
        handleCheckIn,
        handleCheckOut,
        handleBreakStart,
        handleBreakEnd
    };
};
