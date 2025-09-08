import EmployeesParDepartement from './Components/EmployeesParDepartement';
import { FileText } from 'lucide-react';

const FichePaiePage = () => {
    return (
        <div className="min-h-screen bg-slate-50">
            <div className="max-w-7xl mx-auto p-4">
                {/* En-tête institutionnel compact */}
                <div className="mb-4">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                            <FileText className="w-5 h-5 text-white" />
                        </div>
                        <h1 className="text-xl font-semibold text-slate-900">Gestion des Fiches de Paie</h1>
                    </div>
                    <p className="text-sm text-slate-600">Administration et traitement des rémunérations</p>
                </div>

                {/* Contenu principal */}
                <div className="bg-white rounded-lg border border-slate-200 shadow-sm">
                    <EmployeesParDepartement />
                </div>
            </div>
        </div>
    )
}

export default FichePaiePage;