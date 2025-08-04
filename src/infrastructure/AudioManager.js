/**
 * AudioManager - Sistema básico de audio para el juego
 * REFACTORIZADO: Aplica principios SOLID y hereda de BaseManager
 * SRP: Responsabilidad única de gestionar audio (sonidos y música)
 * OCP: Extensible para nuevos tipos de audio (3D, efectos avanzados)
 * ISP: Interfaces específicas para sonidos y música
 * DIP: Depende de abstracciones del Web Audio API
 */
import BaseManager from '../domain/base/BaseManager.js';

export default class AudioManager extends BaseManager {
    constructor(config = {}) {
        super('AudioManager', {
            autoStart: true,
            volume: 0.7,
            musicVolume: 0.5,
            sfxVolume: 0.8,
            isEnabled: true,
            enableSpatialAudio: false,
            maxSimultaneousSounds: 10,
            ...config
        });

        // Estado específico del audio
        this.sounds = new Map();
        this.music = null;
        this.activeSounds = new Set();
        this.audioContext = null;
        this.masterGainNode = null;
        this.musicGainNode = null;
        this.sfxGainNode = null;
    }

    /**
     * Inicialización específica del AudioManager (SOLID - SRP)
     */
    async initializeSpecific() {
        this.log('info', 'Inicializando AudioManager con arquitectura SOLID');
        
        try {
            // Inicializar Web Audio API si está disponible
            await this.initializeWebAudio();
            
            // Cargar sonidos básicos
            await this.loadBasicSounds();
            
            // Configurar controles de volumen
            this.setupVolumeControls();
            
        } catch (error) {
            this.handleError('Error inicializando AudioManager', error);
            throw error;
        }
    }

    /**
     * Inicializa Web Audio API (SOLID - SRP)
     */
    async initializeWebAudio() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            
            // Crear nodos de ganancia para control de volumen
            this.masterGainNode = this.audioContext.createGain();
            this.musicGainNode = this.audioContext.createGain();
            this.sfxGainNode = this.audioContext.createGain();
            
            // Conectar nodos
            this.musicGainNode.connect(this.masterGainNode);
            this.sfxGainNode.connect(this.masterGainNode);
            this.masterGainNode.connect(this.audioContext.destination);
            
            // Configurar volúmenes iniciales
            this.masterGainNode.gain.value = this.config.volume;
            this.musicGainNode.gain.value = this.config.musicVolume;
            this.sfxGainNode.gain.value = this.config.sfxVolume;
            
            this.log('debug', 'Web Audio API inicializada correctamente');
            
        } catch (error) {
            this.log('warn', 'Web Audio API no disponible, usando HTML5 Audio');
            this.audioContext = null;
        }
    }

    /**
     * Configura controles de volumen (SOLID - SRP)
     */
    setupVolumeControls() {
        // Configurar volúmenes desde la configuración
        this.setVolume(this.config.volume);
        this.setMusicVolume(this.config.musicVolume);
        this.setSfxVolume(this.config.sfxVolume);
        
        this.log('debug', 'Controles de volumen configurados');
    }

    /**
     * Carga sonidos básicos del juego (SOLID - SRP)
     */
    async loadBasicSounds() {
        const soundsToLoad = [
            { name: 'hit', url: 'src/assets/audio/hit.mp3' },
            { name: 'block', url: 'src/assets/audio/block.mp3' },
            { name: 'jump', url: 'src/assets/audio/jump.mp3' },
            { name: 'special', url: 'src/assets/audio/special.mp3' }
        ];

        for (const sound of soundsToLoad) {
            await this.loadSound(sound.name, sound.url);
        }
        
        this.log('info', 'Sonidos básicos cargados correctamente');
    }

    /**
     * Carga un sonido individual (SOLID - SRP)
     */
    async loadSound(name, url) {
        try {
            const audio = new Audio(url);
            audio.preload = 'auto';
            audio.volume = this.config.sfxVolume;
            
            // Configurar para uso reutilizable
            audio.addEventListener('ended', () => {
                this.activeSounds.delete(audio);
            });
            
            this.sounds.set(name, audio);
            this.recordMetric('soundLoaded', 1);
            this.log('debug', `Sonido cargado: ${name}`);
            
            return audio;
        } catch (error) {
            this.log('warn', `No se pudo cargar el sonido: ${name}`, error);
            return null;
        }
    }

    /**
     * Carga música de fondo (SOLID - SRP)
     */
    async loadMusic(url) {
        try {
            this.music = new Audio(url);
            this.music.loop = true;
            this.music.volume = this.config.musicVolume;
            this.music.preload = 'auto';
            
            this.recordMetric('musicLoaded', 1);
            this.log('debug', 'Música cargada correctamente');
            
            return this.music;
        } catch (error) {
            this.handleError('Error cargando música', error);
            return null;
        }
    }

    /**
     * Reproduce un sonido (SOLID - SRP)
     */
    playSound(name, volume = null) {
        if (!this.config.isEnabled) {
            this.log('debug', 'Audio deshabilitado');
            return;
        }

        const sound = this.sounds.get(name);
        if (!sound) {
            this.log('warn', `Sonido no encontrado: ${name}`);
            return;
        }

        // Verificar límite de sonidos simultáneos
        if (this.activeSounds.size >= this.config.maxSimultaneousSounds) {
            this.log('debug', 'Límite de sonidos simultáneos alcanzado');
            return;
        }

        try {
            // Clonar el audio para permitir múltiples reproducciones
            const audioClone = sound.cloneNode();
            audioClone.volume = volume !== null ? volume : this.config.sfxVolume;
            
            this.activeSounds.add(audioClone);
            audioClone.play();
            
            this.recordMetric('soundPlayed', 1);
            this.log('debug', `Sonido reproducido: ${name}`);
            
        } catch (error) {
            this.log('warn', `Error reproduciendo sonido: ${name}`, error);
        }
    }

    /**
     * Reproduce música de fondo (SOLID - SRP)
     */
    playMusic() {
        if (!this.config.isEnabled || !this.music) {
            this.log('debug', 'Música no disponible o audio deshabilitado');
            return;
        }

        try {
            this.music.currentTime = 0;
            this.music.play();
            this.recordMetric('musicPlayed', 1);
            this.log('debug', 'Música iniciada');
        } catch (error) {
            this.log('warn', 'Error reproduciendo música', error);
        }
    }

    /**
     * Detiene la música (SOLID - SRP)
     */
    stopMusic() {
        if (this.music) {
            this.music.pause();
            this.music.currentTime = 0;
            this.log('debug', 'Música detenida');
        }
    }

    /**
     * Configura el volumen general (SOLID - ISP)
     */
    setVolume(volume) {
        this.config.volume = Math.max(0, Math.min(1, volume));
        if (this.masterGainNode) {
            this.masterGainNode.gain.value = this.config.volume;
        }
        this.log('debug', `Volumen general configurado: ${this.config.volume}`);
    }

    /**
     * Configura el volumen de música (SOLID - ISP)
     */
    setMusicVolume(volume) {
        this.config.musicVolume = Math.max(0, Math.min(1, volume));
        if (this.music) {
            this.music.volume = this.config.musicVolume;
        }
        if (this.musicGainNode) {
            this.musicGainNode.gain.value = this.config.musicVolume;
        }
        this.log('debug', `Volumen de música configurado: ${this.config.musicVolume}`);
    }

    /**
     * Configura el volumen de efectos de sonido (SOLID - ISP)
     */
    setSfxVolume(volume) {
        this.config.sfxVolume = Math.max(0, Math.min(1, volume));
        if (this.sfxGainNode) {
            this.sfxGainNode.gain.value = this.config.sfxVolume;
        }
        this.log('debug', `Volumen de SFX configurado: ${this.config.sfxVolume}`);
    }

    /**
     * Habilita el audio (SOLID - ISP)
     */
    enable() {
        this.config.isEnabled = true;
        this.log('info', 'Audio habilitado');
    }

    /**
     * Deshabilita el audio (SOLID - ISP)
     */
    disable() {
        this.config.isEnabled = false;
        this.stopMusic();
        this.stopAllSounds();
        this.log('info', 'Audio deshabilitado');
    }

    /**
     * Detiene todos los sonidos activos (SOLID - SRP)
     */
    stopAllSounds() {
        for (const sound of this.activeSounds) {
            sound.pause();
            sound.currentTime = 0;
        }
        this.activeSounds.clear();
        this.log('debug', 'Todos los sonidos detenidos');
    }

    /**
     * Limpieza específica del AudioManager (SOLID - SRP)
     */
    async cleanupSpecific() {
        // Detener todos los sonidos y música
        this.stopAllSounds();
        this.stopMusic();

        // Cerrar contexto de audio
        if (this.audioContext && this.audioContext.state !== 'closed') {
            await this.audioContext.close();
        }

        // Limpiar referencias
        this.sounds.clear();
        this.activeSounds.clear();
        this.music = null;
        this.audioContext = null;

        this.log('info', 'AudioManager limpiado completamente');
    }
}
