# Module Fiche de Paie - Gestion des Rôles

Ce module gère l'affichage des fiches de paie selon les rôles utilisateur.

## Structure des Permissions

### Rôle RH/ADMIN
- **canViewAllEmployees**: ✅ Peut voir tous les employés par département
- **canViewOwnPayslips**: ✅ Peut voir ses propres fiches de paie
- **canGeneratePayslips**: ✅ Peut générer des fiches de paie
- **canManagePayrollElements**: ✅ Peut gérer les éléments de paie
- **canExportPayslips**: ✅ Peut exporter les données

### Rôle MANAGER
- **canViewOwnPayslips**: ✅ Peut voir ses propres fiches de paie

### Rôle EMPLOYE
- **canViewOwnPayslips**: ✅ Peut voir ses propres fiches de paie

## Composants

### FichePaiePage
Composant principal qui gère l'affichage selon le rôle :
- **RH/ADMIN** → Affiche `EmployeesParDepartement`
- **EMPLOYE/MANAGER** → Affiche `EmployeePayslipsList`

### EmployeePayslipsList
Composant pour que les employés consultent leurs fiches de paie :
- Liste les fiches de paie de l'employé connecté
- Permet le téléchargement en PDF
- Affiche les informations de salaire (brut/net)
- Montre le statut de chaque fiche

### Hook useFichePaieRolePermissions
Hook personnalisé pour gérer les permissions :
```typescript
const { userRole, permissions, hasAnyPermission, isRH, isEmployee } = useFichePaieRolePermissions();
```

## API Endpoints

Le composant `EmployeePayslipsList` utilise l'endpoint :
```
GET /api/fiche-paie/employe/{employeId}
```

## Utilisation

```tsx
import { FichePaiePage } from '@/modules/fiche-de-paie';

// Le composant gère automatiquement l'affichage selon le rôle
<FichePaiePage />
```

## Types de Données

```typescript
interface FichePaie {
    id: string;
    mois: string;
    annee: number;
    salaireBrut: number;
    salaireNet: number;
    dateGeneration: string;
    statut: 'GENEREE' | 'ENVOYEE' | 'VALIDEE';
    isPaid: boolean;
}
```
