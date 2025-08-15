import React from 'react';
import { Percent, Calculator } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { modeCalculConfig } from '../../config/ElementPaieConfig';
import { ModeCalcul } from '../../types/ElementPaieTypes';

interface PourcentageProps {
    taux: string;
    base: string;
    onTauxChange: (value: string) => void;
    onBaseChange: (value: string) => void;
    calculatePreview: number;
}

export const Pourcentage: React.FC<PourcentageProps> = ({
    taux,
    base,
    onTauxChange,
    onBaseChange,
    calculatePreview
}) => {
    const config = modeCalculConfig[ModeCalcul.TAUX];

    return (
        <div className="animate-in slide-in-from-bottom-4 duration-300">
            <div className={`bg-gradient-to-br ${config.bgColor} p-6 rounded-lg ${config.borderColor} border`}>
                <div className="flex items-center gap-3 mb-4">
                    <Percent className="h-6 w-6 text-blue-600" />
                    <h3 className="text-lg font-semibold text-gray-900">Calcul par pourcentage</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="space-y-2">
                        <Label htmlFor="taux" className="text-sm font-medium text-gray-700">
                            Pourcentage (%) *
                        </Label>
                        <Input
                            id="taux"
                            type="number"
                            step="0.01"
                            value={taux}
                            onChange={(e) => onTauxChange(e.target.value)}
                            placeholder="0.00"
                            className={`h-12 border-2 ${config.borderColor} ${config.focusColor}`}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="base" className="text-sm font-medium text-gray-700">
                            Base de calcul (DH) *
                        </Label>
                        <Input
                            id="base"
                            type="number"
                            step="0.01"
                            value={base}
                            onChange={(e) => onBaseChange(e.target.value)}
                            placeholder="0.00"
                            className={`h-12 border-2 ${config.borderColor} ${config.focusColor}`}
                        />
                    </div>
                </div>

                {taux && base && (
                    <div className="bg-white p-4 rounded-lg border border-blue-300 animate-in fade-in-50 duration-300">
                        <div className="flex items-center gap-3">
                            <Calculator className="h-5 w-5 text-blue-600" />
                            <div>
                                <p className="font-semibold text-blue-900">
                                    Résultat : {calculatePreview.toFixed(2)} DH
                                </p>
                                <p className="text-sm text-blue-700">
                                    {base} DH × {taux}% = {calculatePreview.toFixed(2)} DH
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
