/**
 * JuiceManager - Gestión de efectos de feedback visual REFACTORIZADO v2.0
 * PRINCIPIOS SOLID: SRP - Solo efectos de feedback y juice
 * HERENCIA: Extiende BaseManager para funcionalidad común
 * ENFOQUE: Hit stops, screen shake, particles y feedback visual
 */
import BaseManager from '../domain/base/BaseManager.js';

export default class JuiceManager extends BaseManager {
    constructor(config = {}) {
        super('JuiceManager', {
            hitStopEnabled: true,
            screenShakeEnabled: true,
            particlesEnabled: true,
            maxParticles: 100,
            ...config
        });
        
        this.hitStopFrames = 0;
        this.screenShake = { intensity: 0, duration: 0, timer: 0 };
        this.particles = [];
    }

    /**
     * Inicialización específica del JuiceManager
     */
    async initializeSpecific() {
        this.log('info', 'Inicializando JuiceManager con arquitectura SOLID');
        
        try {
            this.validateConfig();
            this.initializeParticleSystem();
            this.log('info', 'JuiceManager inicializado correctamente');
        } catch (error) {
            this.log('error', 'Error inicializando JuiceManager', error);
            throw error;
        }
    }

    /**
     * Validar configuración del manager
     */
    validateConfig() {
        const required = ['hitStopEnabled', 'screenShakeEnabled', 'particlesEnabled'];
        for (const prop of required) {
            if (this.config[prop] === undefined) {
                throw new Error(`Configuración requerida faltante: ${prop}`);
            }
        }
    }

    /**
     * Inicializar sistema de partículas
     */
    initializeParticleSystem() {
        this.particles = [];
        this.particlePool = [];
        
        // Pre-crear partículas para el pool
        for (let i = 0; i < this.config.maxParticles; i++) {
            this.particlePool.push(this.createParticle());
        }
        
        this.log('info', `Pool de partículas creado: ${this.config.maxParticles} partículas`);
    }

    /**
     * Crear una partícula del pool
     */
    createParticle() {
        return {
            x: 0, y: 0, vx: 0, vy: 0,
            life: 0, maxLife: 30,
            color: '#ffffff',
            gravity: 0.2,
            active: false
        };
    }

    /**
     * Activar hit stop por un número de frames
     * @param {number} frames - Número de frames de pausa
     */
    triggerHitStop(frames) {
        if (!this.config.hitStopEnabled) {
            this.log('debug', 'Hit stop deshabilitado en configuración');
            return;
        }
        
        this.hitStopFrames = Math.max(this.hitStopFrames, frames);
        this.log('debug', `Hit stop activado: ${frames} frames`);
        this.emit('hitStopTriggered', { frames });
    }

    /**
     * Activar screen shake
     * @param {number} intensity - Intensidad del shake
     * @param {number} duration - Duración en frames
     */
    triggerScreenShake(intensity, duration) {
        if (!this.config.screenShakeEnabled) {
            this.log('debug', 'Screen shake deshabilitado en configuración');
            return;
        }
        
        this.screenShake = {
            intensity: Math.max(this.screenShake.intensity, intensity),
            duration: Math.max(this.screenShake.duration, duration),
            timer: Math.max(this.screenShake.timer, duration)
        };
        
        this.log('debug', `Screen shake activado: intensidad=${intensity}, duración=${duration}`);
        this.emit('screenShakeTriggered', { intensity, duration });
    }

    /**
     * Crear partículas de efecto
     * @param {Object} config - Configuración de las partículas
     */
    createParticles(config) {
        if (!this.config.particlesEnabled) {
            this.log('debug', 'Partículas deshabilitadas en configuración');
            return;
        }

        const particleConfig = {
            x: 0, y: 0,
            count: 5,
            color: '#ffffff',
            velocity: { min: 1, max: 3 },
            life: 30,
            ...config
        };

        for (let i = 0; i < particleConfig.count; i++) {
            if (this.particles.length >= this.config.maxParticles) {
                this.log('debug', 'Límite máximo de partículas alcanzado');
                break;
            }

            const particle = this.getParticleFromPool();
            if (particle) {
                this.initializeParticle(particle, particleConfig);
                this.particles.push(particle);
            }
        }

        this.log('debug', `Partículas creadas: ${particleConfig.count}, total activas: ${this.particles.length}`);
        this.emit('particlesCreated', { count: particleConfig.count, config: particleConfig });
    }

    /**
     * Obtener partícula del pool
     */
    getParticleFromPool() {
        return this.particlePool.find(p => !p.active) || this.createParticle();
    }

    /**
     * Inicializar partícula con configuración
     */
    initializeParticle(particle, config) {
        const velocity = config.velocity.min + Math.random() * (config.velocity.max - config.velocity.min);
        const angle = Math.random() * Math.PI * 2;
        
        particle.x = config.x;
        particle.y = config.y;
        particle.vx = Math.cos(angle) * velocity;
        particle.vy = Math.sin(angle) * velocity;
        particle.life = config.life;
        particle.maxLife = config.life;
        particle.color = config.color;
        particle.active = true;
    }

    /**
     * Actualizar estado del manager
     */
    update() {
        try {
            this.updateHitStop();
            this.updateScreenShake();
            this.updateParticles();
        } catch (error) {
            this.log('error', 'Error en update del JuiceManager', error);
        }
    }

    /**
     * Actualizar hit stop
     */
    updateHitStop() {
        if (this.hitStopFrames > 0) {
            this.hitStopFrames--;
            if (this.hitStopFrames === 0) {
                this.emit('hitStopEnded');
            }
        }
    }

    /**
     * Actualizar screen shake
     */
    updateScreenShake() {
        if (this.screenShake.timer > 0) {
            this.screenShake.timer--;
            if (this.screenShake.timer === 0) {
                this.emit('screenShakeEnded');
            }
        }
    }

    /**
     * Actualizar partículas
     */
    updateParticles() {
        this.particles = this.particles.filter(p => {
            p.x += p.vx;
            p.y += p.vy;
            p.vy += p.gravity || 0.2;
            p.life--;
            
            if (p.life <= 0) {
                p.active = false; // Devolver al pool
                return false;
            }
            return true;
        });
    }

    /**
     * Verificar si el hit stop está activo
     * @returns {boolean}
     */
    isHitStopActive() {
        return this.hitStopFrames > 0;
    }

    /**
     * Obtener información del screen shake actual
     * @returns {Object}
     */
    getScreenShakeOffset() {
        if (this.screenShake.timer <= 0) {
            return { x: 0, y: 0 };
        }
        
        const intensity = this.screenShake.intensity * (this.screenShake.timer / this.screenShake.duration);
        return {
            x: (Math.random() - 0.5) * intensity,
            y: (Math.random() - 0.5) * intensity
        };
    }

    /**
     * Renderizar partículas en el canvas
     * @param {CanvasRenderingContext2D} ctx - Contexto del canvas
     */
    renderParticles(ctx) {
        if (!this.config.particlesEnabled || !ctx) return;
        
        this.particles.forEach(p => {
            ctx.save();
            ctx.globalAlpha = Math.max(0, p.life / p.maxLife);
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        });
    }

    /**
     * Limpiar todos los efectos activos
     */
    clearAllEffects() {
        this.hitStopFrames = 0;
        this.screenShake = { intensity: 0, duration: 0, timer: 0 };
        this.particles.forEach(p => p.active = false);
        this.particles = [];
        
        this.log('info', 'Todos los efectos limpiados');
        this.emit('allEffectsCleared');
    }

    /**
     * Obtener estadísticas del manager
     * @returns {Object}
     */
    getStats() {
        return {
            hitStopActive: this.isHitStopActive(),
            hitStopFrames: this.hitStopFrames,
            screenShakeActive: this.screenShake.timer > 0,
            activeParticles: this.particles.length,
            pooledParticles: this.particlePool.filter(p => !p.active).length,
            ...this.getMetrics()
        };
    }
}
