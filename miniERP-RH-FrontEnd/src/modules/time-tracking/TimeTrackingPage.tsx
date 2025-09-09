import React, { useEffect, useState } from "react";
import { useTimeTracking } from "./hooks/useTimeTracking";
import { useTimeTrackingRolePermissions } from "./hooks/useTimeTrackingRolePermissions";
import { TimeHeader } from "./Components/TimeHeader";
import { MessageAlert } from "./Components/MessageAlert";
import { TimeActions } from "./Components/TimeActions";
import { DaySummary } from "./Components/DaySummary";
import { WeekStatsCard } from "./Components/WeekStatsCard";
import { QuickActions } from "./Components/QuickActions";
import EffectivenessChart from "./Components/EffectivenessChart";
import { Switch } from "@/components/ui/switch";
import { TeamPresence } from "./Components/TeamPresence";
import { HoursChart } from "./Components/HoursChart";
import { ProfessionalTimeSheetCalendar } from "./Components/PresenceCalendar";
import { ProjectAndTaskManager } from "./Components/ProjectAndTaskManager";
import { User } from "lucide-react";

interface TeamStatus {
    employeeId: string;
    employeeName: string;
    role: string;
    isConnected: boolean;
    todayHours: number; // en minutes
    avatar?: string;
}

export const TimeTrackingPage: React.FC = () => {
    const { userRole, permissions, hasAnyPermission } = useTimeTrackingRolePermissions();

    const {
        currentTime,
        message,
        location,
        weekStats,
        weekRows,
        totalWorkedTime,
        totalBreakTime,
        effectiveWorkTime,
        formatTimeShort,
        getCurrentTimeString
    } = useTimeTracking();

    const [teamStatus, setTeamStatus] = useState<TeamStatus[]>([]);
    const [realTime, setRealTime] = useState(true);
    const [loadingStatus, setLoadingStatus] = useState({
        teamStatus: true,
        anomalies: true
    });

    // Fonction pour récupérer le statut de l'équipe
    const fetchTeamStatus = async () => {
        try {
            setLoadingStatus(prev => ({ ...prev, teamStatus: true }));

            const userData = localStorage.getItem('userData');
            const managerId = userData ? JSON.parse(userData).id : '';

            const today = new Date().toISOString().slice(0, 10);

            const token = localStorage.getItem('token') || '';
            const headers: Record<string, string> = { 'Accept': 'application/json' };
            if (token) headers['Authorization'] = `Bearer ${token}`;

            const url = `http://localhost:8080/api/pointages/equipe/status/${managerId}?date=${today}`;

            const response = await fetch(url, { headers });
            if (!response.ok) throw new Error('Erreur lors de la récupération du statut');

            const data: TeamStatus[] = await response.json();
            setTeamStatus(data);
        } catch (err) {
            console.error('Erreur team status:', err);
        } finally {
            setLoadingStatus(prev => ({ ...prev, teamStatus: false }));
        }
    };

    // Chargement initial
    useEffect(() => {
        fetchTeamStatus();
    }, []);

    // Actualisation en temps réel
    useEffect(() => {
        if (!realTime) return;

        const interval = setInterval(() => {
            fetchTeamStatus();
        }, 30000); // Actualisation toutes les 30 secondes

        return () => clearInterval(interval);
    }, [realTime]);

    const liveToggle = (
        <div className="flex items-center gap-2">
            <Switch
                checked={realTime}
                onCheckedChange={setRealTime}
                className="data-[state=checked]:bg-blue-600"
            />
            <span className="text-sm font-medium text-slate-700">Temps réel</span>
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50">
            <div className="max-w-7xl mx-auto p-3 sm:p-4 lg:p-5">
                {/* En-tête institutionnel */}
                <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-4 mb-4">
                    <TimeHeader
                        currentTime={currentTime}
                        location={location}
                        getCurrentTimeString={getCurrentTimeString}
                    />
                </div>

                {/* Message si aucun accès */}
                {!hasAnyPermission() && (
                    <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-4 mb-4">
                        <div className="text-center">
                            <p className="text-sm text-slate-600">
                                Votre rôle ({userRole}) ne dispose pas d'autorisations pour le module de pointage.
                            </p>
                        </div>
                    </div>
                )}

                <MessageAlert message={message} />

                {/* Gestion des projets - Visible pour MANAGER et RH */}
                {permissions.canManageProjects && (
                    <ProjectAndTaskManager />
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

                    <div className="space-y-4">
                        {permissions.canViewTeamStats && (
                            <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-4">
                                <HoursChart
                                    teamStatus={teamStatus}
                                    isLoading={loadingStatus.teamStatus}
                                />
                            </div>
                        )}
                    </div>
                    <div className="lg:col-span-2 space-y-4">
                        {permissions.canViewTeamPresence && (
                            <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-4">
                                <div className="flex items-center justify-between mb-3">
                                    <h2 className="text-lg font-semibold text-slate-900">
                                        Présence de l'équipe
                                    </h2>
                                    {liveToggle}
                                </div>
                                <TeamPresence
                                    teamStatus={teamStatus}
                                    isLoading={loadingStatus.teamStatus}
                                    liveToggle={null}
                                />
                            </div>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    <div className="lg:col-span-2 space-y-4">
                        {permissions.canTrackOwnTime && (
                            <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-4">
                                <TimeActions />
                            </div>
                        )}


                        {permissions.canViewOwnStats && (
                            <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-4">
                                <h2 className="text-lg font-semibold text-slate-900 mb-3">
                                    Statistiques hebdomadaires
                                </h2>
                                <WeekStatsCard weekStats={weekStats} weekRows={weekRows} />
                            </div>
                        )}

                    </div>



                    <div className="space-y-4">
                        {permissions.canViewOwnStats && (
                            <DaySummary
                                totalWorkedTime={totalWorkedTime}
                                totalBreakTime={totalBreakTime}
                                effectiveWorkTime={effectiveWorkTime}
                                formatTimeShort={formatTimeShort}
                            />
                        )}

                        {(permissions.canViewOwnStats || permissions.canViewAnalytics) && (
                            <EffectivenessChart />
                        )}

                        {permissions.canTrackOwnTime && (
                            <QuickActions />
                        )}
                    </div>
                    {permissions.canViewOwnStats && (
                        <div className="lg:col-span-3 bg-white border border-slate-200 rounded-lg shadow-sm p-4">
                            <h2 className="text-lg font-semibold text-slate-900 mb-3">
                                Calendrier de présence
                            </h2>
                            <ProfessionalTimeSheetCalendar />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};