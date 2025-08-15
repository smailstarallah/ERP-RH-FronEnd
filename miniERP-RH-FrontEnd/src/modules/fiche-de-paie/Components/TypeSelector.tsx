import React from 'react';
import { HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { TypeElement, type TypeElementType } from '../types/ElementPaieTypes';
import { typeConfig } from '../config/ElementPaieConfig';

interface TypeSelectorProps {
    selectedType: TypeElementType | '';
    onTypeChange: (type: string) => void;
    showHelp: boolean;
    onToggleHelp: () => void;
}

export const TypeSelector: React.FC<TypeSelectorProps> = ({
    selectedType,
    onTypeChange,
    showHelp,
    onToggleHelp
}) => {
    const selectedTypeConfig = selectedType ? typeConfig[selectedType as TypeElementType] : null;

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <Label className="text-lg font-semibold text-gray-900">
                    1. Quel type d'élément voulez-vous créer ?
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
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                    <p className="text-sm text-blue-800 mb-2">
                        💡 Choisissez la catégorie qui correspond le mieux à votre élément :
                    </p>
                    <ul className="text-sm text-blue-700 space-y-1 ml-4">
                        <li>• <strong>Rémunération</strong> : Salaires et primes fixes</li>
                        <li>• <strong>Variables</strong> : Primes liées aux performances</li>
                        <li>• <strong>Retenues</strong> : Déductions diverses</li>
                        <li>• <strong>Social/Fiscal</strong> : Cotisations et impôts</li>
                    </ul>
                </div>
            )}

            <Select value={selectedType} onValueChange={onTypeChange}>
                <SelectTrigger className="h-12 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-base">
                    <SelectValue placeholder="Sélectionnez un type d'élément" />
                </SelectTrigger>
                <SelectContent className="max-h-80">
                    {Object.entries(TypeElement).map(([key, value]) => {
                        const config = typeConfig[value];
                        return (
                            <SelectItem key={key} value={value} className="py-3">
                                <div className="flex items-center gap-3 w-full">
                                    <div className={`p-1.5 ${config.color} rounded flex-shrink-0`}>
                                        <config.icon className="h-4 w-4 text-white" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="font-medium">{config.label}</div>
                                        <div className="text-xs text-gray-500">{config.description}</div>
                                    </div>
                                    <Badge variant="outline" className="text-xs">
                                        {config.category}
                                    </Badge>
                                </div>
                            </SelectItem>
                        );
                    })}
                </SelectContent>
            </Select>

            {selectedTypeConfig && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 animate-in fade-in-50 duration-300">
                    <div className="flex items-start gap-3">
                        <div className={`p-2 ${selectedTypeConfig.color} rounded flex-shrink-0`}>
                            <selectedTypeConfig.icon className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <h4 className="font-semibold text-blue-900 mb-1">{selectedTypeConfig.label}</h4>
                            <p className="text-sm text-blue-800 mb-2">{selectedTypeConfig.description}</p>
                            <p className="text-sm text-blue-600 italic">{selectedTypeConfig.example}</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
