import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from "@/components/ui/switch"

interface GeneralInfoProps {
    libelle: string;
    sousType: string;
    soumisIR: boolean;
    soumisCNSS: boolean;
    onLibelleChange: (value: string) => void;
    onSousTypeChange: (value: string) => void;
    onSousIRChange: (value: boolean) => void;
    onSousCNSSChange: (value: boolean) => void;
}

export const GeneralInfo: React.FC<GeneralInfoProps> = ({
    libelle,
    sousType,
    soumisIR,
    soumisCNSS,
    onLibelleChange,
    onSousTypeChange,
    onSousIRChange,
    onSousCNSSChange
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

            {/* Section des switches avec un design similaire à l'image */}
            <div className="space-y-3 mt-6">
                <Label className="text-sm font-medium text-gray-700 mb-3 block">
                    Options fiscales et sociales
                </Label>

                {/* Switch pour IR */}
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex-1">
                        <div className="text-sm font-medium text-gray-900">
                            Soumis à l'IR
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                            Cet élément est-il soumis à l'Impôt sur le Revenu ?
                        </div>
                    </div>
                    <Switch
                        checked={soumisIR}
                        onCheckedChange={onSousIRChange}
                        className="data-[state=checked]:bg-blue-600"
                    />
                </div>

                {/* Switch pour CNSS */}
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex-1">
                        <div className="text-sm font-medium text-gray-900">
                            Soumis à la CNSS
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                            Cet élément est-il soumis à la CNSS ?
                        </div>
                    </div>
                    <Switch
                        checked={soumisCNSS}
                        onCheckedChange={onSousCNSSChange}
                        className="data-[state=checked]:bg-blue-600"
                    />
                </div>
            </div>
        </div>
    );
};