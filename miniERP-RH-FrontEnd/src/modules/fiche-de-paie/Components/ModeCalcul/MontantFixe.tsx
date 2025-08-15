import React from 'react';
import { DollarSign } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { modeCalculConfig } from '../../config/ElementPaieConfig';
import { ModeCalcul } from '../../types/ElementPaieTypes';

interface MontantFixeProps {
    montant: string;
    onMontantChange: (value: string) => void;
}

export const MontantFixe: React.FC<MontantFixeProps> = ({ montant, onMontantChange }) => {
    const config = modeCalculConfig[ModeCalcul.MONTANT];

    return (
        <div className="animate-in slide-in-from-bottom-4 duration-300">
            <div className={`bg-gradient-to-br ${config.bgColor} p-6 rounded-lg ${config.borderColor} border`}>
                <div className="flex items-center gap-3 mb-4">
                    <DollarSign className="h-6 w-6 text-emerald-600" />
                    <h3 className="text-lg font-semibold text-gray-900">Montant fixe</h3>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="montant" className="text-sm font-medium text-gray-700">
                        Montant en DH *
                    </Label>
                    <Input
                        id="montant"
                        type="number"
                        step="0.01"
                        value={montant}
                        onChange={(e) => onMontantChange(e.target.value)}
                        placeholder="0.00"
                        className={`h-12 text-lg border-2 ${config.borderColor} ${config.focusColor}`}
                    />
                    <p className="text-xs text-gray-500">Ce montant sera identique chaque mois</p>
                </div>
            </div>
        </div>
    );
};
