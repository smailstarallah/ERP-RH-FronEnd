import React, { useState, useEffect, useCallback } from "react";
import {
    Button
} from "@/components/ui/button";

import {
    Input
} from "@/components/ui/input";
import {
    Label
} from "@/components/ui/label";
import {
    Badge
} from "@/components/ui/badge";
import {
    Alert,
    AlertDescription
} from "@/components/ui/alert";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    User,
    Mail,
    Phone,
    MapPin,
    Calendar,
    Building2,
    Edit3,
    Save,
    X,
    Eye,
    EyeOff,
    Loader2,
    AlertCircle,
    Clock,
    CreditCard,
    Badge as BadgeIcon,
    Settings,
    Briefcase,
    Shield,
    FileText,
    Bell
} from "lucide-react";

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
    departement: string;
}

// Interface pour les congés
interface CongeStats {
    disponibles: number;
    pris: number;
    enAttente: number;
    total: number;
}

// Utilitaires
const formatDate = (dateString: string): string => {
    if (!dateString) return 'Non renseigné';
    try {
        return new Date(dateString).toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: 'long',
            year: 'numeric'
        });
    } catch {
        return 'Date invalide';
    }
};

const formatDateForInput = (dateString: string): string => {
    if (!dateString) return '';
    try {
        return new Date(dateString).toISOString().split('T')[0];
    } catch {
        return '';
    }
};

const formatDateTime = (dateString: string): string => {
    if (!dateString) return 'Non renseigné';
    try {
        return new Date(dateString).toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    } catch {
        return 'Date invalide';
    }
};

const getInitials = (nom: string, prenom: string): string => {
    return `${nom?.charAt(0) || ''}${prenom?.charAt(0) || ''}`.toUpperCase();
};

// Options pour les sélecteurs
const departements = [
    "Développement",
    "Marketing",
    "Ressources Humaines",
    "Comptabilité",
    "Commercial",
    "Support",
    "Direction"
];

const userTypes = [
    "MANAGER",
    "EMPLOYE"
];

// Composant Avatar
const EmployeeAvatar: React.FC<{ employe: Employe; size?: 'sm' | 'md' | 'lg' }> = ({
    employe,
    size = 'md'
}) => {
    const sizeClasses = {
        sm: 'w-10 h-10 text-sm',
        md: 'w-12 h-12 text-base',
        lg: 'w-16 h-16 text-lg'
    };

    return (
        <div className={`${sizeClasses[size]} rounded-full bg-slate-700 text-white flex items-center justify-center font-medium border-2 border-slate-200`}>
            {getInitials(employe.nom, employe.preNom)}
        </div>
    );
};

// Composant de chargement
const LoadingState: React.FC = () => (
    <div className="flex items-center justify-center p-8">
        <div className="text-center space-y-3">
            <Loader2 className="w-6 h-6 animate-spin text-slate-600 mx-auto" />
            <p className="text-slate-600 text-sm">Chargement...</p>
        </div>
    </div>
);

// Composant d'erreur
const ErrorState: React.FC<{ error: string; onRetry: () => void }> = ({ error, onRetry }) => (
    <Alert variant="destructive" className="m-4">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription className="flex items-center justify-between">
            <span className="text-sm">{error}</span>
            <Button variant="outline" size="sm" onClick={onRetry}>
                Réessayer
            </Button>
        </AlertDescription>
    </Alert>
);

const useEmployeeProfile = () => {
    const [employe, setEmploye] = useState<Employe | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchEmployee = useCallback(async () => {
        const userData = localStorage.getItem('userData');
        const user = userData ? JSON.parse(userData) : null;
        const id = user.id;
        setLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`http://localhost:8080/api/users/get-user/${id}`, {
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { Authorization: `Bearer ${token}` } : {})
                }
            });

            const text = await res.text();
            if (!res.ok) throw new Error(text || `Erreur serveur (${res.status})`);

            try {
                const body = JSON.parse(text);
                setEmploye(body as Employe);
            } catch {
                // réponse texte non JSON
                setError(text || 'Réponse inattendue du serveur');
                setEmploye(null);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : String(err));
            setEmploye(null);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchEmployee(); }, [fetchEmployee]);

    return { employe, loading, error, refetch: fetchEmployee };
};

// Hook pour gérer les statistiques de congés
const useCongeStats = () => {
    const [stats] = useState<CongeStats>({
        disponibles: 15,
        pris: 5,
        enAttente: 2,
        total: 22
    });

    return stats;
};

// Section changement de mot de passe
const PasswordChangeSection: React.FC = () => {
    const [passwords, setPasswords] = useState({
        current: '',
        new: '',
        confirm: ''
    });
    const [showPasswords, setShowPasswords] = useState({
        current: false,
        new: false,
        confirm: false
    });
    const [isLoading, setIsLoading] = useState(false);
    const [showForm, setShowForm] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (passwords.new !== passwords.confirm) {
            alert('Les mots de passe ne correspondent pas');
            return;
        }

        setIsLoading(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 800));
            setPasswords({ current: '', new: '', confirm: '' });
            setShowForm(false);
            alert('Mot de passe modifié');
        } catch (error) {
            alert('Erreur lors de la modification');
        } finally {
            setIsLoading(false);
        }
    };

    if (!showForm) {
        return (
            <div className="pt-3">
                <Button onClick={() => setShowForm(true)} variant="outline" size="sm" className="w-full">
                    <Settings className="w-4 h-4 mr-2" />
                    Modifier le mot de passe
                </Button>
            </div>
        );
    }

    return (
        <div className="mt-4 p-4 border rounded-lg bg-slate-50">
            <div className="flex items-center gap-2 mb-3">
                <Settings className="w-4 h-4 text-slate-600" />
                <h3 className="font-medium text-slate-900">Modification du mot de passe</h3>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
                <div>
                    <Label className="text-sm text-slate-700">Mot de passe actuel</Label>
                    <div className="relative mt-1">
                        <Input
                            type={showPasswords.current ? "text" : "password"}
                            value={passwords.current}
                            onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                            required
                            className="pr-10"
                        />
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
                            onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                        >
                            {showPasswords.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                        <Label className="text-sm text-slate-700">Nouveau mot de passe</Label>
                        <div className="relative mt-1">
                            <Input
                                type={showPasswords.new ? "text" : "password"}
                                value={passwords.new}
                                onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
                                required
                                minLength={6}
                                className="pr-10"
                            />
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
                                onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                            >
                                {showPasswords.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </Button>
                        </div>
                    </div>

                    <div>
                        <Label className="text-sm text-slate-700">Confirmer</Label>
                        <div className="relative mt-1">
                            <Input
                                type={showPasswords.confirm ? "text" : "password"}
                                value={passwords.confirm}
                                onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                                required
                                minLength={6}
                                className="pr-10"
                            />
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
                                onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                            >
                                {showPasswords.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </Button>
                        </div>
                    </div>
                </div>

                <div className="flex gap-2 pt-2">
                    <Button type="submit" disabled={isLoading} size="sm">
                        {isLoading && <Loader2 className="w-4 h-4 mr-1 animate-spin" />}
                        <Save className="w-4 h-4 mr-1" />
                        Confirmer
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowForm(false)}
                        size="sm"
                    >
                        <X className="w-4 h-4 mr-1" />
                        Annuler
                    </Button>
                </div>
            </form>
        </div>
    );
};

// Composant principal Profil
export const Profil: React.FC = () => {
    const { employe, loading, error, refetch } = useEmployeeProfile();
    const congeStats = useCongeStats();
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState<Employe | null>(null);
    const [isSaving] = useState(false);

    useEffect(() => {
        if (employe) {
            setEditData(employe);
        }
    }, [employe]);

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
                body: JSON.stringify(editData),
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
            console.log('Réponse API (update-user):', parsed || text);
            setIsEditing(false);
        } catch (error) {
            console.error('Erreur lors de la requête update-user:', error);
        }
    };

    if (loading) return <LoadingState />;
    if (error) return <ErrorState error={error} onRetry={refetch} />;
    if (!employe) return <ErrorState error="Employé non trouvé" onRetry={refetch} />;

    return (
        <div className="w-full h-full bg-white overflow-hidden">
            <div className="p-3 space-y-3 h-full overflow-y-auto scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-transparent">
                {/* Header */}
                <div className="bg-white border border-slate-200 rounded-lg p-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                            <EmployeeAvatar employe={employe} size="md" />
                            <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <h1 className="font-semibold text-slate-900 truncate text-base">
                                        {employe.nom} {employe.preNom}
                                    </h1>
                                    <Badge className={`text-xs ${employe.active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"} border-0`}>
                                        {employe.active ? "Actif" : "Inactif"}
                                    </Badge>
                                </div>
                                <div className="text-xs text-slate-600 space-y-0.5">
                                    <div className="flex items-center gap-1">
                                        <Briefcase className="w-3 h-3 flex-shrink-0" />
                                        <span className="truncate">{employe.poste}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Building2 className="w-3 h-3 flex-shrink-0" />
                                        <span className="truncate">{employe.departement}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-1 sm:flex-col">
                            <Button
                                variant={isEditing ? "destructive" : "outline"}
                                onClick={() => {
                                    setIsEditing(!isEditing);
                                    if (isEditing) {
                                        setEditData(employe);
                                    }
                                }}
                                size="sm"
                                className="h-7 px-2 text-xs flex-1 sm:flex-none"
                            >
                                {isEditing ? <X className="w-3 h-3 sm:mr-1" /> : <Edit3 className="w-3 h-3 sm:mr-1" />}
                                <span className="hidden sm:inline">{isEditing ? "Annuler" : "Modifier"}</span>
                            </Button>
                            {isEditing && (
                                <Button onClick={handleSave} disabled={isSaving} size="sm" className="h-7 px-2 text-xs flex-1 sm:flex-none">
                                    {isSaving && <Loader2 className="w-3 h-3 sm:mr-1 animate-spin" />}
                                    <Save className="w-3 h-3 sm:mr-1" />
                                    <span className="hidden sm:inline">Sauvegarder</span>
                                </Button>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center gap-1 text-xs text-slate-500 pt-1">
                        <Clock className="w-3 h-3 flex-shrink-0" />
                        <span className="truncate">Dernière connexion : {formatDateTime(employe.dernierConnexion)}</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-4 gap-3">
                    {/* Informations principales */}
                    <div className="xl:col-span-3 space-y-3">
                        {/* Informations personnelles */}
                        <div className="bg-white border border-slate-200 rounded-lg p-4">
                            <div className="flex items-center gap-2 mb-3">
                                <User className="w-4 h-4 text-slate-600" />
                                <h2 className="font-medium text-slate-900">Informations personnelles</h2>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                <div>
                                    <Label className="text-xs text-slate-600 uppercase tracking-wide">Nom</Label>
                                    {isEditing ? (
                                        <Input
                                            value={editData?.nom || ''}
                                            onChange={(e) => setEditData(editData ? { ...editData, nom: e.target.value } : null)}
                                            className="mt-1 h-8"
                                        />
                                    ) : (
                                        <div className="mt-1 px-3 py-2 bg-slate-50 rounded text-sm border h-8 flex items-center">{employe.nom}</div>
                                    )}
                                </div>

                                <div>
                                    <Label className="text-xs text-slate-600 uppercase tracking-wide">Prénom</Label>
                                    {isEditing ? (
                                        <Input
                                            value={editData?.preNom || ''}
                                            onChange={(e) => setEditData(editData ? { ...editData, preNom: e.target.value } : null)}
                                            className="mt-1 h-8"
                                        />
                                    ) : (
                                        <div className="mt-1 px-3 py-2 bg-slate-50 rounded text-sm border h-8 flex items-center">{employe.preNom}</div>
                                    )}
                                </div>

                                <div>
                                    <Label className="text-xs text-slate-600 uppercase tracking-wide">CIN</Label>
                                    {isEditing ? (
                                        <Input
                                            value={editData?.cin || ''}
                                            onChange={(e) => setEditData(editData ? { ...editData, cin: e.target.value } : null)}
                                            className="mt-1 h-8"
                                        />
                                    ) : (
                                        <div className="mt-1 px-3 py-2 bg-slate-50 rounded text-sm border h-8 flex items-center">
                                            <BadgeIcon className="w-3 h-3 mr-2 text-slate-400" />
                                            {employe.cin || 'Non renseigné'}
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <Label className="text-xs text-slate-600 uppercase tracking-wide">Email</Label>
                                    {isEditing ? (
                                        <Input
                                            type="email"
                                            value={editData?.email || ''}
                                            onChange={(e) => setEditData(editData ? { ...editData, email: e.target.value } : null)}
                                            className="mt-1 h-8"
                                        />
                                    ) : (
                                        <div className="mt-1 px-3 py-2 bg-slate-50 rounded text-sm border h-8 flex items-center">
                                            <Mail className="w-3 h-3 mr-2 text-slate-400 flex-shrink-0" />
                                            <span className="truncate">{employe.email}</span>
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <Label className="text-xs text-slate-600 uppercase tracking-wide">Téléphone</Label>
                                    {isEditing ? (
                                        <Input
                                            value={editData?.telephone || ''}
                                            onChange={(e) => setEditData(editData ? { ...editData, telephone: e.target.value } : null)}
                                            className="mt-1 h-8"
                                        />
                                    ) : (
                                        <div className="mt-1 px-3 py-2 bg-slate-50 rounded text-sm border h-8 flex items-center">
                                            <Phone className="w-3 h-3 mr-2 text-slate-400 flex-shrink-0" />
                                            {employe.telephone}
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <Label className="text-xs text-slate-600 uppercase tracking-wide">Date de naissance</Label>
                                    {isEditing ? (
                                        <Input
                                            type="date"
                                            value={formatDateForInput(editData?.dateNaissance || '')}
                                            onChange={(e) => setEditData(editData ? { ...editData, dateNaissance: e.target.value } : null)}
                                            className="mt-1 h-8"
                                        />
                                    ) : (
                                        <div className="mt-1 px-3 py-2 bg-slate-50 rounded text-sm border h-8 flex items-center">
                                            <Calendar className="w-3 h-3 mr-2 text-slate-400 flex-shrink-0" />
                                            {formatDate(employe.dateNaissance)}
                                        </div>
                                    )}
                                </div>

                                <div className="sm:col-span-2 lg:col-span-3">
                                    <Label className="text-xs text-slate-600 uppercase tracking-wide">Adresse</Label>
                                    {isEditing ? (
                                        <Input
                                            value={editData?.adresse || ''}
                                            onChange={(e) => setEditData(editData ? { ...editData, adresse: e.target.value } : null)}
                                            className="mt-1 h-8"
                                        />
                                    ) : (
                                        <div className="mt-1 px-3 py-2 bg-slate-50 rounded text-sm border h-8 flex items-center">
                                            <MapPin className="w-3 h-3 mr-2 text-slate-400 flex-shrink-0" />
                                            <span className="truncate">{employe.adresse || 'Non renseignée'}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Informations professionnelles */}
                        <div className="bg-white border border-slate-200 rounded-lg p-4">
                            <div className="flex items-center gap-2 mb-3">
                                <Briefcase className="w-4 h-4 text-slate-600" />
                                <h2 className="font-medium text-slate-900">Informations professionnelles</h2>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                <div>
                                    <Label className="text-xs text-slate-600 uppercase tracking-wide">N° Employé</Label>
                                    {isEditing ? (
                                        <Input
                                            value={editData?.numeroEmploye || ''}
                                            onChange={(e) => setEditData(editData ? { ...editData, numeroEmploye: e.target.value } : null)}
                                            className="mt-1 h-8"
                                        />
                                    ) : (
                                        <div className="mt-1 px-3 py-2 bg-slate-50 rounded text-sm border h-8 flex items-center">
                                            <BadgeIcon className="w-3 h-3 mr-2 text-slate-400" />
                                            {employe.numeroEmploye}
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <Label className="text-xs text-slate-600 uppercase tracking-wide">Poste</Label>
                                    {isEditing ? (
                                        <Input
                                            value={editData?.poste || ''}
                                            onChange={(e) => setEditData(editData ? { ...editData, poste: e.target.value } : null)}
                                            className="mt-1 h-8"
                                        />
                                    ) : (
                                        <div className="mt-1 px-3 py-2 bg-slate-50 rounded text-sm border h-8 flex items-center">
                                            <Briefcase className="w-3 h-3 mr-2 text-slate-400" />
                                            {employe.poste}
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <Label className="text-xs text-slate-600 uppercase tracking-wide">Département</Label>
                                    {isEditing ? (
                                        <Select
                                            value={editData?.departement || ''}
                                            onValueChange={(value) => setEditData(editData ? { ...editData, departement: value } : null)}
                                        >
                                            <SelectTrigger className="h-8">
                                                <SelectValue placeholder="Sélectionner..." />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {departements.map((dept) => (
                                                    <SelectItem key={dept} value={dept}>
                                                        {dept}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    ) : (
                                        <div className="mt-1 px-3 py-2 bg-slate-50 rounded text-sm border h-8 flex items-center">
                                            <Building2 className="w-3 h-3 mr-2 text-slate-400" />
                                            {employe.departement}
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <Label className="text-xs text-slate-600 uppercase tracking-wide">Date d'embauche</Label>
                                    {isEditing ? (
                                        <Input
                                            type="date"
                                            value={formatDateForInput(editData?.dateEmbauche || '')}
                                            onChange={(e) => setEditData(editData ? { ...editData, dateEmbauche: e.target.value } : null)}
                                            className="mt-1 h-8"
                                        />
                                    ) : (
                                        <div className="mt-1 px-3 py-2 bg-slate-50 rounded text-sm border h-8 flex items-center">
                                            <Calendar className="w-3 h-3 mr-2 text-slate-400" />
                                            {formatDate(employe.dateEmbauche || '')}
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <Label className="text-xs text-slate-600 uppercase tracking-wide">Type d'utilisateur</Label>
                                    {isEditing ? (
                                        <Select
                                            value={editData?.userType || ''}
                                            onValueChange={(value) => setEditData(editData ? { ...editData, userType: value } : null)}
                                        >
                                            <SelectTrigger className="h-8">
                                                <SelectValue placeholder="Sélectionner..." />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {userTypes.map((type) => (
                                                    <SelectItem key={type} value={type}>
                                                        {type}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    ) : (
                                        <div className="mt-1 px-3 py-2 bg-slate-50 rounded text-sm border h-8 flex items-center">
                                            <Shield className="w-3 h-3 mr-2 text-slate-400" />
                                            {employe.userType}
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <Label className="text-xs text-slate-600 uppercase tracking-wide">Statut</Label>
                                    {isEditing ? (
                                        <Select
                                            value={editData?.active ? 'true' : 'false'}
                                            onValueChange={(value) => setEditData(editData ? { ...editData, active: value === 'true' } : null)}
                                        >
                                            <SelectTrigger className="h-8">
                                                <SelectValue placeholder="Sélectionner..." />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="true">Actif</SelectItem>
                                                <SelectItem value="false">Inactif</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    ) : (
                                        <div className="mt-1 px-3 py-2 bg-slate-50 rounded text-sm border h-8 flex items-center">
                                            <div className={`w-3 h-3 rounded-full mr-2 ${employe.active ? 'bg-green-500' : 'bg-red-500'}`} />
                                            {employe.active ? 'Actif' : 'Inactif'}
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <Label className="text-xs text-slate-600 uppercase tracking-wide">Salaire de base (MAD)</Label>
                                    {isEditing ? (
                                        <Input
                                            type="number"
                                            value={editData?.salairBase || ''}
                                            onChange={(e) => setEditData(editData ? { ...editData, salairBase: Number(e.target.value) } : null)}
                                            className="mt-1 h-8"
                                            min="0"
                                        />
                                    ) : (
                                        <div className="mt-1 px-3 py-2 bg-slate-50 rounded text-sm border h-8 flex items-center">
                                            <CreditCard className="w-3 h-3 mr-2 text-slate-400" />
                                            {employe.salairBase ? `${employe.salairBase.toLocaleString()} MAD` : 'Non renseigné'}
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <Label className="text-xs text-slate-600 uppercase tracking-wide">Taux horaire (MAD)</Label>
                                    {isEditing ? (
                                        <Input
                                            type="number"
                                            value={editData?.tauxHoraire || ''}
                                            onChange={(e) => setEditData(editData ? { ...editData, tauxHoraire: Number(e.target.value) } : null)}
                                            className="mt-1 h-8"
                                            min="0"
                                            step="0.01"
                                        />
                                    ) : (
                                        <div className="mt-1 px-3 py-2 bg-slate-50 rounded text-sm border h-8 flex items-center">
                                            <Clock className="w-3 h-3 mr-2 text-slate-400" />
                                            {employe.tauxHoraire ? `${employe.tauxHoraire} MAD/h` : 'Non renseigné'}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <PasswordChangeSection />
                        </div>

                        {/* Informations système */}
                        <div className="bg-white border border-slate-200 rounded-lg p-4">
                            <div className="flex items-center gap-2 mb-3">
                                <Settings className="w-4 h-4 text-slate-600" />
                                <h2 className="font-medium text-slate-900">Informations système</h2>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <Label className="text-xs text-slate-600 uppercase tracking-wide">Date de création</Label>
                                    <div className="mt-1 px-3 py-2 bg-slate-50 rounded text-sm border h-8 flex items-center">
                                        <Calendar className="w-3 h-3 mr-2 text-slate-400" />
                                        {formatDate(employe.dateCreation)}
                                    </div>
                                </div>

                                <div>
                                    <Label className="text-xs text-slate-600 uppercase tracking-wide">Dernière connexion</Label>
                                    <div className="mt-1 px-3 py-2 bg-slate-50 rounded text-sm border h-8 flex items-center">
                                        <Clock className="w-3 h-3 mr-2 text-slate-400" />
                                        {formatDateTime(employe.dernierConnexion)}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-3">
                        {/* Congés */}
                        <div className="bg-white border border-slate-200 rounded-lg p-4">
                            <div className="flex items-center gap-2 mb-3">
                                <Calendar className="w-4 h-4 text-slate-600" />
                                <h2 className="font-medium text-slate-900">Congés</h2>
                            </div>

                            <div className="space-y-2">
                                <div className="text-center p-3 bg-green-50 rounded border border-green-200">
                                    <div className="text-xl font-bold text-green-700">{congeStats.disponibles}</div>
                                    <div className="text-xs text-green-600">Disponibles</div>
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    <div className="text-center p-2 bg-blue-50 rounded border border-blue-200">
                                        <div className="text-sm font-bold text-blue-700">{congeStats.pris}</div>
                                        <div className="text-xs text-blue-600">Pris</div>
                                    </div>
                                    <div className="text-center p-2 bg-orange-50 rounded border border-orange-200">
                                        <div className="text-sm font-bold text-orange-700">{congeStats.enAttente}</div>
                                        <div className="text-xs text-orange-600">En attente</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="bg-white border border-slate-200 rounded-lg p-4">
                            <div className="flex items-center gap-2 mb-3">
                                <Settings className="w-4 h-4 text-slate-600" />
                                <h2 className="font-medium text-slate-900">Actions</h2>
                            </div>

                            <div className="space-y-2">
                                <Button variant="outline" size="sm" className="w-full justify-start h-8 text-xs">
                                    <Calendar className="w-3 h-3 mr-2" />
                                    Demander un congé
                                </Button>
                                <Button variant="outline" size="sm" className="w-full justify-start h-8 text-xs">
                                    <Clock className="w-3 h-3 mr-2" />
                                    Pointage
                                </Button>
                                <Button variant="outline" size="sm" className="w-full justify-start h-8 text-xs">
                                    <FileText className="w-3 h-3 mr-2" />
                                    Fiches de paie
                                </Button>
                            </div>
                        </div>

                        {/* Notifications */}
                        <div className="bg-white border border-slate-200 rounded-lg p-4">
                            <div className="flex items-center gap-2 mb-3">
                                <Bell className="w-4 h-4 text-slate-600" />
                                <h2 className="font-medium text-slate-900">Notifications</h2>
                            </div>

                            <div className="space-y-2">
                                <div className="p-2 bg-blue-50 rounded border border-blue-200">
                                    <div className="text-xs font-medium text-blue-800">Congé approuvé</div>
                                    <p className="text-xs text-blue-600">15-20 août validé</p>
                                </div>
                                <div className="p-2 bg-green-50 rounded border border-green-200">
                                    <div className="text-xs font-medium text-green-800">Fiche de paie</div>
                                    <p className="text-xs text-green-600">Juillet disponible</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profil;