import { useState, useEffect } from 'react';
import { getCurrentUserRole } from '../../../services/authService';

export type UserRole = 'EMPLOYE' | 'MANAGER' | 'RH';

export interface TimeTrackingPermissions {
    canTrackOwnTime: boolean;        // Pointer son propre temps
    canViewOwnStats: boolean;        // Voir ses propres statistiques
    canViewTeamPresence: boolean;    // Voir la présence de l'équipe
    canViewTeamStats: boolean;       // Voir les statistiques de l'équipe
    canManageProjects: boolean;      // Gérer les projets et tâches
    canViewAnalytics: boolean;       // Voir les analyses globales
}

export const useTimeTrackingRolePermissions = () => {
    const [userRole, setUserRole] = useState<UserRole>('EMPLOYE');
    const [permissions, setPermissions] = useState<TimeTrackingPermissions>({
        canTrackOwnTime: false,
        canViewOwnStats: false,
        canViewTeamPresence: false,
        canViewTeamStats: false,
        canManageProjects: false,
        canViewAnalytics: false,
    });

    useEffect(() => {
        const role = getCurrentUserRole() as UserRole;
        setUserRole(role);

        // Définir les permissions selon le rôle pour le time tracking
        const rolePermissions: Record<UserRole, TimeTrackingPermissions> = {
            EMPLOYE: {
                canTrackOwnTime: true,        // Peut pointer son temps
                canViewOwnStats: true,        // Peut voir ses propres stats
                canViewTeamPresence: false,   // Ne peut pas voir l'équipe
                canViewTeamStats: false,      // Ne peut pas voir les stats équipe
                canManageProjects: false,     // Ne peut pas gérer les projets
                canViewAnalytics: false,      // Pas d'accès aux analyses
            },
            MANAGER: {
                canTrackOwnTime: false,        // Peut pointer son temps
                canViewOwnStats: false,        // Peut voir ses propres stats
                canViewTeamPresence: true,    // Peut voir la présence équipe
                canViewTeamStats: true,       // Peut voir les stats équipe
                canManageProjects: true,      // Peut gérer les projets
                canViewAnalytics: false,      // Analyses limitées
            },
            RH: {
                canTrackOwnTime: false,       // RH ne pointe pas (rôle administratif)
                canViewOwnStats: false,       // Pas de stats personnelles
                canViewTeamPresence: true,    // Peut voir toute la présence
                canViewTeamStats: true,       // Peut voir toutes les stats
                canManageProjects: true,      // Peut gérer tous les projets
                canViewAnalytics: true,       // Accès complet aux analyses
            },
        };

        setPermissions(rolePermissions[role] || rolePermissions.EMPLOYE);
    }, []);

    return {
        userRole,
        permissions,
        hasAnyPermission: () => {
            return Object.values(permissions).some(permission => permission);
        }
    };
};
