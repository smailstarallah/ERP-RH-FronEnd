import { useState, useEffect } from 'react';

interface FichePaiePermissions {
    canViewAllEmployees: boolean;
    canViewOwnPayslips: boolean;
    canGeneratePayslips: boolean;
    canManagePayrollElements: boolean
    canExportPayslips: boolean;
}

export const useFichePaieRolePermissions = () => {
    const [userRole, setUserRole] = useState<string>('');
    const [permissions, setPermissions] = useState<FichePaiePermissions>({
        canViewAllEmployees: false,
        canViewOwnPayslips: false,
        canGeneratePayslips: false,
        canManagePayrollElements: false,
        canExportPayslips: false
    });

    useEffect(() => {
        // Récupérer le rôle depuis localStorage
        const userData = localStorage.getItem('userData');
        let role = '';

        if (userData) {
            try {
                const parsed = JSON.parse(userData);
                role = parsed.userType || parsed.role || 'EMPLOYE';
            } catch (error) {
                console.error('Erreur lors du parsing des données utilisateur:', error);
                role = 'EMPLOYE';
            }
        }

        setUserRole(role);

        // Définir les permissions selon le rôle
        const newPermissions: FichePaiePermissions = {
            canViewAllEmployees: false,
            canViewOwnPayslips: false,
            canGeneratePayslips: false,
            canManagePayrollElements: false,
            canExportPayslips: false
        };

        switch (role.toUpperCase()) {
            case 'RH':
            case 'ADMIN':
                // RH a tous les droits
                newPermissions.canViewAllEmployees = true;
                newPermissions.canViewOwnPayslips = true;
                newPermissions.canGeneratePayslips = true;
                newPermissions.canManagePayrollElements = true;
                newPermissions.canExportPayslips = true;
                break;

            case 'MANAGER':

                // Manager peut voir son équipe et ses propres fiches
                newPermissions.canViewOwnPayslips = true;
                break;

            case 'EMPLOYE':
            default:
                // Employé ne peut voir que ses propres fiches
                newPermissions.canViewOwnPayslips = true;
                break;
        }

        setPermissions(newPermissions);
    }, []);

    // Fonction utilitaire pour vérifier si l'utilisateur a au moins une permission
    const hasAnyPermission = (): boolean => {
        return Object.values(permissions).some(permission => permission === true);
    };

    // Fonction pour vérifier si l'utilisateur est RH
    const isRH = (): boolean => {
        return ['RH', 'ADMIN'].includes(userRole.toUpperCase());
    };

    // Fonction pour vérifier si l'utilisateur est un employé simple
    const isEmployee = (): boolean => {
        return userRole.toUpperCase() === 'EMPLOYE';
    };

    return {
        userRole,
        permissions,
        hasAnyPermission,
        isRH,
        isEmployee
    };
};
