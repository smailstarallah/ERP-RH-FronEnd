import React from 'react';
import { Zap, Info, Clock, Calculator, Calendar } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface CalculAutomatiqueProps {
    taux: string;
    onTauxChange: (value: string) => void;
    uniteCalcul?: 'HEURE' | 'JOUR';
    onUniteCalculChange: (value: 'HEURE' | 'JOUR') => void;
    typeElement?: 'DEDUCTION_ABSENCE' | 'DEDUCTION_RETARD' | 'HEURES_SUPPLEMENTAIRES';
}

export const CalculAutomatique: React.FC<CalculAutomatiqueProps> = ({
    taux,
    onTauxChange,
    uniteCalcul = 'HEURE',
    onUniteCalculChange,
    typeElement
}) => {
    // Déterminer l'unité automatiquement selon le type
    const uniteAutomatique = typeElement === 'DEDUCTION_ABSENCE' ? 'JOUR' : 'HEURE';

    // Mettre à jour l'unité si elle ne correspond pas au type
    React.useEffect(() => {
        if (uniteCalcul !== uniteAutomatique) {
            onUniteCalculChange(uniteAutomatique);
        }
    }, [typeElement, uniteCalcul, uniteAutomatique, onUniteCalculChange]);
    const config = {
        bgColor: 'from-orange-50 to-red-50',
        borderColor: 'border-orange-200',
        focusColor: 'focus:border-orange-500 focus:ring-orange-200',
    };

    return (
        <div className="animate-in slide-in-from-bottom-4 duration-300">
            <div className={`bg-gradient-to-br ${config.bgColor} p-6 rounded-lg ${config.borderColor} border`}>
                <div className="flex items-center gap-3 mb-4">
                    <Zap className="h-6 w-6 text-orange-600" />
                    <h3 className="text-lg font-semibold text-gray-900">Calcul automatique depuis Time Tracking</h3>
                </div>

                <Alert className="mb-4 border-orange-200 bg-orange-50">
                    <Info className="h-4 w-4 text-orange-600" />
                    <AlertDescription className="text-orange-800">
                        <strong>Calcul automatique activé :</strong> Le montant sera calculé automatiquement
                        en fonction des données du système de time tracking.
                        Vous n'avez besoin que de définir le taux.
                    </AlertDescription>
                </Alert>

                <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <Label className="text-sm font-medium text-gray-700">
                                Unité de calcul
                            </Label>
                            <div className={`h-12 border-2 ${config.borderColor} rounded-md px-3 py-2 bg-gray-50 flex items-center gap-2 mt-2`}>
                                {uniteAutomatique === 'HEURE' ? (
                                    <>
                                        <Clock className="h-4 w-4 text-gray-600" />
                                        <span className="text-gray-700 font-medium">Par heure</span>
                                        <span className="text-xs text-gray-500 ml-auto">(Retards)</span>
                                    </>
                                ) : (
                                    <>
                                        <Calendar className="h-4 w-4 text-gray-600" />
                                        <span className="text-gray-700 font-medium">Par jour</span>
                                        <span className="text-xs text-gray-500 ml-auto">(Absences)</span>
                                    </>
                                )}
                            </div>
                        </div>

                        <div>
                            <Label htmlFor="taux" className="text-sm font-medium text-gray-700">
                                Taux {uniteAutomatique === 'HEURE' ? 'par heure' : 'par jour'} (DH) *
                            </Label>
                            <Input
                                id="taux"
                                type="number"
                                step="0.01"
                                min="0"
                                value={taux}
                                onChange={(e) => onTauxChange(e.target.value)}
                                placeholder={uniteAutomatique === 'HEURE' ? 'Ex: 25.00' : 'Ex: 200.00'}
                                className={`h-12 border-2 ${config.borderColor} ${config.focusColor} mt-2`}
                            />
                            <p className="text-sm text-gray-600 mt-1">
                                Montant pour chaque {uniteAutomatique === 'HEURE' ? 'heure' : 'jour'}
                            </p>
                        </div>
                    </div>

                    {taux && (
                        <div className="bg-white p-4 rounded-lg border border-orange-300 animate-in fade-in-50 duration-300">
                            <div className="flex items-start gap-3">
                                <Calculator className="h-5 w-5 text-orange-600 mt-1" />
                                <div className="flex-1">
                                    <p className="font-semibold text-orange-900 mb-1">
                                        Exemple de calcul automatique
                                    </p>
                                    <div className="text-sm text-orange-700 space-y-1">
                                        {uniteAutomatique === 'HEURE' ? (
                                            typeElement === 'HEURES_SUPPLEMENTAIRES' ? (
                                                <>
                                                    <p>• 2 heures supplémentaires = 2h × {taux} DH = {(parseFloat(taux || '0') * 2).toFixed(2)} DH</p>
                                                    <p>• 5 heures supplémentaires = 5h × {taux} DH = {(parseFloat(taux || '0') * 5).toFixed(2)} DH</p>
                                                    <p>• 1.5 heures supplémentaires = 1.5h × {taux} DH = {(parseFloat(taux || '0') * 1.5).toFixed(2)} DH</p>
                                                </>
                                            ) : (
                                                <>
                                                    <p>• Retard de 30 minutes = 0.5h × {taux} DH = {(parseFloat(taux || '0') * 0.5).toFixed(2)} DH</p>
                                                    <p>• Absence de 2h = 2h × {taux} DH = {(parseFloat(taux || '0') * 2).toFixed(2)} DH</p>
                                                    <p>• Sortie anticipée de 1h = 1h × {taux} DH = {(parseFloat(taux || '0') * 1).toFixed(2)} DH</p>
                                                </>
                                            )
                                        ) : (
                                            <>
                                                <p>• Absence de 1 jour = 1j × {taux} DH = {(parseFloat(taux || '0') * 1).toFixed(2)} DH</p>
                                                <p>• Absence de 3 jours = 3j × {taux} DH = {(parseFloat(taux || '0') * 3).toFixed(2)} DH</p>
                                            </>
                                        )}
                                    </div>
                                    <p className="text-xs text-orange-600 mt-2 italic">
                                        <Clock className="h-3 w-3 inline mr-1" />
                                        Les données {uniteAutomatique === 'HEURE' ? 'horaires' : 'journalières'} sont récupérées automatiquement du système de time tracking
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
