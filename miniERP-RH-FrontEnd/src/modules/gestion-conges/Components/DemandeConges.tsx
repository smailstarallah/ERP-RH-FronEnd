"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import { useTransition } from "react"
import { motion } from "framer-motion"
import { type DateRange } from "react-day-picker"
import { Loader2, CalendarIcon, Send } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Textarea } from "@/components/ui/textarea" // <-- Import du Textarea
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"

// --- Schema de validation Zod (inchangé) ---
const DemandeCongeFormSchema = z.object({
    dateDebut: z.date("La date de début est requise."),
    dateFin: z.date("La date de fin est requise."),
    typeConge: z.string().min(1, "Veuillez sélectionner un type de congé."),
    motif: z.string().min(1, "Le motif est requis.").max(500, "Le motif ne doit pas dépasser 500 caractères."),
}).refine((data) => data.dateFin >= data.dateDebut, {
    message: "La date de fin doit être postérieure ou égale à la date de début.",
    path: ["dateFin"],
});

type DemandeCongeFormValues = z.infer<typeof DemandeCongeFormSchema>

interface TypeConge {
    id: number;
    nom: string;
}

// --- Le Composant Formulaire Amélioré ---
export function DemandeCongeForm() {
    const [isPending, startTransition] = useTransition()
    const [typeConges, setTypeConges] = React.useState<TypeConge[]>([])
    const [isLoadingTypes, setIsLoadingTypes] = React.useState(true)
    const [dateRange, setDateRange] = React.useState<DateRange | undefined>()

    const form = useForm<DemandeCongeFormValues>({
        resolver: zodResolver(DemandeCongeFormSchema),
        defaultValues: {
            typeConge: "",
            motif: "",
        },
    })

    // --- Logique métier (inchangée) ---
    React.useEffect(() => {
        if (dateRange?.from) form.setValue("dateDebut", dateRange.from)
        if (dateRange?.to) form.setValue("dateFin", dateRange.to)
    }, [dateRange, form])

    React.useEffect(() => {
        const fetchTypeConges = async () => {
            try {
                setIsLoadingTypes(true)
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
                    setIsLoadingTypes(false)
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
                    { id: 1, nom: "Congé annuel juste testing" },
                    { id: 2, nom: "Congé maladie" },
                    { id: 3, nom: "Congé formation" }
                ]);
            } finally {
                setIsLoadingTypes(false);
            }
        };

        fetchTypeConges();
    }, []);

    function onSubmit(data: DemandeCongeFormValues) {
        startTransition(async () => {
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

    // --- Rendu du composant ---
    return (
        <Card className="w-full max-w-2xl mx-auto shadow-lg border-gray-200/80">
            <CardHeader className="bg-blue-600 text-white rounded-t-lg py-4">
                <div className="flex items-center space-x-4">
                    <CalendarIcon className="h-7 w-7" />
                    <div>
                        <CardTitle className="text-xl font-bold">Nouvelle demande de congé</CardTitle>
                        <CardDescription className="text-blue-200">Remplissez ce formulaire pour soumettre votre demande.</CardDescription>
                    </div>
                </div>
            </CardHeader>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <CardContent className="p-6 space-y-8">
                            {/* Étape 1: Période */}
                            <FormField
                                control={form.control}
                                name="dateDebut"
                                render={() => (
                                    <FormItem>
                                        <FormLabel className="text-base font-semibold text-gray-800">Période du congé</FormLabel>
                                        <FormControl>
                                            <div className="flex justify-center p-2 border rounded-lg bg-gray-50/80">
                                                <Calendar
                                                    mode="range"
                                                    selected={dateRange}
                                                    onSelect={setDateRange}
                                                    className="bg-white"
                                                />
                                            </div>
                                        </FormControl>
                                        <FormMessage className="pt-1" />
                                    </FormItem>
                                )}
                            />

                            {/* Étape 2: Type de congé */}
                            <FormField
                                control={form.control}
                                name="typeConge"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-base font-semibold text-gray-800">Type de congé</FormLabel>
                                        <FormControl>
                                            {isLoadingTypes ? (
                                                <Skeleton className="h-10 w-full" />
                                            ) : (
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <SelectTrigger className="h-11">
                                                        <SelectValue placeholder="Sélectionnez un type" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {typeConges.map((type) => (
                                                            <SelectItem key={type.id} value={String(type.id)}>
                                                                {type.nom}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            )}
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Étape 3: Motif */}
                            <FormField
                                control={form.control}
                                name="motif"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-base font-semibold text-gray-800">Motif de la demande</FormLabel>
                                        <FormControl>
                                            <Textarea // <-- Utilisation du Textarea
                                                placeholder="Veuillez préciser le motif de votre absence (ex: vacances, raison familiale...)"
                                                className="resize-none"
                                                rows={4}
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </CardContent>

                        <CardFooter className="p-6 pt-2">
                            <Button type="submit" disabled={isPending} className="w-full bg-blue-600 hover:bg-blue-700 h-11 text-base">
                                {isPending ? (
                                    <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Envoi en cours...</>
                                ) : (
                                    <><Send className="mr-2 h-5 w-5" /> Envoyer ma demande</>
                                )}
                            </Button>
                        </CardFooter>
                    </motion.div>
                </form>
            </Form>
        </Card>
    )
}