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
    useEffect(() => {
        if (empId) {
            const loadTodayPointages = async () => {
                const today = new Date();
                const todayString = formatLocalDate(today);
                const pointageData = await getPointages('jour', todayString);

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

                    if (pointageData.heuresTravaillees) {
                        const durationMatch = pointageData.heuresTravaillees.match(/PT(\d+(?:\.\d+)?)S/);
                        if (durationMatch) {
                            const seconds = parseFloat(durationMatch[1]);
                            setTotalWorkedToday(seconds);
                        }
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
                const monday = new Date(today.setDate(today.getDate() - today.getDay() + 1));
                const mondayStr = formatLocalDate(monday);

                const weekPointages = await getPointages('semaine', mondayStr);

                if (weekPointages && Array.isArray(weekPointages)) {
                    let totalSeconds = 0;
                    let arrivals: string[] = [];

                    weekPointages.forEach((pointage: any) => {
                        if (pointage.heuresTravaillees) {
                            const durationMatch = pointage.heuresTravaillees.match(/PT(\d+(?:\.\d+)?)S/);
                            if (durationMatch) {
                                totalSeconds += parseFloat(durationMatch[1]);
                            }
                        }

                        if (pointage.heureEntree) {
                            arrivals.push(pointage.heureEntree);
                        }
                    });

                    const totalHours = Math.round((totalSeconds / 3600) * 10) / 10;

                    let averageArrival = '--:--';
                    if (arrivals.length > 0) {
                        const totalMinutes = arrivals.reduce((sum, time) => {
                            const [hours, minutes] = time.split(':').map(Number);
                            return sum + (hours * 60 + minutes);
                        }, 0);
                        const avgMinutes = Math.round(totalMinutes / arrivals.length);
                        const avgHours = Math.floor(avgMinutes / 60);
                        const avgMins = avgMinutes % 60;
                        averageArrival = `${avgHours.toString().padStart(2, '0')}:${avgMins.toString().padStart(2, '0')}`;
                    }

                    setWeekStats({
                        totalHours,
                        averageArrival,
                        overtimeHours: Math.max(0, totalHours - 40),
                        absences: Math.max(0, 5 - weekPointages.length),
                        lateArrivals: arrivals.filter(time => time > '09:00:00').length
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
