// Types pour les éléments de paie

export const TypeElement = {
    SALAIRE_BASE: 'SALAIRE_BASE',
    PRIME_FIXE: 'PRIME_FIXE',
    PRIME_VARIABLE: 'PRIME_VARIABLE',
    HEURES_SUPPLEMENTAIRES: 'HEURES_SUPPLEMENTAIRES',
    DEDUCTION_ABSENCE: 'DEDUCTION_ABSENCE',
    DEDUCTION_AUTRE: 'DEDUCTION_AUTRE',
    COTISATION_SOCIALE: 'COTISATION_SOCIALE',
    INDEMNITE: 'INDEMNITE',
    IMPOT: 'IMPOT',
    AUTRE: 'AUTRE'
} as const;

export type TypeElementType = typeof TypeElement[keyof typeof TypeElement];

export const ModeCalcul = {
    TAUX: 'TAUX',
    MONTANT: 'MONTANT',
    // BAREME: 'BAREME',
    PAR_JOUR: 'PAR_JOUR',
    PAR_HEURE: 'PAR_HEURE'
    // FORMULE: 'FORMULE'
} as const;

export type ModeCalculType = typeof ModeCalcul[keyof typeof ModeCalcul];

export interface ElementPaie {
    id?: number;
    type: TypeElementType | '';
    sousType: string;
    libelle: string;
    montant: string;
    modeCalcul: ModeCalculType | '';
    taux: string;
    base: string;
    description: string;
    soumisIR: boolean;
    soumisCNSS: boolean;
    // formule?: string;
    // periodicite?: string;
    // nbHeures?: string;
    // nbJours?: string;
    // tarifHeure?: string;
    // tarifJour?: string;
    // tauxBase?: string;
    // seuilMin?: string;
}

export interface StepConfig {
    number: number;
    title: string;
    completed: boolean;
}

export interface ValidationError {
    field: string;
    message: string;
}
