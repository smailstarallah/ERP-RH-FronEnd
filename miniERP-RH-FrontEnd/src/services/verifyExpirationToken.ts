import { jwtDecode } from 'jwt-decode';

interface DecodedToken {
    exp: number;
    [key: string]: any;
}

export const VerifyToken = (): boolean => {
    const token = localStorage.getItem('token');
    const tokenExpiration = localStorage.getItem('tokenExpiration');

    if (!token) {
        return false;
    }

    try {
        // Vérification basée sur le timestamp d'expiration que nous avons stocké
        if (tokenExpiration) {
            const expirationTime = parseInt(tokenExpiration);
            if (Date.now() > expirationTime) {
                // Token expiré, nettoyer le localStorage
                localStorage.removeItem('token');
                localStorage.removeItem('refreshToken');
                localStorage.removeItem('userData');
                localStorage.removeItem('tokenExpiration');
                return false;
            }
        } else {
            // Fallback sur le décodage JWT si le timestamp n'est pas disponible
            const decodedToken: DecodedToken = jwtDecode(token);
            const currentTime = Date.now() / 1000;
            if (decodedToken.exp < currentTime) {
                localStorage.removeItem('token');
                localStorage.removeItem('refreshToken');
                localStorage.removeItem('userData');
                localStorage.removeItem('tokenExpiration');
                return false;
            }
        }
        return true;
    } catch (error) {
        console.error("Erreur lors du décodage du token:", error);
        localStorage.removeItem('token');
        return false;
    }
};