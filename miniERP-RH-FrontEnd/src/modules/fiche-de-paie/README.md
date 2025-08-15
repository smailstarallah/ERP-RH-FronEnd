# Module Élément de Paie

## 📋 Vue d'ensemble

Module refactorisé pour la configuration des éléments de paie avec une architecture modulaire et maintenable.

## 🚀 Utilisation

### Import Simple
```typescript
import ElementPaieForm from '@/modules/fiche-de-paie';

function App() {
  return <ElementPaieForm />;
}
```

### Import Granulaire
```typescript
import { 
  TypeSelector, 
  MontantFixe, 
  useElementPaieForm 
} from '@/modules/fiche-de-paie';
```

## 📂 Structure

```
fiche-de-paie/
├── types/ElementPaieTypes.ts          # Types centralisés
├── config/ElementPaieConfig.ts        # Configurations UI
├── hooks/useElementPaieForm.ts        # Logique métier
├── Components/
│   ├── AjouterElementPaieRefactored.tsx  # Composant principal
│   ├── FormHeader.tsx                 # En-tête
│   ├── ProgressIndicator.tsx          # Progression
│   ├── ValidationErrors.tsx           # Erreurs
│   ├── TypeSelector.tsx               # Sélection type
│   ├── GeneralInfo.tsx                # Infos générales
│   ├── ModeCalculSelector.tsx         # Sélection mode calcul
│   ├── Description.tsx                # Description
│   ├── ActionButtons.tsx              # Boutons d'action
│   ├── SummaryPanel.tsx               # Panneau résumé
│   ├── HelpGuide.tsx                  # Guide d'aide
│   └── ModeCalcul/
│       ├── MontantFixe.tsx           # Calcul montant fixe
│       ├── Pourcentage.tsx           # Calcul pourcentage
│       ├── ParJour.tsx               # Calcul par jour
│       ├── ParHeure.tsx              # Calcul par heure
│       └── Formule.tsx               # Calcul par formule
└── index.ts                          # Export principal
```

## 🔧 Types de Calcul

- **MONTANT** : Montant fixe
- **TAUX** : Pourcentage d'une base
- **BAREME** : Grille progressive
- **PAR_JOUR** : Tarif par jour
- **PAR_HEURE** : Tarif par heure
- **FORMULE** : Calcul personnalisé

## 🎯 Fonctionnalités

- ✅ Progression automatique par étapes
- ✅ Validation en temps réel
- ✅ Prévisualisation des calculs
- ✅ Interface responsive
- ✅ Architecture modulaire

## 🛠️ Dépendances

- React + TypeScript
- shadcn/ui
- Tailwind CSS
- Lucide React (icônes)
