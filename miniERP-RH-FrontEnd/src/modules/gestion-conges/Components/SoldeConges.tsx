import { useEffect, useState } from "react"
import { toast } from "sonner"

interface SoldeConge {
    annee: number;
    soldeInitial: number;
    soldePris: number;
    soldeRestant: number;
    employeId: number;
    typeCongeLibelle: string;
}

export const SoldeConges = () => {
    const [soldes, setSoldes] = useState<SoldeConge[]>([])
    const [loading, setLoading] = useState(true)

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
                console.log("######API Response:", data); // Pour déboguer

                // Traiter les données selon le format reçu
                let soldesArray: SoldeConge[] = [];

                if (Array.isArray(data)) {
                    soldesArray = data.map((item) => {
                        // Si l'item est un objet avec des clés numériques
                        if (typeof item === 'object' && !item.hasOwnProperty('annee')) {
                            // Extraire la première entrée de l'objet
                            const [, value] = Object.entries(item)[0];
                            return value as SoldeConge;
                        }
                        // Sinon, c'est déjà un objet SoldeConge
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


    return (
        <div className="bg-white rounded-xl shadow p-3 sm:p-6 border border-blue-100">
            <h2 className="text-lg font-bold text-blue-700 mb-4 flex items-center gap-2">
                <span className="inline-block w-4 h-4 rounded-full bg-blue-200" />
                Solde de congés
            </h2>

            {loading ? (
                <div className="text-center py-4">
                    <span className="text-blue-400">Chargement...</span>
                </div>
            ) : soldes.length > 0 ? (
                <div>
                    {/* Header: visible on sm+ screens, hidden on mobile */}
                    <div className="hidden sm:grid grid-cols-5 gap-2 px-3 pb-1 text-xs text-blue-500 font-semibold uppercase tracking-wide">
                        <span className="col-span-2">Type</span>
                        <span>Acquis</span>
                        <span>Pris</span>
                        <span>Restant</span>
                    </div>
                    <ul className="space-y-2">
                        {soldes.map((solde, index) => (
                            <li
                                key={index}
                                className="grid grid-cols-5 gap-2 items-center bg-blue-50/60 border border-blue-100 rounded-lg px-2 sm:px-3 py-2 text-sm"
                            >
                                {/* Mobile legend for each row */}
                                <div className="col-span-5 flex flex-col sm:hidden text-[11px] text-blue-400 pb-1">
                                    <span className="font-semibold text-blue-700">{solde.typeCongeLibelle} <span className="text-blue-300">({solde.annee})</span></span>
                                    <div className="flex gap-2 mt-1">
                                        <span>Acquis: <span className="text-green-600 font-semibold">{solde.soldeInitial}</span></span>
                                        <span>Pris: <span className="text-red-500 font-semibold">{solde.soldePris}</span></span>
                                        <span>Restant: <span className="text-blue-700 font-bold">{solde.soldeRestant} j</span></span>
                                    </div>
                                </div>
                                {/* Desktop columns */}
                                <div className="col-span-2 hidden sm:flex flex-row items-center gap-2 min-w-[100px]">
                                    <span className="font-semibold text-blue-700">{solde.typeCongeLibelle}</span>
                                    <span className="text-xs text-blue-400">{solde.annee}</span>
                                </div>
                                <span className="hidden sm:block text-green-600 font-semibold text-center">{solde.soldeInitial}</span>
                                <span className="hidden sm:block text-red-500 font-semibold text-center">{solde.soldePris}</span>
                                <span className="hidden sm:block text-blue-700 font-bold text-center">{solde.soldeRestant} j</span>
                            </li>
                        ))}
                    </ul>
                </div>
            ) : (
                <div className="text-center py-4">
                    <span className="text-blue-400">Aucun solde de congé disponible</span>
                </div>
            )}
        </div>
    )
}
