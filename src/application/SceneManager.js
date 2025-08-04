/**
 * SceneManager - Gestiona las transiciones y ciclo de vida de las escenas
 * REFACTORIZADO: Aplica principios SOLID y hereda de BaseManager
 * SRP: Responsabilidad única de gestionar escenas
 * OCP: Extensible para nuevos tipos de escenas
 * DIP: Depende de interfaces IScene
 */
import BaseManager from '../domain/base/BaseManager.js';

export default class SceneManager extends BaseManager {
    constructor(config = {}) {
        super('SceneManager', {
            autoStart: false,
            transitionDuration: 300,
            enablePreloading: true,
            enableCaching: false,
            maxHistorySize: 5,
            ...config
        });
        
        // Estado específico del SceneManager
        this.scenes = new Map();
        this.sceneInstances = new Map();
        this.currentScene = null;
        this.isTransitioning = false;
        this.transitionData = null;
        this.sceneHistory = [];
    }

    /**
     * Inicialización específica del SceneManager
     */
    async initializeSpecific() {
        this.log('info', 'Inicializando SceneManager con configuración SOLID');
        
        // Configurar contenedor de escenas
        this.setupSceneContainer();
        
        // Configurar eventos globales
        this.setupGlobalEvents();
    }

    /**
     * Configura el contenedor principal de escenas
     */
    setupSceneContainer() {
        console.log('🔄 SceneManager: Configurando scene-container...');
        
        // Crear contenedor si no existe
        let sceneContainer = document.getElementById('scene-container');
        if (!sceneContainer) {
            console.warn('🔄 scene-container no encontrado, creando...');
            sceneContainer = document.createElement('div');
            sceneContainer.id = 'scene-container';
            document.body.appendChild(sceneContainer);
            console.log('🔄 scene-container creado y añadido al DOM');
        } else {
            console.log('🔄 scene-container ya existe en el DOM');
        }
        
        // Forzar estilos críticos SIEMPRE
        sceneContainer.style.cssText = `
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            width: 100% !important;
            height: 100% !important;
            z-index: 1000 !important;
            overflow-x: hidden !important;
            overflow-y: auto !important;
            background: transparent !important;
            display: block !important;
            visibility: visible !important;
            pointer-events: auto !important;
        `;
        
        this.sceneContainer = sceneContainer;
        
        console.log('🔄 scene-container configurado con estilos forzados:', {
            id: sceneContainer.id,
            display: sceneContainer.style.display,
            visibility: sceneContainer.style.visibility,
            zIndex: sceneContainer.style.zIndex,
            bounds: sceneContainer.getBoundingClientRect()
        });
        
        // Verificar que esté realmente en el DOM
        if (!document.body.contains(sceneContainer)) {
            console.error('❌ scene-container no está en el DOM después de la configuración');
            document.body.appendChild(sceneContainer);
            console.log('🔄 scene-container re-añadido al DOM');
        }
    }

    /**
     * Configura eventos globales del manager
     */
    setupGlobalEvents() {
        // Listener para teclas globales
        this.globalKeyHandler = (event) => {
            if (this.currentScene && typeof this.currentScene.handleInput === 'function') {
                this.currentScene.handleInput(event);
            }
        };
        
        window.addEventListener('keydown', this.globalKeyHandler);
        
        // Listener para redimensionamiento
        this.resizeHandler = () => {
            if (this.currentScene && typeof this.currentScene.handleResize === 'function') {
                this.currentScene.handleResize();
            }
        };
        
        window.addEventListener('resize', this.resizeHandler);
    }

    /**
     * Registrar una escena en el manager (SOLID - OCP)
     */
    registerScene(name, sceneClass) {
        if (!name || !sceneClass) {
            throw new Error('Nombre de escena y clase requeridos para registro');
        }
        
        // Validar que la clase implemente la interfaz IScene
        if (typeof sceneClass.prototype?.init !== 'function' || 
            typeof sceneClass.prototype?.render !== 'function') {
            this.log('warn', `Escena ${name} no implementa completamente la interfaz IScene`);
        }
        
        this.scenes.set(name, sceneClass);
        this.log('info', `Escena ${name} registrada correctamente`);
        
        // Precargar si está habilitado y la escena no indica skipPreload
        if (this.config.enablePreloading && !sceneClass.skipPreload) {
            this.preloadScene(name, sceneClass);
        }
    }

    /**
     * Precarga una escena (SOLID - SRP)
     */
    async preloadScene(name, sceneClass) {
        // No pre-cargar escenas que requieran configuración externa
        if (sceneClass.skipPreload) {
            return;
        }
        if (this.sceneInstances.has(name)) {
            return; // Ya precargada
        }
        
        try {
            const sceneInstance = new sceneClass();
            if (typeof sceneInstance.init === 'function') {
                await sceneInstance.init();
                this.sceneInstances.set(name, sceneInstance);
                this.log('debug', `Escena ${name} precargada`);
            }
        } catch (error) {
            this.log('error', `Error al precargar escena ${name}:`, error);
        }
    }

    /**
     * Transición robusta a nueva escena (SOLID - SRP)
     */
    async transitionTo(sceneName, data = null) {
        if (this.isTransitioning) {
            this.log('warn', 'Transición ya en progreso, ignorando nueva transición');
            return false;
        }

        if (!this.scenes.has(sceneName)) {
            this.handleError('Transición fallida', new Error(`Escena ${sceneName} no está registrada`));
            return false;
        }

        this.isTransitioning = true;
        this.transitionData = data;

        try {
            this.log('info', `Iniciando transición a: ${sceneName}`);
            this.emit('transitionStart', { from: this.currentScene?.constructor.name, to: sceneName });
            
            console.log(`🔄 SceneManager: Iniciando transición a ${sceneName}`);
            
            // 1. Limpiar escena actual con manejo de errores
            await this.cleanupCurrentScene();
            
            // 2. Preparar el DOM
            this.prepareDOM(sceneName);
            
            // 3. Crear y configurar nueva escena
            await this.createNewScene(sceneName, data);
            
            // 4. Actualizar historial
            this.updateSceneHistory(sceneName);
            
            // 5. Finalizar transición
            this.finalizeTransition(sceneName);
            
            return true;
            
        } catch (error) {
            this.handleError('Error en transición de escena', error);
            this.isTransitioning = false;
            return false;
        }
    }

    /**
     * Limpiar escena actual de forma robusta (SOLID - SRP)
     */
    async cleanupCurrentScene() {
        if (!this.currentScene) return;

        try {
            this.log('debug', 'Limpiando escena actual...');
            
            // Llamar método cleanup si existe
            if (typeof this.currentScene.cleanup === 'function') {
                await this.currentScene.cleanup();
            }
            
            // Limpiar referencias
            this.currentScene = null;
            
        } catch (error) {
            this.handleError('Error al limpiar escena actual', error);
        }
    }

    /**
     * Preparar el DOM para la nueva escena (SOLID - SRP)
     */
    prepareDOM(sceneName) {
        // Verificar y re-configurar scene-container antes de cada transición
        this.ensureSceneContainerReady();
        
        // Ocultar canvas del juego si existe
        const gameCanvas = document.getElementById('gameCanvas');
        if (gameCanvas) {
            gameCanvas.style.display = 'none';
        }
        
        // También ocultar el contenedor del canvas
        const canvasContainer = document.getElementById('canvasContainer');
        if (canvasContainer) {
            canvasContainer.style.display = 'none';
        }
        
        // NO limpiar contenedores aquí - se hará después de crear la nueva escena
        this.log('debug', `DOM preparado para escena ${sceneName}`);
    }

    /**
     * Asegurar que scene-container esté listo para uso
     */
    ensureSceneContainerReady() {
        let sceneContainer = document.getElementById('scene-container');
        
        if (!sceneContainer) {
            console.warn('🔄 scene-container desaparecido, recreando...');
            sceneContainer = document.createElement('div');
            sceneContainer.id = 'scene-container';
            document.body.appendChild(sceneContainer);
        }
        
        // Forzar estilos críticos SIEMPRE antes de cada uso
        sceneContainer.style.cssText = `
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            width: 100% !important;
            height: 100% !important;
            z-index: 1000 !important;
            overflow-x: hidden !important;
            overflow-y: auto !important;
            background: transparent !important;
            display: block !important;
            visibility: visible !important;
            pointer-events: auto !important;
        `;
        
        // Verificar que esté en el DOM
        if (!document.body.contains(sceneContainer)) {
            document.body.appendChild(sceneContainer);
            console.log('🔄 scene-container re-añadido al DOM');
        }
        
        this.sceneContainer = sceneContainer;
        
        console.log('✅ scene-container verificado y listo:', {
            id: sceneContainer.id,
            display: sceneContainer.style.display,
            visibility: sceneContainer.style.visibility,
            zIndex: sceneContainer.style.zIndex,
            bounds: sceneContainer.getBoundingClientRect(),
            inDOM: document.body.contains(sceneContainer)
        });
    }

    /**
     * Limpiar contenedores de escenas anteriores DESPUÉS de crear la nueva
     */
    cleanupPreviousSceneContainers(currentSceneId) {
        const existingContainers = document.querySelectorAll('[id$="-scene-container"]:not([id="scene-container"])');
        existingContainers.forEach(container => {
            // No limpiar el contenedor de la escena actual ni el contenedor principal
            if (container.id !== currentSceneId && container.id !== 'scene-container' && container.parentNode) {
                console.log(`🧹 SceneManager: Limpiando contenedor anterior ${container.id}`);
                container.parentNode.removeChild(container);
            }
        });
        this.log('debug', `Contenedores de escenas anteriores limpiados (excepto ${currentSceneId})`);
    }

    /**
     * Crear nueva instancia de escena (SOLID - SRP)
     */
    async createNewScene(sceneName, data) {
        const SceneClass = this.scenes.get(sceneName);
        
        if (!SceneClass) {
            throw new Error(`Escena ${sceneName} no está registrada`);
        }
        
        // Usar instancia proporcionada en data (si existe)
        if (data && data.scene) {
            console.log(`🔄 SceneManager: Verificando instancia proporcionada para ${sceneName}:`, {
                provided: !!data.scene,
                sceneType: data.scene.constructor.name,
                expectedType: SceneClass.name,
                isInstance: data.scene instanceof SceneClass
            });
            
            if (data.scene instanceof SceneClass) {
                this.currentScene = data.scene;
                this.log('debug', `Usando instancia existente de escena ${sceneName}`);
            } else {
                console.warn(`⚠️ SceneManager: Instancia proporcionada no es del tipo correcto. Creando nueva instancia.`);
                this.currentScene = new SceneClass(data ? data : undefined);
                this.log('debug', `Nueva instancia de escena ${sceneName} creada (por tipo incorrecto)`);
            }
        }
        // Usar instancia precargada si está disponible y el caching está habilitado
        else if (this.config.enableCaching && this.sceneInstances.has(sceneName)) {
            this.currentScene = this.sceneInstances.get(sceneName);
            this.log('debug', `Usando escena ${sceneName} desde caché`);
        } else {
            // Crear nueva instancia
            console.log(`🔄 SceneManager: Creando nueva instancia de ${sceneName}...`);
            this.currentScene = new SceneClass(data ? data : undefined);
            this.log('debug', `Nueva instancia de escena ${sceneName} creada`);
        }
        
        // Configurar callbacks de transición si la escena los acepta
        this.setupSceneCallbacks(this.currentScene);
        
        // Inicializar si no está inicializada
        if (typeof this.currentScene.init === 'function') {
            await this.currentScene.init();
        }
        
        // Renderizar la escena
        if (typeof this.currentScene.render === 'function') {
            console.log(`🔄 SceneManager: Renderizando escena ${sceneName}...`);
            await this.currentScene.render();
            console.log(`✅ SceneManager: Escena ${sceneName} renderizada`);
        }
        
        // Verificar que la escena se haya añadido al DOM
        const currentSceneContainerId = `${sceneName}-scene-container`;
        const sceneContainerInDOM = document.getElementById(currentSceneContainerId);
        
        if (sceneContainerInDOM) {
            console.log(`✅ SceneManager: Container ${currentSceneContainerId} está en el DOM:`, {
                id: sceneContainerInDOM.id,
                display: sceneContainerInDOM.style.display,
                visibility: sceneContainerInDOM.style.visibility,
                opacity: sceneContainerInDOM.style.opacity,
                zIndex: sceneContainerInDOM.style.zIndex,
                bounds: sceneContainerInDOM.getBoundingClientRect(),
                parentElement: sceneContainerInDOM.parentElement?.id,
                children: sceneContainerInDOM.children.length
            });
        } else {
            console.error(`❌ SceneManager: Container ${currentSceneContainerId} NO está en el DOM después del render`);
        }
        
        // DESPUÉS de renderizar, limpiar contenedores de escenas anteriores
        this.cleanupPreviousSceneContainers(currentSceneContainerId);
        
        this.log('info', `Escena ${sceneName} creada y renderizada correctamente`);
    }

    /**
     * Configura callbacks para la escena (SOLID - DIP)
     */
    setupSceneCallbacks(scene) {
        // Agregar callbacks comunes si la escena los acepta
        if (typeof scene.onTransitionTo === 'function') {
            scene.onTransitionTo = (targetScene, data) => this.transitionTo(targetScene, data);
        }
        
        if (typeof scene.onGoBack === 'function') {
            scene.onGoBack = () => this.goBack();
        }
    }

    /**
     * Actualiza el historial de escenas (SOLID - SRP)
     */
    updateSceneHistory(sceneName) {
        // Evitar duplicados consecutivos
        if (this.sceneHistory.length === 0 || 
            this.sceneHistory[this.sceneHistory.length - 1] !== sceneName) {
            this.sceneHistory.push(sceneName);
        }
        
        // Mantener tamaño máximo del historial
        if (this.sceneHistory.length > this.config.maxHistorySize) {
            this.sceneHistory.shift();
        }
        
        this.log('debug', `Historial actualizado: ${this.sceneHistory.join(' -> ')}`);
    }

    /**
     * Finaliza la transición (SOLID - SRP)
     */
    finalizeTransition(sceneName) {
        this.isTransitioning = false;
        this.transitionData = null;
        
        console.log(`✅ SceneManager: Transición a ${sceneName} completada exitosamente`);
        
        this.emit('transitionComplete', { 
            scene: sceneName, 
            timestamp: Date.now() 
        });
        
        this.log('info', `Transición a ${sceneName} completada`);
    }

    /**
     * Navegar hacia atrás en el historial
     */
    async goBack() {
        if (this.sceneHistory.length < 2) {
            this.log('warn', 'No hay escena anterior en el historial');
            return false;
        }
        
        // Remover escena actual del historial
        this.sceneHistory.pop();
        
        // Obtener escena anterior
        const previousScene = this.sceneHistory[this.sceneHistory.length - 1];
        
        // Transicionar sin agregar al historial
        const originalHistoryLength = this.sceneHistory.length;
        const result = await this.transitionTo(previousScene);
        
        // Restaurar longitud del historial para evitar duplicación
        if (result) {
            this.sceneHistory.length = originalHistoryLength;
        }
        
        return result;
    }

    /**
     * Limpieza específica del SceneManager
     */
    cleanupSpecific() {
        // Limpiar event listeners globales
        if (this.globalKeyHandler) {
            window.removeEventListener('keydown', this.globalKeyHandler);
        }
        
        if (this.resizeHandler) {
            window.removeEventListener('resize', this.resizeHandler);
        }
        
        // Limpiar escena actual
        if (this.currentScene && typeof this.currentScene.cleanup === 'function') {
            this.currentScene.cleanup();
        }
        
        // Limpiar instancias precargadas
        this.sceneInstances.forEach((instance, name) => {
            if (typeof instance.cleanup === 'function') {
                instance.cleanup();
            }
        });
        
        // Limpiar referencias
        this.scenes.clear();
        this.sceneInstances.clear();
        this.currentScene = null;
        this.sceneHistory = [];
        
        // Remover contenedor de escenas
        if (this.sceneContainer && this.sceneContainer.parentNode) {
            this.sceneContainer.parentNode.removeChild(this.sceneContainer);
        }
        
        this.log('info', 'SceneManager limpiado completamente');
    }

    /**
     * Métodos de acceso (SOLID - ISP)
     */
    getCurrentScene() {
        return this.currentScene;
    }

    getCurrentSceneName() {
        return this.currentScene?.constructor.name || null;
    }

    isSceneActive(sceneName) {
        return this.getCurrentSceneName() === sceneName;
    }

    getSceneHistory() {
        return [...this.sceneHistory];
    }

    getRegisteredScenes() {
        return Array.from(this.scenes.keys());
    }

    hasScene(sceneName) {
        return this.scenes.has(sceneName);
    }

    /**
     * Métodos de estado adicionales
     */
    getTransitionState() {
        return {
            isTransitioning: this.isTransitioning,
            transitionData: this.transitionData,
            currentScene: this.getCurrentSceneName(),
            history: this.getSceneHistory()
        };
    }
}
