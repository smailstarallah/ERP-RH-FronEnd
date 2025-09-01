import { useEffect, useState } from "react"
import { toast } from "sonner"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { Calendar, User, Clock, Eye, Inbox, FileWarning } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"

// --- Interfaces et Types (inchangés) ---
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

// --- Le Composant Amélioré ---
export const ValidationConges = () => {
    // --- State et Logique (inchangés) ---
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
        setCommentaires(prev => ({ ...prev, [demandeId]: commentaire }));
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

    // --- Fonctions utilitaires (inchangées) ---
    const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
    const getStatutDisplay = (statut?: string) => {
        const config = {
            'APPROUVE': { text: 'Approuvé', className: 'bg-green-100 text-green-800' },
            'REJETE': { text: 'Rejeté', className: 'bg-red-100 text-red-800' },
            'EN_ATTENTE': { text: 'En attente', className: 'bg-yellow-100 text-yellow-800' },
        };
        return config[statut as keyof typeof config] || { text: 'Indéfini', className: 'bg-gray-100 text-gray-800' };
    };
    const openModal = (demande: DemandeConge) => {
        setSelectedDemande(demande);
        setIsModalOpen(true);
    };

    // --- Rendu du composant ---
    return (
        <>
            <Card className="w-full shadow-lg border-gray-200/80">
                <CardHeader className="bg-blue-600 text-white rounded-t-lg p-6">
                    <div className="flex items-center space-x-4">
                        <FileWarning className="h-7 w-7" />
                        <div>
                            <CardTitle className="text-2xl font-bold">Validation des Congés</CardTitle>
                            <CardDescription className="text-blue-200">Examinez et traitez les demandes de votre équipe.</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-4 md:p-6">
                    {loading ? (
                        <div className="space-y-3">
                            {/* Skeletons pour Desktop */}
                            <div className="hidden sm:block space-y-2">
                                <Skeleton className="h-10 w-full" />
                                <Skeleton className="h-12 w-full" />
                                <Skeleton className="h-12 w-full" />
                            </div>
                            {/* Skeletons pour Mobile */}
                            <div className="sm:hidden space-y-3">
                                <Skeleton className="h-28 w-full rounded-lg" />
                                <Skeleton className="h-28 w-full rounded-lg" />
                            </div>
                        </div>
                    ) : demandes.length > 0 ? (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                            {/* Vue Desktop */}
                            <div className="hidden sm:block border rounded-lg max-h-60 overflow-y-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Employé</TableHead>
                                            <TableHead>Type</TableHead>
                                            <TableHead>Période</TableHead>
                                            <TableHead className="text-center">Jours</TableHead>
                                            <TableHead>Statut</TableHead>
                                            <TableHead className="text-right">Action</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {demandes.map((d) => (
                                            <TableRow key={d.id} className="align-middle">
                                                <TableCell className="font-medium">{d.employeNom}</TableCell>
                                                <TableCell>{d.typeConge}</TableCell>
                                                <TableCell>{`${formatDate(d.dateDebut)} - ${formatDate(d.dateFin)}`}</TableCell>
                                                <TableCell className="text-center">{d.nombreJours}</TableCell>
                                                <TableCell>
                                                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatutDisplay(d.statut).className}`}>
                                                        {getStatutDisplay(d.statut).text}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Button variant="outline" size="sm" onClick={() => openModal(d)}><Eye className="mr-2 h-4 w-4" /> Examiner</Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                            {/* Vue Mobile */}
                            <div className="sm:hidden space-y-3 max-h-60 overflow-y-auto">
                                {demandes.map((d) => (
                                    <Card key={d.id} className="p-4">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className="font-bold text-gray-800">{d.employeNom}</p>
                                                <p className="text-sm text-gray-500">{d.typeConge}</p>
                                            </div>
                                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatutDisplay(d.statut).className}`}>
                                                {getStatutDisplay(d.statut).text}
                                            </span>
                                        </div>
                                        <div className="border-t my-3"></div>
                                        <div className="flex justify-between items-center text-sm">
                                            <div className="text-gray-600 space-y-1">
                                                <p><span className="font-semibold">Période:</span> {`${formatDate(d.dateDebut)} au ${formatDate(d.dateFin)}`}</p>
                                                <p><span className="font-semibold">Durée:</span> {d.nombreJours} jour{d.nombreJours > 1 ? 's' : ''}</p>
                                            </div>
                                            <Button variant="outline" size="sm" onClick={() => openModal(d)}><Eye className="h-4 w-4" /></Button>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        </motion.div>
                    ) : (
                        <div className="text-center py-10">
                            <div className="flex justify-center mb-4">
                                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                                    <Inbox className="h-8 w-8 text-gray-500" />
                                </div>
                            </div>
                            <h3 className="text-lg font-semibold text-gray-800">Boîte de réception vide</h3>
                            <p className="text-sm text-gray-600">Aucune nouvelle demande de congé à valider pour le moment.</p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* --- Modal de validation (UI améliorée) --- */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Détails de la demande</DialogTitle>
                        <DialogDescription>Examinez la demande de {selectedDemande?.employeNom}.</DialogDescription>
                    </DialogHeader>
                    {selectedDemande && (
                        <div className="space-y-4 py-4">
                            <div className="p-4 bg-gray-50 rounded-lg border space-y-3">
                                <div className="flex justify-between items-start">
                                    <p><span className="font-semibold">Type :</span> {selectedDemande.typeConge}</p>
                                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatutDisplay(selectedDemande.statut).className}`}>
                                        {getStatutDisplay(selectedDemande.statut).text}
                                    </span>
                                </div>
                                <p><span className="font-semibold">Période :</span> {`${formatDate(selectedDemande.dateDebut)} - ${formatDate(selectedDemande.dateFin)} (${selectedDemande.nombreJours}j)`}</p>
                                <div>
                                    <p className="font-semibold">Motif de l'employé :</p>
                                    <p className="text-sm text-gray-600 italic border-l-2 pl-2 mt-1">{selectedDemande.motif}</p>
                                </div>
                            </div>
                            <div>
                                <label htmlFor="commentaire" className="font-semibold text-gray-800">Ajouter un commentaire (optionnel)</label>
                                <Textarea
                                    id="commentaire"
                                    placeholder="Justification de votre décision..."
                                    value={commentaires[selectedDemande.id] || ''}
                                    onChange={(e) => handleCommentaireChange(selectedDemande.id, e.target.value)}
                                    className="mt-2"
                                />
                            </div>
                        </div>
                    )}
                    <DialogFooter className="flex-col-reverse space-y-2 sm:flex-row sm:justify-end sm:space-x-2">
                        <Button variant="outline" onClick={() => setIsModalOpen(false)}>Annuler</Button>
                        {selectedDemande && (
                            <>
                                <Button variant="destructive" onClick={() => handleValidation(selectedDemande.id, 'REJETE')} disabled={validating[selectedDemande.id]}>
                                    Rejeter
                                </Button>
                                <Button className="bg-green-600 hover:bg-green-700" onClick={() => handleValidation(selectedDemande.id, 'APPROUVE')} disabled={validating[selectedDemande.id]}>
                                    Approuver
                                </Button>
                            </>
                        )}
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    )
}