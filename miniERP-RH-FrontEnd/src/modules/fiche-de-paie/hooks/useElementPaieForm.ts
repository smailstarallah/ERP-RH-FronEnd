import { useState, useCallback, useEffect } from 'react';
import { ModeCalcul } from '../types/ElementPaieTypes';
import type { ElementPaie } from '../types/ElementPaieTypes';


export const useElementPaieForm = () => {
    const initialFormData: ElementPaie = {
        type: '',
        sousType: '',
        libelle: '',
        montant: '',
        modeCalcul: '',
        taux: '',
        base: '',
        description: '',
        soumisIR: true,
        soumisCNSS: true,
        // formule: '',
        // periodicite: '',
        // nbHeures: '',
        // nbJours: '',
        // tarifHeure: '',
        // tarifJour: '',
        // tauxBase: '',
        // seuilMin: ''
    };

    const [currentStep, setCurrentStep] = useState(1);
    const [formData, setFormData] = useState<ElementPaie>(initialFormData);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [validationErrors, setValidationErrors] = useState<string[]>([]);
    const [showHelp, setShowHelp] = useState<string | null>(null);

    // Mise à jour automatique de l'étape courante en fonction du formulaire
    useEffect(() => {
        if (!formData.type) {
            setCurrentStep(1);
        } else if (!formData.libelle) {
            setCurrentStep(2);
        } else if (!formData.modeCalcul) {
            setCurrentStep(3);
        } else {
            setCurrentStep(4);
        }
    }, [formData.type, formData.libelle, formData.modeCalcul]);

    const handleInputChange = useCallback((field: keyof ElementPaie, value: string | boolean) => {
        setFormData(prev => {
            if (field === 'soumisIR' || field === 'soumisCNSS') {
                let boolValue: boolean;
                if (typeof value === 'boolean') {
                    boolValue = value;
                } else if (value === 'true') {
                    boolValue = true;
                } else if (value === 'false') {
                    boolValue = false;
                } else {
                    boolValue = Boolean(value);
                }
                return {
                    ...prev,
                    [field]: boolValue
                };
            }
            return {
                ...prev,
                [field]: value
            };
        });
        if (validationErrors.length > 0) {
            setValidationErrors([]);
        }
    }, [validationErrors.length]);

    const validateForm = useCallback((): boolean => {
        const errors: string[] = [];

        if (!formData.type) errors.push('Veuillez sélectionner le type d\'élément');
        if (!formData.libelle.trim()) errors.push('Le nom de l\'élément est obligatoire');
        if (!formData.modeCalcul) errors.push('Veuillez choisir comment calculer cet élément');

        if (formData.modeCalcul === ModeCalcul.MONTANT && !formData.montant) {
            errors.push('Veuillez saisir le montant');
        }

        if (formData.modeCalcul === ModeCalcul.TAUX) {
            if (!formData.taux) errors.push('Veuillez saisir le pourcentage');
            if (!formData.base) errors.push('Veuillez saisir la base de calcul');
        }

        // if (formData.modeCalcul === ModeCalcul.BAREME) {
        //     if (!formData.tauxBase) errors.push('Veuillez saisir le taux de base');
        //     if (!formData.seuilMin) errors.push('Veuillez saisir le seuil minimum');
        // }

        if (formData.modeCalcul === ModeCalcul.PAR_JOUR) {
            if (!formData.taux) errors.push('Veuillez saisir le tarif par jour');
        }

        if (formData.modeCalcul === ModeCalcul.PAR_HEURE) {
            if (!formData.taux) errors.push('Veuillez saisir le tarif par heure');
        }

        // if (formData.modeCalcul === ModeCalcul.FORMULE && !formData.formule) {
        //     errors.push('Veuillez saisir la formule de calcul');
        // }

        setValidationErrors(errors);
        return errors.length === 0;
    }, [formData]);

    const handleSubmit = useCallback(async (): Promise<boolean> => {
        if (!validateForm()) return false;

        setIsSubmitting(true);
        try {
            // Simulation d'un appel API
            await new Promise(resolve => setTimeout(resolve, 1500));
            console.log('Données soumises:', formData);
            return true;
        } catch (error) {
            console.error('Erreur lors de l\'enregistrement:', error);
            return false;
        } finally {
            setIsSubmitting(false);
        }
    }, [formData, validateForm]);

    const handleReset = useCallback(() => {
        setFormData(initialFormData);
        setValidationErrors([]);
        setCurrentStep(1);
        setShowHelp(null);
    }, []);

    const calculatePreview = useCallback((): number => {
        const { modeCalcul, montant, taux, base } = formData;

        switch (modeCalcul) {
            case ModeCalcul.MONTANT:
                return parseFloat(montant) || 0;
            case ModeCalcul.TAUX:
                if (taux && base) {
                    return ((parseFloat(base) || 0) * (parseFloat(taux) || 0)) / 100;
                }
                return 0;
            // case ModeCalcul.BAREME:
            //     // Calcul simple de démonstration pour le barème
            //     if (formData.tauxBase && formData.seuilMin) {
            //         const seuilMinValue = parseFloat(formData.seuilMin) || 0;
            //         const tauxBaseValue = parseFloat(formData.tauxBase) || 0;
            //         // Exemple: si on a une base de calcul, appliquer le barème
            //         if (formData.base) {
            //             const baseValue = parseFloat(formData.base) || 0;
            //             if (baseValue > seuilMinValue) {
            //                 return ((baseValue - seuilMinValue) * tauxBaseValue) / 100;
            //             }
            //         }
            //         return seuilMinValue * (tauxBaseValue / 100);
            //     }
            //     return 0;
            case ModeCalcul.PAR_JOUR:
                if (taux) {
                    return (parseFloat(taux) || 0);
                }
                return 0;
            case ModeCalcul.PAR_HEURE:
                if (taux) {
                    return (parseFloat(taux) || 0);
                }
                return 0;
            default:
                return 0;
        }
    }, [formData]);

    const isFormValid = useCallback(() => {
        const { type, libelle, modeCalcul, montant, taux, base } = formData;

        if (!type || !libelle || !modeCalcul) return false;

        switch (modeCalcul) {
            case ModeCalcul.MONTANT:
                return !!montant;
            case ModeCalcul.TAUX:
                return !!(taux && base);
            // case ModeCalcul.BAREME:
            //     return !!(formData.tauxBase && formData.seuilMin);
            case ModeCalcul.PAR_JOUR:
                return !!(taux);
            case ModeCalcul.PAR_HEURE:
                return !!(taux);
            // case ModeCalcul.FORMULE:
            //     return !!formule;
            default:
                return true;
        }
    }, [formData]);

    const getSteps = useCallback(() => [
        { number: 1, title: 'Type d\'élément', completed: !!formData.type },
        { number: 2, title: 'Informations générales', completed: !!formData.libelle },
        { number: 3, title: 'Mode de calcul', completed: !!formData.modeCalcul },
        { number: 4, title: 'Finalisation', completed: isFormValid() }
    ], [formData, isFormValid]);

    return {
        // State
        currentStep,
        formData,
        isSubmitting,
        validationErrors,
        showHelp,

        // Actions
        setCurrentStep,
        setShowHelp,
        handleInputChange,
        handleSubmit,
        handleReset,

        // Computed
        calculatePreview: calculatePreview(),
        isFormValid: isFormValid(),
        steps: getSteps()
    };
};
