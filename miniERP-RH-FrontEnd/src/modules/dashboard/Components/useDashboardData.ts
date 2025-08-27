import { useEffect, useState } from "react"

export function useDashboardData() {
    const [data, setData] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [kpiList, setKpiList] = useState<any[]>([])
    const [kpiLoading, setKpiLoading] = useState<boolean>(true)

    useEffect(() => {
        const controller = new AbortController()
        let mounted = true

        // const fallbackData = {
        //     // Données transférées depuis LeavesModule (fallback)
        //     leaveData: [
        //         { department: 'IT', conges: 45, rtt: 20, maladie: 15, formation: 8 },
        //         { department: 'RH', conges: 38, rtt: 18, maladie: 12, formation: 15 },
        //         { department: 'Marketing', conges: 42, rtt: 22, maladie: 8, formation: 6 },
        //         { department: 'Finance', conges: 35, rtt: 16, maladie: 20, formation: 4 },
        //         { department: 'Commercial', conges: 48, rtt: 25, maladie: 10, formation: 12 }
        //     ],

        //     leaveTypeData: [
        //         { name: 'Congés payés', value: 208, color: '#3B82F6' },
        //         { name: 'RTT', value: 101, color: '#10B981' },
        //         { name: 'Maladie', value: 65, color: '#EF4444' },
        //         { name: 'Formation', value: 45, color: '#F59E0B' }
        //     ],

        //     monthlyTrendData: [
        //         { month: 'Jan', current: 25, previous: 30 },
        //         { month: 'Fév', current: 28, previous: 32 },
        //         { month: 'Mar', current: 35, previous: 38 },
        //         { month: 'Avr', current: 45, previous: 42 },
        //         { month: 'Mai', current: 52, previous: 48 },
        //         { month: 'Juin', current: 48, previous: 45 },
        //         { month: 'Jul', current: 65, previous: 62 },
        //         { month: 'Août', current: 58, previous: 55 }
        //     ],

        //     // Anciennes données synthétiques existantes (conservées pour compatibilité)
        //     congesParDepartement: [
        //         { departement: "RH", Annuel: 12, Maladie: 3, Exceptionnel: 1 },
        //         { departement: "IT", Annuel: 15, Maladie: 1, Exceptionnel: 2 },
        //         { departement: "Finance", Annuel: 9, Maladie: 2, Exceptionnel: 0 },
        //     ],
        //     repartitionConges: [
        //         { type: "Annuel", value: 36 },
        //         { type: "Maladie", value: 8 },
        //         { type: "Exceptionnel", value: 3 },
        //     ],
        //     absencesMensuelles: [
        //         { mois: "Jan", jours: 12 },
        //         { mois: "Fév", jours: 15 },
        //         { mois: "Mar", jours: 10 },
        //     ],
        //     heatmap: [
        //         [1, 0, 1, 1, 0, 1, 0],
        //         [0, 1, 1, 0, 0, 1, 1],
        //         [1, 1, 0, 1, 1, 0, 0],
        //     ],
        //     heatmapXLabels: ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"],
        //     heatmapYLabels: ["Emp1", "Emp2", "Emp3"],
        //     congesVsAlloues: [
        //         { employe: "Alice", Pris: 8, Alloues: 20 },
        //         { employe: "Bob", Pris: 15, Alloues: 18 },
        //     ],
        //     soldeConges: [
        //         { employe: "Alice", solde: 12 },
        //         { employe: "Bob", solde: 3 },
        //     ],
        //     absencesParJourSemaine: [
        //         { jour: "Lundi", absences: 5 },
        //         { jour: "Mardi", absences: 8 },
        //         { jour: "Mercredi", absences: 4 },
        //         { jour: "Jeudi", absences: 6 },
        //         { jour: "Vendredi", absences: 10 },
        //     ],
        // }

        const fetchData = async () => {
            setLoading(true)
            try {
                const res = await fetch('http://localhost:8080/api/leave-statistics', {
                    signal: controller.signal,
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                })
                if (!mounted) return
                if (res.ok) {
                    const json = await res.json()
                    // Attendez que l'API retourne un objet compatible. Sinon utilisez le fallback.
                    console.log(json)
                    setData(json)
                } else {
                    console.error('API /api/leave-statistics error:', res.status)
                    // setData(fallbackData)
                }
            } catch (err: any) {
                if (err.name === 'AbortError') return
                console.error('Failed to fetch /api/leave-statistics:', err)
                // setData(fallbackData)
            } finally {
                if (mounted) setLoading(false)
            }
        }

        const fetchKpis = async () => {
            setKpiLoading(true)
            try {
                const res = await fetch('http://localhost:8080/api/leave-statistics/kpi', {
                    signal: controller.signal,
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                })
                if (!mounted) return
                if (res.ok) {
                    const json = await res.json()
                    // API might return an array or an object with a `kpis` key
                    const payload = Array.isArray(json) ? json : (json.kpis ?? json)
                    if (Array.isArray(payload)) {
                        setKpiList(payload)
                    } else {
                        const maybeArray = Object.keys(payload || {})
                            .map((k) => (payload as any)[k])
                            .filter((v) => v && v.title !== undefined)
                        setKpiList(maybeArray)
                    }
                } else {
                    console.error('API /api/leave-statistics/kpi error:', res.status)
                }
            } catch (err: any) {
                if (err.name === 'AbortError') return
                console.error('Failed to fetch /api/leave-statistics/kpi:', err)
            } finally {
                if (mounted) setKpiLoading(false)
            }
        }

        fetchData()
        fetchKpis()

        return () => {
            mounted = false
            controller.abort()
        }
    }, [])

    return { data, loading, kpiList, kpiLoading }
}
