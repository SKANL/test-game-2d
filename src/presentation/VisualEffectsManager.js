/**
 * VisualEffectsManager - Sistema centralizado de efectos visuales épicos
 * REFACTORIZADO: Aplica principios SOLID y hereda de BaseManager
 * SRP: Responsabilidad única de gestionar efectos visuales
 * OCP: Extensible para nuevos tipos de efectos
 * ISP: Interfaces específicas para diferentes tipos de efectos
 * DIP: Depende de abstracciones para anime.js
 */
import BaseManager from '../domain/base/BaseManager.js';

export default class VisualEffectsManager extends BaseManager {
    constructor(config = {}) {
        super('VisualEffectsManager', {
            autoStart: true,
            enableParticles: true,
            enableScreenShake: true,
            enableHitSpark: true,
            enableTrails: true,
            maxParticles: 100,
            particleLifetime: 2000,
            ...config
        });
        
        // Estado específico de efectos visuales
        this.particleContainer = null;
        this.shakeIntensity = 0;
        this.isShaking = false;
        this.animeAvailable = false;
        this.activeEffects = new Map();
        this.particlePool = [];
        this.effectQueue = [];
    }

    /**
     * Inicialización específica del VisualEffectsManager
     */
    async initializeSpecific() {
        this.log('info', 'Inicializando VisualEffectsManager con arquitectura SOLID');
        
        // Verificar disponibilidad de anime.js
        this.checkAnimeAvailability();
        
        // Crear contenedor para partículas
        this.createParticleContainer();
        
        // Inicializar pool de partículas
        this.initializeParticlePool();
        
        // Configurar procesamiento de efectos
        this.setupEffectProcessing();
    }

    /**
     * Verifica la disponibilidad de anime.js (SOLID - DIP)
     */
    checkAnimeAvailability() {
        this.animeAvailable = typeof anime !== 'undefined';
        if (!this.animeAvailable) {
            this.log('warn', 'anime.js no está disponible. Algunos efectos estarán limitados.');
        } else {
            this.log('debug', 'anime.js disponible y configurado');
        }
    }

    /**
     * Crea el contenedor para partículas (SOLID - SRP)
     */
    createParticleContainer() {
        if (this.particleContainer) return;
        
        this.particleContainer = document.createElement('div');
        this.particleContainer.id = 'particle-container';
        this.particleContainer.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 150;
        `;
        document.body.appendChild(this.particleContainer);
        
        this.log('debug', 'Contenedor de partículas creado');
    }

    /**
     * Inicializa el pool de partículas para mejor rendimiento (SOLID - SRP)
     */
    initializeParticlePool() {
        for (let i = 0; i < this.config.maxParticles; i++) {
            const particle = this.createParticleElement();
            particle.style.display = 'none';
            this.particlePool.push(particle);
            this.particleContainer.appendChild(particle);
        }
        
        this.log('debug', `Pool de ${this.config.maxParticles} partículas inicializado`);
    }

    /**
     * Crea un elemento de partícula reutilizable (SOLID - SRP)
     */
    createParticleElement() {
        const particle = document.createElement('div');
        particle.className = 'vfx-particle';
        particle.style.cssText = `
            position: absolute;
            border-radius: 50%;
            pointer-events: none;
            background: #fff;
        `;
        return particle;
    }

    /**
     * Configura el procesamiento de efectos (SOLID - SRP)
     */
    setupEffectProcessing() {
        // Procesar cola de efectos en cada frame
        this.effectProcessingInterval = setInterval(() => {
            this.processEffectQueue();
        }, 16); // ~60fps
    }

    /**
     * Procesa la cola de efectos pendientes (SOLID - SRP)
     */
    processEffectQueue() {
        if (this.effectQueue.length === 0) return;
        
        const effect = this.effectQueue.shift();
        this.executeEffect(effect);
    }

    /**
     * Ejecuta un efecto específico (SOLID - OCP)
     */
    executeEffect(effect) {
        if (!this.config.autoStart) {
            this.log('warn', 'Efectos deshabilitados por configuración');
            return;
        }
        
        switch (effect.type) {
            case 'screenShake':
                this.performScreenShake(effect.intensity, effect.duration);
                break;
            case 'flash':
                this.performFlashEffect(effect.intensity, effect.duration);
                break;
            case 'shockwave':
                this.performShockwave(effect.x, effect.y, effect.maxSize, effect.color);
                break;
            case 'particleBurst':
                this.performParticleBurst(effect.x, effect.y, effect.count, effect.colors);
                break;
            default:
                this.log('warn', `Tipo de efecto desconocido: ${effect.type}`);
        }
    }

    /**
     * Helper para ejecutar animaciones anime.js de forma segura (SOLID - DIP)
     */
    safeAnime(config) {
        if (!this.animeAvailable) {
            this.log('warn', 'anime.js no disponible, usando fallback');
            if (config.complete) {
                setTimeout(config.complete, config.duration || 1000);
            }
            return null;
        }
        return anime(config);
    }

    /**
     * Screen shake effect refactorizado (SOLID - SRP)
     */
    screenShake(intensity = 8, duration = 150) {
        if (!this.config.enableScreenShake) {
            this.log('debug', 'Screen shake deshabilitado por configuración');
            return;
        }
        
        this.effectQueue.push({
            type: 'screenShake',
            intensity,
            duration
        });
    }

    /**
     * Ejecuta el screen shake real (SOLID - SRP)
     */
    performScreenShake(intensity, duration) {
        if (this.isShaking) {
            this.log('debug', 'Screen shake ya en progreso');
            return;
        }
        
        this.isShaking = true;
        this.recordMetric('screenShake', 1);

        if (!this.animeAvailable) {
            this.fallbackScreenShake(intensity, duration);
            return;
        }
        
        this.safeAnime({
            targets: 'body',
            translateX: [
                { value: anime.random(-intensity, intensity), duration: 50 },
                { value: 0, duration: 50 }
            ],
            translateY: [
                { value: anime.random(-intensity, intensity), duration: 50 },
                { value: 0, duration: 50 }
            ],
            duration: duration,
            easing: 'easeInOutSine',
            complete: () => {
                this.isShaking = false;
                this.log('debug', 'Screen shake completado');
            }
        });
    }

    /**
     * Fallback screen shake usando CSS (SOLID - SRP)
     */
    fallbackScreenShake(intensity, duration) {
        const body = document.body;
        let startTime = Date.now();
        
        const shakeInterval = setInterval(() => {
            const elapsed = Date.now() - startTime;
            if (elapsed >= duration) {
                clearInterval(shakeInterval);
                body.style.transform = 'translate(0, 0)';
                this.isShaking = false;
                this.log('debug', 'Fallback screen shake completado');
                return;
            }
            
            const x = (Math.random() - 0.5) * intensity * 2;
            const y = (Math.random() - 0.5) * intensity * 2;
            body.style.transform = `translate(${x}px, ${y}px)`;
        }, 50);
    }

    /**
     * Flash overlay effect público (SOLID - ISP)
     */
    flashEffect(intensity = 0.8, duration = 100) {
        if (!this.config.enableParticles) {
            this.log('debug', 'Flash effect deshabilitado por configuración');
            return;
        }
        
        this.effectQueue.push({
            type: 'flash',
            intensity,
            duration
        });
    }

    /**
     * Ejecuta el flash effect real (SOLID - SRP)
     */
    performFlashEffect(intensity, duration) {
        this.recordMetric('flashEffect', 1);
        
        const flash = document.getElementById('flashOverlay');
        if (!flash) {
            this.log('warn', 'Elemento flashOverlay no encontrado');
            return;
        }

        this.safeAnime({
            targets: flash,
            opacity: [0, intensity, 0],
            duration: duration,
            easing: 'easeInQuad'
        });
    }

    /**
     * Shockwave effect público (SOLID - ISP)
     */
    createShockwave(x, y, maxSize = 300, color = '#facc15') {
        if (!this.config.enableParticles) {
            this.log('debug', 'Shockwave effect deshabilitado por configuración');
            return;
        }
        
        this.effectQueue.push({
            type: 'shockwave',
            x,
            y,
            maxSize,
            color
        });
    }

    /**
     * Ejecuta el shockwave real (SOLID - SRP)
     */
    performShockwave(x, y, maxSize, color) {
        this.recordMetric('shockwave', 1);
        
        const shockwave = document.createElement('div');
        shockwave.classList.add('shockwave');
        shockwave.style.cssText = `
            position: absolute;
            left: ${x}px;
            top: ${y}px;
            width: 0px;
            height: 0px;
            border-radius: 50%;
            border: 4px solid ${color};
            transform: translate(-50%, -50%);
            opacity: 0.8;
            pointer-events: none;
        `;
        
        this.particleContainer.appendChild(shockwave);

        this.safeAnime({
            targets: shockwave,
            width: [`0px`, `${maxSize}px`],
            height: [`0px`, `${maxSize}px`],
            opacity: [0.8, 0],
            borderWidth: ['10px', '0px'],
            duration: 500,
            easing: 'easeOutExpo',
            complete: () => {
                shockwave.remove();
                this.log('debug', 'Shockwave completado');
            }
        });
    }

    /**
     * Helper para números aleatorios (SOLID - SRP)
     */
    random(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    /**
     * Particle burst effect público (SOLID - ISP)
     */
    createParticleBurst(x, y, count = 50, colors = ['#facc15', '#fb923c', '#ef4444']) {
        if (!this.config.enableParticles) {
            this.log('debug', 'Particle burst deshabilitado por configuración');
            return;
        }
        
        this.effectQueue.push({
            type: 'particleBurst',
            x,
            y,
            count,
            colors
        });
    }

    /**
     * Ejecuta el particle burst real (SOLID - SRP)
     */
    performParticleBurst(x, y, count, colors) {
        this.recordMetric('particleBurst', 1);
        
        for (let i = 0; i < count; i++) {
            const particle = this.getParticleFromPool();
            if (!particle) {
                this.log('warn', 'Pool de partículas agotado');
                break;
            }
            
            this.configureParticle(particle, x, y, colors);
            this.animateParticle(particle);
        }
    }

    /**
     * Obtiene una partícula del pool (SOLID - SRP)
     */
    getParticleFromPool() {
        return this.particlePool.find(particle => 
            particle.style.display === 'none'
        );
    }

    /**
     * Configura una partícula para animación (SOLID - SRP)
     */
    configureParticle(particle, x, y, colors) {
        const color = colors[this.random(0, colors.length - 1)];
        const size = this.random(2, 6);
        
        particle.style.cssText = `
            position: absolute;
            left: ${x}px;
            top: ${y}px;
            width: ${size}px;
            height: ${size}px;
            border-radius: 50%;
            background: ${color};
            display: block;
            pointer-events: none;
        `;
    }

    /**
     * Anima una partícula (SOLID - SRP)
     */
    animateParticle(particle) {
        const angle = Math.random() * Math.PI * 2;
        const distance = this.random(50, 150);
        const targetX = parseFloat(particle.style.left) + Math.cos(angle) * distance;
        const targetY = parseFloat(particle.style.top) + Math.sin(angle) * distance;

        this.safeAnime({
            targets: particle,
            left: targetX + 'px',
            top: targetY + 'px',
            opacity: [1, 0],
            scale: [1, 0],
            duration: this.random(800, 1600),
            easing: 'easeOutExpo',
            complete: () => {
                particle.style.display = 'none';
                this.log('debug', 'Partícula animación completada');
            }
        });
    }

    /**
     * Limpieza específica del manager (SOLID - SRP)
     */
    async cleanupSpecific() {
        // Limpiar interval de procesamiento
        if (this.effectProcessingInterval) {
            clearInterval(this.effectProcessingInterval);
            this.effectProcessingInterval = null;
        }

        // Limpiar efectos activos
        this.activeEffects.clear();
        this.effectQueue.length = 0;

        // Remover contenedor de partículas
        if (this.particleContainer) {
            this.particleContainer.remove();
            this.particleContainer = null;
        }

        // Limpiar pool de partículas
        this.particlePool.length = 0;

        this.log('info', 'VisualEffectsManager limpiado completamente');
    }

    /**
     * Crear efecto de glitch temporal
     * @param {HTMLElement} target - Elemento objetivo
     * @param {number} duration - Duración en ms (por defecto 500)
     */
    createGlitchEffect(target, duration = 500) {
        if (!target || !this.config.autoStart) {
            return;
        }

        this.log('debug', `Aplicando efecto glitch por ${duration}ms`);

        // Crear efecto de glitch con CSS transforms y filtros
        const originalFilter = target.style.filter || '';
        const originalTransform = target.style.transform || '';
        
        // Aplicar efecto de glitch inicial
        target.style.filter = 'hue-rotate(90deg) contrast(1.5) brightness(1.2)';
        target.style.transform = originalTransform + ' skew(2deg, 1deg)';
        
        // Usar anime.js si está disponible, sino setTimeout
        if (this.animeAvailable) {
            anime({
                targets: target,
                duration: duration,
                easing: 'easeInOutSine',
                filter: [
                    'hue-rotate(90deg) contrast(1.5) brightness(1.2)',
                    'hue-rotate(-45deg) contrast(2) brightness(0.8)',
                    'hue-rotate(180deg) contrast(1.2) brightness(1.5)',
                    originalFilter
                ],
                translateX: [0, -2, 2, -1, 0],
                complete: () => {
                    target.style.filter = originalFilter;
                    target.style.transform = originalTransform;
                }
            });
        } else {
            // Fallback sin anime.js
            setTimeout(() => {
                target.style.filter = originalFilter;
                target.style.transform = originalTransform;
            }, duration);
        }
    }

    /**
     * Habilitar/deshabilitar efectos (SOLID - ISP)
     */
    setEffectsEnabled(enabled) {
        this.config.autoStart = enabled;
        this.log('info', `Efectos ${enabled ? 'habilitados' : 'deshabilitados'}`);
    }
}
