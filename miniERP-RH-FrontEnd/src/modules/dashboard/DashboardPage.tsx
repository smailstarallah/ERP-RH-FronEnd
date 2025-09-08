import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CalendarDays, Clock, DollarSign } from 'lucide-react';

import LeavesModule from './Components/LeavesModule';
import TimeModule from './Components/TimeModule';
import PayrollModule from './Components/PayrollModule';

const DashboardPage = () => {
    const [activeTab, setActiveTab] = useState('leaves');

    return (
        <div className="min-h-screen bg-slate-50">
            <div className="max-w-7xl mx-auto p-4">
                {/* En-tête institutionnel compact */}
                <div className="mb-4">
                    <div className="flex items-center gap-2 mb-1">
                        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                            <CalendarDays className="w-5 h-5 text-white" />
                        </div>
                        <h1 className="text-xl font-semibold text-slate-900">Tableau de Bord RH</h1>
                    </div>
                    <p className="text-slate-600 text-sm">Analyse prédictive et stratégique des ressources humaines</p>
                </div>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-3">
                    <TabsList className="grid w-full grid-cols-3 bg-white border border-slate-200 rounded-lg p-0.5 shadow-sm h-10">
                        <TabsTrigger
                            value="leaves"
                            className="flex items-center gap-2 text-slate-700 data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-sm rounded-md transition-all duration-200 h-8"
                        >
                            <CalendarDays className="h-4 w-4" />
                            <span className="text-sm font-medium">Congés</span>
                        </TabsTrigger>
                        <TabsTrigger
                            value="time"
                            className="flex items-center gap-2 text-slate-700 data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-sm rounded-md transition-all duration-200 h-8"
                        >
                            <Clock className="h-4 w-4" />
                            <span className="text-sm font-medium">Présence</span>
                        </TabsTrigger>
                        <TabsTrigger
                            value="payroll"
                            className="flex items-center gap-2 text-slate-700 data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-sm rounded-md transition-all duration-200 h-8"
                        >
                            <DollarSign className="h-4 w-4" />
                            <span className="text-sm font-medium">Paie</span>
                        </TabsTrigger>
                    </TabsList>

                    {/* Contenu des onglets */}
                    <TabsContent value="leaves" className="space-y-3 mt-3">
                        <LeavesModule />
                    </TabsContent>

                    <TabsContent value="time" className="space-y-3 mt-3">
                        <TimeModule />
                    </TabsContent>

                    <TabsContent value="payroll" className="space-y-3 mt-3">
                        <PayrollModule />
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
};

export default DashboardPage;