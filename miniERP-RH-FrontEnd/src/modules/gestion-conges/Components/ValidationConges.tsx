
import { useEffect, useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle
} from "@/components/ui/dialog"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Calendar, User, Clock, Eye } from "lucide-react"

interface DemandeConge {
    id: number;
    dateDebut: string;
    dateFin: string;
    nombreJours: number;
    typeConge: string;
    motif: string;
    employeNom: string;
    statut?: string;
}

export const ValidationConges = () => {
    const [demandes, setDemandes] = useState<DemandeConge[]>([])
    const [loading, setLoading] = useState(true)
    const [commentaires, setCommentaires] = useState<{ [key: number]: string }>({})
    const [validating, setValidating] = useState<{ [key: number]: boolean }>({})
    const [selectedDemande, setSelectedDemande] = useState<DemandeConge | null>(null)
    const [isModalOpen, setIsModalOpen] = useState(false)

    useEffect(() => {
        const fetchDemandesConges = async () => {
            try {
                setLoading(true)
                const token = localStorage.getItem('token');
                const userData = localStorage.getItem('userData');
                if (!userData) {
                    throw new Error("User data not found in localStorage");
                }
                const managerId = JSON.parse(userData).id;

                const response = await fetch(`http://localhost:8080/api/gestion-conge/list-demande-conge/${managerId}`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (!response.ok) {
                    throw new Error(`Erreur ${response.status}: ${response.statusText}`);
                }

                const data = await response.json();
                console.log("----API Response:", data);

                let demandesArray: DemandeConge[] = [];

                if (Array.isArray(data)) {
                    demandesArray = data.map((item) => {
                        if (typeof item === 'object' && !item.hasOwnProperty('id')) {
                            const [, value] = Object.entries(item)[0];
                            return value as DemandeConge;
                        }
                        return item as DemandeConge;
                    });
                }

                setDemandes(demandesArray);

            } catch (error) {
                console.error("Erreur lors de la récupération des demandes de congés:", error);
                toast.error("Erreur lors du chargement des demandes de congés");
                setDemandes([]);
            } finally {
                setLoading(false);
            }
        };

        fetchDemandesConges();
    }, []);

    const handleCommentaireChange = (demandeId: number, commentaire: string) => {
        setCommentaires(prev => ({
            ...prev,
            [demandeId]: commentaire
        }));
    };

    const handleValidation = async (demandeId: number, statut: 'APPROUVE' | 'REJETE') => {
        try {
            setValidating(prev => ({ ...prev, [demandeId]: true }));

            const token = localStorage.getItem('token');
            const userData = localStorage.getItem('userData');
            if (!token) {
                throw new Error("Token not found in localStorage");
            }
            if (!userData) {
                throw new Error("User data not found in localStorage");
            }

            const managerId = JSON.parse(userData).id;
            const commentaire = commentaires[demandeId] || '';

            const response = await fetch(`http://localhost:8080/api/gestion-conge/validation-demande/${managerId}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    idDemande: demandeId,
                    decision: statut,
                    commentaire: commentaire
                })
            });

            if (!response.ok) {
                throw new Error(`Erreur ${response.status}: ${response.statusText}`);
            }

            toast.success(`Demande ${statut === 'APPROUVE' ? 'approuvée' : 'rejetée'} avec succès`);

            setDemandes(prev => prev.filter(demande => demande.id !== demandeId));
            setCommentaires(prev => {
                const newCommentaires = { ...prev };
                delete newCommentaires[demandeId];
                return newCommentaires;
            });
            setIsModalOpen(false);
            setSelectedDemande(null);

        } catch (error) {
            console.error("Erreur lors de la validation:", error);
            toast.error("Erreur lors de la validation de la demande");
        } finally {
            setValidating(prev => ({ ...prev, [demandeId]: false }));
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    const getStatutDisplay = (statut: string | undefined) => {
        if (!statut) return null;

        const statutConfig = {
            'ACCEPTEE': { text: 'Approuvé', className: 'bg-green-50 text-green-700 border-green-200' },
            'REFUSEE': { text: 'Rejeté', className: 'bg-red-50 text-red-700 border-red-200' },
            'EN_ATTENTE': { text: 'En attente', className: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
            'PENDING': { text: 'En attente', className: 'bg-yellow-50 text-yellow-700 border-yellow-200' }
        };

        return statutConfig[statut as keyof typeof statutConfig] || {
            text: statut,
            className: 'bg-gray-50 text-gray-700 border-gray-200'
        };
    };

    const openModal = (demande: DemandeConge) => {
        setSelectedDemande(demande);
        setIsModalOpen(true);
    };

    return (
        <div className="bg-white rounded-lg shadow-md p-4 md:p-6 border border-gray-200">
            <h2 className="text-lg md:text-xl font-semibold text-gray-800 mb-6">
                Validation des demandes de congés
            </h2>

            {loading ? (
                <div className="text-center py-8">
                    <span className="text-gray-500">Chargement des demandes...</span>
                </div>
            ) : demandes.length > 0 ? (
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Employé</TableHead>
                            <TableHead>Type de congé</TableHead>
                            <TableHead>Période</TableHead>
                            <TableHead>Durée</TableHead>
                            <TableHead>Statut</TableHead>
                            <TableHead>Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {demandes.map((demande) => (
                            <TableRow key={demande.id} className="cursor-pointer hover:bg-gray-50">
                                <TableCell className="font-medium">
                                    <div className="flex items-center">
                                        <User className="w-4 h-4 mr-2 text-gray-500" />
                                        {demande.employeNom}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <span className="px-2 py-1 text-xs font-medium bg-blue-50 text-blue-700 rounded-full">
                                        {demande.typeConge}
                                    </span>
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center text-sm text-gray-600">
                                        <Calendar className="w-4 h-4 mr-1" />
                                        {formatDate(demande.dateDebut)} - {formatDate(demande.dateFin)}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center text-sm text-gray-600">
                                        <Clock className="w-4 h-4 mr-1" />
                                        {demande.nombreJours} jour{demande.nombreJours > 1 ? 's' : ''}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    {demande.statut && (
                                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatutDisplay(demande.statut)?.className}`}>
                                            {getStatutDisplay(demande.statut)?.text}
                                        </span>
                                    )}
                                </TableCell>
                                <TableCell>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => openModal(demande)}
                                        className="flex items-center gap-1"
                                    >
                                        <Eye className="w-4 h-4" />
                                        Valider
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            ) : (
                <div className="text-center py-8">
                    <span className="text-gray-500">Aucune demande de congé en attente de validation</span>
                </div>
            )}

            {/* Modal de validation */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <User className="w-5 h-5" />
                            Validation de la demande
                        </DialogTitle>
                        <DialogDescription>
                            Examinez les détails de la demande et ajoutez un commentaire pour la validation.
                        </DialogDescription>
                    </DialogHeader>

                    {selectedDemande && (
                        <div className="space-y-4">
                            {/* Détails de la demande */}
                            <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                                <div className="flex justify-between items-start">
                                    <h4 className="font-semibold text-gray-800">{selectedDemande.employeNom}</h4>
                                    <span className="px-2 py-1 text-xs font-medium bg-blue-50 text-blue-700 rounded-full">
                                        {selectedDemande.typeConge}
                                    </span>
                                </div>

                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <span className="text-gray-500">Du:</span>
                                        <div className="font-medium">{formatDate(selectedDemande.dateDebut)}</div>
                                    </div>
                                    <div>
                                        <span className="text-gray-500">Au:</span>
                                        <div className="font-medium">{formatDate(selectedDemande.dateFin)}</div>
                                    </div>
                                    <div>
                                        <span className="text-gray-500">Durée:</span>
                                        <div className="font-medium">{selectedDemande.nombreJours} jour{selectedDemande.nombreJours > 1 ? 's' : ''}</div>
                                    </div>
                                    {selectedDemande.statut && (
                                        <div>
                                            <span className="text-gray-500">Statut:</span>
                                            <div className="font-medium">{getStatutDisplay(selectedDemande.statut)?.text}</div>
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <span className="text-gray-500 text-sm">Motif:</span>
                                    <p className="text-gray-800 mt-1">{selectedDemande.motif}</p>
                                </div>
                            </div>

                            {/* Section commentaire */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">
                                    Commentaire de validation
                                </label>
                                <Input
                                    placeholder="Ajoutez un commentaire pour justifier votre décision..."
                                    value={commentaires[selectedDemande.id] || ''}
                                    onChange={(e) => handleCommentaireChange(selectedDemande.id, e.target.value)}
                                    className="w-full"
                                />
                            </div>
                        </div>
                    )}

                    <DialogFooter className="gap-2">
                        <Button
                            variant="outline"
                            onClick={() => setIsModalOpen(false)}
                        >
                            Annuler
                        </Button>
                        {selectedDemande && (
                            <>
                                <Button
                                    onClick={() => handleValidation(selectedDemande.id, 'REJETE')}
                                    disabled={validating[selectedDemande.id]}
                                    variant="destructive"
                                >
                                    {validating[selectedDemande.id] ? 'Validation...' : 'Rejeter'}
                                </Button>
                                <Button
                                    onClick={() => handleValidation(selectedDemande.id, 'APPROUVE')}
                                    disabled={validating[selectedDemande.id]}
                                    className="bg-green-600 hover:bg-green-700 text-white"
                                >
                                    {validating[selectedDemande.id] ? 'Validation...' : 'Approuver'}
                                </Button>
                            </>
                        )}
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
