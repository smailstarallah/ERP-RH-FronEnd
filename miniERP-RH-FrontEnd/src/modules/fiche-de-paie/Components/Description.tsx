import React from 'react';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface DescriptionProps {
    description: string;
    onDescriptionChange: (value: string) => void;
}

export const Description: React.FC<DescriptionProps> = ({ description, onDescriptionChange }) => {
    return (
        <div className="space-y-4 animate-in slide-in-from-bottom-4 duration-300 border-t border-gray-200 pt-6">
            <Label className="text-lg font-semibold text-gray-900">
                4. Ajoutez une description (optionnel)
            </Label>
            <div className="space-y-2">
                <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => onDescriptionChange(e.target.value)}
                    placeholder="Décrivez les conditions d'application, les règles particulières, ou toute information utile..."
                    className="min-h-[100px] border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 resize-none text-base"
                />
                <p className="text-xs text-gray-500">
                    Cette description aidera les autres utilisateurs à comprendre l'usage de cet élément
                </p>
            </div>
        </div>
    );
};
