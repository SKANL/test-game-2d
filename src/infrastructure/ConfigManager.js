/**
 * ConfigManager - Sistema de configuración centralizado
 * Principio SRP: Single Responsibility Principle
 * Principio OCP: Open/Closed Principle
 * Gestiona toda la configuración de la aplicación de forma centralizada
 */

export default class ConfigManager {
    constructor() {
        this.config = this.getDefaultConfig();
        this.isLoaded = false;
    }

    /**
     * Configuración por defecto del sistema
     */
    getDefaultConfig() {
        return {
            // Configuración de aplicación
            app: {
                name: 'Fighter 2D',
                version: '1.0.0',
                isDevelopment: true,
                enableDebug: true,
                enablePerformanceMonitoring: true
            },

            // Configuración de renderizado
            rendering: {
                canvasId: 'gameCanvas',
                enableImageSmoothing: false,
                debugMode: false,
                enableResponsive: true,
                targetFPS: 60
            },

            // Configuración de audio
            audio: {
                enableSound: true,
                masterVolume: 0.7,
                sfxVolume: 0.8,
                musicVolume: 0.6,
                enableSpatialAudio: false
            },

            // Configuración de input
            input: {
                bufferSize: 20,
                inputWindow: 500, // ms
                enableKeyboardInput: true,
                enableGamepadInput: true
            },

            // Configuración de red
            network: {
                useMockApi: true,
                apiBaseUrl: 'http://localhost:3000/api',
                timeout: 5000,
                retryAttempts: 3
            },

            // Configuración de rendimiento
            performance: {
                enableMonitoring: true,
                sampleRate: 60, // samples per second
                memoryThreshold: 100, // MB
                fpsThreshold: 30
            },

            // Configuración de escenas
            scenes: {
                transitionDuration: 300,
                enablePreloading: true,
                enableCaching: true
            },

            // Configuración de juego
            game: {
                roundTimer: 60, // seconds
                healthBarAnimationSpeed: 500,
                superMeterBuildRate: 1.0,
                gravity: 980, // pixels per second squared
                jumpForce: 400
            },

            // Configuración de personajes
            characters: {
                defaultHealth: 100,
                defaultSpeed: 200,
                defaultJumpForce: 400,
                frameRate: 12,
                hitStopDuration: 4
            },

            // Configuración de efectos visuales
            vfx: {
                enableParticles: true,
                particleCount: 100,
                enableScreenShake: true,
                enableHitSpark: true,
                enableTrails: true
            },

            // Configuración de UI
            ui: {
                enableAnimations: true,
                animationDuration: 300,
                enableHapticFeedback: false,
                fontSize: 16,
                fontFamily: 'Inter'
            }
        };
    }

    /**
     * Carga la configuración desde localStorage
     */
    loadConfig() {
        try {
            const savedConfig = localStorage.getItem('fighter2d_config');
            if (savedConfig) {
                const parsedConfig = JSON.parse(savedConfig);
                this.config = this.mergeConfig(this.config, parsedConfig);
                console.log('✅ Configuración cargada desde localStorage');
            }
        } catch (error) {
            console.warn('⚠️ Error al cargar configuración desde localStorage:', error);
        }
        
        this.isLoaded = true;
        return this.config;
    }

    /**
     * Guarda la configuración actual en localStorage
     */
    saveConfig() {
        try {
            localStorage.setItem('fighter2d_config', JSON.stringify(this.config));
            console.log('✅ Configuración guardada en localStorage');
        } catch (error) {
            console.error('❌ Error al guardar configuración:', error);
        }
    }

    /**
     * Combina configuraciones de forma recursiva
     */
    mergeConfig(defaultConfig, userConfig) {
        const merged = { ...defaultConfig };
        
        for (const key in userConfig) {
            if (userConfig.hasOwnProperty(key)) {
                if (typeof userConfig[key] === 'object' && userConfig[key] !== null && !Array.isArray(userConfig[key])) {
                    merged[key] = this.mergeConfig(merged[key] || {}, userConfig[key]);
                } else {
                    merged[key] = userConfig[key];
                }
            }
        }
        
        return merged;
    }

    /**
     * Obtiene un valor de configuración por path
     */
    get(path, defaultValue = null) {
        const keys = path.split('.');
        let current = this.config;
        
        for (const key of keys) {
            if (current && typeof current === 'object' && key in current) {
                current = current[key];
            } else {
                return defaultValue;
            }
        }
        
        return current;
    }

    /**
     * Establece un valor de configuración por path
     */
    set(path, value) {
        const keys = path.split('.');
        let current = this.config;
        
        for (let i = 0; i < keys.length - 1; i++) {
            const key = keys[i];
            if (!current[key] || typeof current[key] !== 'object') {
                current[key] = {};
            }
            current = current[key];
        }
        
        current[keys[keys.length - 1]] = value;
        
        // Auto-guardar si está configurado
        if (this.get('app.autoSave', true)) {
            this.saveConfig();
        }
    }

    /**
     * Obtiene toda la configuración
     */
    getAll() {
        return { ...this.config };
    }

    /**
     * Establece múltiples valores de configuración
     */
    setMany(configUpdates) {
        for (const [path, value] of Object.entries(configUpdates)) {
            this.set(path, value);
        }
    }

    /**
     * Resetea la configuración a valores por defecto
     */
    reset() {
        this.config = this.getDefaultConfig();
        this.saveConfig();
        console.log('🔄 Configuración reseteada a valores por defecto');
    }

    /**
     * Obtiene configuración específica para un módulo
     */
    getModuleConfig(moduleName) {
        return this.get(moduleName, {});
    }

    /**
     * Actualiza configuración de un módulo específico
     */
    updateModuleConfig(moduleName, updates) {
        const currentConfig = this.getModuleConfig(moduleName);
        const updatedConfig = { ...currentConfig, ...updates };
        this.set(moduleName, updatedConfig);
    }

    /**
     * Valida la configuración actual
     */
    validate() {
        const errors = [];
        
        // Validaciones básicas
        if (this.get('rendering.targetFPS') < 1 || this.get('rendering.targetFPS') > 240) {
            errors.push('rendering.targetFPS debe estar entre 1 y 240');
        }
        
        if (this.get('audio.masterVolume') < 0 || this.get('audio.masterVolume') > 1) {
            errors.push('audio.masterVolume debe estar entre 0 y 1');
        }
        
        if (this.get('game.roundTimer') < 10 || this.get('game.roundTimer') > 300) {
            errors.push('game.roundTimer debe estar entre 10 y 300 segundos');
        }
        
        return {
            isValid: errors.length === 0,
            errors
        };
    }

    /**
     * Exporta la configuración actual
     */
    export() {
        return JSON.stringify(this.config, null, 2);
    }

    /**
     * Importa configuración desde JSON
     */
    import(configJson) {
        try {
            const importedConfig = JSON.parse(configJson);
            this.config = this.mergeConfig(this.getDefaultConfig(), importedConfig);
            this.saveConfig();
            console.log('✅ Configuración importada correctamente');
            return true;
        } catch (error) {
            console.error('❌ Error al importar configuración:', error);
            return false;
        }
    }

    /**
     * Obtiene información sobre la configuración
     */
    getInfo() {
        return {
            isLoaded: this.isLoaded,
            configSize: JSON.stringify(this.config).length,
            lastModified: this.get('_meta.lastModified', 'Unknown'),
            version: this.get('app.version', '1.0.0')
        };
    }
}

// Instancia singleton
const configManager = new ConfigManager();
export { configManager };
