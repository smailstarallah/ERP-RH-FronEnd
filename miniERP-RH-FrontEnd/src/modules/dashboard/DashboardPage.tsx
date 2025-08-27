import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CalendarDays, Clock, DollarSign } from 'lucide-react';

import LeavesModule from './Components/LeavesModule';
import TimeModule from './Components/TimeModule';
import PayrollModule from './Components/PayrollModule';

const DashboardPage = () => {
    const [activeTab, setActiveTab] = useState('leaves');

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Tableau de Bord RH</h1>
                    <p className="text-gray-600 mt-2">Analyse prédictive et stratégique des ressources humaines</p>
                </div>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="leaves" className="flex items-center gap-2">
                            <CalendarDays className="h-4 w-4" />
                            Congés & Absences
                        </TabsTrigger>
                        <TabsTrigger value="time" className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            Time Tracking
                        </TabsTrigger>
                        <TabsTrigger value="payroll" className="flex items-center gap-2">
                            <DollarSign className="h-4 w-4" />
                            Fiches de Paie
                        </TabsTrigger>
                    </TabsList>

                    {/* Onglet Congés et Absences */}
                    <TabsContent value="leaves" className="space-y-6">
                        <LeavesModule />
                    </TabsContent>

                    {/* Onglet Time Tracking */}
                    <TabsContent value="time" className="space-y-6">
                        {/* <TimeModule /> */}
                    </TabsContent>

                    {/* Onglet Fiches de Paie */}
                    <TabsContent value="payroll" className="space-y-6">
                        {/* <PayrollModule /> */}
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
};

export default DashboardPage;