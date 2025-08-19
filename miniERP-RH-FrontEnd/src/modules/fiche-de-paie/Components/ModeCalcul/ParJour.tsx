import React from 'react';
import { CalendarDays, Calculator } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { modeCalculConfig } from '../../config/ElementPaieConfig';
import { ModeCalcul } from '../../types/ElementPaieTypes';

interface ParJourProps {
    taux: string;
    onTauxChange: (value: string) => void;
    calculatePreview: number;
}

export const ParJour: React.FC<ParJourProps> = ({
    taux,
    onTauxChange,
    calculatePreview
}) => {
    const config = modeCalculConfig[ModeCalcul.PAR_JOUR];

    return (
        <div className="animate-in slide-in-from-bottom-4 duration-300">
            <div className={`bg-gradient-to-br ${config.bgColor} p-6 rounded-lg ${config.borderColor} border`}>
                <div className="flex items-center gap-3 mb-4">
                    <CalendarDays className="h-6 w-6 text-green-600" />
                    <h3 className="text-lg font-semibold text-gray-900">Calcul par jour</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="tarifJour" className="text-sm font-medium text-gray-700">
                            Tarif par jour (DH) *
                        </Label>
                        <Input
                            id="tarifJour"
                            type="number"
                            step="0.01"
                            value={taux}
                            onChange={(e) => onTauxChange(e.target.value)}
                            placeholder="0.00"
                            className={`h-12 border-2 ${config.borderColor} ${config.focusColor}`}
                        />
                    </div>
                </div>
                {taux && (
                    <div className="bg-white p-4 rounded-lg border border-green-300 mt-4 animate-in fade-in-50 duration-300">
                        <div className="flex items-center gap-3">
                            <Calculator className="h-5 w-5 text-green-600" />
                            <div>
                                <p className="font-semibold text-green-900">
                                    Résultat : {calculatePreview.toFixed(2)} DH
                                </p>
                                <p className="text-sm text-green-700">
                                    {taux} DH × nombre de jours
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
