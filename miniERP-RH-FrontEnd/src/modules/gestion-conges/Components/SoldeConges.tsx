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
        <div className="bg-white rounded-lg shadow-md p-4 md:p-6 border border-gray-200">
            <h2 className="text-lg md:text-xl font-semibold text-gray-800 mb-4">
                Solde de congés
            </h2>

            {loading ? (
                <div className="text-center py-4">
                    <span className="text-gray-500">Chargement...</span>
                </div>
            ) : soldes.length > 0 ? (
                <div className="space-y-4">
                    {soldes.map((solde, index) => (
                        <div key={index} className="border rounded-lg p-4 bg-gray-50">
                            <h3 className="font-semibold text-gray-800 mb-3">
                                {solde.typeCongeLibelle} - {solde.annee}
                            </h3>
                            <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600">Congés acquis</span>
                                    <span className="font-medium text-green-600">{solde.soldeInitial} jours</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600">Congés pris</span>
                                    <span className="font-medium text-red-600">{solde.soldePris} jours</span>
                                </div>
                                <div className="border-t pt-2">
                                    <div className="flex justify-between items-center">
                                        <span className="text-base font-semibold text-gray-800">Solde restant</span>
                                        <span className="text-lg font-bold text-blue-600">{solde.soldeRestant} jours</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-4">
                    <span className="text-gray-500">Aucun solde de congé disponible</span>
                </div>
            )}
        </div>
    )
}
