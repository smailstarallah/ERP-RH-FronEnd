import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Edit, Trash2, Plus, Search, Filter, Eye, X, MoreHorizontal } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import ElementPaieForm from './AjouterElementPaieRefactored';
import EditElementPaieModal from './EditElementPaieModal';
import { set } from 'date-fns';

// Types basés sur votre structure
interface ElementPaie {
    id: number;
    type: string;
    sousType: string;
    libelle: string;
    montant: string;
    modeCalcul: string;
    taux: string;
    base: string;
    description: string;
    soumisIR: boolean;
    soumisCNSS: boolean;
    dateCreation?: string;
    dateModification?: string;
}

interface ElementPaieFormProps {
    isModal?: boolean;
    onSubmitSuccess: (data: any) => void;
    onCancel: () => void;
    employeId: number;
    className?: string;
    elementData?: ElementPaie;
}

interface ApiConfig {
    baseUrl: string;
    endpoints: {
        list: string;
        create: string;
        update: string;
        delete: string;
    };
    headers?: Record<string, string>;
}

const DEFAULT_API_CONFIG: ApiConfig = {
    baseUrl: '/api',
    endpoints: {
        list: '/elements-paie',
        create: '/elements-paie',
        update: '/elements-paie',
        delete: '/elements-paie'
    },
    headers: {
        'Content-Type': 'application/json'
    }
};

// Composant ElementPaieFormtest utilisant votre composant
const ElementPaieFormtest = ({
    employeId,
    open,
    onOpenChange,
    elementData,
    mode = 'add'
}: {
    employeId: number;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    elementData?: ElementPaie;
    mode?: 'add' | 'edit';
}) => {
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
                    <DialogTitle>
                        {mode === 'edit' ? 'Modifier l\'élément de paie' : 'Ajouter un élément de paie'}
                    </DialogTitle>
                    <DialogDescription>
                        {mode === 'edit'
                            ? 'Modifiez les paramètres de cet élément de paie'
                            : 'Créez un nouvel élément de paie avec les paramètres de calcul appropriés'
                        }
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

// Composant principal responsive
const ElementPaieManager = ({
    employeId,
    open,
    onOpenChange,
    apiConfig = DEFAULT_API_CONFIG
}: {
    employeId: number;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    apiConfig?: ApiConfig;
}) => {
    const [elements, setElements] = useState<ElementPaie[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState<string>('ALL');
    const [selectedElement, setSelectedElement] = useState<ElementPaie | null>(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);


    // Fonction de chargement des éléments, accessible partout dans le composant
    const loadElements = async () => {
        setLoading(true);
        const token = localStorage.getItem('token');
        let timeout: NodeJS.Timeout | null = null;
        let didTimeout = false;
        try {
            const controller = new AbortController();
            timeout = setTimeout(() => {
                didTimeout = true;
                controller.abort();
            }, 10000); // 10s timeout
            const response = await fetch(`http://localhost:8080/api/fiche-paie/elements-paie/${employeId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                signal: controller.signal
            });
            if (timeout) clearTimeout(timeout);
            if (response.ok) {
                const result = await response.json();
                if (result.success && Array.isArray(result.data)) {
                    setElements(result.data);
                } else {
                    setElements([]);
                    alert('Réponse inattendue du serveur.');
                    console.error('Réponse inattendue de l\'API:', result);
                }
            } else {
                const errorText = await response.text();
                setElements([]);
                alert('Erreur lors du chargement des éléments.');
                console.error('Erreur lors du chargement des éléments:', response.status, errorText);
            }
        } catch (error: any) {
            if (timeout) clearTimeout(timeout);
            setElements([]);
            if (didTimeout || (error && error.name === 'AbortError')) {
                alert('⏳ Le serveur ne répond pas. Veuillez réessayer plus tard.');
            } else {
                alert('❌ Erreur réseau lors du chargement des éléments.');
                console.error('Erreur réseau lors du chargement des éléments:', error);
            }
        }
        setLoading(false);
    };

    // Charger les éléments à l'ouverture du modal principal
    useEffect(() => {
        if (open) {
            loadElements();
        }
    }, [open, employeId]);

    // Filtrage optimisé avec useMemo
    const filteredElements = React.useMemo(() => {
        return elements.filter(element => {
            const matchesSearch = element.libelle.toLowerCase().includes(searchTerm.toLowerCase()) ||
                element.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
                element.sousType.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesFilter = filterType === 'ALL' || element.type === filterType;
            return matchesSearch && matchesFilter;
        });
    }, [elements, searchTerm, filterType]);

    // Handlers optimisés
    const handleAdd = () => {
        setSelectedElement(null);
        setShowAddModal(true);
    };

    const handleView = (element: ElementPaie) => {
        setSelectedElement(element);
        setShowViewModal(true);
    };

    const handleEdit = (element: ElementPaie) => {
        setSelectedElement(element);
        setShowEditModal(true);
    };

    const handleDelete = async (id: number) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:8080/api/fiche-paie/supprimer-element-paie/${id}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                // Supprimer l'élément de la liste locale après succès de l'API
                setElements(prev => prev.filter(el => el.id !== id));
                setDeleteConfirmId(null);
                console.log('✅ Élément de paie supprimé avec succès !');
            } else {
                const errorText = await response.text();
                console.error('Erreur lors de la suppression:', response.status, errorText);
                alert('❌ Erreur lors de la suppression de l\'élément');
            }
        } catch (error) {
            console.error('Erreur lors de la suppression:', error);
            alert('❌ Erreur réseau lors de la suppression');
        }
    };

    const getTypeVariant = (type: string): "default" | "secondary" | "destructive" | "outline" => {
        switch (type) {
            case 'GAIN': return 'default';
            case 'RETENUE': return 'destructive';
            case 'COTISATION': return 'secondary';
            case 'PRIME': return 'outline';
            default: return 'secondary';
        }
    };

    const formatCalcul = (element: ElementPaie) => {
        if (element.modeCalcul === 'MONTANT' && element.montant) {
            return `${element.montant} DH`;
        } else if (element.modeCalcul === 'TAUX' && element.taux) {
            return `${element.taux}% ${element.base ? `sur ${element.base}` : ''}`;
        } else if (element.modeCalcul === 'PAR_JOUR' && element.montant) {
            return `${element.montant} DH / jour`;
        } else if (element.modeCalcul === 'PAR_HEURE' && element.montant) {
            return `${element.montant} DH / heure`;
        }
        return 'Non défini';
    };

    return (
        <>
            {/* Modal principal avec design institutionnel */}
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="max-w-7xl w-[95vw] sm:w-[65vw] h-[95vh] sm:h-[75vh] p-0 flex flex-col border border-gray-300 shadow-lg">
                    <div className="px-6 py-4 border-b border-gray-200 bg-white">
                        <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-3">
                            <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center">
                                <Plus className="w-4 h-4 text-white" />
                            </div>
                            Gestion des éléments de paie
                        </h2>
                        <p className="text-sm text-gray-600 mt-1">
                            Administration des composants de calcul salarial
                        </p>
                    </div>

                    {/* Contenu du modal, scrollable si besoin */}
                    <div className="flex-1 flex flex-col min-h-0">
                        <div className="p-4 bg-gray-50 border-b border-gray-200">
                            {/* En-tête institutionnel */}
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                    <h3 className="text-base font-medium text-gray-800">
                                        Éléments de paie
                                    </h3>
                                    <div className="px-2 py-1 bg-gray-200 text-gray-700 text-xs font-medium rounded">
                                        {filteredElements.length} élément{filteredElements.length > 1 ? 's' : ''}
                                    </div>
                                </div>

                                <Button
                                    onClick={handleAdd}
                                    className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2"
                                >
                                    <Plus className="h-4 w-4 mr-2" />
                                    Ajouter
                                </Button>
                            </div>

                            {/* Barre de recherche et filtres */}
                            <div className="flex gap-3 mt-3">
                                {/* Zone de recherche */}
                                <div className="relative flex-1">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
                                    <Input
                                        placeholder="Rechercher par libellé, type..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-10 border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                    />
                                </div>

                                {/* Filtre par type */}
                                <Select value={filterType} onValueChange={setFilterType}>
                                    <SelectTrigger className="w-[140px] border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500">
                                        <Filter className="h-4 w-4 text-gray-500 mr-2" />
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="ALL">Tous types</SelectItem>
                                        <SelectItem value="GAIN">Gains</SelectItem>
                                        <SelectItem value="RETENUE">Retenues</SelectItem>
                                        <SelectItem value="COTISATION">Cotisations</SelectItem>
                                        <SelectItem value="PRIME">Primes</SelectItem>
                                        <SelectItem value="INDEMNITE">Indemnités</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Contenu scrollable */}
                        <div className="flex-1 px-4 sm:px-6 overflow-y-auto" style={{ maxHeight: 'calc(60vh - 32px)', minHeight: '120px' }}>
                            {loading ? (
                                <div className="flex items-center justify-center py-8">
                                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                                </div>
                            ) : filteredElements.length === 0 ? (
                                <div className="text-center py-8 text-gray-500">
                                    <p>Aucun élément trouvé</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {filteredElements.map((element) => (
                                        <Card key={element.id} className="border border-gray-200 bg-white shadow-sm">
                                            <CardHeader className="pb-3 pt-3 px-4">
                                                <div className="flex justify-between items-start gap-3">
                                                    <div className="flex-1 min-w-0">
                                                        <CardTitle className="text-sm font-semibold text-gray-800 mb-1">{element.libelle}</CardTitle>
                                                        {element.sousType && (
                                                            <p className="text-xs text-gray-600 bg-gray-100 rounded px-2 py-1 inline-block">{element.sousType}</p>
                                                        )}
                                                    </div>
                                                    <Badge variant={getTypeVariant(element.type)} className="text-xs px-2 py-1 bg-blue-100 text-blue-800 border-blue-200">
                                                        {element.type}
                                                    </Badge>
                                                </div>
                                            </CardHeader>
                                            <CardContent className="pt-0 pb-3 px-4 space-y-3">
                                                <div className="text-sm flex items-center gap-2">
                                                    <span className="font-medium text-gray-600">{element.modeCalcul}:</span>
                                                    <span className="font-mono text-gray-800 font-medium">{formatCalcul(element)}</span>
                                                </div>

                                                <div className="flex flex-wrap gap-2 items-center justify-between">
                                                    <div className="flex gap-2">
                                                        {element.soumisIR && <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-300">IR</Badge>}
                                                        {element.soumisCNSS && <Badge variant="outline" className="text-xs bg-orange-50 text-orange-700 border-orange-300">CNSS</Badge>}
                                                    </div>

                                                    <div className="flex gap-1">
                                                        <Button variant="outline" size="sm" className="h-8 w-8 p-0 border-gray-300 hover:bg-gray-50" onClick={() => handleView(element)} title="Voir">
                                                            <Eye className="h-4 w-4 text-gray-600" />
                                                        </Button>
                                                        <Button variant="outline" size="sm" className="h-8 w-8 p-0 border-gray-300 hover:bg-gray-50" onClick={() => handleEdit(element)} title="Modifier">
                                                            <Edit className="h-4 w-4 text-gray-600" />
                                                        </Button>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            className="h-8 w-8 p-0 border-red-300 hover:bg-red-50"
                                                            onClick={() => setDeleteConfirmId(element.id)}
                                                            title="Supprimer"
                                                        >
                                                            <Trash2 className="h-4 w-4 text-red-600" />
                                                        </Button>
                                                    </div>
                                                </div>
                                                {element.description && (
                                                    <div className="text-xs text-gray-600 bg-gray-50 rounded px-2 py-1 border border-gray-200">
                                                        {element.description}
                                                    </div>
                                                )}
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Modal d'ajout avec votre composant */}
            <ElementPaieFormtest
                employeId={employeId}
                open={showAddModal}
                onOpenChange={(open) => {
                    setShowAddModal(open);
                    if (!open) {
                        loadElements();
                    }
                }}
                mode="add"
            />

            {/* Modal de modification avec le composant dédié */}
            <EditElementPaieModal
                employeId={employeId}
                open={showEditModal}
                onOpenChange={(open) => {
                    setShowEditModal(open);
                    if (!open) {
                        loadElements();
                    }
                }}
                elementData={selectedElement as any}
            />

            {/* Modal de visualisation responsive */}
            <Dialog open={showViewModal} onOpenChange={setShowViewModal}>
                <DialogContent className="max-w-2xl w-[95vw]">
                    <DialogHeader>
                        <DialogTitle>Détails de l'élément de paie</DialogTitle>
                    </DialogHeader>
                    {selectedElement && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">Type</label>
                                    <p className="font-medium mt-1">{selectedElement.type}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">Sous-type</label>
                                    <p className="font-medium mt-1">{selectedElement.sousType || '-'}</p>
                                </div>
                            </div>

                            <div>
                                <label className="text-sm font-medium text-muted-foreground">Libellé</label>
                                <p className="font-medium mt-1">{selectedElement.libelle}</p>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">Mode de calcul</label>
                                    <p className="font-medium mt-1">{selectedElement.modeCalcul || '-'}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">Montant</label>
                                    <p className="font-medium mt-1 font-mono">{selectedElement.montant || '-'}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">Taux</label>
                                    <p className="font-medium mt-1 font-mono">{selectedElement.taux || '-'}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">Base</label>
                                    <p className="font-medium mt-1">{selectedElement.base || '-'}</p>
                                </div>
                            </div>

                            <div>
                                <label className="text-sm font-medium text-muted-foreground">Description</label>
                                <p className="mt-1 text-sm leading-relaxed">{selectedElement.description || '-'}</p>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-4">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium text-muted-foreground">Soumis à l'IR:</span>
                                    <Badge variant={selectedElement.soumisIR ? 'default' : 'secondary'} className="text-xs">
                                        {selectedElement.soumisIR ? 'Oui' : 'Non'}
                                    </Badge>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium text-muted-foreground">Soumis à la CNSS:</span>
                                    <Badge variant={selectedElement.soumisCNSS ? 'default' : 'secondary'} className="text-xs">
                                        {selectedElement.soumisCNSS ? 'Oui' : 'Non'}
                                    </Badge>
                                </div>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Dialog de confirmation de suppression */}
            <Dialog open={deleteConfirmId !== null} onOpenChange={() => setDeleteConfirmId(null)}>
                <DialogContent className="w-[95vw] max-w-md">
                    <DialogHeader>
                        <DialogTitle>Confirmer la suppression</DialogTitle>
                        <DialogDescription>
                            Êtes-vous sûr de vouloir supprimer cet élément de paie ? Cette action est irréversible.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex flex-col sm:flex-row justify-end gap-2 mt-6">
                        <Button
                            variant="outline"
                            onClick={() => setDeleteConfirmId(null)}
                            className="w-full sm:w-auto"
                        >
                            Annuler
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={() => deleteConfirmId && handleDelete(deleteConfirmId)}
                            className="w-full sm:w-auto"
                        >
                            Supprimer
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
};

export default ElementPaieManager;