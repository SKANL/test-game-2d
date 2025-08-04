/**
 * ApplicationController v3.0 - Controlador principal REFACTORIZADO
 * REFACTORIZADO: Aplica principios SOLID y Clean Architecture
 * SRP: Una sola responsabilidad - orquestación de la aplicación
 * OCP: Extensible sin modificar código existente
 * LSP: Substitución por interfaces de control
 * ISP: Interfaces específicas para diferentes componentes
 * DIP: Depende de abstracciones, no de implementaciones concretas
 */
import ManagerFactory from '../infrastructure/factories/ManagerFactory.js';
import LoginScene from '../presentation/scenes/LoginScene.js';
import LoadingScene from '../presentation/scenes/LoadingScene.js';
import TitleScene from '../presentation/scenes/TitleScene.js';
import GameModeScene from '../presentation/scenes/GameModeScene.js';
import CharacterSelectScene from '../presentation/scenes/CharacterSelectScene.js';
import BattleScene from '../presentation/scenes/BattleScene.js';
import VictoryScene from '../presentation/scenes/VictoryScene.js';
import GameOverScene from '../presentation/scenes/GameOverScene.js';
import AdminDashboardScene from '../presentation/scenes/AdminDashboardScene.js';
import OptionsScene from '../presentation/scenes/OptionsScene.js';

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
        
        // Factory para crear managers con inyección de dependencias (SOLID - DIP)
        this.managerFactory = new ManagerFactory(this.config);
        
        // Servicios principales creados por factory (SOLID - SRP)
        const managers = this.managerFactory.createAllManagers();
        this.apiClient = managers.apiClient;
        this.authManager = managers.authManager;
        this.sceneManager = managers.sceneManager;
        this.gameManager = managers.gameManager;
        this.performanceMonitor = managers.performanceMonitor;
        this.userPreferencesManager = managers.userPreferencesManager;
        
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
        
        console.log('🎮 ApplicationController v3.0 inicializado con Factory Pattern');
    }

    /**
     * Configurar acceso global para debug (SOLID - ISP)
     */
    setupGlobalDebugAccess() {
        window.appController = this;
        window.gameManager = this.gameManager;
        window.sceneManager = this.sceneManager;
        window.performanceMonitor = this.performanceMonitor;
        
        // Métodos de debug específicos
        window.debugShowLogin = () => this.debugShowLogin();
        window.debugForceLogout = () => this.debugForceLogout();
        window.debugShowSceneState = () => this.debugShowSceneState();
        window.debugCleanStorage = () => this.debugCleanStorage();
        window.debugRestartApp = () => this.debugRestartApp();
        
        console.log('🐛 Acceso global configurado para debug');
        console.log('🐛 Métodos debug disponibles:');
        console.log('   - debugShowLogin() - Forzar mostrar login');
        console.log('   - debugForceLogout() - Forzar logout');
        console.log('   - debugShowSceneState() - Ver estado de escenas');
        console.log('   - debugCleanStorage() - Limpiar sessionStorage');
        console.log('   - debugRestartApp() - Reiniciar aplicación');
    }

    /**
     * Debug: Mostrar login forzado
     */
    async debugShowLogin() {
        console.log('🐛 DEBUG: Forzando mostrar login...');
        try {
            // Limpiar autenticación
            this.authManager.logout();
            
            // Mostrar login
            await this.showLoginScene();
            
            console.log('✅ DEBUG: Login mostrado forzadamente');
        } catch (error) {
            console.error('❌ DEBUG: Error mostrando login:', error);
        }
    }

    /**
     * Debug: Forzar logout
     */
    debugForceLogout() {
        console.log('🐛 DEBUG: Forzando logout...');
        this.authManager.logout();
        console.log('✅ DEBUG: Logout forzado');
    }

    /**
     * Debug: Mostrar estado de escenas
     */
    debugShowSceneState() {
        const state = {
            currentScene: this.sceneManager.getCurrentSceneName(),
            isTransitioning: this.sceneManager.isTransitioning,
            sceneContainer: document.getElementById('scene-container'),
            loginContainer: document.getElementById('login-scene-container'),
            registeredScenes: this.sceneManager.getRegisteredScenes(),
            authState: {
                isAuthenticated: this.authManager.isAuthenticated(),
                user: this.authManager.getUser(),
                token: this.authManager.getToken()
            },
            sessionStorage: {
                authToken: sessionStorage.getItem('authToken'),
                currentUser: sessionStorage.getItem('currentUser')
            }
        };
        
        console.log('🐛 DEBUG: Estado actual de escenas:', state);
        return state;
    }

    /**
     * Debug: Limpiar sessionStorage
     */
    debugCleanStorage() {
        console.log('🐛 DEBUG: Limpiando sessionStorage...');
        sessionStorage.clear();
        console.log('✅ DEBUG: sessionStorage limpiado completamente');
        
        // Reinicializar AuthManager
        this.authManager.authToken = null;
        this.authManager.currentUser = null;
        console.log('✅ DEBUG: AuthManager reiniciado');
    }

    /**
     * Debug: Reiniciar aplicación
     */
    debugRestartApp() {
        console.log('🐛 DEBUG: Reiniciando aplicación...');
        this.debugCleanStorage();
        window.location.reload();
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
        console.log('🔧 Inicializando servicios...');
        
        // 1. Inicializar AuthManager
        console.log('🔧 Inicializando AuthManager...');
        this.authManager.init();
        console.log('✅ AuthManager inicializado');
        
        // 2. Inicializar PerformanceMonitor en modo desarrollo
        if (this.config.isDevelopment) {
            console.log('🔧 Inicializando PerformanceMonitor...');
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
            ['victory', VictoryScene],
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
        console.log('🔐 Iniciando flujo de autenticación...');
        
        const isAuthenticated = this.authManager.isAuthenticated();
        console.log('🔐 Usuario autenticado:', isAuthenticated);
        
        if (!isAuthenticated) {
            console.log('🔐 Usuario no autenticado, mostrando login...');
            await this.showLoginScene();
        } else {
            const user = this.authManager.getUser();
            console.log('🔐 Usuario autenticado encontrado:', user);
            await this.handleAuthentication(user.role);
        }
    }

    /**
     * Mostrar escena de login usando SceneManager
     */
    async showLoginScene() {
        console.log('🔐 ApplicationController.showLoginScene() llamado');
        try {
            await this.sceneManager.transitionTo('login');
            console.log('✅ Transición a login completada');
        } catch (error) {
            console.error('❌ Error en transición a login:', error);
            throw error;
        }
    }

    /**
     * Callback de autenticación exitosa desde LoginScene
     * @param {Object} user - Datos del usuario autenticado
     */
    async onAuthenticationSuccess(user) {
        console.log('✅ Autenticación exitosa para:', user.email);
        try {
            await this.handleAuthentication(user.role);
        } catch (error) {
            console.error('❌ Error manejando autenticación exitosa:', error);
            // Si falla, volver a mostrar login
            await this.showLoginScene();
        }
    }

    /**
     * Manejar autenticación exitosa con carga de preferencias
     */
    async handleAuthentication(role) {
        try {
            // Cargar preferencias del usuario
            const user = this.authManager.getUser();
            console.log('🔐 Usuario obtenido para preferencias:', user);
            
            if (user && user.id) {
                await this.userPreferencesManager.loadPreferences(user.id);
                console.log('✅ Preferencias cargadas correctamente');
            } else {
                console.warn('⚠️ Usuario sin ID válido, omitiendo carga de preferencias');
            }
            
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
        console.log('🔄 ApplicationController.transitionToTitle() iniciado');
        
        const titleScene = new TitleScene(
            () => this.transitionToGameMode(),     // onStartGame
            () => this.transitionToOptions(),      // onOptions
            () => this.handleLogout()              // onExit
        );
        
        console.log('✅ TitleScene instance creada:', titleScene);
        
        const result = await this.sceneManager.transitionTo('title', { scene: titleScene });
        console.log('✅ ApplicationController.transitionToTitle() completado:', result);
        
        return result;
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
        // CRÍTICO: Crear instancia de GameModeScene con callbacks apropiados
        const gameModeScene = new GameModeScene();
        
        // La conexión se hará via applicationController global que GameModeScene ya tiene
        // No necesitamos pasar callbacks en el constructor porque GameModeScene
        // usa this.applicationController.transitionToCharacterSelect()
        
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
