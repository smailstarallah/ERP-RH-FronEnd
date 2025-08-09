"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import * as React from "react"
import { type DateRange } from "react-day-picker"

import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Calendar } from "@/components/ui/calendar"
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { DemandeCongeFormSchema, type DemandeCongeForm } from "../validation"
import { useTransition } from "react"
import { Loader } from "lucide-react"

interface TypeConge {
    id: number;
    nom: string;
}

export function DemandeCongeForm() {
    const [pending, startCongeTransition] = useTransition()
    const [typeConges, setTypeConges] = React.useState<TypeConge[]>([])
    const [loadingTypes, setLoadingTypes] = React.useState(true)
    const [dateRange, setDateRange] = React.useState<DateRange | undefined>({
        from: new Date(),
        to: new Date(),
    })

    const form = useForm<DemandeCongeForm>({
        resolver: zodResolver(DemandeCongeFormSchema),
        defaultValues: {
            dateDebut: new Date(),
            dateFin: new Date(),
            typeConge: "",
            motif: "",
        },
    })

    React.useEffect(() => {
        if (dateRange?.from) {
            form.setValue("dateDebut", dateRange.from)
        }
        if (dateRange?.to) {
            form.setValue("dateFin", dateRange.to)
        }
    }, [dateRange, form])

    // Récupération des types de congés depuis l'API
    React.useEffect(() => {
        const fetchTypeConges = async () => {
            try {
                setLoadingTypes(true)
                const token = localStorage.getItem('token');
                if (!token) {
                    throw new Error("Token not found in localStorage");
                }

                const response = await fetch('http://localhost:8080/api/gestion-conge/list-type-conge', {
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
                console.log("API Response:", data); // Pour déboguer

                // L'API retourne un array d'objets où chaque objet a une clé (ID) et une valeur (nom)
                let typesArray: TypeConge[] = [];

                if (Array.isArray(data)) {
                    typesArray = data.map((item) => {
                        // Chaque item est un objet comme {1: 'Congé annuel'}
                        const [id, nom] = Object.entries(item)[0];
                        return {
                            id: parseInt(id),
                            nom: String(nom)
                        };
                    });
                } else if (typeof data === 'object' && data !== null) {
                    // Si c'est un objet (Map), convertir en array
                    typesArray = Object.entries(data).map(([id, nom]) => ({
                        id: parseInt(id),
                        nom: String(nom)
                    }));
                }

                console.log("Processed types:", typesArray); // Pour vérifier le traitement
                setTypeConges(typesArray);
            } catch (error) {
                console.error("Erreur lors de la récupération des types de congés:", error);
                toast.error("Erreur lors du chargement des types de congés");
                // En cas d'erreur, on peut définir des types par défaut ou laisser vide
                setTypeConges([]);
            } finally {
                setLoadingTypes(false);
            }
        };

        fetchTypeConges();
    }, []);

    function onSubmit(data: DemandeCongeForm) {
        startCongeTransition(async () => {
            console.log("Form submitted:", data);

            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    throw new Error("Token not found in localStorage");
                }
                // Récupération l'ID de l'employé
                const userData = localStorage.getItem('userData');
                const employeId = userData ? JSON.parse(userData).id : null; // ou depuis le contexte utilisateur/localStorage

                const response = await fetch(`http://localhost:8080/api/gestion-conge/demande/${employeId}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}` // Assurez-vous que le token est bien stocké
                    },
                    body: JSON.stringify({
                        dateDebut: data.dateDebut.toISOString().split('T')[0], // Format YYYY-MM-DD
                        dateFin: data.dateFin.toISOString().split('T')[0], // Format YYYY-MM-DD
                        motif: data.motif,
                        typeCongeId: parseInt(data.typeConge) // Changer le nom de la propriété
                    })
                });

                if (!response.ok) {
                    const errorMessage = await response.text();
                    toast.error(`Erreur lors de l'envoi: ${errorMessage}`);
                    throw new Error(errorMessage || `Erreur ${response.status}: ${response.statusText}`);
                }

                const result = await response.text();
                console.log("API Response:", result);

                // Succès
                toast.success("Demande de congé envoyée avec succès!");

            } catch (error) {
                console.error("Erreur lors de l'envoi:", error);
                if (error instanceof Error) {
                    toast.error(`Erreur: ${error.message}`);
                } else {
                    toast.error("Une erreur inconnue est survenue.");
                }
            }
        });
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="w-2/3 space-y-6">
                <FormField
                    control={form.control}
                    name="dateDebut"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Période de congé</FormLabel>
                            <FormControl>
                                <Calendar
                                    mode="range"
                                    defaultMonth={dateRange?.from}
                                    selected={dateRange}
                                    onSelect={setDateRange}
                                    className="rounded-lg border shadow-sm"
                                />
                            </FormControl>
                            <FormDescription>
                                Sélectionnez la date de début et de fin de votre congé.
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="typeConge"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Type de congé</FormLabel>
                            <FormControl>
                                <Select onValueChange={field.onChange} defaultValue={field.value} disabled={loadingTypes}>
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder={
                                            loadingTypes
                                                ? "Chargement..."
                                                : "Sélectionnez un type de congé"
                                        } />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectGroup>
                                            <SelectLabel>Types de congés</SelectLabel>
                                            {typeConges && typeConges.length > 0 ? (
                                                typeConges.map((type) => (
                                                    <SelectItem key={type.id} value={type.id.toString()}>
                                                        {type.nom}
                                                    </SelectItem>
                                                ))
                                            ) : (
                                                !loadingTypes && (
                                                    <SelectItem value="no-data" disabled>
                                                        Aucun type de congé disponible
                                                    </SelectItem>
                                                )
                                            )}
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                            </FormControl>
                            <FormDescription>
                                Choisissez le type de congé approprié pour votre demande.
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="motif"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Motif</FormLabel>
                            <FormControl>
                                <Input placeholder="Entrez le motif de votre congé" {...field} />
                            </FormControl>
                            <FormDescription>
                                Précisez la raison de votre demande de congé.
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <Button type="submit">Submit {pending && <Loader />}</Button>
            </form>
        </Form>
    )
}
