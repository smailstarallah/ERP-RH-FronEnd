import { useEffect, useState } from 'react';
import { DemandeCongeForm } from "./Components/DemandeConges"
import { SoldeConges } from "./Components/SoldeConges"
import { ValidationConges } from "./Components/ValidationConges"
import { User } from 'lucide-react'

export const GestionConges = () => {
    // Taken leaves state
    const [takenLeaves, setTakenLeaves] = useState<any[]>([])
    const [loadingTaken, setLoadingTaken] = useState<boolean>(true)

    useEffect(() => {
        const controller = new AbortController()
        let mounted = true

        const fetchTaken = async () => {
            try {
                setLoadingTaken(true)
                const token = localStorage.getItem('token')
                const res = await fetch('http://localhost:8080/api/conges-pris', {
                    signal: controller.signal,
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                })
                if (!mounted) return
                if (!res.ok) {
                    console.error('leave-statistics status', res.status)
                    setTakenLeaves([])
                    return
                }
                const json = await res.json()
                console.log('leave-statistics response', json)

                // If API returns an array directly, use it
                if (Array.isArray(json)) {
                    setTakenLeaves(json)
                    return
                }

                // Flexible extraction: try common keys, otherwise search arrays containing employee/taken info
                const candidates = [
                    json.congesPris,
                    json.conges_pris,
                    json.takenLeaves,
                    json.congesVsAlloues,
                    json.conges || json.leaves,
                ]

                let found: any[] | undefined = undefined
                for (const c of candidates) {
                    if (Array.isArray(c)) {
                        found = c
                        break
                    }
                }

                if (!found) {
                    // scan top-level arrays
                    for (const k of Object.keys(json || {})) {
                        const v = (json as any)[k]
                        if (Array.isArray(v) && v.length > 0) {
                            const sample = v[0]
                            if (sample && (sample.employe || sample.employeNom || sample.employee || sample.pris || sample.dateDebut || sample.startDate)) {
                                found = v
                                break
                            }
                        }
                    }
                }

                setTakenLeaves(found ?? [])
            } catch (err: any) {
                if (err.name === 'AbortError') return
                console.error('Failed to fetch taken leaves:', err)
                setTakenLeaves([])
            } finally {
                if (mounted) setLoadingTaken(false)
            }
        }

        fetchTaken()

        return () => {
            mounted = false
            controller.abort()
        }
    }, [])

    const formatDate = (d?: string) => d ? new Date(d).toLocaleDateString('fr-FR') : '—'

    const mapHexToBadgeClasses = (hex?: string) => {
        if (!hex) return { bg: 'bg-gray-100', text: 'text-gray-800' }
        const h = hex.toLowerCase()
        if (h === '#52f63c' || h === '#52f63c') return { bg: 'bg-green-100', text: 'text-green-800' }
        if (h === '#ffcc00' || h === '#f59e0b') return { bg: 'bg-yellow-100', text: 'text-yellow-800' }
        if (h === '#ff6b6b' || h === '#ef4444') return { bg: 'bg-red-100', text: 'text-red-800' }
        if (h === '#3b82f6' || h === '#3b82f6') return { bg: 'bg-blue-100', text: 'text-blue-800' }
        // fallback
        return { bg: 'bg-gray-100', text: 'text-gray-800' }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-slate-50 to-blue-100/80 w-full p-4 md:p-6">
            {/* Validation des congés */}
            <div className="py-4 md:py-6">
                <ValidationConges />
            </div>

            <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
                {/* Section solde de congés */}
                <div className="w-full lg:basis-1/2">
                    <SoldeConges />
                    <div className="py-4 md:py-6">
                        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-4 sm:p-6 md:p-8 border border-blue-100/50 overflow-hidden">
                            <h3 className="text-lg font-semibold text-blue-800 mb-4">Congés pris</h3>

                            {loadingTaken ? (
                                <div className="text-center py-8">
                                    <div className="inline-flex items-center gap-3 px-6 py-3 bg-blue-50 rounded-2xl border border-blue-100">
                                        <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                                        <span className="text-blue-600 font-semibold">Chargement...</span>
                                    </div>
                                </div>
                            ) : takenLeaves.length > 0 ? (
                                // Liste verticale: chaque ligne occupe toute la largeur, conteneur défilable
                                <div className="flex flex-col gap-3 max-h-80 overflow-y-auto">
                                    <ul className="divide-y divide-gray-100">
                                        {takenLeaves.map((t: any, idx: number) => {
                                            const id = t.id ?? idx
                                            const fullName = ((t.employePrenom ?? '') + ' ' + (t.employeNom ?? '')).trim() || '—'
                                            const typeLabel = t.typeConge ?? t.type ?? '—'
                                            const dept = t.departement ?? t.department ?? '—'
                                            const start = formatDate(t.dateDebut ?? t.startDate)
                                            const end = formatDate(t.dateFin ?? t.endDate)
                                            const days = t.nombreJours ?? t.pris ?? t.days ?? '—'
                                            const validated = formatDate(t.dateValidation ?? t.validatedAt ?? t.dateValidated)
                                            const cls = mapHexToBadgeClasses(t.couleurType)

                                            return (
                                                <li key={id} className="py-2">
                                                    <div className="bg-white rounded-lg border p-4 shadow-sm flex justify-between items-start w-full">
                                                        <div className="min-w-0">
                                                            <div className="flex items-center gap-3">
                                                                <User className="w-5 h-5 text-blue-400 flex-shrink-0" />
                                                                <div className="min-w-0">
                                                                    <div className="truncate font-medium text-blue-800">{fullName}</div>
                                                                    <div className="text-xs text-blue-500 truncate">{dept}</div>
                                                                </div>
                                                            </div>
                                                            <div className="mt-3 text-sm text-gray-700">{start} — {end}</div>
                                                            <div className="mt-2 text-sm text-gray-700">{days} jour{(typeof days === 'number' && days > 1) || (typeof days === 'string' && Number(days) > 1) ? 's' : ''}</div>
                                                            <div className="mt-2 text-xs text-gray-500">Validé le {validated}</div>
                                                        </div>
                                                        <div className="ml-4 flex-shrink-0 flex flex-col items-end">
                                                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${cls.bg} ${cls.text}`}>{typeLabel}</span>
                                                        </div>
                                                    </div>
                                                </li>
                                            )
                                        })}
                                    </ul>
                                </div>
                            ) : (
                                <div className="text-sm text-gray-600">Aucune donnée de congés pris disponible.</div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Section formulaire */}
                <div className="w-full lg:basis-1/2">
                    <div className="bg-card rounded-lg border shadow-sm p-6">
                        <DemandeCongeForm />
                    </div>
                </div>

            </div>
            {/* <PdfTesterComponent /> */}
        </div>
    )
}