import React from 'react';
import { Save, RotateCcw, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ActionButtonsProps {
    onSubmit: () => Promise<void>;
    onReset: () => void;
    onCancel?: () => void;
    isSubmitting: boolean;
    isFormValid: boolean;
    isModal?: boolean;
}

export const ActionButtons: React.FC<ActionButtonsProps> = ({
    onSubmit,
    onReset,
    onCancel,
    isSubmitting,
    isFormValid,
    isModal = false
}) => {
    if (!isFormValid) return null;

    return (
        <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200 animate-in slide-in-from-bottom-4 duration-300">
            <Button
                onClick={onSubmit}
                disabled={isSubmitting}
                className="flex-1 h-12 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-base shadow-sm hover:shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {isSubmitting ? (
                    <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                        Enregistrement en cours...
                    </div>
                ) : (
                    <div className="flex items-center gap-2">
                        <Save className="h-5 w-5" />
                        Enregistrer l'élément
                    </div>
                )}
            </Button>

            <Button
                onClick={onReset}
                variant="outline"
                disabled={isSubmitting}
                className="flex-1 h-12 border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold text-base shadow-sm hover:shadow-md transition-all duration-200"
            >
                <div className="flex items-center gap-2">
                    <RotateCcw className="h-5 w-5" />
                    {isModal ? 'Réinitialiser' : 'Recommencer'}
                </div>
            </Button>

            {isModal && onCancel && (
                <Button
                    onClick={onCancel}
                    variant="outline"
                    disabled={isSubmitting}
                    className="flex-1 h-12 border-red-300 text-red-700 hover:bg-red-50 font-semibold text-base shadow-sm hover:shadow-md transition-all duration-200"
                >
                    <div className="flex items-center gap-2">
                        <X className="h-5 w-5" />
                        Annuler
                    </div>
                </Button>
            )}
        </div>
    );
};
