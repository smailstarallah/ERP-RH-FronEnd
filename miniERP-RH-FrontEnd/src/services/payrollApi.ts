// Service API pour les données de paie
export interface PayrollApiResponse {
    kpis: {
        masseSalariale: { value: number; change: number };
        pourcentageCA: { value: number; change: number };
        tauxErreur: { value: number; change: number };
        coutBulletin: { value: number; change: number };
    };
    salaryStructure: Array<{
        category: string;
        montant: number;
        pourcentage: number;
    }>;
    salaryEvolution: Array<{
        month: string;
        masseSalariale: number;
        budget: number;
        coutParEmploye: number;
    }>;
    salaryDistribution: Array<{
        departement: string;
        nombreEmployes: number;
        masseSalariale: number;
        salaireMoyen: number;
        tranches: {
            'moins_5000': number;
            '_5000_8000': number;
            '_8000_12000': number;
            '_12000_20000': number;
            'plus_20000': number;
        };
    }>;
    payrollQuality: Array<{
        month: string;
        tauxErreur: number;
        tempsTraitement: number;
    }>;
    variableElements: Array<{
        element: string;
        budget: number;
        consomme: number;
        taux: number;
        impact: string;
    }>;
    complianceActions: Array<{
        id: string;
        title: string;
        description: string;
        priority: 'urgent' | 'attention' | 'opportunity' | 'success';
        deadline?: string;
        progress?: number;
        actions: string[];
    }>;
    lastUpdate: string;
    status: 'loading' | 'success' | 'error';
}

// Configuration de l'API
const API_CONFIG = {
    BASE_URL: process.env.NODE_ENV === 'development'
        ? 'http://localhost:8080/api'
        : '/api', // En production, utiliser un chemin relatif
    ENDPOINTS: {
        PAYROLL_DATA: '/fiche-paie/dashboard',
    },
    TIMEOUT: 10000, // 10 secondes
    RETRY_ATTEMPTS: 3,
    RETRY_DELAY: 1000, // 1 seconde
};

// Gestionnaire de token d'authentification
class AuthManager {
    private static instance: AuthManager;
    private token: string | null = null;

    private constructor() {
        // Récupérer le token depuis localStorage au démarrage
        this.token = localStorage.getItem('authToken');
    }

    public static getInstance(): AuthManager {
        if (!AuthManager.instance) {
            AuthManager.instance = new AuthManager();
        }
        return AuthManager.instance;
    }

    public setToken(token: string): void {
        this.token = token;
        localStorage.setItem('authToken', token);
    }

    public getToken(): string | null {
        return this.token;
    }

    public clearToken(): void {
        this.token = null;
        localStorage.removeItem('authToken');
    }

    public isAuthenticated(): boolean {
        return this.token !== null;
    }
}

// Utilitaire pour les délais
const delay = (ms: number): Promise<void> =>
    new Promise(resolve => setTimeout(resolve, ms));

// Service API principal
export class PayrollApiService {
    private authManager: AuthManager;

    constructor() {
        this.authManager = AuthManager.getInstance();
    }

    private async makeRequest<T>(url: string, options: RequestInit = {}): Promise<T> {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT);

        try {
            const headers: Record<string, string> = {
                'Content-Type': 'application/json',
                'Authorization': localStorage.getItem('token') ? `Bearer ${localStorage.getItem('token')}` : '',
                ...(options.headers as Record<string, string>),
            };

            // Ajouter le token d'authentification si disponible
            const token = this.authManager.getToken();
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            const response = await fetch(url, {
                ...options,
                headers,
                signal: controller.signal,
                credentials: 'include', // Pour les cookies de session
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                await this.handleApiError(response);
            }

            const data = await response.json();
            console.log('Données reçues de l\'API:', data);
            return data;
        } catch (error) {
            clearTimeout(timeoutId);
            if (error instanceof Error && error.name === 'AbortError') {
                throw new Error('Délai d\'attente dépassé - Le serveur ne répond pas');
            }
            throw error;
        }
    }

    private async handleApiError(response: Response): Promise<never> {
        let errorMessage = `Erreur HTTP ${response.status}`;

        try {
            const errorData = await response.json();
            errorMessage = errorData.message || errorData.error || errorMessage;
        } catch {
            // Si on ne peut pas parser la réponse JSON, utiliser le message par défaut
        }

        switch (response.status) {
            case 401:
                this.authManager.clearToken();
                throw new Error('Session expirée - Veuillez vous reconnecter');
            case 403:
                throw new Error('Accès refusé - Permissions insuffisantes');
            case 404:
                throw new Error('Service non trouvé - Vérifiez la configuration de l\'API');
            case 500:
                throw new Error('Erreur serveur - Veuillez réessayer plus tard');
            case 502:
                throw new Error('Passerelle invalide - Service temporairement indisponible');
            case 503:
                throw new Error('Service indisponible - Maintenance en cours');
            default:
                throw new Error(errorMessage);
        }
    }

    private async retryRequest<T>(
        requestFn: () => Promise<T>,
        attempts: number = API_CONFIG.RETRY_ATTEMPTS
    ): Promise<T> {
        let lastError: Error;

        for (let i = 0; i < attempts; i++) {
            try {
                return await requestFn();
            } catch (error) {
                lastError = error instanceof Error ? error : new Error('Erreur inconnue');

                // Ne pas réessayer pour les erreurs d'authentification ou d'autorisation
                if (lastError.message.includes('Session expirée') ||
                    lastError.message.includes('Accès refusé')) {
                    throw lastError;
                }

                // Attendre avant de réessayer (sauf pour la dernière tentative)
                if (i < attempts - 1) {
                    await delay(API_CONFIG.RETRY_DELAY * (i + 1)); // Délai exponentiel
                }
            }
        }

        throw lastError!;
    }

    public async fetchPayrollData(): Promise<PayrollApiResponse> {
        const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PAYROLL_DATA}`;

        return this.retryRequest(async () => {
            const data = await this.makeRequest<PayrollApiResponse>(url);

            // Validation des données
            this.validatePayrollData(data);

            return {
                ...data,
                status: 'success',
                lastUpdate: data.lastUpdate || new Date().toISOString(),
            };
        });
    }

    private validatePayrollData(data: any): asserts data is PayrollApiResponse {
        if (!data || typeof data !== 'object') {
            throw new Error('Format de données invalide reçu de l\'API');
        }

        const requiredFields = ['kpis', 'salaryStructure', 'salaryEvolution'];
        for (const field of requiredFields) {
            if (!(field in data)) {
                throw new Error(`Champ requis manquant: ${field}`);
            }
        }

        // Validation des KPIs
        if (!data.kpis || typeof data.kpis !== 'object') {
            throw new Error('Données KPIs invalides');
        }

        const requiredKpis = ['masseSalariale', 'pourcentageCA', 'tauxErreur', 'coutBulletin'];
        for (const kpi of requiredKpis) {
            if (!(kpi in data.kpis) ||
                typeof data.kpis[kpi] !== 'object' ||
                typeof data.kpis[kpi].value !== 'number') {
                throw new Error(`KPI invalide: ${kpi}`);
            }
        }

        // Validation des tableaux
        const arrayFields = ['salaryStructure', 'salaryEvolution'];
        for (const field of arrayFields) {
            if (!Array.isArray(data[field])) {
                throw new Error(`Le champ ${field} doit être un tableau`);
            }
        }

        // Validation optionnelle pour salaryDistribution
        if (data.salaryDistribution && !Array.isArray(data.salaryDistribution)) {
            throw new Error('Le champ salaryDistribution doit être un tableau');
        }
    }

    public setAuthToken(token: string): void {
        this.authManager.setToken(token);
    }

    public clearAuthToken(): void {
        this.authManager.clearToken();
    }

    public isAuthenticated(): boolean {
        return this.authManager.isAuthenticated();
    }
}

// Instance singleton du service
export const payrollApiService = new PayrollApiService();
export default payrollApiService;
