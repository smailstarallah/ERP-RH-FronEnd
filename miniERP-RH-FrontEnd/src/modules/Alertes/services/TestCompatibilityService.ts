// src/modules/Alertes/services/TestCompatibilityService.ts
import { alertesApiService } from './alertesApi';
import { alerteWebSocketService } from './AlerteWebSocketService';
import type { CreateAlerteRequest } from '../types';

export class TestCompatibilityService {
    
    /**
     * Test de compatibilité avec le backend Spring
     */
    async testBackendCompatibility(employeId: string): Promise<void> {
        console.log('🧪 === DÉBUT TEST COMPATIBILITÉ BACKEND ===');
        
        try {
            // Test 1: Récupération des alertes
            console.log('🔍 Test 1: Récupération des alertes...');
            const alertes = await alertesApiService.getAlertes(employeId);
            console.log(`✅ Test 1 OK - ${alertes.alertes.length} alertes récupérées`);
            
            // Test 2: Comptage des alertes non lues
            console.log('🔢 Test 2: Comptage des alertes non lues...');
            const count = await alertesApiService.getCompteNonLues(employeId);
            console.log(`✅ Test 2 OK - ${count} alertes non lues`);
            
            // Test 3: Récupération des alertes récentes
            console.log('⏰ Test 3: Récupération des alertes récentes...');
            const recentes = await alertesApiService.getAlertesRecentes(employeId);
            console.log(`✅ Test 3 OK - ${recentes.length} alertes récentes`);
            
            // Test 4: Récupération par statut
            console.log('📊 Test 4: Récupération par statut...');
            const nonLues = await alertesApiService.getAlertesParStatut(employeId, 'UNREAD');
            const lues = await alertesApiService.getAlertesParStatut(employeId, 'READ');
            console.log(`✅ Test 4 OK - ${nonLues.length} non lues, ${lues.length} lues`);
            
            // Test 5: Connexion WebSocket
            console.log('🔌 Test 5: Connexion WebSocket...');
            await alerteWebSocketService.connect(employeId, 'EMPLOYEE');
            
            if (alerteWebSocketService.isConnected()) {
                console.log('✅ Test 5 OK - WebSocket connecté');
                
                // Test 6: Abonnement aux alertes utilisateur
                console.log('👤 Test 6: Abonnement aux alertes utilisateur...');
                alerteWebSocketService.subscribeToUserAlerts(employeId, (alerte) => {
                    console.log('📨 Alerte reçue via WebSocket:', alerte);
                });
                console.log('✅ Test 6 OK - Abonnement configuré');
                
            } else {
                console.log('❌ Test 5 ÉCHEC - WebSocket non connecté');
            }
            
            console.log('🎉 === TESTS DE COMPATIBILITÉ TERMINÉS ===');
            
        } catch (error) {
            console.error('❌ Erreur lors des tests de compatibilité:', error);
            throw error;
        }
    }
    
    /**
     * Test de création d'alerte
     */
    async testCreateAlerte(employeId: string): Promise<void> {
        console.log('🧪 === TEST CRÉATION ALERTE ===');
        
        try {
            const testAlerte: CreateAlerteRequest = {
                titre: 'Test de compatibilité',
                message: 'Ceci est un test de création d\'alerte via l\'API',
                type: 'INFO',
                employeId: employeId,
                userId: employeId
            };
            
            console.log('🚀 Création de l\'alerte de test...');
            const nouvelleAlerte = await alertesApiService.creerAlerte(testAlerte);
            console.log('✅ Alerte créée avec succès:', nouvelleAlerte);
            
            // Test de marquage comme lue
            console.log('📖 Test de marquage comme lue...');
            await alertesApiService.marquerCommeLue(nouvelleAlerte.id);
            console.log('✅ Alerte marquée comme lue');
            
            // Optionnel: Test de suppression
            console.log('🗑️ Test de suppression...');
            await alertesApiService.supprimerAlerte(nouvelleAlerte.id);
            console.log('✅ Alerte supprimée');
            
            console.log('🎉 === TEST CRÉATION TERMINÉ ===');
            
        } catch (error) {
            console.error('❌ Erreur lors du test de création:', error);
            throw error;
        }
    }
    
    /**
     * Test de temps réel via WebSocket
     */
    async testRealTimeAlerts(employeId: string): Promise<void> {
        console.log('🧪 === TEST TEMPS RÉEL ===');
        
        try {
            // Se connecter si pas déjà fait
            if (!alerteWebSocketService.isConnected()) {
                await alerteWebSocketService.connect(employeId, 'EMPLOYEE');
            }
            
            // Créer une alerte via WebSocket
            const testData = {
                titre: 'Test WebSocket',
                message: 'Test de création via WebSocket',
                type: 'SUCCESS',
                employeId: employeId,
                userId: employeId
            };
            
            console.log('📡 Envoi d\'alerte via WebSocket...');
            const success = await alerteWebSocketService.creerAlerteWebSocket(testData);
            
            if (success) {
                console.log('✅ Alerte envoyée via WebSocket');
            } else {
                console.log('❌ Échec d\'envoi via WebSocket');
            }
            
            console.log('🎉 === TEST TEMPS RÉEL TERMINÉ ===');
            
        } catch (error) {
            console.error('❌ Erreur lors du test temps réel:', error);
            throw error;
        }
    }
    
    /**
     * Lance tous les tests de compatibilité
     */
    async runAllTests(employeId: string): Promise<void> {
        console.log('🚀 === DÉBUT TESTS COMPLETS ===');
        console.log(`👤 EmployeId: ${employeId}`);
        
        try {
            await this.testBackendCompatibility(employeId);
            await this.testCreateAlerte(employeId);
            await this.testRealTimeAlerts(employeId);
            
            console.log('🎉 === TOUS LES TESTS RÉUSSIS ===');
            
        } catch (error) {
            console.error('💥 === ERREUR DANS LES TESTS ===');
            console.error(error);
        }
    }
}

export const testCompatibilityService = new TestCompatibilityService();
