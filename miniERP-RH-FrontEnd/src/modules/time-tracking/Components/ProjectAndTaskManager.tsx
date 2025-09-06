// components/ProjectManager.tsx

import React, { useState, useMemo } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
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
                userId: localStorage.getItem('userData') ? JSON.parse(localStorage.getItem('userData') || '{}').id : '',
            });
            resetTaskForm();
        } catch (error) { console.error("Erreur création tâche:", error); }
    };

    return (
        <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                {/* === COLONNE DE GAUCHE : LISTE ET CRÉATION DE PROJETS === */}
                <div className="lg:col-span-1 space-y-3 sm:space-y-4">
                    <div className="bg-white border border-slate-200 rounded-lg shadow-sm">
                        <div className="p-3 sm:p-4 border-b border-slate-200">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                                    <Target className="h-4 w-4 text-white" />
                                </div>
                                <h3 className="text-base sm:text-lg font-semibold text-slate-900">Créer un Projet</h3>
                            </div>
                        </div>
                        <div className="p-3 sm:p-4">
                            <form onSubmit={handleCreateProject} className="space-y-3">
                                <div className="space-y-1">
                                    <label htmlFor="p-name" className="text-sm font-medium text-slate-900">Nom du projet</label>
                                    <input
                                        id="p-name"
                                        value={newProjectName}
                                        onChange={e => setNewProjectName(e.target.value)}
                                        placeholder="Plateforme 'Aura'"
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors duration-200"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label htmlFor="p-client" className="text-sm font-medium text-slate-900">Client</label>
                                    <input
                                        id="p-client"
                                        value={newProjectClient}
                                        onChange={e => setNewProjectClient(e.target.value)}
                                        placeholder="Aura Inc."
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors duration-200"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label htmlFor="p-budget" className="text-sm font-medium text-slate-900">Budget (€)</label>
                                    <input
                                        id="p-budget"
                                        type="number"
                                        value={newProjectBudget}
                                        onChange={e => setNewProjectBudget(parseFloat(e.target.value))}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors duration-200"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-1">
                                        <label className="text-sm font-medium text-slate-900">Début</label>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <button className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-left bg-white hover:bg-slate-50 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors duration-200 flex items-center justify-between">
                                                    {newProjectStart ? format(newProjectStart, "dd/MM/yyyy") : <span className="text-slate-500">Choisir date</span>}
                                                    <CalendarIcon className="h-4 w-4 text-slate-400" />
                                                </button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0 border border-slate-200 shadow-lg"><Calendar mode="single" selected={newProjectStart} onSelect={setNewProjectStart} initialFocus /></PopoverContent>
                                        </Popover>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-sm font-medium text-slate-900">Fin Prévue</label>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <button className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-left bg-white hover:bg-slate-50 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors duration-200 flex items-center justify-between">
                                                    {newProjectEnd ? format(newProjectEnd, "dd/MM/yyyy") : <span className="text-slate-500">Choisir date</span>}
                                                    <CalendarIcon className="h-4 w-4 text-slate-400" />
                                                </button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0 border border-slate-200 shadow-lg"><Calendar mode="single" selected={newProjectEnd} onSelect={setNewProjectEnd} initialFocus /></PopoverContent>
                                        </Popover>
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label htmlFor="p-desc" className="text-sm font-medium text-slate-900">Description</label>
                                    <textarea
                                        id="p-desc"
                                        value={newProjectDesc}
                                        onChange={e => setNewProjectDesc(e.target.value)}
                                        placeholder="Description courte du projet..."
                                        rows={3}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors duration-200 resize-none"
                                    />
                                </div>
                                <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 py-2 text-sm font-medium transition-colors duration-200 disabled:opacity-50" disabled={isLoading}>
                                    {isLoading ? <Loader2 className="animate-spin h-4 w-4" /> : 'Créer le Projet'}
                                </button>
                            </form>
                        </div>
                    </div>

                    <div className="bg-white border border-slate-200 rounded-lg shadow-sm">
                        <div className="p-4 border-b border-slate-200">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                                    <ListTodo className="h-4 w-4 text-white" />
                                </div>
                                <h3 className="text-lg font-semibold text-slate-900">Liste des Projets</h3>
                            </div>
                        </div>
                        <div className="p-3 sm:p-4 max-h-[300px] sm:max-h-[400px] overflow-y-auto space-y-2">
                            {projects.map(p => (
                                <button
                                    key={p.id}
                                    onClick={() => setSelectedProjectId(p.id)}
                                    className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${selectedProjectId === p.id
                                        ? "bg-blue-100 text-blue-800 border border-blue-200"
                                        : "hover:bg-slate-100 text-slate-700"
                                        }`}
                                >
                                    {p.nom}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* === COLONNE DE DROITE : DÉTAILS ET GESTION DES TÂCHES === */}
                <div className="lg:col-span-2">
                    {!selectedProject ? (
                        <div className="bg-white border border-slate-200 rounded-lg shadow-sm h-full flex items-center justify-center">
                            <div className="text-center text-slate-500">
                                <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center mx-auto">
                                    <Target className="h-6 w-6 text-slate-400" />
                                </div>
                                <p className="mt-3 text-sm font-medium text-slate-600">Sélectionnez un projet pour voir ses détails et gérer ses tâches.</p>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="bg-white border border-slate-200 rounded-lg shadow-sm">
                                <div className="p-4 border-b border-slate-200">
                                    <h3 className="text-lg font-semibold text-slate-900">{selectedProject.nom}</h3>
                                    <p className="text-sm text-slate-600 mt-1">{selectedProject.description}</p>
                                </div>
                                <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                    <div className="flex items-center gap-2">
                                        <Building className="h-4 w-4 text-slate-500" />
                                        <span className="font-medium text-slate-900">Client:</span>
                                        <span className="text-slate-600">{selectedProject.client || 'Non spécifié'}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <DollarSign className="h-4 w-4 text-slate-500" />
                                        <span className="font-medium text-slate-900">Budget:</span>
                                        <span className="text-slate-600">{(selectedProject.budget ?? 0).toLocaleString('fr-FR')} €</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <CalendarIcon className="h-4 w-4 text-slate-500" />
                                        <span className="font-medium text-slate-900">Période:</span>
                                        <span className="text-slate-600">
                                            {selectedProject.dateDebut ? format(parseISO(selectedProject.dateDebut), "d MMM yyyy", { locale: fr }) : '—'} - {selectedProject.dateFinPrevue ? format(parseISO(selectedProject.dateFinPrevue), "d MMM yyyy", { locale: fr }) : '—'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white border border-slate-200 rounded-lg shadow-sm">
                                <div className="p-4 border-b border-slate-200">
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                                            <ListTodo className="h-4 w-4 text-white" />
                                        </div>
                                        <h3 className="text-lg font-semibold text-slate-900">Ajouter une Tâche</h3>
                                    </div>
                                    <p className="text-sm text-slate-600 mt-2">
                                        Cette tâche sera ajoutée au projet sélectionné ci-dessus : <span className="font-medium text-slate-900">{selectedProject.nom}</span>
                                    </p>
                                </div>
                                <div className="p-4">
                                    <form onSubmit={handleCreateTask} className="space-y-3">
                                        <div className="space-y-1">
                                            <label htmlFor="t-name" className="text-sm font-medium text-slate-900">Nom de la tâche</label>
                                            <input
                                                id="t-name"
                                                value={newTaskName}
                                                onChange={e => setNewTaskName(e.target.value)}
                                                placeholder="Ex: Refonte du dashboard"
                                                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors duration-200"
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="space-y-1">
                                                <label htmlFor="t-hours" className="text-sm font-medium text-slate-900">Estimation (heures)</label>
                                                <input
                                                    id="t-hours"
                                                    type="number"
                                                    value={newTaskEstHours}
                                                    onChange={e => setNewTaskEstHours(parseFloat(e.target.value))}
                                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors duration-200"
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <label htmlFor="t-priority" className="text-sm font-medium text-slate-900">Priorité</label>
                                                <Select value={newTaskPriority} onValueChange={value => setNewTaskPriority(value as Priority)}>
                                                    <SelectTrigger id="t-priority" className="border-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500">
                                                        <SelectValue placeholder="Choisir la priorité" />
                                                    </SelectTrigger>
                                                    <SelectContent className="border border-slate-200 shadow-lg">
                                                        {PRIORITIES.map(p => (
                                                            <SelectItem key={p.value} value={p.value} className="hover:bg-slate-100">{p.label}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>
                                        <div className="space-y-1">
                                            <label htmlFor="t-desc" className="text-sm font-medium text-slate-900">Description de la Tâche</label>
                                            <textarea
                                                id="t-desc"
                                                value={newTaskDesc}
                                                onChange={e => setNewTaskDesc(e.target.value)}
                                                placeholder="Objectifs et détails techniques..."
                                                rows={3}
                                                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors duration-200 resize-none"
                                            />
                                        </div>
                                        <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 py-2 text-sm font-medium transition-colors duration-200 disabled:opacity-50" disabled={isLoading}>
                                            {isLoading ? <Loader2 className="animate-spin h-4 w-4" /> : 'Ajouter la Tâche'}
                                        </button>
                                    </form>
                                </div>
                            </div>

                            <div className="bg-white border border-slate-200 rounded-lg shadow-sm">
                                <div className="p-4 border-b border-slate-200">
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                                            <ListTodo className="h-4 w-4 text-white" />
                                        </div>
                                        <h3 className="text-lg font-semibold text-slate-900">Tâches du projet</h3>
                                    </div>
                                </div>
                                <div className="p-4">
                                    {selectedProject.taches.length === 0 ? (
                                        <div className="text-center py-6">
                                            <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center mx-auto">
                                                <ListTodo className="h-5 w-5 text-slate-400" />
                                            </div>
                                            <p className="text-sm text-slate-500 mt-2">Aucune tâche pour ce projet.</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            {selectedProject.taches.map(t => (
                                                <div key={t.id} className="p-3 border border-slate-200 rounded-lg bg-slate-50 flex justify-between items-start">
                                                    <div className="flex-1">
                                                        <h4 className="font-medium text-slate-900">{t.nom}</h4>
                                                        <p className="text-sm text-slate-600 mt-1">{t.description}</p>
                                                    </div>
                                                    <div className="text-right ml-4">
                                                        <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded bg-blue-100 text-blue-800">
                                                            {t.statut.replace('_', ' ')}
                                                        </span>
                                                        <p className="text-xs text-slate-500 mt-1">{t.estimationHeures}h estimées</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};