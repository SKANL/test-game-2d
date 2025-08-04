/**
 * BaseManager - Clase base para todos los managers
 * Principio SRP: Single Responsibility Principle
 * Principio OCP: Open/Closed Principle
 * Implementa funcionalidad común a todos los managers
 */
import IManager from '../interfaces/IManager.js';

export default class BaseManager extends IManager {
    constructor(name, config = {}) {
        super();
        this.name = name;
        this.config = {
            autoStart: false,
            enableLogging: true,
            logLevel: 'info', // 'debug', 'info', 'warn', 'error'
            ...config
        };
        
        // Estado interno común
        this.isInitialized = false;
        this.isRunning = false;
        this.lastError = null;
        this.state = {};
        
        // Sistema de eventos simple
        this.eventListeners = new Map();
        
        // Métricas básicas
        this.metrics = {
            startTime: null,
            updateCount: 0,
            errorCount: 0,
            lastUpdateTime: null
        };
        
        this.log('info', `Manager ${this.name} creado`);
    }

    /**
     * Inicialización base común
     */
    async init() {
        if (this.isInitialized) {
            this.log('warn', `Manager ${this.name} ya inicializado`);
            return;
        }

        try {
            this.log('info', `Inicializando manager ${this.name}...`);
            
            // Marcar tiempo de inicio
            this.metrics.startTime = Date.now();
            
            // Llamar a inicialización específica del manager
            await this.initializeSpecific();
            
            this.isInitialized = true;
            
            // Auto-start si está configurado
            if (this.config.autoStart) {
                this.start();
            }
            
            this.log('info', `Manager ${this.name} inicializado correctamente`);
            this.emit('initialized');
            
        } catch (error) {
            this.handleError('Error en inicialización', error);
            throw error;
        }
    }

    /**
     * Método que deben implementar las subclases para inicialización específica
     */
    async initializeSpecific() {
        // Implementación por defecto vacía
        // Las subclases pueden sobrescribir este método
    }

    /**
     * Actualización base con métricas
     */
    update(deltaTime) {
        if (!this.isInitialized || !this.isRunning) {
            return;
        }

        try {
            // Actualizar métricas
            this.metrics.updateCount++;
            this.metrics.lastUpdateTime = Date.now();
            
            // Llamar a actualización específica
            this.updateSpecific(deltaTime);
            
        } catch (error) {
            this.handleError('Error en update', error);
        }
    }

    /**
     * Método que deben implementar las subclases para actualización específica
     */
    updateSpecific(deltaTime) {
        // Implementación por defecto vacía
        // Las subclases pueden sobrescribir este método
    }

    /**
     * Inicia el manager
     */
    start() {
        if (!this.isInitialized) {
            this.log('warn', `Intentando iniciar manager ${this.name} no inicializado`);
            return false;
        }

        if (this.isRunning) {
            this.log('warn', `Manager ${this.name} ya está en ejecución`);
            return false;
        }

        this.isRunning = true;
        this.log('info', `Manager ${this.name} iniciado`);
        this.emit('started');
        return true;
    }

    /**
     * Detiene el manager
     */
    stop() {
        if (!this.isRunning) {
            this.log('warn', `Manager ${this.name} ya está detenido`);
            return false;
        }

        this.isRunning = false;
        this.log('info', `Manager ${this.name} detenido`);
        this.emit('stopped');
        return true;
    }

    /**
     * Limpieza base de recursos
     */
    cleanup() {
        this.log('info', `Limpiando recursos de manager ${this.name}...`);
        
        // Detener si está ejecutándose
        if (this.isRunning) {
            this.stop();
        }
        
        // Limpiar eventos
        this.eventListeners.clear();
        
        // Llamar a limpieza específica
        this.cleanupSpecific();
        
        // Resetear estado
        this.isInitialized = false;
        this.state = {};
        this.lastError = null;
        
        this.log('info', `Manager ${this.name} limpiado`);
        this.emit('cleaned');
    }

    /**
     * Método que pueden implementar las subclases para limpieza específica
     */
    cleanupSpecific() {
        // Implementación por defecto vacía
    }

    /**
     * Obtiene el estado actual
     */
    getState() {
        return {
            name: this.name,
            isInitialized: this.isInitialized,
            isRunning: this.isRunning,
            metrics: { ...this.metrics },
            lastError: this.lastError,
            state: { ...this.state }
        };
    }

    /**
     * Establece el estado
     */
    setState(newState) {
        const previousState = { ...this.state };
        this.state = { ...this.state, ...newState };
        
        this.emit('stateChanged', {
            previous: previousState,
            current: this.state
        });
        
        this.log('debug', `Estado actualizado en manager ${this.name}`);
    }

    /**
     * Sistema de eventos simple
     */
    on(event, callback) {
        if (!this.eventListeners.has(event)) {
            this.eventListeners.set(event, []);
        }
        this.eventListeners.get(event).push(callback);
    }

    /**
     * Emite un evento
     */
    emit(event, data = null) {
        if (this.eventListeners.has(event)) {
            this.eventListeners.get(event).forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    this.log('error', `Error en callback de evento ${event}:`, error);
                }
            });
        }
    }

    /**
     * Remueve un listener de evento
     */
    off(event, callback) {
        if (this.eventListeners.has(event)) {
            const listeners = this.eventListeners.get(event);
            const index = listeners.indexOf(callback);
            if (index !== -1) {
                listeners.splice(index, 1);
            }
        }
    }

    /**
     * Manejo centralizado de errores
     */
    handleError(context, error) {
        this.metrics.errorCount++;
        this.lastError = {
            context,
            error: error.message || error,
            timestamp: Date.now()
        };
        
        this.log('error', `${context} en manager ${this.name}:`, error);
        this.emit('error', this.lastError);
    }

    /**
     * Sistema de logging configurable
     */
    log(level, message, ...args) {
        if (!this.config.enableLogging) return;
        
        const levels = ['debug', 'info', 'warn', 'error'];
        const currentLevelIndex = levels.indexOf(this.config.logLevel);
        const messageLevelIndex = levels.indexOf(level);
        
        if (messageLevelIndex >= currentLevelIndex) {
            const timestamp = new Date().toISOString();
            const prefix = `[${timestamp}] [${this.name}] [${level.toUpperCase()}]`;
            console[level](prefix, message, ...args);
        }
    }

    /**
     * Registra una métrica personalizada (SOLID - SRP)
     */
    recordMetric(metricName, value = 1) {
        if (!this.metrics.custom) {
            this.metrics.custom = {};
        }
        
        if (!this.metrics.custom[metricName]) {
            this.metrics.custom[metricName] = 0;
        }
        
        this.metrics.custom[metricName] += value;
        this.log('debug', `Métrica registrada: ${metricName} = ${this.metrics.custom[metricName]}`);
    }

    /**
     * Obtiene métricas del manager
     */
    getMetrics() {
        return {
            ...this.metrics,
            uptime: this.metrics.startTime ? Date.now() - this.metrics.startTime : 0,
            updatesPerSecond: this.calculateUpdatesPerSecond()
        };
    }

    /**
     * Calcula las actualizaciones por segundo
     */
    calculateUpdatesPerSecond() {
        if (!this.metrics.startTime || this.metrics.updateCount === 0) {
            return 0;
        }
        
        const uptime = Date.now() - this.metrics.startTime;
        return (this.metrics.updateCount / uptime) * 1000;
    }

    /**
     * Resetea las métricas
     */
    resetMetrics() {
        this.metrics = {
            startTime: this.isInitialized ? Date.now() : null,
            updateCount: 0,
            errorCount: 0,
            lastUpdateTime: null
        };
        
        this.log('info', `Métricas de manager ${this.name} reseteadas`);
    }
}
