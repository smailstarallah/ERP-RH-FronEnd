import React, { useState, useEffect } from 'react';
import {
    FileText, Download, Calendar,
    Loader2, AlertCircle, RefreshCw, Search,
    CheckCircle2, Clock, AlertTriangle, FileCheck
} from 'lucide-react';
import { useFichePaieRolePermissions } from '../hooks/useFichePaieRolePermissions';

interface Employe {
    nom: string;
    preNom: string;
    email: string;
    telephone: string;
    dateNaissance: string;
}

interface FichePaie {
    id: number;
    periode: string;
    salaireBrut: number;
    salaireNet: number;
    salaireBrutImposable: number;
    salaireNetImposable: number;
    cotisationsPatronales: number;
    cotisationsSalariales: number;
    impotSurLeRevenu: number;
    heuresSupplementaires: number;
    joursTravailles: number;
    dateGeneration: string;
    statut: 'BROUILLON' | 'GENEREE' | 'ENVOYEE' | 'VALIDEE';
    pdfFile?: string;
    employe: Employe;
    elements: any[];
}

interface EmployeePayslipsListProps {
    employeeId?: string;
}

const EmployeePayslipsList: React.FC<EmployeePayslipsListProps> = ({
    employeeId
}) => {
    const { isRH } = useFichePaieRolePermissions();
    const [payslips, setPayslips] = useState<FichePaie[]>([]);
    const [filteredPayslips, setFilteredPayslips] = useState<FichePaie[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');

    const getCurrentEmployeeId = (): string => {
        if (employeeId) return employeeId;
        const userData = localStorage.getItem('userData');
        if (userData) {
            try {
                const parsed = JSON.parse(userData);
                return parsed.id?.toString() || '';
            } catch {
                return '';
            }
        }
        return '';
    };

    const fetchEmployeePayslips = async (isRefresh = false) => {
        try {
            if (isRefresh) {
                setRefreshing(true);
            } else {
                setLoading(true);
            }
            setError(null);
            const empId = getCurrentEmployeeId();
            if (!empId) {
                throw new Error('ID employé non trouvé');
            }
            const token = localStorage.getItem('token') || '';
            const headers: Record<string, string> = {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            };
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }
            const response = await fetch(`http://localhost:8080/api/fiche-paie/employe/${empId}`, { headers });
            if (!response.ok) {
                throw new Error(`Erreur ${response.status}: ${response.statusText}`);
            }
            const apiResponse = await response.json();
            let payslipsArray: FichePaie[] = [];
            if (apiResponse && typeof apiResponse === 'object') {
                if (apiResponse.success && Array.isArray(apiResponse.data)) {
                    payslipsArray = apiResponse.data;
                } else if (Array.isArray(apiResponse.data)) {
                    payslipsArray = apiResponse.data;
                } else if (Array.isArray(apiResponse)) {
                    payslipsArray = apiResponse;
                } else {
                    payslipsArray = [];
                }
            } else {
                payslipsArray = [];
            }
            const validPayslips = payslipsArray.filter(item => item && typeof item === 'object' && item.id && item.periode && typeof item.salaireBrut === 'number');
            const sortedData = validPayslips.sort((a, b) => (b.periode || '').localeCompare(a.periode || ''));
            setPayslips(sortedData);
            setFilteredPayslips(sortedData);
        } catch (err) {
            console.error('Erreur lors du chargement des fiches de paie:', err);
            setError(err instanceof Error ? err.message : 'Erreur inconnue');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchEmployeePayslips();
    }, [employeeId]);

    useEffect(() => {
        let filtered = payslips;
        if (searchQuery) {
            filtered = filtered.filter(payslip => {
                const periodMatch = formatPeriode(payslip.periode).toLowerCase().includes(searchQuery.toLowerCase());
                // Pour les RH, permettre aussi la recherche par statut
                const statusMatch = isRH() && payslip.statut.toLowerCase().includes(searchQuery.toLowerCase());
                return periodMatch || statusMatch;
            });
        }
        // Filtrage par statut uniquement pour les RH
        if (isRH() && statusFilter !== 'all') {
            filtered = filtered.filter(payslip => payslip.statut === statusFilter);
        }
        setFilteredPayslips(filtered);
    }, [searchQuery, statusFilter, payslips, isRH]);

    const parsePeriode = (periode: string): { mois: string; annee: number } => {
        const [year, month] = periode.split('-');
        const monthNumber = parseInt(month, 10);
        const monthNames: { [key: number]: string } = { 1: 'Janvier', 2: 'Février', 3: 'Mars', 4: 'Avril', 5: 'Mai', 6: 'Juin', 7: 'Juillet', 8: 'Août', 9: 'Septembre', 10: 'Octobre', 11: 'Novembre', 12: 'Décembre' };
        return { mois: monthNames[monthNumber] || `Mois ${month}`, annee: parseInt(year, 10) };
    };

    const formatPeriode = (periode: string): string => {
        const { mois, annee } = parsePeriode(periode);
        return `${mois} ${annee}`;
    };

    const formatCurrency = (amount: number): string => {
        return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(amount);
    };

    const getStatusConfig = (statut: string) => {
        switch (statut) {
            case 'BROUILLON': return {
                classes: 'bg-slate-100 text-slate-700',
                icon: <Clock className="w-3.5 h-3.5" />,
                label: 'Brouillon'
            };
            case 'GENEREE': return {
                classes: 'bg-blue-100 text-blue-800',
                icon: <FileCheck className="w-3.5 h-3.5" />,
                label: 'Générée'
            };
            case 'ENVOYEE': return {
                classes: 'bg-amber-100 text-amber-800',
                icon: <AlertTriangle className="w-3.5 h-3.5" />,
                label: 'Envoyée'
            };
            case 'VALIDEE': return {
                classes: 'bg-green-100 text-green-800',
                icon: <CheckCircle2 className="w-3.5 h-3.5" />,
                label: 'Validée'
            };
            default: return {
                classes: 'bg-slate-100 text-slate-700',
                icon: <Clock className="w-3.5 h-3.5" />,
                label: statut
            };
        }
    };

    const downloadPayslip = async (payslip: FichePaie) => {
        try {
            if (payslip.pdfFile) {
                const link = document.createElement('a');
                link.href = `data:application/pdf;base64,${payslip.pdfFile}`;
                link.download = `fiche_paie_${payslip.periode}_${payslip.employe.nom}_${payslip.employe.preNom}.pdf`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            } else {
                const { mois, annee } = parsePeriode(payslip.periode);
                alert(`Téléchargement de la fiche de paie ${mois} ${annee} - PDF non disponible pour le moment`);
            }
        } catch (error) {
            console.error('Erreur lors du téléchargement:', error);
            alert('Erreur lors du téléchargement du PDF');
        }
    };

    if (loading) {
        return (
            <div className="bg-white border border-slate-200 rounded-lg shadow-sm">
                <div className="p-4 sm:p-5 border-b border-slate-200">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-600 rounded-lg text-white flex items-center justify-center shrink-0">
                            <FileText className="w-5 h-5" />
                        </div>
                        <h1 className="text-lg font-semibold text-slate-900">
                            Mes Fiches de Paie
                        </h1>
                    </div>
                </div>
                <div className="p-5">
                    <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                        <span className="ml-3 text-slate-600">Chargement...</span>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-white border border-slate-200 rounded-lg shadow-sm">
                <div className="p-4 sm:p-5 border-b border-slate-200">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-600 rounded-lg text-white flex items-center justify-center shrink-0">
                            <FileText className="w-5 h-5" />
                        </div>
                        <h1 className="text-lg font-semibold text-slate-900">
                            Mes Fiches de Paie
                        </h1>
                    </div>
                </div>
                <div className="p-5 text-center">
                    <div className="flex flex-col items-center justify-center py-8">
                        <AlertCircle className="h-10 w-10 text-red-500" />
                        <p className="mt-4 text-base font-semibold text-slate-800">Erreur de chargement</p>
                        <p className="mt-1 text-sm text-slate-500">{error}</p>
                        <button
                            onClick={() => fetchEmployeePayslips()}
                            className="mt-4 inline-flex items-center justify-center px-4 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-sm font-medium rounded-lg"
                        >
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Réessayer
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white border border-slate-200 rounded-lg shadow-sm">
            <div className="p-4 sm:p-5 border-b border-slate-200">
                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-600 rounded-lg text-white flex items-center justify-center shrink-0">
                            <FileText className="w-5 h-5" />
                        </div>
                        <div>
                            <h1 className="text-lg font-semibold text-slate-900">
                                Mes Fiches de Paie
                            </h1>
                            <p className="text-sm text-slate-500">
                                {filteredPayslips.length} document{filteredPayslips.length !== 1 ? 's' : ''} trouvé{filteredPayslips.length !== 1 ? 's' : ''}
                            </p>
                        </div>
                    </div>
                    <div className="w-full lg:w-auto flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                        <div className="relative grow">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Rechercher..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-9 h-9 border border-slate-300 focus:border-blue-500 rounded-lg bg-white text-sm"
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            {/* Filtre par statut - uniquement pour RH */}
                            {isRH() && (
                                <select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    className="w-full sm:w-auto px-3 h-9 border border-slate-300 rounded-lg text-sm bg-white focus:border-blue-500 focus:outline-none"
                                    title="Filtrer par statut"
                                >
                                    <option value="all">Tous les statuts</option>
                                    <option value="BROUILLON">Brouillon</option>
                                    <option value="GENEREE">Générée</option>
                                    <option value="ENVOYEE">Envoyée</option>
                                    <option value="VALIDEE">Validée</option>
                                </select>
                            )}
                            <button
                                onClick={() => fetchEmployeePayslips(true)}
                                disabled={refreshing}
                                className="h-9 w-9 p-0 flex items-center justify-center shrink-0 border border-slate-300 bg-white hover:bg-slate-50 rounded-lg"
                                title="Actualiser la liste"
                            >
                                <RefreshCw className={`h-4 w-4 text-slate-600 ${refreshing ? 'animate-spin' : ''}`} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div>
                {filteredPayslips.length === 0 ? (
                    <div className="text-center py-16 px-4">
                        <FileText className="h-12 w-12 text-slate-300 mx-auto" />
                        <h3 className="mt-4 text-base font-semibold text-slate-800">Aucune fiche de paie trouvée</h3>
                        <p className="mt-1 text-sm text-slate-500">
                            {searchQuery || statusFilter !== 'all'
                                ? "Essayez d'ajuster vos filtres de recherche."
                                : "Vos documents apparaîtront ici dès qu'ils seront générés."}
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="py-3 px-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Période</th>
                                    {/* Colonne statut - uniquement pour RH */}
                                    {isRH() && (
                                        <th className="py-3 px-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Statut</th>
                                    )}
                                    <th className="py-3 px-4 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">Salaire Brut</th>
                                    <th className="py-3 px-4 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">Salaire Net</th>
                                    <th className="py-3 px-4 text-center text-xs font-semibold text-slate-600 uppercase tracking-wider">Jours</th>
                                    <th className="py-3 px-4 text-center text-xs font-semibold text-slate-600 uppercase tracking-wider">H. Sup.</th>
                                    <th className="py-3 px-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Date Génération</th>
                                    <th className="py-3 px-4 text-center text-xs font-semibold text-slate-600 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200">
                                {filteredPayslips.map((payslip) => {
                                    const statusConfig = getStatusConfig(payslip.statut);
                                    return (
                                        <tr key={payslip.id} className="hover:bg-slate-50 transition-colors duration-200">
                                            <td className="py-3 px-4 whitespace-nowrap">
                                                <div className="flex items-center gap-2">
                                                    <Calendar className="w-4 h-4 text-slate-400" />
                                                    <span className="font-medium text-slate-800">{formatPeriode(payslip.periode)}</span>
                                                </div>
                                            </td>
                                            {/* Cellule statut - uniquement pour RH */}
                                            {isRH() && (
                                                <td className="py-3 px-4 whitespace-nowrap">
                                                    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${statusConfig.classes}`}>
                                                        {statusConfig.icon}
                                                        {statusConfig.label}
                                                    </span>
                                                </td>
                                            )}
                                            <td className="py-3 px-4 text-right whitespace-nowrap font-medium text-slate-600">{formatCurrency(payslip.salaireBrut)}</td>
                                            <td className="py-3 px-4 text-right whitespace-nowrap font-bold text-blue-700">{formatCurrency(payslip.salaireNet)}</td>
                                            <td className="py-3 px-4 text-center whitespace-nowrap text-slate-600">{payslip.joursTravailles}</td>
                                            <td className="py-3 px-4 text-center whitespace-nowrap text-slate-600">{payslip.heuresSupplementaires}h</td>
                                            <td className="py-3 px-4 whitespace-nowrap text-slate-600">{new Date(payslip.dateGeneration).toLocaleDateString('fr-FR')}</td>
                                            <td className="py-3 px-4 text-center whitespace-nowrap">
                                                <button
                                                    onClick={() => downloadPayslip(payslip)}
                                                    className="h-8 w-8 flex items-center justify-center border border-slate-300 rounded-md hover:bg-slate-100 transition-colors"
                                                    aria-label={`Télécharger la fiche de paie de ${formatPeriode(payslip.periode)}`}
                                                >
                                                    <Download className="w-4 h-4 text-slate-600" />
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default EmployeePayslipsList;