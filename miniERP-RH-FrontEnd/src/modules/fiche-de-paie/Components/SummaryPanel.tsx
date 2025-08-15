import React from 'react';
import { CheckCircle2, FileText } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { ElementPaie } from '../types/ElementPaieTypes';
import { typeConfig, modeCalculConfig } from '../config/ElementPaieConfig';

interface SummaryPanelProps {
    formData: ElementPaie;
    calculatePreview: number;
}

export const SummaryPanel: React.FC<SummaryPanelProps> = ({ formData, calculatePreview }) => {
    const selectedTypeConfig = formData.type ? typeConfig[formData.type] : null;
    const selectedModeConfig = formData.modeCalcul ? modeCalculConfig[formData.modeCalcul] : null;

    return (
        <Card className="shadow-sm border border-gray-200 sticky top-4">
            <CardHeader className="bg-gray-50 border-b border-gray-200">
                <CardTitle className="flex items-center gap-2 text-lg text-gray-900">
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                    Résumé
                </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
                <div className="space-y-4">
                    {!formData.type && (
                        <div className="text-center py-8">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                <FileText className="h-8 w-8 text-gray-400" />
                            </div>
                            <p className="text-gray-500 text-sm">
                                Commencez par sélectionner un type d'élément
                            </p>
                        </div>
                    )}

                    {formData.type && selectedTypeConfig && (
                        <div className="p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                                <div className={`p-1.5 ${selectedTypeConfig.color} rounded flex-shrink-0`}>
                                    <selectedTypeConfig.icon className="h-4 w-4 text-white" />
                                </div>
                                <div className="text-sm font-semibold text-gray-900 truncate">
                                    {selectedTypeConfig.label}
                                </div>
                            </div>
                            <Badge variant="secondary" className="text-xs">
                                {selectedTypeConfig.category}
                            </Badge>
                        </div>
                    )}

                    {formData.libelle && (
                        <div>
                            <p className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-1">Nom</p>
                            <p className="font-semibold text-gray-900 break-words">{formData.libelle}</p>
                            {formData.sousType && (
                                <p className="text-sm text-gray-600 mt-1 break-words">{formData.sousType}</p>
                            )}
                        </div>
                    )}

                    {formData.modeCalcul && selectedModeConfig && (
                        <div>
                            <p className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-1">Calcul</p>
                            <div className="flex items-center gap-2">
                                <selectedModeConfig.icon className={`h-4 w-4 text-${selectedModeConfig.color}-600`} />
                                <p className="text-sm font-medium text-gray-900">{selectedModeConfig.label}</p>
                            </div>
                        </div>
                    )}

                    {/* Informations spécifiques au mode de calcul */}
                    {formData.modeCalcul === 'BAREME' && (formData.tauxBase || formData.seuilMin) && (
                        <div className="bg-purple-50 border border-purple-200 p-3 rounded-lg">
                            <p className="text-xs text-purple-600 uppercase tracking-wide font-medium mb-1">
                                Configuration Barème
                            </p>
                            {formData.tauxBase && (
                                <p className="text-sm text-purple-700">
                                    <span className="font-medium">Taux base:</span> {formData.tauxBase}%
                                </p>
                            )}
                            {formData.seuilMin && (
                                <p className="text-sm text-purple-700">
                                    <span className="font-medium">Seuil min:</span> {parseFloat(formData.seuilMin).toFixed(2)} DH
                                </p>
                            )}
                        </div>
                    )}

                    {calculatePreview > 0 && (
                        <div className="bg-green-50 border border-green-200 p-3 rounded-lg">
                            <p className="text-xs text-green-600 uppercase tracking-wide font-medium mb-1">
                                Montant calculé
                            </p>
                            <p className="text-xl font-bold text-green-700">{calculatePreview.toFixed(2)} DH</p>
                        </div>
                    )}

                    {formData.description && (
                        <div>
                            <p className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-1">Description</p>
                            <p className="text-sm text-gray-600 break-words">
                                {formData.description.substring(0, 100)}
                                {formData.description.length > 100 && '...'}
                            </p>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};
