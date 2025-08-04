/**
 * UserPreferencesManager - Gestiona las preferencias del usuario
 * REFACTORIZADO: Aplica principios SOLID y hereda de BaseManager
 * SRP: Responsabilidad única de gestionar preferencias del usuario
 * OCP: Extensible para nuevos tipos de preferencias
 * ISP: Interfaces específicas para diferentes tipos de configuración
 * DIP: Depende de abstracciones para persistencia de datos
 */
import BaseManager from '../domain/base/BaseManager.js';

export default class UserPreferencesManager extends BaseManager {
    constructor(apiClient = null, config = {}) {
        super('UserPreferencesManager', {
            autoStart: true,
            enableLocalStorage: true,
            enableCloudSync: false,
            autoSave: true,
            storageKey: 'game-user-preferences',
            ...config
        });

        // Estado específico de preferencias
        this.preferences = null;
        this.apiClient = apiClient;
        this.defaultPreferences = null;
        this.autoSaveTimeout = null;
        
        // Instancia singleton para compatibilidad con código legacy
        if (!UserPreferencesManager.instance) {
            UserPreferencesManager.instance = this;
        }
    }

    /**
     * Inicialización específica del UserPreferencesManager (SOLID - SRP)
     */
    async initializeSpecific() {
        this.log('info', 'Inicializando UserPreferencesManager con arquitectura SOLID');
        
        // Establecer preferencias por defecto
        this.setupDefaultPreferences();
        
        // Cargar preferencias desde almacenamiento
        await this.loadStoredPreferences();
        
        // Configurar auto-guardado si está habilitado
        if (this.config.autoSave) {
            this.setupAutoSave();
        }
    }

    /**
     * Configura las preferencias por defecto (SOLID - SRP)
     */
    setupDefaultPreferences() {
        this.defaultPreferences = {
            audio: {
                masterVolume: 0.7,
                musicVolume: 0.5,
                sfxVolume: 0.8,
                enabled: true
            },
            graphics: {
                quality: 'medium',
                showFPS: false,
                enableParticles: true,
                enableScreenShake: true
            },
            controls: {
                player1: {
                    up: 'w',
                    down: 's',
                    left: 'a',
                    right: 'd',
                    punch: ' ',
                    kick: 'q',
                    special: 'e',
                    super: 'r'
                },
                player2: {
                    up: 'ArrowUp',
                    down: 'ArrowDown',
                    left: 'ArrowLeft',
                    right: 'ArrowRight',
                    punch: 'Enter',
                    kick: 'Shift',
                    special: 'Control',
                    super: 'Alt'
                }
            },
            gameplay: {
                difficulty: 'normal',
                enableTutorials: true,
                showComboPrompts: true,
                pauseOnFocusLoss: true
            },
            ui: {
                language: 'es',
                theme: 'dark',
                showDebugInfo: false
            },
            user: {
                id: null,
                username: 'Jugador',
                stats: {
                    gamesPlayed: 0,
                    wins: 0,
                    losses: 0
                }
            }
        };
        
        this.log('debug', 'Preferencias por defecto configuradas');
    }

    /**
     * Carga preferencias almacenadas (SOLID - SRP)
     */
    async loadStoredPreferences() {
        try {
            if (this.config.enableLocalStorage) {
                await this.loadFromLocalStorage();
            }
            
            if (this.config.enableCloudSync && this.apiClient) {
                await this.loadFromCloud();
            }
            
            // Si no se cargaron preferencias, usar las por defecto
            if (!this.preferences) {
                this.preferences = { ...this.defaultPreferences };
                this.log('info', 'Usando preferencias por defecto');
            }
            
            // Validar y completar preferencias
            this.preferences = this.validateAndCompletePreferences(this.preferences);
            
        } catch (error) {
            this.handleError('Error cargando preferencias', error);
            this.preferences = { ...this.defaultPreferences };
        }
    }

    /**
     * Carga preferencias desde localStorage (SOLID - SRP)
     */
    async loadFromLocalStorage() {
        try {
            const stored = localStorage.getItem(this.config.storageKey);
            if (stored) {
                this.preferences = JSON.parse(stored);
                this.log('debug', 'Preferencias cargadas desde localStorage');
                this.recordMetric('preferencesLoadedLocal', 1);
            }
        } catch (error) {
            this.log('warn', 'Error cargando desde localStorage', error);
        }
    }

    /**
     * Carga preferencias desde la nube (SOLID - SRP)
     */
    async loadFromCloud() {
        try {
            if (this.apiClient && typeof this.apiClient.getUserPreferences === 'function') {
                const cloudPreferences = await this.apiClient.getUserPreferences();
                if (cloudPreferences) {
                    this.preferences = cloudPreferences;
                    this.log('debug', 'Preferencias cargadas desde la nube');
                    this.recordMetric('preferencesLoadedCloud', 1);
                }
            }
        } catch (error) {
            this.log('warn', 'Error cargando desde la nube', error);
        }
    }

    /**
     * Valida y completa preferencias (SOLID - SRP)
     */
    validateAndCompletePreferences(prefs) {
        return this.deepMerge(this.defaultPreferences, prefs || {});
    }

    /**
     * Realiza un merge profundo de objetos (SOLID - SRP)
     */
    deepMerge(target, source) {
        const result = { ...target };
        
        for (const key in source) {
            if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
                result[key] = this.deepMerge(target[key] || {}, source[key]);
            } else {
                result[key] = source[key];
            }
        }
        
        return result;
    }

    /**
     * Configura auto-guardado (SOLID - SRP)
     */
    setupAutoSave() {
        // Debounced auto-save para evitar guardado excesivo
        this.debouncedSave = this.debounce(() => {
            this.savePreferences();
        }, 1000);
        
        this.log('debug', 'Auto-guardado configurado');
    }

    /**
     * Obtiene las preferencias actuales (SOLID - ISP)
     */
    getPreferences() {
        return this.preferences;
    }

    /**
     * Carga las preferencias para un usuario específico (SOLID - SRP)
     */
    async loadPreferences(userId) {
        try {
            this.log('info', `Cargando preferencias para usuario: ${userId}`);
            await this.loadStoredPreferences();
            this.recordMetric('preferencesLoaded', 1);
            this.log('info', 'Preferencias cargadas correctamente');
            return this.preferences;
        } catch (error) {
            this.log('error', 'Error cargando preferencias', error);
            // Cargar preferencias por defecto en caso de error
            this.preferences = { ...this.defaultPreferences };
            return this.preferences;
        }
    }

    /**
     * Actualiza las preferencias (SOLID - ISP)
     */
    async updatePreferences(newPrefs) {
        try {
            this.preferences = this.deepMerge(this.preferences, newPrefs);
            this.recordMetric('preferencesUpdated', 1);
            this.log('debug', 'Preferencias actualizadas');
            
            // Trigger auto-save si está habilitado
            if (this.config.autoSave && this.debouncedSave) {
                this.debouncedSave();
            }
            
            // Emitir evento para notificar cambios
            this.emit('preferencesUpdated', this.preferences);
            
            return this.preferences;
        } catch (error) {
            this.handleError('Error actualizando preferencias', error);
            throw error;
        }
    }

    /**
     * Guarda las preferencias (SOLID - SRP)
     */
    async savePreferences() {
        try {
            if (this.config.enableLocalStorage) {
                localStorage.setItem(this.config.storageKey, JSON.stringify(this.preferences));
                this.log('debug', 'Preferencias guardadas en localStorage');
            }
            
            if (this.config.enableCloudSync && this.apiClient) {
                await this.saveToCloud();
            }
            
            this.recordMetric('preferencesSaved', 1);
            
        } catch (error) {
            this.handleError('Error guardando preferencias', error);
        }
    }

    /**
     * Guarda preferencias en la nube (SOLID - SRP)
     */
    async saveToCloud() {
        try {
            if (this.apiClient && typeof this.apiClient.updateUserPreferences === 'function') {
                await this.apiClient.updateUserPreferences(this.preferences);
                this.log('debug', 'Preferencias guardadas en la nube');
            }
        } catch (error) {
            this.log('warn', 'Error guardando en la nube', error);
        }
    }

    /**
     * Obtiene controles para un jugador específico (SOLID - ISP)
     */
    getControlsForPlayer(playerIndex) {
        const playerKey = playerIndex === 1 ? 'player1' : 'player2';
        return this.preferences?.controls?.[playerKey] || this.defaultPreferences.controls[playerKey];
    }

    /**
     * Obtiene configuración de volumen (SOLID - ISP)
     */
    getVolume() {
        return this.preferences?.audio || this.defaultPreferences.audio;
    }

    /**
     * Verifica si el modo debug está habilitado (SOLID - ISP)
     */
    isDebugModeEnabled() {
        return this.preferences?.ui?.showDebugInfo || false;
    }

    /**
     * Resetea las preferencias a valores por defecto (SOLID - ISP)
     */
    async resetToDefaults() {
        this.preferences = { ...this.defaultPreferences };
        await this.savePreferences();
        this.emit('preferencesReset', this.preferences);
        this.log('info', 'Preferencias reseteadas a valores por defecto');
    }

    /**
     * Helper para debounce (SOLID - SRP)
     */
    debounce(func, wait) {
        return (...args) => {
            clearTimeout(this.autoSaveTimeout);
            this.autoSaveTimeout = setTimeout(() => func.apply(this, args), wait);
        };
    }

    /**
     * Limpieza específica del UserPreferencesManager (SOLID - SRP)
     */
    async cleanupSpecific() {
        // Guardar preferencias finales
        if (this.preferences && this.config.autoSave) {
            await this.savePreferences();
        }

        // Limpiar timeouts
        if (this.autoSaveTimeout) {
            clearTimeout(this.autoSaveTimeout);
            this.autoSaveTimeout = null;
        }

        // Limpiar referencias
        this.preferences = null;
        this.apiClient = null;
        this.debouncedSave = null;

        this.log('info', 'UserPreferencesManager limpiado completamente');
    }

    // Métodos estáticos para compatibilidad con código legacy
    static instance = null;

    static setApiClient(apiClient) {
        if (UserPreferencesManager.instance) {
            UserPreferencesManager.instance.apiClient = apiClient;
        }
    }

    static async loadPreferences(userId) {
        if (UserPreferencesManager.instance) {
            return await UserPreferencesManager.instance.loadStoredPreferences();
        }
    }

    static getPreferences() {
        return UserPreferencesManager.instance?.getPreferences();
    }

    static async updatePreferences(newPrefs) {
        if (UserPreferencesManager.instance) {
            return await UserPreferencesManager.instance.updatePreferences(newPrefs);
        }
    }

    static getControlsForPlayer(playerIndex) {
        return UserPreferencesManager.instance?.getControlsForPlayer(playerIndex);
    }

    static getVolume() {
        return UserPreferencesManager.instance?.getVolume();
    }

    static isDebugModeEnabled() {
        return UserPreferencesManager.instance?.isDebugModeEnabled();
    }
}
