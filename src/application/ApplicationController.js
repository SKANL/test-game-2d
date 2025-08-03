/**
 * ApplicationController v2.0 - Controlador principal refactorizado
 * REFACTORIZADO: Aplica principios SOLID y Clean Architecture
 * SRP: Una sola responsabilidad - orquestación de la aplicación
 * OCP: Extensible sin modificar código existente
 * LSP: Substitución por interfaces de control
 * ISP: Interfaces específicas para diferentes componentes
 * DIP: Depende de abstracciones, no de implementaciones concretas
 */
import GameManager from './GameManager.js';
import SceneManager from './SceneManager.js';
import AuthManager from '../infrastructure/AuthManager.js';
import UserPreferencesManager from './UserPreferencesManager.js';
import PerformanceMonitor from '../infrastructure/PerformanceMonitor.js';
import LoginScene from '../presentation/scenes/LoginScene.js';
import LoadingScene from '../presentation/scenes/LoadingScene.js';
import TitleScene from '../presentation/scenes/TitleScene.js';
import GameModeScene from '../presentation/scenes/GameModeScene.js';
import CharacterSelectScene from '../presentation/scenes/CharacterSelectScene.js';
import BattleScene from '../presentation/scenes/BattleScene.js';
import GameOverScene from '../presentation/scenes/GameOverScene.js';
import AdminDashboardScene from '../presentation/scenes/AdminDashboardScene.js';
import OptionsScene from '../presentation/scenes/OptionsScene.js';
import MockApiClient from '../infrastructure/MockApiClient.js';
import ApiClient from '../infrastructure/ApiClient.js';

export default class ApplicationController {
    /**
     * Constructor con inyección de dependencias (SOLID - DIP)
     */
    constructor(config = {}) {
        // Configuración (SOLID - OCP)
        this.config = {
            isDevelopment: config.isDevelopment ?? true,
            enablePerformanceMonitoring: config.enablePerformanceMonitoring ?? true,
            enableGlobalDebug: config.enableGlobalDebug ?? true,
            ...config
        };
        
        // Inyección de dependencias (SOLID - DIP)
        this.apiClient = this.config.isDevelopment ? new MockApiClient() : new ApiClient();
        
        // Servicios principales con configuración optimizada (SOLID - SRP)
        this.authManager = new AuthManager(this.apiClient);
        this.sceneManager = new SceneManager();
        this.gameManager = new GameManager(this.apiClient);
        this.performanceMonitor = new PerformanceMonitor(this.config.performanceConfig);
        
        // Configurar dependencias adicionales (SOLID - DIP)
        UserPreferencesManager.setApiClient(this.apiClient);
        
        // Inyección de dependencias para GameManager (verificación de seguridad)
        if (this.gameManager && typeof this.gameManager.setPerformanceMonitor === 'function') {
            this.gameManager.setPerformanceMonitor(this.performanceMonitor);
        } else {
            console.warn('⚠️ GameManager no tiene método setPerformanceMonitor');
        }
        
        // Estado interno (SOLID - SRP)
        this.state = {
            isInitialized: false,
            isShuttingDown: false,
            currentUser: null,
            lastError: null
        };
        
        // Registro global solo en desarrollo (SOLID - ISP)
        if (this.config.isDevelopment && this.config.enableGlobalDebug) {
            this.setupGlobalDebugAccess();
        }
        
        console.log('🎮 ApplicationController v2.0 inicializado');
    }

    /**
     * Configurar acceso global para debug (SOLID - ISP)
     */
    setupGlobalDebugAccess() {
        window.appController = this;
        window.gameManager = this.gameManager;
        window.sceneManager = this.sceneManager;
        window.performanceMonitor = this.performanceMonitor;
        
        console.log('🐛 Acceso global configurado para debug');
    }

    /**
     * Inicializar la aplicación con validaciones robustas (SOLID - SRP)
     */
    async initialize() {
        if (this.state.isInitialized) {
            console.warn('⚠️ ApplicationController ya inicializado');
            return;
        }

        try {
            console.log('🚀 Iniciando ApplicationController v2.0...');
            
            // 1. Validar dependencias críticas
            await this.validateDependencies();
            
            // 2. Registrar escenas en el SceneManager
            this.registerScenes();
            
            // 3. Inicializar servicios en orden
            await this.initializeServices();
            
            // 4. Verificar autenticación e iniciar flujo apropiado
            await this.initializeAuthenticationFlow();
            
            this.state.isInitialized = true;
            console.log('✅ ApplicationController v2.0 inicializado correctamente');
            
        } catch (error) {
            this.handleInitializationError(error);
            throw new Error(`Fallo en inicialización: ${error.message}`);
        }
    }

    /**
     * Manejar errores de inicialización (SOLID - SRP)
     */
    handleInitializationError(error) {
        this.state.lastError = error;
        console.error('❌ Error al inicializar ApplicationController:', error);
        
        // Intentar cleanup parcial en caso de error
        try {
            this.performanceMonitor?.stop();
        } catch (cleanupError) {
            console.warn('⚠️ Error en cleanup de emergencia:', cleanupError);
        }
    }

    /**
     * Validar que todas las dependencias críticas estén disponibles (SOLID - SRP)
     */
    async validateDependencies() {
        const requiredElements = ['gameCanvas'];
        const missingElements = requiredElements.filter(id => !document.getElementById(id));
        
        if (missingElements.length > 0) {
            throw new Error(`Elementos DOM requeridos no encontrados: ${missingElements.join(', ')}`);
        }
        
        // Validar que el apiClient sea funcional
        if (!this.apiClient || typeof this.apiClient.login !== 'function') {
            throw new Error('ApiClient no válido o mal configurado');
        }
        
        console.log('✅ Dependencias validadas correctamente');
    }

    /**
     * Inicializar servicios en el orden correcto
     */
    async initializeServices() {
        // 1. Inicializar AuthManager
        this.authManager.init();
        
        // 2. Inicializar PerformanceMonitor en modo desarrollo
        if (this.IS_DEV_MODE) {
            this.performanceMonitor.start();
            console.log('📊 PerformanceMonitor activado en modo desarrollo');
        }
        
        // 3. GameManager estará listo pero no iniciará automáticamente
        // Solo iniciará cuando sea necesario para la batalla
        
        console.log('✅ Servicios inicializados correctamente');
    }

    /**
     * Registrar todas las escenas en SceneManager
     */
    registerScenes() {
        const scenes = [
            ['login', LoginScene],
            ['loading', LoadingScene],
            ['title', TitleScene],
            ['gameMode', GameModeScene],
            ['characterSelect', CharacterSelectScene],
            ['battle', BattleScene],
            ['gameOver', GameOverScene],
            ['adminDashboard', AdminDashboardScene],
            ['options', OptionsScene]
        ];

        scenes.forEach(([name, SceneClass]) => {
            this.sceneManager.registerScene(name, SceneClass);
        });
        
        console.log('✅ Escenas registradas:', scenes.map(([name]) => name));
    }

    /**
     * Inicializar flujo de autenticación
     */
    async initializeAuthenticationFlow() {
        if (!this.authManager.isAuthenticated()) {
            await this.showLoginScene();
        } else {
            const user = this.authManager.getUser();
            await this.handleAuthentication(user.role);
        }
    }

    /**
     * Mostrar escena de login
     */
    async showLoginScene() {
        const loginScene = new LoginScene((role) => {
            this.handleAuthentication(role);
        });
        await this.renderScene(loginScene);
    }

    /**
     * Manejar autenticación exitosa con carga de preferencias
     */
    async handleAuthentication(role) {
        try {
            // Cargar preferencias del usuario
            const user = this.authManager.getUser();
            await UserPreferencesManager.loadPreferences(user.id);
            
            if (role === 'ADMIN') {
                await this.transitionToAdminDashboard();
            } else {
                await this.transitionToTitle();
            }
        } catch (error) {
            console.warn('⚠️ Error cargando preferencias:', error);
            // Continuar sin preferencias si fallan
            if (role === 'ADMIN') {
                await this.transitionToAdminDashboard();
            } else {
                await this.transitionToTitle();
            }
        }
    }

    /**
     * Método genérico para renderizar escenas con manejo de errores
     */
    async renderScene(scene) {
        try {
            if (typeof scene.init === 'function') {
                await scene.init();
            }
            scene.render();
        } catch (error) {
            console.error('❌ Error renderizando escena:', error);
            throw error;
        }
    }

    /**
     * Transiciones de escenas optimizadas
     */
    async transitionToTitle() {
        const titleScene = new TitleScene(
            () => this.transitionToGameMode(),     // onStartGame
            () => this.transitionToOptions(),      // onOptions
            () => this.handleLogout()              // onExit
        );
        
        await this.sceneManager.transitionTo('title', { scene: titleScene });
    }

    async transitionToOptions() {
        const optionsScene = new OptionsScene(() => {
            this.transitionToTitle();
        });
        
        await this.sceneManager.transitionTo('options', { scene: optionsScene });
    }

    async transitionToAdminDashboard() {
        const adminDashboard = new AdminDashboardScene(() => {
            this.handleLogout();
        });
        
        await this.sceneManager.transitionTo('adminDashboard', { scene: adminDashboard });
    }

    async transitionToGameMode() {
        const gameModeScene = new GameModeScene((gameMode) => {
            this.transitionToCharacterSelect(gameMode);
        });
        
        await this.sceneManager.transitionTo('gameMode', { scene: gameModeScene });
    }

    async transitionToCharacterSelect(gameMode) {
        const characterSelect = new CharacterSelectScene((selections) => {
            this.transitionToBattle(selections);
        }, gameMode);
        
        await this.sceneManager.transitionTo('characterSelect', { scene: characterSelect });
    }

    async transitionToBattle(battleConfig) {
        // El GameManager ya no maneja su propio gameloop de rendering
        // Solo se asegura de estar disponible para gestión de estado
        if (!this.gameManager.isRunning) {
            this.gameManager.startGame();
        }
        
        // CRÍTICO: Crear BattleScene CON GameManager como parámetro
        const battleScene = new BattleScene(battleConfig, this.gameManager);
        
        await this.sceneManager.transitionTo('battle', { scene: battleScene });
    }

    /**
     * Manejar logout con limpieza completa
     */
    async handleLogout() {
        try {
            this.authManager.logout();
            
            // Detener GameManager si está corriendo
            if (this.gameManager.isRunning) {
                this.gameManager.stopGame();
            }
            
            // Reinicializar flujo de autenticación
            await this.initializeAuthenticationFlow();
        } catch (error) {
            console.error('❌ Error durante logout:', error);
            // En caso de error, recargar la página como fallback
            window.location.reload();
        }
    }

    /**
     * Cleanup completo para evitar memory leaks
     */
    async shutdown() {
        if (this.isShuttingDown) return;
        
        this.isShuttingDown = true;
        
        try {
            // Detener PerformanceMonitor
            if (this.performanceMonitor) {
                this.performanceMonitor.stop();
            }
            
            // Detener GameManager
            if (this.gameManager?.isRunning) {
                this.gameManager.stopGame();
            }
            
            // Limpiar escena actual
            if (this.sceneManager?.currentScene) {
                await this.sceneManager.cleanupCurrentScene();
            }
            
            // Limpiar variables globales solo si las creamos nosotros
            if (this.IS_DEV_MODE && window.gameManager) {
                delete window.gameManager;
            }
            
            if (this.IS_DEV_MODE && window.debugController) {
                delete window.debugController;
            }
            
            this.isInitialized = false;
            console.log('✅ ApplicationController shutdown completo');
        } catch (error) {
            console.error('❌ Error durante shutdown:', error);
        }
    }

    /**
     * Obtener instancias de servicios (para uso externo si es necesario)
     */
    getServices() {
        return {
            authManager: this.authManager,
            sceneManager: this.sceneManager,
            gameManager: this.gameManager,
            performanceMonitor: this.performanceMonitor,
            apiClient: this.apiClient
        };
    }

    /**
     * Obtener estado actual de la aplicación
     */
    getApplicationState() {
        const performanceReport = this.performanceMonitor?.generateReport();
        
        return {
            isInitialized: this.isInitialized,
            isShuttingDown: this.isShuttingDown,
            currentScene: this.sceneManager?.getCurrentSceneName(),
            isAuthenticated: this.authManager?.isAuthenticated(),
            gameRunning: this.gameManager?.isRunning,
            performance: performanceReport?.summary || null,
            isDevelopmentMode: this.IS_DEV_MODE
        };
    }
}
