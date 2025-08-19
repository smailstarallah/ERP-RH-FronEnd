import {
    Building2,
    DollarSign,
    TrendingUp,
    Users,
    FileText,
    HelpCircle,
    Percent,
    CalendarDays,
    Clock,
    Gift,
    Scissors,
    CalendarX
} from 'lucide-react';
import { TypeElement, ModeCalcul, type TypeElementType, type ModeCalculType } from '../types/ElementPaieTypes';

export const typeConfig: Record<TypeElementType, {
    label: string;
    color: string;
    icon: any;
    category: string;
    description: string;
    example: string;
}> = {
    [TypeElement.SALAIRE_BASE]: {
        label: 'Salaire de base',
        color: 'bg-emerald-600',
        icon: Building2,
        category: 'Rémunération',
        description: 'Montant fixe mensuel prévu dans le contrat de travail',
        example: 'Ex : 8 000 DH / mois'
    },
    [TypeElement.PRIME_FIXE]: {
        label: 'Prime fixe',
        color: 'bg-blue-600',
        icon: DollarSign,
        category: 'Compléments',
        description: 'Prime régulière versée chaque mois, sans variation',
        example: 'Ex : Prime d’ancienneté, prime de fonction'
    },
    [TypeElement.PRIME_VARIABLE]: {
        label: 'Prime variable',
        color: 'bg-purple-600',
        icon: TrendingUp,
        category: 'Performance',
        description: 'Prime dont le montant dépend des résultats ou objectifs atteints',
        example: 'Ex : Prime de rendement, prime commerciale'
    },
    [TypeElement.HEURES_SUPPLEMENTAIRES]: {
        label: 'Heures supplémentaires',
        color: 'bg-orange-600',
        icon: Clock,
        category: 'Temps de travail',
        description: 'Rémunération des heures effectuées au-delà de la durée normale',
        example: 'Ex : Heures de soirée, heures de week-end'
    },
    [TypeElement.DEDUCTION_ABSENCE]: {
        label: 'Retenue pour absence',
        color: 'bg-red-600',
        icon: CalendarX,
        category: 'Retenues',
        description: 'Déduction appliquée en cas d’absence non justifiée',
        example: 'Ex : Absence injustifiée, retard répété'
    },
    [TypeElement.DEDUCTION_AUTRE]: {
        label: 'Autre retenue',
        color: 'bg-red-500',
        icon: Scissors,
        category: 'Retenues',
        description: 'Retenues diverses appliquées sur le salaire',
        example: 'Ex : Avance sur salaire, remboursement de prêt'
    },
    [TypeElement.COTISATION_SOCIALE]: {
        label: 'Cotisations sociales',
        color: 'bg-indigo-600',
        icon: Users,
        category: 'Charges sociales',
        description: 'Prélèvements obligatoires destinés à la sécurité sociale',
        example: 'Ex : CNSS, AMO, retraite'
    },
    [TypeElement.IMPOT]: {
        label: 'Impôts et taxes',
        color: 'bg-slate-600',
        icon: FileText,
        category: 'Fiscalité',
        description: 'Prélèvements fiscaux appliqués sur le revenu salarial',
        example: 'Ex : IR, taxe professionnelle'
    },
    [TypeElement.AUTRE]: {
        label: 'Élément personnalisé',
        color: 'bg-gray-600',
        icon: HelpCircle,
        category: 'Divers',
        description: 'Éléments spécifiques propres à l’organisation',
        example: 'Ex : Frais de transport, tickets restaurant'
    },
    [TypeElement.INDEMNITE]: {
        label: 'Indemnités',
        color: 'bg-teal-600',
        icon: Gift,
        category: 'Avantages',
        description: 'Montants compensatoires ou avantages accordés aux salariés',
        example: 'Ex : Indemnité de déplacement, indemnité de licenciement'
    }
};

export const modeCalculConfig: Record<ModeCalculType, {
    label: string;
    icon: any;
    color: string;
    bgColor: string;
    borderColor: string;
    focusColor: string;
    description: string;
    help: string;
}> = {
    [ModeCalcul.MONTANT]: {
        label: 'Montant fixe',
        icon: DollarSign,
        color: 'emerald',
        bgColor: 'from-emerald-50 to-green-50',
        borderColor: 'border-emerald-200',
        focusColor: 'focus:border-emerald-500 focus:ring-emerald-200',
        description: 'Un montant qui ne change jamais',
        help: 'Choisissez cette option si le montant est toujours le même chaque mois'
    },
    [ModeCalcul.TAUX]: {
        label: 'Pourcentage',
        icon: Percent,
        color: 'blue',
        bgColor: 'from-blue-50 to-sky-50',
        borderColor: 'border-blue-200',
        focusColor: 'focus:border-blue-500 focus:ring-blue-200',
        description: 'Un pourcentage appliqué sur une base',
        help: 'Par exemple: 3% du salaire de base, ou 20% des ventes'
    },
    // [ModeCalcul.BAREME]: {
    //     label: 'Grille progressive',
    //     icon: TrendingUp,
    //     color: 'purple',
    //     bgColor: 'from-purple-50 to-violet-50',
    //     borderColor: 'border-purple-200',
    //     focusColor: 'focus:border-purple-500 focus:ring-purple-200',
    //     description: 'Calcul par tranches (comme l\'impôt)',
    //     help: 'Utilisé pour les calculs complexes avec plusieurs niveaux'
    // },
    [ModeCalcul.PAR_JOUR]: {
        label: 'Par jour',
        icon: CalendarDays,
        color: 'amber',
        bgColor: 'from-amber-50 to-yellow-50',
        borderColor: 'border-amber-200',
        focusColor: 'focus:border-amber-500 focus:ring-amber-200',
        description: 'Tarif journalier multiplié par le nombre de jours',
        help: 'Idéal pour calculer les primes ou pénalités selon les jours travaillés.'
    },
    [ModeCalcul.PAR_HEURE]: {
        label: 'Par heure',
        icon: Clock,
        color: 'cyan',
        bgColor: 'from-cyan-50 to-teal-50',
        borderColor: 'border-cyan-200',
        focusColor: 'focus:border-cyan-500 focus:ring-cyan-200',
        description: 'Tarif horaire multiplié par les heures travaillées',
        help: 'Utile pour les heures supplémentaires ou les contrats horaires.'
    }//,
    // [ModeCalcul.FORMULE]: {
    //     label: 'Formule personnalisée',
    //     icon: Code,
    //     color: 'pink',
    //     bgColor: 'from-pink-50 to-rose-50',
    //     borderColor: 'border-pink-200',
    //     focusColor: 'focus:border-pink-500 focus:ring-pink-200',
    //     description: 'Calcul défini via une formule',
    //     help: 'Permet d\'entrer une équation spécifique pour des cas complexes.'
    // }
};

export const getTypeConfig = (type: TypeElementType) => typeConfig[type];
export const getModeCalculConfig = (mode: ModeCalculType) => modeCalculConfig[mode];
