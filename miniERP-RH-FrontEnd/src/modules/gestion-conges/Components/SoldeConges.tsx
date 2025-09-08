import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { CalendarDays, FileText } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// --- Interface (Aucun changement) ---
interface SoldeConge {
    annee: number;
    soldeInitial: number;
    soldePris: number;
    soldeRestant: number;
    employeId: number;
    typeCongeLibelle: string;
}

// --- Le Composant Amélioré ---
export const SoldeConges = () => {
    const [soldes, setSoldes] = useState<SoldeConge[]>([]);
    const [loading, setLoading] = useState(true);

    // --- Logique de fetch (Aucun changement) ---
    useEffect(() => {
        const fetchSoldeConges = async () => {
            try {
                setLoading(true)
                const token = localStorage.getItem('token');
                const userData = localStorage.getItem('userData');
                if (!userData) {
                    throw new Error("User data not found in localStorage");
                }
                const empId = JSON.parse(userData).id;

                const response = await fetch(`http://localhost:8080/api/gestion-conge/list-sold-conge/${empId}`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (!response.ok) {
                    throw new Error(`Erreur ${response.status}: ${response.statusText}`);
                }

                const data = await response.json();
                console.log("######API Response:", data);

                let soldesArray: SoldeConge[] = [];

                if (Array.isArray(data)) {
                    soldesArray = data.map((item) => {
                        if (typeof item === 'object' && !item.hasOwnProperty('annee')) {
                            const [, value] = Object.entries(item)[0];
                            return value as SoldeConge;
                        }
                        return item as SoldeConge;
                    });
                }

                setSoldes(soldesArray);

            } catch (error) {
                console.error("Erreur lors de la récupération des soldes de congés:", error);
                toast.error("Erreur lors du chargement des soldes de congés");
                setSoldes([]);
            } finally {
                setLoading(false);
            }
        };

        fetchSoldeConges();
    }, []);

    // --- Composant de chargement (Skeleton) ---
    if (loading) {
        return (
            <div className="w-full shadow-md rounded-lg border border-slate-300 overflow-hidden">
                <div className="bg-blue-600 p-4 flex items-center space-x-3">
                    <Skeleton className="h-8 w-8 bg-white/20 rounded-lg" />
                    <div className="space-y-1">
                        <Skeleton className="h-4 w-32 bg-white/30" />
                        <Skeleton className="h-3 w-24 bg-white/20" />
                    </div>
                </div>
                <div className="p-5 bg-slate-50">
                    <div className="space-y-3">
                        {[1, 2, 3].map((i) => (
                            <Skeleton key={i} className="h-16 w-full rounded-lg" />
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    // --- Composant Principal ---
    return (
        <div className="w-full shadow-md rounded-lg border border-slate-300 overflow-hidden">
            {/* Header bleu simple */}
            <div className="bg-blue-600 text-white p-4 flex items-center space-x-3">
                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                    <CalendarDays className="h-4 w-4 text-white" />
                </div>
                <div>
                    <h2 className="text-lg font-semibold text-white">Solde de vos congés</h2>
                    <p className="text-blue-100 text-sm">Consultez vos droits restants.</p>
                </div>
            </div>

            {/* Contenu de la carte */}
            <CardContent className="bg-slate-50 p-4 sm:p-5 overflow-y-auto max-h-96">
                <AnimatePresence>
                    {soldes.length > 0 ? (
                        <motion.div
                            className="space-y-3"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.5 }}
                        >
                            {soldes.map((solde, index) => (
                                <motion.div
                                    key={index}
                                    className="bg-white p-4 rounded-lg border border-slate-200 flex flex-col lg:flex-row lg:items-center lg:justify-between shadow-sm hover:shadow-md transition-shadow duration-200"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                >
                                    {/* Informations sur le type de congé */}
                                    <div className="flex-1 mb-3 lg:mb-0">
                                        <div className="flex items-center gap-3">
                                            <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center">
                                                <CalendarDays className="w-3 h-3 text-white" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-slate-900 text-sm">{solde.typeCongeLibelle}</p>
                                                <p className="text-xs text-slate-600">Année {solde.annee}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Métriques compactes */}
                                    <div className="flex items-center gap-4 text-sm">
                                        <div className="text-center bg-slate-100 rounded p-2">
                                            <div className="text-slate-600 text-xs">Acquis</div>
                                            <div className="font-semibold text-slate-900">{solde.soldeInitial}j</div>
                                        </div>
                                        <div className="text-center bg-slate-100 rounded p-2">
                                            <div className="text-slate-600 text-xs">Utilisés</div>
                                            <div className="font-semibold text-slate-900">{solde.soldePris}j</div>
                                        </div>
                                        <div className="text-center bg-blue-100 rounded p-2">
                                            <div className="text-blue-700 text-xs font-medium">Restants</div>
                                            <div className="font-bold text-blue-900">{solde.soldeRestant}j</div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </motion.div>
                    ) : (
                        // État si aucun solde n'est disponible
                        <motion.div
                            className="flex flex-col items-center justify-center py-8 text-center"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                        >
                            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 mb-4">
                                <FileText className="h-8 w-8 text-slate-500" />
                            </div>
                            <h3 className="text-lg font-semibold text-slate-900 mb-2">
                                Aucun solde disponible
                            </h3>
                            <p className="text-sm text-slate-600">
                                Vos soldes de congés apparaîtront ici.
                            </p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </CardContent>
        </div>
    );
}