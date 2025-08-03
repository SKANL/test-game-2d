
/**
 * UserPreferencesManager - Gestiona las preferencias del usuario
 * Sección 10 del Documento Maestro
 */
class UserPreferencesManager {
    constructor() {
        this.preferences = null;
        this.apiClient = null; // Se asigna desde main.js
        this.isLoaded = false;
    }

    // Método estático para uso global
    static instance = new UserPreferencesManager();
    
    static setApiClient(apiClient) {
        UserPreferencesManager.instance.apiClient = apiClient;
    }

    static async loadPreferences(userId) {
        return await UserPreferencesManager.instance.loadPreferences(userId);
    }

    static getPreferences() {
        return UserPreferencesManager.instance.getPreferences();
    }

    static async updatePreferences(newPrefs) {
        return await UserPreferencesManager.instance.updatePreferences(newPrefs);
    }

    static getControlsForPlayer(playerIndex) {
        return UserPreferencesManager.instance.getControlsForPlayer(playerIndex);
    }

    static getVolume() {
        return UserPreferencesManager.instance.getVolume();
    }

    static isDebugModeEnabled() {
        return UserPreferencesManager.instance.isDebugModeEnabled();
    }

    async loadPreferences(userId) {
        if (!this.apiClient) {
            console.warn('ApiClient no configurado, usando preferencias por defecto');
            this.preferences = this.getDefaultPreferences();
            this.isLoaded = true;
            return this.preferences;
        }

        try {
            // Simula GET /api/users/me/preferences
            this.preferences = await this.apiClient.getUserPreferences(userId);
            this.isLoaded = true;
            
            // Validar y completar preferencias faltantes
            this.preferences = this.validateAndCompletePreferences(this.preferences);
            
            console.log('Preferencias cargadas exitosamente:', this.preferences);
            return this.preferences;
        } catch (error) {
            console.warn('Error cargando preferencias, usando defaults:', error);
            this.preferences = this.getDefaultPreferences();
            this.isLoaded = true;
            return this.preferences;
        }
    }

    getDefaultPreferences() {
        return {
            controls: {
                p1: {
                    up: 'w', down: 's', left: 'a', right: 'd',
                    punch: ' ', kick: 'q', special: 'e', super: 'r'
                },
                p2: {
                    up: 'ArrowUp', down: 'ArrowDown', left: 'ArrowLeft', right: 'ArrowRight',
                    punch: 'Enter', kick: 'ShiftRight', special: 'ControlRight', super: 'AltRight'
                }
            },
            audio: {
                masterVolume: 0.7,
                musicVolume: 0.6,
                sfxVolume: 0.8
            },
            graphics: {
                debugMode: false,
                showHitboxes: false,
                showFrameData: false
            },
            gameplay: {
                difficulty: 'normal',
                inputBufferTime: 150
            }
        };
    }

    validateAndCompletePreferences(prefs) {
        const defaultPrefs = this.getDefaultPreferences();
        
        // Fusionar preferencias cargadas con las por defecto
        return this.deepMerge(defaultPrefs, prefs);
    }

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

    getPreferences() {
        if (!this.isLoaded) {
            console.warn('Preferencias no cargadas, retornando defaults');
            return this.getDefaultPreferences();
        }
        return this.preferences || this.getDefaultPreferences();
    }

    async updatePreferences(newPrefs) {
        if (!this.apiClient) {
            console.warn('ApiClient no configurado, actualizando solo en memoria');
            this.preferences = this.deepMerge(this.preferences || this.getDefaultPreferences(), newPrefs);
            return this.preferences;
        }

        try {
            // Fusionar con preferencias existentes
            const updatedPrefs = this.deepMerge(this.preferences || this.getDefaultPreferences(), newPrefs);
            
            // Simula PUT /api/users/me/preferences
            this.preferences = await this.apiClient.updateUserPreferences(updatedPrefs);
            
            console.log('Preferencias actualizadas:', this.preferences);
            return this.preferences;
        } catch (error) {
            console.warn('Error actualizando preferencias:', error);
            // Actualizar solo en memoria si falla la API
            this.preferences = this.deepMerge(this.preferences || this.getDefaultPreferences(), newPrefs);
            return this.preferences;
        }
    }

    getControlsForPlayer(playerIndex) {
        const prefs = this.getPreferences();
        const playerKey = playerIndex === 1 ? 'p1' : 'p2';
        return prefs.controls && prefs.controls[playerKey] ? prefs.controls[playerKey] : this.getDefaultPreferences().controls[playerKey];
    }

    getVolume() {
        const prefs = this.getPreferences();
        return prefs.audio ? prefs.audio.masterVolume : 0.7;
    }

    getMusicVolume() {
        const prefs = this.getPreferences();
        return prefs.audio ? prefs.audio.musicVolume : 0.6;
    }

    getSFXVolume() {
        const prefs = this.getPreferences();
        return prefs.audio ? prefs.audio.sfxVolume : 0.8;
    }

    isDebugModeEnabled() {
        const prefs = this.getPreferences();
        return prefs.graphics ? prefs.graphics.debugMode : false;
    }

    shouldShowHitboxes() {
        const prefs = this.getPreferences();
        return prefs.graphics ? prefs.graphics.showHitboxes : false;
    }

    shouldShowFrameData() {
        const prefs = this.getPreferences();
        return prefs.graphics ? prefs.graphics.showFrameData : false;
    }

    getDifficulty() {
        const prefs = this.getPreferences();
        return prefs.gameplay ? prefs.gameplay.difficulty : 'normal';
    }

    getInputBufferTime() {
        const prefs = this.getPreferences();
        return prefs.gameplay ? prefs.gameplay.inputBufferTime : 150;
    }

    // Métodos para actualizar preferencias específicas
    async updateControls(playerIndex, newControls) {
        const playerKey = playerIndex === 1 ? 'p1' : 'p2';
        return await this.updatePreferences({
            controls: {
                [playerKey]: newControls
            }
        });
    }

    async updateAudioSettings(audioSettings) {
        return await this.updatePreferences({
            audio: audioSettings
        });
    }

    async updateGraphicsSettings(graphicsSettings) {
        return await this.updatePreferences({
            graphics: graphicsSettings
        });
    }

    async updateGameplaySettings(gameplaySettings) {
        return await this.updatePreferences({
            gameplay: gameplaySettings
        });
    }

    // Método para resetear a las preferencias por defecto
    async resetToDefaults() {
        return await this.updatePreferences(this.getDefaultPreferences());
    }
}

export default UserPreferencesManager;
