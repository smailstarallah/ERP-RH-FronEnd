import React from "react";
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

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4">
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

                        <TimeActions
                            isWorking={isWorking}
                            isOnBreak={isOnBreak}
                            loading={loading}
                            onCheckIn={handleCheckIn}
                            onCheckOut={handleCheckOut}
                            onBreakStart={handleBreakStart}
                            onBreakEnd={handleBreakEnd}
                        />

                        <TodayHistory todayEntries={todayEntries} />
                    </div>

                    {/* Sidebar - Statistiques */}
                    <div className="space-y-6">

                        <DaySummary
                            totalWorkedTime={totalWorkedTime}
                            totalBreakTime={totalBreakTime}
                            effectiveWorkTime={effectiveWorkTime}
                            formatTimeShort={formatTimeShort}
                        />

                        <WeekStatsCard weekStats={weekStats} />

                        <QuickActions />
                    </div>
                </div>
            </div>
            <ManagerDashboard />
        </div>
    );
};