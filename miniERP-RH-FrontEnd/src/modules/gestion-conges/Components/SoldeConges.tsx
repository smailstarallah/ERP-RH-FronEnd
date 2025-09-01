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
            <div className="w-full p-2">
                <div className="bg-blue-600 text-white rounded-t-lg p-4 flex items-center space-x-4">
                    <Skeleton className="h-8 w-8 bg-white/20" />
                    <Skeleton className="h-6 w-48 bg-white/20" />
                </div>
                <div className="p-6 bg-white rounded-b-lg border border-t-0">
                    <div className="space-y-4">
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
        <div className="w-full shadow-lg rounded-xl border border-gray-200/80">
            {/* Header inspiré de l'image */}
            <div className="bg-blue-600 text-white rounded-t-lg p-4 flex items-center space-x-4">
                <CalendarDays className="h-7 w-7" />
                <div>
                    <h2 className="text-xl font-bold">Solde de vos congés</h2>
                    <p className="text-sm text-blue-200">Consultez vos droits restants pour l'année en cours.</p>
                </div>
            </div>

            {/* Contenu de la carte */}
            <CardContent className="bg-gray-50/80 p-4 sm:p-6 rounded-b-lg">
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
                                    className="bg-white p-4 rounded-lg border flex flex-col sm:flex-row sm:items-center sm:justify-between transition-shadow hover:shadow-md"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                >
                                    {/* Informations sur le type de congé */}
                                    <div className="flex-1 mb-4 sm:mb-0">
                                        <p className="font-semibold text-gray-800">{solde.typeCongeLibelle}</p>
                                        <p className="text-sm text-gray-500">Année {solde.annee}</p>
                                    </div>

                                    {/* Jauges et chiffres */}
                                    <div className="flex items-center space-x-4 sm:space-x-6 text-sm">
                                        <div className="text-center">
                                            <div className="text-gray-500">Acquis</div>
                                            <div className="font-bold text-lg text-gray-700">{solde.soldeInitial}j</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-gray-500">Utilisés</div>
                                            <div className="font-bold text-lg text-gray-700">{solde.soldePris}j</div>
                                        </div>
                                        <div className="text-center p-2 rounded-lg bg-blue-50">
                                            <div className="text-blue-600">Restants</div>
                                            <div className="font-bold text-xl text-blue-700">{solde.soldeRestant}j</div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </motion.div>
                    ) : (
                        // État si aucun solde n'est disponible
                        <motion.div
                            className="flex flex-col items-center justify-center py-10 text-center"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                        >
                            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-200 mb-4">
                                <FileText className="h-8 w-8 text-gray-500" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-800 mb-1">
                                Aucun solde disponible
                            </h3>
                            <p className="text-sm text-gray-600 max-w-xs">
                                Vos soldes de congés apparaîtront ici dès qu'ils seront disponibles.
                            </p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </CardContent>
        </div>
    );
}