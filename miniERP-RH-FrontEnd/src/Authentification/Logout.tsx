import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export const Logout = () => {
    const navigate = useNavigate();
    const token = localStorage.getItem('token');
    if (!token) {
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
