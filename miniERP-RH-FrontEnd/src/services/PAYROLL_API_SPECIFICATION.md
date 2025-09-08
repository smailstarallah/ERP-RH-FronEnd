# Spécification API - Module Paie Dashboard

## Endpoint
```
GET /api/fiche-paie/dashboard
```

## Headers Requis
```json
{
  "Authorization": "Bearer <token>",
  "Content-Type": "application/json"
}
```

## Format de Réponse JSON Attendu

```json
{
  "kpis": {
    "masseSalariale": {
      "value": 1250000,
      "change": 0.0
    },
    "pourcentageCA": {
      "value": 28.5,
      "change": -0.8
    },
    "tauxErreur": {
      "value": 2.1,
      "change": -15.2
    },
    "coutBulletin": {
      "value": 45,
      "change": 5.3
    }
  },
  "salaryStructure": [
    {
      "category": "Salaires de base",
      "montant": 850000,
      "pourcentage": 68
    },
    {
      "category": "Charges patronales",
      "montant": 200000,
      "pourcentage": 16
    },
    {
      "category": "Primes et avantages",
      "montant": 125000,
      "pourcentage": 10
    },
    {
      "category": "Heures supplémentaires",
      "montant": 75000,
      "pourcentage": 6
    }
  ],
  "salaryEvolution": [
    {
      "month": "Jan",
      "masseSalariale": 1180000,
      "budget": 1200000,
      "coutParEmploye": 7800
    },
    {
      "month": "Fév",
      "masseSalariale": 1205000,
      "budget": 1210000,
      "coutParEmploye": 7950
    },
    {
      "month": "Mar",
      "masseSalariale": 1225000,
      "budget": 1220000,
      "coutParEmploye": 8100
    },
    {
      "month": "Avr",
      "masseSalariale": 1240000,
      "budget": 1230000,
      "coutParEmploye": 8200
    },
    {
      "month": "Mai",
      "masseSalariale": 1250000,
      "budget": 1240000,
      "coutParEmploye": 8250
    },
    {
      "month": "Juin",
      "masseSalariale": 1260000,
      "budget": 1250000,
      "coutParEmploye": 8300
    }
  ],
  "salaryDistribution": [
    {
      "departement": "Développement",
      "nombreEmployes": 25,
      "masseSalariale": 375000,
      "salaireMoyen": 15000,
      "tranches": {
        "moins_5000": 0,
        "_5000_8000": 3,
        "_8000_12000": 8,
        "_12000_20000": 12,
        "plus_20000": 2
      }
    },
    {
      "departement": "Marketing",
      "nombreEmployes": 18,
      "masseSalariale": 198000,
      "salaireMoyen": 11000,
      "tranches": {
        "moins_5000": 1,
        "_5000_8000": 4,
        "_8000_12000": 7,
        "_12000_20000": 5,
        "plus_20000": 1
      }
    },
    {
      "departement": "RH",
      "nombreEmployes": 12,
      "masseSalariale": 132000,
      "salaireMoyen": 11000,
      "tranches": {
        "moins_5000": 0,
        "_5000_8000": 3,
        "_8000_12000": 5,
        "_12000_20000": 4,
        "plus_20000": 0
      }
    },
    {
      "departement": "Comptabilité",
      "nombreEmployes": 15,
      "masseSalariale": 135000,
      "salaireMoyen": 9000,
      "tranches": {
        "moins_5000": 2,
        "_5000_8000": 5,
        "_8000_12000": 6,
        "_12000_20000": 2,
        "plus_20000": 0
      }
    },
    {
      "departement": "Commercial",
      "nombreEmployes": 22,
      "masseSalariale": 242000,
      "salaireMoyen": 11000,
      "tranches": {
        "moins_5000": 1,
        "_5000_8000": 6,
        "_8000_12000": 8,
        "_12000_20000": 6,
        "plus_20000": 1
      }
    },
    {
      "departement": "Support",
      "nombreEmployes": 8,
      "masseSalariale": 56000,
      "salaireMoyen": 7000,
      "tranches": {
        "moins_5000": 1,
        "_5000_8000": 5,
        "_8000_12000": 2,
        "_12000_20000": 0,
        "plus_20000": 0
      }
    }
  ],
  "payrollQuality": [
    {
      "month": "Jan",
      "tauxErreur": 3.2,
      "tempsTraitement": 4.5
    },
    {
      "month": "Fév",
      "tauxErreur": 2.8,
      "tempsTraitement": 4.2
    },
    {
      "month": "Mar",
      "tauxErreur": 2.5,
      "tempsTraitement": 4.0
    },
    {
      "month": "Avr",
      "tauxErreur": 2.3,
      "tempsTraitement": 3.8
    },
    {
      "month": "Mai",
      "tauxErreur": 2.1,
      "tempsTraitement": 3.5
    },
    {
      "month": "Juin",
      "tauxErreur": 1.8,
      "tempsTraitement": 3.2
    }
  ],
  "variableElements": [
    {
      "element": "Primes de performance",
      "budget": 150000,
      "consomme": 145000,
      "taux": 97,
      "impact": "Conforme"
    },
    {
      "element": "Heures supplémentaires",
      "budget": 80000,
      "consomme": 95000,
      "taux": 119,
      "impact": "Dépassement"
    },
    {
      "element": "Indemnités de transport",
      "budget": 45000,
      "consomme": 42000,
      "taux": 93,
      "impact": "Sous-consommé"
    },
    {
      "element": "Formation",
      "budget": 25000,
      "consomme": 28000,
      "taux": 112,
      "impact": "Dépassement"
    }
  ],
  "complianceActions": [
    {
      "id": "1",
      "title": "Mise à jour CNSS",
      "description": "Déclaration mensuelle CNSS en retard de 3 jours",
      "priority": "urgent",
      "deadline": "15/06/2024",
      "progress": 60,
      "actions": [
        "Finaliser les calculs des cotisations",
        "Vérifier les données employés",
        "Soumettre la déclaration avant le 20/06"
      ]
    },
    {
      "id": "2",
      "title": "Optimisation fiscale",
      "description": "Révision des avantages en nature pour réduire l'IR",
      "priority": "opportunity",
      "actions": [
        "Analyser les avantages actuels",
        "Proposer des alternatives optimisées",
        "Simuler l'impact fiscal"
      ]
    },
    {
      "id": "3",
      "title": "Conformité réglementaire",
      "description": "Audit interne des processus paie terminé avec succès",
      "priority": "success",
      "actions": [
        "Documenter les bonnes pratiques",
        "Partager les résultats avec la direction",
        "Planifier le prochain audit"
      ]
    }
  ],
  "lastUpdate": "2024-06-15T10:30:00Z",
  "status": "success"
}
```

## Description des Champs Clés

### � salaryStructure (Section Structure des Coûts)

Cette section est utilisée pour le graphique en camembert "Structure des Coûts". Chaque élément doit contenir :

- `category` : Nom de la catégorie (string) - **Exemples recommandés** :
  - "Salaires de base"
  - "Charges patronales"
  - "Primes et avantages"
  - "Heures supplémentaires"
  - "Indemnités"
  - "Cotisations sociales"
- `montant` : Montant en DH (number)
- `pourcentage` : Pourcentage du total (number)

**Important** : La somme des pourcentages doit égaler 100%.

### �🔍 salaryDistribution (Section Distribution par Tranches Salariales)

Cette section est **CRUCIALE** pour la carte "Distribution par Tranches Salariales". Chaque département doit contenir :

- `departement` : Nom du département (string)
- `nombreEmployes` : Total des employés du département (number)
- `masseSalariale` : Masse salariale totale du département en DH (number)
- `salaireMoyen` : Salaire moyen du département en DH (number)
- `tranches` : **Objet obligatoire** contenant la répartition exacte par tranche :
  - `moins_5000` : Nombre d'employés avec salaire < 5000 DH
  - `_5000_8000` : Nombre d'employés avec salaire entre 5000-8000 DH
  - `_8000_12000` : Nombre d'employés avec salaire entre 8000-12000 DH
  - `_12000_20000` : Nombre d'employés avec salaire entre 12000-20000 DH
  - `plus_20000` : Nombre d'employés avec salaire > 20000 DH

### ⚠️ Points Importants pour le Back-End

1. **Cohérence des données** : La somme des tranches doit égaler `nombreEmployes`
   ```
   tranches.moins_5000 + tranches._5000_8000 + tranches._8000_12000 + tranches._12000_20000 + tranches.plus_20000 = nombreEmployes
   ```

2. **Calculs automatiques recommandés** :
   - `salaireMoyen` = `masseSalariale` / `nombreEmployes`
   - Les tranches doivent être calculées à partir des salaires réels des employés

3. **Types de données** :
   - Tous les montants en nombres entiers (DH)
   - Les pourcentages en nombres décimaux
   - Les dates au format ISO 8601

4. **Gestion d'erreur** :
   - Retourner HTTP 401 si token expiré
   - Retourner HTTP 403 si permissions insuffisantes
   - Retourner HTTP 500 en cas d'erreur serveur

### 📊 Exemple de Requête SQL pour les Tranches Salariales

```sql
SELECT 
    d.nom as departement,
    COUNT(e.id) as nombreEmployes,
    SUM(e.salaire) as masseSalariale,
    AVG(e.salaire) as salaireMoyen,
    SUM(CASE WHEN e.salaire < 5000 THEN 1 ELSE 0 END) as moins_5000,
    SUM(CASE WHEN e.salaire >= 5000 AND e.salaire < 8000 THEN 1 ELSE 0 END) as "_5000_8000",
    SUM(CASE WHEN e.salaire >= 8000 AND e.salaire < 12000 THEN 1 ELSE 0 END) as "_8000_12000",
    SUM(CASE WHEN e.salaire >= 12000 AND e.salaire < 20000 THEN 1 ELSE 0 END) as "_12000_20000",
    SUM(CASE WHEN e.salaire >= 20000 THEN 1 ELSE 0 END) as plus_20000
FROM departements d
LEFT JOIN employes e ON d.id = e.departement_id
WHERE e.statut = 'actif'
GROUP BY d.id, d.nom
ORDER BY d.nom;
```

## 🔧 Configuration Front-End

L'endpoint est configuré dans `src/services/payrollApi.ts` :
- URL : `${API_BASE_URL}/api/fiche-paie/dashboard`
- Méthode : GET
- Headers : Authorization Bearer token requis
- Timeout : 10 secondes
- Retry : 3 tentatives en cas d'erreur
