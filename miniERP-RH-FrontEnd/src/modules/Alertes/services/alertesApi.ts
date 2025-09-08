import type { Alerte, AlerteResponse, CreateAlerteRequest } from '../types';
import { alerteWebSocketService } from './AlerteWebSocketService';

// Configuration temporaire inline pour éviter les problèmes d'import
const config = {
  apiBaseUrl: 'http://localhost:8080',
  requestTimeout: 10000,
  websocket: {
    url: 'http://localhost:8080/ws/alertes'
  },
  endpoints: {
    alertes: '/api/alertes',
    employe: '/api/alertes/employe',
    marquerLue: '/api/alertes/{id}/lu',
    count: '/api/alertes/employe/{employeId}/non-lues/count',
    recentes: '/api/alertes/employe/{employeId}/recentes'
  }
};

const API_BASE_URL = config.apiBaseUrl;

class AlertesApiService {
    private getAuthHeaders(): HeadersInit {
        const token = localStorage.getItem('token');
        return {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` }),
        };
    }

    // Fonction pour mapper les types backend vers frontend
    private mapBackendType(backendType: string): 'info' | 'success' | 'urgent' {
        switch (backendType?.toUpperCase()) {
            case 'ERROR': 
            case 'URGENT':
                return 'urgent';
            case 'WARNING': 
                return 'urgent';
            case 'SUCCESS': 
                return 'success';
            case 'INFO':
            default: 
                return 'info';
        }
    }

    // Fonction pour mapper les statuts backend vers frontend
    private mapBackendStatus(backendStatus: string): boolean {
        // Le backend utilise "READ" et "UNREAD" (ou "read" et "unread")
        return backendStatus?.toUpperCase() === 'READ';
    }

    // Fonction pour mapper les données backend vers le format frontend
    private mapBackendAlerte(backendAlerte: any): Alerte {
        return {
            id: String(backendAlerte.id),
            titre: backendAlerte.titre || 'Alerte',
            message: backendAlerte.message || '',
            contenu: backendAlerte.message || '',
            niveau: this.mapBackendType(backendAlerte.type),
            type: this.mapBackendType(backendAlerte.type),
            lue: this.mapBackendStatus(backendAlerte.status),
            status: backendAlerte.status,
            dateCreation: backendAlerte.dateCreation,
            createdAt: backendAlerte.dateCreation,
            employeId: String(backendAlerte.employeId || backendAlerte.userId),
            userId: String(backendAlerte.userId || backendAlerte.employeId)
        };
    }

    // Fonction utilitaire pour créer une requête avec timeout et retry
    private async fetchWithTimeout(
        url: string, 
        options: RequestInit & { timeout?: number; retries?: number } = {}
    ): Promise<Response> {
        const { timeout = config.requestTimeout, retries = 2, ...fetchOptions } = options;
        
        // Créer un AbortController pour le timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => {
            controller.abort();
        }, timeout);

        try {
            const response = await fetch(url, {
                ...fetchOptions,
                signal: controller.signal,
                headers: {
                    ...this.getAuthHeaders(),
                    ...fetchOptions.headers,
                }
            });

            clearTimeout(timeoutId);
            return response;
            
        } catch (error) {
            clearTimeout(timeoutId);
            
            // Si c'est une erreur d'abort (timeout) et qu'il reste des retries
            if (error instanceof Error && error.name === 'AbortError' && retries > 0) {
                console.warn(`Requête timeout, retry ${3 - retries}/2...`);
                await new Promise(resolve => setTimeout(resolve, 1000 * (3 - retries))); // Délai progressif
                return this.fetchWithTimeout(url, { ...options, retries: retries - 1 });
            }
            
            // Si c'est une erreur réseau et qu'il reste des retries
            if (error instanceof TypeError && error.message.includes('fetch') && retries > 0) {
                console.warn(`Erreur réseau, retry ${3 - retries}/2...`);
                await new Promise(resolve => setTimeout(resolve, 2000 * (3 - retries))); // Délai plus long pour réseau
                return this.fetchWithTimeout(url, { ...options, retries: retries - 1 });
            }
            
            throw error;
        }
    }

    async getAlertes(employeId: string, page: number = 0, size: number = 50): Promise<AlerteResponse> {
        try {
            console.log('🔍 Fetching alertes for employeId:', employeId);
            
            // Convertir employeId en Long pour le backend
            const employeIdLong = parseInt(employeId);
            if (isNaN(employeIdLong)) {
                throw new Error('EmployeId doit être un nombre valide');
            }

            const url = `${API_BASE_URL}/api/alertes/employe/${employeIdLong}`;
            console.log('📡 URL appelée:', url);
            
            const response = await this.fetchWithTimeout(url, {
                method: 'GET',
                timeout: 10000,
            });

            console.log('📊 Status de la réponse:', response.status);
            if (!response.ok) {
                if (response.status === 401) {
                    throw new Error('Non autorisé - Vérifiez votre token d\'authentification');
                }
                if (response.status === 403) {
                    throw new Error('Accès interdit - Permissions insuffisantes');
                }
                if (response.status === 404) {
                    throw new Error('Employé non trouvé');
                }
                throw new Error(`Erreur serveur: ${response.status} ${response.statusText}`);
            }

            const backendData = await response.json();
            console.log('✅ Données reçues du backend:', backendData);
            
            // Le backend renvoie directement une List<AlerteDTO>
            if (Array.isArray(backendData)) {
                const mappedAlertes = backendData.map(this.mapBackendAlerte.bind(this));
                
                return {
                    alertes: mappedAlertes,
                    totalElements: mappedAlertes.length,
                    totalPages: Math.ceil(mappedAlertes.length / size),
                    currentPage: page
                };
            } else {
                console.warn('⚠️ Format de réponse inattendu:', backendData);
                return {
                    alertes: [],
                    totalElements: 0,
                    totalPages: 0,
                    currentPage: 0
                };
            }
        } catch (error) {
            console.error('❌ Erreur getAlertes:', error);
            // En cas d'erreur, retourner une réponse vide
            return {
                alertes: [],
                totalElements: 0,
                totalPages: 0,
                currentPage: 0
            };
        }
    }

    async marquerCommeLue(alerteId: string): Promise<void> {
        try {
            // Convertir alerteId en Long pour le backend
            const alerteIdLong = parseInt(alerteId);
            if (isNaN(alerteIdLong)) {
                throw new Error('AlerteId doit être un nombre valide');
            }

            const url = `${API_BASE_URL}/api/alertes/${alerteIdLong}/lu`;
            console.log('📡 Marquage comme lue:', url);
            
            const response = await this.fetchWithTimeout(url, {
                method: 'PATCH',
                timeout: 5000,
            });

            if (!response.ok) {
                if (response.status === 401) {
                    throw new Error('Non autorisé - Vérifiez votre token d\'authentification');
                }
                if (response.status === 404) {
                    throw new Error('Alerte non trouvée');
                }
                throw new Error(`Erreur lors du marquage: ${response.status} ${response.statusText}`);
            }

            console.log(`✅ Alerte ${alerteId} marquée comme lue`);
            
        } catch (error) {
            console.error('❌ Erreur marquerCommeLue:', error);
            throw error;
        }
    }

    async supprimerAlerte(alerteId: string): Promise<void> {
        try {
            // Convertir alerteId en Long pour le backend
            const alerteIdLong = parseInt(alerteId);
            if (isNaN(alerteIdLong)) {
                throw new Error('AlerteId doit être un nombre valide');
            }

            const url = `${API_BASE_URL}/api/alertes/${alerteIdLong}`;
            console.log('🗑️ Suppression alerte:', url);
            
            const response = await this.fetchWithTimeout(url, {
                method: 'DELETE',
                timeout: 5000,
            });

            if (!response.ok) {
                if (response.status === 401) {
                    throw new Error('Non autorisé - Vérifiez votre token d\'authentification');
                }
                if (response.status === 404) {
                    throw new Error('Alerte non trouvée');
                }
                throw new Error(`Erreur lors de la suppression: ${response.status} ${response.statusText}`);
            }

            console.log(`✅ Alerte ${alerteId} supprimée`);
        } catch (error) {
            console.error('❌ Erreur supprimerAlerte:', error);
            throw error;
        }
    }

    async creerAlerte(alerte: CreateAlerteRequest): Promise<Alerte> {
        try {
            // Adapter les données pour le backend
            const backendAlerte = {
                titre: alerte.titre,
                message: alerte.message || alerte.contenu,
                type: alerte.type?.toUpperCase() || 'INFO',
                status: 'UNREAD', // Le backend attend "UNREAD" pour les nouvelles alertes
                userId: parseInt(alerte.userId || alerte.employeId || '0'),
                employeId: parseInt(alerte.employeId || alerte.userId || '0')
            };

            console.log('🚀 Création alerte:', backendAlerte);

            const response = await this.fetchWithTimeout(
                `${API_BASE_URL}/api/alertes`, 
                {
                    method: 'POST',
                    body: JSON.stringify(backendAlerte),
                    timeout: 8000,
                }
            );

            if (!response.ok) {
                if (response.status === 401) {
                    throw new Error('Non autorisé - Vérifiez votre token d\'authentification');
                }
                if (response.status === 400) {
                    const errorData = await response.json().catch(() => ({}));
                    throw new Error(`Données invalides: ${errorData.message || response.statusText}`);
                }
                throw new Error(`Erreur lors de la création: ${response.status} ${response.statusText}`);
            }

            const nouvelleAlerte = await response.json();
            console.log('✅ Alerte créée:', nouvelleAlerte);
            
            // Mapper la réponse backend vers le format frontend
            return this.mapBackendAlerte(nouvelleAlerte);
            
        } catch (error) {
            console.error('❌ Erreur creerAlerte:', error);
            throw error;
        }
    }

    async getCompteNonLues(employeId: string): Promise<number> {
        try {
            // Convertir employeId en Long pour le backend
            const employeIdLong = parseInt(employeId);
            if (isNaN(employeIdLong)) {
                throw new Error('EmployeId doit être un nombre valide');
            }

            const url = `${API_BASE_URL}/api/alertes/employe/${employeIdLong}/non-lues/count`;
            console.log('🔢 Comptage alertes non lues:', url);
            
            const response = await this.fetchWithTimeout(url, {
                method: 'GET',
                timeout: 5000,
            });

            if (!response.ok) {
                if (response.status === 401) {
                    console.warn('⚠️ Non autorisé pour compter les alertes non lues');
                    return 0;
                }
                if (response.status === 404) {
                    console.warn('⚠️ Employé non trouvé pour le comptage');
                    return 0;
                }
                throw new Error(`Erreur lors du comptage: ${response.status} ${response.statusText}`);
            }

            // Le backend renvoie directement un Long
            const count = await response.json();
            console.log(`✅ Alertes non lues: ${count}`);
            
            return typeof count === 'number' ? count : parseInt(count) || 0;
        } catch (error) {
            console.error('❌ Erreur getCompteNonLues:', error);
            return 0;
        }
    }

    async getAlertesRecentes(employeId: string): Promise<Alerte[]> {
        try {
            // Convertir employeId en Long pour le backend
            const employeIdLong = parseInt(employeId);
            if (isNaN(employeIdLong)) {
                throw new Error('EmployeId doit être un nombre valide');
            }

            const url = `${API_BASE_URL}/api/alertes/employe/${employeIdLong}/recentes`;
            console.log('⏰ Récupération alertes récentes:', url);
            
            const response = await this.fetchWithTimeout(url, {
                method: 'GET',
                timeout: 5000,
            });

            if (!response.ok) {
                if (response.status === 401) {
                    console.warn('⚠️ Non autorisé pour récupérer les alertes récentes');
                    return [];
                }
                if (response.status === 404) {
                    console.warn('⚠️ Employé non trouvé pour les alertes récentes');
                    return [];
                }
                throw new Error(`Erreur lors de la récupération: ${response.status} ${response.statusText}`);
            }

            const backendData = await response.json();
            console.log('✅ Alertes récentes reçues:', backendData);
            
            if (Array.isArray(backendData)) {
                return backendData.map(this.mapBackendAlerte.bind(this));
            } else {
                console.warn('⚠️ Format de réponse inattendu pour les alertes récentes');
                return [];
            }
        } catch (error) {
            console.error('❌ Erreur getAlertesRecentes:', error);
            return [];
        }
    }

    async getAlertesParStatut(employeId: string, status: 'read' | 'unread' | 'READ' | 'UNREAD'): Promise<Alerte[]> {
        try {
            // Convertir employeId en Long pour le backend
            const employeIdLong = parseInt(employeId);
            if (isNaN(employeIdLong)) {
                throw new Error('EmployeId doit être un nombre valide');
            }

            // Normaliser le status
            const normalizedStatus = status.toUpperCase();
            const url = `${API_BASE_URL}/api/alertes/employe/${employeIdLong}/statut/${normalizedStatus}`;
            console.log('🔍 Récupération alertes par statut:', url);
            
            const response = await this.fetchWithTimeout(url, {
                method: 'GET',
                timeout: 5000,
            });

            if (!response.ok) {
                if (response.status === 401) {
                    console.warn('⚠️ Non autorisé pour récupérer les alertes par statut');
                    return [];
                }
                if (response.status === 404) {
                    console.warn('⚠️ Employé non trouvé pour les alertes par statut');
                    return [];
                }
                throw new Error(`Erreur lors de la récupération: ${response.status} ${response.statusText}`);
            }

            const backendData = await response.json();
            console.log('✅ Alertes par statut reçues:', backendData);
            
            if (Array.isArray(backendData)) {
                return backendData.map(this.mapBackendAlerte.bind(this));
            } else {
                console.warn('⚠️ Format de réponse inattendu pour les alertes par statut');
                return [];
            }
        } catch (error) {
            console.error('❌ Erreur getAlertesParStatut:', error);
            return [];
        }
    }

    async getAlerteParId(alerteId: string): Promise<Alerte | null> {
        try {
            // Convertir alerteId en Long pour le backend
            const alerteIdLong = parseInt(alerteId);
            if (isNaN(alerteIdLong)) {
                throw new Error('AlerteId doit être un nombre valide');
            }

            const url = `${API_BASE_URL}/api/alertes/${alerteIdLong}`;
            console.log('🔍 Récupération alerte par ID:', url);
            
            const response = await this.fetchWithTimeout(url, {
                method: 'GET',
                timeout: 5000,
            });

            if (!response.ok) {
                if (response.status === 401) {
                    throw new Error('Non autorisé - Vérifiez votre token d\'authentification');
                }
                if (response.status === 404) {
                    console.warn('⚠️ Alerte non trouvée');
                    return null;
                }
                throw new Error(`Erreur lors de la récupération: ${response.status} ${response.statusText}`);
            }

            const backendData = await response.json();
            console.log('✅ Alerte récupérée:', backendData);
            
            return this.mapBackendAlerte(backendData);
        } catch (error) {
            console.error('❌ Erreur getAlerteParId:', error);
            return null;
        }
    }

    // Méthode de test pour générer des alertes factices
    async getTestAlertes(employeId: string): Promise<AlerteResponse> {
        console.log('🧪 Génération d\'alertes de test pour employeId:', employeId);
        
        const testAlertes: Alerte[] = [
            {
                id: '1',
                titre: 'Alerte de test 1',
                message: 'Ceci est une alerte de test de type info',
                contenu: 'Ceci est une alerte de test de type info',
                niveau: 'info',
                type: 'info',
                lue: false,
                status: 'UNREAD',
                dateCreation: new Date().toISOString(),
                createdAt: new Date().toISOString(),
                employeId: employeId,
                userId: employeId
            },
            {
                id: '2',
                titre: 'Alerte urgente',
                message: 'Ceci est une alerte urgente de test',
                contenu: 'Ceci est une alerte urgente de test',
                niveau: 'urgent',
                type: 'urgent',
                lue: false,
                status: 'UNREAD',
                dateCreation: new Date(Date.now() - 3600000).toISOString(), // Il y a 1h
                createdAt: new Date(Date.now() - 3600000).toISOString(),
                employeId: employeId,
                userId: employeId
            },
            {
                id: '3',
                titre: 'Alerte succès',
                message: 'Opération terminée avec succès',
                contenu: 'Opération terminée avec succès',
                niveau: 'success',
                type: 'success',
                lue: true,
                status: 'READ',
                dateCreation: new Date(Date.now() - 7200000).toISOString(), // Il y a 2h
                createdAt: new Date(Date.now() - 7200000).toISOString(),
                employeId: employeId,
                userId: employeId
            }
        ];

        return {
            alertes: testAlertes,
            totalElements: testAlertes.length,
            totalPages: 1,
            currentPage: 0
        };
    }
}

export const alertesApiService = new AlertesApiService();