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
        <div className="bg-white rounded-2xl shadow-lg p-3 sm:p-4 md:p-6 lg:p-8 border border-blue-100 w-full max-w-full overflow-hidden">
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-blue-700 mb-4 sm:mb-6 md:mb-8 flex items-center gap-2 flex-wrap">
                <Calendar className="w-5 sm:w-5 md:w-6 h-5 sm:h-5 md:h-6 text-blue-400 flex-shrink-0" />
                <span className="break-words">Validation des demandes de congés</span>
            </h2>

            {loading ? (
                <div className="text-center py-8 sm:py-10 md:py-12">
                    <span className="text-blue-400 text-sm sm:text-base">Chargement des demandes...</span>
                </div>
            ) : demandes.length > 0 ? (
                <div className="w-full">
                    {/* Vue desktop/tablette */}
                    <div className="hidden sm:block overflow-x-auto rounded-xl border border-blue-50 bg-white">
                        <Table className="min-w-[650px] text-sm lg:text-base w-full">
                            <TableHeader>
                                <TableRow className="bg-blue-50">
                                    <TableHead className="text-blue-700 font-semibold whitespace-nowrap px-2 sm:px-4">Employé</TableHead>
                                    <TableHead className="text-blue-700 font-semibold whitespace-nowrap px-2 sm:px-4">Type</TableHead>
                                    <TableHead className="text-blue-700 font-semibold whitespace-nowrap px-2 sm:px-4">Période</TableHead>
                                    <TableHead className="text-blue-700 font-semibold whitespace-nowrap px-2 sm:px-4">Durée</TableHead>
                                    <TableHead className="text-blue-700 font-semibold whitespace-nowrap px-2 sm:px-4">Statut</TableHead>
                                    <TableHead className="text-blue-700 font-semibold whitespace-nowrap px-2 sm:px-4">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {demandes.map((demande) => (
                                    <TableRow key={demande.id} className="hover:bg-blue-50/40 transition-colors">
                                        <TableCell className="font-medium px-2 sm:px-4">
                                            <div className="flex items-center gap-1 sm:gap-2">
                                                <User className="w-4 h-4 text-blue-400 flex-shrink-0" />
                                                <span className="truncate max-w-[100px] sm:max-w-[120px] lg:max-w-[200px]">{demande.employeNom}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="px-2 sm:px-4">
                                            <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded-full whitespace-nowrap">
                                                {demande.typeConge}
                                            </span>
                                        </TableCell>
                                        <TableCell className="px-2 sm:px-4">
                                            <div className="flex items-center text-xs sm:text-sm text-blue-700">
                                                <Calendar className="w-4 h-4 mr-1 flex-shrink-0" />
                                                <span className="whitespace-nowrap">{formatDate(demande.dateDebut)} - {formatDate(demande.dateFin)}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="px-2 sm:px-4">
                                            <div className="flex items-center text-xs sm:text-sm text-blue-700">
                                                <Clock className="w-4 h-4 mr-1 flex-shrink-0" />
                                                <span className="whitespace-nowrap">{demande.nombreJours} jour{demande.nombreJours > 1 ? 's' : ''}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="px-2 sm:px-4">
                                            {demande.statut && (
                                                <span className={`px-2 py-1 text-xs font-medium rounded-full whitespace-nowrap ${getStatutDisplay(demande.statut)?.className}`}>
                                                    {getStatutDisplay(demande.statut)?.text}
                                                </span>
                                            )}
                                        </TableCell>
                                        <TableCell className="px-2 sm:px-4">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => openModal(demande)}
                                                className="flex items-center gap-1 border-blue-200 hover:bg-blue-100/60 px-2 py-1 sm:px-3 sm:py-1.5 text-xs sm:text-sm rounded-lg whitespace-nowrap"
                                            >
                                                <Eye className="w-4 h-4 text-blue-500" />
                                                <span className="hidden sm:inline">Valider</span>
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Vue mobile */}
                    <div className="sm:hidden space-y-3">
                        {demandes.map((demande) => (
                            <div key={demande.id} className="bg-blue-50/30 rounded-xl p-4 border border-blue-100">
                                <div className="flex justify-between items-start mb-3">
                                    <div className="flex items-center gap-2">
                                        <User className="w-4 h-4 text-blue-400" />
                                        <span className="font-medium text-blue-800 text-sm">{demande.employeNom}</span>
                                    </div>
                                    <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded-full">
                                        {demande.typeConge}
                                    </span>
                                </div>

                                <div className="space-y-2 text-xs text-blue-700">
                                    <div className="flex items-center gap-1">
                                        <Calendar className="w-3 h-3" />
                                        <span>{formatDate(demande.dateDebut)} - {formatDate(demande.dateFin)}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Clock className="w-3 h-3" />
                                        <span>{demande.nombreJours} jour{demande.nombreJours > 1 ? 's' : ''}</span>
                                    </div>
                                    {demande.statut && (
                                        <div className="flex items-center gap-2">
                                            <span className="text-blue-500">Statut:</span>
                                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatutDisplay(demande.statut)?.className}`}>
                                                {getStatutDisplay(demande.statut)?.text}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                <div className="mt-3 pt-3 border-t border-blue-200">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => openModal(demande)}
                                        className="w-full flex items-center justify-center gap-2 border-blue-200 hover:bg-blue-100/60 text-sm rounded-lg"
                                    >
                                        <Eye className="w-4 h-4 text-blue-500" />
                                        Valider la demande
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                <div className="text-center py-8 sm:py-10 md:py-12">
                    <span className="text-blue-400 text-sm sm:text-base">Aucune demande de congé en attente de validation</span>
                </div>
            )}

            {/* Modal de validation */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="w-[95vw] max-w-[420px] sm:max-w-[500px] rounded-2xl border border-blue-100 bg-white p-4 sm:p-6 max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-blue-700 font-bold text-base sm:text-lg">
                            <User className="w-5 h-5 text-blue-400 flex-shrink-0" />
                            <span className="break-words">Validation de la demande</span>
                        </DialogTitle>
                        <DialogDescription className="text-blue-500 text-xs sm:text-sm">
                            Examinez les détails de la demande et ajoutez un commentaire pour la validation.
                        </DialogDescription>
                    </DialogHeader>

                    {selectedDemande && (
                        <div className="space-y-4 my-4">
                            {/* Détails de la demande */}
                            <div className="bg-blue-50 p-3 sm:p-4 rounded-xl space-y-3 border border-blue-100">
                                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                                    <h4 className="font-semibold text-blue-800 text-sm sm:text-base break-words">{selectedDemande.employeNom}</h4>
                                    <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded-full self-start">
                                        {selectedDemande.typeConge}
                                    </span>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-xs sm:text-sm">
                                    <div>
                                        <span className="text-blue-500 block">Du:</span>
                                        <div className="font-medium text-blue-800">{formatDate(selectedDemande.dateDebut)}</div>
                                    </div>
                                    <div>
                                        <span className="text-blue-500 block">Au:</span>
                                        <div className="font-medium text-blue-800">{formatDate(selectedDemande.dateFin)}</div>
                                    </div>
                                    <div>
                                        <span className="text-blue-500 block">Durée:</span>
                                        <div className="font-medium text-blue-800">{selectedDemande.nombreJours} jour{selectedDemande.nombreJours > 1 ? 's' : ''}</div>
                                    </div>
                                    {selectedDemande.statut && (
                                        <div>
                                            <span className="text-blue-500 block">Statut:</span>
                                            <div className="font-medium text-blue-800">{getStatutDisplay(selectedDemande.statut)?.text}</div>
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <span className="text-blue-500 text-xs sm:text-sm block mb-1">Motif:</span>
                                    <p className="text-blue-800 text-xs sm:text-sm break-words">{selectedDemande.motif}</p>
                                </div>
                            </div>

                            {/* Section commentaire */}
                            <div className="space-y-2">
                                <label className="text-xs sm:text-sm font-medium text-blue-700 block">
                                    Commentaire de validation
                                </label>
                                <Input
                                    placeholder="Ajoutez un commentaire pour justifier votre décision..."
                                    value={commentaires[selectedDemande.id] || ''}
                                    onChange={(e) => handleCommentaireChange(selectedDemande.id, e.target.value)}
                                    className="w-full border-blue-100 rounded-lg text-xs sm:text-sm"
                                />
                            </div>
                        </div>
                    )}

                    <DialogFooter className="gap-2 mt-4 flex flex-col sm:flex-row">
                        <Button
                            variant="outline"
                            onClick={() => setIsModalOpen(false)}
                            className="rounded-lg border-blue-200 w-full sm:w-auto order-3 sm:order-1"
                        >
                            Annuler
                        </Button>
                        {selectedDemande && (
                            <>
                                <Button
                                    onClick={() => handleValidation(selectedDemande.id, 'REJETE')}
                                    disabled={validating[selectedDemande.id]}
                                    variant="destructive"
                                    className="rounded-lg w-full sm:w-auto order-2 sm:order-2"
                                >
                                    {validating[selectedDemande.id] ? 'Validation...' : 'Rejeter'}
                                </Button>
                                <Button
                                    onClick={() => handleValidation(selectedDemande.id, 'APPROUVE')}
                                    disabled={validating[selectedDemande.id]}
                                    className="bg-green-600 hover:bg-green-700 text-white rounded-lg w-full sm:w-auto order-1 sm:order-3"
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