import React, { useState, useEffect } from 'react';
import {
    Users, Building2, Loader2, AlertCircle, Calendar, Phone, Mail,
    Eye, Badge, RefreshCw, Search, Filter, ChevronDown, MapPin, Clock
} from 'lucide-react';
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
// Avatar remplacé par un composant simple

// Interfaces TypeScript
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

    const getInitials = (nom: string, prenom: string): string => {
        return `${nom.charAt(0)}${prenom.charAt(0)}`.toUpperCase();
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

    const EmployeeDetailModal = ({ employee }: { employee: Employe & { departement: string } }) => (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                    <Eye className="w-4 h-4 mr-1" />
                    Détails
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-3">
                        <SimpleAvatar className="w-12 h-12">
                            {getInitials(employee.nom, employee.preNom)}
                        </SimpleAvatar>
                        <div>
                            <h3 className="text-xl font-semibold">{employee.nom} {employee.preNom}</h3>
                            <p className="text-sm text-muted-foreground">{employee.poste}</p>
                        </div>
                    </DialogTitle>
                    <DialogDescription>
                        Informations détaillées de l'employé
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-6 mt-6">
                    {/* Informations générales */}
                    <div className="space-y-4">
                        <h4 className="text-lg font-medium flex items-center gap-2">
                            <Badge className="w-5 h-5" />
                            Informations générales
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <p className="text-sm text-muted-foreground">Numéro employé</p>
                                <p className="font-medium">{employee.numeroEmploye}</p>
                            </div>
                            <div className="space-y-2">
                                <p className="text-sm text-muted-foreground">Département</p>
                                <BadgeComponent variant="secondary">{employee.departement}</BadgeComponent>
                            </div>
                            <div className="space-y-2">
                                <p className="text-sm text-muted-foreground">Type d'utilisateur</p>
                                <BadgeComponent variant="outline">{employee.userType}</BadgeComponent>
                            </div>
                            <div className="space-y-2">
                                <p className="text-sm text-muted-foreground">Statut</p>
                                <BadgeComponent variant={employee.active ? "default" : "destructive"}>
                                    {employee.active ? 'Actif' : 'Inactif'}
                                </BadgeComponent>
                            </div>
                        </div>
                    </div>

                    {/* Contact */}
                    <div className="space-y-4">
                        <h4 className="text-lg font-medium flex items-center gap-2">
                            <Phone className="w-5 h-5" />
                            Contact
                        </h4>
                        <div className="grid grid-cols-1 gap-4">
                            <div className="flex items-center gap-2">
                                <Mail className="w-4 h-4 text-muted-foreground" />
                                <a href={`mailto:${employee.email}`} className="text-blue-600 hover:underline">
                                    {employee.email}
                                </a>
                            </div>
                            <div className="flex items-center gap-2">
                                <Phone className="w-4 h-4 text-muted-foreground" />
                                <a href={`tel:${employee.telephone}`} className="text-blue-600 hover:underline">
                                    {employee.telephone}
                                </a>
                            </div>
                            {employee.adresse && (
                                <div className="flex items-center gap-2">
                                    <MapPin className="w-4 h-4 text-muted-foreground" />
                                    <span>{employee.adresse}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Dates importantes */}
                    <div className="space-y-4">
                        <h4 className="text-lg font-medium flex items-center gap-2">
                            <Calendar className="w-5 h-5" />
                            Dates importantes
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <p className="text-sm text-muted-foreground">Date de naissance</p>
                                <p>{formatDate(employee.dateNaissance)}</p>
                            </div>
                            {employee.dateEmbauche && (
                                <div className="space-y-2">
                                    <p className="text-sm text-muted-foreground">Date d'embauche</p>
                                    <p>{formatDate(employee.dateEmbauche)}</p>
                                </div>
                            )}
                            <div className="space-y-2">
                                <p className="text-sm text-muted-foreground">Dernière connexion</p>
                                <p className="flex items-center gap-1">
                                    <Clock className="w-4 h-4" />
                                    {formatDateTime(employee.dernierConnexion)}
                                </p>
                            </div>
                            <div className="space-y-2">
                                <p className="text-sm text-muted-foreground">Créé le</p>
                                <p>{formatDateTime(employee.dateCreation)}</p>
                            </div>
                        </div>
                    </div>

                    {/* Informations complémentaires */}
                    {(employee.cin || employee.salairBase || employee.tauxHoraire) && (
                        <div className="space-y-4">
                            <h4 className="text-lg font-medium">Informations complémentaires</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {employee.cin && (
                                    <div className="space-y-2">
                                        <p className="text-sm text-muted-foreground">CIN</p>
                                        <p>{employee.cin}</p>
                                    </div>
                                )}
                                {employee.salairBase && (
                                    <div className="space-y-2">
                                        <p className="text-sm text-muted-foreground">Salaire de base</p>
                                        <p>{employee.salairBase.toLocaleString()} MAD</p>
                                    </div>
                                )}
                                {employee.tauxHoraire && (
                                    <div className="space-y-2">
                                        <p className="text-sm text-muted-foreground">Taux horaire</p>
                                        <p>{employee.tauxHoraire} MAD/h</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );

    const ElementPaieFormtest = () => {
        const [isOpen, setIsOpen] = useState(false);

        const handleSubmitSuccess = (data: any) => {
            console.log('Élément de paie créé avec succès:', data);
            setIsOpen(false);
            // Optionnel: afficher une notification de succès
        };

        const handleCancel = () => {
            setIsOpen(false);
        };

        return (
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4 mr-1" />
                        Ajouter un élément de paie
                    </Button>
                </DialogTrigger>
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
                        />
                    </div>
                </DialogContent>
            </Dialog>
        );
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center space-y-4">
                    <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
                    <p className="text-muted-foreground">Chargement des employés...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <Alert className="m-6" variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="flex items-center justify-between">
                    <span>{error}</span>
                    <Button variant="outline" size="sm" onClick={fetchEmployesParDepartement}>
                        <RefreshCw className="w-4 h-4 mr-1" />
                        Réessayer
                    </Button>
                </AlertDescription>
            </Alert>
        );
    }

    const stats = getTotalStats();

    return (
        <div className="container mx-auto p-6 space-y-6">
            {/* Header */}
            <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">Gestion des Employés</h1>
                <p className="text-muted-foreground">
                    Gérez et consultez les informations des employés par département
                </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-xs sm:text-sm font-medium">Total</CardTitle>
                        <Users className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-xl sm:text-2xl font-bold">{stats.total}</div>
                        <p className="text-xs text-muted-foreground hidden sm:block">Employés</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-xs sm:text-sm font-medium">Actifs</CardTitle>
                        <div className="h-3 w-3 sm:h-4 sm:w-4 bg-green-500 rounded-full"></div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-xl sm:text-2xl font-bold text-green-600">{stats.active}</div>
                        <p className="text-xs text-muted-foreground hidden sm:block">En activité</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-xs sm:text-sm font-medium">Inactifs</CardTitle>
                        <div className="h-3 w-3 sm:h-4 sm:w-4 bg-red-500 rounded-full"></div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-xl sm:text-2xl font-bold text-red-600">{stats.inactive}</div>
                        <p className="text-xs text-muted-foreground hidden sm:block">Suspendus</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-xs sm:text-sm font-medium">Depts</CardTitle>
                        <Building2 className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-xl sm:text-2xl font-bold">{departementsData.length}</div>
                        <p className="text-xs text-muted-foreground hidden sm:block">Départements</p>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                        <Filter className="w-4 h-4 sm:w-5 sm:h-5" />
                        Filtres et recherche
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Rechercher</label>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input
                                    placeholder="Nom, email, poste..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Département</label>
                            <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Tous les départements" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Tous les départements</SelectItem>
                                    {getAllDepartments().map(dept => (
                                        <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Statut</label>
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Tous les statuts" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Tous les statuts</SelectItem>
                                    <SelectItem value="active">Actifs</SelectItem>
                                    <SelectItem value="inactive">Inactifs</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex items-end">
                            <Button variant="outline" onClick={fetchEmployesParDepartement} className="w-full">
                                <RefreshCw className="w-4 h-4 mr-2" />
                                <span className="hidden sm:inline">Actualiser</span>
                                <span className="sm:hidden">Refresh</span>
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Employee List */}
            <Card>
                <CardHeader>
                    <CardTitle>Liste des Employés</CardTitle>
                    <CardDescription>
                        {filteredEmployees.length} employé{filteredEmployees.length > 1 ? 's' : ''} trouvé{filteredEmployees.length > 1 ? 's' : ''}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {filteredEmployees.length === 0 ? (
                        <div className="text-center py-12">
                            <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                            <p className="text-lg text-muted-foreground">Aucun employé trouvé</p>
                            <p className="text-sm text-muted-foreground">Essayez de modifier vos filtres de recherche</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {filteredEmployees.map((employee) => (
                                <div key={employee.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors space-y-3 sm:space-y-0">
                                    {/* Section principale avec avatar et info */}
                                    <div className="flex items-start sm:items-center space-x-3 sm:space-x-4 flex-1">
                                        <SimpleAvatar className="flex-shrink-0">
                                            {getInitials(employee.nom, employee.preNom)}
                                        </SimpleAvatar>

                                        <div className="space-y-2 min-w-0 flex-1">
                                            {/* Nom et statut */}
                                            <div className="flex flex-wrap items-center gap-2">
                                                <h3 className="font-semibold text-sm sm:text-base truncate">
                                                    {employee.nom} {employee.preNom}
                                                </h3>
                                                <BadgeComponent
                                                    variant={employee.active ? "default" : "destructive"}
                                                    className="text-xs flex-shrink-0"
                                                >
                                                    {employee.active ? 'Actif' : 'Inactif'}
                                                </BadgeComponent>
                                            </div>

                                            {/* Informations organisationnelles */}
                                            <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
                                                <span className="flex items-center gap-1 bg-muted/50 px-2 py-1 rounded">
                                                    <Badge className="w-3 h-3" />
                                                    <span className="truncate max-w-[80px] sm:max-w-none">{employee.numeroEmploye}</span>
                                                </span>
                                                <span className="flex items-center gap-1 bg-muted/50 px-2 py-1 rounded">
                                                    <Building2 className="w-3 h-3" />
                                                    <span className="truncate max-w-[100px] sm:max-w-none">{employee.departement}</span>
                                                </span>
                                                <span className="hidden sm:inline-block bg-muted/50 px-2 py-1 rounded truncate">
                                                    {employee.poste}
                                                </span>
                                            </div>

                                            {/* Poste pour mobile */}
                                            <div className="sm:hidden">
                                                <span className="text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded inline-block">
                                                    {employee.poste}
                                                </span>
                                            </div>

                                            {/* Informations de contact - cachées sur très petit écran */}
                                            <div className="hidden md:flex items-center gap-4 text-xs text-muted-foreground">
                                                <span className="flex items-center gap-1 truncate">
                                                    <Mail className="w-3 h-3 flex-shrink-0" />
                                                    <span className="truncate max-w-[150px] lg:max-w-none">{employee.email}</span>
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Phone className="w-3 h-3 flex-shrink-0" />
                                                    <span className="whitespace-nowrap">{employee.telephone}</span>
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Bouton d'action */}
                                    <div className="flex justify-end sm:justify-start sm:ml-4">
                                        <EmployeeDetailModal employee={employee} />
                                    </div>
                                    <div className="flex justify-end sm:justify-start sm:ml-4">
                                        <ElementPaieFormtest />
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