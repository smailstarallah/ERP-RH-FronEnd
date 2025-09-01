import React, { useEffect, useState } from "react";
import { useTimeTracking } from "./hooks/useTimeTracking";
import { TimeHeader } from "./Components/TimeHeader";
import { MessageAlert } from "./Components/MessageAlert";
import { CurrentStatus } from "./Components/CurrentStatus";
import { TimeActions } from "./Components/TimeActions";
import { TodayHistory } from "./Components/TodayHistory";
import { DaySummary } from "./Components/DaySummary";
import { WeekStatsCard } from "./Components/WeekStatsCard";
import { QuickActions } from "./Components/QuickActions";
import ManagerDashboard from "./ManagerDashboard";
import EffectivenessChart from "./Components/EffectivenessChart";
import { Switch } from "@/components/ui/switch";
import { TeamPresence } from "./Components/TeamPresence";
import { HoursChart } from "./Components/HoursChart";
import { ProfessionalTimeSheetCalendar } from "./Components/PresenceCalendar";
import { ProjectAndTaskManager } from "./Components/ProjectAndTaskManager";
import { KpiAndStatistics } from "./Components/KpiAndStatistics";

interface TeamStatus {
    employeeId: string;
    employeeName: string;
    role: string;
    isConnected: boolean;
    todayHours: number; // en minutes
    avatar?: string;
}

export const TimeTrackingPage: React.FC = () => {
    const {
        currentTime,
        isWorking,
        isOnBreak,
        loading,
        message,
        location,
        todayEntries,
        weekStats,
        weekRows,
        currentSession,
        totalWorkedTime,
        totalBreakTime,
        effectiveWorkTime,
        formatTime,
        formatTimeShort,
        getCurrentTimeString,
        handleCheckIn,
        handleCheckOut,
        handleBreakStart,
        handleBreakEnd
    } = useTimeTracking();

    const [teamStatus, setTeamStatus] = useState<TeamStatus[]>([]);
    const [realTime, setRealTime] = useState(true);
    const [loadingStatus, setLoadingStatus] = useState({
        teamStatus: true,
        anomalies: true
    });
    const [error, setError] = useState<string | null>(null);

    // Temporary mock data for projects, isLoading, and api
    // Replace with real data and logic as needed
    const [projects, setProjects] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const api = {};

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
            setError(null);
        } catch (err) {
            console.error('Erreur team status:', err);
            setError('Impossible de charger le statut de l\'équipe');
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
        <div className="flex items-center gap-2 text-sm">
            <Switch
                checked={realTime}
                onCheckedChange={setRealTime}
            />
            <span>Temps réel</span>
        </div>
    );


    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4">
            <ProfessionalTimeSheetCalendar />
            <div className="max-w-6xl mx-auto space-y-6">

                <TimeHeader
                    currentTime={currentTime}
                    location={location}
                    getCurrentTimeString={getCurrentTimeString}
                />

                <MessageAlert message={message} />

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Section principale - Actions de pointage */}
                    <div className="lg:col-span-2 space-y-6">

                        <CurrentStatus
                            isWorking={isWorking}
                            isOnBreak={isOnBreak}
                            formatTime={formatTime}
                            currentSessionDuration={currentSession.duration}
                            totalBreakTime={totalBreakTime}
                        />

                        <TimeActions />

                        <KpiAndStatistics />

                        <ProjectAndTaskManager />

                        {/* <PresenceCalendar /> */}


                        <WeekStatsCard weekStats={weekStats} weekRows={weekRows} />
                        <TodayHistory todayEntries={todayEntries} />
                        <TeamPresence teamStatus={teamStatus} isLoading={loadingStatus.teamStatus} liveToggle={liveToggle} />
                    </div>

                    {/* Sidebar - Statistiques */}
                    <div className="space-y-6">

                        <DaySummary
                            totalWorkedTime={totalWorkedTime}
                            totalBreakTime={totalBreakTime}
                            effectiveWorkTime={effectiveWorkTime}
                            formatTimeShort={formatTimeShort}
                        />

                        <EffectivenessChart />

                        <HoursChart teamStatus={teamStatus} isLoading={loadingStatus.teamStatus} />

                        <QuickActions />
                    </div>
                </div>
            </div>
            {/* <ManagerDashboard /> */}
        </div>
    );
};