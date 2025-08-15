import React from 'react';
import { FileText } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Hook personnalisé
import { useElementPaieForm } from '../hooks/useElementPaieForm';

// Types
import { ModeCalcul } from '../types/ElementPaieTypes';

// Composants
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

// Composants de mode de calcul
import { MontantFixe } from './ModeCalcul/MontantFixe';
import { Pourcentage } from './ModeCalcul/Pourcentage';
import { ParJour } from './ModeCalcul/ParJour';
import { ParHeure } from './ModeCalcul/ParHeure';
import { Formule } from './ModeCalcul/Formule';
import { Bareme } from './ModeCalcul/Bareme';

interface ElementPaieFormProps {
    isModal?: boolean;
    onSubmitSuccess?: (data: any) => void;
    onCancel?: () => void;
    className?: string;
}

const ElementPaieForm: React.FC<ElementPaieFormProps> = ({
    isModal = false,
    onSubmitSuccess,
    onCancel,
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
        handleSubmit: originalHandleSubmit,
        handleReset,
        calculatePreview,
        isFormValid,
        steps
    } = useElementPaieForm();

    // Gestion du submit avec callback personnalisé pour le modal
    const handleSubmit = async () => {
        const success = await originalHandleSubmit();
        if (success) {
            if (onSubmitSuccess) {
                onSubmitSuccess(formData);
            } else {
                alert('✅ Élément de paie enregistré avec succès !');
            }
        } else {
            alert('❌ Erreur lors de l\'enregistrement');
        }
    };

    // Gestion de l'annulation pour le modal
    const handleCancel = () => {
        if (onCancel) {
            onCancel();
        } else {
            handleReset();
        }
    };

    // Container principal adaptatif (page complète ou modal)
    const containerClass = isModal
        ? `w-full ${className}`
        : `min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 p-4 ${className}`;

    const contentClass = isModal
        ? "w-full"
        : "max-w-6xl mx-auto";

    // Layout adaptatif (single column pour modal, grid pour page)
    const layoutClass = isModal
        ? "space-y-6"
        : "grid grid-cols-1 lg:grid-cols-3 gap-6";

    const renderModeCalculComponent = () => {
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
            case ModeCalcul.BAREME:
                return (
                    <Bareme
                        tauxBase={formData.tauxBase || ''}
                        seuilMin={formData.seuilMin || ''}
                        onTauxBaseChange={(value) => handleInputChange('tauxBase', value)}
                        onSeuilMinChange={(value) => handleInputChange('seuilMin', value)}
                    />
                );
            case ModeCalcul.PAR_JOUR:
                return (
                    <ParJour
                        tarifJour={formData.tarifJour || ''}
                        nbJours={formData.nbJours || ''}
                        onTarifJourChange={(value) => handleInputChange('tarifJour', value)}
                        onNbJoursChange={(value) => handleInputChange('nbJours', value)}
                        calculatePreview={calculatePreview}
                    />
                );
            case ModeCalcul.PAR_HEURE:
                return (
                    <ParHeure
                        tarifHeure={formData.tarifHeure || ''}
                        nbHeures={formData.nbHeures || ''}
                        onTarifHeureChange={(value) => handleInputChange('tarifHeure', value)}
                        onNbHeuresChange={(value) => handleInputChange('nbHeures', value)}
                        calculatePreview={calculatePreview}
                    />
                );
            case ModeCalcul.FORMULE:
                return (
                    <Formule
                        formule={formData.formule || ''}
                        onFormuleChange={(value) => handleInputChange('formule', value)}
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
                                        <GeneralInfo
                                            libelle={formData.libelle}
                                            sousType={formData.sousType}
                                            onLibelleChange={(value) => handleInputChange('libelle', value)}
                                            onSousTypeChange={(value) => handleInputChange('sousType', value)}
                                        />
                                    )}

                                    {/* Étape 3: Mode de calcul */}
                                    {formData.libelle && (
                                        <ModeCalculSelector
                                            selectedMode={formData.modeCalcul}
                                            onModeChange={(value) => handleInputChange('modeCalcul', value)}
                                            showHelp={showHelp === 'calcul'}
                                            onToggleHelp={() => setShowHelp(showHelp === 'calcul' ? null : 'calcul')}
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
