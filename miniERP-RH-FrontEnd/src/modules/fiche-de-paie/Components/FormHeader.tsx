import React from 'react';
import { Building2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export const FormHeader: React.FC = () => {
    return (
        <div className="mb-8">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-600 rounded-lg">
                            <Building2 className="h-8 w-8 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">
                                Configuration des Éléments de Paie
                            </h1>
                            <p className="text-gray-600 mt-1">
                                Assistant de création simplifié pour la gestion de la paie
                            </p>
                        </div>
                    </div>
                    <Badge variant="secondary" className="px-4 py-2 text-sm">
                        Version 1.0
                    </Badge>
                </div>
            </div>
        </div>
    );
};
