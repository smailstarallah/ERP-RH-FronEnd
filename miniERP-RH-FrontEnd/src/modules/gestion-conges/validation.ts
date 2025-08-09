import z from "zod"

export const DemandeCongeFormSchema = z.object({
    dateDebut: z.date().min(new Date(), "Date de début doit être aujourd'hui ou dans le futur"),
    dateFin: z.date(),
    typeConge: z.string().min(1, "Type de congé est requis"),
    motif: z.string().min(5, "Motif est requis"),
}).refine(
    (data) => data.dateFin >= data.dateDebut,
    {
        message: "Date de fin doit être après la date de début",
        path: ["dateFin"],
    }
)

export type DemandeCongeForm = z.infer<typeof DemandeCongeFormSchema>



