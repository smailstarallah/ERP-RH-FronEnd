import React from 'react';
import { HelpCircle, Info } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const HelpGuide: React.FC = () => {
    return (
        <>
            <Card className="shadow-sm border border-blue-200 bg-blue-50">
                <CardHeader className="bg-blue-100 border-b border-blue-200">
                    <CardTitle className="flex items-center gap-2 text-lg text-blue-900">
                        <HelpCircle className="h-5 w-5" />
                        Guide d'utilisation
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                    <div className="space-y-3">
                        <div className="flex items-start gap-2">
                            <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold mt-0.5">
                                1
                            </div>
                            <div>
                                <h4 className="font-medium text-blue-900 text-sm">Type d'élément</h4>
                                <p className="text-xs text-blue-700">
                                    Choisissez la catégorie qui correspond à votre élément de paie
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-2">
                            <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold mt-0.5">
                                2
                            </div>
                            <div>
                                <h4 className="font-medium text-blue-900 text-sm">Informations</h4>
                                <p className="text-xs text-blue-700">
                                    Donnez un nom clair qui apparaîtra sur le bulletin
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-2">
                            <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold mt-0.5">
                                3
                            </div>
                            <div>
                                <h4 className="font-medium text-blue-900 text-sm">Calcul</h4>
                                <p className="text-xs text-blue-700">
                                    Définissez comment le montant sera calculé chaque mois
                                </p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="shadow-sm border border-green-200 bg-green-50">
                <CardHeader className="bg-green-100 border-b border-green-200">
                    <CardTitle className="flex items-center gap-2 text-lg text-green-900">
                        <Info className="h-5 w-5" />
                        Exemples fréquents
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                    <div className="space-y-3 text-xs">
                        <div>
                            <h4 className="font-semibold text-green-900">Prime de transport</h4>
                            <p className="text-green-700">Type: Prime fixe • Calcul: Montant fixe (300 DH)</p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-green-900">Cotisation CNSS</h4>
                            <p className="text-green-700">Type: Cotisation sociale • Calcul: 4.48% du salaire brut</p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-green-900">Prime de rendement</h4>
                            <p className="text-green-700">Type: Prime variable • Calcul: 2% du chiffre d'affaires</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </>
    );
};
