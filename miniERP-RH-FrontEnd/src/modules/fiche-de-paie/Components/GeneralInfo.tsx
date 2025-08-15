import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

interface GeneralInfoProps {
    libelle: string;
    sousType: string;
    onLibelleChange: (value: string) => void;
    onSousTypeChange: (value: string) => void;
}

export const GeneralInfo: React.FC<GeneralInfoProps> = ({
    libelle,
    sousType,
    onLibelleChange,
    onSousTypeChange
}) => {
    return (
        <div className="space-y-4 animate-in slide-in-from-bottom-4 duration-300 border-t border-gray-200 pt-6">
            <Label className="text-lg font-semibold text-gray-900">
                2. Comment voulez-vous nommer cet élément ?
            </Label>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="libelle" className="text-sm font-medium text-gray-700">
                        Nom de l'élément *
                    </Label>
                    <Input
                        id="libelle"
                        value={libelle}
                        onChange={(e) => onLibelleChange(e.target.value)}
                        placeholder="Ex: Prime de transport"
                        className="h-12 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-base"
                    />
                    <p className="text-xs text-gray-500">
                        Ce nom apparaîtra sur le bulletin de paie
                    </p>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="sousType" className="text-sm font-medium text-gray-700">
                        Sous-catégorie (optionnel)
                    </Label>
                    <Input
                        id="sousType"
                        value={sousType}
                        onChange={(e) => onSousTypeChange(e.target.value)}
                        placeholder="Ex: Mensuelle"
                        className="h-12 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-base"
                    />
                    <p className="text-xs text-gray-500">
                        Pour préciser le type si nécessaire
                    </p>
                </div>
            </div>
        </div>
    );
};
