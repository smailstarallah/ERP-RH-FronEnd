import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export const Logout = () => {
    const navigate = useNavigate();
    const token = localStorage.getItem('token');
    if (!token) {
        // Redirection vers la page de connexion si l'utilisateur n'est pas connecté
        window.location.href = '/login';
    }
    useEffect(() => {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('userData');
        localStorage.removeItem('tokenExpiration');
        navigate("/login");
    }, [navigate]);

    return null;
}
