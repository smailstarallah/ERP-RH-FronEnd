import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface ValidationErrorsProps {
    errors: string[];
}

export const ValidationErrors: React.FC<ValidationErrorsProps> = ({ errors }) => {
    if (errors.length === 0) return null;

    return (
        <div className="mb-6">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                    <AlertTriangle className="h-6 w-6 text-red-600 mt-0.5 flex-shrink-0" />
                    <div>
                        <h3 className="font-semibold text-red-800 mb-2">
                            Veuillez corriger les erreurs suivantes :
                        </h3>
                        <ul className="space-y-1">
                            {errors.map((error, index) => (
                                <li key={index} className="text-sm text-red-700 flex items-center gap-2">
                                    <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                                    {error}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};
