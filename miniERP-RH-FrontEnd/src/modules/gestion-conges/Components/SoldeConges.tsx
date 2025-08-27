import { useEffect, useState } from "react"
import { toast } from "sonner"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { CalendarDays, FileText } from "lucide-react"

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

    const getStatusVariant = (restant: number, initial: number) => {
        const percentage = (restant / initial) * 100;
        if (percentage > 70) return "secondary";
        if (percentage > 30) return "default";
        return "destructive";
    };

    if (loading) {
        return (
            <Card className="w-full">
                <CardHeader className="space-y-4">
                    <div className="flex items-center space-x-4">
                        <Skeleton className="h-12 w-12 rounded-lg" />
                        <div className="space-y-2">
                            <Skeleton className="h-6 w-48" />
                            <Skeleton className="h-4 w-64" />
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Skeleton className="h-10 w-full" />
                    {[1, 2, 3].map((i) => (
                        <Skeleton key={i} className="h-16 w-full" />
                    ))}
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="w-full shadow-sm">
            <CardHeader className="pb-6">
                <div className="flex items-center space-x-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                        <CalendarDays className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1 space-y-1">
                        <CardTitle className="text-2xl font-semibold tracking-tight">
                            Solde de congés
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">
                            Gestion et suivi de vos droits aux congés annuels
                        </p>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="space-y-6">
                {soldes.length > 0 ? (
                    <>
                        {/* Vue Desktop - Liste simple */}
                        <div className="hidden md:block space-y-3">
                            {soldes.map((solde, index) => (
                                <div key={index} className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors">
                                    <div className="flex items-center space-x-3">
                                        <div className="h-2 w-2 rounded-full bg-primary" />
                                        <div>
                                            <span className="font-medium">{solde.typeCongeLibelle}</span>
                                            <span className="ml-2 text-sm text-muted-foreground">({solde.annee})</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-8">
                                        <div className="text-center">
                                            <div className="text-sm text-muted-foreground">Acquis</div>
                                            <div className="font-semibold">{solde.soldeInitial}j</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-sm text-muted-foreground">Utilisés</div>
                                            <div className="font-semibold">{solde.soldePris}j</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-sm text-muted-foreground">Restants</div>
                                            <div className="font-semibold text-primary">{solde.soldeRestant}j</div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Vue Mobile - Liste simple */}
                        <div className="md:hidden space-y-3">
                            {soldes.map((solde, index) => (
                                <div key={index} className="p-4 rounded-lg border bg-card">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center space-x-2">
                                            <div className="h-2 w-2 rounded-full bg-primary" />
                                            <span className="font-medium">{solde.typeCongeLibelle}</span>
                                        </div>
                                        <span className="text-sm text-muted-foreground">{solde.annee}</span>
                                    </div>
                                    <div className="grid grid-cols-3 gap-4 text-center text-sm">
                                        <div>
                                            <div className="text-muted-foreground">Acquis</div>
                                            <div className="font-semibold">{solde.soldeInitial}j</div>
                                        </div>
                                        <div>
                                            <div className="text-muted-foreground">Utilisés</div>
                                            <div className="font-semibold">{solde.soldePris}j</div>
                                        </div>
                                        <div>
                                            <div className="text-muted-foreground">Restants</div>
                                            <div className="font-semibold text-primary">{solde.soldeRestant}j</div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted/50 mb-4">
                            <FileText className="h-10 w-10 text-muted-foreground" />
                        </div>
                        <h3 className="text-lg font-semibold text-foreground mb-2">
                            Aucun solde disponible
                        </h3>
                        <p className="text-sm text-muted-foreground max-w-md">
                            Vos soldes de congés apparaîtront ici une fois qu'ils seront configurés par votre service RH.
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}