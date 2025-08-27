import React, { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Users, Loader2 } from 'lucide-react';

interface TeamStatus {
    employeeId: string;
    employeeName: string;
    role: string;
    isConnected: boolean;
    todayHours: number; // en minutes
    avatar?: string;
}

export const TeamPresence = ({ teamStatus, isLoading, liveToggle }: { teamStatus: TeamStatus[], isLoading: boolean, liveToggle?: React.ReactNode }) => {
    const summary = useMemo(() => {
        const total = teamStatus.length;
        const connected = teamStatus.filter(s => s.isConnected).length;
        const avgMinutes = total > 0 ? Math.round(teamStatus.reduce((sum, s) => sum + s.todayHours, 0) / total) : 0;
        const avgHours = total > 0 ? Math.round((avgMinutes / 60) * 10) / 10 : 0;
        return { total, connected, avgHours };
    }, [teamStatus]);

    if (isLoading) {
        return (
            <Card className="lg:col-span-2 p-3">
                <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 py-2 px-1">
                    <div className="min-w-0">
                        <CardTitle className="flex items-center gap-2 text-sm font-semibold truncate">
                            <Users className="h-4 w-4" />
                            <span className="truncate">Présence de l'équipe</span>
                        </CardTitle>
                        <CardDescription className="text-xs text-muted-foreground truncate">Qui est connecté / hors service</CardDescription>
                    </div>
                    {liveToggle && <div className="mt-2 sm:mt-0 sm:ml-3">{liveToggle}</div>}
                </CardHeader>
                <CardContent className="flex items-center justify-center h-36 p-2">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="lg:col-span-2 p-3">
            <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 py-2 px-1">
                <div className="min-w-0">
                    <CardTitle className="flex items-center gap-2 text-sm font-semibold truncate">
                        <Users className="h-4 w-4" />
                        <span className="truncate">Présence de l'équipe</span>
                    </CardTitle>
                    <div className="flex items-center gap-2 flex-wrap mt-1">
                        <span className="text-xs text-muted-foreground">{summary.connected}/{summary.total} connectés</span>
                        <span className="inline-block bg-muted/30 text-xs text-muted-foreground rounded px-2 py-0.5">Moy. {summary.avgHours}h</span>
                    </div>
                </div>
                {liveToggle && <div className="mt-2 sm:mt-0 sm:ml-3">{liveToggle}</div>}
            </CardHeader>

            <CardContent className="p-1">
                <div className="space-y-1">
                    {teamStatus.map((member, idx) => (
                        <div
                            key={member.employeeId}
                            className={`flex items-center justify-between gap-3 py-2 px-2 ${idx < teamStatus.length - 1 ? 'border-b border-border' : ''} hover:bg-muted/50 transition-colors rounded-sm`}
                        >
                            <div className="flex items-center gap-3">
                                <Avatar className="h-8 w-8">
                                    <AvatarImage
                                        src={member.avatar || `https://api.dicebear.com/8.x/initials/svg?seed=${encodeURIComponent(member.employeeName)}`}
                                    />
                                    <AvatarFallback className="text-xs">
                                        {member.employeeName.split(' ').map(n => n[0]).join('').toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="min-w-0">
                                    <div className="text-sm font-medium truncate">{member.employeeName}</div>
                                    <div className="text-xs text-muted-foreground truncate">{member.role}</div>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="flex items-center text-xs text-muted-foreground">
                                    <span className={`inline-block w-2 h-2 rounded-full mr-2 ${member.isConnected ? 'bg-emerald-500' : 'bg-slate-300'}`}></span>
                                    <span className="whitespace-nowrap">{member.isConnected ? 'Connecté' : 'Hors service'}</span>
                                </div>

                                <div className="text-xs font-semibold text-right text-muted-foreground whitespace-nowrap rounded-md px-2 py-0.5 bg-muted">
                                    {Math.round(member.todayHours / 60)}h{member.todayHours % 60 > 0 ? ` ${member.todayHours % 60}m` : ''}
                                </div>
                            </div>
                        </div>
                    ))}

                    {teamStatus.length === 0 && (
                        <div className="text-center text-xs text-muted-foreground py-4">Aucun employé trouvé</div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};