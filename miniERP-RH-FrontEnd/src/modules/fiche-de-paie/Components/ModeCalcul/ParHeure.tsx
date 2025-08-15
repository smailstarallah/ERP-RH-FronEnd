import React from 'react';
import { Clock, Calculator } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { modeCalculConfig } from '../../config/ElementPaieConfig';
import { ModeCalcul } from '../../types/ElementPaieTypes';

interface ParHeureProps {
    tarifHeure: string;
    nbHeures: string;
    onTarifHeureChange: (value: string) => void;
    onNbHeuresChange: (value: string) => void;
    calculatePreview: number;
}

export const ParHeure: React.FC<ParHeureProps> = ({
    tarifHeure,
    nbHeures,
    onTarifHeureChange,
    onNbHeuresChange,
    calculatePreview
}) => {
    const config = modeCalculConfig[ModeCalcul.PAR_HEURE];

    return (
        <div className="animate-in slide-in-from-bottom-4 duration-300">
            <div className={`bg-gradient-to-br ${config.bgColor} p-6 rounded-lg ${config.borderColor} border`}>
                <div className="flex items-center gap-3 mb-4">
                    <Clock className="h-6 w-6 text-indigo-600" />
                    <h3 className="text-lg font-semibold text-gray-900">Calcul par heure</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="tarifHeure" className="text-sm font-medium text-gray-700">
                            Tarif par heure (DH) *
                        </Label>
                        <Input
                            id="tarifHeure"
                            type="number"
                            step="0.01"
                            value={tarifHeure}
                            onChange={(e) => onTarifHeureChange(e.target.value)}
                            placeholder="0.00"
                            className={`h-12 border-2 ${config.borderColor} ${config.focusColor}`}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="nbHeures" className="text-sm font-medium text-gray-700">
                            Nombre d'heures *
                        </Label>
                        <Input
                            id="nbHeures"
                            type="number"
                            value={nbHeures}
                            onChange={(e) => onNbHeuresChange(e.target.value)}
                            placeholder="0"
                            className={`h-12 border-2 ${config.borderColor} ${config.focusColor}`}
                        />
                    </div>
                </div>

                {tarifHeure && nbHeures && (
                    <div className="bg-white p-4 rounded-lg border border-indigo-300 mt-4 animate-in fade-in-50 duration-300">
                        <div className="flex items-center gap-3">
                            <Calculator className="h-5 w-5 text-indigo-600" />
                            <div>
                                <p className="font-semibold text-indigo-900">
                                    Résultat : {calculatePreview.toFixed(2)} DH
                                </p>
                                <p className="text-sm text-indigo-700">
                                    {tarifHeure} DH × {nbHeures} heures
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
