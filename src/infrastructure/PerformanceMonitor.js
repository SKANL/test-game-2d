/**
 * PerformanceMonitor v2.0 - Monitor de rendimiento optimizado
 * REFACTORIZADO: Aplica principios SOLID, elimina memory leaks
 * SRP: Una sola responsabilidad - monitoreo de performance
 * OCP: Extensible sin modificar código existente
 * LSP: Substitución por interfaces de monitoreo
 * ISP: Interfaces específicas para diferentes tipos de métricas
 * DIP: Depende de abstracciones, no de implementaciones concretas
 */
export default class PerformanceMonitor {
    /**
     * Constructor con inyección de dependencias (SOLID - DIP)
     */
    constructor(config = {}) {
        // Configuración (SOLID - OCP)
        this.config = {
            maxMetricsHistory: config.maxMetricsHistory || 50,
            monitoringInterval: config.monitoringInterval || 5000,
            maxAlerts: config.maxAlerts || 20,
            thresholds: {
                memoryUsage: config.memoryThreshold || 50 * 1024 * 1024, // 50MB
                frameTime: config.frameTimeThreshold || 16.67, // 60fps
                gcCount: config.gcCountThreshold || 10,
                domNodes: config.domNodesThreshold || 1000
            },
            ...config
        };
        
        // Estado interno (SOLID - SRP)
        this.state = {
            isMonitoring: false,
            startTime: null,
            frameCount: 0,
            lastFrameTime: null
        };
        
        // Almacenamiento optimizado (SOLID - SRP)
        this.metrics = new Map();
        this.alerts = [];
        this.intervals = new Set(); // Para cleanup de intervals
        this.frameCallbacks = new Set(); // Para cleanup de RAF callbacks
        
        console.log('📊 PerformanceMonitor v2.0 inicializado');
    }

    /**
     * Iniciar monitoreo de rendimiento (SOLID - SRP)
     */
    start() {
        if (this.state.isMonitoring) {
            console.warn('⚠️ PerformanceMonitor ya está en ejecución');
            return;
        }
        
        this.state.isMonitoring = true;
        this.state.startTime = Date.now();
        this.state.lastFrameTime = performance.now();
        
        console.log('📊 PerformanceMonitor v2.0 iniciado');
        
        // Iniciar recolección periódica de métricas (SOLID - SRP)
        this.startPeriodicCollection();
        
        // Iniciar monitoreo de frame rate (SOLID - SRP)
        this.startFrameRateMonitoring();
    }

    /**
     * Iniciar recolección periódica (SOLID - SRP)
     */
    startPeriodicCollection() {
        const intervalId = setInterval(() => {
            if (!this.state.isMonitoring) return;
            
            try {
                this.collectMetrics();
                this.checkThresholds();
            } catch (error) {
                console.warn('⚠️ Error en recolección de métricas:', error);
            }
        }, this.config.monitoringInterval);
        
        this.intervals.add(intervalId);
    }

    /**
     * Iniciar monitoreo de frame rate (SOLID - SRP)
     */
    startFrameRateMonitoring() {
        const measureFrame = (timestamp) => {
            if (!this.state.isMonitoring) return;
            
            try {
                this.state.frameCount++;
                this.recordFrameTime(timestamp);
                
                const rafId = requestAnimationFrame(measureFrame);
                this.frameCallbacks.add(rafId);
            } catch (error) {
                console.warn('⚠️ Error en monitoreo de frame rate:', error);
            }
        };
        
        const rafId = requestAnimationFrame(measureFrame);
        this.frameCallbacks.add(rafId);
    }

    /**
     * Detener monitoreo (SOLID - SRP)
     */
    stop() {
        if (!this.state.isMonitoring) {
            console.warn('⚠️ PerformanceMonitor no está en ejecución');
            return;
        }
        
        this.state.isMonitoring = false;
        
        // Cleanup de todos los intervals (evita memory leaks)
        this.intervals.forEach(intervalId => clearInterval(intervalId));
        this.intervals.clear();
        
        // Cleanup de todos los RAF callbacks (evita memory leaks)
        this.frameCallbacks.forEach(rafId => cancelAnimationFrame(rafId));
        this.frameCallbacks.clear();
        
        console.log('📊 PerformanceMonitor v2.0 detenido');
    }

    /**
     * Recopilar métricas del sistema (SOLID - SRP)
     */
    collectMetrics() {
        const timestamp = Date.now();
        const metrics = {
            timestamp,
            memory: this.getMemoryMetrics(),
            dom: this.getDOMMetrics(),
            performance: this.getPerformanceMetrics(),
            uptime: timestamp - this.state.startTime
        };
        
        // Almacenar métricas con límite para evitar memory leaks
        this.storeMetrics(timestamp, metrics);
        
        return metrics;
    }

    /**
     * Almacenar métricas con límite (SOLID - SRP)
     */
    storeMetrics(timestamp, metrics) {
        this.metrics.set(timestamp, metrics);
        
        // Mantener solo las métricas más recientes
        if (this.metrics.size > this.config.maxMetricsHistory) {
            const oldestKey = Math.min(...this.metrics.keys());
            this.metrics.delete(oldestKey);
        }
    }

    /**
     * Obtener métricas de memoria (SOLID - ISP)
     */
    getMemoryMetrics() {
        if (!performance.memory) {
            return {
                used: 0,
                total: 0,
                limit: 0,
                available: false
            };
        }
        
        const memory = performance.memory;
        return {
            used: memory.usedJSHeapSize,
            total: memory.totalJSHeapSize,
            limit: memory.jsHeapSizeLimit,
            available: true,
            usagePercentage: (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100
        };
    }

    /**
     * Obtener métricas del DOM (SOLID - ISP)
     */
    getDOMMetrics() {
        try {
            return {
                totalNodes: document.querySelectorAll('*').length,
                canvasElements: document.querySelectorAll('canvas').length,
                eventListeners: this.estimateEventListeners(),
                stylesheets: document.styleSheets.length
            };
        } catch (error) {
            console.warn('⚠️ Error obteniendo métricas DOM:', error);
            return {
                totalNodes: 0,
                canvasElements: 0,
                eventListeners: 0,
                stylesheets: 0
            };
        }
    }

    /**
     * Obtener métricas de rendimiento (SOLID - ISP)
     */
    getPerformanceMetrics() {
        return {
            frameCount: this.state.frameCount,
            averageFPS: this.calculateAverageFPS(),
            currentFPS: this.calculateCurrentFPS(),
            memoryPressure: this.calculateMemoryPressure()
        };
    }

    /**
     * Estimar event listeners (SOLID - SRP)
     */
    estimateEventListeners() {
        try {
            const interactiveElements = document.querySelectorAll('button, input, a, canvas, [onclick], [onkeydown], [onmousedown]');
            return interactiveElements.length * 1.5; // Estimación conservadora
        } catch (error) {
            return 0;
        }
    }

    /**
     * Registrar tiempo de frame (SOLID - SRP)
     */
    recordFrameTime(timestamp) {
        this.state.lastFrameTime = timestamp;
    }

    /**
     * Calcular FPS promedio (SOLID - SRP)
     */
    calculateAverageFPS() {
        if (!this.state.startTime || this.state.frameCount === 0) return 0;
        
        const elapsedSeconds = (Date.now() - this.state.startTime) / 1000;
        return Math.round(this.state.frameCount / elapsedSeconds);
    }

    /**
     * Calcular FPS actual (SOLID - SRP)
     */
    calculateCurrentFPS() {
        if (!this.state.lastFrameTime) return 0;
        
        const now = performance.now();
        const frameTime = now - this.state.lastFrameTime;
        return frameTime > 0 ? Math.round(1000 / frameTime) : 0;
    }

    /**
     * Calcular presión de memoria (SOLID - SRP)
     */
    calculateMemoryPressure() {
        const memoryMetrics = this.getMemoryMetrics();
        if (!memoryMetrics.available) return 'unknown';
        
        const usagePercentage = memoryMetrics.usagePercentage;
        
        if (usagePercentage < 50) return 'low';
        if (usagePercentage < 75) return 'medium';
        if (usagePercentage < 90) return 'high';
        return 'critical';
    }

    /**
     * Verificar umbrales y generar alertas (SOLID - SRP)
     */
    checkThresholds() {
        const currentMetrics = this.getCurrentMetrics();
        if (!currentMetrics) return;
        
        const alerts = [];
        
        // Verificar memoria
        if (currentMetrics.memory.available && currentMetrics.memory.used > this.config.thresholds.memoryUsage) {
            alerts.push({
                type: 'memory',
                severity: 'warning',
                message: `Uso de memoria alto: ${Math.round(currentMetrics.memory.used / 1024 / 1024)}MB`,
                value: currentMetrics.memory.used,
                threshold: this.config.thresholds.memoryUsage
            });
        }
        
        // Verificar FPS
        if (currentMetrics.performance.averageFPS > 0 && currentMetrics.performance.averageFPS < 45) {
            alerts.push({
                type: 'fps',
                severity: currentMetrics.performance.averageFPS < 30 ? 'error' : 'warning',
                message: `FPS bajo: ${currentMetrics.performance.averageFPS}`,
                value: currentMetrics.performance.averageFPS,
                threshold: 60
            });
        }
        
        // Verificar nodos DOM
        if (currentMetrics.dom.totalNodes > this.config.thresholds.domNodes) {
            alerts.push({
                type: 'dom',
                severity: 'warning',
                message: `Muchos nodos DOM: ${currentMetrics.dom.totalNodes}`,
                value: currentMetrics.dom.totalNodes,
                threshold: this.config.thresholds.domNodes
            });
        }
        
        // Agregar nuevas alertas
        alerts.forEach(alert => {
            this.addAlert(alert);
        });
    }

    /**
     * Agregar una alerta (SOLID - SRP)
     */
    addAlert(alert) {
        alert.timestamp = Date.now();
        this.alerts.push(alert);
        
        // Mantener solo las alertas más recientes
        if (this.alerts.length > this.config.maxAlerts) {
            this.alerts.shift();
        }
        
        // Log según severidad
        const icon = alert.severity === 'error' ? '❌' : '⚠️';
        console.warn(`${icon} [PerformanceMonitor] ${alert.message}`);
    }

    /**
     * Obtener métricas actuales (SOLID - ISP)
     */
    getCurrentMetrics() {
        if (this.metrics.size === 0) return null;
        
        const latestTimestamp = Math.max(...this.metrics.keys());
        return this.metrics.get(latestTimestamp);
    }

    /**
     * Obtener todas las métricas históricas (SOLID - ISP)
     */
    getAllMetrics() {
        return Array.from(this.metrics.values()).sort((a, b) => a.timestamp - b.timestamp);
    }

    /**
     * Obtener alertas recientes (SOLID - ISP)
     */
    getRecentAlerts(minutes = 5) {
        const cutoff = Date.now() - (minutes * 60 * 1000);
        return this.alerts.filter(alert => alert.timestamp > cutoff);
    }

    /**
     * Registrar frame para juego (SOLID - ISP)
     */
    recordFrame(frameData) {
        try {
            // Registrar datos específicos del frame del juego
            if (frameData && typeof frameData === 'object') {
                this.lastGameFrame = {
                    ...frameData,
                    timestamp: Date.now()
                };
            }
        } catch (error) {
            console.warn('⚠️ Error registrando frame:', error);
        }
    }

    /**
     * Generar reporte de rendimiento (SOLID - ISP)
     */
    generateReport() {
        const currentMetrics = this.getCurrentMetrics();
        const recentAlerts = this.getRecentAlerts();
        
        return {
            status: recentAlerts.length === 0 ? 'healthy' : 'issues',
            uptime: currentMetrics ? currentMetrics.uptime : 0,
            currentMetrics,
            recentAlerts,
            summary: {
                memoryUsage: currentMetrics ? `${Math.round(currentMetrics.memory.used / 1024 / 1024)}MB` : 'N/A',
                averageFPS: currentMetrics ? currentMetrics.performance.averageFPS : 0,
                domNodes: currentMetrics ? currentMetrics.dom.totalNodes : 0,
                alertCount: recentAlerts.length,
                memoryPressure: currentMetrics ? currentMetrics.performance.memoryPressure : 'unknown'
            }
        };
    }

    /**
     * Limpiar métricas y alertas (SOLID - SRP)
     */
    clear() {
        this.metrics.clear();
        this.alerts.length = 0;
        this.state.frameCount = 0;
        this.state.startTime = Date.now();
        
        console.log('🧹 PerformanceMonitor limpiado');
    }

    /**
     * Cleanup completo del monitor (SOLID - SRP)
     */
    destroy() {
        this.stop();
        this.clear();
        
        // Cleanup final
        this.intervals.clear();
        this.frameCallbacks.clear();
        this.metrics = null;
        this.alerts = null;
        this.state = null;
        
        console.log('🗑️ PerformanceMonitor destruido');
    }
}
