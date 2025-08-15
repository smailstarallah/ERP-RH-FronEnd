import React from 'react';
import { TrendingUp, Info } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { modeCalculConfig } from '../../config/ElementPaieConfig';
import { ModeCalcul } from '../../types/ElementPaieTypes';

interface BaremeProps {
    tauxBase: string;
    seuilMin: string;
    onTauxBaseChange: (value: string) => void;
    onSeuilMinChange: (value: string) => void;
}

export const Bareme: React.FC<BaremeProps> = ({
    tauxBase,
    seuilMin,
    onTauxBaseChange,
    onSeuilMinChange
}) => {
    const config = modeCalculConfig[ModeCalcul.BAREME];

    return (
        <div className="animate-in slide-in-from-bottom-4 duration-300">
            <div className={`bg-gradient-to-br ${config.bgColor} p-6 rounded-lg ${config.borderColor} border`}>
                <div className="flex items-center gap-3 mb-4">
                    <TrendingUp className="h-6 w-6 text-purple-600" />
                    <h3 className="text-lg font-semibold text-gray-900">Grille progressive</h3>
                </div>

                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-4">
                    <div className="flex items-start gap-2">
                        <Info className="h-5 w-5 text-orange-600 mt-0.5 flex-shrink-0" />
                        <div className="text-sm text-orange-800">
                            <p className="font-medium mb-1">Mode de calcul avancé</p>
                            <p>La grille progressive applique différents taux selon les tranches, comme pour l'impôt sur le revenu.</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="tauxBase" className="text-sm font-medium text-gray-700">
                            Taux de base (%) *
                        </Label>
                        <Input
                            id="tauxBase"
                            type="number"
                            step="0.01"
                            value={tauxBase}
                            onChange={(e) => onTauxBaseChange(e.target.value)}
                            placeholder="0.00"
                            className={`h-12 border-2 ${config.borderColor} ${config.focusColor}`}
                        />
                        <p className="text-xs text-gray-500">Pourcentage appliqué à la première tranche</p>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="seuilMin" className="text-sm font-medium text-gray-700">
                            Seuil minimum (DH) *
                        </Label>
                        <Input
                            id="seuilMin"
                            type="number"
                            step="0.01"
                            value={seuilMin}
                            onChange={(e) => onSeuilMinChange(e.target.value)}
                            placeholder="0.00"
                            className={`h-12 border-2 ${config.borderColor} ${config.focusColor}`}
                        />
                        <p className="text-xs text-gray-500">Montant minimum avant application du taux</p>
                    </div>
                </div>

                {tauxBase && seuilMin && (
                    <div className="bg-white p-4 rounded-lg border border-purple-300 mt-4 animate-in fade-in-50 duration-300">
                        <div className="flex items-center gap-3">
                            <TrendingUp className="h-5 w-5 text-purple-600" />
                            <div>
                                <p className="text-sm font-medium text-gray-900">Configuration de base</p>
                                <p className="text-xs text-gray-600">
                                    {tauxBase}% appliqué au-delà de {parseFloat(seuilMin).toFixed(2)} DH
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                <div className="mt-4 p-3 bg-purple-50 border border-purple-200 rounded-lg">
                    <p className="text-xs text-purple-700">
                        <strong>Note :</strong> Cette configuration de base peut être étendue avec des tranches supplémentaires
                        selon les besoins de votre système de paie.
                    </p>
                </div>
            </div>
        </div>
    );
};
