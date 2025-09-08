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

const KPICard: React.FC<KPICardProps> = ({ title, value, unit, change, icon: Icon, status = 'neutral' }) => {
    const formatValue = (val: string | number): string => {
        if (typeof val === 'number') {
            return (Math.round(val * 100) / 100).toString();
        }
        return val;
    };

    const formatChange = (changeValue: number): string => {
        if (changeValue === 0) return '0';
        return changeValue > 0 ? `+${changeValue}` : `${changeValue}`;
    };

    return (
        <Card className="bg-white border border-slate-200 shadow-sm hover:shadow-md transition-shadow duration-200 rounded-lg">
            <CardContent className="p-4 sm:p-5">
                <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-600 mb-1">{title}</p>
                        <p className="text-xl sm:text-2xl font-semibold text-slate-900 mb-1">
                            {formatValue(value)}{unit}
                        </p>
                        {change !== undefined && (
                            <p className={`text-xs font-medium ${change > 0 ? 'text-red-600' :
                                    change < 0 ? 'text-green-600' :
                                        'text-slate-500'
                                }`}>
                                {formatChange(change)}% vs mois précédent
                            </p>
                        )}
                    </div>
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${status === 'warning' ? 'bg-yellow-100' :
                            status === 'danger' ? 'bg-red-100' :
                                status === 'success' ? 'bg-green-100' : 'bg-blue-100'
                        }`}>
                        {React.createElement(Icon, {
                            className: `w-6 h-6 ${status === 'warning' ? 'text-yellow-600' :
                                    status === 'danger' ? 'text-red-600' :
                                        status === 'success' ? 'text-green-600' : 'text-blue-600'
                                }`
                        })}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default KPICard;
