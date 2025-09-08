# Système d'Alertes Temps Réel avec WebSocket

## 🎯 Objectif

Ce système implémente une couche de communication WebSocket complète pour les alertes RH, conforme aux spécifications backend. L'interface utilisateur devient entièrement réactive : les listes d'alertes et compteurs se mettent à jour automatiquement et instantanément sans recharger la page.

## 🏗️ Architecture

Le système suit strictement l'architecture backend :

- **API REST** : Utilisée pour toutes les actions de modification (Créer, Mettre à jour, Supprimer)
- **WebSockets (STOMP)** : Utilisés uniquement pour écouter les notifications push du serveur

### Flux de données

```
Action UI → API REST → Backend met à jour → Notification WebSocket → UI réagit
```

## 📁 Structure des fichiers

```
src/modules/Alertes/
├── types/
│   └── index.ts                    # Types strictement conformes aux spécifications backend
├── services/
│   └── WebSocketService.ts         # Service singleton pour gérer les connexions STOMP
├── hooks/
│   └── useAlerts.ts                # Hook React personnalisé pour les alertes temps réel
├── contexts/
│   └── WebSocketProvider.tsx       # Provider pour initialiser la connexion WebSocket
└── components/
    └── AlertsDashboard.tsx          # Composant d'exemple démontrant l'usage
```

## 🔧 Configuration Backend

### Endpoints WebSocket
- **Connexion** : `/ws`
- **Notifications personnelles** : `/topic/alertes/employe/{userId}`
- **Notifications globales** : `/topic/alertes/global` (managers/admins)
- **Mises à jour stats** : `/topic/alertes/stats`

### Format des messages

#### AlerteDTO (Création/Mise à jour)
```json
{
  "id": 123,
  "message": "Nouvelle alerte de test",
  "type": "INFO|WARNING|ERROR",
  "status": "UNREAD|READ",
  "timestamp": "2025-09-08T14:30:00Z",
  "userId": 456
}
```

#### Suppression d'alerte
```json
{
  "action": "DELETE",
  "alerteId": 123
}
```

#### Mise à jour des statistiques
```json
{
  "type": "STATS_UPDATE",
  "userId": 456,
  "timestamp": "2025-09-08T14:30:00Z"
}
```

## 🚀 Utilisation

### 1. Configuration de base

```tsx
import { WebSocketProvider } from '@/modules/Alertes/contexts/WebSocketProvider';
import { AlertsDashboard } from '@/modules/Alertes/components/AlertsDashboard';

function App() {
  return (
    <WebSocketProvider>
      <AlertsDashboard />
    </WebSocketProvider>
  );
}
```

### 2. Utilisation du hook useAlerts

```tsx
import { useAlerts } from '@/modules/Alertes/hooks/useAlerts';

function MonComposant() {
  const {
    alerts,           // Liste des alertes
    unreadCount,      // Nombre d'alertes non lues
    connectionStatus, // Statut de la connexion WebSocket
    loading,          // État de chargement
    error,            // Erreur éventuelle
    markAsRead,       // Fonction pour marquer comme lu
    deleteAlert,      // Fonction pour supprimer
    refresh,          // Fonction pour rafraîchir
    isConnected       // Boolean connexion active
  } = useAlerts();

  const handleMarkAsRead = async (id: number) => {
    try {
      await markAsRead(id);
      // L'UI se met à jour automatiquement via WebSocket
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  return (
    <div>
      <h2>Alertes ({unreadCount} non lues)</h2>
      {alerts.map(alert => (
        <div key={alert.id}>
          <p>{alert.message}</p>
          <button onClick={() => handleMarkAsRead(alert.id)}>
            Marquer comme lu
          </button>
        </div>
      ))}
    </div>
  );
}
```

### 3. Service WebSocket bas niveau

```tsx
import { webSocketService } from '@/modules/Alertes/services/WebSocketService';

// Configuration
webSocketService.configure({
  url: 'http://localhost:8080/ws',
  reconnectInterval: 3000,
  maxReconnectAttempts: 10
});

// Connexion
await webSocketService.connect();

// Abonnements
webSocketService.subscribeToUserAlerts(userId);
webSocketService.subscribeToStatsUpdates();
if (isManager) {
  webSocketService.subscribeToGlobalAlerts();
}

// Callbacks
const unsubscribe = webSocketService.onAlerte((alerte) => {
  console.log('Nouvelle alerte:', alerte);
});
```

## 🎨 Composants fournis

### AlertsDashboard
Composant de démonstration complet qui montre :
- Liste des alertes avec statut temps réel
- Compteurs mis à jour automatiquement
- Boutons d'action (marquer lu, supprimer)
- Indicateur de statut de connexion WebSocket
- Gestion des erreurs et états de chargement

## ⚡ Fonctionnalités temps réel

### ✅ Ce qui fonctionne automatiquement
- ✅ Nouvelles alertes apparaissent instantanément
- ✅ Changements de statut (lu/non lu) se reflètent immédiatement
- ✅ Suppressions d'alertes mises à jour en temps réel
- ✅ Compteurs recalculés automatiquement
- ✅ Reconnexion automatique en cas de perte de connexion
- ✅ Gestion des erreurs et états de chargement

### 🚫 Ce qui reste manuel
- 🚫 Appels API REST pour les actions (par design)
- 🚫 Chargement initial des données (via API REST)

## 🛠️ Règles d'implémentation

### ✅ Règles respectées
1. **Passivité** : Le hook n'anticipe jamais les changements, il attend les notifications WebSocket
2. **Séparation** : API REST pour les actions, WebSocket pour les notifications
3. **Agnosticisme** : Le service WebSocket ne connaît rien à la logique métier
4. **Robustesse** : Gestion des erreurs, reconnexion automatique, type guards

### ⚠️ Points d'attention
- Le localStorage doit contenir `userData` avec l'ID utilisateur
- Le `userRole` doit être défini pour les abonnements globaux
- Le backend doit être configuré avec les topics mentionnés
- Les types doivent correspondre exactement aux spécifications

## 🐛 Debug et monitoring

Le service inclut des logs détaillés :
```
[WebSocket] Connexion établie
[WebSocket] Abonné au topic: /topic/alertes/employe/123
[WebSocket Debug] Message reçu sur topic...
```

Pour activer/désactiver les logs de debug STOMP, modifier la méthode `debug` dans `WebSocketService`.

## 🔄 Cycle de vie

1. **Initialisation** : Connexion WebSocket + abonnements aux topics
2. **Fonctionnement** : Écoute passive des notifications + actions REST
3. **Nettoyage** : Désabonnements + fermeture de connexion au démontage

Le système garantit une gestion propre des ressources avec cleanup automatique.
