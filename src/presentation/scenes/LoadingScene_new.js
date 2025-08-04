/**
 * LoadingScene - Pantalla de carga épica con efectos visuales avanzados
 * Integra efectos de los ejemplos de anime.js
 */
import VisualEffectsManager from '../VisualEffectsManager.js';

export default class LoadingScene {
    constructor(onComplete) {
        this.onComplete = onComplete;
        this.progress = 0;
        this.progressBar = null;
        this.progressText = null;
        this.sparkleElements = [];
        this.vfx = new VisualEffectsManager();
        this.animationId = null;
        this.loadingTasks = [
            'Inicializando núcleo cuántico...',
            'Calibrando matrices de combate...',
            'Cargando arquetipos de luchadores...',
            'Sincronizando efectos dimensionales...',
            'Compilando algoritmos de IA...',
            'Activando protocolo de batalla...',
            'Optimizando motor gráfico...',
            'Sistema listo para combate...'
        ];
        this.currentTaskIndex = 0;
        this.isInitialized = false;
    }

    init() {
        if (this.isInitialized) return;
        this.vfx.init();
        this.isInitialized = true;
    }

    render() {
        if (!this.isInitialized) {
            this.init();
        }

        // Ocultar canvas del juego si existe
        const gameCanvas = document.getElementById('gameCanvas');
        if (gameCanvas) {
            gameCanvas.style.display = 'none';
        }

        const container = document.createElement('div');
        container.id = 'loading-scene-container';
        container.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: var(--dark-bg);
            background-image: 
                radial-gradient(circle at 20% 80%, rgba(0, 242, 255, 0.15) 0%, transparent 50%),
                radial-gradient(circle at 80% 20%, rgba(255, 0, 193, 0.15) 0%, transparent 50%);
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            z-index: 1000;
            font-family: 'Orbitron', monospace;
            overflow: hidden;
        `;

        // Canvas para partículas de fondo
        const particleCanvas = document.createElement('canvas');
        particleCanvas.id = 'loading-particles';
        particleCanvas.width = window.innerWidth;
        particleCanvas.height = window.innerHeight;
        particleCanvas.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 1;
            pointer-events: none;
        `;

        // Logo/Título del juego
        const logo = document.createElement('div');
        logo.className = 'loading-logo';
        logo.innerHTML = 'COMBAT ENGINE';
        logo.style.cssText = `
            font-size: 3.5rem;
            font-weight: 900;
            color: #fff;
            text-shadow: 0 0 20px var(--primary-glow), 0 0 40px var(--primary-glow);
            margin-bottom: 3rem;
            position: relative;
            z-index: 10;
            letter-spacing: 3px;
        `;

        // Convertir texto en letras individuales para animación
        logo.innerHTML = logo.textContent.replace(/\S/g, "<span class='logo-letter'>$&</span>");

        // Contenedor de carga
        const loadingContainer = document.createElement('div');
        loadingContainer.className = 'loading-container';
        loadingContainer.style.cssText = `
            position: relative;
            width: 500px;
            z-index: 10;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 2rem;
        `;

        // Barra de progreso
        const progressContainer = document.createElement('div');
        progressContainer.className = 'progress-container';
        progressContainer.style.cssText = `
            width: 100%;
            height: 20px;
            background: rgba(0, 0, 0, 0.5);
            border: 2px solid var(--primary-glow);
            border-radius: 10px;
            overflow: hidden;
            position: relative;
            box-shadow: 0 0 20px rgba(0, 242, 255, 0.3);
        `;

        this.progressBar = document.createElement('div');
        this.progressBar.className = 'progress-bar-fill';
        this.progressBar.style.cssText = `
            width: 0%;
            height: 100%;
            background: linear-gradient(90deg, var(--primary-glow), var(--secondary-glow));
            border-radius: 8px;
            position: relative;
            transition: width 0.3s ease;
            box-shadow: 0 0 15px var(--primary-glow);
        `;

        // Efectos de brillo en la barra
        const progressGlow = document.createElement('div');
        progressGlow.className = 'progress-glow';
        progressGlow.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
            animation: progressSweep 2s ease-in-out infinite;
        `;

        // Sparkle effect
        const sparkle = document.createElement('div');
        sparkle.className = 'progress-sparkle';
        sparkle.style.cssText = `
            position: absolute;
            top: 50%;
            right: -5px;
            width: 10px;
            height: 20px;
            background: #fff;
            border-radius: 50%;
            transform: translateY(-50%);
            box-shadow: 0 0 20px #fff, 0 0 30px var(--primary-glow);
            opacity: 0;
        `;

        this.progressBar.appendChild(progressGlow);
        this.progressBar.appendChild(sparkle);
        progressContainer.appendChild(this.progressBar);

        // Texto de progreso
        this.progressText = document.createElement('div');
        this.progressText.className = 'progress-text';
        this.progressText.textContent = this.loadingTasks[0];
        this.progressText.style.cssText = `
            font-size: 1.2rem;
            color: var(--text-color);
            text-align: center;
            min-height: 30px;
            opacity: 0.8;
            font-weight: 400;
        `;

        // Indicador de porcentaje
        this.percentageText = document.createElement('div');
        this.percentageText.className = 'percentage-text';
        this.percentageText.textContent = '0%';
        this.percentageText.style.cssText = `
            font-size: 2rem;
            font-weight: 700;
            color: var(--primary-glow);
            text-shadow: 0 0 10px var(--primary-glow);
        `;

        loadingContainer.appendChild(progressContainer);
        loadingContainer.appendChild(this.percentageText);
        loadingContainer.appendChild(this.progressText);

        container.appendChild(particleCanvas);
        container.appendChild(logo);
        container.appendChild(loadingContainer);
        document.body.appendChild(container);

        // Añadir estilos CSS para animaciones
        this.addLoadingStyles();

        // Iniciar animaciones
        this.startLogoAnimation();
        this.startParticleBackground(particleCanvas);
        this.startLoading();

        return container;
    }

    addLoadingStyles() {
        const style = document.createElement('style');
        style.textContent = `
            @keyframes progressSweep {
                0% { transform: translateX(-100%); }
                50% { transform: translateX(0%); }
                100% { transform: translateX(100%); }
            }
            
            @keyframes logoGlow {
                0%, 100% { text-shadow: 0 0 20px var(--primary-glow), 0 0 40px var(--primary-glow); }
                50% { text-shadow: 0 0 30px var(--primary-glow), 0 0 60px var(--primary-glow), 0 0 80px var(--secondary-glow); }
            }
            
            .loading-logo { animation: logoGlow 3s ease-in-out infinite; }
            
            .logo-letter {
                display: inline-block;
                opacity: 0;
                transform: translateY(50px);
            }
        `;
        document.head.appendChild(style);
    }

    startLogoAnimation() {
        const letters = document.querySelectorAll('.logo-letter');
        
        anime({
            targets: letters,
            opacity: [0, 1],
            translateY: [50, 0],
            scale: [0.5, 1],
            delay: anime.stagger(100, {start: 300}),
            duration: 800,
            easing: 'easeOutExpo'
        });
    }

    startParticleBackground(canvas) {
        const ctx = canvas.getContext('2d');
        const particles = [];
        
        // Crear partículas
        for (let i = 0; i < 100; i++) {
            particles.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                size: Math.random() * 3 + 1,
                speedX: (Math.random() - 0.5) * 2,
                speedY: (Math.random() - 0.5) * 2,
                opacity: Math.random() * 0.5 + 0.2,
                color: Math.random() > 0.5 ? 'rgba(0, 242, 255, ' : 'rgba(255, 0, 193, '
            });
        }

        const animateParticles = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            particles.forEach(particle => {
                particle.x += particle.speedX;
                particle.y += particle.speedY;
                
                // Rebote en bordes
                if (particle.x < 0 || particle.x > canvas.width) particle.speedX *= -1;
                if (particle.y < 0 || particle.y > canvas.height) particle.speedY *= -1;
                
                // Dibujar partícula
                ctx.globalAlpha = particle.opacity;
                ctx.fillStyle = particle.color + particle.opacity + ')';
                ctx.beginPath();
                ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
                ctx.fill();
                
                // Conectar partículas cercanas
                particles.forEach(otherParticle => {
                    const distance = Math.hypot(particle.x - otherParticle.x, particle.y - otherParticle.y);
                    if (distance < 100) {
                        const opacity = 1 - (distance / 100);
                        ctx.globalAlpha = opacity * 0.3;
                        ctx.strokeStyle = particle.color + opacity + ')';
                        ctx.lineWidth = 1;
                        ctx.beginPath();
                        ctx.moveTo(particle.x, particle.y);
                        ctx.lineTo(otherParticle.x, otherParticle.y);
                        ctx.stroke();
                    }
                });
            });
            
            if (document.getElementById('loading-scene-container')) {
                requestAnimationFrame(animateParticles);
            }
        };
        
        animateParticles();
    }

    startLoading() {
        const duration = 5000; // 5 segundos total
        const interval = duration / 100; // 100 pasos

        const loadingInterval = setInterval(() => {
            this.progress += 1;
            
            // Actualizar barra de progreso
            this.progressBar.style.width = this.progress + '%';
            this.percentageText.textContent = this.progress + '%';
            
            // Actualizar tarea actual
            const taskIndex = Math.floor((this.progress / 100) * this.loadingTasks.length);
            if (taskIndex !== this.currentTaskIndex && taskIndex < this.loadingTasks.length) {
                this.currentTaskIndex = taskIndex;
                
                // Animación de cambio de texto
                anime({
                    targets: this.progressText,
                    opacity: [1, 0],
                    duration: 200,
                    complete: () => {
                        this.progressText.textContent = this.loadingTasks[this.currentTaskIndex];
                        anime({
                            targets: this.progressText,
                            opacity: [0, 1],
                            duration: 200
                        });
                    }
                });
            }
            
            // Efectos especiales en hitos
            if (this.progress % 25 === 0 && this.progress > 0) {
                this.triggerMilestoneEffect();
            }
            
            // Sparkle en el progreso
            if (this.progress > 0) {
                const sparkle = this.progressBar.querySelector('.progress-sparkle');
                anime({
                    targets: sparkle,
                    opacity: [0, 1, 0],
                    scale: [0.8, 1.2, 0.8],
                    duration: 300,
                    easing: 'easeInOutSine'
                });
            }
            
            // Completar carga
            if (this.progress >= 100) {
                clearInterval(loadingInterval);
                setTimeout(() => {
                    this.completeLoading();
                }, 1000);
            }
        }, interval);
    }

    triggerMilestoneEffect() {
        // Flash effect
        this.vfx.flashEffect(0.3, 150);
        
        // Crear partículas de celebración
        const container = document.getElementById('loading-scene-container');
        const rect = container.getBoundingClientRect();
        
        this.vfx.createParticleBurst(
            rect.width / 2,
            rect.height / 2,
            30,
            ['var(--primary-glow)', 'var(--secondary-glow)', '#ffffff']
        );
        
        // Animación especial de la barra
        anime({
            targets: this.progressBar,
            scale: [1, 1.05, 1],
            duration: 400,
            easing: 'easeInOutSine'
        });
    }

    completeLoading() {
        const container = document.getElementById('loading-scene-container');
        
        // Animación de finalización épica
        anime.timeline()
            .add({
                targets: '.loading-container',
                scale: [1, 1.1],
                opacity: [1, 0.8],
                duration: 500,
                easing: 'easeOutExpo'
            })
            .add({
                targets: '.loading-logo .logo-letter',
                scale: [1, 1.2, 0],
                opacity: [1, 1, 0],
                delay: anime.stagger(50),
                duration: 600,
                easing: 'easeInExpo'
            }, '-=300')
            .add({
                targets: container,
                opacity: [1, 0],
                scale: [1, 1.1],
                duration: 800,
                easing: 'easeInExpo',
                complete: () => {
                    this.cleanup();
                    if (this.onComplete) {
                        this.onComplete();
                    }
                }
            });

        // Efecto final espectacular
        this.vfx.createShockwave(window.innerWidth / 2, window.innerHeight / 2, 500);
    }

    cleanup() {
        // Limpiar partículas y elementos
        const container = document.getElementById('loading-scene-container');
        if (container) {
            container.remove();
        }
        
        // Mostrar canvas del juego nuevamente
        const gameCanvas = document.getElementById('gameCanvas');
        if (gameCanvas) {
            gameCanvas.style.display = 'block';
        }
        
        if (this.vfx) {
            this.vfx.cleanup();
        }
        
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
    }
}
