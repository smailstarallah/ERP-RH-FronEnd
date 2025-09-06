import React from 'react';
import { FileText, Zap, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useElementPaieForm } from '../hooks/useElementPaieForm';
import { ModeCalcul } from '../types/ElementPaieTypes';
import { FormHeader } from './FormHeader';
import { ProgressIndicator } from './ProgressIndicator';
import { ValidationErrors } from './ValidationErrors';
import { TypeSelector } from './TypeSelector';
import { GeneralInfo } from './GeneralInfo';
import { ModeCalculSelector } from './ModeCalculSelector';
import { Description } from './Description';
import { ActionButtons } from './ActionButtons';
import { SummaryPanel } from './SummaryPanel';
import { HelpGuide } from './HelpGuide';
import { MontantFixe } from './ModeCalcul/MontantFixe';
import { Pourcentage } from './ModeCalcul/Pourcentage';
import { ParJour } from './ModeCalcul/ParJour';
import { ParHeure } from './ModeCalcul/ParHeure';
import { CalculAutomatique } from './ModeCalcul/CalculAutomatique';
// import { Formule } from './ModeCalcul/Formule';
// import { Bareme } from './ModeCalcul/Bareme';

interface ElementPaieFormProps {
    isModal?: boolean;
    onSubmitSuccess?: (data: any) => void;
    onCancel?: () => void;
    className?: string;
    employeId: number;
}

const ElementPaieForm: React.FC<ElementPaieFormProps> = ({
    isModal = false,
    onSubmitSuccess,
    onCancel,
    employeId,
    className = ""
}) => {
    const {
        currentStep,
        formData,
        isSubmitting,
        validationErrors,
        showHelp,
        setShowHelp,
        handleInputChange,
        handleReset,
        calculatePreview,
        isFormValid,
        steps
    } = useElementPaieForm();

    const handleSubmit = async () => {
        try {
            // Préparer les données avec l'indicateur de calcul automatique
            const dataToSubmit = {
                ...formData,
                calculAutomatique: formData.modeCalcul === ModeCalcul.AUTOMATIQUE_TIME_TRACKING,
                // Pour le calcul automatique time tracking, envoyer les données au backend
                uniteCalcul: formData.modeCalcul === ModeCalcul.AUTOMATIQUE_TIME_TRACKING
                    ? (formData.uniteCalcul || 'HEURE')
                    : undefined
            };

            const response = await fetch(`http://localhost:8080/api/fiche-paie/ajouter-element-paie?employeId=${employeId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(dataToSubmit),
            });
            if (response.ok) {
                const data = await response.json();
                if (onSubmitSuccess) {
                    onSubmitSuccess(data);
                    console.log('✅ Élément de paie enregistré avec succès !', data);
                } else {
                    alert('✅ Élément de paie enregistré avec succès !');
                }
            } else {
                alert('❌ Erreur lors de l\'enregistrement');
            }
        } catch (error) {
            alert('❌ Erreur lors de l\'enregistrement');
            console.error(error);
        }
    };

    const handleCancel = () => {
        if (onCancel) {
            onCancel();
        } else {
            handleReset();
        }
    };

    const containerClass = isModal
        ? `w-full ${className}`
        : `min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 p-4 ${className}`;

    const contentClass = isModal
        ? "w-full"
        : "max-w-6xl mx-auto";

    const layoutClass = isModal
        ? "space-y-6"
        : "grid grid-cols-1 lg:grid-cols-3 gap-6";

    const renderModeCalculComponent = () => {
        // Pour les déductions, retards et heures supplémentaires, afficher le mode automatique si sélectionné
        const isDeductionType = formData.type === 'DEDUCTION_ABSENCE' || formData.type === 'DEDUCTION_RETARD';
        const isHeureSupplementaireType = formData.type === 'HEURES_SUPPLEMENTAIRES';
        const canUseAutomaticCalcul = isDeductionType || isHeureSupplementaireType;

        switch (formData.modeCalcul) {
            case ModeCalcul.MONTANT:
                return (
                    <MontantFixe
                        montant={formData.montant}
                        onMontantChange={(value) => handleInputChange('montant', value)}
                    />
                );
            case ModeCalcul.TAUX:
                return (
                    <Pourcentage
                        taux={formData.taux}
                        base={formData.base}
                        onTauxChange={(value) => handleInputChange('taux', value)}
                        onBaseChange={(value) => handleInputChange('base', value)}
                        calculatePreview={calculatePreview}
                    />
                );
            case ModeCalcul.AUTOMATIQUE_TIME_TRACKING:
                // Afficher pour les déductions et heures supplémentaires
                if (canUseAutomaticCalcul) {
                    return (
                        <CalculAutomatique
                            taux={formData.taux}
                            onTauxChange={(value) => handleInputChange('taux', value)}
                            uniteCalcul={formData.uniteCalcul || 'HEURE'}
                            onUniteCalculChange={(value) => handleInputChange('uniteCalcul', value)}
                            typeElement={formData.type as 'DEDUCTION_ABSENCE' | 'DEDUCTION_RETARD' | 'HEURES_SUPPLEMENTAIRES'}
                        />
                    );
                }
                return null;
            case ModeCalcul.PAR_JOUR:
                return (
                    <ParJour
                        taux={formData.taux || ''}
                        onTauxChange={(value) => handleInputChange('taux', value)}
                        calculatePreview={calculatePreview}
                    />
                );
            case ModeCalcul.PAR_HEURE:
                return (
                    <ParHeure
                        taux={formData.taux || ''}
                        onTauxChange={(value) => handleInputChange('taux', value)}
                        calculatePreview={calculatePreview}
                    />
                );
            default:
                return null;
        }
    };

    return (
        <div className={containerClass}>
            <div className={contentClass}>
                {/* En-tête - masqué en mode modal */}
                {!isModal && <FormHeader />}

                {/* Indicateur de progression */}
                <ProgressIndicator steps={steps} currentStep={currentStep} />

                {/* Erreurs de validation */}
                <ValidationErrors errors={validationErrors} />

                <div className={layoutClass}>
                    {/* Formulaire principal */}
                    <div className={isModal ? "w-full" : "lg:col-span-2"}>
                        <Card className="shadow-sm border border-gray-200">
                            <CardHeader className="bg-gray-50 border-b border-gray-200">
                                <CardTitle className="flex items-center gap-2 text-xl text-gray-900">
                                    <FileText className="h-6 w-6 text-blue-600" />
                                    Informations de l'élément
                                </CardTitle>
                            </CardHeader>

                            <CardContent className="p-6">
                                <div className="space-y-8">
                                    {/* Étape 1: Type d'élément */}
                                    <TypeSelector
                                        selectedType={formData.type}
                                        onTypeChange={(value) => handleInputChange('type', value)}
                                        showHelp={showHelp === 'type'}
                                        onToggleHelp={() => setShowHelp(showHelp === 'type' ? null : 'type')}
                                    />

                                    {/* Étape 2: Informations générales */}
                                    {formData.type && (
                                        <>
                                            {/* Message informatif pour les déductions */}
                                            {(formData.type === 'DEDUCTION_ABSENCE' || formData.type === 'DEDUCTION_RETARD') && (
                                                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 animate-in fade-in-50 duration-300">
                                                    <div className="flex items-start gap-3">
                                                        <div className="p-1 bg-orange-600 rounded flex-shrink-0">
                                                            <Zap className="h-4 w-4 text-white" />
                                                        </div>
                                                        <div>
                                                            <h4 className="font-semibold text-orange-900 mb-1">
                                                                Calcul automatique disponible
                                                            </h4>
                                                            <p className="text-sm text-orange-800 mb-2">
                                                                Pour ce type de déduction, vous pouvez choisir le <strong>calcul automatique</strong>
                                                                qui récupérera les données de retards et d'absences directement depuis votre système
                                                                de time tracking.
                                                            </p>
                                                            <p className="text-xs text-orange-700 italic">
                                                                💡 Vous n'aurez qu'à saisir le taux de déduction, le montant sera calculé automatiquement.
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Message informatif pour les cotisations sociales */}
                                            {formData.type === 'COTISATION_SOCIALE' && (
                                                <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 animate-in fade-in-50 duration-300">
                                                    <div className="flex items-start gap-3">
                                                        <div className="p-1 bg-indigo-600 rounded flex-shrink-0">
                                                            <Users className="h-4 w-4 text-white" />
                                                        </div>
                                                        <div>
                                                            <h4 className="font-semibold text-indigo-900 mb-1">
                                                                Cotisations obligatoires calculées automatiquement
                                                            </h4>
                                                            <p className="text-sm text-indigo-800 mb-2">
                                                                Les cotisations sociales obligatoires <strong>CNSS (9.68%)</strong> et <strong>AMO (5.50%)</strong>
                                                                sont calculées automatiquement par le système selon la réglementation en vigueur.
                                                            </p>
                                                            <p className="text-xs text-indigo-700 italic">
                                                                💼 Vous pouvez configurer des cotisations complémentaires si nécessaire.
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Message informatif pour les impôts */}
                                            {formData.type === 'IMPOT' && (
                                                <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 animate-in fade-in-50 duration-300">
                                                    <div className="flex items-start gap-3">
                                                        <div className="p-1 bg-slate-600 rounded flex-shrink-0">
                                                            <FileText className="h-4 w-4 text-white" />
                                                        </div>
                                                        <div>
                                                            <h4 className="font-semibold text-slate-900 mb-1">
                                                                Impôt sur le revenu calculé automatiquement
                                                            </h4>
                                                            <p className="text-sm text-slate-800 mb-2">
                                                                L'<strong>Impôt sur le Revenu (IR)</strong> est calculé automatiquement selon le barème
                                                                progressif en vigueur (de 0% à 38% selon les tranches de revenus).
                                                            </p>
                                                            <p className="text-xs text-slate-700 italic">
                                                                🏛️ Vous pouvez configurer d'autres taxes spécifiques si nécessaire.
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Message informatif pour les heures supplémentaires */}
                                            {formData.type === 'HEURES_SUPPLEMENTAIRES' && (
                                                <div className="bg-green-50 border border-green-200 rounded-lg p-4 animate-in fade-in-50 duration-300">
                                                    <div className="flex items-start gap-3">
                                                        <div className="p-1 bg-green-600 rounded flex-shrink-0">
                                                            <Zap className="h-4 w-4 text-white" />
                                                        </div>
                                                        <div>
                                                            <h4 className="font-semibold text-green-900 mb-1">
                                                                Calcul automatique disponible
                                                            </h4>
                                                            <p className="text-sm text-green-800 mb-2">
                                                                Pour les heures supplémentaires, vous pouvez choisir le <strong>calcul automatique</strong>
                                                                qui récupérera les données d'heures supplémentaires directement depuis votre système
                                                                de time tracking.
                                                            </p>
                                                            <p className="text-xs text-green-700 italic">
                                                                ⏰ Le comptage sera effectué par heure et le montant calculé automatiquement selon le taux saisi.
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            <GeneralInfo
                                                libelle={formData.libelle}
                                                sousType={formData.sousType}
                                                soumisIR={formData.soumisIR}
                                                soumisCNSS={formData.soumisCNSS}
                                                onSousIRChange={(value) => handleInputChange('soumisIR', value)}
                                                onSousCNSSChange={(value) => handleInputChange('soumisCNSS', value)}
                                                onLibelleChange={(value) => handleInputChange('libelle', value)}
                                                onSousTypeChange={(value) => handleInputChange('sousType', value)}
                                            />
                                        </>
                                    )}

                                    {/* Étape 3: Mode de calcul */}
                                    {formData.libelle && (
                                        <ModeCalculSelector
                                            selectedMode={formData.modeCalcul}
                                            onModeChange={(value) => handleInputChange('modeCalcul', value)}
                                            showHelp={showHelp === 'calcul'}
                                            onToggleHelp={() => setShowHelp(showHelp === 'calcul' ? null : 'calcul')}
                                            selectedType={formData.type}
                                        />
                                    )}

                                    {/* Configuration selon le mode de calcul */}
                                    {formData.modeCalcul && renderModeCalculComponent()}

                                    {/* Étape 4: Description */}
                                    {formData.modeCalcul && (
                                        <Description
                                            description={formData.description}
                                            onDescriptionChange={(value) => handleInputChange('description', value)}
                                        />
                                    )}

                                    {/* Boutons d'action */}
                                    <ActionButtons
                                        onSubmit={handleSubmit}
                                        onReset={isModal ? handleCancel : handleReset}
                                        onCancel={isModal ? handleCancel : undefined}
                                        isSubmitting={isSubmitting}
                                        isFormValid={isFormValid}
                                        isModal={isModal}
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Panneau latéral - masqué en mode modal */}
                    {!isModal && (
                        <div className="space-y-6">
                            {/* Résumé de l'élément */}
                            <SummaryPanel formData={formData} calculatePreview={calculatePreview} />

                            {/* Guides d'aide */}
                            <HelpGuide />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ElementPaieForm;
