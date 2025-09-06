// Créez un nouveau fichier : hooks/useProjectApi.ts

import { useState, useEffect, useCallback, useMemo } from 'react';
import { format } from 'date-fns';

//================================================================================
// 1. TYPES - Définir la structure des données de l'API
//================================================================================

export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type TacheStatut = 'A_FAIRE' | 'EN_COURS' | 'TERMINEE' | 'BLOQUEE';

export interface Tache {
    id: string;
    nom: string;
    description: string;
    estimationHeures: number;
    statut: TacheStatut;
    priority: Priority;
}
export interface Projet {
    id: string;
    nom: string;
    client: string;
    description: string;
    dateDebut: string; // Les dates arrivent en string (ISO)
    dateFinPrevue: string;
    budget: number;
    taches: Tache[];
}


// L'URL de base de votre API Spring Boot
const API_BASE_URL = 'http://localhost:8080/api/pointages';


//================================================================================
// 2. LE HOOK PERSONNALISÉ
//================================================================================

export const useProjectApi = () => {
    // --- États internes du hook ---
    const [projects, setProjects] = useState<Projet[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const token = localStorage.getItem('token') || '';

    /**
     * Une fonction générique pour centraliser tous les appels fetch.
     * Gère le chargement, les erreurs et la conversion en JSON.
     */
    const callApi = useCallback(async (endpoint: string, method: 'GET' | 'POST', body?: any) => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: body ? JSON.stringify(body) : undefined,
            });

            if (!response.ok) {
                throw new Error(`Erreur de l'API : ${response.status} ${response.statusText}`);
            }

            // Certains appels POST (comme la création) peuvent renvoyer 201 Created sans body
            if (response.status === 204 || response.status === 201) {
                return null; // Pas de contenu à parser
            }
            const jsonResponse = await response.json();
            return jsonResponse;

        } catch (err: any) {
            setError(err.message);
            console.error("Erreur lors de l'appel API:", err);
            throw err; // Propage l'erreur pour que le composant puisse réagir
        } finally {
            setIsLoading(false);
        }
    }, []);

    /**
     * Fonction pour récupérer la liste complète des projets et de leurs tâches.
     */
    const fetchProjects = useCallback(async () => {
        try {
            const data = await callApi('/projects', 'GET');
            setProjects(data || []);
        } catch (err) {
            // L'erreur est déjà gérée et stockée dans l'état `error` par callApi
        }
    }, [callApi]);

    // Effet pour charger les données initiales au premier rendu
    useEffect(() => {
        fetchProjects();
    }, [fetchProjects]);


    // --- Fonctions exposées, mémoïsées pour la performance ---
    const api = useMemo(() => ({
        /**
         * Crée un nouveau projet, puis actualise la liste.
         */
        createProject: async (data: { nom: string, client: string, description: string, dateDebut: Date, dateFinPrevue: Date, budget: number }) => {
            const payload = {
                ...data,
                // Formater les dates en YYYY-MM-DD, le format attendu par Spring Boot pour LocalDate
                dateDebut: format(data.dateDebut, 'yyyy-MM-dd'),
                dateFinPrevue: format(data.dateFinPrevue, 'yyyy-MM-dd'),
            };
            await callApi('/ajout/projects', 'POST', payload);
            await fetchProjects();
        },

        /**
         * Crée une nouvelle tâche pour un projet, puis actualise la liste.
         */
        createTask: async (projetId: string, data: { nom: string, description: string, estimationHeures: number, statut: TacheStatut, priority: Priority, userId: string }) => {
            await callApi(`/${projetId}/tasks`, 'POST', data);
            await fetchProjects();
        },

        getTodayTimeline: async (empId: string) => {
            const response = await fetch(`http://localhost:8080/api/pointages/today/${empId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) throw new Error('Erreur API');
            return await response.json();
        },
    }), [callApi, fetchProjects, token]);


    return {
        projects,
        isLoading,
        error,

        api,
    };
};