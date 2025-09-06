import React from 'react';
import { FileText, Info, Calculator, Receipt } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ImpotAutomatiqueProps {
    typeImpot?: 'IR' | 'TAXE_PROFESSIONNELLE' | 'AUTRE';
    onTypeImpotChange: (value: 'IR' | 'TAXE_PROFESSIONNELLE' | 'AUTRE') => void;
}

export const ImpotAutomatique: React.FC<ImpotAutomatiqueProps> = ({
    typeImpot = 'IR',
    onTypeImpotChange
}) => {
    const config = {
        bgColor: 'from-slate-50 to-gray-50',
        borderColor: 'border-slate-200',
        focusColor: 'focus:border-slate-500 focus:ring-slate-200',
    };

    const impotInfo = {
        IR: {
            label: 'IR (Impôt sur le Revenu)',
            description: 'Impôt progressif sur le revenu salarial',
            calcul: 'Barème progressif selon tranches',
            exemple: 'De 0% à 38% selon le revenu'
        },
        TAXE_PROFESSIONNELLE: {
            label: 'Taxe professionnelle',
            description: 'Taxe locale sur l\'activité professionnelle',
            calcul: 'Selon la réglementation locale',
            exemple: 'Variable selon la commune'
        },
        AUTRE: {
            label: 'Autre impôt',
            description: 'Impôt spécifique à définir',
            calcul: 'Selon réglementation spécifique',
            exemple: 'Variable'
        }
    };

    const currentInfo = impotInfo[typeImpot];

    return (
        <div className="animate-in slide-in-from-bottom-4 duration-300">
            <div className={`bg-gradient-to-br ${config.bgColor} p-6 rounded-lg ${config.borderColor} border`}>
                <div className="flex items-center gap-3 mb-4">
                    <FileText className="h-6 w-6 text-slate-600" />
                    <h3 className="text-lg font-semibold text-gray-900">Calcul automatique des impôts</h3>
                </div>

                <Alert className="mb-4 border-slate-200 bg-slate-50">
                    <Info className="h-4 w-4 text-slate-600" />
                    <AlertDescription className="text-slate-800">
                        <strong>Calcul automatique activé :</strong> Les impôts seront calculés automatiquement
                        selon la réglementation fiscale en vigueur. Sélectionnez le type d'impôt.
                    </AlertDescription>
                </Alert>

                <div className="space-y-4">
                    <div>
                        <Label htmlFor="typeImpot" className="text-sm font-medium text-gray-700">
                            Type d'impôt *
                        </Label>
                        <Select value={typeImpot} onValueChange={onTypeImpotChange}>
                            <SelectTrigger className={`h-12 border-2 ${config.borderColor} ${config.focusColor} mt-2`}>
                                <SelectValue placeholder="Choisir le type d'impôt" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="IR">
                                    <div className="flex items-center gap-2">
                                        <Receipt className="h-4 w-4 text-red-600" />
                                        <div>
                                            <div className="font-medium">IR - Impôt sur le Revenu</div>
                                            <div className="text-xs text-gray-500">Barème progressif 0% à 38%</div>
                                        </div>
                                    </div>
                                </SelectItem>
                                <SelectItem value="TAXE_PROFESSIONNELLE">
                                    <div className="flex items-center gap-2">
                                        <Receipt className="h-4 w-4 text-blue-600" />
                                        <div>
                                            <div className="font-medium">Taxe professionnelle</div>
                                            <div className="text-xs text-gray-500">Taxe locale variable</div>
                                        </div>
                                    </div>
                                </SelectItem>
                                <SelectItem value="AUTRE">
                                    <div className="flex items-center gap-2">
                                        <Receipt className="h-4 w-4 text-gray-600" />
                                        <div>
                                            <div className="font-medium">Autre impôt</div>
                                            <div className="text-xs text-gray-500">Impôt spécifique</div>
                                        </div>
                                    </div>
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="bg-white p-4 rounded-lg border border-slate-300 animate-in fade-in-50 duration-300">
                        <div className="flex items-start gap-3">
                            <Calculator className="h-5 w-5 text-slate-600 mt-1" />
                            <div className="flex-1">
                                <p className="font-semibold text-slate-900 mb-1">
                                    {currentInfo.label}
                                </p>
                                <div className="text-sm text-slate-700 space-y-1">
                                    <p>• <strong>Description :</strong> {currentInfo.description}</p>
                                    <p>• <strong>Mode de calcul :</strong> {currentInfo.calcul}</p>
                                    <p>• <strong>Taux :</strong> {currentInfo.exemple}</p>
                                    {typeImpot === 'IR' && (
                                        <div className="mt-2 text-xs text-slate-600">
                                            <p><strong>Tranches IR 2024 :</strong></p>
                                            <p>• 0 à 30 000 DH : 0%</p>
                                            <p>• 30 001 à 50 000 DH : 10%</p>
                                            <p>• 50 001 à 60 000 DH : 20%</p>
                                            <p>• 60 001 à 80 000 DH : 30%</p>
                                            <p>• Plus de 80 000 DH : 38%</p>
                                        </div>
                                    )}
                                </div>
                                <p className="text-xs text-slate-600 mt-2 italic">
                                    🏛️ Le calcul sera effectué automatiquement selon la réglementation fiscale marocaine
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
