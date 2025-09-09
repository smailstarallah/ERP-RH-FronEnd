import React, { useState, useEffect, useMemo } from 'react';
import {
    Users, UserPlus, Loader2, Mail, Phone, Eye, RefreshCw, Search, Edit2, Power,
    Building2, Clock, Filter, Check, UserCheck,
    CheckCircle2, AlertTriangle, User, DollarSign, IdCard
} from 'lucide-react';
import { } from 'lucide-react';
import {
    Card, CardContent, CardHeader, CardTitle,
} from '@/components/ui/card';
import {
    Dialog, DialogContent, DialogDescription, DialogHeader,
    DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge as BadgeComponent } from '@/components/ui/badge';
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { format } from 'date-fns';

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Calendar as CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

// Types - Interface utilisateur unifiée
interface User {
    id: number;
    nom: string;
    preNom: string;
    email: string;
    telephone?: string;
    dateNaissance?: string;
    poste?: string;
    departement: string;
    adresse?: string;
    cin?: string;
    dateEmbauche?: string;
    salaireBase?: number;
    tauxHoraire?: number;
    numeroEmploye?: string;
    userType: string;
    active?: boolean;
    dateCreation?: string;
    dernierConnexion?: string;
    // Support pour les deux formats d'API
    department?: string;
}

interface Filters {
    search: string;
    status: string;
    department: string;
}

// Composants UI de base
const UserAvatar: React.FC<{ nom: string; prenom: string; size?: 'xs' | 'sm' | 'md' | 'lg' }> = ({ nom, prenom, size = 'md' }) => {
    const sizeClasses = {
        xs: 'w-6 h-6 text-xs',
        sm: 'w-8 h-8 text-xs',
        md: 'w-10 h-10 text-sm',
        lg: 'w-12 h-12 text-base'
    };

    return (
        <div className={`${sizeClasses[size]} rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold flex-shrink-0`}>
            {nom.charAt(0).toUpperCase()}{prenom.charAt(0).toUpperCase()}
        </div>
    );
};

const LoadingSpinner: React.FC = () => (
    <div className="flex items-center justify-center py-8">
        <div className="text-center space-y-2">
            <Loader2 className="w-6 h-6 animate-spin text-blue-600 mx-auto" />
            <p className="text-sm text-gray-600">Chargement...</p>
        </div>
    </div>
);


const MetricsSection: React.FC<{ users: User[] }> = ({ users }) => {
    const metrics = useMemo(() => ({
        total: users.length,
        active: users.filter(u => u.active).length,
        departments: new Set(users.map(u => u.departement)).size,
        recent: users.filter(u => {
            const weekAgo = new Date();
            weekAgo.setDate(weekAgo.getDate() - 7);
            return u.dernierConnexion && new Date(u.dernierConnexion) > weekAgo;
        }).length
    }), [users]);

    const metricCards = [
        { icon: Users, label: "Total", value: metrics.total, color: "blue" },
        { icon: UserCheck, label: "Actifs", value: metrics.active, color: "blue" },
        { icon: Building2, label: "Services", value: metrics.departments, color: "blue" },
        { icon: Clock, label: "7 jours", value: metrics.recent, color: "blue" }
    ];

    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 mb-3 lg:mb-4">
            {metricCards.map(({ icon: Icon, label, value }, index) => (
                <Card key={index} className="border border-slate-200 bg-slate-50">
                    <CardContent className="p-2 sm:p-3">
                        <div className="text-center">
                            <div className="flex items-center justify-center mb-1">
                                <Icon className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600 mr-1" />
                                <span className="text-xs text-slate-600 hidden sm:inline">{label}</span>
                                <span className="text-xs text-slate-600 sm:hidden">{label.slice(0, 3)}</span>
                            </div>
                            <p className="text-base sm:text-lg font-bold text-blue-700">{value}</p>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
};


const SearchAndFilters: React.FC<{
    filters: Filters;
    departments: string[];
    onChange: (filters: Filters) => void;
    onRefresh: () => void;
    onAddUser: () => void;
}> = ({ filters, departments, onChange, onRefresh, onAddUser }) => {
    const [showFilters, setShowFilters] = useState(false);

    return (
        <Card className="mb-4 border border-slate-200 shadow-sm">
            <CardContent className="p-3 sm:p-4">
                <div className="space-y-3">
                    {/* Barre de recherche principale */}
                    <div className="flex gap-2">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <Input
                                placeholder="Rechercher..."
                                value={filters.search}
                                onChange={(e) => onChange({ ...filters, search: e.target.value })}
                                className="pl-9 h-9 text-sm border-slate-300 focus:border-blue-500 rounded-lg"
                            />
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setShowFilters(!showFilters)}
                            className="h-9 px-2 sm:px-3 border-slate-300 text-slate-700 hover:bg-slate-50 rounded-lg"
                        >
                            <Filter className="w-4 h-4 sm:mr-1" />
                            <span className="hidden sm:inline">Filtres</span>
                        </Button>
                        <Button
                            size="sm"
                            onClick={onAddUser}
                            className="h-9 px-2 sm:px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                        >
                            <UserPlus className="w-4 h-4 sm:mr-1" />
                            <span className="hidden sm:inline">Ajouter</span>
                        </Button>
                    </div>

                    {/* Filtres dépliables */}
                    {showFilters && (
                        <div className="space-y-3 pt-2 border-t">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <Select
                                    value={filters.status}
                                    onValueChange={(value) => onChange({ ...filters, status: value })}
                                >
                                    <SelectTrigger className="h-8 text-sm border-slate-300 focus:border-blue-500 rounded-lg">
                                        <SelectValue placeholder="Statut" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Tous les statuts</SelectItem>
                                        <SelectItem value="active">Employés actifs</SelectItem>
                                        <SelectItem value="inactive">Employés inactifs</SelectItem>
                                    </SelectContent>
                                </Select>

                                <Select
                                    value={filters.department}
                                    onValueChange={(value) => onChange({ ...filters, department: value })}
                                >
                                    <SelectTrigger className="h-8 text-sm border-slate-300 focus:border-blue-500 rounded-lg">
                                        <SelectValue placeholder="Service" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Tous les services</SelectItem>
                                        {departments.map(dept => (
                                            <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <Button variant="outline" size="sm" onClick={onRefresh} className="w-full sm:w-auto border-slate-300 text-slate-700 hover:bg-slate-50 rounded-lg">
                                <RefreshCw className="w-3 h-3 mr-1" />
                                Actualiser
                            </Button>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};


const UserDetailsModal: React.FC<{
    user: User;
    onUpdate: (user: User) => void;
    onToggleStatus: (userId: number) => void;
}> = ({ user, onUpdate, onToggleStatus }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState(user);
    const [showConfirm, setShowConfirm] = useState(false);

    const handleSave = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            console.error('Token manquant dans localStorage.');
            alert('Session invalide : token manquant. Veuillez vous reconnecter.');
            return;
        }

        try {
            const res = await fetch(`http://localhost:8080/api/users/update-user`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(editData), // envoi uniquement de useredit
            });

            const text = await res.text();

            if (!res.ok) {
                console.error('Erreur API (update-user):', res.status, text);
                console.error('Payload envoyé:', JSON.stringify(editData));
                return;
            }

            // si la réponse est du JSON, parser et utiliser, sinon fallback sur editData
            let parsed: any = null;
            try { parsed = JSON.parse(text); } catch { parsed = null; }

            const updatedUser: User = parsed && parsed.id ? parsed : editData;
            onUpdate(updatedUser);
            setIsEditing(false);
        } catch (error) {
            console.error('Erreur lors de la requête update-user:', error);
        }
    };

    const handleToggleStatus = async () => {
        const token = localStorage.getItem('token');

        if (!token) {
            console.error('Token manquant dans localStorage.');
            alert('Session invalide : token manquant. Veuillez vous reconnecter.');
            setShowConfirm(false);
            return;
        }

        try {
            const res = await fetch(`http://localhost:8080/api/users/active-users/${user.id}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            });

            const contentType = res.headers.get('content-type');
            let responseBody: any = null;

            if (contentType && contentType.includes('application/json')) {
                responseBody = await res.json();
            } else {
                responseBody = await res.text();
            }

            if (!res.ok) {
                console.error('Erreur API:', res.status, responseBody);
                const serverMessage = typeof responseBody === 'object' ? responseBody.message || JSON.stringify(responseBody) : responseBody;
                alert(serverMessage || `Erreur serveur (${res.status}).`);
                return;
            }

            // Mise à jour côté client via le callback parent
            onToggleStatus(user.id);
        } catch (error) {
            console.error('Erreur lors du changement de statut utilisateur:', error);
            alert('Impossible de changer le statut de l\'utilisateur. Vérifiez la console pour plus de détails.');
        } finally {
            setShowConfirm(false);
        }
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    };

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 px-2">
                    <Eye className="w-3 h-3 sm:mr-1" />
                    <span className="text-xs hidden sm:inline">Détails</span>
                </Button>
            </DialogTrigger>
            <DialogContent className="w-full max-w-sm sm:max-w-2xl max-h-[90vh] overflow-y-auto mx-4 border border-slate-200">
                <DialogHeader className="bg-slate-50 border-b border-slate-200">
                    <div className="flex items-center gap-3">
                        <UserAvatar nom={user.nom} prenom={user.preNom} size="lg" />
                        <div className="min-w-0 flex-1">
                            <DialogTitle className="text-base sm:text-lg truncate text-slate-900">
                                {user.nom} {user.preNom}
                            </DialogTitle>
                            <DialogDescription className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                                <span className="truncate">{user.poste}</span>
                                <span className="hidden sm:inline">•</span>
                                <span className="truncate">{user.departement}</span>
                                <BadgeComponent
                                    variant={user.active ? "default" : "secondary"}
                                    className={`ml-0 sm:ml-2 w-fit px-2 py-1 text-xs font-medium rounded ${user.active ? "bg-blue-100 text-blue-800" : "bg-slate-100 text-slate-600"}`}
                                >
                                    {user.active ? "Actif" : "Inactif"}
                                </BadgeComponent>
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <div className="space-y-4 mt-4">
                    {/* Actions principales */}
                    <div className="flex flex-col sm:flex-row gap-2">
                        <Button
                            variant={isEditing ? "default" : "outline"}
                            size="sm"
                            onClick={() => setIsEditing(!isEditing)}
                            className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                        >
                            <Edit2 className="w-3 h-3 mr-1" />
                            <span className="text-xs">{isEditing ? "Annuler" : "Modifier"}</span>
                        </Button>
                        <Button
                            variant={user.active ? "destructive" : "default"}
                            size="sm"
                            onClick={() => setShowConfirm(true)}
                            className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                        >
                            <Power className="w-3 h-3 mr-1" />
                            <span className="text-xs">{user.active ? "Désactiver" : "Activer"}</span>
                        </Button>
                    </div>

                    {/* Confirmation de changement de statut */}
                    {showConfirm && (
                        <Alert>
                            <AlertDescription className="space-y-2">
                                <p className="text-sm">
                                    Confirmer {user.active ? "la désactivation" : "l'activation"} du compte ?
                                </p>
                                <div className="flex gap-2">
                                    <Button size="sm" variant="outline" onClick={() => setShowConfirm(false)} className="flex-1 border-slate-300 text-slate-700 hover:bg-slate-50 rounded-lg">
                                        Annuler
                                    </Button>
                                    <Button size="sm" onClick={handleToggleStatus} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg">
                                        Confirmer
                                    </Button>
                                </div>
                            </AlertDescription>
                        </Alert>
                    )}

                    {/* Informations de base */}
                    <div className="space-y-4">
                        <Card className="border border-slate-200 bg-slate-50">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-semibold text-slate-900">Informations personnelles</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div>
                                    <label className="text-xs text-gray-600">Nom complet</label>
                                    {isEditing ? (
                                        <div className="space-y-2 mt-1">
                                            <Input
                                                value={editData.nom}
                                                onChange={(e) => setEditData({ ...editData, nom: e.target.value })}
                                                className="h-8 text-sm border-slate-300 focus:border-blue-500 rounded-lg"
                                                placeholder="Nom"
                                            />
                                            <Input
                                                value={editData.preNom}
                                                onChange={(e) => setEditData({ ...editData, preNom: e.target.value })}
                                                className="h-8 text-sm border-slate-300 focus:border-blue-500 rounded-lg"
                                                placeholder="Prénom"
                                            />
                                        </div>
                                    ) : (
                                        <p className="mt-1 font-medium text-sm">{user.nom} {user.preNom}</p>
                                    )}
                                </div>
                                <div>
                                    <label className="text-xs text-gray-600">Email professionnel</label>
                                    {isEditing ? (
                                        <Input
                                            type="email"
                                            value={editData.email}
                                            onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                                            className="mt-1 h-8 text-sm border-slate-300 focus:border-blue-500 rounded-lg"
                                        />
                                    ) : (
                                        <div className="mt-1 flex items-center gap-2">
                                            <Mail className="w-3 h-3 text-gray-400 flex-shrink-0" />
                                            <a href={`mailto:${user.email}`} className="text-sm text-blue-600 hover:underline truncate">
                                                {user.email}
                                            </a>
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <label className="text-xs text-gray-600">Téléphone</label>
                                    {isEditing ? (
                                        <Input
                                            value={editData.telephone}
                                            onChange={(e) => setEditData({ ...editData, telephone: e.target.value })}
                                            className="mt-1 h-8 text-sm border-slate-300 focus:border-blue-500 rounded-lg"
                                        />
                                    ) : (
                                        <div className="mt-1 flex items-center gap-2">
                                            <Phone className="w-3 h-3 text-gray-400 flex-shrink-0" />
                                            <span className="text-sm">{user.telephone}</span>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border border-slate-200 bg-slate-50">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-semibold text-slate-900">Informations professionnelles</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div>
                                    <label className="text-xs text-gray-600">Numéro d'employé</label>
                                    <p className="mt-1 font-mono text-sm font-medium">{user.numeroEmploye}</p>
                                </div>
                                <div>
                                    <label className="text-xs text-gray-600">Poste</label>
                                    {isEditing ? (
                                        <Input
                                            value={editData.poste}
                                            onChange={(e) => setEditData({ ...editData, poste: e.target.value })}
                                            className="mt-1 h-8 text-sm border-slate-300 focus:border-blue-500 rounded-lg"
                                        />
                                    ) : (
                                        <p className="mt-1 text-sm font-medium">{user.poste}</p>
                                    )}
                                </div>
                                <div>
                                    <label className="text-xs text-gray-600">Service</label>
                                    {isEditing ? (
                                        <Input
                                            value={editData.departement}
                                            onChange={(e) => setEditData({ ...editData, departement: e.target.value })}
                                            className="mt-1 h-8 text-sm border-slate-300 focus:border-blue-500 rounded-lg"
                                        />
                                    ) : (
                                        <div className="mt-1 flex items-center gap-2">
                                            <Building2 className="w-3 h-3 text-gray-400 flex-shrink-0" />
                                            <span className="text-sm">{user.departement}</span>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Historique */}
                        <Card className="border border-slate-200 bg-slate-50">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-semibold text-slate-900">Historique du compte</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2 text-sm">
                                    <div className="flex items-center gap-2">
                                        <CalendarIcon className="w-3 h-3 text-gray-400 flex-shrink-0" />
                                        <span className="text-gray-600">Créé le:</span>
                                        <span className="font-medium">{user.dateCreation ? formatDate(user.dateCreation) : 'Non renseigné'}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Clock className="w-3 h-3 text-gray-400 flex-shrink-0" />
                                        <span className="text-gray-600">Dernière connexion:</span>
                                        <span className="font-medium">{user.dernierConnexion ? formatDate(user.dernierConnexion) : 'Jamais'}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {isEditing && (
                        <div className="flex flex-col sm:flex-row gap-2 pt-2 border-t">
                            <Button variant="outline" size="sm" onClick={() => setIsEditing(false)} className="flex-1 border-slate-300 text-slate-700 hover:bg-slate-50 rounded-lg">
                                Annuler
                            </Button>
                            <Button size="sm" onClick={handleSave} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg">
                                <Check className="w-3 h-3 mr-1" />
                                Enregistrer
                            </Button>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
};

// Schema adaptatif selon le type d'utilisateur
const createFormSchema = (userType: string) => {
    const baseSchema = {
        nom: z.string().min(1, 'Nom requis'),
        preNom: z.string().min(1, 'Prénom requis'),
        email: z.string().email('Email invalide').min(1, 'Email requis'),
        telephone: z.string().optional(),
        password: z.string().min(6, 'Mot de passe requis (6 caractères minimum)'),
        confirmPassword: z.string().min(6, 'Confirmation requise'),
        dateNaissance: z.date().optional(),
        poste: z.string().optional(),
        departement: z.string().min(1, 'Département requis'),
        adresse: z.string().optional(),
        cin: z.string().optional(),
        dateEmbauche: z.date().optional(),
        salaireBase: z.number().optional(),
        tauxHoraire: z.number().optional(),
        numeroEmploye: z.string().optional(),
        userType: z.string().default('EMPLOYE'),
        active: z.boolean().default(true),
    };

    // Champs requis pour les employés
    if (userType === 'EMPLOYE') {
        return z.object({
            ...baseSchema,
            telephone: z.string().min(1, 'Téléphone requis'),
            dateNaissance: z.date('Date de naissance requise'),
            poste: z.string().min(1, 'Poste requis'),
            numeroEmploye: z.string().min(1, 'N° employé requis'),
        }).refine((data) => data.password === data.confirmPassword, {
            message: "Les mots de passe ne correspondent pas",
            path: ["confirmPassword"],
        });
    }

    // Champs requis pour les managers (plus flexibles)
    return z.object(baseSchema).refine((data) => data.password === data.confirmPassword, {
        message: "Les mots de passe ne correspondent pas",
        path: ["confirmPassword"],
    });
};




interface RegisterRequest {
    nom: string;
    preNom: string;
    email: string;
    telephone?: string;
    dateNaissance?: string;
    poste?: string;
    departement: string;
    adresse?: string;
    cin?: string;
    dateEmbauche?: string;
    salaireBase?: number;
    tauxHoraire?: number;
    numeroEmploye?: string;
    userType: string;
    active?: boolean;
}

interface AddUserModalProps {
    onAdd: (user: User) => void;
    isOpen: boolean;
    onClose: () => void;
}

const AddUserModal: React.FC<AddUserModalProps> = ({
    onAdd,
    isOpen,
    onClose,
}) => {
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [apiError, setApiError] = useState<string>('');

    const [selectedUserType, setSelectedUserType] = useState<string>('EMPLOYE');
    const [currentSchema, setCurrentSchema] = useState(createFormSchema('EMPLOYE'));

    const form = useForm({
        resolver: zodResolver(currentSchema),
        defaultValues: {
            nom: '',
            preNom: '',
            email: '',
            telephone: '',
            password: '',
            confirmPassword: '',
            dateNaissance: undefined as Date | undefined,
            poste: '',
            departement: '',
            adresse: '',
            cin: '',
            dateEmbauche: undefined as Date | undefined,
            salaireBase: undefined as number | undefined,
            tauxHoraire: undefined as number | undefined,
            numeroEmploye: '',
            userType: 'EMPLOYE',
            active: true,
        },
    });

    // Mettre à jour le schema quand le type d'utilisateur change
    const handleUserTypeChange = (userType: string) => {
        setSelectedUserType(userType);
        const newSchema = createFormSchema(userType);
        setCurrentSchema(newSchema);
        form.setValue('userType', userType);

        // Réinitialiser les validations
        form.clearErrors();
    };

    const departments = ['IT', 'RH', 'Finance', 'Marketing', 'Production', 'Qualité', 'Logistique', 'Commercial'];
    const userTypes = [
        { value: 'EMPLOYE', label: 'Employé' },
        { value: 'MANAGER', label: 'Manager' },
        { value: 'admin', label: 'Administrateur' },
        { value: 'rh', label: 'RH' },
    ];

    const handleSubmit = async (data: any): Promise<void> => {
        setApiError('');
        setIsLoading(true);

        try {
            const requestData: RegisterRequest & { password: string } = {
                nom: data.nom,
                preNom: data.preNom,
                email: data.email,
                departement: data.departement,
                userType: data.userType,
                password: data.password,
                // Champs conditionnels selon le type d'utilisateur
                telephone: data.telephone || undefined,
                dateNaissance: data.dateNaissance ? data.dateNaissance.toISOString() : undefined,
                poste: data.poste || undefined,
                adresse: data.adresse || undefined,
                cin: data.cin || undefined,
                dateEmbauche: data.dateEmbauche ? data.dateEmbauche.toISOString() : undefined,
                salaireBase: data.salaireBase || undefined,
                tauxHoraire: data.tauxHoraire || undefined,
                numeroEmploye: data.numeroEmploye || undefined,
                active: data.active,
            };

            const response = await fetch('http://localhost:8080/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestData),
            });

            const result: { success: boolean; data?: User; message?: string } = await response.json();

            if (response.ok && result.success && result.data) {
                onAdd(result.data);
                form.reset();
                onClose();
            } else {
                setApiError(result.message || 'Erreur lors de la création');
            }
        } catch (error) {
            setApiError('Erreur de connexion');
            console.error('Registration error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDateChange = (date: Date | undefined, onChange: (date?: Date) => void): void => {
        onChange(date);
    };

    const handleNumberChange = (value: string, onChange: (value?: number) => void): void => {
        const numericValue = value === '' ? undefined : parseFloat(value);
        onChange(numericValue);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="w-full max-w-5xl mx-4 h-[90vh] p-0 gap-0 overflow-hidden bg-slate-50 border border-slate-200 rounded-lg shadow-lg">
                {/* Header institutionnel */}
                <div className="px-8 py-3 bg-white border-b border-slate-200 flex items-center gap-4 rounded-t-lg">
                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                        <UserPlus className="w-4 h-4 text-white" />
                    </div>
                    <h2 className="text-lg font-semibold text-slate-900">Nouvel Employé</h2>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto bg-slate-50 px-8 py-4">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8" id="add-user-form">
                            {/* Error Message */}
                            {apiError && (
                                <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2 shadow-sm">
                                    <AlertTriangle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                                    <span className="text-sm text-red-700">{apiError}</span>
                                </div>
                            )}

                            {/* Informations personnelles */}
                            <section className="bg-white rounded-lg border border-slate-200 p-6 space-y-4">
                                <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
                                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                                        <User className="w-4 h-4 text-white" />
                                    </div>
                                    <h3 className="font-semibold text-slate-900">Informations personnelles</h3>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="nom"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-sm text-slate-700 font-medium">Nom *</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        {...field}
                                                        className="h-10 border-slate-300 focus:border-blue-500 focus:ring-blue-200"
                                                        placeholder="Nom de famille"
                                                        aria-required="true"
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="preNom"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-sm text-slate-700 font-medium">Prénom *</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        {...field}
                                                        className="h-10 border-slate-300 focus:border-blue-500 focus:ring-blue-200"
                                                        placeholder="Prénom"
                                                        aria-required="true"
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="dateNaissance"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-sm text-slate-700 font-medium">Date de naissance *</FormLabel>
                                                <FormControl>
                                                    <Popover>
                                                        <PopoverTrigger asChild>
                                                            <Button
                                                                variant="outline"
                                                                className={cn(
                                                                    'h-10 w-full justify-start text-left font-normal',
                                                                    !field.value && 'text-muted-foreground'
                                                                )}
                                                            >
                                                                <CalendarIcon className="mr-2 h-4 w-4" />
                                                                {field.value ? format(field.value, 'PPP') : <span>Choisir une date</span>}
                                                            </Button>
                                                        </PopoverTrigger>
                                                        <PopoverContent className="w-auto p-0 z-[1000]">
                                                            <Calendar
                                                                mode="single"
                                                                selected={field.value}
                                                                onSelect={(date) => handleDateChange(date, field.onChange)}
                                                                captionLayout="dropdown"
                                                                initialFocus
                                                                className="pointer-events-auto bg-white"
                                                            />
                                                        </PopoverContent>
                                                    </Popover>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="cin"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-sm text-slate-700 font-medium">
                                                    CIN {selectedUserType === 'EMPLOYE' ? '(recommandé)' : '(optionnel)'}
                                                </FormLabel>
                                                <FormControl>
                                                    <Input
                                                        {...field}
                                                        className="h-10 border-slate-300 focus:border-blue-500 focus:ring-blue-200"
                                                        placeholder="AB123456"
                                                        aria-describedby="cin-optional"
                                                    />
                                                </FormControl>
                                                <span id="cin-optional" className="text-xs text-slate-500">Carte d'identité nationale</span>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    {/* Numéro d'employé - affiché seulement pour les employés */}
                                    {selectedUserType === 'EMPLOYE' && (
                                        <FormField
                                            control={form.control}
                                            name="numeroEmploye"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-sm text-slate-700 font-medium">N° Employé *</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            {...field}
                                                            className="h-10 border-slate-300 focus:border-blue-500 focus:ring-blue-200"
                                                            placeholder="EMP001"
                                                            aria-required="true"
                                                        />
                                                    </FormControl>
                                                    <span className="text-xs text-slate-500">Identifiant unique de l'employé</span>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    )}
                                </div>
                            </section>

                            {/* Contact */}
                            <section className="bg-white rounded-lg border border-slate-200 p-6 space-y-4">
                                <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
                                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                                        <Mail className="w-4 h-4 text-white" />
                                    </div>
                                    <h3 className="font-semibold text-slate-900">Contact</h3>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="email"
                                        render={({ field }) => (
                                            <FormItem className="md:col-span-2">
                                                <FormLabel className="text-sm text-slate-700 font-medium">Email professionnel *</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        {...field}
                                                        type="email"
                                                        className="h-10 border-slate-300 focus:border-blue-500 focus:ring-blue-200"
                                                        placeholder="exemple@entreprise.com"
                                                        aria-required="true"
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="password"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-sm text-slate-700 font-medium">Mot de passe *</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        {...field}
                                                        type="password"
                                                        className="h-10 border-slate-300 focus:border-blue-500 focus:ring-blue-200"
                                                        placeholder="Mot de passe (min. 6 caractères)"
                                                        aria-required="true"
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="confirmPassword"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-sm text-slate-700 font-medium">Confirmer le mot de passe *</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        {...field}
                                                        type="password"
                                                        className="h-10 border-slate-300 focus:border-blue-500 focus:ring-blue-200"
                                                        placeholder="Répéter le mot de passe"
                                                        aria-required="true"
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="telephone"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-sm text-slate-700 font-medium">
                                                    Téléphone {selectedUserType === 'EMPLOYE' ? '*' : '(optionnel)'}
                                                </FormLabel>
                                                <FormControl>
                                                    <Input
                                                        {...field}
                                                        className="h-10 border-slate-300 focus:border-blue-500 focus:ring-blue-200"
                                                        placeholder="+212 6XX XXX XXX"
                                                        aria-required={selectedUserType === 'EMPLOYE'}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="adresse"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-sm text-slate-700 font-medium">Adresse (optionnel)</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        {...field}
                                                        className="h-10 border-slate-300 focus:border-blue-500 focus:ring-blue-200"
                                                        placeholder="Adresse complète"
                                                        aria-describedby="adresse-optional"
                                                    />
                                                </FormControl>
                                                <span id="adresse-optional" className="text-xs text-slate-500">Adresse physique ou postale</span>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </section>

                            {/* Professionnel */}
                            <section className="bg-white rounded-lg border border-slate-200 p-6 space-y-4">
                                <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
                                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                                        <IdCard className="w-4 h-4 text-white" />
                                    </div>
                                    <h3 className="font-semibold text-slate-900">Informations professionnelles</h3>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="departement"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-sm text-slate-700 font-medium">Département *</FormLabel>
                                                <Select onValueChange={field.onChange} value={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger
                                                            className="h-10 border-slate-300 focus:border-blue-500 focus:ring-blue-200"
                                                            aria-required="true"
                                                        >
                                                            <SelectValue placeholder="Sélectionner un département" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {departments.map(dept => (
                                                            <SelectItem key={dept} value={dept}>
                                                                {dept}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="userType"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-sm text-slate-700 font-medium">Type d'utilisateur *</FormLabel>
                                                <Select
                                                    onValueChange={(value) => {
                                                        field.onChange(value);
                                                        handleUserTypeChange(value);
                                                    }}
                                                    value={field.value}
                                                >
                                                    <FormControl>
                                                        <SelectTrigger className="h-10 border-slate-300 focus:border-blue-500 focus:ring-blue-200">
                                                            <SelectValue placeholder="Sélectionner le type" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {userTypes.map(type => (
                                                            <SelectItem key={type.value} value={type.value}>
                                                                {type.label}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="poste"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-sm text-slate-700 font-medium">
                                                    Poste {selectedUserType === 'EMPLOYE' ? '*' : '(optionnel)'}
                                                </FormLabel>
                                                <FormControl>
                                                    <Input
                                                        {...field}
                                                        className="h-10 border-slate-300 focus:border-blue-500 focus:ring-blue-200"
                                                        placeholder="Intitulé du poste"
                                                        aria-required={selectedUserType === 'EMPLOYE'}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="dateEmbauche"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-sm text-slate-700 font-medium">Date d'embauche (optionnel)</FormLabel>
                                                <FormControl>
                                                    <Popover>
                                                        <PopoverTrigger asChild>
                                                            <Button
                                                                variant="outline"
                                                                className={cn(
                                                                    'h-10 w-full justify-start text-left font-normal',
                                                                    !field.value && 'text-muted-foreground'
                                                                )}
                                                            >
                                                                <CalendarIcon className="mr-2 h-4 w-4" />
                                                                {field.value ? format(field.value, 'PPP') : <span>Choisir une date</span>}
                                                            </Button>
                                                        </PopoverTrigger>
                                                        <PopoverContent className="w-auto p-0 z-[1000]">
                                                            <Calendar
                                                                mode="single"
                                                                selected={field.value}
                                                                onSelect={(date) => handleDateChange(date, field.onChange)}
                                                                captionLayout="dropdown"
                                                                initialFocus
                                                                className="pointer-events-auto bg-white"
                                                            />
                                                        </PopoverContent>
                                                    </Popover>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    {/* Statut actif/inactif */}
                                    <FormField
                                        control={form.control}
                                        name="active"
                                        render={({ field }) => (
                                            <FormItem className="flex flex-col">
                                                <FormLabel className="text-sm text-slate-700 font-medium">Statut du compte</FormLabel>
                                                <Select
                                                    onValueChange={(value) => field.onChange(value === 'true')}
                                                    value={String(field.value)}
                                                >
                                                    <FormControl>
                                                        <SelectTrigger className="h-10 border-slate-300 focus:border-blue-500 focus:ring-blue-200">
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="true">🟢 Actif</SelectItem>
                                                        <SelectItem value="false">🔴 Inactif</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <span className="text-xs text-slate-500">
                                                    {field.value ? "L'utilisateur peut se connecter" : "L'utilisateur ne peut pas se connecter"}
                                                </span>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </section>

                            {/* Rémunération - Affiché seulement pour les employés */}
                            {selectedUserType === 'EMPLOYE' && (
                                <section className="bg-white rounded-lg border border-slate-200 p-6 space-y-4">
                                    <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
                                        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                                            <DollarSign className="w-4 h-4 text-white" />
                                        </div>
                                        <h3 className="font-semibold text-slate-900">Rémunération (optionnel)</h3>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <FormField
                                            control={form.control}
                                            name="salaireBase"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-sm text-slate-700 font-medium">Salaire de base (MAD)</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            type="number"
                                                            step="0.01"
                                                            value={field.value ?? ''}
                                                            onChange={(e) => handleNumberChange(e.target.value, field.onChange)}
                                                            className="h-10 border-slate-300 focus:border-blue-500 focus:ring-blue-200"
                                                            placeholder="0.00"
                                                            aria-describedby="salaire-optional"
                                                        />
                                                    </FormControl>
                                                    <span id="salaire-optional" className="text-xs text-slate-500">Salaire mensuel en dirhams</span>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="tauxHoraire"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-sm text-slate-700 font-medium">Taux horaire (MAD/h)</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            type="number"
                                                            step="0.01"
                                                            value={field.value ?? ''}
                                                            onChange={(e) => handleNumberChange(e.target.value, field.onChange)}
                                                            className="h-10 border-slate-300 focus:border-blue-500 focus:ring-blue-200"
                                                            placeholder="0.00"
                                                            aria-describedby="taux-optional"
                                                        />
                                                    </FormControl>
                                                    <span id="taux-optional" className="text-xs text-slate-500">Taux horaire en dirhams</span>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                </section>
                            )}

                            {/* Récapitulatif */}
                            {(form.getValues('nom') || form.getValues('email') || form.getValues('poste')) && (
                                <section className="bg-blue-100 rounded-lg border border-blue-200 p-5">
                                    <div className="flex items-center gap-2 mb-3">
                                        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                                            <CheckCircle2 className="w-4 h-4 text-white" />
                                        </div>
                                        <h4 className="font-semibold text-slate-900">Récapitulatif</h4>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                                        {form.getValues('nom') && form.getValues('preNom') && (
                                            <div>
                                                <span className="text-blue-900 font-medium">Nom:</span>{' '}
                                                <span className="text-slate-700">
                                                    {form.getValues('preNom')} {form.getValues('nom')}
                                                </span>
                                            </div>
                                        )}
                                        {form.getValues('email') && (
                                            <div>
                                                <span className="text-blue-900 font-medium">Email:</span>{' '}
                                                <span className="text-slate-700">{form.getValues('email')}</span>
                                            </div>
                                        )}
                                        {form.getValues('poste') && (
                                            <div>
                                                <span className="text-blue-900 font-medium">Poste:</span>{' '}
                                                <span className="text-slate-700">{form.getValues('poste')}</span>
                                            </div>
                                        )}
                                        {form.getValues('departement') && (
                                            <div>
                                                <span className="text-blue-900 font-medium">Département:</span>{' '}
                                                <span className="text-slate-700">{form.getValues('departement')}</span>
                                            </div>
                                        )}
                                        {form.getValues('userType') && (
                                            <div>
                                                <span className="text-blue-900 font-medium">Type:</span>{' '}
                                                <span className="text-slate-700">
                                                    {userTypes.find(t => t.value === form.getValues('userType'))?.label}
                                                </span>
                                            </div>
                                        )}
                                        {form.getValues('numeroEmploye') && selectedUserType === 'EMPLOYE' && (
                                            <div>
                                                <span className="text-blue-900 font-medium">N° Employé:</span>{' '}
                                                <span className="text-slate-700">{form.getValues('numeroEmploye')}</span>
                                            </div>
                                        )}
                                    </div>
                                </section>
                            )}
                        </form>
                    </Form>
                </div>

                {/* Footer */}
                <div className="px-8 py-3 border-t border-slate-200 bg-white flex-shrink-0 flex flex-col sm:flex-row gap-3 sm:justify-end rounded-b-lg">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onClose}
                        disabled={isLoading}
                        className="h-11 border border-slate-300 text-slate-700 bg-white hover:bg-slate-50 rounded-lg font-semibold"
                    >
                        Annuler
                    </Button>
                    <Button
                        type="submit"
                        form="add-user-form"
                        disabled={isLoading}
                        className="h-11 bg-blue-600 hover:bg-blue-700 text-white min-w-[140px] rounded-lg font-semibold"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                Création...
                            </>
                        ) : (
                            <>
                                <CheckCircle2 className="w-4 h-4 mr-2" />
                                Créer le compte
                            </>
                        )}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};


const UserList: React.FC<{
    users: User[];
    onUpdate: (user: User) => void;
    onToggleStatus: (userId: number) => void;
}> = ({ users, onUpdate, onToggleStatus }) => (
    <div className="space-y-2">
        {users.map(user => (
            <Card key={user.id} className="border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-3">
                    <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                            <UserAvatar nom={user.nom} prenom={user.preNom} size="sm" />
                            <div className="min-w-0 flex-1">
                                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mb-1">
                                    <h4 className="font-medium text-sm truncate">
                                        {user.nom} {user.preNom}
                                    </h4>
                                    <BadgeComponent
                                        variant={user.active ? "default" : "secondary"}
                                        className={`text-xs w-fit px-2 py-1 font-medium rounded ${user.active ? "bg-blue-100 text-blue-800" : "bg-slate-100 text-slate-600"}`}
                                    >
                                        {user.active ? "Actif" : "Inactif"}
                                    </BadgeComponent>
                                </div>
                                <div className="text-xs text-gray-600 space-y-1">
                                    <div className="truncate">{user.poste} • {user.departement}</div>
                                    <div className="truncate sm:hidden">{user.email}</div>
                                    <div className="hidden sm:block truncate">{user.email}</div>
                                </div>
                            </div>
                        </div>

                        <div className="flex-shrink-0">
                            <UserDetailsModal
                                user={user}
                                onUpdate={onUpdate}
                                onToggleStatus={onToggleStatus}
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>
        ))}
    </div>
);

// Hook pour la gestion des données
const useUserManagement = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);


    useEffect(() => {
        fetchEmployesParDepartement();
    }, []);

    const fetchEmployesParDepartement = async (): Promise<void> => {
        try {
            setLoading(true);

            const response = await fetch(`http://localhost:8080/api/users/employe-par-departments`, {
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
                console.error('Erreur lors de la récupération des employés:', errorText);
                throw new Error(`Erreur HTTP: ${response.status} - ${response.statusText}`);
            }

            const data = await response.json();

            if (!Array.isArray(data)) {
                throw new Error('Format de données invalide: un tableau est attendu');
            }

            // Transformer les données de départements en liste d'utilisateurs
            const allUsers: User[] = data.flatMap((dept: any) =>
                dept.employes.map((emp: any) => ({
                    ...emp,
                    departement: dept.departement
                }))
            );

            setUsers(allUsers);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Une erreur inconnue est survenue';
            console.error('Erreur lors de la récupération des employés:', errorMessage);
        } finally {
            setLoading(false);
        }
    };


    const updateUser = (updatedUser: User) => {
        setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
    };

    const addUser = (newUserData: Omit<User, 'id'>) => {
        const newUser: User = {
            ...newUserData,
            id: Math.max(...users.map(u => u.id), 0) + 1
        };
        setUsers(prev => [newUser, ...prev]);
    };

    const toggleUserStatus = (userId: number) => {
        setUsers(prev => prev.map(u =>
            u.id === userId ? { ...u, active: !u.active } : u
        ));
    };

    const refreshData = () => {
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
        }, 500);
    };

    return { users, loading, updateUser, addUser, toggleUserStatus, refreshData };
};

// Composant principal
const UserManagement: React.FC = () => {
    const { users, loading, updateUser, addUser, toggleUserStatus, refreshData } = useUserManagement();
    const [filters, setFilters] = useState<Filters>({ search: '', status: 'all', department: 'all' });
    const [showAddModal, setShowAddModal] = useState(false);

    const departments = useMemo(() =>
        Array.from(new Set(users.map(u => u.departement))).sort(),
        [users]
    );

    const filteredUsers = useMemo(() => {
        return users.filter(user => {
            const matchesSearch =
                user.nom.toLowerCase().includes(filters.search.toLowerCase()) ||
                user.preNom.toLowerCase().includes(filters.search.toLowerCase()) ||
                user.email.toLowerCase().includes(filters.search.toLowerCase()) ||
                (user.poste?.toLowerCase() || '').includes(filters.search.toLowerCase()) ||
                (user.numeroEmploye?.toLowerCase() || '').includes(filters.search.toLowerCase());

            const matchesStatus =
                filters.status === 'all' ||
                (filters.status === 'active' && user.active) ||
                (filters.status === 'inactive' && !user.active);

            const matchesDepartment =
                filters.department === 'all' || user.departement === filters.department;

            return matchesSearch && matchesStatus && matchesDepartment;
        });
    }, [users, filters]);

    if (loading) return <LoadingSpinner />;

    return (
        <div className="min-h-screen bg-slate-50 p-3 sm:p-4 lg:p-6">
            <div className="max-w-7xl mx-auto space-y-4 lg:space-y-6">
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-2xl font-semibold text-slate-900">Gestion des Utilisateurs</h1>
                        <p className="text-slate-600 mt-2">Gérez les comptes et permissions des utilisateurs</p>
                    </div>
                </div>

                <MetricsSection users={users} />

                <SearchAndFilters
                    filters={filters}
                    departments={departments}
                    onChange={setFilters}
                    onRefresh={refreshData}
                    onAddUser={() => setShowAddModal(true)}
                />

                <div className="space-y-3 lg:space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg lg:text-xl font-semibold text-slate-900">
                            {filteredUsers.length} utilisateur{filteredUsers.length > 1 ? 's' : ''}
                        </h2>
                    </div>

                    {filteredUsers.length === 0 ? (
                        <Card className="border border-slate-200">
                            <CardContent className="p-12 text-center">
                                <Users className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                                <p className="text-xl text-slate-500">Aucun utilisateur trouvé</p>
                                <p className="text-slate-400">Modifiez vos critères de recherche</p>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="space-y-3 lg:space-y-4">
                            {filteredUsers.map(user => (
                                <UserList
                                    key={user.id}
                                    users={[user]}
                                    onUpdate={updateUser}
                                    onToggleStatus={toggleUserStatus}
                                />
                            ))}
                        </div>
                    )}
                </div>

                <AddUserModal
                    isOpen={showAddModal}
                    onClose={() => setShowAddModal(false)}
                    onAdd={addUser}
                />
            </div>
        </div>
    );
};

export default UserManagement;