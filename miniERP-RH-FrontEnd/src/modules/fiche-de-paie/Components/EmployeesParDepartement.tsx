import React, { useState, useEffect } from 'react';

// Styles CSS pour les animations
const fadeInUpKeyframes = `
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

// Injection des styles
if (typeof document !== 'undefined') {
    const styleElement = document.createElement('style');
    styleElement.textContent = fadeInUpKeyframes;
    document.head.appendChild(styleElement);
}
import {
    Users, Building2, Loader2, AlertCircle, Calendar, Phone, Mail,
    Eye, Badge, RefreshCw, Search, Filter, MapPin, Clock,
    MoreVertical,
    Calculator,
    FileText,
    Download,
    DollarSign,
    Info
} from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";


import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import {
    Alert,
    AlertDescription,
} from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge as BadgeComponent } from '@/components/ui/badge';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import ElementPaieForm from './AjouterElementPaieRefactored';
import ElementPaieManager from './ElementPaieManager';


interface Employe {
    id: number;
    nom: string;
    preNom: string;
    email: string;
    telephone: string;
    dateNaissance: string;
    dateCreation: string;
    dernierConnexion: string;
    active: boolean;
    userType: string;
    numeroEmploye: string;
    cin: string | null;
    dateEmbauche: string | null;
    salairBase: number | null;
    poste: string;
    tauxHoraire: number | null;
    adresse: string | null;
}

interface DepartementData {
    departement: string;
    employes: Employe[];
}

interface EmployeesParDepartementProps {
    apiBaseUrl?: string;
}

const EmployeesParDepartement: React.FC<EmployeesParDepartementProps> = ({
    apiBaseUrl = 'http://localhost:8080/api/users'
}) => {
    const [departementsData, setDepartementsData] = useState<DepartementData[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
    const [statusFilter, setStatusFilter] = useState<string>('all');

    useEffect(() => {
        fetchEmployesParDepartement();
    }, []);

    const fetchEmployesParDepartement = async (): Promise<void> => {
        try {
            setLoading(true);
            setError(null);

            const response = await fetch(`${apiBaseUrl}/employe-par-departments`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
            });

            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                const text = await response.text();
                console.error('Réponse reçue (non-JSON):', text.substring(0, 200));
                throw new Error(`Réponse non-JSON reçue. Content-Type: ${contentType || 'non défini'}`);
            }

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Erreur HTTP: ${response.status} - ${response.statusText}`);
            }

            const data: DepartementData[] = await response.json();

            if (!Array.isArray(data)) {
                throw new Error('Format de données invalide: un tableau est attendu');
            }

            setDepartementsData(data);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Une erreur inconnue est survenue';
            setError(errorMessage);
            console.error('Erreur lors de la récupération des employés:', err);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString: string): string => {
        try {
            return new Date(dateString).toLocaleDateString('fr-FR', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
        } catch {
            return 'Date invalide';
        }
    };

    const formatDateTime = (dateString: string): string => {
        try {
            return new Date(dateString).toLocaleDateString('fr-FR', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch {
            return 'Date invalide';
        }
    };

    const getInitials = (nom: string, preNom: string): string => {
        return `${nom?.charAt(0) || ''}${preNom?.charAt(0) || ''}`.toUpperCase();
    };

    // Composant Avatar simple sans dépendance externe
    const SimpleAvatar = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => (
        <div className={`w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold text-sm ${className}`}>
            {children}
        </div>
    );

    // Filtres et recherche
    const filteredEmployees = departementsData.flatMap(dept =>
        dept.employes.map(emp => ({ ...emp, departement: dept.departement }))
    ).filter(emp => {
        const matchesSearch =
            emp.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
            emp.preNom.toLowerCase().includes(searchTerm.toLowerCase()) ||
            emp.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            emp.numeroEmploye.toLowerCase().includes(searchTerm.toLowerCase()) ||
            emp.poste.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesDepartment = selectedDepartment === 'all' || emp.departement === selectedDepartment;
        const matchesStatus = statusFilter === 'all' ||
            (statusFilter === 'active' && emp.active) ||
            (statusFilter === 'inactive' && !emp.active);

        return matchesSearch && matchesDepartment && matchesStatus;
    });

    const getAllDepartments = (): string[] => {
        return Array.from(new Set(departementsData.map(dept => dept.departement)));
    };

    const getTotalStats = () => {
        const total = departementsData.reduce((acc, dept) => acc + dept.employes.length, 0);
        const active = departementsData.reduce((acc, dept) =>
            acc + dept.employes.filter(emp => emp.active).length, 0
        );
        return { total, active, inactive: total - active };
    };

    const EmployeeDetailModal = ({ employee, open, onOpenChange }: { employee: any, open: boolean, onOpenChange: (open: boolean) => void }) => (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl p-0">
                {/* ====== EN-TÊTE BLEU (50% BLEU) ====== */}
                <DialogHeader className="bg-blue-600 text-white rounded-t-lg p-6">
                    <div className="flex items-center gap-4">
                        <SimpleAvatar className="w-16 h-16 text-2xl border-2 border-white/50">
                            {getInitials(employee.nom, employee.preNom)}
                        </SimpleAvatar>
                        <div>
                            <DialogTitle className="text-2xl font-bold text-white">
                                {employee.nom} {employee.preNom}
                            </DialogTitle>
                            <DialogDescription className="text-blue-200">
                                {employee.poste}
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                {/* ====== CONTENU GRIS ET BLANC (30% GRIS, 20% BLANC) ====== */}
                <div className="max-h-[65vh] overflow-y-auto bg-slate-50 p-6">
                    <div className="space-y-6">
                        {/* --- Section: Informations générales --- */}
                        <InfoCard title="Informations générales" icon={<Info className="w-5 h-5 text-blue-600" />}>
                            <InfoGrid>
                                <InfoItem label="Numéro employé" value={employee.numeroEmploye} />
                                <InfoItem label="Département">
                                    <BadgeComponent variant="secondary">{employee.departement}</BadgeComponent>
                                </InfoItem>
                                <InfoItem label="Type d'utilisateur">
                                    <BadgeComponent variant="outline">{employee.userType}</BadgeComponent>
                                </InfoItem>
                                <InfoItem label="Statut">
                                    <BadgeComponent variant={employee.active ? "default" : "destructive"}>
                                        {employee.active ? 'Actif' : 'Inactif'}
                                    </BadgeComponent>
                                </InfoItem>
                            </InfoGrid>
                        </InfoCard>

                        {/* --- Section: Contact --- */}
                        <InfoCard title="Contact" icon={<Phone className="w-5 h-5 text-blue-600" />}>
                            <div className="space-y-3">
                                <ContactItem icon={<Mail />} href={`mailto:${employee.email}`} value={employee.email} />
                                <ContactItem icon={<Phone />} href={`tel:${employee.telephone}`} value={employee.telephone} />
                                {employee.adresse && <ContactItem icon={<MapPin />} value={employee.adresse} />}
                            </div>
                        </InfoCard>

                        {/* --- Section: Dates importantes --- */}
                        <InfoCard title="Dates importantes" icon={<Calendar className="w-5 h-5 text-blue-600" />}>
                            <InfoGrid>
                                <InfoItem label="Date de naissance" value={formatDate(employee.dateNaissance)} />
                                {employee.dateEmbauche && <InfoItem label="Date d'embauche" value={formatDate(employee.dateEmbauche)} />}
                                <InfoItem label="Dernière connexion" value={formatDateTime(employee.dernierConnexion)} icon={<Clock className="w-4 h-4 mr-1.5" />} />
                                <InfoItem label="Créé le" value={formatDateTime(employee.dateCreation)} />
                            </InfoGrid>
                        </InfoCard>

                        {/* --- Section: Informations complémentaires --- */}
                        {(employee.cin || employee.salairBase || employee.tauxHoraire) && (
                            <InfoCard title="Informations complémentaires" icon={<FileText className="w-5 h-5 text-blue-600" />}>
                                <InfoGrid>
                                    {employee.cin && <InfoItem label="CIN" value={employee.cin} />}
                                    {employee.salairBase && <InfoItem label="Salaire de base" value={`${employee.salairBase.toLocaleString()} MAD`} />}
                                    {employee.tauxHoraire && <InfoItem label="Taux horaire" value={`${employee.tauxHoraire} MAD/h`} />}
                                </InfoGrid>
                            </InfoCard>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );

    // --- SOUS-COMPOSANTS POUR UNE MEILLEURE STRUCTURE ET LISIBILITÉ ---

    const InfoCard = ({ title, icon, children }: { title: string, icon: React.ReactNode, children: React.ReactNode }) => (
        <div className="bg-white p-4 rounded-lg border border-slate-200">
            <h4 className="text-base font-semibold flex items-center gap-2 text-slate-800 mb-4">
                {icon} {title}
            </h4>
            {children}
        </div>
    );

    const InfoGrid = ({ children }: { children: React.ReactNode }) => (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-5">{children}</div>
    );

    const InfoItem = ({ label, value, icon, children }: { label: string, value?: string, icon?: React.ReactNode, children?: React.ReactNode }) => (
        <div>
            <p className="text-sm text-slate-500">{label}</p>
            {value ? (
                <p className="font-semibold text-slate-800 flex items-center">{icon}{value}</p>
            ) : (
                <div className="mt-1">{children}</div>
            )}
        </div>
    );

    const ContactItem = ({ icon, href, value }: { icon: React.ReactNode, href?: string, value: string }) => {
        const content = (
            <span className={href ? "text-blue-600 hover:underline" : "text-slate-800"}>{value}</span>
        );
        return (
            <div className="flex items-center gap-3">
                <div className="text-slate-400">{icon}</div>
                {href ? <a href={href}>{content}</a> : content}
            </div>
        );
    };


    // Typage des props pour ElementPaieFormtest
    const ElementPaieFormtest = ({ employeId, open, onOpenChange }: { employeId: number, open: boolean, onOpenChange: (open: boolean) => void }) => {
        const handleSubmitSuccess = (data: any) => {
            onOpenChange(false);
        };
        const handleCancel = () => {
            onOpenChange(false);
        };
        return (
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0">
                    <DialogHeader className="p-6 pb-0">
                        <DialogTitle>Ajouter un élément de paie</DialogTitle>
                        <DialogDescription>
                            Créez un nouvel élément de paie avec les paramètres de calcul appropriés
                        </DialogDescription>
                    </DialogHeader>
                    <div className="p-6 pt-0">
                        <ElementPaieForm
                            isModal={true}
                            onSubmitSuccess={handleSubmitSuccess}
                            onCancel={handleCancel}
                            employeId={employeId}
                        />
                    </div>
                </DialogContent>
            </Dialog>
        );
    };

    // Add PDF download/preview state and helpers
    type TestState = { isLoading: boolean; error: string | null; success: string | null; pdfUrl: string | null };
    const [, setTestState] = useState<TestState>({ isLoading: false, error: null, success: null, pdfUrl: null });

    // simple static fiche-paie base URL (hardcoded so it's easy to read)
    const fichePaieBase = 'http://localhost:8080/api/fiche-paie';

    const downloadPdf = async (employeId: string) => {
        if (!employeId || !employeId.trim()) {
            setTestState(prev => ({ ...prev, error: 'Veuillez saisir un ID de fiche de paie' }));
            return;
        }
        setTestState({ isLoading: true, error: null, success: null, pdfUrl: null });
        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`${fichePaieBase}/${encodeURIComponent(employeId)}/pdf`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/pdf',
                    'Authorization': token ? `Bearer ${token}` : ''
                },
            });

            if (!response.ok) {
                let errorMessage = `Erreur HTTP: ${response.status}`;
                if (response.status === 404) {
                    errorMessage = 'Fiche de paie non trouvée';
                } else if (response.status === 500) {
                    errorMessage = 'Erreur serveur interne';
                } else {
                    try {
                        const errorData = await response.json();
                        errorMessage = errorData.message || errorMessage;
                    } catch {
                        errorMessage = `Erreur ${response.status}: ${response.statusText}`;
                    }
                }
                throw new Error(errorMessage);
            }

            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/pdf')) {
                throw new Error('Le serveur n\'a pas retourné un fichier PDF');
            }

            const blob = await response.blob();
            if (blob.size === 0) {
                throw new Error('Le fichier PDF est vide');
            }

            const pdfUrl = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = pdfUrl;
            link.download = `fiche_paie_${employeId}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            setTestState({
                isLoading: false,
                error: null,
                success: `PDF téléchargé avec succès (${(blob.size / 1024).toFixed(2)} KB)`,
                pdfUrl: pdfUrl
            });

            // revoke object URL after a while
            setTimeout(() => URL.revokeObjectURL(pdfUrl), 60_000);
        } catch (error) {
            setTestState({
                isLoading: false,
                error: error instanceof Error ? error.message : 'Erreur inconnue lors du téléchargement',
                success: null,
                pdfUrl: null
            });
        }
    };

    const previewPdf = async (employeId: string) => {
        if (!employeId || !employeId.trim()) {
            setTestState(prev => ({ ...prev, error: 'Veuillez saisir un ID d\'employé' }));
            return;
        }
        setTestState({ isLoading: true, error: null, success: null, pdfUrl: null });
        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`${fichePaieBase}/${encodeURIComponent(employeId)}/pdf`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/pdf',
                    'Authorization': token ? `Bearer ${token}` : ''
                },
            });

            if (!response.ok) {
                let errorMessage = `Erreur HTTP: ${response.status}`;
                if (response.status === 404) {
                    errorMessage = 'Fiche de paie non trouvée';
                } else if (response.status === 500) {
                    errorMessage = 'Erreur serveur interne';
                } else {
                    try {
                        const errorData = await response.json();
                        errorMessage = errorData.message || errorMessage;
                    } catch {
                        errorMessage = `Erreur ${response.status}: ${response.statusText}`;
                    }
                }
                throw new Error(errorMessage);
            }

            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/pdf')) {
                throw new Error('Le serveur n\'a pas retourné un fichier PDF');
            }

            const blob = await response.blob();
            if (blob.size === 0) {
                throw new Error('Le fichier PDF est vide');
            }

            const pdfUrl = URL.createObjectURL(blob);
            window.open(pdfUrl, '_blank');

            setTestState({
                isLoading: false,
                error: null,
                success: `PDF ouvert dans un nouvel onglet (${(blob.size / 1024).toFixed(2)} KB)`,
                pdfUrl: pdfUrl
            });

            // revoke object URL after a while
            setTimeout(() => URL.revokeObjectURL(pdfUrl), 60_000);
        } catch (error) {
            setTestState({
                isLoading: false,
                error: error instanceof Error ? error.message : 'Erreur lors de la prévisualisation',
                success: null,
                pdfUrl: null
            });
        }
    };

    const EmployeeActions = ({ employee }: { employee: any }) => {
        const [openDetail, setOpenDetail] = useState(false);
        const [openPaie, setOpenPaie] = useState(false);

        return (
            <>
                {/* Version mobile avec dropdown, déplacé plus haut */}
                <div className="sm:hidden flex justify-end mb-2 -mt-2">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-10 w-10 p-0 rounded-full border-2 border-blue-200 bg-white shadow-lg hover:shadow-xl hover:bg-blue-50 hover:border-blue-400 transition-all duration-300 hover:scale-110"
                            >
                                <MoreVertical className="w-5 h-5 text-blue-600" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem onClick={() => setOpenDetail(true)} className="font-semibold text-primary hover:bg-primary/10">
                                <Eye className="w-4 h-4 mr-2" /> Détails
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setOpenPaie(true)} className="font-semibold text-blue-700 hover:bg-blue-50">
                                <Calculator className="w-4 h-4 mr-2" /> Gérer paie
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => previewPdf(String(employee.id))} className="font-semibold text-blue-700 hover:bg-blue-50">
                                <FileText className="w-4 h-4" /> Prévision
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => downloadPdf(String(employee.id))} className="font-semibold text-blue-700 hover:bg-blue-50">
                                <Download className="w-4 h-4" />
                                <span>Télécharger</span>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-xs text-muted-foreground">
                                <div className="space-y-1">
                                    <div className="flex items-center space-x-1">
                                        <Mail className="w-3 h-3" />
                                        <span className="truncate">{employee.email}</span>
                                    </div>
                                    <div className="flex items-center space-x-1">
                                        <Phone className="w-3 h-3" />
                                        <span>{employee.telephone}</span>
                                    </div>
                                </div>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                <div className="hidden sm:flex items-center space-x-2 lg:space-x-3">
                    <Button
                        variant="outline"
                        size="sm"
                        className="group relative px-3 py-2 text-xs lg:text-sm border-2 border-blue-200 hover:border-blue-400 bg-white hover:bg-blue-50 text-blue-700 hover:text-blue-800 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 hover:scale-105"
                        onClick={() => setOpenDetail(true)}
                    >
                        <Eye className="w-4 h-4 group-hover:scale-110 transition-transform" />
                        <span className="ml-1.5 font-medium">Détails</span>
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        className="group relative px-3 py-2 text-xs lg:text-sm border-2 border-green-200 hover:border-green-400 bg-white hover:bg-green-50 text-green-700 hover:text-green-800 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 hover:scale-105"
                        onClick={() => setOpenPaie(true)}
                    >
                        <DollarSign className="w-4 h-4 group-hover:scale-110 transition-transform" />
                        <span className="ml-1.5 font-medium">Paie</span>
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        className="group relative px-3 py-2 text-xs lg:text-sm border-2 border-purple-200 hover:border-purple-400 bg-white hover:bg-purple-50 text-purple-700 hover:text-purple-800 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 hover:scale-105"
                        onClick={() => previewPdf(String(employee.id))}
                    >
                        <FileText className="w-4 h-4 group-hover:scale-110 transition-transform" />
                        <span className="ml-1.5 font-medium">Aperçu</span>
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        className="group relative px-3 py-2 text-xs lg:text-sm border-2 border-indigo-200 hover:border-indigo-400 bg-white hover:bg-indigo-50 text-indigo-700 hover:text-indigo-800 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 hover:scale-105"
                        onClick={() => downloadPdf(String(employee.id))}
                    >
                        <Download className="w-4 h-4 group-hover:scale-110 transition-transform" />
                        <span className="ml-1.5 font-medium">PDF</span>
                    </Button>
                </div>

                <EmployeeDetailModal employee={employee} open={openDetail} onOpenChange={setOpenDetail} />
                <ElementPaieManager employeId={employee.id} open={openPaie} onOpenChange={setOpenPaie} />
            </>
        );
    };

    if (loading) {
        return (
            <div className="container mx-auto p-2 sm:p-4 md:p-6">
                <div className="flex items-center justify-center min-h-[500px]">
                    <div className="text-center space-y-6">
                        <div className="relative">
                            <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto shadow-lg">
                                <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
                            </div>
                            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-indigo-600/20 rounded-full animate-ping"></div>
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-xl font-semibold text-gray-700">Chargement en cours...</h3>
                            <p className="text-gray-500">Récupération des données des employés</p>
                        </div>
                        <div className="flex justify-center space-x-1">
                            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto p-2 sm:p-4 md:p-6">
                <Alert className="border-red-200 bg-gradient-to-r from-red-50 to-rose-50 shadow-lg" variant="destructive">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-red-100 rounded-lg">
                            <AlertCircle className="h-5 w-5 text-red-600" />
                        </div>
                        <div className="flex-1">
                            <h3 className="font-semibold text-red-800 mb-1">Erreur de chargement</h3>
                            <AlertDescription className="text-red-700">
                                {error}
                            </AlertDescription>
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={fetchEmployesParDepartement}
                            className="border-red-300 text-red-700 hover:bg-red-100 hover:border-red-400 transition-all duration-300 hover:scale-105"
                        >
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Réessayer
                        </Button>
                    </div>
                </Alert>
            </div>
        );
    }

    const stats = getTotalStats();

    return (
        <div className="container mx-auto p-2 sm:p-4 md:p-6 space-y-4 sm:space-y-6 animate-in fade-in duration-700">
            {/* Header amélioré avec animations */}
            <div className="space-y-4 text-center lg:text-left">
                <p className="text-lg text-gray-600 max-w-3xl">
                    Consultez, gérez et administrez les fiches de paie de vos employés par département.
                </p>
            </div>

            {/* Stats Cards avec animations améliorées */}
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
                <Card className="group transition-all duration-300 border-0 bg-gradient-to-br from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-xs sm:text-sm font-medium text-gray-700">Total</CardTitle>
                        <div className="p-2 bg-blue-500 rounded-lg group-hover:bg-blue-600 transition-colors duration-300">
                            <Users className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-xl sm:text-2xl font-bold text-blue-700 group-hover:text-blue-800 transition-colors">{stats.total}</div>
                        <p className="text-xs text-gray-600 hidden sm:block font-medium">Employés</p>
                    </CardContent>
                </Card>
                <Card className="group transition-all duration-300 border-0 bg-gradient-to-br from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-xs sm:text-sm font-medium text-gray-700">Actifs</CardTitle>
                        <div className="p-2 bg-green-500 rounded-lg group-hover:bg-green-600 transition-colors duration-300">
                            <div className="h-3 w-3 sm:h-4 sm:w-4 bg-white rounded-full animate-pulse"></div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-xl sm:text-2xl font-bold text-green-700 group-hover:text-green-800 transition-colors">{stats.active}</div>
                        <p className="text-xs text-gray-600 hidden sm:block font-medium">En activité</p>
                    </CardContent>
                </Card>
                <Card className="group transition-all duration-300 border-0 bg-gradient-to-br from-red-50 to-rose-50 hover:from-red-100 hover:to-rose-100">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-xs sm:text-sm font-medium text-gray-700">Inactifs</CardTitle>
                        <div className="p-2 bg-red-500 rounded-lg group-hover:bg-red-600 transition-colors duration-300">
                            <div className="h-3 w-3 sm:h-4 sm:w-4 bg-white rounded-full"></div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-xl sm:text-2xl font-bold text-red-700 group-hover:text-red-800 transition-colors">{stats.inactive}</div>
                        <p className="text-xs text-gray-600 hidden sm:block font-medium">Suspendus</p>
                    </CardContent>
                </Card>
                <Card className="group transition-all duration-300 border-0 bg-gradient-to-br from-purple-50 to-violet-50 hover:from-purple-100 hover:to-violet-100">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-xs sm:text-sm font-medium text-gray-700">Départements</CardTitle>
                        <div className="p-2 bg-purple-500 rounded-lg group-hover:bg-purple-600 transition-colors duration-300">
                            <Building2 className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-xl sm:text-2xl font-bold text-purple-700 group-hover:text-purple-800 transition-colors">{departementsData.length}</div>
                        <p className="text-xs text-gray-600 hidden sm:block font-medium">Structures</p>
                    </CardContent>
                </Card>
            </div>

            {/* Filters avec design moderne */}
            <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm hover:shadow-2xl transition-all duration-500">
                <CardHeader className="bg-gradient-to-r from-slate-50 to-blue-50/30 rounded-t-lg">
                    <CardTitle className="flex items-center gap-3 text-lg sm:text-xl text-gray-800">
                        <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg shadow-md">
                            <Filter className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                        </div>
                        Recherche & Filtres Avancés
                    </CardTitle>
                    <p className="text-sm text-gray-600 mt-2 ml-12">Trouvez rapidement l'employé recherché avec nos outils de filtrage intelligents</p>
                </CardHeader>
                <CardContent className="p-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                        <div className="space-y-3 group">
                            <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                <Search className="w-4 h-4 text-blue-500" />
                                Recherche Globale
                            </label>
                            <div className="relative">
                                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 group-hover:text-blue-500 transition-colors" />
                                <Input
                                    placeholder="Nom, email, poste, numéro..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-12 h-11 border-2 border-gray-200 focus:border-blue-500 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 focus:ring-2 focus:ring-blue-200"
                                />
                            </div>
                        </div>
                        <div className="space-y-3 group">
                            <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                <Building2 className="w-4 h-4 text-purple-500" />
                                Département
                            </label>
                            <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                                <SelectTrigger className="h-11 border-2 border-gray-200 focus:border-purple-500 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 focus:ring-2 focus:ring-purple-200">
                                    <SelectValue placeholder="Tous les départements" />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl shadow-xl border-2">
                                    <SelectItem value="all" className="rounded-lg">🏢 Tous les départements</SelectItem>
                                    {getAllDepartments().map(dept => (
                                        <SelectItem key={dept} value={dept} className="rounded-lg">📁 {dept}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-3 group">
                            <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                <BadgeComponent className="w-4 h-4 text-green-500" />
                                Statut d'Activité
                            </label>
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger className="h-11 border-2 border-gray-200 focus:border-green-500 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 focus:ring-2 focus:ring-green-200">
                                    <SelectValue placeholder="Tous les statuts" />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl shadow-xl border-2">
                                    <SelectItem value="all" className="rounded-lg">🔄 Tous les statuts</SelectItem>
                                    <SelectItem value="active" className="rounded-lg">✅ Employés actifs</SelectItem>
                                    <SelectItem value="inactive" className="rounded-lg">⏸️ Employés inactifs</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex items-end">
                            <Button
                                variant="outline"
                                onClick={fetchEmployesParDepartement}
                                className="w-full h-11 bg-gradient-to-r from-indigo-500 to-purple-600 text-white border-0 rounded-xl shadow-lg transition-all duration-300 font-semibold"
                                disabled={loading}
                            >
                                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                                <span className="hidden sm:inline">{loading ? 'Actualisation...' : 'Actualiser'}</span>
                                <span className="sm:hidden">{loading ? '...' : '🔄'}</span>
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Employee List avec design moderne */}
            <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-gray-50 to-slate-50 border-b border-gray-100">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-gradient-to-br from-gray-600 to-slate-700 rounded-lg shadow-md">
                                <Users className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <CardTitle className="text-xl text-gray-800">Répertoire des Employés</CardTitle>
                                <CardDescription className="text-base font-medium">
                                    <span className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
                                        <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
                                        {filteredEmployees.length} employé{filteredEmployees.length > 1 ? 's' : ''} {filteredEmployees.length > 1 ? 'trouvés' : 'trouvé'}
                                    </span>
                                </CardDescription>
                            </div>
                        </div>
                        {filteredEmployees.length > 0 && (
                            <div className="hidden sm:flex items-center gap-2 text-sm text-gray-500">
                                <Clock className="w-4 h-4" />
                                <span>Dernière mise à jour : {new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                        )}
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    {filteredEmployees.length === 0 ? (
                        <div className="text-center py-16 px-6">
                            <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center shadow-inner">
                                <Users className="w-12 h-12 text-gray-400" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-700 mb-2">Aucun employé trouvé</h3>
                            <p className="text-gray-500 mb-4">Essayez de modifier vos critères de recherche ou filtres</p>
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg text-sm font-medium">
                                <Search className="w-4 h-4" />
                                <span>Conseil : Utilisez des mots-clés plus généraux</span>
                            </div>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-100">
                            {filteredEmployees.map((employee, index) => (
                                <div
                                    key={employee.id}
                                    className="group py-4 sm:py-5 md:py-6 px-4 sm:px-6 hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-indigo-50/50 transition-all duration-300 hover:shadow-md hover:border-l-4 hover:border-l-blue-500 cursor-pointer"
                                >
                                    <div className="flex flex-row sm:flex-row sm:items-center gap-3 sm:gap-4">
                                        <div className="flex items-center space-x-3 sm:space-x-4 min-w-0 flex-1">
                                            <div className="relative">
                                                <SimpleAvatar className="w-12 h-12 sm:w-14 sm:h-14 flex-shrink-0 shadow-lg ring-2 ring-white group-hover:ring-blue-200 transition-all duration-100 group-hover:scale-110">
                                                    {getInitials(employee.nom, employee.preNom)}
                                                </SimpleAvatar>
                                                <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white shadow-sm ${employee.active ? 'bg-green-400' : 'bg-gray-400'}`}></div>
                                            </div>

                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-center space-x-3 mb-2">
                                                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 truncate group-hover:text-blue-700 transition-colors">
                                                        {employee.nom} {employee.preNom}
                                                    </h3>
                                                    <BadgeComponent
                                                        variant={employee.active ? "default" : "destructive"}
                                                        className={`text-xs flex-shrink-0 font-semibold px-3 py-1 ${employee.active
                                                            ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                                            : 'bg-red-100 text-red-700 hover:bg-red-200'
                                                            } transition-colors duration-200`}
                                                    >
                                                        {employee.active ? '✓ Actif' : '✗ Inactif'}
                                                    </BadgeComponent>
                                                </div>

                                                {/* Informations enrichies avec design moderne */}
                                                <div className="space-y-2">
                                                    <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                                                        <span className="inline-flex items-center gap-1.5 px-2 py-1 bg-blue-50 text-blue-700 rounded-md text-xs font-medium">
                                                            <Badge className="w-3 h-3" />
                                                            <span>#{employee.numeroEmploye}</span>
                                                        </span>
                                                        <span className="inline-flex items-center gap-1.5 px-2 py-1 bg-purple-50 text-purple-700 rounded-md text-xs font-medium">
                                                            <Building2 className="w-3 h-3" />
                                                            <span className="truncate max-w-[100px] sm:max-w-[150px]">{employee.departement}</span>
                                                        </span>
                                                        <span className="hidden sm:inline-flex items-center gap-1.5 px-2 py-1 bg-gray-50 text-gray-700 rounded-md text-xs font-medium">
                                                            💼 {employee.poste}
                                                        </span>
                                                    </div>

                                                    <div className="hidden md:flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-600">
                                                        <span className="flex items-center gap-1.5 hover:text-blue-600 transition-colors">
                                                            <Mail className="w-3.5 h-3.5" />
                                                            <span className="truncate max-w-[200px] lg:max-w-none">{employee.email}</span>
                                                        </span>
                                                        <span className="flex items-center gap-1.5 hover:text-green-600 transition-colors">
                                                            <Phone className="w-3.5 h-3.5" />
                                                            <span>{employee.telephone}</span>
                                                        </span>
                                                        {employee.salairBase && (
                                                            <span className="flex items-center gap-1.5 text-green-700 font-medium">
                                                                <DollarSign className="w-3.5 h-3.5" />
                                                                <span>{employee.salairBase.toLocaleString()} MAD</span>
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Informations mobile */}
                                                <div className="sm:hidden mt-2 space-y-2">
                                                    <div className="inline-flex items-center gap-1.5 px-2 py-1 bg-gray-100 text-gray-700 rounded-md text-xs font-medium">
                                                        💼 {employee.poste}
                                                    </div>
                                                    <div className="flex items-center gap-3 text-xs text-gray-600">
                                                        <span className="flex items-center gap-1">
                                                            <Mail className="w-3 h-3" />
                                                            <span className="truncate max-w-[120px]">{employee.email}</span>
                                                        </span>
                                                        <span className="flex items-center gap-1">
                                                            <Phone className="w-3 h-3" />
                                                            <span>{employee.telephone}</span>
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Actions améliorées */}
                                        <div className="flex-shrink-0 flex items-center justify-end">
                                            <div className="opacity-75 group-hover:opacity-100 transition-opacity duration-300">
                                                <EmployeeActions employee={employee} />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>


                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default EmployeesParDepartement;