/**
 * AudioManager - Sistema básico de audio para el juego
 * Sección 8 del Documento Maestro
 */
export default class AudioManager {
    constructor() {
        this.sounds = new Map();
        this.music = null;
        this.volume = 0.7;
        this.musicVolume = 0.5;
        this.sfxVolume = 0.8;
        this.isEnabled = true;
        this.initialized = false;
    }

    /**
     * Inicializa el AudioManager cargando los sonidos básicos
     */
    async init() {
        if (this.initialized) {
            console.log('🔊 AudioManager ya está inicializado');
            return;
        }

        try {
            await this.loadBasicSounds();
            this.initialized = true;
            console.log('✅ AudioManager v2.0 inicializado correctamente');
        } catch (error) {
            console.error('❌ Error inicializando AudioManager:', error);
            throw error;
        }
    }

    async loadSound(name, url) {
        try {
            const audio = new Audio(url);
            audio.preload = 'auto';
            this.sounds.set(name, audio);
            console.log(`✅ Sonido cargado: ${name}`);
            return audio;
        } catch (error) {
            console.warn(`⚠️ No se pudo cargar el sonido: ${name}`, error);
            return null;
        }
    }

    async loadMusic(url) {
        try {
            this.music = new Audio(url);
            this.music.loop = true;
            this.music.volume = this.musicVolume;
            console.log(`✅ Música cargada: ${url}`);
            return this.music;
        } catch (error) {
            console.warn(`⚠️ No se pudo cargar la música: ${url}`, error);
            return null;
        }
    }

    playSound(name, volume = null) {
        if (!this.isEnabled) return;
        
        const sound = this.sounds.get(name);
        if (sound) {
            try {
                sound.currentTime = 0;
                sound.volume = (volume || this.sfxVolume) * this.volume;
                sound.play().catch(e => console.warn(`No se pudo reproducir ${name}:`, e));
            } catch (error) {
                console.warn(`Error reproduciendo ${name}:`, error);
            }
        } else {
            console.warn(`Sonido no encontrado: ${name}`);
        }
    }

    playMusic() {
        if (!this.isEnabled || !this.music) return;
        
        try {
            this.music.volume = this.musicVolume * this.volume;
            this.music.play().catch(e => console.warn('No se pudo reproducir música:', e));
        } catch (error) {
            console.warn('Error reproduciendo música:', error);
        }
    }

    stopMusic() {
        if (this.music) {
            this.music.pause();
            this.music.currentTime = 0;
        }
    }

    setVolume(volume) {
        this.volume = Math.max(0, Math.min(1, volume));
        if (this.music) {
            this.music.volume = this.musicVolume * this.volume;
        }
    }

    setMusicVolume(volume) {
        this.musicVolume = Math.max(0, Math.min(1, volume));
        if (this.music) {
            this.music.volume = this.musicVolume * this.volume;
        }
    }

    setSfxVolume(volume) {
        this.sfxVolume = Math.max(0, Math.min(1, volume));
    }

    enable() {
        this.isEnabled = true;
    }

    disable() {
        this.isEnabled = false;
        this.stopMusic();
    }

    // Cargar sonidos básicos del juego
    async loadBasicSounds() {
        // Como no tenemos archivos de audio reales, simulamos la carga
        const basicSounds = [
            'hit',
            'block',
            'jump',
            'special',
            'victory',
            'defeat'
        ];

        for (const soundName of basicSounds) {
            // Crear audio mock para desarrollo
            this.sounds.set(soundName, {
                play: () => console.log(`🔊 Reproduciendo: ${soundName}`),
                currentTime: 0,
                volume: this.sfxVolume
            });
        }

        console.log('✅ Sonidos básicos cargados (modo mock)');
    }
}
