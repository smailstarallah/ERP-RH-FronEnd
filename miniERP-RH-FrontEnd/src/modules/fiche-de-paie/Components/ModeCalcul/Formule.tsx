import React from 'react';
import { Code } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { modeCalculConfig } from '../../config/ElementPaieConfig';
import { ModeCalcul } from '../../types/ElementPaieTypes';

interface FormuleProps {
    formule: string;
    onFormuleChange: (value: string) => void;
}

export const Formule: React.FC<FormuleProps> = ({ formule, onFormuleChange }) => {
    const config = modeCalculConfig[ModeCalcul.FORMULE];

    return (
        <div className="animate-in slide-in-from-bottom-4 duration-300">
            <div className={`bg-gradient-to-br ${config.bgColor} p-6 rounded-lg ${config.borderColor} border`}>
                <div className="flex items-center gap-3 mb-4">
                    <Code className="h-6 w-6 text-yellow-600" />
                    <h3 className="text-lg font-semibold text-gray-900">Formule personnalisée</h3>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="formule" className="text-sm font-medium text-gray-700">
                        Entrez la formule (ex: base * taux / 100) *
                    </Label>
                    <Input
                        id="formule"
                        type="text"
                        value={formule}
                        onChange={(e) => onFormuleChange(e.target.value)}
                        placeholder="base * taux / 100"
                        className={`h-12 border-2 ${config.borderColor} ${config.focusColor}`}
                    />
                    <p className="text-xs text-gray-500">
                        Vous pouvez utiliser les variables : base, taux, montant
                    </p>
                </div>
            </div>
        </div>
    );
};
