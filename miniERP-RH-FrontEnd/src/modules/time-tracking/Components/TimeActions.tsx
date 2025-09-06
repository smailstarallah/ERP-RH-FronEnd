import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
    Play, Pause, Power, Briefcase, Coffee, History, Loader2, AlertCircle, CheckCircle, MessageSquare,
    Inbox,
    ListTodo,
    PlusCircle,
    ListPlus,
    Users
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TooltipProvider } from "@/components/ui/tooltip";
import { CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Progress } from "@/components/ui/progress";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { useProjectApi } from '../hooks/useTimeTrackerApi';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

//================================================================================
// SECTION 1: TYPES ET CONFIGURATION
//================================================================================

// --- Types pour l'état interne de l'UI ---
type TrackerStatus = 'NOT_STARTED' | 'WORKING' | 'ON_BREAK';
type Priority = 'low' | 'medium' | 'high' | 'critical';
interface TaskUI { id: string; name: string; priority: Priority; }
interface ProjectUI { id: string; name: string; }
interface TimelineEntry {
    type: 'WORK' | 'BREAK' | 'MEETING';
    startTime: Date;
    endTime: Date | null;
    description: string;
    task?: TaskUI;
    projectName?: string;
}

// --- Types pour les données de l'API ---
interface ApiTask { id: number; nom: string; priority: string; }
interface ApiProject { id: number; nom: string; taches: ApiTask[]; }

// --- Types pour les messages de feedback ---
interface Message { type: 'success' | 'error' | 'info'; text: string; }

//================================================================================
// SECTION 2: COMPOSANT PRINCIPAL
//================================================================================

export const TimeActions = () => {
    // --- Configuration (devrait venir d'un contexte d'authentification) ---
    const empId = JSON.parse(localStorage.getItem('userData') || '{}').id;
    const token = localStorage.getItem('token') || '';
    const { projects, api } = useProjectApi();

    // Charger la timeline du jour au montage
    useEffect(() => {
        const fetchTimeline = async () => {
            try {
                if (!empId || !api.getTodayTimeline) return;
                const timeline = await api.getTodayTimeline(empId);

                interface ApiTimelineEntry {
                    type: 'TRAVAIL' | 'PAUSE' | 'REUNION' | 'WORK' | 'BREAK' | 'MEETING'; // Accept both backend and frontend values
                    startTime: string;
                    endTime: string | null;
                    description: string;
                    task?: TaskUI;
                    projectName?: string;
                }

                const mappedTimeline = (timeline as ApiTimelineEntry[]).map((entry: ApiTimelineEntry): TimelineEntry => {
                    let mappedType: 'WORK' | 'BREAK' | 'MEETING';
                    switch (entry.type) {
                        case 'TRAVAIL':
                        case 'WORK':
                            mappedType = 'WORK';
                            break;
                        case 'PAUSE':
                        case 'BREAK':
                            mappedType = 'BREAK';
                            break;
                        case 'REUNION':
                        case 'MEETING':
                            mappedType = 'MEETING';
                            break;
                        default:
                            mappedType = 'WORK';
                            console.warn('Unknown timeline entry type from API:', entry.type, entry);
                    }
                    return {
                        ...entry,
                        type: mappedType,
                        startTime: new Date(entry.startTime),
                        endTime: entry.endTime ? new Date(entry.endTime) : null
                    };
                });
                setDailyTimeline(mappedTimeline);
                // Fix: Set status according to the last timeline entry after reload
                if (mappedTimeline.length > 0) {
                    const last = mappedTimeline[mappedTimeline.length - 1];
                    if (!last.endTime) {
                        if (last.type === 'WORK') {
                            setStatus('WORKING');
                        } else if (last.type === 'BREAK') {
                            setStatus('ON_BREAK');
                        } else if (last.type === 'MEETING') {
                            setStatus('WORKING'); // Les réunions sont considérées comme du travail
                        }
                    } else {
                        setStatus('NOT_STARTED');
                    }
                } else {
                    setStatus('NOT_STARTED');
                }
            } catch (err) {
                setMessage({ type: 'error', text: 'Impossible de charger les pointages du jour.' });
            }
        };
        fetchTimeline();
    }, [empId, api]);


    // --- ÉTATS CENTRAUX ---
    const [status, setStatus] = useState<TrackerStatus>('NOT_STARTED');
    const [currentTask, setCurrentTask] = useState<TaskUI | null>(null);
    const [currentProject, setCurrentProject] = useState<ProjectUI | null>(null);
    const [dailyTimeline, setDailyTimeline] = useState<TimelineEntry[]>([]);
    const [taskElapsedTime, setTaskElapsedTime] = useState(0);
    const [isCommandMenuOpen, setCommandMenuOpen] = useState(false);

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<Message | null>(null);

    type PendingAction =
        | { type: 'BREAK_START' }
        | { type: 'MEETING_START' }
        | { type: 'TASK_CHANGE', task: TaskUI, project: ProjectUI };
    const [pendingAction, setPendingAction] = useState<PendingAction | null>(null);
    const [description, setDescription] = useState("");

    const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
    const selectedProject = useMemo(() => projects.find(p => p.id === selectedProjectId), [projects, selectedProjectId]);
    React.useEffect(() => {
        if (projects.length > 0 && !selectedProjectId) {
            setSelectedProjectId(projects[0].id);
        }
    }, [projects, selectedProjectId]);

    // Ajout d'une tâche enrichie
    const [isAddTaskOpen, setAddTaskOpen] = useState(false);
    const [newTaskName, setNewTaskName] = useState("");
    const [newTaskDesc, setNewTaskDesc] = useState("");
    const [newTaskEstHours, setNewTaskEstHours] = useState(0);
    const [newTaskStatus, setNewTaskStatus] = useState('A_FAIRE');
    const [newTaskPriority, setNewTaskPriority] = useState<Priority>("medium");
    const [addTaskLoading, setAddTaskLoading] = useState(false);

    // Changement d'état d'une tâche
    const [isChangeStateOpen, setChangeStateOpen] = useState(false);
    const [changeStateLoading, setChangeStateLoading] = useState(false);



    // --- LOGIQUE DU MINUTEUR & RACCOURCIS ---
    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (status === 'WORKING' || status === 'ON_BREAK') {
            timer = setInterval(() => setTaskElapsedTime(prev => prev + 1), 1000);
        } else {
            setTaskElapsedTime(0);
        }
        return () => clearInterval(timer);
    }, [status]);

    useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                if (status !== 'NOT_STARTED') setCommandMenuOpen(open => !open);
            }
        };
        document.addEventListener('keydown', down);
        return () => document.removeEventListener('keydown', down);
    }, [status]);

    // --- FONCTIONS UTILITAIRES ---
    const formatTime = (seconds: number) => new Date(seconds * 1000).toISOString().substr(11, 8);
    const formatDate = (date: Date) => date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    const getPriorityBadgeVariant = (priority: string) => ({
        CRITICAL: 'destructive', HIGH: 'default', MEDIUM: 'secondary', LOW: 'outline'
    }[(priority || '').toUpperCase()] as any || 'secondary');

    const endCurrentActivity = useCallback(() => {
        setDailyTimeline(prev => prev.map((entry, index) =>
            index === prev.length - 1 && !entry.endTime ? { ...entry, endTime: new Date() } : entry
        ));
    }, []);

    // --- GESTIONNAIRES D'ACTIONS LIÉS À L'API ---

    const callPointageApi = async (type: 'ENTREE' | 'SORTIE' | 'PAUSE' | 'FIN_PAUSE' | 'REUNION', desc?: string) => {
        setLoading(true);
        setMessage(null);
        try {
            const response = await fetch('http://localhost:8080/api/pointages/create', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ typePointage: type, empId, timestamp: new Date().toISOString(), commentaire: desc })
            });
            if (!response.ok) throw new Error(`Erreur API: ${response.statusText}`);
            return true;
        } catch (err: any) {
            setMessage({ type: 'error', text: err.message });
            return false;
        } finally {
            setLoading(false);
        }
    };
    const userData = localStorage.getItem('userData');
    const userId = userData ? JSON.parse(userData).id : '';
    // Ajout d'une tâche à un projet (version enrichie)
    const handleAddTask = async () => {
        if (!selectedProjectId || !newTaskName) return;
        setAddTaskLoading(true);
        setMessage(null);
        try {
            await api.createTask(selectedProjectId, {
                nom: newTaskName,
                description: newTaskDesc,
                estimationHeures: newTaskEstHours,
                statut: newTaskStatus as any, // Cast pour TacheStatut
                priority: newTaskPriority.toUpperCase() as any // Cast explicite en Priority
                , userId: userId
            });
            setMessage({ type: 'success', text: 'Tâche ajoutée avec succès !' });
            setAddTaskOpen(false);
            setNewTaskName("");
            setNewTaskDesc("");
            setNewTaskEstHours(0);
            setNewTaskStatus('A_FAIRE');
            setNewTaskPriority("medium");
        } catch (err: any) {
            setMessage({ type: 'error', text: err.message });
        } finally {
            setAddTaskLoading(false);
        }
    };

    // Changement d'état d'une tâche existante
    const handleChangeTaskState = async (newState: 'TERMINEE' | 'BLOQUEE') => {
        if (!currentTask) return;
        setChangeStateLoading(true);
        setMessage(null);
        try {
            const response = await fetch(`http://localhost:8080/api/pointages/tasks/${currentTask.id}/state`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: newState
            });
            if (!response.ok) throw new Error("Erreur lors du changement d'état de la tâche");
            setMessage({ type: 'success', text: `Tâche marquée comme ${newState === 'TERMINEE' ? 'Terminée' : 'Bloquée'}` });
            setCurrentTask(null);
            setCurrentProject(null);
            setStatus('WORKING');
        } catch (err: any) {
            setMessage({ type: 'error', text: err.message });
        } finally {
            setChangeStateLoading(false);
            setChangeStateOpen(false);
        }
    };

    const handleStartDay = async () => {
        const success = await callPointageApi('ENTREE');
        if (success) {
            setStatus('WORKING');
            setMessage({ type: 'success', text: 'Arrivée enregistrée !' });
            setDailyTimeline([{ type: 'WORK', startTime: new Date(), endTime: null, description: "Début de la journée", projectName: "Temps non-assigné" }]);
        }
    };

    const handleEndDay = async () => {
        const success = await callPointageApi('SORTIE');
        if (success) {
            setStatus('NOT_STARTED');
            setMessage(null); // Pas de message sur l'écran de "début"
            endCurrentActivity();
            setCurrentTask(null);
            setCurrentProject(null);
        }
    };

    // Ouvre la modale de description pour changement de tâche
    const handleSelectTask = (task: TaskUI, project: ProjectUI) => {
        setCommandMenuOpen(false);
        setPendingAction({ type: 'TASK_CHANGE', task, project });
        setDescription("");
    };

    // Validation de la modale (pause, réunion ou changement de tâche)
    const handleConfirmAction = async () => {
        if (!pendingAction) return;
        if (pendingAction.type === 'BREAK_START') {
            const success = await callPointageApi('PAUSE', description);
            if (success) {
                endCurrentActivity();
                setDailyTimeline(prev => [...prev, { type: 'BREAK', startTime: new Date(), endTime: null, description: description || "Pause" }]);
                setCurrentTask(null);
                setCurrentProject(null);
                setStatus('ON_BREAK');
                setTaskElapsedTime(0);
                setMessage({ type: 'info', text: 'Pause commencée' });
            }
        } else if (pendingAction.type === 'MEETING_START') {
            const success = await callPointageApi('REUNION', description);
            if (success) {
                endCurrentActivity();
                setDailyTimeline(prev => [...prev, { type: 'MEETING', startTime: new Date(), endTime: null, description: description || "Réunion" }]);
                setCurrentTask(null);
                setCurrentProject(null);
                setStatus('WORKING'); // Les réunions sont considérées comme du travail
                setTaskElapsedTime(0);
                setMessage({ type: 'info', text: 'Réunion commencée' });
            }
        } else if (pendingAction.type === 'TASK_CHANGE') {
            const { task, project } = pendingAction;
            setLoading(true);
            setMessage(null);
            try {
                const url = `http://localhost:8080/api/pointages/change-tasks/${empId}/${task.id}?description=${encodeURIComponent(description || '')}`;
                const response = await fetch(url, {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (!response.ok) throw new Error('Impossible de changer de tâche');
                endCurrentActivity();
                setDailyTimeline(prev => [
                    ...prev,
                    {
                        type: 'WORK',
                        startTime: new Date(),
                        endTime: null,
                        description: description ? `Travail sur : ${task.name} | ${description}` : `Travail sur : ${task.name}`,
                        task,
                        projectName: project.name
                    }
                ]);
                setCurrentTask(task);
                setCurrentProject(project);
                setStatus('WORKING');
                setTaskElapsedTime(0);
                setMessage({ type: 'success', text: `Tâche changée pour : ${task.name}` });
            } catch (err: any) {
                setMessage({ type: 'error', text: err.message });
            } finally {
                setLoading(false);
            }
        }
        setPendingAction(null);
        setDescription("");
    };

    const handleEndBreak = async () => {
        const success = await callPointageApi('FIN_PAUSE');
        if (success) {
            endCurrentActivity();
            // Retour au statut générique "WORKING" pour inciter à choisir une tâche
            setStatus('WORKING');
            setDailyTimeline(prev => [...prev, { type: 'WORK', startTime: new Date(), endTime: null, description: "Reprise du travail", projectName: "Temps non-assigné" }]);
            setMessage({ type: 'success', text: 'Reprise du travail !' });
        }
    };


    // --- CALCUL DES TEMPS TOTAUX ---
    const totalWorkTime = useMemo(() => {
        return dailyTimeline
            .filter(entry => entry.type === 'WORK' || entry.type === 'MEETING')
            .reduce((acc, entry) => {
                const end = entry.endTime ? entry.endTime.getTime() : Date.now();
                return acc + Math.max(0, (end - entry.startTime.getTime()) / 1000);
            }, 0);
    }, [dailyTimeline]);

    const totalBreakTime = useMemo(() => {
        return dailyTimeline
            .filter(entry => entry.type === 'BREAK')
            .reduce((acc, entry) => {
                const end = entry.endTime ? entry.endTime.getTime() : Date.now();
                return acc + Math.max(0, (end - entry.startTime.getTime()) / 1000);
            }, 0);
    }, [dailyTimeline]);

    // --- RENDU ---
    if (status === 'NOT_STARTED') {
        return (
            <Card className="w-full max-w-2xl mx-auto shadow-lg"><CardContent className="pt-6 text-center">
                <div className="p-8 bg-slate-50 dark:bg-slate-800 rounded-lg">
                    <CheckCircle className="mx-auto h-16 w-16 text-green-500 mb-4" />
                    <h2 className="text-2xl font-bold">Prêt à démarrer</h2>
                    <p className="text-muted-foreground mt-2">Votre journée de travail n'a pas encore commencé.</p>
                </div>
                <Button onClick={handleStartDay} size="lg" className="w-full mt-6 h-14 text-lg" disabled={loading}>
                    {loading ? <Loader2 className="mr-3 h-6 w-6 animate-spin" /> : <Play className="mr-3 h-6 w-6" />}
                    Démarrer la journée
                </Button>
            </CardContent></Card>
        );
    }

    return (
        <TooltipProvider><Card className={`w-full max-w-2xl mx-auto shadow-2xl transition-all ${status === 'ON_BREAK' ? 'border-amber-400' : 'border-blue-500'}`}>
            <CardHeader className={`p-4 text-white ${status === 'ON_BREAK' ? 'bg-amber-500' : 'bg-gradient-to-r from-blue-600 to-indigo-600'}`}>
                <div className="flex justify-between items-center"><div className="flex items-center gap-3">
                    {status === 'WORKING' && <Briefcase className="h-6 w-6" />}
                    {status === 'ON_BREAK' && <Coffee className="h-6 w-6" />}
                    <div>
                        <CardTitle className="text-xl">{status === 'ON_BREAK' ? "En Pause" : currentTask?.name || "Temps non-assigné"}</CardTitle>
                        <CardDescription className="text-blue-100">{status !== 'ON_BREAK' && (currentProject?.name || "Veuillez sélectionner une tâche")}</CardDescription>
                    </div>
                </div><div className="text-3xl font-mono bg-black bg-opacity-20 px-3 py-1 rounded-md">{formatTime(taskElapsedTime)}</div></div>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
                {message && (
                    <Alert variant={message.type === 'error' ? 'destructive' : 'default'} className={message.type === 'success' ? 'bg-green-50 border-green-200' : message.type === 'info' ? 'bg-blue-50 border-blue-200' : ''}>
                        {message.type === 'success' && <CheckCircle className="h-4 w-4" />}
                        {message.type === 'error' && <AlertCircle className="h-4 w-4" />}
                        <AlertTitle>{message.type.charAt(0).toUpperCase() + message.type.slice(1)}</AlertTitle>
                        <AlertDescription>{message.text}</AlertDescription>
                    </Alert>
                )}
                {status === 'WORKING' && !currentTask && (
                    <Alert variant="destructive"><AlertCircle className="h-4 w-4" /><AlertTitle>Action requise</AlertTitle>
                        <AlertDescription>Votre temps est enregistré mais non assigné. Sélectionnez une tâche pour continuer.</AlertDescription>
                    </Alert>
                )}

                <div className="grid grid-cols-2 gap-3">
                    {status === 'WORKING' ? (<>
                        <Button onClick={() => setPendingAction({ type: 'BREAK_START' })} variant="secondary" size="lg" className="h-12" disabled={loading}><Pause className="mr-2 h-5 w-5" /> Pause</Button>
                        <Button onClick={() => setPendingAction({ type: 'MEETING_START' })} variant="outline" size="lg" className="h-12" disabled={loading}><Users className="mr-2 h-5 w-5" /> Réunion</Button>
                        <Button onClick={() => setCommandMenuOpen(true)} size="lg" className="h-12 col-span-2" disabled={loading}><Briefcase className="mr-2 h-5 w-5" /> Changer Tâche</Button>
                        {currentTask && (
                            <Button onClick={() => setChangeStateOpen(true)} size="lg" className="h-12 col-span-2" variant="outline" disabled={loading}>
                                <MessageSquare className="mr-2 h-5 w-5" /> Changer l'état de la tâche
                            </Button>
                        )}
                    </>) : (
                        <Button onClick={handleEndBreak} size="lg" className="h-12 col-span-2 bg-green-600 hover:bg-green-700" disabled={loading}>
                            {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Play className="mr-2 h-5 w-5" />}Reprendre le travail</Button>
                    )}
                </div>

                <AlertDialog open={isAddTaskOpen} onOpenChange={setAddTaskOpen}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle className="flex items-center gap-2">
                                <ListPlus className="h-6 w-6" />
                                Ajouter une nouvelle tâche
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                                Remplissez les détails pour la nouvelle tâche dans le projet : <span className="font-semibold text-primary">{selectedProject?.nom}</span>
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <form onSubmit={(e) => { e.preventDefault(); handleAddTask(); }}>
                            <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <label htmlFor="t-name" className="text-sm font-semibold">Nom de la tâche</label>
                                    <Input
                                        id="t-name"
                                        value={newTaskName}
                                        onChange={(e) => setNewTaskName(e.target.value)}
                                        placeholder="Ex: Refonte de la page d'accueil"
                                        autoFocus
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="t-desc" className="text-sm font-semibold">Description (Optionnel)</label>
                                    <Textarea
                                        id="t-desc"
                                        value={newTaskDesc || ''}
                                        onChange={(e) => setNewTaskDesc(e.target.value)}
                                        placeholder="Objectifs, détails techniques, liens utiles..."
                                        rows={3}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label htmlFor="t-hours" className="text-sm font-semibold">Estimation (h)</label>
                                        <Input
                                            id="t-hours"
                                            type="number"
                                            min="0"
                                            value={newTaskEstHours || ''}
                                            onChange={(e) => setNewTaskEstHours(Number(e.target.value))}
                                            placeholder="0"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label htmlFor="t-priority" className="text-sm font-semibold">Priorité</label>
                                        <Select value={newTaskPriority} onValueChange={(value) => setNewTaskPriority(value as Priority)}>
                                            <SelectTrigger id="t-priority">
                                                <SelectValue placeholder="Choisir..." />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="low">Faible</SelectItem>
                                                <SelectItem value="medium">Moyenne</SelectItem>
                                                <SelectItem value="high">Haute</SelectItem>
                                                <SelectItem value="critical">Critique</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="t-status" className="text-sm font-semibold">Statut</label>
                                    <Select value={newTaskStatus || 'A_FAIRE'} onValueChange={(value) => setNewTaskStatus(value)}>
                                        <SelectTrigger id="t-status">
                                            <SelectValue placeholder="Choisir..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="A_FAIRE">À faire</SelectItem>
                                            <SelectItem value="EN_COURS">En cours</SelectItem>
                                            <SelectItem value="TERMINEE">Terminée</SelectItem>
                                            <SelectItem value="BLOQUEE">Bloquée</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <AlertDialogFooter>
                                <AlertDialogCancel type="button">Annuler</AlertDialogCancel>
                                <AlertDialogAction type="submit" disabled={addTaskLoading || !newTaskName}>
                                    {addTaskLoading ? (
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    ) : (
                                        <PlusCircle className="mr-2 h-4 w-4" />
                                    )}
                                    Ajouter la tâche
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </form>
                    </AlertDialogContent>
                </AlertDialog>


                {/* Modal de changement d'état de tâche */}
                <AlertDialog open={isChangeStateOpen} onOpenChange={setChangeStateOpen}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Changer l'état de la tâche</AlertDialogTitle>
                            <AlertDialogDescription>Choisissez le nouvel état pour la tâche courante.</AlertDialogDescription>
                        </AlertDialogHeader>
                        <div className="flex flex-col gap-2 py-2">
                            <Button variant="outline" onClick={() => handleChangeTaskState('TERMINEE')} disabled={changeStateLoading}>
                                {changeStateLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null} Marquer comme Terminée
                            </Button>
                            <Button variant="destructive" onClick={() => handleChangeTaskState('BLOQUEE')} disabled={changeStateLoading}>
                                {changeStateLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null} Marquer comme Bloquée
                            </Button>
                        </div>
                        <AlertDialogFooter>
                            <AlertDialogCancel onClick={() => setChangeStateOpen(false)}>Annuler</AlertDialogCancel>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>

                <div>
                    <h3 className="text-sm font-semibold text-muted-foreground mb-2 flex items-center gap-2"><History className="h-4 w-4" /> Votre journée</h3>
                    <div className="space-y-1 max-h-48 overflow-y-auto pr-2">{dailyTimeline.map((entry, index) => (
                        <div key={index} className={`flex items-start p-2 rounded-md ${!entry.endTime ? 'bg-blue-50' : 'bg-slate-50'}`}>
                            <div className="mt-1 mr-3">
                                {entry.type === 'WORK' ? <Briefcase className="h-5 w-5 text-blue-500" /> :
                                    entry.type === 'BREAK' ? <Coffee className="h-5 w-5 text-amber-600" /> :
                                        <Users className="h-5 w-5 text-green-600" />}
                            </div>
                            <div className="flex-1">
                                <p className="font-medium text-sm text-slate-800">{entry.task?.name || entry.description}</p>
                                <p className="text-xs text-slate-500 italic">{entry.task ? entry.projectName : ''}</p>
                            </div>
                            <div className="text-right flex-shrink-0">
                                <p className="text-sm font-mono text-slate-700">{formatDate(entry.startTime)} - {entry.endTime ? formatDate(entry.endTime) : '...'}</p>
                                <p className="text-xs text-muted-foreground font-mono">{!entry.endTime ? formatTime(taskElapsedTime) : formatTime((entry.endTime.getTime() - entry.startTime.getTime()) / 1000)}</p>
                            </div>
                        </div>))}
                    </div>
                </div>

                <div className="pt-4 border-t">
                    <div className="flex justify-between items-center mb-2 text-sm">
                        <span>Total Travail: <span className="font-mono">{formatTime(totalWorkTime)}</span></span>
                        <span>Pause: <span className="font-mono">{formatTime(totalBreakTime)}</span></span>
                    </div>
                    <Progress value={(totalWorkTime / (8 * 3600)) * 100} className="h-2" />
                    <Button onClick={handleEndDay} variant="destructive" className="w-full mt-4 h-12" disabled={loading}>
                        {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Power className="mr-2 h-5 w-5" />} Terminer la journée</Button>
                </div>
            </CardContent>
        </Card>

            <CommandDialog open={isCommandMenuOpen} onOpenChange={setCommandMenuOpen}>
                {/* En-tête avec sélecteur de projet et bouton d'ajout */}
                <div className="flex items-center justify-between p-4 border-b">
                    <div className="flex items-center gap-2">
                        <Briefcase className="h-4 w-4 text-muted-foreground" />
                        <Select
                            value={selectedProjectId || ''}
                            onValueChange={(value) => setSelectedProjectId(value)}
                        >
                            <SelectTrigger className="w-[180px] sm:w-[220px]">
                                <SelectValue placeholder="Sélectionnez un projet" />
                            </SelectTrigger>
                            <SelectContent>
                                {projects.map(p => (
                                    <SelectItem key={p.id} value={p.id}>{p.nom}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <Button size="sm" variant="outline" onClick={() => setAddTaskOpen(true)}>
                        <PlusCircle className="h-4 w-4 sm:mr-2" />
                        <span className="hidden sm:inline">Nouvelle tâche</span>
                    </Button>
                </div>

                {/* Barre de recherche */}
                <div className="p-2 border-b">
                    <CommandInput placeholder="Chercher une tâche..." />
                </div>

                {/* Liste des résultats */}
                <CommandList className="max-h-[300px]">
                    {!selectedProject ? (
                        <div className="py-6 text-center text-sm">
                            Veuillez sélectionner un projet pour voir ses tâches.
                        </div>
                    ) : (
                        <>
                            <CommandEmpty>Aucune tâche trouvée pour votre recherche.</CommandEmpty>
                            <CommandGroup heading={selectedProject.nom}>
                                {selectedProject.taches?.length > 0 ? (
                                    selectedProject.taches.map(task => (
                                        <CommandItem
                                            key={task.id}
                                            onSelect={() => handleSelectTask(
                                                { id: String(task.id), name: task.nom, priority: (task.priority?.toLowerCase() as Priority) || 'medium' },
                                                { id: String(selectedProject.id), name: selectedProject.nom }
                                            )}
                                            className="flex justify-between items-center cursor-pointer"
                                        >
                                            <div className="flex items-center gap-3">
                                                <ListTodo className="h-4 w-4 text-muted-foreground" />
                                                <span>{task.nom}</span>
                                            </div>
                                            {task.priority && (
                                                <Badge variant={getPriorityBadgeVariant(task.priority)}>
                                                    {task.priority}
                                                </Badge>
                                            )}
                                        </CommandItem>
                                    ))
                                ) : (
                                    // État vide amélioré quand un projet n'a pas de tâches
                                    <div className="flex flex-col items-center justify-center text-center py-6">
                                        <Inbox className="h-8 w-8 text-muted-foreground mb-2" />
                                        <p className="text-sm font-medium">Aucune tâche</p>
                                        <p className="text-xs text-muted-foreground">Ce projet ne contient aucune tâche pour le moment.</p>
                                    </div>
                                )}
                            </CommandGroup>
                        </>
                    )}
                </CommandList>
            </CommandDialog>


            <AlertDialog open={!!pendingAction} onOpenChange={(isOpen) => !isOpen && setPendingAction(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            {pendingAction?.type === 'BREAK_START' ? 'Prendre une pause' :
                                pendingAction?.type === 'MEETING_START' ? 'Commencer une réunion' :
                                    'Changer de tâche'}
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            {pendingAction?.type === 'BREAK_START'
                                ? 'Ajoutez une description (ex: Pause déjeuner). Elle sera visible dans vos rapports.'
                                : pendingAction?.type === 'MEETING_START'
                                    ? 'Ajoutez une description de la réunion (ex: Réunion équipe, Point client...). Elle sera visible dans vos rapports.'
                                    : 'Ajoutez un descriptif pour ce changement au début de tâche (optionnel). Elle sera visible dans vos rapports.'}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="py-2">
                        <Input
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder={pendingAction?.type === 'BREAK_START' ? 'Pause café' :
                                pendingAction?.type === 'MEETING_START' ? 'Réunion équipe' :
                                    'description...'}
                            autoFocus
                        />
                    </div>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setPendingAction(null)}>Annuler</AlertDialogCancel>
                        <AlertDialogAction onClick={handleConfirmAction}>
                            {pendingAction?.type === 'BREAK_START' ? 'Démarrer la pause' :
                                pendingAction?.type === 'MEETING_START' ? 'Commencer la réunion' :
                                    'Valider'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </TooltipProvider>
    );
};