// Script utilitaire pour initialiser les données utilisateur dans localStorage
// Utilisable depuis la console du navigateur ou intégré dans l'application

// Exemple de données utilisateur selon votre structure
const sampleUserData = {
  id: 2,
  nom: "Doe",
  preNom: "John",
  email: "john.doe@example.com",
  userType: "EMPLOYE",
  active: true
};

// Fonction pour initialiser les données utilisateur
export const initializeUserData = (userData = sampleUserData) => {
  try {
    localStorage.setItem('userData', JSON.stringify(userData));
    console.log('✅ Données utilisateur initialisées:', userData);
    return true;
  } catch (error) {
    console.error('❌ Erreur lors de l\'initialisation:', error);
    return false;
  }
};

// Fonction pour nettoyer les données existantes
export const clearAllUserData = () => {
  const keysToRemove = ['userData', 'userInfo', 'token'];
  keysToRemove.forEach(key => {
    localStorage.removeItem(key);
  });
  console.log('🧹 Toutes les données utilisateur supprimées');
};

// Fonction pour afficher les données actuelles
export const showCurrentData = () => {
  console.group('📋 Données actuelles localStorage');
  
  const userData = localStorage.getItem('userData');
  console.log('userData:', userData ? JSON.parse(userData) : 'Aucun');
  
  const userInfo = localStorage.getItem('userInfo');
  console.log('userInfo:', userInfo ? JSON.parse(userInfo) : 'Aucun');
  
  const token = localStorage.getItem('token');
  console.log('token:', token ? 'Présent' : 'Aucun');
  
  console.groupEnd();
};

// Fonction pour créer un utilisateur de test avec un ID spécifique
export const createTestUser = (id: number, nom: string = "Test", prenom: string = "User") => {
  const testUserData = {
    id: id,
    nom: nom,
    preNom: prenom,
    email: `${prenom.toLowerCase()}.${nom.toLowerCase()}@test.com`,
    userType: "EMPLOYE",
    active: true
  };
  
  initializeUserData(testUserData);
  return testUserData;
};

// Fonctions utilitaires à utiliser dans la console du navigateur
export const devTools = {
  // Initialiser avec John Doe (ID: 2)
  initJohnDoe: () => initializeUserData(),
  
  // Créer un utilisateur avec ID spécifique
  createUser: createTestUser,
  
  // Voir les données actuelles
  show: showCurrentData,
  
  // Nettoyer tout
  clear: clearAllUserData,
  
  // Tester différents utilisateurs
  testUsers: {
    admin: () => createTestUser(1, "Admin", "System"),
    john: () => createTestUser(2, "Doe", "John"),
    jane: () => createTestUser(3, "Smith", "Jane"),
    manager: () => createTestUser(4, "Manager", "Test")
  }
};

// Exposer les outils de dev globalement si en mode développement
if (typeof window !== 'undefined' && import.meta.env.DEV) {
  (window as any).userDevTools = devTools;
  console.log('🛠️ Outils de développement utilisateur disponibles via window.userDevTools');
}
