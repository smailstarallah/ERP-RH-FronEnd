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
            <Card className="w-full shadow-md border-slate-300 rounded-lg overflow-hidden">
                <CardHeader className="bg-blue-600 text-white p-4">
                    <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                            <FileWarning className="h-4 w-4 text-white" />
                        </div>
                        <div>
                            <CardTitle className="text-lg font-semibold text-white">Validation des Congés</CardTitle>
                            <CardDescription className="text-blue-100 text-sm">Examinez et traitez les demandes de votre équipe.</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="bg-slate-50 p-4 sm:p-5">
                    {loading ? (
                        <div className="space-y-3">
                            {/* Skeletons pour Desktop */}
                            <div className="hidden sm:block space-y-2">
                                <Skeleton className="h-10 w-full rounded-lg" />
                                <Skeleton className="h-12 w-full rounded-lg" />
                                <Skeleton className="h-12 w-full rounded-lg" />
                            </div>
                            {/* Skeletons pour Mobile */}
                            <div className="sm:hidden space-y-3">
                                <Skeleton className="h-24 w-full rounded-lg" />
                                <Skeleton className="h-24 w-full rounded-lg" />
                            </div>
                        </div>
                    ) : demandes.length > 0 ? (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                            {/* Vue Desktop */}
                            <div className="hidden sm:block border border-slate-300 rounded-lg max-h-60 overflow-y-auto shadow-sm bg-white">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-blue-600 hover:bg-blue-700">
                                            <TableHead className="text-white font-medium text-sm">Employé</TableHead>
                                            <TableHead className="text-white font-medium text-sm">Type</TableHead>
                                            <TableHead className="text-white font-medium text-sm">Période</TableHead>
                                            <TableHead className="text-center text-white font-medium text-sm">Jours</TableHead>
                                            <TableHead className="text-white font-medium text-sm">Statut</TableHead>
                                            <TableHead className="text-right text-white font-medium text-sm">Action</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {demandes.map((d) => (
                                            <TableRow key={d.id} className="align-middle hover:bg-slate-50 transition-colors duration-200 border-b border-slate-200">
                                                <TableCell className="font-medium text-slate-900 text-sm py-3">{d.employeNom}</TableCell>
                                                <TableCell className="text-slate-700 text-sm">{d.typeConge}</TableCell>
                                                <TableCell className="text-slate-700 text-sm">{`${formatDate(d.dateDebut)} - ${formatDate(d.dateFin)}`}</TableCell>
                                                <TableCell className="text-center font-semibold text-blue-700 text-sm">{d.nombreJours}</TableCell>
                                                <TableCell>
                                                    <span className="px-2 py-1 text-xs font-medium rounded bg-blue-100 text-blue-800">
                                                        {getStatutDisplay(d.statut).text}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Button variant="outline" size="sm" className="h-8 w-8 p-0 border border-slate-300 hover:border-blue-500 hover:bg-blue-50 rounded-lg transition-all duration-200" onClick={() => openModal(d)}>
                                                        <Eye className="h-4 w-4 text-slate-600" />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                            {/* Vue Mobile */}
                            <div className="sm:hidden space-y-3 max-h-60 overflow-y-auto">
                                {demandes.map((d) => (
                                    <Card key={d.id} className="border border-slate-300 shadow-sm p-3 rounded-lg hover:shadow-md transition-shadow duration-200 bg-white">
                                        <div className="flex justify-between items-start mb-3">
                                            <div>
                                                <p className="font-medium text-slate-900 text-sm">{d.employeNom}</p>
                                                <p className="text-xs text-slate-600">{d.typeConge}</p>
                                            </div>
                                            <span className="px-2 py-1 text-xs font-medium rounded bg-blue-100 text-blue-800">
                                                {getStatutDisplay(d.statut).text}
                                            </span>
                                        </div>
                                        <div className="border-t border-slate-200 my-3"></div>
                                        <div className="flex justify-between items-center">
                                            <div className="text-slate-700 space-y-1">
                                                <p className="text-xs"><span className="font-medium">Période:</span> {`${formatDate(d.dateDebut)} au ${formatDate(d.dateFin)}`}</p>
                                                <p className="text-xs"><span className="font-medium">Durée:</span> <span className="text-blue-700 font-semibold">{d.nombreJours} jour{d.nombreJours > 1 ? 's' : ''}</span></p>
                                            </div>
                                            <Button variant="outline" size="sm" className="h-8 w-8 p-0 border border-slate-300 hover:border-blue-500 hover:bg-blue-50 rounded-lg transition-all duration-200" onClick={() => openModal(d)}>
                                                <Eye className="h-4 w-4 text-slate-600" />
                                            </Button>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        </motion.div>
                    ) : (
                        <div className="text-center py-8">
                            <div className="flex justify-center mb-4">
                                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
                                    <Inbox className="h-8 w-8 text-slate-500" />
                                </div>
                            </div>
                            <h3 className="text-lg font-semibold text-slate-900 mb-2">Aucune demande</h3>
                            <p className="text-sm text-slate-600">Aucune nouvelle demande de congé à valider.</p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* --- Modal de validation (UI améliorée) --- */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="sm:max-w-lg rounded-2xl border-2 border-blue-200 shadow-2xl">
                    <DialogHeader className="pb-4">
                        <DialogTitle className="text-xl font-bold text-gray-800 flex items-center gap-2">
                            🔍 Détails de la demande
                        </DialogTitle>
                        <DialogDescription className="text-blue-600 font-medium">
                            Examinez la demande de {selectedDemande?.employeNom}
                        </DialogDescription>
                    </DialogHeader>
                    {selectedDemande && (
                        <div className="space-y-6 py-2">
                            <div className="p-5 bg-gradient-to-br from-blue-50 to-white rounded-xl border-2 border-blue-200 space-y-4 shadow-md">
                                <div className="flex justify-between items-start">
                                    <p className="text-base"><span className="font-bold text-gray-800">🏷️ Type :</span> <span className="text-gray-700">{selectedDemande.typeConge}</span></p>
                                    <span className="px-3 py-1 text-sm font-semibold rounded-lg bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 shadow-md">
                                        {getStatutDisplay(selectedDemande.statut).text}
                                    </span>
                                </div>
                                <p className="text-base"><span className="font-bold text-gray-800">📅 Période :</span> <span className="text-gray-700">{`${formatDate(selectedDemande.dateDebut)} - ${formatDate(selectedDemande.dateFin)}`}</span> <span className="text-blue-700 font-bold">({selectedDemande.nombreJours}j)</span></p>
                                <div>
                                    <p className="font-bold text-gray-800 mb-2">💭 Motif de l'employé :</p>
                                    <p className="text-sm text-gray-700 bg-white border-l-4 border-blue-500 pl-4 py-2 rounded-r-lg italic shadow-sm">{selectedDemande.motif}</p>
                                </div>
                            </div>
                            <div>
                                <label htmlFor="commentaire" className="font-bold text-gray-800 flex items-center gap-2 mb-3">
                                    📝 Ajouter un commentaire (optionnel)
                                </label>
                                <Textarea
                                    id="commentaire"
                                    placeholder="Justification de votre décision..."
                                    value={commentaires[selectedDemande.id] || ''}
                                    onChange={(e) => handleCommentaireChange(selectedDemande.id, e.target.value)}
                                    className="border-2 border-blue-200 focus:border-blue-500 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 text-base p-4"
                                    rows={3}
                                />
                            </div>
                        </div>
                    )}
                    <DialogFooter className="flex-col-reverse space-y-3 sm:flex-row sm:justify-end sm:space-x-3 sm:space-y-0 pt-4">
                        <Button variant="outline" className="border-2 border-gray-300 hover:border-gray-400 rounded-xl" onClick={() => setIsModalOpen(false)}>
                            ❌ Annuler
                        </Button>
                        {selectedDemande && (
                            <>
                                <Button variant="destructive" className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300" onClick={() => handleValidation(selectedDemande.id, 'REJETE')} disabled={validating[selectedDemande.id]}>
                                    ❌ Rejeter
                                </Button>
                                <Button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300" onClick={() => handleValidation(selectedDemande.id, 'APPROUVE')} disabled={validating[selectedDemande.id]}>
                                    ✅ Approuver
                                </Button>
                            </>
                        )}
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    )
}