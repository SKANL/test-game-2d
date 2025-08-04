/**
 * VisualEffectsManager - Sistema centralizado de efectos visuales épicos
 * Basado en los ejemplos funcionales de anime.js
 */
export default class VisualEffectsManager {
    constructor() {
        this.particleContainer = null;
        this.shakeIntensity = 0;
        this.isShaking = false;
        this.effectsEnabled = true;
        this.animeAvailable = false;
    }

    init() {
        // Verificar disponibilidad de anime.js
        this.animeAvailable = typeof anime !== 'undefined';
        if (!this.animeAvailable) {
            console.warn('⚠️ anime.js no está disponible en VisualEffectsManager. Algunos efectos estarán limitados.');
        }

        // Crear contenedor para partículas si no existe
        if (!this.particleContainer) {
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
        }
    }

    // Helper para ejecutar animaciones anime.js de forma segura
    safeAnime(config) {
        if (!this.animeAvailable) {
            console.warn('anime.js no disponible, saltando animación');
            if (config.complete) {
                setTimeout(config.complete, config.duration || 1000);
            }
            return;
        }
        return anime(config);
    }

    // Screen shake effect
    screenShake(intensity = 8, duration = 150) {
        if (!this.effectsEnabled || this.isShaking) return;
        
        this.isShaking = true;

        if (!this.animeAvailable) {
            // Fallback usando CSS transforms
            this.cssScreenShake(intensity, duration);
            return;
        }
        
        anime({
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
            }
        });
    }

    // Fallback screen shake usando CSS
    cssScreenShake(intensity, duration) {
        const body = document.body;
        let startTime = Date.now();
        const shakeInterval = setInterval(() => {
            const elapsed = Date.now() - startTime;
            if (elapsed >= duration) {
                clearInterval(shakeInterval);
                body.style.transform = 'translate(0, 0)';
                this.isShaking = false;
                return;
            }
            
            const x = (Math.random() - 0.5) * intensity * 2;
            const y = (Math.random() - 0.5) * intensity * 2;
            body.style.transform = `translate(${x}px, ${y}px)`;
        }, 50);
    }

    // Flash overlay effect
    flashEffect(intensity = 0.8, duration = 100) {
        if (!this.effectsEnabled) return;

        const flash = document.getElementById('flashOverlay');
        if (flash) {
            this.safeAnime({
                targets: flash,
                opacity: [0, intensity, 0],
                duration: duration,
                easing: 'easeInQuad'
            });
        }
    }

    // Shockwave effect
    createShockwave(x, y, maxSize = 300, color = '#facc15') {
        if (!this.effectsEnabled) return;

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
            complete: () => shockwave.remove()
        });
    }

    // Helper para números aleatorios
    random(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    // Particle burst effect
    createParticleBurst(x, y, count = 50, colors = ['#facc15', '#fb923c', '#ef4444']) {
        if (!this.effectsEnabled) return;

        for (let i = 0; i < count; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.cssText = `
                position: absolute;
                left: ${x}px;
                top: ${y}px;
                width: ${this.random(3, 10)}px;
                height: ${this.random(3, 10)}px;
                background: ${colors[this.random(0, colors.length - 1)]};
                border-radius: 50%;
                pointer-events: none;
            `;

            this.particleContainer.appendChild(particle);

            if (this.animeAvailable) {
                anime({
                    targets: particle,
                    translateX: anime.random(-150, 150),
                    translateY: anime.random(-150, 150),
                    translateZ: anime.random(50, 250),
                    opacity: [1, 0],
                    scale: [1, 0],
                    duration: anime.random(800, 1400),
                    easing: 'easeOutExpo',
                    complete: () => particle.remove()
                });
            } else {
                // Fallback CSS animation
                const translateX = this.random(-150, 150);
                const translateY = this.random(-150, 150);
                const duration = this.random(800, 1400);
                
                particle.style.transition = `all ${duration}ms cubic-bezier(0.19, 1, 0.22, 1)`;
                setTimeout(() => {
                    particle.style.transform = `translate(${translateX}px, ${translateY}px) scale(0)`;
                    particle.style.opacity = '0';
                    setTimeout(() => particle.remove(), duration);
                }, 10);
            }
        }
    }

    // Power up effect with ground cracks
    createPowerUpEffect(element, intensity = 1) {
        if (!this.effectsEnabled) return;

        const rect = element.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        // Character scaling and glow
        anime.timeline({ easing: 'easeOutExpo' })
            .add({
                targets: element,
                translateY: -20 * intensity,
                scale: 1 + (0.2 * intensity),
                boxShadow: `0 0 ${35 * intensity}px ${20 * intensity}px rgba(239, 68, 68, 0.7)`,
                duration: 400
            })
            .add({
                targets: element,
                translateY: 0,
                scale: 1,
                boxShadow: `0 0 ${35 * intensity}px ${20 * intensity}px rgba(239, 68, 68, 0)`,
                duration: 600
            }, '-=200');

        // Power particles
        for (let i = 0; i < 80 * intensity; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.cssText = `
                position: absolute;
                left: ${centerX}px;
                top: ${centerY}px;
                width: ${anime.random(2, 5)}px;
                height: ${anime.random(2, 5)}px;
                background: ${anime.random(0, 1) > 0.5 ? '#facc15' : '#fb923c'};
                border-radius: 50%;
                pointer-events: none;
            `;

            this.particleContainer.appendChild(particle);

            anime({
                targets: particle,
                translateX: () => anime.random(-90, 90),
                translateY: [anime.random(20, 40), anime.random(-160, -110)],
                translateZ: () => anime.random(-60, 60),
                rotate: '1turn',
                scale: [anime.random(1, 4), 0],
                opacity: [1, 0],
                duration: anime.random(1200, 2000),
                easing: 'easeOutExpo',
                delay: anime.random(0, 600),
                complete: () => particle.remove()
            });
        }
    }

    // KO effect with explosive particles
    createKOEffect(element) {
        if (!this.effectsEnabled) return;

        this.screenShake(20, 300);
        
        const rect = element.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        // Element animation
        anime.timeline()
            .add({
                targets: element,
                scale: [3, 1],
                opacity: [0, 1],
                translateZ: 0,
                easing: "easeOutExpo",
                duration: 800
            })
            .add({
                targets: element,
                scale: 1.2,
                duration: 100,
                easing: 'easeInOutSine'
            })
            .add({
                targets: element,
                scale: 1,
                duration: 800,
                easing: 'easeOutElastic(1, .5)'
            });

        // KO particles
        for (let i = 0; i < 70; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.cssText = `
                position: absolute;
                left: ${centerX}px;
                top: ${centerY}px;
                width: ${anime.random(4, 12)}px;
                height: ${anime.random(4, 12)}px;
                background: hsl(${anime.random(0, 60)}, 100%, 50%);
                border-radius: 50%;
                pointer-events: none;
            `;

            this.particleContainer.appendChild(particle);

            anime({
                targets: particle,
                translateX: anime.random(-180, 180),
                translateY: anime.random(-120, 120),
                translateZ: anime.random(-120, 120),
                scale: [anime.random(1, 5), 0],
                opacity: [1, 0],
                duration: anime.random(900, 1800),
                easing: 'easeOutExpo',
                complete: () => particle.remove()
            });
        }
    }

    // Parry/Block effect with shield and sparks
    createParryEffect(x, y) {
        if (!this.effectsEnabled) return;

        // Shield effect
        const shield = document.createElement('div');
        shield.style.cssText = `
            position: absolute;
            left: ${x}px;
            top: ${y}px;
            width: 100px;
            height: 100px;
            border: 4px solid #38bdf8;
            border-radius: 50%;
            box-shadow: 0 0 20px #0ea5e9;
            opacity: 0;
            transform: translate(-50%, -50%);
            pointer-events: none;
        `;

        this.particleContainer.appendChild(shield);

        anime.timeline({ easing: 'easeOutExpo' })
            .add({
                targets: shield,
                opacity: [0, 1],
                scale: [0.5, 1],
                duration: 150
            })
            .add({
                targets: shield,
                rotate: '15deg',
                scale: 0.9,
                duration: 100,
                direction: 'alternate'
            })
            .add({
                targets: shield,
                opacity: 0,
                scale: 0.5,
                duration: 300,
                easing: 'easeInExpo',
                complete: () => shield.remove()
            }, '+=200');

        // Spark particles
        for (let i = 0; i < 20; i++) {
            const spark = document.createElement('div');
            spark.className = 'particle';
            spark.style.cssText = `
                position: absolute;
                left: ${x}px;
                top: ${y}px;
                width: ${anime.random(2, 4)}px;
                height: ${anime.random(2, 4)}px;
                background: #fde047;
                border-radius: 50%;
                pointer-events: none;
            `;

            this.particleContainer.appendChild(spark);

            anime({
                targets: spark,
                translateX: anime.random(-80, 80),
                translateY: anime.random(-80, 80),
                scale: [anime.random(1, 2.5), 0],
                opacity: [1, 0],
                duration: anime.random(300, 600),
                easing: 'easeOutExpo',
                delay: 100,
                complete: () => spark.remove()
            });
        }
    }

    // Dash effect with after images
    createDashEffect(element, direction = 1) {
        if (!this.effectsEnabled) return;

        const distance = 100 * direction;

        anime({
            targets: element,
            translateX: [
                { value: -distance, duration: 200, easing: 'easeInExpo' },
                { value: distance, duration: 200, easing: 'easeOutInExpo' },
                { value: 0, duration: 200, easing: 'easeOutExpo' }
            ],
            begin: () => {
                // Create after images
                for (let i = 0; i < 5; i++) {
                    const afterImage = element.cloneNode(true);
                    afterImage.style.position = 'absolute';
                    afterImage.style.opacity = '0.5';
                    afterImage.style.zIndex = '0';
                    element.parentNode.appendChild(afterImage);

                    anime({
                        targets: afterImage,
                        opacity: 0,
                        translateX: -distance,
                        duration: 400,
                        delay: i * 40,
                        easing: 'linear',
                        complete: () => afterImage.remove()
                    });
                }
            }
        });
    }

    // Text glitch effect
    createGlitchEffect(element, duration = 2000) {
        if (!this.effectsEnabled) return;

        const originalText = element.textContent;
        const chars = '▓▒░/<>$#?&0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';

        const glitchInterval = setInterval(() => {
            if (Math.random() > 0.8) {
                element.textContent = Array.from(originalText, (char, i) => {
                    if (char === ' ') return ' ';
                    return Math.random() > 0.7 ? chars[Math.floor(Math.random() * chars.length)] : char;
                }).join('');

                setTimeout(() => {
                    element.textContent = originalText;
                }, 50);
            }
        }, 100);

        setTimeout(() => {
            clearInterval(glitchInterval);
            element.textContent = originalText;
        }, duration);
    }

    // Orbital particles effect
    createOrbitalEffect(canvas, centerX, centerY) {
        if (!this.effectsEnabled || !canvas) return;

        const ctx = canvas.getContext('2d');
        const particles = [];
        
        // Create orbital particles
        for (let i = 0; i < 100; i++) {
            particles.push({
                angle: Math.random() * Math.PI * 2,
                distance: anime.random(50, Math.min(centerX, centerY) * 0.8),
                speed: anime.random(0.01, 0.02),
                radius: Math.random() * 1.5 + 0.5,
                color: `hsl(${anime.random(180, 220)}, 100%, 70%)`
            });
        }

        const animate = () => {
            ctx.fillStyle = 'rgba(13, 13, 26, 0.15)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            particles.forEach(p => {
                p.angle += p.speed;
                const x = centerX + Math.cos(p.angle) * p.distance;
                const y = centerY + Math.sin(p.angle) * p.distance;

                ctx.beginPath();
                ctx.fillStyle = p.color;
                ctx.arc(x, y, p.radius, 0, Math.PI * 2);
                ctx.fill();
            });

            requestAnimationFrame(animate);
        };

        animate();
    }

    // Clean up all effects
    cleanup() {
        if (this.particleContainer) {
            this.particleContainer.innerHTML = '';
        }
        
        // Stop any ongoing shake
        anime.remove('body');
        document.body.style.transform = '';
    }

    // Enable/disable effects
    setEffectsEnabled(enabled) {
        this.effectsEnabled = enabled;
    }
}
