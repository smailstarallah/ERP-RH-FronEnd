import React from 'react';
import { Users, Info, Calculator, Shield } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface CotisationAutomatiqueProps {
    typeCotisation?: 'CNSS' | 'AMO' | 'RETRAITE' | 'AUTRE';
    onTypeCotisationChange: (value: 'CNSS' | 'AMO' | 'RETRAITE' | 'AUTRE') => void;
}

export const CotisationAutomatique: React.FC<CotisationAutomatiqueProps> = ({
    typeCotisation = 'CNSS',
    onTypeCotisationChange
}) => {
    const config = {
        bgColor: 'from-indigo-50 to-blue-50',
        borderColor: 'border-indigo-200',
        focusColor: 'focus:border-indigo-500 focus:ring-indigo-200',
    };

    const cotisationInfo = {
        CNSS: {
            label: 'CNSS (Caisse Nationale de Sécurité Sociale)',
            taux: '9.68%',
            description: 'Cotisation obligatoire pour la sécurité sociale',
            base: 'salaire brut'
        },
        AMO: {
            label: 'AMO (Assurance Maladie Obligatoire)',
            taux: '5.50%',
            description: 'Cotisation pour l\'assurance maladie',
            base: 'salaire brut'
        },
        RETRAITE: {
            label: 'Retraite complémentaire',
            taux: '6.40%',
            description: 'Cotisation pour la retraite complémentaire',
            base: 'salaire brut'
        },
        AUTRE: {
            label: 'Autre cotisation',
            taux: 'Variable',
            description: 'Cotisation spécifique à définir',
            base: 'selon réglementation'
        }
    };

    const currentInfo = cotisationInfo[typeCotisation];

    return (
        <div className="animate-in slide-in-from-bottom-4 duration-300">
            <div className={`bg-gradient-to-br ${config.bgColor} p-6 rounded-lg ${config.borderColor} border`}>
                <div className="flex items-center gap-3 mb-4">
                    <Users className="h-6 w-6 text-indigo-600" />
                    <h3 className="text-lg font-semibold text-gray-900">Calcul automatique des cotisations sociales</h3>
                </div>

                <Alert className="mb-4 border-indigo-200 bg-indigo-50">
                    <Info className="h-4 w-4 text-indigo-600" />
                    <AlertDescription className="text-indigo-800">
                        <strong>Calcul automatique activé :</strong> Les cotisations sociales seront calculées
                        automatiquement selon la réglementation en vigueur. Sélectionnez le type de cotisation.
                    </AlertDescription>
                </Alert>

                <div className="space-y-4">
                    <div>
                        <Label htmlFor="typeCotisation" className="text-sm font-medium text-gray-700">
                            Type de cotisation sociale *
                        </Label>
                        <Select value={typeCotisation} onValueChange={onTypeCotisationChange}>
                            <SelectTrigger className={`h-12 border-2 ${config.borderColor} ${config.focusColor} mt-2`}>
                                <SelectValue placeholder="Choisir le type de cotisation" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="CNSS">
                                    <div className="flex items-center gap-2">
                                        <Shield className="h-4 w-4 text-indigo-600" />
                                        <div>
                                            <div className="font-medium">CNSS</div>
                                            <div className="text-xs text-gray-500">Sécurité sociale - 9.68%</div>
                                        </div>
                                    </div>
                                </SelectItem>
                                <SelectItem value="AMO">
                                    <div className="flex items-center gap-2">
                                        <Shield className="h-4 w-4 text-blue-600" />
                                        <div>
                                            <div className="font-medium">AMO</div>
                                            <div className="text-xs text-gray-500">Assurance maladie - 5.50%</div>
                                        </div>
                                    </div>
                                </SelectItem>
                                <SelectItem value="RETRAITE">
                                    <div className="flex items-center gap-2">
                                        <Shield className="h-4 w-4 text-purple-600" />
                                        <div>
                                            <div className="font-medium">Retraite</div>
                                            <div className="text-xs text-gray-500">Retraite complémentaire - 6.40%</div>
                                        </div>
                                    </div>
                                </SelectItem>
                                <SelectItem value="AUTRE">
                                    <div className="flex items-center gap-2">
                                        <Shield className="h-4 w-4 text-gray-600" />
                                        <div>
                                            <div className="font-medium">Autre</div>
                                            <div className="text-xs text-gray-500">Cotisation spécifique</div>
                                        </div>
                                    </div>
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="bg-white p-4 rounded-lg border border-indigo-300 animate-in fade-in-50 duration-300">
                        <div className="flex items-start gap-3">
                            <Calculator className="h-5 w-5 text-indigo-600 mt-1" />
                            <div className="flex-1">
                                <p className="font-semibold text-indigo-900 mb-1">
                                    {currentInfo.label}
                                </p>
                                <div className="text-sm text-indigo-700 space-y-1">
                                    <p>• <strong>Taux :</strong> {currentInfo.taux}</p>
                                    <p>• <strong>Base de calcul :</strong> {currentInfo.base}</p>
                                    <p>• <strong>Description :</strong> {currentInfo.description}</p>
                                </div>
                                <p className="text-xs text-indigo-600 mt-2 italic">
                                    💼 Le calcul sera effectué automatiquement selon la réglementation marocaine
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
