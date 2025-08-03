/**
 * SceneManager - Gestiona las transiciones y ciclo de vida de las escenas
 * OPTIMIZADO: Mejor manejo de memoria y transiciones más robustas
 */
export default class SceneManager {
    constructor() {
        this.currentScene = null;
        this.scenes = new Map();
        this.isTransitioning = false;
        this.transitionData = null;
        
        // Historial de escenas para navegación
        this.sceneHistory = [];
        this.maxHistorySize = 5;
    }

    /**
     * Registrar una escena en el manager
     */
    registerScene(name, sceneClass) {
        if (!name || !sceneClass) {
            throw new Error('Nombre de escena y clase requeridos');
        }
        this.scenes.set(name, sceneClass);
    }

    /**
     * Transición robusta a nueva escena
     */
    async transitionTo(sceneName, data = null) {
        if (this.isTransitioning) {
            console.warn('⚠️ Transición ya en progreso, ignorando nueva transición');
            return false;
        }

        this.isTransitioning = true;
        this.transitionData = data;

        try {
            console.log(`🔄 Iniciando transición a: ${sceneName}`);
            
            // 1. Limpiar escena actual
            await this.cleanupCurrentScene();
            
            // 2. Preparar el DOM
            this.prepareDOM(sceneName);
            
            // 3. Crear y configurar nueva escena
            await this.createNewScene(sceneName, data);
            
            // 4. Actualizar historial
            this.updateSceneHistory(sceneName);
            
            console.log(`✅ Transición completada a: ${sceneName}`);
            return true;
            
        } catch (error) {
            console.error('❌ Error durante la transición de escena:', error);
            await this.handleTransitionError(error, sceneName);
            return false;
        } finally {
            this.isTransitioning = false;
        }
    }

    /**
     * Limpiar escena actual de forma robusta
     */
    async cleanupCurrentScene() {
        if (!this.currentScene) return;

        try {
            // Llamar método cleanup si existe
            if (typeof this.currentScene.cleanup === 'function') {
                await this.currentScene.cleanup();
            }
            
            // Detener cualquier animación o timer
            if (this.currentScene.animationId) {
                cancelAnimationFrame(this.currentScene.animationId);
                this.currentScene.animationId = null;
            }
            
            // Limpiar intervalos si existen
            if (this.currentScene.intervals) {
                this.currentScene.intervals.forEach(id => clearInterval(id));
                this.currentScene.intervals = [];
            }
            
            // Limpiar timeouts si existen
            if (this.currentScene.timeouts) {
                this.currentScene.timeouts.forEach(id => clearTimeout(id));
                this.currentScene.timeouts = [];
            }
            
            // Limpiar event listeners si existen
            if (typeof this.currentScene.removeEventListeners === 'function') {
                this.currentScene.removeEventListeners();
            }
            
            console.log('🧹 Escena anterior limpiada correctamente');
        } catch (error) {
            console.error('❌ Error limpiando escena anterior:', error);
        }
    }

    /**
     * Preparar DOM para nueva escena
     */
    prepareDOM(sceneName) {
        // Limpiar completamente el body
        document.body.innerHTML = '';
        
        // Restablecer estilos del body
        document.body.style.cssText = `
            margin: 0;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            background-color: #000;
            color: #fff;
            font-family: Arial, sans-serif;
        `;

        // Preparar contenedor base según el tipo de escena
        if (sceneName === 'battle' || sceneName === 'characterSelect') {
            this.createCanvasContainer();
        } else {
            this.createUIContainer();
        }
    }

    /**
     * Crear contenedor para escenas con canvas
     */
    createCanvasContainer() {
        const container = document.createElement('div');
        container.id = 'canvasContainer';
        container.style.cssText = 'position: relative;';
        
        const canvas = document.createElement('canvas');
        canvas.id = 'gameCanvas';
        canvas.width = 1200;
        canvas.height = 600;
        canvas.style.border = '1px solid #fff';
        
        container.appendChild(canvas);
        document.body.appendChild(container);
    }

    /**
     * Crear contenedor para escenas de UI
     */
    createUIContainer() {
        const container = document.createElement('div');
        container.id = 'uiContainer';
        container.style.cssText = `
            width: 100%;
            height: 100vh;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
        `;
        document.body.appendChild(container);
    }

    /**
     * Crear nueva escena con manejo robusto de errores
     */
    async createNewScene(sceneName, data) {
        const SceneClass = this.scenes.get(sceneName);
        
        if (!SceneClass) {
            throw new Error(`Escena no encontrada: ${sceneName}`);
        }

        try {
            console.log(`🎬 Creando escena: ${sceneName} con data:`, data);
            
            // Crear instancia de la nueva escena
            if (data?.scene) {
                // Si se proporciona una instancia de escena ya creada
                this.currentScene = data.scene;
            } else {
                // Manejo especial para VictoryScene
                if (sceneName === 'victory' && data) {
                    this.currentScene = new SceneClass(data);
                } else {
                    // Crear nueva instancia normal
                    this.currentScene = data ? new SceneClass(data) : new SceneClass();
                }
            }

            // Configurar propiedades adicionales
            this.currentScene.sceneName = sceneName;
            this.currentScene.sceneManager = this;

            // Inicializar la escena si tiene método init
            if (typeof this.currentScene.init === 'function') {
                if (sceneName === 'victory' && data) {
                    await this.currentScene.init(data);
                } else {
                    await this.currentScene.init();
                }
            }

            console.log(`✅ Escena ${sceneName} creada e inicializada correctamente`);

            // Renderizar la escena
            if (typeof this.currentScene.render === 'function') {
                if (this.currentScene.render.constructor.name === 'AsyncFunction') {
                    await this.currentScene.render();
                } else {
                    this.currentScene.render();
                }
            } else {
                console.warn(`⚠️ La escena ${sceneName} no tiene método render`);
            }
            
        } catch (error) {
            console.error(`❌ Error creando escena ${sceneName}:`, error);
            throw error;
        }
    }

    /**
     * Actualizar historial de escenas
     */
    updateSceneHistory(sceneName) {
        this.sceneHistory.push(sceneName);
        
        // Mantener solo las últimas N escenas
        if (this.sceneHistory.length > this.maxHistorySize) {
            this.sceneHistory.shift();
        }
    }

    /**
     * Manejar errores de transición
     */
    async handleTransitionError(error, sceneName) {
        console.error(`❌ Error transitioning to ${sceneName}:`, error);
        
        // Intentar mostrar una escena de error o fallback
        try {
            document.body.innerHTML = `
                <div style="
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    align-items: center;
                    height: 100vh;
                    background: #1a1a1a;
                    color: #ff4444;
                    font-family: Arial, sans-serif;
                    text-align: center;
                ">
                    <h1>⚠️ Error de Transición</h1>
                    <p>No se pudo cargar la escena: ${sceneName}</p>
                    <p style="color: #888; font-size: 14px;">${error.message}</p>
                    <button onclick="location.reload()" style="
                        background: #333;
                        color: white;
                        border: 1px solid #666;
                        padding: 10px 20px;
                        margin-top: 20px;
                        cursor: pointer;
                        border-radius: 5px;
                    ">Reiniciar Aplicación</button>
                </div>
            `;
        } catch (fallbackError) {
            console.error('❌ Error en fallback de transición:', fallbackError);
            // Último recurso: recargar la página
            window.location.reload();
        }
    }

    /**
     * Métodos de utilidad
     */
    getCurrentScene() {
        return this.currentScene;
    }

    getCurrentSceneName() {
        return this.currentScene?.sceneName || null;
    }

    isSceneActive(sceneName) {
        return this.getCurrentSceneName() === sceneName;
    }

    getSceneHistory() {
        return [...this.sceneHistory];
    }

    /**
     * Navegar a la escena anterior
     */
    async goBack() {
        if (this.sceneHistory.length < 2) {
            console.warn('⚠️ No hay escena anterior disponible');
            return false;
        }
        
        // Remover escena actual del historial
        this.sceneHistory.pop();
        
        // Obtener escena anterior
        const previousScene = this.sceneHistory[this.sceneHistory.length - 1];
        
        // Transicionar sin añadir al historial nuevamente
        const originalHistory = [...this.sceneHistory];
        const result = await this.transitionTo(previousScene);
        
        if (result) {
            this.sceneHistory = originalHistory; // Restaurar historial
        }
        
        return result;
    }

    /**
     * Comunicación entre escenas
     */
    sendDataToScene(data) {
        if (this.currentScene && typeof this.currentScene.receiveData === 'function') {
            this.currentScene.receiveData(data);
        }
    }

    /**
     * Pausar/reanudar la escena actual
     */
    pauseCurrentScene() {
        if (this.currentScene && typeof this.currentScene.pause === 'function') {
            this.currentScene.pause();
        }
    }

    resumeCurrentScene() {
        if (this.currentScene && typeof this.currentScene.resume === 'function') {
            this.currentScene.resume();
        }
    }

    /**
     * Cleanup completo del SceneManager
     */
    async shutdown() {
        await this.cleanupCurrentScene();
        this.currentScene = null;
        this.scenes.clear();
        this.sceneHistory = [];
        this.isTransitioning = false;
        console.log('🛑 SceneManager shutdown completo');
    }
}
