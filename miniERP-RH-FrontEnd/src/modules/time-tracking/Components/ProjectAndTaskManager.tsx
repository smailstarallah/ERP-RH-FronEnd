// components/ProjectManager.tsx

import React, { useState, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, Loader2, ListTodo, Building, DollarSign, Target } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import type { TacheStatut, Priority } from '../hooks/useTimeTrackerApi';
// Enum de priorité (doit correspondre au backend)
const PRIORITIES = [
    { value: 'LOW', label: 'Basse' },
    { value: 'MEDIUM', label: 'Moyenne' },
    { value: 'HIGH', label: 'Haute' },
    { value: 'CRITICAL', label: 'Critique' },
];
import { useProjectApi } from '../hooks/useTimeTrackerApi';


// -- COMPOSANT DE GESTION PRINCIPAL --
// Plus besoin de ProjectManagerProps, le composant gère l'appel API lui-même

export const ProjectAndTaskManager: React.FC = () => {
    // Hook API
    const { projects, isLoading, api } = useProjectApi();
    // --- State pour la sélection ---
    const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

    // Sélectionner automatiquement le premier projet existant au chargement
    React.useEffect(() => {
        if (projects.length > 0 && !selectedProjectId) {
            setSelectedProjectId(projects[0].id);
        }
    }, [projects, selectedProjectId]);

    // --- State pour le formulaire de création de projet ---
    const [newProjectName, setNewProjectName] = useState("");
    const [newProjectClient, setNewProjectClient] = useState("");
    const [newProjectDesc, setNewProjectDesc] = useState("");
    const [newProjectBudget, setNewProjectBudget] = useState(0);
    const [newProjectStart, setNewProjectStart] = useState<Date | undefined>();
    const [newProjectEnd, setNewProjectEnd] = useState<Date | undefined>();

    // --- State pour le formulaire de création de tâche ---
    const [newTaskName, setNewTaskName] = useState("");
    const [newTaskDesc, setNewTaskDesc] = useState("");
    const [newTaskEstHours, setNewTaskEstHours] = useState(0);
    const [newTaskStatus, setNewTaskStatus] = useState<TacheStatut>('A_FAIRE');
    const [newTaskPriority, setNewTaskPriority] = useState<Priority>('MOYENNE' as Priority);

    // --- Logique de sélection ---
    const selectedProject = useMemo(() => projects.find(p => p.id === selectedProjectId), [projects, selectedProjectId]);

    const resetProjectForm = () => {
        setNewProjectName(""); setNewProjectClient(""); setNewProjectDesc("");
        setNewProjectBudget(0); setNewProjectStart(undefined); setNewProjectEnd(undefined);
    };
    const resetTaskForm = () => {
        setNewTaskName(""); setNewTaskDesc(""); setNewTaskEstHours(0); setNewTaskStatus('A_FAIRE'); setNewTaskPriority('MOYENNE' as Priority);
    };

    const handleCreateProject = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newProjectName.trim() || !newProjectStart || !newProjectEnd || isLoading) return;
        try {
            await api.createProject({
                nom: newProjectName, client: newProjectClient, description: newProjectDesc,
                dateDebut: newProjectStart, dateFinPrevue: newProjectEnd, budget: newProjectBudget,
            });
            resetProjectForm();
        } catch (error) { console.error("Erreur création projet:", error); }
    };

    const handleCreateTask = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedProjectId || !newTaskName.trim() || isLoading) return;
        try {
            await api.createTask(selectedProjectId, {
                nom: newTaskName,
                description: newTaskDesc,
                estimationHeures: newTaskEstHours,
                statut: newTaskStatus,
                priority: newTaskPriority, // champ ajouté
            });
            resetTaskForm();
        } catch (error) { console.error("Erreur création tâche:", error); }
    };

    return (
        <div className="grid grid-cols-1 gap-6">
            {/* === COLONNE DE GAUCHE : LISTE ET CRÉATION DE PROJETS === */}
            <div className="lg:col-span-1 space-y-6">
                <Card>
                    <CardHeader><CardTitle>Créer un Projet</CardTitle></CardHeader>
                    <CardContent>
                        <form onSubmit={handleCreateProject} className="space-y-4">
                            <div className="space-y-1">
                                <Label htmlFor="p-name">Nom du projet</Label>
                                <Input id="p-name" value={newProjectName} onChange={e => setNewProjectName(e.target.value)} placeholder="Plateforme 'Aura'" />
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="p-client">Client</Label>
                                <Input id="p-client" value={newProjectClient} onChange={e => setNewProjectClient(e.target.value)} placeholder="Aura Inc." />
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="p-budget">Budget (€)</Label>
                                <Input id="p-budget" type="number" value={newProjectBudget} onChange={e => setNewProjectBudget(parseFloat(e.target.value))} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <Label>Début</Label>
                                    <Popover>
                                        <PopoverTrigger asChild><Button variant="outline" className="w-full justify-start font-normal">{newProjectStart ? format(newProjectStart, "dd/MM/yyyy") : <span>Choisir date</span>}<CalendarIcon className="ml-auto h-4 w-4 opacity-50" /></Button></PopoverTrigger>
                                        <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={newProjectStart} onSelect={setNewProjectStart} initialFocus /></PopoverContent>
                                    </Popover>
                                </div>
                                <div className="space-y-1">
                                    <Label>Fin Prévue</Label>
                                    <Popover>
                                        <PopoverTrigger asChild><Button variant="outline" className="w-full justify-start font-normal">{newProjectEnd ? format(newProjectEnd, "dd/MM/yyyy") : <span>Choisir date</span>}<CalendarIcon className="ml-auto h-4 w-4 opacity-50" /></Button></PopoverTrigger>
                                        <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={newProjectEnd} onSelect={setNewProjectEnd} initialFocus /></PopoverContent>
                                    </Popover>
                                </div>
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="p-desc">Description</Label>
                                <Textarea id="p-desc" value={newProjectDesc} onChange={e => setNewProjectDesc(e.target.value)} placeholder="Description courte du projet..." />
                            </div>
                            <Button type="submit" className="w-full" disabled={isLoading}>{isLoading ? <Loader2 className="animate-spin" /> : 'Créer le Projet'}</Button>
                        </form>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader><CardTitle>Liste des Projets</CardTitle></CardHeader>
                    <CardContent className="max-h-[400px] overflow-y-auto">
                        {projects.map(p => (
                            <Button key={p.id} onClick={() => setSelectedProjectId(p.id)} variant={selectedProjectId === p.id ? "secondary" : "ghost"} className="w-full justify-start mb-1">{p.nom}</Button>
                        ))}
                    </CardContent>
                </Card>
            </div>

            {/* === COLONNE DE DROITE : DÉTAILS ET GESTION DES TÂCHES === */}
            <div className="lg:col-span-2">
                {!selectedProject ? (
                    <Card className="h-full flex items-center justify-center">
                        <div className="text-center text-muted-foreground">
                            <Target className="mx-auto h-12 w-12" />
                            <p className="mt-4">Sélectionnez un projet pour voir ses détails et gérer ses tâches.</p>
                        </div>
                    </Card>
                ) : (
                    <div className="space-y-6">
                        <Card>
                            <CardHeader><CardTitle>{selectedProject.nom}</CardTitle><CardDescription>{selectedProject.description}</CardDescription></CardHeader>
                            <CardContent className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                                <div className="flex items-center gap-2"><Building className="h-4 w-4 text-muted-foreground" /><strong>Client:</strong> {selectedProject.client}</div>
                                <div className="flex items-center gap-2"><DollarSign className="h-4 w-4 text-muted-foreground" /><strong>Budget:</strong> {(selectedProject.budget ?? 0).toLocaleString('fr-FR')} €</div>
                                <div className="flex items-center gap-2"><CalendarIcon className="h-4 w-4 text-muted-foreground" /><strong>Période:</strong> {
                                    selectedProject.dateDebut ? format(parseISO(selectedProject.dateDebut), "d MMM yyyy", { locale: fr }) : '—'
                                } - {
                                        selectedProject.dateFinPrevue ? format(parseISO(selectedProject.dateFinPrevue), "d MMM yyyy", { locale: fr }) : '—'
                                    }</div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Ajouter une Tâche</CardTitle>
                                <CardDescription>
                                    Cette tâche sera ajoutée au projet sélectionné ci-dessus&nbsp;: <span className="font-semibold">{selectedProject.nom}</span>
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleCreateTask} className="space-y-4">
                                    <div className="space-y-1">
                                        <Label htmlFor="t-name">Nom de la tâche</Label>
                                        <Input id="t-name" value={newTaskName} onChange={e => setNewTaskName(e.target.value)} placeholder="Ex: Refonte du dashboard" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <Label htmlFor="t-hours">Estimation (heures)</Label>
                                            <Input id="t-hours" type="number" value={newTaskEstHours} onChange={e => setNewTaskEstHours(parseFloat(e.target.value))} />
                                        </div>
                                        <div className="space-y-1">
                                            <Label htmlFor="t-priority">Priorité</Label>
                                            <Select value={newTaskPriority} onValueChange={value => setNewTaskPriority(value as Priority)}>
                                                <SelectTrigger id="t-priority">
                                                    <SelectValue placeholder="Choisir la priorité" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {PRIORITIES.map(p => (
                                                        <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <Label htmlFor="t-desc">Description de la Tâche</Label>
                                        <Textarea id="t-desc" value={newTaskDesc} onChange={e => setNewTaskDesc(e.target.value)} placeholder="Objectifs et détails techniques..." />
                                    </div>
                                    <Button type="submit" className="w-full" disabled={isLoading}>{isLoading ? <Loader2 className="animate-spin" /> : 'Ajouter la Tâche'}</Button>
                                </form>
                            </CardContent>
                        </Card>

                        <div className="space-y-2">
                            <h3 className="text-lg font-semibold flex items-center gap-2"><ListTodo /> Tâches du projet</h3>
                            {selectedProject.taches.length === 0 ? <p className="text-sm text-muted-foreground">Aucune tâche pour ce projet.</p> : selectedProject.taches.map(t => (
                                <div key={t.id} className="p-3 border rounded-md flex justify-between items-center">
                                    <div>
                                        <p className="font-semibold">{t.nom}</p>
                                        <p className="text-sm text-muted-foreground">{t.description}</p>
                                    </div>
                                    <div className="text-right">
                                        <Badge>{t.statut.replace('_', ' ')}</Badge>
                                        <p className="text-xs text-muted-foreground mt-1">{t.estimationHeures}h estimées</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};