import React from 'react';
import KPICard from './KPICard';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert } from '@/components/ui/alert';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ScatterChart, Scatter } from 'recharts';
import { Clock, TrendingUp, CheckCircle, AlertTriangle } from 'lucide-react';

const timeTrackingData = [
    { employee: 'Alice M.', heuresStandard: 35, heuresSupp: 8, projet: 'A', productivite: 85 },
    { employee: 'Bob L.', heuresStandard: 35, heuresSupp: 12, projet: 'B', productivite: 92 },
    { employee: 'Claire D.', heuresStandard: 35, heuresSupp: 15, projet: 'A', productivite: 78 },
    { employee: 'David R.', heuresStandard: 35, heuresSupp: 5, projet: 'C', productivite: 88 },
    { employee: 'Emma T.', heuresStandard: 35, heuresSupp: 18, projet: 'B', productivite: 95 }
];

const projectTimeData = [
    { project: 'Projet A', heures: 180, budget: 200 },
    { project: 'Projet B', heures: 145, budget: 160 },
    { project: 'Projet C', heures: 90, budget: 100 },
    { project: 'Formation', heures: 65, budget: 80 },
    { project: 'Support', heures: 120, budget: 120 }
];

const TimeModule: React.FC = () => {
    return (
        <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <KPICard title="Taux d'utilisation" value="78" unit="%" change={3} icon={Clock} status="success" />
                <KPICard title="Heures supplémentaires" value="12" unit="%" change={-2} icon={TrendingUp} status="success" />
                <KPICard title="Productivité moyenne" value="87" unit="%" change={4} icon={CheckCircle} status="success" />
                <KPICard title="Surcharge équipes" value="2" unit=" équipes" change={0} icon={AlertTriangle} status="warning" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Charge de Travail</CardTitle>
                        <CardDescription>Répartition heures normales vs supplémentaires</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={timeTrackingData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="employee" />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="heuresStandard" stackId="a" fill="#3B82F6" name="Heures standard" />
                                <Bar dataKey="heuresSupp" stackId="a" fill="#EF4444" name="Heures supp." />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Productivité vs Surcharge</CardTitle>
                        <CardDescription>Corrélation heures supplémentaires et performance</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <ScatterChart data={timeTrackingData}>
                                <CartesianGrid />
                                <XAxis dataKey="heuresSupp" name="Heures supp." />
                                <YAxis dataKey="productivite" name="Productivité" />
                                <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                                <Scatter fill="#3B82F6" />
                            </ScatterChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Suivi Projets</CardTitle>
                        <CardDescription>Heures consommées vs budget alloué</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={projectTimeData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="project" />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="heures" fill="#10B981" name="Heures réelles" />
                                <Bar dataKey="budget" fill="#94A3B8" name="Budget" fillOpacity={0.3} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Conformité & Alertes</CardTitle>
                        <CardDescription>Respect du droit à la déconnexion</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-sm font-medium">Heures supp. équipe B</span>
                                <Badge variant="destructive">Critique</Badge>
                            </div>
                            <p className="text-xs text-gray-600">15h/semaine en moyenne depuis 3 semaines</p>
                        </div>
                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-sm font-medium">Télétravail - Déconnexion</span>
                                <Badge variant="outline">À surveiller</Badge>
                            </div>
                            <p className="text-xs text-gray-600">5 employés connectés après 20h régulièrement</p>
                        </div>
                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-sm font-medium">Projet A - Budget</span>
                                <Badge className="bg-green-100 text-green-800">Conforme</Badge>
                            </div>
                            <p className="text-xs text-gray-600">90% du budget consommé, livraison prévue</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </>
    );
};

export default TimeModule;
