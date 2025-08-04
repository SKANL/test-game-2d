/**
 * ManagerFactory - Factory para crear managers
 * Principio DIP: Dependency Inversion Principle
 * Principio OCP: Open/Closed Principle
 * Centraliza la creación de managers con inyección de dependencias
 */
import GameManager from '../../application/GameManager.js';
import SceneManager from '../../application/SceneManager.js';
import InputManager from '../../application/InputManager.js';
import UserPreferencesManager from '../../application/UserPreferencesManager.js';
import AuthManager from '../../infrastructure/AuthManager.js';
import AudioManager from '../../infrastructure/AudioManager.js';
import PerformanceMonitor from '../../infrastructure/PerformanceMonitor.js';
import JuiceManager from '../../infrastructure/JuiceManager.js';
import MockApiClient from '../../infrastructure/MockApiClient.js';
import ApiClient from '../../infrastructure/ApiClient.js';
import VisualEffectsManager from '../../presentation/VisualEffectsManager.js';

export default class ManagerFactory {
    constructor(config = {}) {
        this.config = {
            isDevelopment: true,
            enablePerformanceMonitoring: true,
            ...config
        };
        
        // Singleton instances storage
        this.instances = new Map();
    }

    /**
     * Crea el cliente API apropiado según el entorno
     */
    createApiClient() {
        if (this.instances.has('apiClient')) {
            return this.instances.get('apiClient');
        }

        const apiClient = this.config.isDevelopment 
            ? new MockApiClient(this.config.apiConfig)
            : new ApiClient(this.config.apiConfig);
            
        this.instances.set('apiClient', apiClient);
        return apiClient;
    }

    /**
     * Crea una instancia de AuthManager con su cliente API
     */
    createAuthManager() {
        if (this.instances.has('authManager')) {
            return this.instances.get('authManager');
        }

        const apiClient = this.createApiClient();
        const authManager = new AuthManager(apiClient, this.config.authConfig);
        this.instances.set('authManager', authManager);
        return authManager;
    }

    /**
     * Crea una instancia de AudioManager
     */
    createAudioManager() {
        if (this.instances.has('audioManager')) {
            return this.instances.get('audioManager');
        }

        const audioManager = new AudioManager(this.config.audioConfig);
        this.instances.set('audioManager', audioManager);
        return audioManager;
    }

    /**
     * Crea una instancia de InputManager
     */
    createInputManager() {
        if (this.instances.has('inputManager')) {
            return this.instances.get('inputManager');
        }

        const inputManager = new InputManager(this.config.inputConfig);
        this.instances.set('inputManager', inputManager);
        return inputManager;
    }

    /**
     * Crea una instancia de VisualEffectsManager
     */
    createVisualEffectsManager() {
        if (this.instances.has('visualEffectsManager')) {
            return this.instances.get('visualEffectsManager');
        }

        const visualEffectsManager = new VisualEffectsManager(this.config.vfxConfig);
        this.instances.set('visualEffectsManager', visualEffectsManager);
        return visualEffectsManager;
    }

    /**
     * Crea una instancia de UserPreferencesManager
     */
    createUserPreferencesManager() {
        if (this.instances.has('userPreferencesManager')) {
            return this.instances.get('userPreferencesManager');
        }

        const apiClient = this.createApiClient();
        const userPreferencesManager = new UserPreferencesManager(apiClient, this.config.preferencesConfig);
        this.instances.set('userPreferencesManager', userPreferencesManager);
        return userPreferencesManager;
    }

    /**
     * Crea una instancia de SceneManager
     */
    createSceneManager() {
        if (this.instances.has('sceneManager')) {
            return this.instances.get('sceneManager');
        }

        const sceneManager = new SceneManager(this.config.sceneConfig);
        this.instances.set('sceneManager', sceneManager);
        return sceneManager;
    }

    /**
     * Crea una instancia de GameManager con todas sus dependencias
     */
    createGameManager() {
        if (this.instances.has('gameManager')) {
            return this.instances.get('gameManager');
        }

        const apiClient = this.createApiClient();
        const juiceManager = this.createJuiceManager();
        const gameManager = new GameManager(apiClient, this.config.gameConfig, juiceManager);
        this.instances.set('gameManager', gameManager);
        return gameManager;
    }

    /**
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
    }

    /**
     * Configura el UserPreferencesManager con su cliente API
     * @deprecated Este método es para compatibilidad, use createUserPreferencesManager()
     */
    setupUserPreferencesManager() {
        const apiClient = this.createApiClient();
        UserPreferencesManager.setApiClient(apiClient);
    }

    /**
     * Crea todos los managers principales con dependencias inyectadas
     */
    createAllManagers() {
        return {
            apiClient: this.createApiClient(),
            authManager: this.createAuthManager(),
            audioManager: this.createAudioManager(),
            inputManager: this.createInputManager(),
            visualEffectsManager: this.createVisualEffectsManager(),
            userPreferencesManager: this.createUserPreferencesManager(),
            sceneManager: this.createSceneManager(),
            gameManager: this.createGameManager(),
            performanceMonitor: this.createPerformanceMonitor(),
            juiceManager: this.createJuiceManager()
        };
    }

    /**
     * Inicializa todos los managers en el orden correcto
     */
    async initializeAllManagers() {
        const managers = this.createAllManagers();
        
        // Orden de inicialización siguiendo dependencias
        const initOrder = [
            'performanceMonitor',
            'audioManager',
            'inputManager',
            'userPreferencesManager',
            'visualEffectsManager',
            'juiceManager',
            'authManager',
            'sceneManager',
            'gameManager'
        ];

        const initializedManagers = {};
        
        for (const managerName of initOrder) {
            const manager = managers[managerName];
            if (manager && typeof manager.initialize === 'function') {
                try {
                    await manager.initialize();
                    initializedManagers[managerName] = manager;
                    console.log(`✅ ${managerName} inicializado correctamente`);
                } catch (error) {
                    console.error(`❌ Error inicializando ${managerName}:`, error);
                    throw error;
                }
            } else {
                initializedManagers[managerName] = manager;
            }
        }

        // Añadir ApiClient que no requiere inicialización
        initializedManagers.apiClient = managers.apiClient;

        return initializedManagers;
    }

    /**
     * Limpia todas las instancias singleton
     */
    clearInstances() {
        this.instances.clear();
    }

    /**
     * Obtiene una instancia específica si existe
     */
    getInstance(name) {
        return this.instances.get(name);
    }

    /**
     * Verifica si una instancia existe
     */
    hasInstance(name) {
        return this.instances.has(name);
    }

    /**
     * Obtiene todas las instancias creadas
     */
    getAllInstances() {
        return Object.fromEntries(this.instances);
    }

    /**
     * Obtiene estadísticas del factory
     */
    getStats() {
        return {
            totalInstances: this.instances.size,
            instanceNames: Array.from(this.instances.keys()),
            config: { ...this.config }
        };
    }
}
