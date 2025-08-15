import {
    Building2,
    DollarSign,
    TrendingUp,
    Calculator,
    AlertTriangle,
    Users,
    FileText,
    HelpCircle,
    Percent,
    CalendarDays,
    Clock,
    Code
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
        description: 'Le salaire mensuel fixe inscrit dans le contrat de travail',
        example: 'Ex: 8 000 DH/mois'
    },
    [TypeElement.PRIME_FIXE]: {
        label: 'Prime mensuelle',
        color: 'bg-blue-600',
        icon: DollarSign,
        category: 'Complément',
        description: 'Une prime qui ne change pas d\'un mois à l\'autre',
        example: 'Ex: Prime d\'ancienneté, Prime de fonction'
    },
    [TypeElement.PRIME_VARIABLE]: {
        label: 'Prime variable',
        color: 'bg-purple-600',
        icon: TrendingUp,
        category: 'Performance',
        description: 'Une prime qui change selon les résultats ou la performance',
        example: 'Ex: Prime de rendement, Prime commerciale'
    },
    [TypeElement.HEURES_SUPPLEMENTAIRES]: {
        label: 'Heures supplémentaires',
        color: 'bg-orange-600',
        icon: Calculator,
        category: 'Temps',
        description: 'Paiement des heures travaillées au-delà de l\'horaire normal',
        example: 'Ex: Heures le soir, week-end'
    },
    [TypeElement.DEDUCTION_ABSENCE]: {
        label: 'Retenue pour absence',
        color: 'bg-red-600',
        icon: AlertTriangle,
        category: 'Retenues',
        description: 'Déduction du salaire en cas d\'absence non justifiée',
        example: 'Ex: Absence injustifiée, Retard'
    },
    [TypeElement.DEDUCTION_AUTRE]: {
        label: 'Autre retenue',
        color: 'bg-red-500',
        icon: AlertTriangle,
        category: 'Retenues',
        description: 'Autres déductions diverses du salaire',
        example: 'Ex: Avance sur salaire, Prêt'
    },
    [TypeElement.COTISATION_SOCIALE]: {
        label: 'Cotisation sociale',
        color: 'bg-indigo-600',
        icon: Users,
        category: 'Social',
        description: 'Cotisations obligatoires pour la sécurité sociale',
        example: 'Ex: CNSS, AMO, Retraite'
    },
    [TypeElement.IMPOT]: {
        label: 'Impôt et taxes',
        color: 'bg-slate-600',
        icon: FileText,
        category: 'Fiscal',
        description: 'Impôts et taxes prélevés sur le salaire',
        example: 'Ex: IR, Taxe professionnelle'
    },
    [TypeElement.AUTRE]: {
        label: 'Élément personnalisé',
        color: 'bg-gray-600',
        icon: HelpCircle,
        category: 'Autre',
        description: 'Pour des éléments spécifiques à votre organisation',
        example: 'Ex: Frais de transport, Ticket restaurant'
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
    [ModeCalcul.BAREME]: {
        label: 'Grille progressive',
        icon: TrendingUp,
        color: 'purple',
        bgColor: 'from-purple-50 to-violet-50',
        borderColor: 'border-purple-200',
        focusColor: 'focus:border-purple-500 focus:ring-purple-200',
        description: 'Calcul par tranches (comme l\'impôt)',
        help: 'Utilisé pour les calculs complexes avec plusieurs niveaux'
    },
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
    },
    [ModeCalcul.FORMULE]: {
        label: 'Formule personnalisée',
        icon: Code,
        color: 'pink',
        bgColor: 'from-pink-50 to-rose-50',
        borderColor: 'border-pink-200',
        focusColor: 'focus:border-pink-500 focus:ring-pink-200',
        description: 'Calcul défini via une formule',
        help: 'Permet d\'entrer une équation spécifique pour des cas complexes.'
    }
};

export const getTypeConfig = (type: TypeElementType) => typeConfig[type];
export const getModeCalculConfig = (mode: ModeCalculType) => modeCalculConfig[mode];
