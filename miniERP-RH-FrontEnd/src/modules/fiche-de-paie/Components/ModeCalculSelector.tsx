import React from 'react';
import { HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ModeCalcul, type ModeCalculType } from '../types/ElementPaieTypes';
import { modeCalculConfig } from '../config/ElementPaieConfig';

interface ModeCalculSelectorProps {
    selectedMode: ModeCalculType | '';
    onModeChange: (mode: string) => void;
    showHelp: boolean;
    onToggleHelp: () => void;
}

export const ModeCalculSelector: React.FC<ModeCalculSelectorProps> = ({
    selectedMode,
    onModeChange,
    showHelp,
    onToggleHelp
}) => {
    return (
        <div className="space-y-4 animate-in slide-in-from-bottom-4 duration-300 border-t border-gray-200 pt-6">
            <div className="flex items-center justify-between">
                <Label className="text-lg font-semibold text-gray-900">
                    3. Comment ce montant doit-il être calculé ?
                </Label>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={onToggleHelp}
                    className="text-blue-600 hover:text-blue-800"
                >
                    <HelpCircle className="h-4 w-4" />
                </Button>
            </div>

            {showHelp && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-blue-800 mb-2">
                        💡 Choisissez la méthode de calcul :
                    </p>
                    <ul className="text-sm text-blue-700 space-y-1 ml-4">
                        <li>• <strong>Montant fixe</strong> : Le même montant chaque mois</li>
                        <li>• <strong>Pourcentage</strong> : Un pourcentage d'une base</li>
                        <li>• <strong>Par jour/heure</strong> : Calcul selon le temps</li>
                    </ul>
                </div>
            )}

            <Select value={selectedMode} onValueChange={onModeChange}>
                <SelectTrigger className="h-12 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-base">
                    <SelectValue placeholder="Choisissez la méthode de calcul" />
                </SelectTrigger>
                <SelectContent>
                    {Object.entries(ModeCalcul).map(([key, value]) => {
                        const config = modeCalculConfig[value];
                        if (!config) return null;

                        return (
                            <SelectItem key={key} value={value} className="py-3">
                                <div className="flex items-center gap-3">
                                    <config.icon className={`h-4 w-4 text-${config.color}-600`} />
                                    <div>
                                        <div className="font-medium">{config.label}</div>
                                        <div className="text-xs text-gray-500">{config.description}</div>
                                    </div>
                                </div>
                            </SelectItem>
                        );
                    })}
                </SelectContent>
            </Select>
        </div>
    );
};
