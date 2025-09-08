// Service simple pour gérer l'authentification et les informations utilisateur
export interface UserInfo {
  id: number;
  nom: string;
  preNom: string;
  email: string;
  userType: string;
  active: boolean;
}

// Interface pour compatibilité avec l'ancien format
export interface LegacyUserInfo {
  employeId: string;
  nom: string;
  prenom: string;
  email: string;
  role: string;
}

// Récupère l'ID numérique de l'employé connecté (pour l'API Backend)
export const getCurrentEmployeId = (): string => {
  // Vérifier d'abord userData dans le localStorage (structure de votre système)
  const userData = localStorage.getItem('userData');
  if (userData) {
    try {
      const parsed = JSON.parse(userData);
      if (parsed.id) {
        return parsed.id.toString(); // Convertir le nombre en string
      }
    } catch (error) {
      console.warn('Erreur parsing userData:', error);
    }
  }

  // Vérifier l'ancien format userInfo pour compatibilité
  const userInfo = localStorage.getItem('userInfo');
  if (userInfo) {
    try {
      const parsed = JSON.parse(userInfo);
      if (parsed.employeId) {
        // S'assurer que l'employeId est numérique
        const numericId = extractNumericId(parsed.employeId);
        if (numericId) {
          return numericId;
        }
      }
      // Chercher aussi dans d'autres champs possibles
      if (parsed.id) {
        return parsed.id.toString();
      }
    } catch (error) {
      console.warn('Erreur parsing userInfo:', error);
    }
  }

  // Vérifier un token JWT s'il existe
  const token = localStorage.getItem('token');
  if (token) {
    try {
      // Décoder le JWT de façon basique (partie payload)
      const payload = JSON.parse(atob(token.split('.')[1]));

      // Essayer plusieurs champs possibles pour l'ID
      const possibleIdFields = ['employeId', 'userId', 'id', 'sub', 'user_id', 'employee_id'];

      for (const field of possibleIdFields) {
        if (payload[field]) {
          const numericId = extractNumericId(payload[field]);
          if (numericId) {
            return numericId;
          }
        }
      }
    } catch (error) {
      console.warn('Erreur décodage token:', error);
    }
  }

  // Valeur par défaut pour le développement
  console.warn('Aucun employeId numérique trouvé, utilisation ID par défaut');
  return '1';
};

// Fonction utilitaire pour extraire un ID numérique d'une chaîne
const extractNumericId = (value: any): string | null => {
  if (!value) return null;

  // Si c'est déjà un nombre
  if (typeof value === 'number') {
    return value.toString();
  }

  // Si c'est une chaîne
  if (typeof value === 'string') {
    // Si c'est déjà purement numérique
    if (/^\d+$/.test(value)) {
      return value;
    }

    // Essayer d'extraire des chiffres d'une chaîne comme "user_123" ou "emp-456"
    const match = value.match(/\d+/);
    if (match) {
      return match[0];
    }
  }

  return null;
};

// Récupère les informations complètes de l'utilisateur connecté
export const getCurrentUser = (): UserInfo | null => {
  // Vérifier d'abord userData dans le localStorage (structure de votre système)
  const userData = localStorage.getItem('userData');
  if (userData) {
    try {
      const parsed = JSON.parse(userData);
      // Vérifier que c'est bien la structure attendue
      if (parsed.id && parsed.nom && parsed.email) {
        return {
          id: parsed.id,
          nom: parsed.nom,
          preNom: parsed.preNom || '',
          email: parsed.email,
          userType: parsed.userType || 'EMPLOYE',
          active: parsed.active !== undefined ? parsed.active : true
        };
      }
    } catch (error) {
      console.warn('Erreur parsing userData:', error);
    }
  }

  // Vérifier l'ancien format userInfo pour compatibilité
  const userInfo = localStorage.getItem('userInfo');
  if (userInfo) {
    try {
      const parsed = JSON.parse(userInfo);
      return {
        id: parseInt(parsed.employeId),
        nom: parsed.nom,
        preNom: parsed.prenom,
        email: parsed.email,
        userType: parsed.role,
        active: true
      };
    } catch (error) {
      console.warn('Erreur parsing userInfo:', error);
    }
  }

  // Tentative depuis le token
  const token = localStorage.getItem('token');
  if (token) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return {
        id: parseInt(payload.employeId || payload.sub || payload.id) || 1,
        nom: payload.nom || 'Utilisateur',
        preNom: payload.prenom || payload.preNom || 'Test',
        email: payload.email || 'test@exemple.com',
        userType: payload.role || payload.userType || 'EMPLOYE',
        active: true
      };
    } catch (error) {
      console.warn('Erreur décodage token:', error);
    }
  }

  return null;
};

// Vérifie si l'utilisateur est connecté
export const isAuthenticated = (): boolean => {
  const token = localStorage.getItem('token');
  return !!token;
};

// Récupère le rôle de l'utilisateur connecté
export const getCurrentUserRole = (): string => {
  // Vérifier d'abord userData dans le localStorage (structure principale)
  const userData = localStorage.getItem('userData');
  if (userData) {
    try {
      const parsed = JSON.parse(userData);
      if (parsed.userType) {
        return parsed.userType;
      }
    } catch (error) {
      console.warn('Erreur parsing userData:', error);
    }
  }

  // Vérifier l'ancien format userInfo pour compatibilité
  const userInfo = localStorage.getItem('userInfo');
  if (userInfo) {
    try {
      const parsed = JSON.parse(userInfo);
      if (parsed.role) {
        return parsed.role;
      }
      if (parsed.userType) {
        return parsed.userType;
      }
    } catch (error) {
      console.warn('Erreur parsing userInfo:', error);
    }
  }

  // Essayer de décoder le token JWT
  const token = localStorage.getItem('token');
  if (token) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      if (payload.role) {
        return payload.role;
      }
      if (payload.userType) {
        return payload.userType;
      }
    } catch (error) {
      console.warn('Erreur décodage token:', error);
    }
  }

  // Retour par défaut
  console.warn('Aucun rôle trouvé, utilisation du rôle par défaut EMPLOYE');
  return 'EMPLOYE';
};

// Sauvegarde les informations utilisateur
export const saveUserInfo = (userInfo: UserInfo): void => {
  localStorage.setItem('userInfo', JSON.stringify(userInfo));
};

// Supprime les informations utilisateur (logout)
export const clearUserInfo = (): void => {
  localStorage.removeItem('userInfo');
  localStorage.removeItem('token');
};

// Fonction de diagnostic pour déboguer les problèmes d'authentification
export const debugAuthInfo = (): void => {
  console.group('🔍 Debug Auth Info');

  // Info userData (nouvelle structure)
  const userData = localStorage.getItem('userData');
  console.log('📦 UserData localStorage:', userData ? JSON.parse(userData) : 'Aucun');

  // Info userInfo (ancienne structure pour compatibilité)
  const userInfo = localStorage.getItem('userInfo');
  console.log('📦 UserInfo localStorage (legacy):', userInfo ? JSON.parse(userInfo) : 'Aucun');

  // Info token
  const token = localStorage.getItem('token');
  if (token) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      console.log('🔐 Token JWT Payload:', payload);
    } catch (error) {
      console.warn('❌ Erreur décodage token:', error);
    }
  } else {
    console.log('🔐 Token JWT:', 'Aucun');
  }

  // ID extrait
  const extractedId = getCurrentEmployeId();
  console.log('🆔 ID Employé extrait:', extractedId);

  // Type de l'ID
  console.log('📊 Type ID:', typeof extractedId, '- Numérique:', /^\d+$/.test(extractedId));

  // User complet
  const currentUser = getCurrentUser();
  console.log('👤 Utilisateur complet:', currentUser);

  console.groupEnd();
};
