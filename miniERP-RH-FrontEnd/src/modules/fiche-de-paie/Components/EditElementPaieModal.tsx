
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

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
    { value: 'SALAIRE_BASE', label: 'Salaire de base' },
    { value: 'PRIME_FIXE', label: 'Prime fixe' },
    { value: 'PRIME_VARIABLE', label: 'Prime variable' },
    { value: 'HEURES_SUPPLEMENTAIRES', label: 'Heures supplémentaires' },
    { value: 'INDEMNITE', label: 'Indemnité' },
    { value: 'DEDUCTION_ABSENCE', label: 'Déduction absence' },
    { value: 'DEDUCTION_AUTRE', label: 'Déduction autre' },
    { value: 'COTISATION_SOCIALE', label: 'Cotisation sociale' },
    { value: 'IMPOT', label: 'Impôt' },
    { value: 'AUTRE', label: 'Autre' },
];

const modeCalculOptions = [
    { value: 'MONTANT', label: 'Montant' },
    { value: 'TAUX', label: 'Taux' },
    { value: 'PAR_JOUR', label: 'Par jour' },
    { value: 'PAR_HEURE', label: 'Par heure' },
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
    soumisCNSS: false,
    dateCreation: '',
    dateModification: '',
};

const EditElementPaieModal: React.FC<EditElementPaieModalProps> = ({ employeId, open, onOpenChange, elementData }) => {
    const [form, setForm] = useState<ElementPaie>(elementData ?? defaultElementPaie);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    React.useEffect(() => {
        if (open) {
            setForm(elementData ?? defaultElementPaie);
        }
    }, [open]);

    const handleChange = (field: keyof ElementPaie, value: any) => {
        setForm(prev => ({ ...prev, [field]: value }));
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
                onOpenChange(false);
            } else {
                setError("Erreur lors de la modification");
            }
        } catch (err) {
            setError("Erreur réseau");
        }
        setLoading(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0">
                <DialogHeader className="p-6 pb-0">
                    <DialogTitle>Modifier l'élément de paie</DialogTitle>
                    <DialogDescription>Modifiez les paramètres de cet élément de paie</DialogDescription>
                </DialogHeader>
                <form className="p-6 pt-0 space-y-4" onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Type</label>
                            <Select value={form?.type || ''} onValueChange={v => handleChange('type', v)}>
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Type" />
                                </SelectTrigger>
                                <SelectContent>
                                    {typeOptions.map(opt => (
                                        <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Sous-type</label>
                            <Input value={form?.sousType || ''} onChange={e => handleChange('sousType', e.target.value)} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Libellé</label>
                            <Input value={form?.libelle || ''} onChange={e => handleChange('libelle', e.target.value)} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Mode de calcul</label>
                            <Select value={form?.modeCalcul || ''} onValueChange={v => handleChange('modeCalcul', v)}>
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Mode de calcul" />
                                </SelectTrigger>
                                <SelectContent>
                                    {modeCalculOptions.map(opt => (
                                        <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Montant</label>
                            <Input value={form?.montant || ''} onChange={e => handleChange('montant', e.target.value)} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Taux</label>
                            <Input value={form?.taux || ''} onChange={e => handleChange('taux', e.target.value)} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Base</label>
                            <Input value={form?.base || ''} onChange={e => handleChange('base', e.target.value)} />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium mb-1">Description</label>
                            <Input value={form?.description || ''} onChange={e => handleChange('description', e.target.value)} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Soumis IR</label>
                            <Select value={form?.soumisIR ? 'true' : 'false'} onValueChange={v => handleChange('soumisIR', v === 'true')}>
                                <SelectTrigger className="w-full">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="true">Oui</SelectItem>
                                    <SelectItem value="false">Non</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Soumis CNSS</label>
                            <Select value={form?.soumisCNSS ? 'true' : 'false'} onValueChange={v => handleChange('soumisCNSS', v === 'true')}>
                                <SelectTrigger className="w-full">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="true">Oui</SelectItem>
                                    <SelectItem value="false">Non</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    {error && <div className="text-red-600 text-sm">{error}</div>}
                    <div className="flex justify-end gap-2 pt-4">
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>Annuler</Button>
                        <Button type="submit" variant="default" disabled={loading}>Enregistrer</Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default EditElementPaieModal;
