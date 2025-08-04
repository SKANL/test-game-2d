/**
 * BaseScene - Clase base para todas las escenas
 * Principio SRP: Single Responsibility Principle
 * Principio OCP: Open/Closed Principle - Extensible sin modificación
 * Implementa funcionalidad común a todas las escenas
 */
import IScene from '../interfaces/IScene.js';
import ResponsiveUtils from '../../infrastructure/ResponsiveUtils.js';

export default class BaseScene extends IScene {
    constructor(sceneId) {
        super();
        this.sceneId = sceneId;
        this.isInitialized = false;
        this.isPaused = false;
        this.container = null;
        this.eventListeners = [];
        this.animations = [];
        this.timeouts = [];
        this.intervals = [];
        
        // Configuración responsiva
        this.isResponsive = true;
        this.responsiveConfig = {
            breakpoints: ResponsiveUtils.BREAKPOINTS || {
                mobile: 768,
                tablet: 1024,
                desktop: 1440
            }
        };
    }

    /**
     * Inicialización base común a todas las escenas
     */
    async init() {
        if (this.isInitialized) {
            console.warn(`⚠️ Escena ${this.sceneId} ya inicializada`);
            return;
        }

        try {
            // Inicializar sistema responsivo
            if (this.isResponsive) {
                ResponsiveUtils.init();
            }

            // Crear contenedor base
            this.createBaseContainer();

            // Configurar eventos base
            this.setupBaseEventListeners();

            this.isInitialized = true;
            console.log(`✅ Escena ${this.sceneId} inicializada`);
        } catch (error) {
            console.error(`❌ Error al inicializar escena ${this.sceneId}:`, error);
            throw error;
        }
    }

    /**
     * Crea el contenedor base para la escena
     */
    createBaseContainer() {
        // Limpiar contenedor previo si existe
        this.cleanup();

        this.container = document.createElement('div');
        this.container.id = `${this.sceneId}-scene-container`;
        this.container.className = 'scene-container';
        
        // Estilos base responsivos
        this.container.style.cssText = this.getBaseContainerStyles();
        
        document.body.appendChild(this.container);
    }

    /**
     * Obtiene estilos base para el contenedor
     */
    getBaseContainerStyles() {
        return `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: var(--dark-bg);
            background-image: 
                radial-gradient(circle at 20% 80%, rgba(0, 242, 255, 0.15) 0%, transparent 50%),
                radial-gradient(circle at 80% 20%, rgba(255, 0, 193, 0.15) 0%, transparent 50%);
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            z-index: 1000;
            font-family: 'Inter', sans-serif;
            overflow: hidden;
            transition: opacity 0.3s ease, transform 0.3s ease;
        `;
    }

    /**
     * Configura event listeners base
     */
    setupBaseEventListeners() {
        // Listener para tecla ESC (comportamiento común)
        const escapeHandler = (event) => {
            if (event.key === 'Escape' && !this.isPaused) {
                this.handleEscape();
            }
        };

        this.addEventListener('keydown', escapeHandler);

        // Listener para redimensionamiento
        if (this.isResponsive) {
            const resizeHandler = () => this.handleResize();
            this.addEventListener('resize', resizeHandler);
        }
    }

    /**
     * Añade un event listener y lo registra para limpieza automática
     */
    addEventListener(event, handler, element = window) {
        element.addEventListener(event, handler);
        this.eventListeners.push({ element, event, handler });
    }

    /**
     * Maneja la tecla ESC (puede ser sobrescrito por subclases)
     */
    handleEscape() {
        console.log(`ESC presionado en escena ${this.sceneId}`);
    }

    /**
     * Maneja el redimensionamiento de ventana
     */
    handleResize() {
        if (this.container && this.isResponsive) {
            // Lógica base de redimensionamiento
            ResponsiveUtils.setupResponsiveContainer(this.container);
        }
    }

    /**
     * Actualización base (puede ser extendida por subclases)
     */
    update(deltaTime) {
        if (this.isPaused) return;
        
        // Actualizar animaciones activas
        this.updateAnimations(deltaTime);
    }

    /**
     * Actualiza animaciones registradas
     */
    updateAnimations(deltaTime) {
        this.animations = this.animations.filter(animation => {
            if (animation.update) {
                return animation.update(deltaTime);
            }
            return true;
        });
    }

    /**
     * Pausa la escena
     */
    pause() {
        this.isPaused = true;
        console.log(`⏸️ Escena ${this.sceneId} pausada`);
    }

    /**
     * Reanuda la escena
     */
    resume() {
        this.isPaused = false;
        console.log(`▶️ Escena ${this.sceneId} reanudada`);
    }

    /**
     * Limpia todos los recursos de la escena
     */
    cleanup() {
        // Limpiar event listeners
        this.eventListeners.forEach(({ element, event, handler }) => {
            element.removeEventListener(event, handler);
        });
        this.eventListeners = [];

        // Limpiar timeouts
        this.timeouts.forEach(timeout => clearTimeout(timeout));
        this.timeouts = [];

        // Limpiar intervals
        this.intervals.forEach(interval => clearInterval(interval));
        this.intervals = [];

        // Limpiar animaciones
        this.animations = [];

        // Remover contenedor del DOM
        if (this.container && this.container.parentNode) {
            this.container.parentNode.removeChild(this.container);
            this.container = null;
        }

        console.log(`🧹 Recursos de escena ${this.sceneId} limpiados`);
    }

    /**
     * Añade un timeout y lo registra para limpieza automática
     */
    setTimeout(callback, delay) {
        const timeoutId = setTimeout(callback, delay);
        this.timeouts.push(timeoutId);
        return timeoutId;
    }

    /**
     * Añade un interval y lo registra para limpieza automática
     */
    setInterval(callback, interval) {
        const intervalId = setInterval(callback, interval);
        this.intervals.push(intervalId);
        return intervalId;
    }

    /**
     * Registra una animación para actualización automática
     */
    registerAnimation(animation) {
        this.animations.push(animation);
    }

    /**
     * Método abstracto que debe ser implementado por subclases
     */
    render() {
        throw new Error(`El método render() debe ser implementado en la subclase de ${this.sceneId}`);
    }
}
