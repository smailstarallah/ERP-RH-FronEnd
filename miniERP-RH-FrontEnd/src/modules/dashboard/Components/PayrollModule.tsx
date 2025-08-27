import React from 'react';
import KPICard from './KPICard';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { PieChart, Pie, Cell, ResponsiveContainer, AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip, BarChart, Bar } from 'recharts';
import { DollarSign, TrendingUp, CheckCircle, Users } from 'lucide-react';

const salaryData = [
    { category: 'Salaire brut', montant: 180000, pourcentage: 60 },
    { category: 'Charges sociales', montant: 72000, pourcentage: 24 },
    { category: 'Avantages', montant: 24000, pourcentage: 8 },
    { category: 'Prime', montant: 24000, pourcentage: 8 }
];

const salaryEvolutionData = [
    { month: 'Jan', masseSalariale: 295000, budget: 300000 },
    { month: 'Fév', masseSalariale: 298000, budget: 305000 },
    { month: 'Mar', masseSalariale: 302000, budget: 310000 },
    { month: 'Avr', masseSalariale: 305000, budget: 315000 },
    { month: 'Mai', masseSalariale: 308000, budget: 320000 },
    { month: 'Juin', masseSalariale: 312000, budget: 325000 }
];

const salaryDistributionData = [
    { range: '2000-3000', cadres: 2, employes: 8, techniciens: 5 },
    { range: '3000-4000', cadres: 5, employes: 12, techniciens: 8 },
    { range: '4000-5000', cadres: 8, employes: 6, techniciens: 3 },
    { range: '5000-6000', cadres: 6, employes: 2, techniciens: 1 },
    { range: '6000+', cadres: 4, employes: 0, techniciens: 0 }
];

const COLORS = ['#3B82F6', '#10B981', '#EF4444', '#F59E0B', '#8B5CF6'];

const PayrollModule: React.FC = () => {
    return (
        <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <KPICard title="Masse salariale" value="312" unit="k€" change={1.3} icon={DollarSign} status="neutral" />
                <KPICard title="% du CA" value="28.5" unit="%" change={-0.8} icon={TrendingUp} status="success" />
                <KPICard title="Taux d'erreur paie" value="0.8" unit="%" change={-40} icon={CheckCircle} status="success" />
                <KPICard title="Coût/bulletin" value="12.50" unit="€" change={-5} icon={Users} status="success" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Structure des Coûts</CardTitle>
                        <CardDescription>Répartition de la masse salariale</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie data={salaryData} cx="50%" cy="50%" innerRadius={40} outerRadius={80} paddingAngle={5} dataKey="montant" label={({ category, pourcentage }) => `${category} ${pourcentage}%`}>
                                    {salaryData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(value: number) => `${value.toLocaleString()}€`} />
                            </PieChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Évolution Masse Salariale</CardTitle>
                        <CardDescription>Suivi mensuel vs budget</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <AreaChart data={salaryEvolutionData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="month" />
                                <YAxis />
                                <Tooltip formatter={(value: number) => `${value.toLocaleString()}€`} />
                                <Area type="monotone" dataKey="budget" stroke="#94A3B8" fill="#94A3B8" fillOpacity={0.3} name="Budget" />
                                <Area type="monotone" dataKey="masseSalariale" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.6} name="Réel" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Distribution Salariale</CardTitle>
                        <CardDescription>Analyse par catégorie et tranche</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={salaryDistributionData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="range" />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="cadres" stackId="a" fill="#3B82F6" name="Cadres" />
                                <Bar dataKey="employes" stackId="a" fill="#10B981" name="Employés" />
                                <Bar dataKey="techniciens" stackId="a" fill="#F59E0B" name="Techniciens" />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Performance & Qualité</CardTitle>
                        <CardDescription>Indicateurs de pilotage RH</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-sm font-medium">Index égalité F/H</span>
                                <span className="text-sm font-bold text-green-600">94/100</span>
                            </div>
                            <Progress value={94} className="h-2" />
                            <p className="text-xs text-gray-600 mt-1">Objectif légal: 75/100 - Excellent niveau</p>
                        </div>
                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-sm font-medium">Budget augmentations</span>
                                <span className="text-sm text-gray-600">82% consommé</span>
                            </div>
                            <Progress value={82} className="h-2" />
                            <p className="text-xs text-gray-600 mt-1">Reste 18k€ sur 100k€ alloués</p>
                        </div>
                        <Alert>
                            <CheckCircle className="h-4 w-4" />
                            <AlertDescription>
                                <strong>Qualité paie:</strong> 0.8% d'erreur ce mois (-40% vs objectif)
                            </AlertDescription>
                        </Alert>
                    </CardContent>
                </Card>
            </div>
        </>
    );
};

export default PayrollModule;
