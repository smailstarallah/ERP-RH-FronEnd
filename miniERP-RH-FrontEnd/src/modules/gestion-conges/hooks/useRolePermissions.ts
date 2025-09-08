import { useState, useEffect } from 'react';
import { getCurrentUserRole } from '../../../services/authService';

export type UserRole = 'EMPLOYE' | 'MANAGER' | 'RH';

export interface RolePermissions {
    canViewValidation: boolean;
    canViewSolde: boolean;
    canMakeRequest: boolean;
    canViewHistory: boolean;
    canViewAnalytics: boolean;
}

export const useRolePermissions = () => {
    const [userRole, setUserRole] = useState<UserRole>('EMPLOYE');
    const [permissions, setPermissions] = useState<RolePermissions>({
        canViewValidation: false,
        canViewSolde: false,
        canMakeRequest: false,
        canViewHistory: false,
        canViewAnalytics: false,
    });

    useEffect(() => {
        const role = getCurrentUserRole() as UserRole;
        setUserRole(role);

        // Définir les permissions selon le rôle
        const rolePermissions: Record<UserRole, RolePermissions> = {
            EMPLOYE: {
                canViewValidation: false,
                canViewSolde: true,
                canMakeRequest: true,
                canViewHistory: true,
                canViewAnalytics: false,
            },
            MANAGER: {
                canViewValidation: true,
                canViewSolde: false,
                canMakeRequest: false,
                canViewHistory: true,
                canViewAnalytics: false,
            },
            RH: {
                canViewValidation: true,
                canViewSolde: false,
                canMakeRequest: false,
                canViewHistory: true,
                canViewAnalytics: true,
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
