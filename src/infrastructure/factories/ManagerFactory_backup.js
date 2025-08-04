/**
 * ManagerFactory - Factory para crear managers
 * Principio DIP: Dependency Inversion Pri    /**
     * Crea una instancia de PerformanceMonitor (singleton)
     */
    createPerformanceMonitor() {
        if (this.instances.has('performanceMonitor')) {
            return this.instances.get('performanceMonitor');
        }

        const performanceMonitor = new PerformanceMonitor(this.config.performanceConfig);
        this.instances.set('performanceMonitor', performanceMonitor);
        return performanceMonitor;
    }

    /**
     * Crea una instancia de JuiceManager (singleton)
     */
    createJuiceManager() {
        if (this.instances.has('juiceManager')) {
            return this.instances.get('juiceManager');
        }

        const juiceManager = new JuiceManager(this.config.juiceConfig);
        this.instances.set('juiceManager', juiceManager);
        return juiceManager;
    }rincipio OCP: Open/Closed Principle
 * Centraliza la creación de managers con inyección de dependencias
 */
import GameManager from '../../application/GameManager.js';
import SceneManager from '../../application/SceneManager.js';
import AuthManager from '../../infrastructure/AuthManager.js';
import UserPreferencesManager from '../../application/UserPreferencesManager.js';
import PerformanceMonitor from '../../infrastructure/PerformanceMonitor.js';
import JuiceManager from '../../infrastructure/JuiceManager.js';
import MockApiClient from '../../infrastructure/MockApiClient.js';
import ApiClient from '../../infrastructure/ApiClient.js';

export default class ManagerFactory {
    constructor(config = {}) {
        this.config = {
            isDevelopment: true,
            enablePerformanceMonitoring: true,
            ...config
        };
        this.instances = new Map();
    }

    /**
     * Crea el cliente API apropiado según la configuración
     */
    createApiClient() {
        if (this.instances.has('apiClient')) {
            return this.instances.get('apiClient');
        }

        const apiClient = this.config.isDevelopment 
            ? new MockApiClient() 
            : new ApiClient();
        
        this.instances.set('apiClient', apiClient);
        return apiClient;
    }

    /**
     * Crea el AuthManager con sus dependencias
     */
    createAuthManager() {
        if (this.instances.has('authManager')) {
            return this.instances.get('authManager');
        }

        const apiClient = this.createApiClient();
        const authManager = new AuthManager(apiClient);
        
        this.instances.set('authManager', authManager);
        return authManager;
    }

    /**
     * Crea el SceneManager
     */
    createSceneManager() {
        if (this.instances.has('sceneManager')) {
            return this.instances.get('sceneManager');
        }

        const sceneManager = new SceneManager();
        this.instances.set('sceneManager', sceneManager);
        return sceneManager;
    }

    /**
     * Crea el GameManager con sus dependencias
     */
    createGameManager() {
        if (this.instances.has('gameManager')) {
            return this.instances.get('gameManager');
        }

        const apiClient = this.createApiClient();
        const gameManager = new GameManager(apiClient);
        
        // Inyectar dependencias
        const performanceMonitor = this.createPerformanceMonitor();
        const sceneManager = this.createSceneManager();
        
        if (typeof gameManager.setPerformanceMonitor === 'function') {
            gameManager.setPerformanceMonitor(performanceMonitor);
        }
        
        if (typeof gameManager.setSceneManager === 'function') {
            gameManager.setSceneManager(sceneManager);
        }
        
        this.instances.set('gameManager', gameManager);
        return gameManager;
    }

    /**
     * Crea el PerformanceMonitor
     */
    createPerformanceMonitor() {
        if (this.instances.has('performanceMonitor')) {
            return this.instances.get('performanceMonitor');
        }

        const performanceMonitor = new PerformanceMonitor(this.config.performanceConfig);
        this.instances.set('performanceMonitor', performanceMonitor);
        return performanceMonitor;
    }

    /**
     * Configura el UserPreferencesManager con su cliente API
     */
    setupUserPreferencesManager() {
        const apiClient = this.createApiClient();
        UserPreferencesManager.setApiClient(apiClient);
    }

    /**
     * Crea todos los managers principales
     */
    createAllManagers() {
        return {
            apiClient: this.createApiClient(),
            authManager: this.createAuthManager(),
            sceneManager: this.createSceneManager(),
            gameManager: this.createGameManager(),
            performanceMonitor: this.createPerformanceMonitor()
        };
    }

    /**
     * Limpia todas las instancias
     */
    cleanup() {
        this.instances.forEach((instance, key) => {
            if (typeof instance.cleanup === 'function') {
                instance.cleanup();
            }
        });
        this.instances.clear();
    }

    /**
     * Obtiene una instancia específica
     */
    getInstance(key) {
        return this.instances.get(key);
    }

    /**
     * Verifica si una instancia existe
     */
    hasInstance(key) {
        return this.instances.has(key);
    }
}
