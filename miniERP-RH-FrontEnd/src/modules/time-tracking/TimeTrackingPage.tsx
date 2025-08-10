import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useState, useEffect, useCallback } from "react";
import { Clock, Play, Pause, Square, Calendar, MapPin, Users, TrendingUp, CheckCircle2, AlertCircle, Timer, Activity } from "lucide-react";

// Types et interfaces
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

export const TimeTrackingPage: React.FC = () => {
    // États principaux - typés
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
    const [token] = useState<string>(() => {
        const storedToken = localStorage.getItem('token');
        return storedToken ? storedToken : '';
    }); // Token d'authentification récupéré depuis localStorage
    const userData = localStorage.getItem('userData');
    const empId = userData ? JSON.parse(userData).id : null; // ou depuis le contexte utilisateur/localStorage
    // Historique et statistiques - typés
    const [todayEntries, setTodayEntries] = useState<TimeEntry[]>([]);

    const [weekStats, setWeekStats] = useState<WeekStats>({
        totalHours: 0,
        averageArrival: '--:--',
        overtimeHours: 0,
        absences: 0,
        lateArrivals: 0
    });

    // Timer actuel - typé
    const [currentSession, setCurrentSession] = useState<CurrentSession>({
        duration: 0,
        breakDuration: 0
    });

    // Mise à jour de l'heure - avec types
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

    // Géolocalisation - avec types
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

    // Charger les pointages du jour au démarrage
    useEffect(() => {
        const loadTodayPointages = async () => {
            if (empId) {
                const today = new Date().toISOString().split('T')[0]; // Format YYYY-MM-DD
                const pointageData = await getPointages('jour', today);

                if (pointageData) {
                    // La réponse contient un objet pointage avec toutes les heures
                    const entries: TimeEntry[] = [];

                    // Ajouter l'entrée
                    if (pointageData.heureEntree) {
                        entries.push({
                            id: pointageData.id * 10 + 1,
                            type: 'checkin',
                            time: pointageData.heureEntree.substring(0, 5), // Format HH:MM
                            location: location.address,
                            status: 'success'
                        });
                    }

                    // Ajouter le début de pause
                    if (pointageData.pauseDebutee) {
                        entries.push({
                            id: pointageData.id * 10 + 2,
                            type: 'break_start',
                            time: pointageData.pauseDebutee.substring(0, 5), // Format HH:MM
                            location: location.address,
                            status: 'info'
                        });
                    }

                    // Ajouter la fin de pause
                    if (pointageData.pauseTerminee) {
                        entries.push({
                            id: pointageData.id * 10 + 3,
                            type: 'break_end',
                            time: pointageData.pauseTerminee.substring(0, 5), // Format HH:MM
                            location: location.address,
                            status: 'info'
                        });
                    }

                    // Ajouter la sortie
                    if (pointageData.heureSortie) {
                        entries.push({
                            id: pointageData.id * 10 + 4,
                            type: 'checkout',
                            time: pointageData.heureSortie.substring(0, 5), // Format HH:MM
                            location: location.address,
                            status: 'success'
                        });
                    }

                    setTodayEntries(entries);

                    // Calculer le temps travaillé aujourd'hui depuis les données API
                    if (pointageData.heuresTravaillees) {
                        // Convertir PT10.6025869S en secondes
                        const durationMatch = pointageData.heuresTravaillees.match(/PT(\d+(?:\.\d+)?)S/);
                        if (durationMatch) {
                            const seconds = parseFloat(durationMatch[1]);
                            setTotalWorkedToday(seconds);
                        }
                    }

                    // Déterminer l'état actuel de travail
                    const hasEntree = pointageData.heureEntree;
                    const hasSortie = pointageData.heureSortie;
                    const hasPauseDebutee = pointageData.pauseDebutee;
                    const hasPauseTerminee = pointageData.pauseTerminee;

                    // L'employé est au travail s'il a pointé l'entrée mais pas encore la sortie
                    if (hasEntree && !hasSortie) {
                        setIsWorking(true);
                        // L'employé est en pause s'il a commencé une pause mais ne l'a pas terminée
                        if (hasPauseDebutee && !hasPauseTerminee) {
                            setIsOnBreak(true);
                        } else {
                            setIsOnBreak(false);
                        }
                    } else {
                        setIsWorking(false);
                        setIsOnBreak(false);
                    }
                }
            }
        };

        loadTodayPointages();
    }, [empId, location.address]);

    // Charger les statistiques de la semaine
    useEffect(() => {
        const loadWeekStats = async () => {
            if (empId) {
                const today = new Date();
                const monday = new Date(today.setDate(today.getDate() - today.getDay() + 1));
                const mondayStr = monday.toISOString().split('T')[0]; // Format YYYY-MM-DD

                const weekPointages = await getPointages('semaine', mondayStr);

                if (weekPointages && Array.isArray(weekPointages)) {
                    // Calculer les statistiques de la semaine
                    let totalSeconds = 0;
                    let arrivals: string[] = [];

                    weekPointages.forEach((pointage: any) => {
                        // Calculer le temps total travaillé
                        if (pointage.heuresTravaillees) {
                            const durationMatch = pointage.heuresTravaillees.match(/PT(\d+(?:\.\d+)?)S/);
                            if (durationMatch) {
                                totalSeconds += parseFloat(durationMatch[1]);
                            }
                        }

                        // Collecter les heures d'arrivée pour calculer la moyenne
                        if (pointage.heureEntree) {
                            arrivals.push(pointage.heureEntree);
                        }
                    });

                    const totalHours = Math.round((totalSeconds / 3600) * 10) / 10;

                    // Calculer l'heure d'arrivée moyenne
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
                        overtimeHours: Math.max(0, totalHours - 40), // Assuming 40h work week
                        absences: Math.max(0, 5 - weekPointages.length), // 5 jours de travail par semaine
                        lateArrivals: arrivals.filter(time => time > '09:00:00').length // Retards après 9h
                    });
                }
            }
        };

        loadWeekStats();
    }, [empId]);

    // Fonctions utilitaires - typées
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

    // API Functions - nouvelle implémentation
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

    // Fonction pour récupérer les pointages (jour ou semaine)
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

    // Actions de pointage - typées
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

    // Masquer le message après 3 secondes - typé
    useEffect(() => {
        if (message.text) {
            const timer: NodeJS.Timeout = setTimeout(() => {
                setMessage({ type: '', text: '' });
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [message]);

    // Fonction pour les badges - typée
    const getStatusBadge = (type: TimeEntry['type']) => {
        switch (type) {
            case 'checkin':
                return <Badge className="bg-green-100 text-green-800">Arrivée</Badge>;
            case 'checkout':
                return <Badge className="bg-red-100 text-red-800">Sortie</Badge>;
            case 'break_start':
                return <Badge className="bg-orange-100 text-orange-800">Pause début</Badge>;
            case 'break_end':
                return <Badge className="bg-blue-100 text-blue-800">Pause fin</Badge>;
            default:
                return <Badge>Action</Badge>;
        }
    };

    // Calculs typés pour l'affichage
    const totalWorkedTime: number = totalWorkedToday + (isWorking ? currentSession.duration : 0);
    const totalBreakTime: number = breakTime + (isOnBreak ? currentSession.breakDuration : 0);
    const effectiveWorkTime: number = totalWorkedTime - totalBreakTime;

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4">
            <div className="max-w-6xl mx-auto space-y-6">

                {/* Header avec horloge */}
                <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                    <CardContent className="p-6">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                            <div>
                                <h1 className="text-3xl font-bold mb-2">Pointage</h1>
                                <div className="flex items-center gap-2 text-blue-100">
                                    <MapPin className="w-4 h-4" />
                                    <span className="text-sm">{location.address}</span>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-4xl font-mono font-bold">
                                    {getCurrentTimeString()}
                                </div>
                                <div className="text-blue-100">
                                    {currentTime.toLocaleDateString('fr-FR', {
                                        weekday: 'long',
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })}
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Messages */}
                {message.text && (
                    <Alert className={`${message.type === 'error' ? 'border-red-200 bg-red-50' :
                        message.type === 'info' ? 'border-blue-200 bg-blue-50' :
                            'border-green-200 bg-green-50'}`}>
                        <AlertDescription className={`${message.type === 'error' ? 'text-red-800' :
                            message.type === 'info' ? 'text-blue-800' :
                                'text-green-800'}`}>
                            {message.text}
                        </AlertDescription>
                    </Alert>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* Section principale - Actions de pointage */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* Status actuel */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Activity className="w-5 h-5" />
                                    Statut actuel
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="text-center p-4 bg-slate-50 rounded-lg">
                                        <div className="text-2xl font-bold text-slate-800">
                                            {isWorking ? 'En cours' : 'Hors service'}
                                        </div>
                                        <div className="text-sm text-slate-600 mt-1">
                                            {isWorking ? (isOnBreak ? 'En pause' : 'Au travail') : 'Non connecté'}
                                        </div>
                                    </div>
                                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                                        <div className="text-2xl font-bold text-blue-800">
                                            {isWorking ? formatTime(currentSession.duration) : '00:00:00'}
                                        </div>
                                        <div className="text-sm text-blue-600 mt-1">Session actuelle</div>
                                    </div>
                                    <div className="text-center p-4 bg-orange-50 rounded-lg">
                                        <div className="text-2xl font-bold text-orange-800">
                                            {formatTime(totalBreakTime)}
                                        </div>
                                        <div className="text-sm text-orange-600 mt-1">Temps de pause</div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Actions de pointage */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Actions</CardTitle>
                                <CardDescription>Enregistrer vos heures de travail</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <Button
                                        onClick={handleCheckIn}
                                        disabled={isWorking || loading}
                                        className="h-16 flex flex-col gap-1 bg-green-600 hover:bg-green-700"
                                    >
                                        <Play className="w-5 h-5" />
                                        <span className="text-sm">Arrivée</span>
                                    </Button>

                                    <Button
                                        onClick={handleCheckOut}
                                        disabled={!isWorking || loading}
                                        className="h-16 flex flex-col gap-1 bg-red-600 hover:bg-red-700"
                                    >
                                        <Square className="w-5 h-5" />
                                        <span className="text-sm">Sortie</span>
                                    </Button>

                                    <Button
                                        onClick={isOnBreak ? handleBreakEnd : handleBreakStart}
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

                        {/* Historique d'aujourd'hui */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Calendar className="w-5 h-5" />
                                    Historique d'aujourd'hui
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {todayEntries.length === 0 ? (
                                        <div className="text-center py-8 text-slate-500">
                                            Aucun pointage enregistré aujourd'hui
                                        </div>
                                    ) : (
                                        todayEntries.map((entry: TimeEntry) => (
                                            <div key={entry.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-2 h-2 rounded-full ${entry.status === 'success' ? 'bg-green-500' :
                                                        entry.status === 'info' ? 'bg-blue-500' : 'bg-red-500'
                                                        }`} />
                                                    <div>
                                                        <div className="font-medium">{entry.time}</div>
                                                        <div className="text-sm text-slate-600">{entry.location}</div>
                                                    </div>
                                                </div>
                                                {getStatusBadge(entry.type)}
                                            </div>
                                        ))
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar - Statistiques */}
                    <div className="space-y-6">

                        {/* Résumé du jour */}
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

                        {/* Statistiques de la semaine */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-lg">
                                    <TrendingUp className="w-5 h-5" />
                                    Cette semaine
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex justify-between">
                                    <span className="text-slate-600">Total heures</span>
                                    <span className="font-semibold">{weekStats.totalHours}h</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-600">Arrivée moyenne</span>
                                    <span className="font-semibold">{weekStats.averageArrival}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-600">Heures sup.</span>
                                    <span className="font-semibold text-orange-600">{weekStats.overtimeHours}h</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-600">Retards</span>
                                    <span className="font-semibold text-red-600">{weekStats.lateArrivals}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-600">Absences</span>
                                    <span className="font-semibold">{weekStats.absences}</span>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Actions rapides */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Actions rapides</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <Button variant="outline" className="w-full justify-start">
                                    <Calendar className="w-4 h-4 mr-2" />
                                    Voir historique complet
                                </Button>
                                <Button variant="outline" className="w-full justify-start">
                                    <Users className="w-4 h-4 mr-2" />
                                    Équipe en ligne
                                </Button>
                                <Button variant="outline" className="w-full justify-start">
                                    <TrendingUp className="w-4 h-4 mr-2" />
                                    Rapports détaillés
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
};