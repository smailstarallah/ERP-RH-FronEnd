import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Calendar, Clock, AlertCircle, TrendingUp, Users, CheckCircle, Target, Eye, Filter, Activity, BarChart3, MessageSquare, ChevronRight } from "lucide-react"
import { useState } from "react"
// recharts

export default function ManagerDashboard() {
    const [showDetails, setShowDetails] = useState(false)

    // Données pointages
    const pointages = [
        { name: "Ali Benali", arrivee: "08:55", depart: "17:10", status: "present", heuresEffectives: "8h15", performance: 95, tendance: "stable" },
        { name: "Sara Alami", arrivee: "09:05", depart: "17:00", status: "retard", heuresEffectives: "7h55", performance: 78, tendance: "baisse" },
        { name: "Youssef Tazi", arrivee: "08:45", depart: "17:30", status: "present", heuresEffectives: "8h45", performance: 102, tendance: "hausse" },
        { name: "Fatima Idrissi", arrivee: "09:00", depart: "17:15", status: "present", heuresEffectives: "8h15", performance: 98, tendance: "stable" }
    ]

    // Données absences
    const absences = [
        { name: "Omar Hakim", date: "2025-08-10", type: "Congé payé", duree: "1 jour", statut: "approuve" },
        { name: "Lina Fassi", date: "2025-08-09", type: "Maladie", duree: "2 jours", statut: "justifie" },
        { name: "Karim Nejjar", date: "2025-08-08", type: "Formation", duree: "3 jours", statut: "planifie" }
    ]

    // Données pour graphiques simples
    const performanceData = [
        { jour: "Lun", presence: 95, ponctualite: 88 },
        { jour: "Mar", presence: 92, ponctualite: 85 },
        { jour: "Mer", presence: 98, ponctualite: 90 },
        { jour: "Jeu", presence: 85, ponctualite: 82 },
        { jour: "Ven", presence: 90, ponctualite: 87 }
    ]

    const absenceTypes = [
        { name: "Congés", value: 45, percentage: 45 },
        { name: "Maladie", value: 25, percentage: 25 },
        { name: "Formation", value: 20, percentage: 20 },
        { name: "Autres", value: 10, percentage: 10 }
    ]

    // Fonctions utilitaires
    const getStatusBadge = (status) => {
        const variants = {
            present: { variant: "default", text: "Présent" },
            retard: { variant: "secondary", text: "Retard" },
            absent: { variant: "destructive", text: "Absent" }
        }
        return variants[status] || variants.present
    }

    const getTendanceIcon = (tendance) => {
        if (tendance === "hausse") return <TrendingUp className="h-3 w-3 text-green-600" />
        if (tendance === "baisse") return <TrendingUp className="h-3 w-3 text-red-600 rotate-180" />
        return <Activity className="h-3 w-3 text-gray-500" />
    }

    const getAbsenceStatusBadge = (statut) => {
        const variants = {
            approuve: "default",
            justifie: "secondary",
            planifie: "outline"
        }
        return variants[statut] || "outline"
    }

    // Statistiques
    const stats = {
        totalEmployes: pointages.length,
        presentsAujourdhui: pointages.filter(p => p.status === "present").length,
        tauxPresence: Math.round((pointages.filter(p => p.status === "present").length / pointages.length) * 100),
        moyennePerformance: Math.round(pointages.reduce((acc, p) => acc + p.performance, 0) / pointages.length)
    }

    // Simple Bar Chart Component
    const SimpleBarChart = ({ data }) => {
        const maxValue = Math.max(...data.map(d => Math.max(d.presence, d.ponctualite)))

        return (
            <div className="space-y-4">
                {data.map((item, index) => (
                    <div key={index} className="space-y-2">
                        <div className="flex justify-between text-sm font-medium">
                            <span>{item.jour}</span>
                            <div className="flex gap-4 text-xs">
                                <span className="text-blue-600">Présence: {item.presence}%</span>
                                <span className="text-slate-600">Ponctualité: {item.ponctualite}%</span>
                            </div>
                        </div>
                        <div className="space-y-1">
                            <div className="flex gap-1">
                                <div className="flex-1 bg-gray-200 rounded-full h-2">
                                    <div
                                        className="bg-blue-600 h-2 rounded-full"
                                        style={{ width: `${(item.presence / maxValue) * 100}%` }}
                                    />
                                </div>
                                <div className="flex-1 bg-gray-200 rounded-full h-2">
                                    <div
                                        className="bg-slate-500 h-2 rounded-full"
                                        style={{ width: `${(item.ponctualite / maxValue) * 100}%` }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        )
    }

    // Simple Pie Chart Component
    const SimplePieChart = ({ data }) => {
        return (
            <div className="space-y-3">
                {data.map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className={`w-4 h-4 rounded-full ${index === 0 ? 'bg-blue-600' :
                                index === 1 ? 'bg-red-500' :
                                    index === 2 ? 'bg-green-600' : 'bg-yellow-500'
                                }`} />
                            <span className="text-sm font-medium">{item.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-600">{item.value}</span>
                            <span className="text-xs text-gray-500">({item.percentage}%)</span>
                        </div>
                    </div>
                ))}
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50 p-4 lg:p-6">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
                    <div>
                        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
                            Tableau de Bord Manager
                        </h1>
                        <p className="text-gray-600 mt-1">Gérez votre équipe efficacement</p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3">
                        <Button variant="outline" className="flex items-center gap-2 justify-center">
                            <Filter className="h-4 w-4" />
                            Filtres
                        </Button>
                        <Button className="flex items-center gap-2 justify-center">
                            <MessageSquare className="h-4 w-4" />
                            Actions rapides
                        </Button>
                    </div>
                </div>

                {/* KPIs */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
                    <Card>
                        <CardContent className="p-4 lg:p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-gray-600 text-sm font-medium">Équipe Totale</p>
                                    <p className="text-2xl lg:text-3xl font-bold text-gray-900">{stats.totalEmployes}</p>
                                </div>
                                <Users className="h-8 w-8 lg:h-10 lg:w-10 text-gray-500" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-4 lg:p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-gray-600 text-sm font-medium">Présents Aujourd'hui</p>
                                    <p className="text-2xl lg:text-3xl font-bold text-green-700">{stats.presentsAujourdhui}</p>
                                </div>
                                <CheckCircle className="h-8 w-8 lg:h-10 lg:w-10 text-green-600" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-4 lg:p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-gray-600 text-sm font-medium">Taux de Présence</p>
                                    <p className="text-2xl lg:text-3xl font-bold text-blue-700">{stats.tauxPresence}%</p>
                                </div>
                                <Target className="h-8 w-8 lg:h-10 lg:w-10 text-blue-600" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-4 lg:p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-gray-600 text-sm font-medium">Performance Moy.</p>
                                    <p className="text-2xl lg:text-3xl font-bold text-gray-900">{stats.moyennePerformance}%</p>
                                </div>
                                <BarChart3 className="h-8 w-8 lg:h-10 lg:w-10 text-gray-500" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Graphiques */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card>
                        <CardHeader className="pb-4">
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <BarChart3 className="h-5 w-5 text-blue-600" />
                                Tendances Hebdomadaires
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <SimpleBarChart data={performanceData} />
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-4">
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <Activity className="h-5 w-5 text-gray-600" />
                                Répartition des Absences
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <SimplePieChart data={absenceTypes} />
                        </CardContent>
                    </Card>
                </div>

                {/* Tableau Pointages */}
                <Card>
                    <CardHeader className="pb-4">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <Clock className="h-5 w-5 text-blue-600" />
                                Suivi des Pointages
                            </CardTitle>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setShowDetails(!showDetails)}
                                className="flex items-center gap-2 self-start sm:self-auto"
                            >
                                <Eye className="h-4 w-4" />
                                {showDetails ? "Masquer détails" : "Voir détails"}
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[600px]">
                                <thead>
                                    <tr className="bg-gray-50">
                                        <th className="text-left p-3 font-semibold text-gray-900">Employé</th>
                                        <th className="text-left p-3 font-semibold text-gray-900">Arrivée</th>
                                        <th className="text-left p-3 font-semibold text-gray-900">Départ</th>
                                        <th className="text-left p-3 font-semibold text-gray-900">Statut</th>
                                        {showDetails && (
                                            <>
                                                <th className="text-left p-3 font-semibold text-gray-900">Heures</th>
                                                <th className="text-left p-3 font-semibold text-gray-900">Performance</th>
                                                <th className="text-left p-3 font-semibold text-gray-900">Tendance</th>
                                            </>
                                        )}
                                    </tr>
                                </thead>
                                <tbody>
                                    {pointages.map((p, i) => {
                                        const badge = getStatusBadge(p.status)
                                        return (
                                            <tr key={i} className="hover:bg-gray-50 transition-colors border-b border-gray-200">
                                                <td className="p-3 font-medium text-gray-900">{p.name}</td>
                                                <td className={`p-3 ${p.status === "retard" ? "text-amber-700 font-medium" : "text-gray-700"}`}>
                                                    {p.arrivee}
                                                </td>
                                                <td className="p-3 text-gray-700">{p.depart}</td>
                                                <td className="p-3">
                                                    <Badge variant={badge.variant}>
                                                        {badge.text}
                                                    </Badge>
                                                </td>
                                                {showDetails && (
                                                    <>
                                                        <td className="p-3 font-medium text-gray-700">{p.heuresEffectives}</td>
                                                        <td className="p-3">
                                                            <span className={`text-sm font-semibold ${p.performance >= 95 ? 'text-green-600' :
                                                                p.performance >= 85 ? 'text-amber-600' : 'text-red-600'
                                                                }`}>
                                                                {p.performance}%
                                                            </span>
                                                        </td>
                                                        <td className="p-3">{getTendanceIcon(p.tendance)}</td>
                                                    </>
                                                )}
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>

                {/* Tableau Absences */}
                <Card>
                    <CardHeader className="pb-4">
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <Calendar className="h-5 w-5 text-gray-600" />
                            Gestion des Absences
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[700px]">
                                <thead>
                                    <tr className="bg-gray-50">
                                        <th className="text-left p-3 font-semibold text-gray-900">Employé</th>
                                        <th className="text-left p-3 font-semibold text-gray-900">Date</th>
                                        <th className="text-left p-3 font-semibold text-gray-900">Type</th>
                                        <th className="text-left p-3 font-semibold text-gray-900">Durée</th>
                                        <th className="text-left p-3 font-semibold text-gray-900">Statut</th>
                                        <th className="text-left p-3 font-semibold text-gray-900">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {absences.map((a, i) => (
                                        <tr key={i} className="hover:bg-gray-50 transition-colors border-b border-gray-200">
                                            <td className="p-3 font-medium text-gray-900">{a.name}</td>
                                            <td className="p-3 text-gray-700">{a.date}</td>
                                            <td className="p-3 text-gray-700">{a.type}</td>
                                            <td className="p-3 text-gray-700">{a.duree}</td>
                                            <td className="p-3">
                                                <Badge variant={getAbsenceStatusBadge(a.statut)}>
                                                    {a.statut}
                                                </Badge>
                                            </td>
                                            <td className="p-3">
                                                <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700">
                                                    Détails
                                                    <ChevronRight className="h-3 w-3 ml-1" />
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>

                {/* Alertes et Assistant */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card>
                        <CardHeader className="pb-4">
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <AlertCircle className="h-5 w-5 text-amber-600" />
                                Alertes & Notifications
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Alert className="border-red-200 bg-red-50">
                                <AlertCircle className="h-4 w-4 text-red-600" />
                                <AlertDescription className="text-red-800">
                                    <span className="font-semibold">Risque de surcharge - Youssef T.</span><br />
                                    <span className="text-sm">102% de performance détectée. Recommandation : planifier une pause.</span>
                                </AlertDescription>
                            </Alert>

                            <Alert className="border-amber-200 bg-amber-50">
                                <Clock className="h-4 w-4 text-amber-600" />
                                <AlertDescription className="text-amber-800">
                                    <span className="font-semibold">Pattern de retards - Sara A.</span><br />
                                    <span className="text-sm">3 retards cette semaine. Suggestion : entretien individuel.</span>
                                </AlertDescription>
                            </Alert>

                            <Alert className="border-blue-200 bg-blue-50">
                                <TrendingUp className="h-4 w-4 text-blue-600" />
                                <AlertDescription className="text-blue-800">
                                    <span className="font-semibold">Prédiction hebdomadaire</span><br />
                                    <span className="text-sm">Taux de présence prévu : 89% (↓3% vs semaine précédente)</span>
                                </AlertDescription>
                            </Alert>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-4">
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <Target className="h-5 w-5 text-gray-600" />
                                Recommandations
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="bg-gray-900 text-white p-4 rounded-lg">
                                <h4 className="font-semibold flex items-center gap-2 mb-3">
                                    <Target className="h-4 w-4" />
                                    Actions recommandées
                                </h4>
                                <ul className="text-sm space-y-2">
                                    <li className="flex items-start gap-2">
                                        <span className="text-green-400">•</span>
                                        Féliciter Youssef pour ses performances
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-amber-400">•</span>
                                        Planifier un 1:1 avec Sara pour les retards
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-blue-400">•</span>
                                        Organiser team building (moral équipe ↗️)
                                    </li>
                                </ul>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-2">
                                <Button className="flex-1">
                                    Générer rapport
                                </Button>
                                <Button variant="outline" className="flex-1">
                                    Planifier actions
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}