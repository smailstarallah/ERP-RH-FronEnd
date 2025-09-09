// Export principal du module de fiche de paie
export { default as FichePaiePage } from './FichePaiePage';

// Exports des types
export * from './types/ElementPaieTypes';

// Exports des configurations
export * from './config/ElementPaieConfig';

// Exports du hook
export { useElementPaieForm } from './hooks/useElementPaieForm';

// Exports des composants principaux
export { default as EmployeesParDepartement } from './Components/EmployeesParDepartement';
export { default as EmployeePayslipsList } from './Components/EmployeePayslipsList';

// Exports des hooks
export { useFichePaieRolePermissions } from './hooks/useFichePaieRolePermissions';

// Exports des composants de configuration (legacy)
export { FormHeader } from './Components/FormHeader';
export { ProgressIndicator } from './Components/ProgressIndicator';
export { ValidationErrors } from './Components/ValidationErrors';
export { TypeSelector } from './Components/TypeSelector';
export { GeneralInfo } from './Components/GeneralInfo';
export { ModeCalculSelector } from './Components/ModeCalculSelector';
export { Description } from './Components/Description';
export { ActionButtons } from './Components/ActionButtons';
export { SummaryPanel } from './Components/SummaryPanel';
export { HelpGuide } from './Components/HelpGuide';

// Exports des composants de mode de calcul
export { MontantFixe } from './Components/ModeCalcul/MontantFixe';
export { Pourcentage } from './Components/ModeCalcul/Pourcentage';
export { Bareme } from './Components/ModeCalcul/Bareme';
export { ParJour } from './Components/ModeCalcul/ParJour';
export { ParHeure } from './Components/ModeCalcul/ParHeure';
export { Formule } from './Components/ModeCalcul/Formule';
