import EmployeesParDepartement from './Components/EmployeesParDepartement';
import EmployeePayslipsList from './Components/EmployeePayslipsList';
import { useFichePaieRolePermissions } from './hooks/useFichePaieRolePermissions';
import { FileText, User, Users } from 'lucide-react';

const FichePaiePage = () => {
    const { userRole, permissions, hasAnyPermission, isRH } = useFichePaieRolePermissions();

    return (
        <div className="min-h-screen bg-slate-50">
            <div className="max-w-7xl mx-auto p-4">
                {/* En-tête institutionnel compact */}
                <div className="mb-4">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                            <FileText className="w-5 h-5 text-white" />
                        </div>
                        <h1 className="text-xl font-semibold text-slate-900">
                            {isRH() ? 'Gestion des Fiches de Paie' : 'Mes Fiches de Paie'}
                        </h1>
                    </div>
                    <p className="text-sm text-slate-600">
                        {isRH()
                            ? 'Administration et traitement des rémunérations'
                            : 'Consultation de vos bulletins de salaire'
                        }
                    </p>
                </div>

                {/* Indicateur de rôle */}
                <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-3 mb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                            {isRH() ? <Users className="w-4 h-4 text-white" /> : <User className="w-4 h-4 text-white" />}
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-slate-900">
                                Rôle actuel :
                            </span>
                            <span className="px-2 py-1 text-xs font-medium rounded bg-blue-100 text-blue-800">
                                {userRole}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Message si aucun accès */}
                {!hasAnyPermission() && (
                    <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-4 mb-4">
                        <div className="text-center">
                            <h3 className="text-lg font-semibold text-slate-900 mb-2">
                                Accès limité
                            </h3>
                            <p className="text-sm text-slate-600">
                                Votre rôle ({userRole}) ne dispose pas d'autorisations pour le module de fiche de paie.
                            </p>
                        </div>
                    </div>
                )}

                {/* Contenu principal basé sur le rôle */}
                {hasAnyPermission() && (
                    <div className="space-y-4">
                        {/* Vue RH - Liste des employés par département */}
                        {permissions.canViewAllEmployees && (
                            <div className="bg-white rounded-lg border border-slate-200 shadow-sm">
                                <EmployeesParDepartement />
                            </div>
                        )}

                        {/* Vue Employé - Ses propres fiches de paie */}
                        {permissions.canViewOwnPayslips && !permissions.canViewAllEmployees && (
                            <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-4">
                                <EmployeePayslipsList />
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}

export default FichePaiePage;