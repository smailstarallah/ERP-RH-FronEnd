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

// Configuration API par défaut
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
            setElements(prev => prev.filter(el => el.id !== id));
            setDeleteConfirmId(null);
        } catch (error) {
            console.error('Erreur lors de la suppression:', error);
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
            {/* Modal principal responsive */}
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="max-w-7xl w-[95vw] sm:w-[65vw] h-[95vh] sm:h-[75vh] p-0 flex flex-col">
                    <div className="px-6 pt-5 pb-3 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-blue-50/30 relative">
                        <div className="relative z-10">
                            <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                                <span className="w-1 h-5 bg-gradient-to-b from-blue-500 to-blue-600 rounded-full"></span>
                                Gestion des éléments de paie
                            </h2>
                            <p className="text-sm text-slate-600 mt-1.5 leading-relaxed ml-3">
                                Administration des composants de calcul salarial pour cet employé
                            </p>
                        </div>
                    </div>

                    {/* Contenu du modal, scrollable si besoin */}
                    <div className="flex-1 flex flex-col min-h-0">
                        <div className="p-4 space-y-4 bg-gradient-to-b from-white to-slate-50/30 border-b border-slate-100">
                            {/* En-tête avec accent créatif */}
                            <div className="flex justify-between items-center gap-4">
                                <div className="flex-1 min-w-0 relative">
                                    {/* Indicateur visuel subtil */}
                                    <div className="absolute -left-1 top-0 w-0.5 h-full bg-gradient-to-b from-blue-500 to-blue-600 rounded-full opacity-60"></div>

                                    <div className="pl-4">
                                        <h3 className="text-lg font-medium text-slate-900 truncate flex items-center gap-2">
                                            Éléments de paie
                                            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                                        </h3>
                                        <p className="text-sm text-slate-600 mt-0.5">
                                            <span className="font-medium text-blue-700">{filteredElements.length}</span> élément{filteredElements.length > 1 ? 's' : ''}
                                            {filteredElements.length > 1 ? ' référencés' : ' référencé'}
                                        </p>
                                    </div>
                                </div>

                                <Button
                                    onClick={handleAdd}
                                    className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-sm transition-all duration-200 hover:shadow-md"
                                >
                                    <Plus className="h-4 w-4 mr-2" />
                                    Nouvel élément
                                </Button>
                            </div>

                            {/* Barre de contrôles optimisée */}
                            <div className="flex gap-2">
                                {/* Zone de recherche avec effet glassmorphism subtil */}
                                <div className="relative flex-1">
                                    <div className="absolute inset-0 bg-white/60 backdrop-blur-sm rounded-lg border border-slate-200/60"></div>
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500 h-4 w-4" />
                                        <Input
                                            placeholder="Rechercher par libellé, type..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="pl-10 bg-transparent border-0 shadow-none focus:ring-2 focus:ring-blue-500/20"
                                        />
                                    </div>
                                </div>

                                {/* Select optimisé avec ShadCN */}
                                <div className="flex items-center gap-1.5 bg-white/60 backdrop-blur-sm rounded-lg border border-slate-200/60 px-2 py-1">
                                    <Filter className="h-3.5 w-3.5 text-slate-500 flex-shrink-0" />
                                    <Select value={filterType} onValueChange={setFilterType}>
                                        <SelectTrigger className="w-[110px] h-7 border-0 bg-transparent shadow-none focus:ring-0 text-xs font-medium">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="min-w-[140px]">
                                            <SelectItem value="ALL" className="text-xs">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-2 h-2 bg-slate-400 rounded-full"></div>
                                                    Tous types
                                                </div>
                                            </SelectItem>
                                            <SelectItem value="GAIN" className="text-xs">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                                    Gains
                                                </div>
                                            </SelectItem>
                                            <SelectItem value="RETENUE" className="text-xs">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                                                    Retenues
                                                </div>
                                            </SelectItem>
                                            <SelectItem value="COTISATION" className="text-xs">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                                    Cotisations
                                                </div>
                                            </SelectItem>
                                            <SelectItem value="PRIME" className="text-xs">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                                                    Primes
                                                </div>
                                            </SelectItem>
                                            <SelectItem value="INDEMNITE" className="text-xs">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                                                    Indemnités
                                                </div>
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>

                        {/* Contenu scrollable */}
                        <div className="flex-1 px-4 sm:px-6 overflow-y-auto" style={{ maxHeight: 'calc(60vh - 32px)', minHeight: '120px' }}>
                            {loading ? (
                                <div className="flex items-center justify-center py-12">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                                </div>
                            ) : filteredElements.length === 0 ? (
                                <Card>
                                    <CardContent className="text-center py-12">
                                        <p className="text-muted-foreground">Aucun élément trouvé</p>
                                    </CardContent>
                                </Card>
                            ) : (
                                <>
                                    {/* Vue desktop - Table */}
                                    <div className="hidden md:block space-y-4">
                                        {filteredElements.map((element) => (
                                            <Card
                                                key={element.id}
                                                className="border border-slate-300 bg-white rounded-md mx-auto w-full transition-all duration-200 hover:border-slate-400 hover:shadow-sm"
                                            >
                                                <div className="flex items-center justify-between gap-4 px-3 py-2.5">
                                                    {/* Section principale */}
                                                    <div className="flex-1 min-w-0 space-y-1">
                                                        {/* En-tête avec titre et sous-type */}
                                                        <div className="flex items-center gap-2">
                                                            <CardTitle className="text-sm font-medium text-slate-900 truncate">
                                                                {element.libelle}
                                                            </CardTitle>
                                                            {element.sousType && (
                                                                <span className="text-xs font-normal text-slate-600 bg-slate-100 rounded px-1.5 py-0.5 flex-shrink-0">
                                                                    {element.sousType}
                                                                </span>
                                                            )}
                                                        </div>

                                                        {/* Calcul */}
                                                        <div className="flex items-center gap-1.5 text-xs">
                                                            <span className="text-slate-500 font-normal">{element.modeCalcul} :</span>
                                                            <span className="font-mono text-slate-700 font-medium">{formatCalcul(element)}</span>
                                                        </div>

                                                        {/* Description condensée */}
                                                        {element.description && (
                                                            <div className="text-xs text-slate-600 bg-slate-50 rounded px-2 py-1 line-clamp-1 max-w-md">
                                                                {element.description}
                                                            </div>
                                                        )}

                                                        {/* Badges fiscaux */}
                                                        <div className="flex gap-1">
                                                            {element.soumisIR && (
                                                                <Badge
                                                                    variant="outline"
                                                                    className="text-xs bg-emerald-50 text-emerald-700 border-emerald-200 px-1.5 py-0"
                                                                >
                                                                    IR
                                                                </Badge>
                                                            )}
                                                            {element.soumisCNSS && (
                                                                <Badge
                                                                    variant="outline"
                                                                    className="text-xs bg-amber-50 text-amber-700 border-amber-200 px-1.5 py-0"
                                                                >
                                                                    CNSS
                                                                </Badge>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Section droite : type et actions */}
                                                    <div className="flex items-center gap-2 flex-shrink-0">
                                                        {/* Badge type */}
                                                        <Badge
                                                            variant={getTypeVariant(element.type)}
                                                            className="text-xs px-2 py-1 uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-300 rounded font-medium"
                                                        >
                                                            {element.type}
                                                        </Badge>

                                                        {/* Actions groupées */}
                                                        <div className="flex">
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className="h-7 w-7 p-0 hover:bg-slate-100 rounded"
                                                                onClick={() => handleView(element)}
                                                                title="Consulter"
                                                            >
                                                                <Eye className="h-3.5 w-3.5 text-slate-600" />
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className="h-7 w-7 p-0 hover:bg-slate-100 rounded"
                                                                onClick={() => handleEdit(element)}
                                                                title="Modifier"
                                                            >
                                                                <Edit className="h-3.5 w-3.5 text-slate-600" />
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className="h-7 w-7 p-0 hover:bg-red-50 rounded"
                                                                onClick={() => setDeleteConfirmId(element.id)}
                                                                title="Supprimer"
                                                            >
                                                                <Trash2 className="h-3.5 w-3.5 text-red-500" />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </Card>

                                        ))}
                                    </div>

                                    {/* Vue mobile - Cards */}
                                    <div className="md:hidden space-y-4">
                                        {filteredElements.map((element) => (
                                            <Card key={element.id} className="shadow-md border border-muted bg-white/95 max-w-xl mx-auto w-full">
                                                <CardHeader className="pb-1 pt-2 px-4">
                                                    <div className="flex justify-between items-center gap-2">
                                                        <div className="flex-1 min-w-0">
                                                            <CardTitle className="text-base font-bold truncate text-neutral-800 mb-1">{element.libelle}</CardTitle>
                                                            {element.sousType && (
                                                                <p className="text-xs font-medium text-muted-foreground bg-muted/60 rounded px-2 py-0.5 inline-block mt-0.5">{element.sousType}</p>
                                                            )}
                                                        </div>
                                                        <Badge variant={getTypeVariant(element.type)} className="ml-2 flex-shrink-0 text-xs px-2 py-1 uppercase tracking-wide bg-muted text-neutral-700 border-muted-foreground">
                                                            {element.type}
                                                        </Badge>
                                                    </div>
                                                </CardHeader>
                                                <CardContent className="pt-0 pb-2 px-4 space-y-2">
                                                    <div className="text-sm flex items-center gap-2">
                                                        <span className="font-semibold text-muted-foreground">{element.modeCalcul} :</span>
                                                        <span className="font-mono text-neutral-700 font-bold">{formatCalcul(element)}</span>
                                                    </div>

                                                    <div className="flex flex-wrap gap-2 items-center justify-between">
                                                        <div className="flex gap-1">
                                                            {element.soumisIR && <Badge variant="default" className="text-xs bg-green-50 text-green-700 border-green-200">IR</Badge>}
                                                            {element.soumisCNSS && <Badge variant="default" className="text-xs bg-yellow-50 text-yellow-700 border-yellow-200">CNSS</Badge>}
                                                        </div>

                                                        <div className="flex gap-1">
                                                            <Button variant="outline" size="icon" className="rounded-full border-muted/50 hover:bg-muted/60" onClick={() => handleView(element)} title="Voir">
                                                                <Eye className="h-4 w-4 text-neutral-700" />
                                                            </Button>
                                                            <Button variant="outline" size="icon" className="rounded-full border-muted/50 hover:bg-muted/60" onClick={() => handleEdit(element)} title="Modifier">
                                                                <Edit className="h-4 w-4 text-neutral-500" />
                                                            </Button>
                                                            <Button
                                                                variant="outline"
                                                                size="icon"
                                                                className="rounded-full border-red-300/40 hover:bg-red-50"
                                                                onClick={() => setDeleteConfirmId(element.id)}
                                                                title="Supprimer"
                                                            >
                                                                <Trash2 className="h-4 w-4 text-red-500" />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                    {element.description && (
                                                        <div className="text-xs text-muted-foreground mt-2 bg-muted/60 rounded px-2 py-1">
                                                            {element.description}
                                                        </div>
                                                    )}
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>
                                </>
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