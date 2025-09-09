/* eslint-disable react/forbid-dom-props, @typescript-eslint/no-explicit-any */
import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { motion } from "framer-motion";
import {
    Download,
    Plus,
    Copy,
    Trash2,
    FileText,
    Building2,
    Users,
    BadgeCheck,
    Calendar,
    FilePenLine,
    Upload,
    AlertCircle
} from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

// shadcn/ui imports
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";

/**
 * Context for signature and cachet data
 */
interface SignatureContextType {
    signatureDataUrl: string | null;
    cachetDataUrl: string | null;
}

const SignatureContext = React.createContext<SignatureContextType>({
    signatureDataUrl: null,
    cachetDataUrl: null
});

/**
 * Interface definitions for TypeScript
 */
interface DocumentField {
    key: string;
    label: string;
    type: 'text' | 'textarea' | 'date' | 'boolean' | 'number' | 'month';
    placeholder?: string;
    required?: boolean;
    validation?: (value: any) => string | null;
}

interface DocumentData {
    [key: string]: any;
}

interface DocumentTemplate {
    id: string;
    label: string;
    icon: React.ReactNode;
    fields: DocumentField[];
    defaults: DocumentData;
    render: (data: DocumentData) => React.ReactNode;
}

interface HRDocument {
    id: string;
    name: string;
    templateId: string;
    data: DocumentData;
    createdAt: string;
    updatedAt: string;
}

interface LogoContextType {
    logoDataUrl: string | null;
    onUpload: (file: File) => Promise<void>;
    clearLogo: () => void;
}

interface ValidationError {
    field: string;
    message: string;
}

// Constants
const A4_WIDTH = 794; // px @96dpi
const A4_HEIGHT = 1123; // px @96dpi
const MAX_DOCUMENTS = 5;
const STORAGE_KEYS = {
    DOCS: 'hrdocs_docs',
    LOGO: 'hrdocs_logo',
    SIGNATURE: 'hrdocs_signature',
    CACHET: 'hrdocs_cachet'
} as const;

// Utility functions
const todayISO = (): string => new Date().toISOString().slice(0, 10);

const formatDateFR = (iso: string): string => {
    try {
        return new Date(iso).toLocaleDateString("fr-FR", {
            day: "2-digit",
            month: "long",
            year: "numeric"
        });
    } catch {
        return iso;
    }
};

const validateRequired = (value: any): string | null => {
    if (!value || (typeof value === 'string' && value.trim() === '')) {
        return 'Ce champ est requis';
    }
    return null;
};

const validateNumber = (value: any): string | null => {
    if (value && isNaN(Number(value))) {
        return 'Doit être un nombre valide';
    }
    return null;
};

// Template definitions with enhanced validation
const TEMPLATES: DocumentTemplate[] = [
    {
        id: "offre",
        label: "Lettre d'offre",
        icon: <BadgeCheck className="w-4 h-4" />,
        fields: [
            {
                key: "societe",
                label: "Société",
                type: "text",
                placeholder: "DIGITALIA SOLOTIONS",
                required: true,
                validation: validateRequired
            },
            {
                key: "nom",
                label: "Nom du candidat",
                type: "text",
                placeholder: "Fatima El Amrani",
                required: true,
                validation: validateRequired
            },
            {
                key: "poste",
                label: "Poste",
                type: "text",
                placeholder: "Développeur(se) Java",
                required: true,
                validation: validateRequired
            },
            {
                key: "salaire",
                label: "Salaire brut mensuel",
                type: "text",
                placeholder: "12 000 MAD",
                required: true,
                validation: validateRequired
            },
            {
                key: "dateDebut",
                label: "Date de début",
                type: "date",
                placeholder: todayISO(),
                required: true,
                validation: validateRequired
            },
            {
                key: "lieu",
                label: "Lieu de travail",
                type: "text",
                placeholder: "Casablanca",
                required: true,
                validation: validateRequired
            },
            {
                key: "conditions",
                label: "Conditions particulières",
                type: "textarea",
                placeholder: "Période d'essai de 3 mois..."
            },
        ],
        defaults: {
            societe: "DIGITALIA SOLOTIONS",
            nom: "",
            poste: "",
            salaire: "",
            dateDebut: todayISO(),
            lieu: "Casablanca",
            conditions: "Période d'essai de 3 mois, renouvelable une fois.",
        },
        render: (d: DocumentData) => (
            <div className="text-[12px] leading-relaxed">
                <Header societe={d.societe} />
                <h1 className="text-xl font-semibold mt-6">Lettre d'offre</h1>
                <p className="mt-4">{formatDateFR(todayISO())}</p>
                <p className="mt-4">À l'attention de {d.nom},</p>
                <p className="mt-4">
                    Nous sommes heureux de vous proposer le poste de <b>{d.poste}</b> au sein de <b>{d.societe}</b>.
                    Votre rémunération sera de <b>{d.salaire}</b>. La date de prise de fonction est prévue le <b>{formatDateFR(d.dateDebut)}</b>
                    à <b>{d.lieu}</b>.
                </p>
                <p className="mt-3">Conditions particulières : {d.conditions}</p>
                <Signature />
            </div>
        ),
    },
    {
        id: "contrat",
        label: "Contrat de travail (simple)",
        icon: <FileText className="w-4 h-4" />,
        fields: [
            { key: "societe", label: "Société", type: "text", required: true, validation: validateRequired },
            { key: "nom", label: "Nom salarié", type: "text", required: true, validation: validateRequired },
            { key: "cin", label: "CIN", type: "text", required: true, validation: validateRequired },
            { key: "poste", label: "Poste", type: "text", required: true, validation: validateRequired },
            { key: "salaire", label: "Salaire brut mensuel", type: "text", required: true, validation: validateRequired },
            { key: "horaire", label: "Horaire hebdo", type: "text", placeholder: "44h", required: true, validation: validateRequired },
            { key: "dateDebut", label: "Date d'entrée", type: "date", required: true, validation: validateRequired },
            { key: "lieu", label: "Lieu", type: "text", required: true, validation: validateRequired },
            { key: "clauses", label: "Clauses", type: "textarea", placeholder: "Confidentialité, non-concurrence (si applicable)..." },
        ],
        defaults: {
            societe: "DIGITALIA SOLOTIONS",
            nom: "",
            cin: "",
            poste: "",
            salaire: "",
            horaire: "44h",
            dateDebut: todayISO(),
            lieu: "Casablanca",
            clauses: "Le salarié s'engage à respecter la confidentialité...",
        },
        render: (d: DocumentData) => (
            <div className="text-[12px] leading-relaxed">
                <Header societe={d.societe} />
                <h1 className="text-xl font-semibold mt-6">Contrat de travail</h1>
                <p className="mt-4">Entre <b>{d.societe}</b> (l'Employeur) et <b>{d.nom}</b> (CIN {d.cin}).</p>
                <p className="mt-3">Poste: <b>{d.poste}</b> — Lieu: <b>{d.lieu}</b> — Horaire: <b>{d.horaire}</b>.</p>
                <p className="mt-3">Rémunération: <b>{d.salaire}</b> à compter du <b>{formatDateFR(d.dateDebut)}</b>.</p>
                <p className="mt-3">Clauses: {d.clauses}</p>
                <Signature />
            </div>
        ),
    },
    {
        id: "attestation",
        label: "Attestation de travail",
        icon: <Building2 className="w-4 h-4" />,
        fields: [
            { key: "societe", label: "Société", type: "text", required: true, validation: validateRequired },
            { key: "nom", label: "Nom salarié", type: "text", required: true, validation: validateRequired },
            { key: "cin", label: "CIN", type: "text", required: true, validation: validateRequired },
            { key: "poste", label: "Poste occupé", type: "text", required: true, validation: validateRequired },
            { key: "dateDebut", label: "Date d'entrée", type: "date", required: true, validation: validateRequired },
            { key: "encours", label: "Toujours en poste?", type: "boolean" },
            { key: "dateSortie", label: "Date de sortie (si non)", type: "date" },
            { key: "lieu", label: "Ville de signature", type: "text", placeholder: "Casablanca", required: true, validation: validateRequired },
        ],
        defaults: {
            societe: "DIGITALIA SOLOTIONS",
            nom: "",
            cin: "",
            poste: "",
            dateDebut: todayISO(),
            encours: true,
            dateSortie: "",
            lieu: "Casablanca",
        },
        render: (d: DocumentData) => (
            <div className="text-[12px] leading-relaxed">
                <Header societe={d.societe} />
                <h1 className="text-xl font-semibold mt-6">Attestation de travail</h1>
                <p className="mt-4">
                    Nous soussignés <b>{d.societe}</b> attestons que <b>{d.nom}</b> (CIN {d.cin})
                    est/était employé(e) en qualité de <b>{d.poste}</b> depuis le {formatDateFR(d.dateDebut)}
                    {d.encours ? " et occupe toujours ce poste." : ` jusqu'au ${formatDateFR(d.dateSortie)}.`}
                </p>
                <p className="mt-3">Fait à {d.lieu}, le {formatDateFR(todayISO())}.</p>
                <Signature cachetHint />
            </div>
        ),
    },
    {
        id: "conge",
        label: "Demande de congé",
        icon: <Calendar className="w-4 h-4" />,
        fields: [
            { key: "nom", label: "Nom salarié", type: "text", required: true, validation: validateRequired },
            { key: "matricule", label: "Matricule", type: "text", required: true, validation: validateRequired },
            { key: "type", label: "Type de congé", type: "text", placeholder: "Annuel / Maladie / Exceptionnel", required: true, validation: validateRequired },
            { key: "du", label: "Du", type: "date", required: true, validation: validateRequired },
            { key: "au", label: "Au", type: "date", required: true, validation: validateRequired },
            { key: "motif", label: "Motif (optionnel)", type: "textarea" },
            { key: "responsable", label: "Responsable", type: "text", required: true, validation: validateRequired },
        ],
        defaults: {
            nom: "",
            matricule: "",
            type: "Annuel",
            du: todayISO(),
            au: todayISO(),
            motif: "",
            responsable: "",
        },
        render: (d: DocumentData) => (
            <div className="text-[12px] leading-relaxed">
                <h1 className="text-xl font-semibold">Demande de congé</h1>
                <table className="mt-4 w-full text-left">
                    <tbody>
                        <tr><td className="font-medium pr-4">Nom</td><td>{d.nom}</td></tr>
                        <tr><td className="font-medium pr-4">Matricule</td><td>{d.matricule}</td></tr>
                        <tr><td className="font-medium pr-4">Type</td><td>{d.type}</td></tr>
                        <tr><td className="font-medium pr-4">Période</td><td>Du {formatDateFR(d.du)} au {formatDateFR(d.au)}</td></tr>
                    </tbody>
                </table>
                {d.motif && <p className="mt-3"><span className="font-medium">Motif:</span> {d.motif}</p>}
                <p className="mt-6">Signature du salarié: _________________________</p>
                <p className="mt-2">Visa responsable ({d.responsable}): __________________</p>
            </div>
        ),
    }
];

// Sub-components
interface HeaderProps {
    societe: string;
}

const Header: React.FC<HeaderProps> = ({ societe }) => {
    const { logoDataUrl } = useLogo();
    return (
        <div className="flex items-center gap-3 border-b pb-3">
            {logoDataUrl ? (
                <img
                    src={logoDataUrl}
                    alt="logo"
                    className="w-12 h-12 object-contain"
                />
            ) : (
                <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center">
                    <FilePenLine className="w-6 h-6 text-gray-500" />
                </div>
            )}
            <div>
                <p className="text-sm font-medium">{societe || "Votre société"}</p>
                <p className="text-[11px] text-gray-500">Document RH</p>
            </div>
        </div>
    );
};

interface SignatureProps {
    cachetHint?: boolean;
    signatureDataUrl?: string | null;
    cachetDataUrl?: string | null;
}

const Signature: React.FC<SignatureProps> = ({ cachetHint = false, signatureDataUrl: propSignature, cachetDataUrl: propCachet }) => {
    const context = React.useContext(SignatureContext);
    const signatureDataUrl = propSignature || context.signatureDataUrl;
    const cachetDataUrl = propCachet || context.cachetDataUrl;

    return (
        <div className="mt-8">
            <p>Signature et cachet{cachetHint ? " de l'entreprise" : ""} :</p>
            <div className="flex items-end justify-between min-h-16 border rounded-xl mt-2 p-3 bg-gray-50">
                {/* Zone signature */}
                <div className="flex-1 text-center">
                    {signatureDataUrl ? (
                        <img
                            src={signatureDataUrl}
                            alt="Signature"
                            className="max-h-12 mx-auto object-contain"
                        />
                    ) : (
                        <div className="text-gray-400 text-sm">Signature</div>
                    )}
                </div>

                {/* Zone cachet */}
                <div className="flex-1 text-center">
                    {cachetDataUrl ? (
                        <img
                            src={cachetDataUrl}
                            alt="Cachet"
                            className="max-h-12 mx-auto object-contain"
                        />
                    ) : (
                        <div className="text-gray-400 text-sm">Cachet</div>
                    )}
                </div>
            </div>
        </div>
    );
};

// Logo hook
const useLogo = (): LogoContextType => {
    const [logoDataUrl, setLogoDataUrl] = useState<string | null>(null);

    useEffect(() => {
        try {
            const saved = localStorage.getItem(STORAGE_KEYS.LOGO);
            if (saved) setLogoDataUrl(saved);
        } catch (error) {
            console.warn('Erreur lors du chargement du logo:', error);
        }
    }, []);

    const onUpload = useCallback(async (file: File): Promise<void> => {
        return new Promise((resolve, reject) => {
            // Validation du fichier
            if (!file.type.startsWith('image/')) {
                reject(new Error('Le fichier doit être une image'));
                return;
            }

            if (file.size > 5 * 1024 * 1024) { // 5MB limit
                reject(new Error('Le fichier ne doit pas dépasser 5MB'));
                return;
            }

            const reader = new FileReader();
            reader.onload = () => {
                try {
                    const dataUrl = reader.result as string;
                    localStorage.setItem(STORAGE_KEYS.LOGO, dataUrl);
                    setLogoDataUrl(dataUrl);
                    resolve();
                } catch (error) {
                    reject(error);
                }
            };
            reader.onerror = () => reject(new Error('Erreur lors de la lecture du fichier'));
            reader.readAsDataURL(file);
        });
    }, []);

    const clearLogo = useCallback(() => {
        try {
            localStorage.removeItem(STORAGE_KEYS.LOGO);
            setLogoDataUrl(null);
        } catch (error) {
            console.warn('Erreur lors de la suppression du logo:', error);
        }
    }, []);

    return { logoDataUrl, onUpload, clearLogo };
};

// Signature hook
const useSignature = (): LogoContextType => {
    const [signatureDataUrl, setSignatureDataUrl] = useState<string | null>(null);

    useEffect(() => {
        try {
            const saved = localStorage.getItem(STORAGE_KEYS.SIGNATURE);
            if (saved) setSignatureDataUrl(saved);
        } catch (error) {
            console.warn('Erreur lors du chargement de la signature:', error);
        }
    }, []);

    const onUpload = useCallback(async (file: File): Promise<void> => {
        return new Promise((resolve, reject) => {
            // Validation du fichier
            if (!file.type.startsWith('image/')) {
                reject(new Error('Le fichier doit être une image'));
                return;
            }

            if (file.size > 2 * 1024 * 1024) { // 2MB limit
                reject(new Error('Le fichier ne doit pas dépasser 2MB'));
                return;
            }

            const reader = new FileReader();
            reader.onload = () => {
                try {
                    const dataUrl = reader.result as string;
                    localStorage.setItem(STORAGE_KEYS.SIGNATURE, dataUrl);
                    setSignatureDataUrl(dataUrl);
                    resolve();
                } catch (error) {
                    reject(error);
                }
            };
            reader.onerror = () => reject(new Error('Erreur lors de la lecture du fichier'));
            reader.readAsDataURL(file);
        });
    }, []);

    const clearLogo = useCallback(() => {
        try {
            localStorage.removeItem(STORAGE_KEYS.SIGNATURE);
            setSignatureDataUrl(null);
        } catch (error) {
            console.warn('Erreur lors de la suppression de la signature:', error);
        }
    }, []);

    return { logoDataUrl: signatureDataUrl, onUpload, clearLogo };
};

// Cachet hook
const useCachet = (): LogoContextType => {
    const [cachetDataUrl, setCachetDataUrl] = useState<string | null>(null);

    useEffect(() => {
        try {
            const saved = localStorage.getItem(STORAGE_KEYS.CACHET);
            if (saved) setCachetDataUrl(saved);
        } catch (error) {
            console.warn('Erreur lors du chargement du cachet:', error);
        }
    }, []);

    const onUpload = useCallback(async (file: File): Promise<void> => {
        return new Promise((resolve, reject) => {
            // Validation du fichier
            if (!file.type.startsWith('image/')) {
                reject(new Error('Le fichier doit être une image'));
                return;
            }

            if (file.size > 2 * 1024 * 1024) { // 2MB limit
                reject(new Error('Le fichier ne doit pas dépasser 2MB'));
                return;
            }

            const reader = new FileReader();
            reader.onload = () => {
                try {
                    const dataUrl = reader.result as string;
                    localStorage.setItem(STORAGE_KEYS.CACHET, dataUrl);
                    setCachetDataUrl(dataUrl);
                    resolve();
                } catch (error) {
                    reject(error);
                }
            };
            reader.onerror = () => reject(new Error('Erreur lors de la lecture du fichier'));
            reader.readAsDataURL(file);
        });
    }, []);

    const clearLogo = useCallback(() => {
        try {
            localStorage.removeItem(STORAGE_KEYS.CACHET);
            setCachetDataUrl(null);
        } catch (error) {
            console.warn('Erreur lors de la suppression du cachet:', error);
        }
    }, []);

    return { logoDataUrl: cachetDataUrl, onUpload, clearLogo };
};

// Utility functions
const byId = (arr: DocumentTemplate[], id: string): DocumentTemplate | undefined =>
    arr.find((x) => x.id === id);

const clampDocs = (docs: HRDocument[]): HRDocument[] => docs.slice(0, MAX_DOCUMENTS);

const generateDocumentId = (): string => {
    return `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Validation function
const validateDocument = (doc: HRDocument, template: DocumentTemplate): ValidationError[] => {
    const errors: ValidationError[] = [];

    template.fields.forEach(field => {
        const value = doc.data[field.key];

        if (field.required && field.validation) {
            const error = field.validation(value);
            if (error) {
                errors.push({ field: field.key, message: error });
            }
        }
    });

    return errors;
};

// Empty state component
const EmptyState: React.FC = () => (
    <div className="h-[70vh] flex flex-col items-center justify-center text-center text-gray-500">
        <FileText className="w-10 h-10 mb-3" />
        <p className="text-sm">Créez un nouveau fichier depuis la colonne de gauche.</p>
        <p className="text-xs mt-2">Maximum {MAX_DOCUMENTS} documents simultanés</p>
    </div>
);

// Main component
const HRDocumentsManager: React.FC = () => {
    const [docs, setDocs] = useState<HRDocument[]>(() => {
        try {
            const saved = localStorage.getItem(STORAGE_KEYS.DOCS);
            return saved ? JSON.parse(saved) : [];
        } catch (error) {
            console.warn('Erreur lors du chargement des documents:', error);
            return [];
        }
    });

    const [activeId, setActiveId] = useState<string | null>(null);
    const [selectedTemplateId, setSelectedTemplateId] = useState<string>(TEMPLATES[0].id);
    const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
    const [isExporting, setIsExporting] = useState<boolean>(false);
    const [uploadError, setUploadError] = useState<string | null>(null);

    const { logoDataUrl, onUpload, clearLogo } = useLogo();
    const { logoDataUrl: signatureDataUrl, onUpload: onSignatureUpload, clearLogo: clearSignature } = useSignature();
    const { logoDataUrl: cachetDataUrl, onUpload: onCachetUpload, clearLogo: clearCachet } = useCachet();
    const previewRef = useRef<HTMLDivElement>(null);

    // Additional state for upload errors
    const [signatureUploadError, setSignatureUploadError] = useState<string | null>(null);
    const [cachetUploadError, setCachetUploadError] = useState<string | null>(null);

    const activeDoc = useMemo(() =>
        docs.find((d) => d.id === activeId) || null,
        [docs, activeId]
    );

    const currentTemplate = useMemo(() =>
        byId(TEMPLATES, activeDoc?.templateId || selectedTemplateId) || TEMPLATES[0],
        [activeDoc?.templateId, selectedTemplateId]
    );

    // Save to localStorage when docs change
    useEffect(() => {
        try {
            localStorage.setItem(STORAGE_KEYS.DOCS, JSON.stringify(docs));
        } catch (error) {
            console.warn('Erreur lors de la sauvegarde:', error);
        }
    }, [docs]);

    // Validate active document
    useEffect(() => {
        if (activeDoc && currentTemplate) {
            const errors = validateDocument(activeDoc, currentTemplate);
            setValidationErrors(errors);
        } else {
            setValidationErrors([]);
        }
    }, [activeDoc, currentTemplate]);

    const addNew = useCallback(() => {
        if (docs.length >= MAX_DOCUMENTS) {
            alert(`Vous ne pouvez créer que ${MAX_DOCUMENTS} documents maximum.`);
            return;
        }

        const tpl = byId(TEMPLATES, selectedTemplateId) || TEMPLATES[0];
        const id = generateDocumentId();
        const name = `${tpl.label} #${docs.filter((d) => d.templateId === tpl.id).length + 1}`;
        const now = new Date().toISOString();

        const payload: HRDocument = {
            id,
            name,
            templateId: tpl.id,
            data: { ...tpl.defaults },
            createdAt: now,
            updatedAt: now,
        };

        const next = clampDocs([payload, ...docs]);
        setDocs(next);
        setActiveId(payload.id);
    }, [docs, selectedTemplateId]);

    const duplicate = useCallback(() => {
        if (!activeDoc) return;
        if (docs.length >= MAX_DOCUMENTS) {
            alert(`Vous ne pouvez créer que ${MAX_DOCUMENTS} documents maximum.`);
            return;
        }

        const id = generateDocumentId();
        const name = activeDoc.name + " (copie)";
        const now = new Date().toISOString();

        const payload: HRDocument = {
            ...activeDoc,
            id,
            name,
            createdAt: now,
            updatedAt: now
        };

        const next = clampDocs([payload, ...docs]);
        setDocs(next);
        setActiveId(id);
    }, [activeDoc, docs]);

    const remove = useCallback(() => {
        if (!activeDoc) return;

        if (confirm(`Êtes-vous sûr de vouloir supprimer "${activeDoc.name}" ?`)) {
            const next = docs.filter((d) => d.id !== activeDoc.id);
            setDocs(next);
            setActiveId(next[0]?.id || null);
        }
    }, [activeDoc, docs]);

    const updateField = useCallback((key: string, value: any) => {
        if (!activeId) return;

        setDocs((prev) => prev.map((d) =>
            d.id === activeId
                ? {
                    ...d,
                    data: { ...d.data, [key]: value },
                    updatedAt: new Date().toISOString()
                }
                : d
        ));
    }, [activeId]);

    const updateName = useCallback((value: string) => {
        if (!activeId) return;

        setDocs((prev) => prev.map((d) =>
            d.id === activeId
                ? {
                    ...d,
                    name: value,
                    updatedAt: new Date().toISOString()
                }
                : d
        ));
    }, [activeId]);

    const exportPDF = useCallback(async () => {
        if (!previewRef.current || !activeDoc) return;

        setIsExporting(true);
        try {
            const canvas = await html2canvas(previewRef.current, {
                scale: 2,
                useCORS: true,
                backgroundColor: "#ffffff",
                logging: false
            });

            const imgData = canvas.toDataURL("image/png");
            const pdf = new jsPDF({
                orientation: "p",
                unit: "pt",
                format: "a4"
            });

            const pageWidth = pdf.internal.pageSize.getWidth();
            const pageHeight = pdf.internal.pageSize.getHeight();

            pdf.addImage(imgData, "PNG", 0, 0, pageWidth, pageHeight);

            const filename = `${activeDoc.name.replace(/[^a-z0-9-_ ]/gi, "_")}.pdf`;
            pdf.save(filename);
        } catch (error) {
            console.error('Erreur lors de l\'export PDF:', error);
            alert('Erreur lors de la génération du PDF. Veuillez réessayer.');
        } finally {
            setIsExporting(false);
        }
    }, [activeDoc]);

    const handleLogoUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setUploadError(null);
        try {
            await onUpload(file);
        } catch (error) {
            setUploadError(error instanceof Error ? error.message : 'Erreur lors du chargement du logo');
        }

        // Reset input
        event.target.value = '';
    }, [onUpload]);

    const handleSignatureUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setSignatureUploadError(null);
        try {
            await onSignatureUpload(file);
        } catch (error) {
            setSignatureUploadError(error instanceof Error ? error.message : 'Erreur lors du chargement de la signature');
        }

        // Reset input
        event.target.value = '';
    }, [onSignatureUpload]);

    const handleCachetUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setCachetUploadError(null);
        try {
            await onCachetUpload(file);
        } catch (error) {
            setCachetUploadError(error instanceof Error ? error.message : 'Erreur lors du chargement du cachet');
        }

        // Reset input
        event.target.value = '';
    }, [onCachetUpload]);

    const getFieldError = useCallback((fieldKey: string): string | null => {
        const error = validationErrors.find(e => e.field === fieldKey);
        return error ? error.message : null;
    }, [validationErrors]);

    const canExport = activeDoc && validationErrors.length === 0;

    // Preview container styles for PDF generation
    const previewStyles = {
        width: `${A4_WIDTH * 0.7}px`,
        height: `${A4_HEIGHT * 0.7}px`,
        transform: 'scale(0.7)',
        transformOrigin: 'top center'
    };

    return (
        <div className="w-full min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto p-4 md:p-6">
                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">
                        Gestionnaire de Documents RH
                    </h1>
                    <p className="text-gray-600">
                        Créez et gérez vos documents RH avec des modèles prêts à l'emploi
                    </p>
                </div>

                <div className="flex flex-col lg:flex-row gap-6">
                    {/* Colonne gauche: Gestion & formulaires */}
                    <div className="lg:w-[420px] space-y-4">
                        {/* Section création */}
                        <Card className="shadow-sm border-0">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <Plus className="w-5 h-5 text-blue-600" />
                                    Nouveau document
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium">Choisir un modèle</Label>
                                    <Select value={selectedTemplateId} onValueChange={setSelectedTemplateId}>
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Sélectionner un modèle" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {TEMPLATES.map((t) => (
                                                <SelectItem key={t.id} value={t.id}>
                                                    <div className="flex items-center gap-2">
                                                        {t.icon}
                                                        <span>{t.label}</span>
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <Button
                                    className="w-full"
                                    onClick={addNew}
                                    disabled={docs.length >= MAX_DOCUMENTS}
                                >
                                    <Plus className="w-4 h-4 mr-2" />
                                    Créer un document ({docs.length}/{MAX_DOCUMENTS})
                                </Button>
                            </CardContent>
                        </Card>

                        {/* Section logo et signatures */}
                        <Card className="shadow-sm border-0">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-base flex items-center gap-2">
                                    <Upload className="w-4 h-4 text-gray-600" />
                                    Éléments visuels
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {/* Logo */}
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium">Logo d'entreprise</Label>
                                    <div className="flex items-center gap-2">
                                        <input
                                            id="logo"
                                            type="file"
                                            accept="image/*"
                                            onChange={handleLogoUpload}
                                            className="text-sm flex-1"
                                            title="Choisir un fichier de logo"
                                        />
                                        {logoDataUrl && (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={clearLogo}
                                            >
                                                Retirer
                                            </Button>
                                        )}
                                    </div>
                                    {uploadError && (
                                        <Alert variant="destructive">
                                            <AlertCircle className="h-4 w-4" />
                                            <AlertDescription>{uploadError}</AlertDescription>
                                        </Alert>
                                    )}
                                    {logoDataUrl && (
                                        <div className="flex items-center gap-2 p-2 bg-green-50 rounded-lg">
                                            <img
                                                src={logoDataUrl}
                                                alt="Logo"
                                                className="w-8 h-8 object-contain"
                                            />
                                            <span className="text-sm text-green-700">Logo chargé</span>
                                        </div>
                                    )}
                                </div>

                                {/* Signature */}
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium">Signature numérique</Label>
                                    <div className="flex items-center gap-2">
                                        <input
                                            id="signature"
                                            type="file"
                                            accept="image/*"
                                            onChange={handleSignatureUpload}
                                            className="text-sm flex-1"
                                            title="Choisir un fichier de signature"
                                        />
                                        {signatureDataUrl && (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={clearSignature}
                                            >
                                                Retirer
                                            </Button>
                                        )}
                                    </div>
                                    {signatureUploadError && (
                                        <Alert variant="destructive">
                                            <AlertCircle className="h-4 w-4" />
                                            <AlertDescription>{signatureUploadError}</AlertDescription>
                                        </Alert>
                                    )}
                                    {signatureDataUrl && (
                                        <div className="flex items-center gap-2 p-2 bg-blue-50 rounded-lg">
                                            <img
                                                src={signatureDataUrl}
                                                alt="Signature"
                                                className="h-6 max-w-16 object-contain"
                                            />
                                            <span className="text-sm text-blue-700">Signature chargée</span>
                                        </div>
                                    )}
                                </div>

                                {/* Cachet */}
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium">Cachet d'entreprise</Label>
                                    <div className="flex items-center gap-2">
                                        <input
                                            id="cachet"
                                            type="file"
                                            accept="image/*"
                                            onChange={handleCachetUpload}
                                            className="text-sm flex-1"
                                            title="Choisir un fichier de cachet"
                                        />
                                        {cachetDataUrl && (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={clearCachet}
                                            >
                                                Retirer
                                            </Button>
                                        )}
                                    </div>
                                    {cachetUploadError && (
                                        <Alert variant="destructive">
                                            <AlertCircle className="h-4 w-4" />
                                            <AlertDescription>{cachetUploadError}</AlertDescription>
                                        </Alert>
                                    )}
                                    {cachetDataUrl && (
                                        <div className="flex items-center gap-2 p-2 bg-purple-50 rounded-lg">
                                            <img
                                                src={cachetDataUrl}
                                                alt="Cachet"
                                                className="w-8 h-8 object-contain"
                                            />
                                            <span className="text-sm text-purple-700">Cachet chargé</span>
                                        </div>
                                    )}
                                </div>

                                <p className="text-xs text-gray-500">
                                    Formats supportés: JPG, PNG, GIF. Taille max: 5MB (logo), 2MB (signature/cachet)
                                </p>
                            </CardContent>
                        </Card>

                        {/* Liste des documents */}
                        {docs.length > 0 && (
                            <Card className="shadow-sm border-0">
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-base flex items-center gap-2">
                                        <FileText className="w-4 h-4 text-gray-600" />
                                        Mes documents ({docs.length})
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2">
                                        {docs.map((doc) => {
                                            const template = byId(TEMPLATES, doc.templateId);
                                            const hasErrors = activeDoc?.id === doc.id && validationErrors.length > 0;

                                            return (
                                                <button
                                                    key={doc.id}
                                                    onClick={() => setActiveId(doc.id)}
                                                    className={`w-full text-left p-3 rounded-lg border transition-all duration-200 ${activeId === doc.id
                                                        ? "border-blue-500 bg-blue-50 shadow-sm"
                                                        : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                                                        }`}
                                                >
                                                    <div className="flex items-start justify-between">
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center gap-2 mb-1">
                                                                {template?.icon}
                                                                <span className="text-sm font-medium truncate">
                                                                    {doc.name}
                                                                </span>
                                                                {hasErrors && (
                                                                    <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                                                                )}
                                                            </div>
                                                            <div className="text-xs text-gray-500">
                                                                {template?.label} • {new Date(doc.updatedAt).toLocaleDateString('fr-FR')}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Formulaire d'édition */}
                        {activeDoc && (
                            <Card className="shadow-sm border-0">
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-base flex items-center gap-2">
                                        <FilePenLine className="w-4 h-4 text-gray-600" />
                                        Édition — {currentTemplate.label}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {/* Nom du document */}
                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium">Nom du document</Label>
                                        <Input
                                            value={activeDoc.name}
                                            onChange={(e) => updateName(e.target.value)}
                                            placeholder="Ex: Contrat Jean Dupont 2025"
                                            className="w-full"
                                        />
                                    </div>

                                    {/* Champs dynamiques */}
                                    {currentTemplate.fields.map((field) => {
                                        const value = activeDoc.data[field.key] ?? "";
                                        const error = getFieldError(field.key);

                                        return (
                                            <div key={field.key} className="space-y-2">
                                                <Label className="text-sm font-medium flex items-center gap-1">
                                                    {field.label}
                                                    {field.required && <span className="text-red-500">*</span>}
                                                </Label>

                                                {field.type === "textarea" ? (
                                                    <Textarea
                                                        rows={3}
                                                        value={value}
                                                        placeholder={field.placeholder}
                                                        onChange={(e) => updateField(field.key, e.target.value)}
                                                        className={`w-full ${error ? 'border-red-300 focus:border-red-500' : ''}`}
                                                    />
                                                ) : field.type === "boolean" ? (
                                                    <div className="flex items-center gap-3">
                                                        <Switch
                                                            checked={!!value}
                                                            onCheckedChange={(checked) => updateField(field.key, checked)}
                                                        />
                                                        <span className="text-sm">
                                                            {value ? "Oui" : "Non"}
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <Input
                                                        type={field.type || "text"}
                                                        value={value}
                                                        placeholder={field.placeholder}
                                                        onChange={(e) => updateField(field.key, e.target.value)}
                                                        className={`w-full ${error ? 'border-red-300 focus:border-red-500' : ''}`}
                                                    />
                                                )}

                                                {error && (
                                                    <p className="text-xs text-red-600 flex items-center gap-1">
                                                        <AlertCircle className="w-3 h-3" />
                                                        {error}
                                                    </p>
                                                )}
                                            </div>
                                        );
                                    })}

                                    {/* Actions */}
                                    <div className="flex items-center gap-2 pt-4 border-t">
                                        <Button
                                            variant="outline"
                                            onClick={duplicate}
                                            disabled={docs.length >= MAX_DOCUMENTS}
                                            className="flex-1"
                                        >
                                            <Copy className="w-4 h-4 mr-2" />
                                            Dupliquer
                                        </Button>
                                        <Button
                                            variant="destructive"
                                            onClick={remove}
                                            className="flex-1"
                                        >
                                            <Trash2 className="w-4 h-4 mr-2" />
                                            Supprimer
                                        </Button>
                                    </div>

                                    {/* Résumé des erreurs */}
                                    {validationErrors.length > 0 && (
                                        <Alert variant="destructive">
                                            <AlertCircle className="h-4 w-4" />
                                            <AlertDescription>
                                                {validationErrors.length} erreur{validationErrors.length > 1 ? 's' : ''} à corriger avant l'export
                                            </AlertDescription>
                                        </Alert>
                                    )}
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Colonne droite: Prévisualisation & export */}
                    <div className="flex-1">
                        <Card className="shadow-sm border-0">
                            <CardHeader className="pb-3">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-lg flex items-center gap-2">
                                        <FileText className="w-5 h-5 text-blue-600" />
                                        Prévisualisation A4
                                    </CardTitle>
                                    <div className="flex items-center gap-2">
                                        <Button
                                            onClick={exportPDF}
                                            disabled={!canExport || isExporting}
                                            className="bg-blue-600 hover:bg-blue-700"
                                        >
                                            <Download className="w-4 h-4 mr-2" />
                                            {isExporting ? 'Export...' : 'Télécharger PDF'}
                                        </Button>
                                    </div>
                                </div>
                                {!canExport && activeDoc && (
                                    <p className="text-sm text-amber-600 mt-2">
                                        Corrigez les erreurs pour activer l'export PDF
                                    </p>
                                )}
                            </CardHeader>
                            <CardContent>
                                {!activeDoc ? (
                                    <EmptyState />
                                ) : (
                                    <motion.div
                                        key={activeDoc.id}
                                        initial={{ opacity: 0, y: 12 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.3, ease: "easeOut" }}
                                        className="flex justify-center"
                                    >
                                        <div className="relative">
                                            {/* Required for PDF generation with specific dimensions */}
                                            {/* eslint-disable-next-line */}
                                            <div
                                                ref={previewRef}
                                                className="bg-white shadow-lg border mx-auto relative p-6"
                                                style={previewStyles}
                                            >
                                                <SignatureContext.Provider value={{ signatureDataUrl, cachetDataUrl }}>
                                                    {currentTemplate.render(activeDoc.data)}
                                                </SignatureContext.Provider>
                                            </div>

                                            {/* Indicateur d'erreurs sur la preview */}
                                            {validationErrors.length > 0 && (
                                                <div className="absolute top-2 right-2 bg-red-100 border border-red-300 rounded-lg p-2">
                                                    <div className="flex items-center gap-1 text-red-700">
                                                        <AlertCircle className="w-4 h-4" />
                                                        <span className="text-xs font-medium">
                                                            {validationErrors.length} erreur{validationErrors.length > 1 ? 's' : ''}
                                                        </span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>
                                )}

                                {activeDoc && (
                                    <div className="mt-4 text-center space-y-2">
                                        <p className="text-xs text-gray-500">
                                            Prévisualisation à 70% • Format A4 (210×297mm)
                                        </p>
                                        <p className="text-xs text-gray-400">
                                            Modifié le {new Date(activeDoc.updatedAt).toLocaleString('fr-FR')}
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HRDocumentsManager;