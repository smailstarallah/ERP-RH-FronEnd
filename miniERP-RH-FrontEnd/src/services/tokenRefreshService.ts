/**
 * Service de gestion de renouvellement automatique des tokens
 */

interface RefreshTokenResponse {
    success: boolean;
    data?: {
        accessToken: string;
        refreshToken: string;
        expiresIn: number;
        user: any;
    };
    message?: string;
}

export class TokenRefreshService {
    private static isRefreshing = false;
    private static refreshPromise: Promise<boolean> | null = null;

    /**
     * Tente de renouveler le token automatiquement
     */
    static async refreshToken(): Promise<boolean> {
        // Éviter les appels multiples simultanés
        if (this.isRefreshing && this.refreshPromise) {
            return this.refreshPromise;
        }

        this.isRefreshing = true;

        this.refreshPromise = this.performRefresh();
        const result = await this.refreshPromise;

        this.isRefreshing = false;
        this.refreshPromise = null;

        return result;
    }

    private static async performRefresh(): Promise<boolean> {
        try {
            const refreshToken = localStorage.getItem('refreshToken') || sessionStorage.getItem('refreshToken');

            if (!refreshToken) {
                console.warn('[TokenRefresh] Aucun refresh token trouvé');
                return false;
            }

            console.log('[TokenRefresh] Tentative de renouvellement du token...');

            const response = await fetch('/api/auth/refresh', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ refreshToken })
            });

            if (!response.ok) {
                console.error('[TokenRefresh] Erreur HTTP:', response.status);
                return false;
            }

            const responseData: RefreshTokenResponse = await response.json();

            if (!responseData.success || !responseData.data) {
                console.error('[TokenRefresh] Réponse invalide:', responseData.message);
                return false;
            }

            // Déterminer le type de stockage (localStorage ou sessionStorage)
            const storage = localStorage.getItem('token') ? localStorage : sessionStorage;

            // Mettre à jour les tokens
            storage.setItem('token', responseData.data.accessToken);
            storage.setItem('refreshToken', responseData.data.refreshToken);
            storage.setItem('userData', JSON.stringify(responseData.data.user));
            storage.setItem('tokenExpiration', (Date.now() + responseData.data.expiresIn * 1000).toString());

            console.log('[TokenRefresh] Token renouvelé avec succès');
            return true;

        } catch (error) {
            console.error('[TokenRefresh] Erreur lors du renouvellement:', error);
            return false;
        }
    }

    /**
     * Nettoie les tokens expirés et redirige vers login
     */
    static handleTokenExpiration(): void {
        console.log('[TokenRefresh] Token expiré, nettoyage et redirection');

        // Nettoyer tous les tokens
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('userData');
        localStorage.removeItem('tokenExpiration');

        sessionStorage.removeItem('token');
        sessionStorage.removeItem('refreshToken');
        sessionStorage.removeItem('userData');
        sessionStorage.removeItem('tokenExpiration');

        // Rediriger vers login
        window.location.href = '/login';
    }

    /**
     * Intercepte les erreurs 403/401 et tente un refresh automatique
     */
    static async handleAuthError(): Promise<boolean> {
        console.log('[TokenRefresh] Erreur 403/401 détectée, tentative de refresh...');

        // Vérifier si on a au moins un refresh token avant de tenter
        const refreshToken = localStorage.getItem('refreshToken') || sessionStorage.getItem('refreshToken');
        if (!refreshToken) {
            console.warn('[TokenRefresh] Aucun refresh token - déconnexion nécessaire');
            this.handleTokenExpiration();
            return false;
        }

        const refreshSuccess = await this.refreshToken();

        if (!refreshSuccess) {
            console.error('[TokenRefresh] Échec du refresh - déconnexion');
            this.handleTokenExpiration();
            return false;
        }

        console.log('[TokenRefresh] Refresh réussi - requête peut être relancée');
        return true;
    }
}
