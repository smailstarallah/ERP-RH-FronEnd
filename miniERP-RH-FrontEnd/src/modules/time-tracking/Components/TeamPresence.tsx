import React, { useMemo, useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Users, Loader2, AlertTriangle, Filter, ChevronDown, MessageCircle, Phone } from 'lucide-react';

interface TeamStatus {
    employeeId: string;
    employeeName: string;
    role: string;
    isConnected: boolean;
    todayHours: number; // en minutes
    avatar?: string;
    // Nouvelles données RH stratégiques
    lastActivity?: Date;
    performance?: 'excellent' | 'bon' | 'moyen' | 'faible';
    weeklyHours?: number; // heures de la semaine
    targetHours?: number; // objectif hebdomadaire
    lateArrivalCount?: number; // retards cette semaine
    overTimeHours?: number; // heures supplémentaires
    department?: string;
    manager?: string;
    urgentTasks?: number;
    availabilityStatus?: 'disponible' | 'occupe' | 'reunion' | 'pause' | 'indisponible';
}

export const TeamPresence = ({ teamStatus, isLoading, liveToggle }: { teamStatus: TeamStatus[], isLoading: boolean, liveToggle?: React.ReactNode }) => {
    const [sortBy, setSortBy] = useState<'name' | 'hours' | 'performance' | 'status'>('name');
    const [filterBy, setFilterBy] = useState<'all' | 'connected' | 'issues'>('all');
    const [showDetails, setShowDetails] = useState(false);

    // Métriques RH avancées
    const analytics = useMemo(() => {
        const total = teamStatus.length;
        const connected = teamStatus.filter(s => s.isConnected).length;
        const avgMinutes = total > 0 ? Math.round(teamStatus.reduce((sum, s) => sum + s.todayHours, 0) / total) : 0;
        const avgHours = total > 0 ? Math.round((avgMinutes / 60) * 10) / 10 : 0;

        // Nouvelles métriques stratégiques
        const performanceIssues = teamStatus.filter(s => s.performance === 'faible' || (s.lateArrivalCount && s.lateArrivalCount > 2)).length;
        const overWorked = teamStatus.filter(s => s.overTimeHours && s.overTimeHours > 10).length;
        const urgentTasks = teamStatus.reduce((sum, s) => sum + (s.urgentTasks || 0), 0);
        const weeklyProgress = total > 0 ? Math.round(teamStatus.reduce((sum, s) => {
            const target = s.targetHours || 40;
            const current = (s.weeklyHours || 0) / 60;
            return sum + (current / target * 100);
        }, 0) / total) : 0;

        return {
            total, connected, avgHours, performanceIssues, overWorked,
            urgentTasks, weeklyProgress
        };
    }, [teamStatus]);

    // Tri et filtrage intelligent
    const filteredAndSortedTeam = useMemo(() => {
        let filtered = teamStatus;

        // Filtrage
        switch (filterBy) {
            case 'connected':
                filtered = teamStatus.filter(s => s.isConnected);
                break;
            case 'issues':
                filtered = teamStatus.filter(s =>
                    s.performance === 'faible' ||
                    (s.lateArrivalCount && s.lateArrivalCount > 2) ||
                    (s.overTimeHours && s.overTimeHours > 10)
                );
                break;
        }

        // Tri
        return filtered.sort((a, b) => {
            switch (sortBy) {
                case 'hours':
                    return (b.todayHours || 0) - (a.todayHours || 0);
                case 'performance':
                    const perfOrder = { 'excellent': 4, 'bon': 3, 'moyen': 2, 'faible': 1 };
                    return (perfOrder[b.performance || 'moyen'] || 2) - (perfOrder[a.performance || 'moyen'] || 2);
                case 'status':
                    if (a.isConnected !== b.isConnected) return b.isConnected ? 1 : -1;
                    return a.employeeName.localeCompare(b.employeeName);
                default:
                    return a.employeeName.localeCompare(b.employeeName);
            }
        });
    }, [teamStatus, sortBy, filterBy]);

    if (isLoading) {
        return (
            <div className="lg:col-span-2 bg-white border border-slate-200 rounded-lg shadow-sm">
                <div className="p-3 sm:p-4 border-b border-slate-200">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                        <div className="min-w-0">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                                    <Users className="h-4 w-4 text-white" />
                                </div>
                                <h3 className="text-base sm:text-lg font-semibold text-slate-900 truncate">Présence de l'équipe</h3>
                            </div>
                            <p className="text-sm text-slate-600 mt-1 truncate">Qui est connecté / hors service</p>
                        </div>
                        {liveToggle && <div className="mt-2 sm:mt-0 sm:ml-3">{liveToggle}</div>}
                    </div>
                </div>
                <div className="flex items-center justify-center h-36 p-4">
                    <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
                </div>
            </div>
        );
    }

    return (
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-lg shadow-sm">
            <div className="p-3 sm:p-4 border-b border-slate-200">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                    <div className="min-w-0">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                                <Users className="h-4 w-4 text-white" />
                            </div>
                            <h3 className="text-base sm:text-lg font-semibold text-slate-900 truncate">Présence de l'équipe</h3>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap mt-1 sm:mt-2">
                            <span className="text-sm text-slate-600">{analytics.connected}/{analytics.total} connectés</span>
                            <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200 rounded">
                                Moy. {analytics.avgHours}h
                            </span>
                            {analytics.performanceIssues > 0 && (
                                <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-red-100 text-red-800 border border-red-200 rounded">
                                    <AlertTriangle className="w-3 h-3 mr-1" />
                                    {analytics.performanceIssues} alertes
                                </span>
                            )}
                        </div>
                    </div>
                    <div className="flex items-center gap-2 mt-2 sm:mt-0 sm:ml-3">
                        {/* Contrôles de tri et filtrage */}
                        <div className="flex items-center gap-1">
                            <button
                                onClick={() => setShowDetails(!showDetails)}
                                className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded transition-colors"
                            >
                                <Filter className="w-3 h-3" />
                                Filtres
                                <ChevronDown className={`w-3 h-3 transition-transform ${showDetails ? 'rotate-180' : ''}`} />
                            </button>

                            <select
                                aria-label="Filtrer par statut de connexion"
                                value={filterBy}
                                onChange={(e) => setFilterBy(e.target.value as any)}
                                className="text-xs border border-slate-300 rounded px-2 py-1 bg-white text-slate-700"
                            >
                                <option value="all">Tous</option>
                                <option value="connected">Connectés</option>
                                <option value="issues">Alertes</option>
                            </select>

                            <select
                                aria-label="Trier par"
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value as any)}
                                className="text-xs border border-slate-300 rounded px-2 py-1 bg-white text-slate-700"
                            >
                                <option value="name">Nom</option>
                                <option value="hours">Heures</option>
                                <option value="performance">Performance</option>
                                <option value="status">Statut</option>
                            </select>
                        </div>
                        {liveToggle}
                    </div>
                </div>
            </div>

            <div className="p-3 sm:p-4">
                {/* Panneau de détails des métriques */}
                {showDetails && (
                    <div className="mb-4 p-3 bg-slate-50 border border-slate-200 rounded-lg">
                        <div className="grid grid-cols-3 gap-4 text-center">
                            <div>
                                <div className="text-lg font-semibold text-slate-900">{analytics.weeklyProgress}%</div>
                                <div className="text-xs text-slate-600">Progression hebdo</div>
                            </div>
                            <div>
                                <div className="text-lg font-semibold text-orange-600">{analytics.urgentTasks}</div>
                                <div className="text-xs text-slate-600">Tâches urgentes</div>
                            </div>
                            <div>
                                <div className="text-lg font-semibold text-purple-600">{analytics.overWorked}</div>
                                <div className="text-xs text-slate-600">Heures sup +10h</div>
                            </div>
                        </div>
                    </div>
                )}

                <div className="space-y-1 sm:space-y-2">
                    {filteredAndSortedTeam.map((member, idx) => {
                        // Fonctions utilitaires pour les indicateurs
                        const getPerformanceColor = (perf?: string) => {
                            switch (perf) {
                                case 'excellent': return 'text-green-600 bg-green-100';
                                case 'bon': return 'text-blue-600 bg-blue-100';
                                case 'moyen': return 'text-yellow-600 bg-yellow-100';
                                case 'faible': return 'text-red-600 bg-red-100';
                                default: return 'text-slate-600 bg-slate-100';
                            }
                        };


                        const hasIssues = member.performance === 'faible' ||
                            (member.lateArrivalCount && member.lateArrivalCount > 2) ||
                            (member.overTimeHours && member.overTimeHours > 10);

                        return (
                            <div
                                key={member.employeeId}
                                className={`flex items-center justify-between gap-2 sm:gap-3 py-3 px-3 ${idx < filteredAndSortedTeam.length - 1 ? 'border-b border-slate-200' : ''} hover:bg-slate-50 transition-colors duration-200 rounded-lg ${hasIssues ? 'border-l-4 border-l-red-400' : ''}`}
                            >
                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                    <div className="relative">
                                        <Avatar className="h-10 w-10 border border-slate-200">
                                            <AvatarImage
                                                src={member.avatar || `https://api.dicebear.com/8.x/initials/svg?seed=${encodeURIComponent(member.employeeName)}`}
                                            />
                                            <AvatarFallback className="text-xs bg-slate-100 text-slate-700">
                                                {member.employeeName.split(' ').map(n => n[0]).join('').toUpperCase()}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${member.isConnected ? 'bg-blue-600' : 'bg-slate-400'}`}></div>
                                        {member.urgentTasks && member.urgentTasks > 0 && (
                                            <div className="absolute -top-1 -left-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                                                !
                                            </div>
                                        )}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center gap-2">
                                            <div className="text-sm font-medium text-slate-900 truncate">{member.employeeName}</div>
                                            {member.performance && (
                                                <span className={`px-1.5 py-0.5 text-xs font-medium rounded ${getPerformanceColor(member.performance)}`}>
                                                    {member.performance.charAt(0).toUpperCase()}
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="text-xs text-slate-600 truncate">{member.role}</div>
                                            {member.lateArrivalCount && member.lateArrivalCount > 0 && (
                                                <span className="text-xs text-red-600 font-medium">
                                                    {member.lateArrivalCount} retards
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    {/* Statut de disponibilité */}
                                    <div className="text-xs text-slate-600">
                                        <span className="whitespace-nowrap">
                                            {member.availabilityStatus === 'reunion' ? '📅 Réunion' :
                                                member.availabilityStatus === 'pause' ? '☕ Pause' :
                                                    member.availabilityStatus === 'occupe' ? '⚡ Occupé' :
                                                        member.availabilityStatus === 'indisponible' ? '🚫 Absent' :
                                                            member.isConnected ? '🟢 Dispo' : '⚪ Hors service'}
                                        </span>
                                    </div>

                                    {/* Temps de travail avec indicateur de progression */}
                                    <div className="text-center">
                                        <div className="text-xs font-medium text-slate-900 whitespace-nowrap">
                                            {Math.round(member.todayHours / 60)}h{member.todayHours % 60 > 0 ? ` ${member.todayHours % 60}m` : ''}
                                        </div>
                                        {member.targetHours && (
                                            <div className="w-12 h-1 bg-slate-200 rounded-full mt-1">
                                                <div
                                                    className="h-1 bg-blue-600 rounded-full transition-all"
                                                    style={{ width: `${Math.min(100, (member.todayHours / 60) / (member.targetHours / 5) * 100)}%` }}
                                                ></div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Actions rapides */}
                                    <div className="flex items-center gap-1">
                                        {member.isConnected && (
                                            <>
                                                <button
                                                    className="w-6 h-6 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors flex items-center justify-center"
                                                    title="Envoyer un message"
                                                >
                                                    <MessageCircle className="w-3 h-3" />
                                                </button>
                                                <button
                                                    className="w-6 h-6 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded transition-colors flex items-center justify-center"
                                                    title="Appeler"
                                                >
                                                    <Phone className="w-3 h-3" />
                                                </button>
                                            </>
                                        )}
                                        {hasIssues && (
                                            <button
                                                className="w-6 h-6 text-red-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors flex items-center justify-center"
                                                title="Voir les alertes"
                                            >
                                                <AlertTriangle className="w-3 h-3" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}

                    {filteredAndSortedTeam.length === 0 && teamStatus.length > 0 && (
                        <div className="text-center py-6">
                            <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center mx-auto">
                                <Filter className="h-5 w-5 text-slate-400" />
                            </div>
                            <p className="text-sm text-slate-500 mt-2">Aucun résultat pour ce filtre</p>
                            <button
                                onClick={() => setFilterBy('all')}
                                className="text-xs text-blue-600 hover:text-blue-700 mt-1"
                            >
                                Afficher tous les employés
                            </button>
                        </div>
                    )}

                    {teamStatus.length === 0 && (
                        <div className="text-center py-6">
                            <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center mx-auto">
                                <Users className="h-5 w-5 text-slate-400" />
                            </div>
                            <p className="text-sm text-slate-500 mt-2">Aucun employé trouvé</p>
                        </div>
                    )}
                </div>

                {/* Résumé de performance pour managers */}
                {teamStatus.length > 0 && (
                    <div className="mt-4 pt-3 border-t border-slate-200">
                        <div className="flex items-center justify-between text-xs text-slate-600">
                            <span>
                                🎯 Objectif hebdo : {analytics.weeklyProgress}% |
                                ⚠️ {analytics.performanceIssues} alertes |
                                ⏰ {analytics.overWorked} heures sup +10h
                            </span>
                            <span className="font-medium">
                                Total équipe : {Math.round(teamStatus.reduce((sum, m) => sum + m.todayHours, 0) / 60)}h
                            </span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};