import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

type KPICardProps = {
    title: string;
    value: string | number;
    unit: string;
    change?: number;
    icon: React.ComponentType<{ className?: string }>;
    status?: 'neutral' | 'success' | 'warning' | 'danger';
};

const KPICard: React.FC<KPICardProps> = ({ title, value, unit, change, icon: Icon, status = 'neutral' }) => (
    <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-6">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-600">{title}</p>
                    <p className="text-2xl font-bold">{value}{unit}</p>
                    {change !== undefined && (
                        <p className={`text-sm ${change > 0 ? 'text-red-600' : 'text-green-600'}`}>
                            {change > 0 ? '+' : ''}{change}% vs mois précédent
                        </p>
                    )}
                </div>
                <div className={`p-3 rounded-full ${status === 'warning' ? 'bg-yellow-100' :
                    status === 'danger' ? 'bg-red-100' :
                        status === 'success' ? 'bg-green-100' : 'bg-blue-100'
                    }`}>
                    {React.createElement(Icon, {
                        className: `h-6 w-6 ${status === 'warning' ? 'text-yellow-600' :
                            status === 'danger' ? 'text-red-600' :
                                status === 'success' ? 'text-green-600' : 'text-blue-600'
                            }`
                    })}
                </div>
            </div>
        </CardContent>
    </Card>
);

export default KPICard;
