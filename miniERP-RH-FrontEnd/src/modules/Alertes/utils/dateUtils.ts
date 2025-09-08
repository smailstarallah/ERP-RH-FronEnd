// Utilitaires pour la gestion des dates dans le module Alertes

/**
 * Locale française pour les dates
 */
export const fr = {
  locale: 'fr-FR'
};

/**
 * Formate une date en chaîne lisible
 */
export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(d.getTime())) {
    return 'Date invalide';
  }

  return new Intl.DateTimeFormat('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(d);
}

/**
 * Formate une date en format relatif (il y a X minutes, heures, jours...)
 * Compatible avec date-fns formatDistanceToNow
 */
export function formatDistanceToNow(date: string | Date, options?: { addSuffix?: boolean; locale?: any }): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  
  if (isNaN(d.getTime())) {
    return 'Date invalide';
  }

  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffWeeks = Math.floor(diffDays / 7);
  const diffMonths = Math.floor(diffDays / 30);

  let result = '';

  if (diffMinutes < 1) {
    result = "moins d'une minute";
  } else if (diffMinutes < 60) {
    result = `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''}`;
  } else if (diffHours < 24) {
    result = `${diffHours} heure${diffHours > 1 ? 's' : ''}`;
  } else if (diffDays < 7) {
    result = `${diffDays} jour${diffDays > 1 ? 's' : ''}`;
  } else if (diffWeeks < 4) {
    result = `${diffWeeks} semaine${diffWeeks > 1 ? 's' : ''}`;
  } else {
    result = `${diffMonths} mois`;
  }

  return options?.addSuffix ? `il y a ${result}` : result;
}

/**
 * Formate une date en format relatif (il y a X minutes, heures, jours...)
 */
export function formatRelativeDate(date: string | Date): string {
  return formatDistanceToNow(date, { addSuffix: true });
}

/**
 * Vérifie si une alerte est expirée
 */
export function isExpired(expirationDate?: string): boolean {
  if (!expirationDate) return false;
  
  const expDate = new Date(expirationDate);
  const now = new Date();
  
  return expDate.getTime() < now.getTime();
}

/**
 * Calcule le temps restant avant expiration
 */
export function getTimeUntilExpiration(expirationDate?: string): string | null {
  if (!expirationDate) return null;
  
  const expDate = new Date(expirationDate);
  const now = new Date();
  const diffMs = expDate.getTime() - now.getTime();
  
  if (diffMs <= 0) return "Expiré";
  
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffDays > 0) {
    return `Expire dans ${diffDays} jour${diffDays > 1 ? 's' : ''}`;
  } else if (diffHours > 0) {
    return `Expire dans ${diffHours} heure${diffHours > 1 ? 's' : ''}`;
  } else {
    return `Expire dans ${diffMinutes} minute${diffMinutes > 1 ? 's' : ''}`;
  }
}
