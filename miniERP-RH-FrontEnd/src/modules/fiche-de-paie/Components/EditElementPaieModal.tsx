import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Edit3, Save, X, AlertCircle, CheckCircle2, Calculator, FileText, DollarSign, Percent, Clock, Calendar } from 'lucide-react';

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

interface EditElementPaieModalProps {
    employeId: number;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    elementData: ElementPaie;
}

const typeOptions = [
    { value: 'SALAIRE_BASE', label: 'Salaire de base', icon: DollarSign },
    { value: 'PRIME_FIXE', label: 'Prime fixe', icon: CheckCircle2 },
    { value: 'PRIME_VARIABLE', label: 'Prime variable', icon: Calculator },
    { value: 'HEURES_SUPPLEMENTAIRES', label: 'Heures supplémentaires', icon: Clock },
    { value: 'INDEMNITE', label: 'Indemnité', icon: FileText },
    { value: 'DEDUCTION_ABSENCE', label: 'Déduction absence', icon: Calendar },
    { value: 'DEDUCTION_AUTRE', label: 'Déduction autre', icon: AlertCircle },
    { value: 'COTISATION_SOCIALE', label: 'Cotisation sociale', icon: Percent },
    { value: 'IMPOT', label: 'Impôt', icon: Calculator },
    { value: 'AUTRE', label: 'Autre', icon: FileText },
];

const modeCalculOptions = [
    { value: 'MONTANT', label: 'Montant fixe', icon: DollarSign },
    { value: 'TAUX', label: 'Pourcentage', icon: Percent },
    { value: 'PAR_JOUR', label: 'Par jour', icon: Calendar },
    { value: 'PAR_HEURE', label: 'Par heure', icon: Clock },
];

const defaultElementPaie: ElementPaie = {
    id: 0,
    type: '',
    sousType: '',
    libelle: '',
    montant: '',
    modeCalcul: '',
    taux: '',
    base: '',
    description: '',
    soumisIR: false,
    soumisCNSS: false
};

const EditElementPaieModal: React.FC<EditElementPaieModalProps> = ({ employeId, open, onOpenChange, elementData }) => {
    const [form, setForm] = useState<ElementPaie>(elementData ?? defaultElementPaie);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    React.useEffect(() => {
        if (open) {
            setForm(elementData ?? defaultElementPaie);
            setError(null);
            setSuccess(false);
        }
    }, [open, elementData]);

    const handleChange = (field: keyof ElementPaie, value: any) => {
        setForm(prev => ({ ...prev, [field]: value }));
        if (error) setError(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:8080/api/fiche-paie/modifier-element-paie/${form.id}?employeId=${employeId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(form),
            });

            if (response.ok) {
                setSuccess(true);
                setTimeout(() => {
                    onOpenChange(false);
                    setSuccess(false);
                }, 1500);
            } else {
                setError("Erreur lors de la modification de l'élément");
            }
        } catch (err) {
            setError("Erreur de connexion au serveur");
        } finally {
            setLoading(false);
        }
    };




    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] md:max-h-[75vh] p-0 bg-white border border-blue-100 shadow-lg rounded-xl">
                {/* Header compact bleu très clair */}
                <DialogHeader className="relative bg-blue-50 p-4 border-b border-blue-100 rounded-t-xl">


                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <Edit3 className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                            <DialogTitle className="text-lg font-bold text-blue-900">
                                Modifier l'élément de paie
                            </DialogTitle>
                            <DialogDescription className="text-xs text-blue-700 mt-0.5">
                                Ajustez les paramètres de cet élément
                            </DialogDescription>
                        </div>
                    </div>

                    {/* Indicateur de succès */}
                    {success && (
                        <div className="absolute inset-0 bg-blue-100/90 backdrop-blur-sm flex items-center justify-center rounded-t-xl">
                            <div className="bg-white rounded-xl p-4 shadow border border-blue-200 flex items-center gap-2">
                                <CheckCircle2 className="w-6 h-6 text-blue-500" />
                                <span className="text-base font-semibold text-blue-700">Modifications enregistrées !</span>
                            </div>
                        </div>
                    )}
                </DialogHeader>

                <div className="overflow-y-auto max-h-[calc(90vh-64px)] md:max-h-[calc(75vh-64px)] bg-white">
                    <form className="p-4 space-y-4" onSubmit={handleSubmit}>
                        {/* Section Type et Classification */}
                        <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
                            <h3 className="text-base font-semibold text-blue-800 mb-3 flex items-center gap-2">
                                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                                Type et Classification
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div className="space-y-2">
                                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                                        <FileText className="w-4 h-4 text-gray-500" />
                                        Type d'élément
                                    </label>
                                    <div className="relative">
                                        <Select value={form?.type || ''} onValueChange={v => handleChange('type', v)}>
                                            <SelectTrigger className="h-10 border border-blue-100 focus:border-blue-400 bg-white text-sm">
                                                <SelectValue placeholder="Type" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {typeOptions.map(opt => (
                                                    <SelectItem key={opt.value} value={opt.value}>
                                                        <span className="flex items-center gap-2">
                                                            {opt.icon && <opt.icon className="w-4 h-4 text-blue-500" />}
                                                            {opt.label}
                                                        </span>
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                                        <Calculator className="w-4 h-4 text-gray-500" />
                                        Sous-type
                                    </label>
                                    <div className="relative">
                                        <Input
                                            value={form?.sousType || ''}
                                            onChange={e => handleChange('sousType', e.target.value)}
                                            className="h-10 border border-blue-100 focus:border-blue-400 bg-white text-sm"
                                            placeholder="Sous-type"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Section Informations générales */}
                        <div className="bg-white p-3 rounded-lg border border-blue-50">
                            <h3 className="text-base font-semibold text-blue-800 mb-3 flex items-center gap-2">
                                <div className="w-2 h-2 bg-blue-200 rounded-full"></div>
                                Informations générales
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div className="space-y-2 md:col-span-2">
                                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                                        <FileText className="w-4 h-4 text-gray-500" />
                                        Libellé
                                    </label>
                                    <div className="relative">
                                        <Input
                                            value={form?.libelle || ''}
                                            onChange={e => handleChange('libelle', e.target.value)}
                                            className="h-10 border border-blue-100 focus:border-blue-400 bg-white text-sm"
                                            placeholder="Nom de l'élément"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2 md:col-span-2">
                                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                                        <FileText className="w-4 h-4 text-gray-500" />
                                        Description
                                    </label>
                                    <div className="relative">
                                        <Input
                                            value={form?.description || ''}
                                            onChange={e => handleChange('description', e.target.value)}
                                            className="h-10 border border-blue-100 focus:border-blue-400 bg-white text-sm"
                                            placeholder="Description (optionnelle)"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Section Mode de calcul */}
                        <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
                            <h3 className="text-base font-semibold text-blue-800 mb-3 flex items-center gap-2">
                                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                                Configuration du calcul
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div className="space-y-2 md:col-span-2">
                                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                                        <Calculator className="w-4 h-4 text-gray-500" />
                                        Mode de calcul
                                    </label>
                                    <div className="relative">
                                        <Select value={form?.modeCalcul || ''} onValueChange={v => handleChange('modeCalcul', v)}>
                                            <SelectTrigger className="h-10 border border-blue-100 focus:border-blue-400 bg-white text-sm">
                                                <SelectValue placeholder="Mode de calcul" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {modeCalculOptions.map(opt => (
                                                    <SelectItem key={opt.value} value={opt.value}>
                                                        <span className="flex items-center gap-2">
                                                            {opt.icon && <opt.icon className="w-4 h-4 text-blue-500" />}
                                                            {opt.label}
                                                        </span>
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                                        <DollarSign className="w-4 h-4 text-gray-500" />
                                        Montant
                                    </label>
                                    <div className="relative">
                                        <Input
                                            value={form?.montant || ''}
                                            onChange={e => handleChange('montant', e.target.value)}
                                            className="h-10 border border-blue-100 focus:border-blue-400 bg-white text-sm"
                                            placeholder="0.00"
                                            type="number"
                                            step="0.01"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                                        <Percent className="w-4 h-4 text-gray-500" />
                                        Taux (%)
                                    </label>
                                    <div className="relative">
                                        <Input
                                            value={form?.taux || ''}
                                            onChange={e => handleChange('taux', e.target.value)}
                                            className="h-10 border border-blue-100 focus:border-blue-400 bg-white text-sm"
                                            placeholder="0.00"
                                            type="number"
                                            step="0.01"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2 md:col-span-2">
                                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                                        <Calculator className="w-4 h-4 text-gray-500" />
                                        Base de calcul
                                    </label>
                                    <div className="relative">
                                        <Input
                                            value={form?.base || ''}
                                            onChange={e => handleChange('base', e.target.value)}
                                            className="h-10 border border-blue-100 focus:border-blue-400 bg-white text-sm"
                                            placeholder="Base de calcul"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Section Fiscalité */}
                        <div className="bg-white p-3 rounded-lg border border-blue-50">
                            <h3 className="text-base font-semibold text-blue-800 mb-3 flex items-center gap-2">
                                <div className="w-2 h-2 bg-blue-200 rounded-full"></div>
                                Paramètres fiscaux et sociaux
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div className="space-y-2">
                                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                                        <Calculator className="w-4 h-4 text-gray-500" />
                                        Soumis à l'IR
                                    </label>
                                    <div className="relative">
                                        <Select value={form?.soumisIR ? 'true' : 'false'} onValueChange={v => handleChange('soumisIR', v === 'true')}>
                                            <SelectTrigger className="h-10 border border-blue-100 focus:border-blue-400 bg-white text-sm">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="true">Oui</SelectItem>
                                                <SelectItem value="false">Non</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                                        <Calculator className="w-4 h-4 text-gray-500" />
                                        Soumis CNSS
                                    </label>
                                    <div className="relative">
                                        <Select value={form?.soumisCNSS ? 'true' : 'false'} onValueChange={v => handleChange('soumisCNSS', v === 'true')}>
                                            <SelectTrigger className="h-10 border border-blue-100 focus:border-blue-400 bg-white text-sm">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="true">Oui</SelectItem>
                                                <SelectItem value="false">Non</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Messages d'erreur */}
                        {error && (
                            <div className="bg-red-50 border border-red-200 rounded p-3 flex items-center gap-2 text-sm">
                                <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                                <span className="text-red-700 font-medium">{error}</span>
                            </div>
                        )}

                        {/* Boutons d'action */}
                        <div className="flex justify-end gap-2 pt-4 border-t border-blue-100 bg-white rounded-b-xl">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => onOpenChange(false)}
                                disabled={loading}
                                className="px-5 py-2 h-auto border border-blue-100 hover:bg-blue-50 text-sm"
                            >
                                <X className="w-4 h-4 mr-1" />
                                Annuler
                            </Button>
                            <Button
                                type="submit"
                                disabled={loading}
                                className="px-5 py-2 h-auto bg-blue-600 hover:bg-blue-700 text-white transition-all duration-200 shadow-sm hover:shadow-md rounded"
                            >
                                {loading ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                        Enregistrement...
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-4 h-4 mr-1" />
                                        Enregistrer
                                    </>
                                )}
                            </Button>
                        </div>
                    </form>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default EditElementPaieModal;