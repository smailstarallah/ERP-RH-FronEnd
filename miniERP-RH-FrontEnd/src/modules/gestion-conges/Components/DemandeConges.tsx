"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import * as React from "react"
import { type DateRange } from "react-day-picker"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
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
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { useTransition } from "react"
import { Loader2, CalendarDays, Send } from "lucide-react"

// Schema de validation Zod
const DemandeCongeFormSchema = z.object({
    dateDebut: z.date("La date de début est requise"),
    dateFin: z.date("La date de fin est requise"),
    typeConge: z.string().min(1, "Veuillez sélectionner un type de congé"),
    motif: z.string().min(1, "Le motif est requis"),
}).refine((data) => data.dateFin >= data.dateDebut, {
    message: "La date de fin doit être postérieure à la date de début",
    path: ["dateFin"],
});

type DemandeCongeForm = z.infer<typeof DemandeCongeFormSchema>

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
                const token = localStorage?.getItem('token');
                if (!token) {
                    // Si pas de token, utiliser des données mock
                    const mockTypes: TypeConge[] = [
                        { id: 1, nom: "Congé annuel" },
                        { id: 2, nom: "Congé maladie" },
                        { id: 3, nom: "Congé maternité" },
                        { id: 4, nom: "Congé formation" }
                    ]
                    await new Promise(resolve => setTimeout(resolve, 1000))
                    setTypeConges(mockTypes)
                    setLoadingTypes(false)
                    return;
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
                console.log("API Response:", data);

                let typesArray: TypeConge[] = [];

                if (Array.isArray(data)) {
                    typesArray = data.map((item) => {
                        const [id, nom] = Object.entries(item)[0];
                        return {
                            id: parseInt(id),
                            nom: String(nom)
                        };
                    });
                } else if (typeof data === 'object' && data !== null) {
                    typesArray = Object.entries(data).map(([id, nom]) => ({
                        id: parseInt(id),
                        nom: String(nom)
                    }));
                }

                console.log("Processed types:", typesArray);
                setTypeConges(typesArray);
            } catch (error) {
                console.error("Erreur lors de la récupération des types de congés:", error);
                toast.error("Erreur lors du chargement des types de congés");
                // Fallback vers des données mock
                setTypeConges([
                    { id: 1, nom: "Congé annuel" },
                    { id: 2, nom: "Congé maladie" },
                    { id: 3, nom: "Congé formation" }
                ]);
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
                const token = localStorage?.getItem('token');
                if (!token) {
                    // Mode démo sans API
                    await new Promise(resolve => setTimeout(resolve, 2000))
                    toast.success("Demande de congé envoyée avec succès!");
                    form.reset();
                    setDateRange({ from: new Date(), to: new Date() });
                    return;
                }

                const userData = localStorage.getItem('userData');
                const employeId = userData ? JSON.parse(userData).id : null;

                const response = await fetch(`http://localhost:8080/api/gestion-conge/demande/${employeId}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        dateDebut: data.dateDebut.toISOString().split('T')[0],
                        dateFin: data.dateFin.toISOString().split('T')[0],
                        motif: data.motif,
                        typeCongeId: parseInt(data.typeConge)
                    })
                });

                if (!response.ok) {
                    const errorMessage = await response.text();
                    toast.error(`Erreur lors de l'envoi: ${errorMessage}`);
                    throw new Error(errorMessage || `Erreur ${response.status}: ${response.statusText}`);
                }

                const result = await response.text();
                console.log("API Response:", result);

                toast.success("Demande de congé envoyée avec succès!");

                // Reset form
                form.reset();
                setDateRange({ from: new Date(), to: new Date() });

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
        <div className="w-full max-w-2xl mx-auto">
            {/* Header */}
            <div className="mb-6 pb-6 border-b">
                <div className="flex items-center space-x-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                        <CalendarDays className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1">
                        <h2 className="text-2xl font-semibold tracking-tight">
                            Nouvelle demande de congé
                        </h2>
                        <p className="text-sm text-muted-foreground">
                            Remplissez le formulaire pour soumettre votre demande
                        </p>
                    </div>
                </div>
            </div>

            {/* Form Content */}
            <Form {...form}>
                <div className="space-y-6">

                    {/* Calendrier */}
                    <FormField
                        control={form.control}
                        name="dateDebut"
                        render={() => (
                            <FormItem>
                                <FormLabel className="text-base font-medium">
                                    Période de congé
                                </FormLabel>
                                <FormControl>
                                    <div className="flex justify-center">
                                        <Calendar
                                            mode="range"
                                            defaultMonth={dateRange?.from}
                                            selected={dateRange}
                                            onSelect={setDateRange}
                                            className="rounded-lg border"
                                        />
                                    </div>
                                </FormControl>
                                <p className="text-sm text-muted-foreground">
                                    Sélectionnez vos dates de début et de fin
                                </p>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Type de congé */}
                    <FormField
                        control={form.control}
                        name="typeConge"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-base font-medium">
                                    Type de congé
                                </FormLabel>
                                <FormControl>
                                    {loadingTypes ? (
                                        <Skeleton className="h-10 w-full" />
                                    ) : (
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Sélectionnez un type" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {typeConges.length > 0 ? (
                                                    typeConges.map((type) => (
                                                        <SelectItem key={type.id} value={type.id.toString()}>
                                                            {type.nom}
                                                        </SelectItem>
                                                    ))
                                                ) : (
                                                    <SelectItem value="no-data" disabled>
                                                        Aucun type disponible
                                                    </SelectItem>
                                                )}
                                            </SelectContent>
                                        </Select>
                                    )}
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Motif */}
                    <FormField
                        control={form.control}
                        name="motif"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-base font-medium">
                                    Motif
                                </FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="Précisez le motif de votre demande"
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Bouton de soumission */}
                    <div className="flex justify-end pt-4">
                        <Button
                            type="submit"
                            disabled={pending}
                            className="min-w-[160px]"
                            onClick={form.handleSubmit(onSubmit)}
                        >
                            {pending ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Envoi en cours...
                                </>
                            ) : (
                                <>
                                    <Send className="mr-2 h-4 w-4" />
                                    Envoyer la demande
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </Form>
        </div>
    )
}