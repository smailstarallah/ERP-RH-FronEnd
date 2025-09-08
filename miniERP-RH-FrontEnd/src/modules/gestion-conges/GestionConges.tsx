import { useEffect, useState } from 'react';
import { DemandeCongeForm } from "./Components/DemandeConges"
import { SoldeConges } from "./Components/SoldeConges"
import { ValidationConges } from "./Components/ValidationConges"
import { User } from 'lucide-react'
import { AnalyticsDashboard } from './Components/test';
import { useRolePermissions } from './hooks/useRolePermissions';

export const GestionConges = () => {
    // Use role permissions hook
    const { userRole, permissions, hasAnyPermission } = useRolePermissions()

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
                const userId = localStorage.getItem('userData') ? JSON.parse(localStorage.getItem('userData') || '{}').id : null
                const res = await fetch(`http://localhost:8080/api/conges-pris?userId=${userId}`, {
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

    return (
        <div className="min-h-screen bg-slate-50 w-full p-3 sm:p-4 lg:p-6">

            {/* Message si aucun accès */}
            {!hasAnyPermission() && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
                    <div className="text-yellow-800">
                        <h3 className="font-medium mb-2">Accès limité</h3>
                        <p className="text-sm">Votre rôle ({userRole}) ne dispose pas d'autorisations pour accéder aux modules de gestion des congés.</p>
                    </div>
                </div>
            )}

            {/* Validation des congés - Visible pour MANAGER et RH */}
            {permissions.canViewValidation && (
                <div className="mb-4 lg:mb-6">
                    <ValidationConges />
                </div>
            )}

            <div className="flex flex-col xl:flex-row gap-4 lg:gap-6">
                {/* Section solde de congés - Visible pour tous les rôles */}
                <div className="w-full xl:w-1/2">
                    {permissions.canViewSolde && (
                        <SoldeConges />
                    )}
                    {permissions.canViewHistory && (
                        <div className="mt-4 lg:mt-6">
                            <div className="bg-white border border-slate-300 rounded-lg shadow-md p-3 sm:p-4 lg:p-5 transition-shadow duration-200 hover:shadow-lg">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                                        <User className="w-4 h-4 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-slate-900">Congés pris</h3>
                                        <p className="text-sm text-slate-600">Historique de vos absences</p>
                                    </div>
                                </div>

                                {loadingTaken ? (
                                    <div className="text-center py-6">
                                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-lg border border-slate-300">
                                            <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                                            <span className="text-slate-700 font-medium">Chargement...</span>
                                        </div>
                                    </div>
                                ) : takenLeaves.length > 0 ? (
                                    <div className="space-y-3 max-h-80 overflow-y-auto">
                                        {takenLeaves.map((t: any, idx: number) => {
                                            const id = t.id ?? idx
                                            const fullName = ((t.employePrenom ?? '') + ' ' + (t.employeNom ?? '')).trim() || '—'
                                            const typeLabel = t.typeConge ?? t.type ?? '—'
                                            const dept = t.departement ?? t.department ?? '—'
                                            const start = formatDate(t.dateDebut ?? t.startDate)
                                            const end = formatDate(t.dateFin ?? t.endDate)
                                            const days = t.nombreJours ?? t.pris ?? t.days ?? '—'
                                            const validated = formatDate(t.dateValidation ?? t.validatedAt ?? t.dateValidated)

                                            return (
                                                <div key={id} className="bg-white border border-slate-200 rounded-lg p-3 sm:p-4 shadow-sm hover:shadow-md transition-shadow duration-200">
                                                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                                                        <div className="min-w-0 flex-1">
                                                            <div className="flex items-center gap-3 mb-2">
                                                                <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center flex-shrink-0">
                                                                    <User className="w-3 h-3 text-white" />
                                                                </div>
                                                                <div className="min-w-0">
                                                                    <div className="truncate font-medium text-slate-900 text-sm">{fullName}</div>
                                                                    <div className="text-xs text-slate-600 truncate">{dept}</div>
                                                                </div>
                                                            </div>
                                                            <div className="bg-slate-50 rounded p-2 mb-2">
                                                                <div className="text-xs text-slate-700 mb-1">{start} — {end}</div>
                                                                <div className="text-xs text-blue-700 font-medium">{days} jour{(typeof days === 'number' && days > 1) || (typeof days === 'string' && Number(days) > 1) ? 's' : ''}</div>
                                                            </div>
                                                            <div className="text-xs text-slate-500">Validé le {validated}</div>
                                                        </div>
                                                        <div className="flex-shrink-0">
                                                            <span className="px-2 py-1 text-xs font-medium rounded bg-blue-100 text-blue-800">{typeLabel}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                ) : (
                                    <div className="text-sm text-gray-600">Aucune donnée de congés pris disponible.</div>
                                )}
                            </div>
                        </div>
                    )}
                </div>


                {/* Section formulaire - Visible pour EMPLOYE et MANAGER */}
                {permissions.canMakeRequest && (
                    <div className="w-full xl:w-1/2">
                        <DemandeCongeForm />
                    </div>
                )}
            </div>

            {/* Analytics Dashboard - Visible uniquement pour RH */}
            {permissions.canViewAnalytics && <AnalyticsDashboard />}
        </div>
    )
}