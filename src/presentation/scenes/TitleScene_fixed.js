/**
 * TitleScene - Pantalla de título épica con efectos visuales avanzados
 * Integra efectos de los ejemplos de anime.js
 */
import VisualEffectsManager from '../VisualEffectsManager.js';

export default class TitleScene {
    constructor(onStart, onOptions) {
        this.onStart = onStart;
        this.onOptions = onOptions;
        this.vfx = new VisualEffectsManager();
        this.isInitialized = false;
        this.particleCanvas = null;
        this.isAnimating = false;
        this.keyListener = null;
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
        container.id = 'title-scene-container';
        container.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: var(--dark-bg);
            background-image: 
                radial-gradient(circle at 20% 80%, rgba(0, 242, 255, 0.15) 0%, transparent 50%),
                radial-gradient(circle at 80% 20%, rgba(255, 0, 193, 0.15) 0%, transparent 50%),
                radial-gradient(circle at 40% 40%, rgba(255, 215, 0, 0.1) 0%, transparent 50%);
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            font-family: 'Orbitron', monospace;
            color: white;
            overflow: hidden;
            z-index: 1000;
        `;

        // Canvas para partículas de fondo
        this.particleCanvas = document.createElement('canvas');
        this.particleCanvas.id = 'title-particles';
        this.particleCanvas.width = window.innerWidth;
        this.particleCanvas.height = window.innerHeight;
        this.particleCanvas.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 1;
        `;

        // Contenedor del título principal
        const titleContainer = document.createElement('div');
        titleContainer.className = 'title-container';
        titleContainer.style.cssText = `
            text-align: center;
            z-index: 10;
            position: relative;
        `;

        // Título principal con letras individuales
        const title = document.createElement('h1');
        title.className = 'main-title';
        title.innerHTML = 'FIGHTER ARENA';
        title.style.cssText = `
            font-size: 5rem;
            font-weight: 900;
            margin: 0;
            background: linear-gradient(45deg, var(--primary-glow), var(--secondary-glow), var(--success-glow));
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            text-shadow: 0 0 30px rgba(0, 242, 255, 0.5);
            letter-spacing: 8px;
            margin-bottom: 2rem;
        `;

        // Convertir título en letras individuales
        title.innerHTML = title.textContent.replace(/\S/g, "<span class='title-letter'>$&</span>");

        // Subtítulo
        const subtitle = document.createElement('h2');
        subtitle.className = 'subtitle';
        subtitle.textContent = 'Presiona cualquier tecla para comenzar';
        subtitle.style.cssText = `
            font-size: 1.5rem;
            color: var(--text-color);
            margin: 20px 0;
            opacity: 0.8;
            font-weight: 400;
        `;

        titleContainer.appendChild(title);
        titleContainer.appendChild(subtitle);

        // Menú de opciones
        const menuContainer = document.createElement('div');
        menuContainer.className = 'menu-container';
        menuContainer.style.cssText = `
            display: flex;
            flex-direction: column;
            gap: 20px;
            margin-top: 50px;
            z-index: 10;
            opacity: 0;
            transform: translateY(30px);
        `;

        const startButton = this.createMenuButton('INICIAR JUEGO', () => {
            this.cleanup();
            if (this.onStart) this.onStart();
        });

        const optionsButton = this.createMenuButton('OPCIONES', () => {
            this.cleanup();
            if (this.onOptions) this.onOptions();
        });

        const exitButton = this.createMenuButton('SALIR', () => {
            if (confirm('¿Seguro que quieres salir?')) {
                window.close();
            }
        });

        menuContainer.appendChild(startButton);
        menuContainer.appendChild(optionsButton);
        menuContainer.appendChild(exitButton);

        // Ensamblar la escena
        container.appendChild(this.particleCanvas);
        container.appendChild(titleContainer);
        container.appendChild(menuContainer);

        document.body.appendChild(container);

        // Añadir estilos CSS
        this.addTitleStyles();

        // Iniciar animaciones
        this.startTitleAnimation();
        this.startParticleBackground();
        this.addKeyListener();

        return container;
    }

    addTitleStyles() {
        const style = document.createElement('style');
        style.id = 'title-scene-styles';
        style.textContent = `
            @keyframes titleGlow {
                0%, 100% {
                    text-shadow: 0 0 30px rgba(0, 242, 255, 0.5);
                }
                50% {
                    text-shadow: 
                        0 0 40px rgba(0, 242, 255, 0.8),
                        0 0 60px rgba(255, 0, 193, 0.6),
                        0 0 80px rgba(255, 215, 0, 0.4);
                }
            }
            
            @keyframes subtitleBlink {
                0%, 100% { opacity: 0.8; }
                50% { opacity: 0.4; }
            }
            
            @keyframes buttonHover {
                from { box-shadow: 0 5px 15px rgba(0,0,0,0.3); }
                to { 
                    box-shadow: 
                        0 5px 25px rgba(0,0,0,0.4),
                        0 0 30px var(--primary-glow);
                }
            }
            
            .title-letter {
                display: inline-block;
                opacity: 0;
                transform: translateY(50px) rotateX(90deg);
            }
            
            .main-title {
                animation: titleGlow 3s ease-in-out infinite;
            }
            
            .subtitle {
                animation: subtitleBlink 2s ease-in-out infinite;
            }
            
            .menu-button {
                padding: 15px 40px;
                font-size: 1.2rem;
                background: linear-gradient(45deg, #ff6b6b, #ee5a24);
                color: white;
                border: none;
                border-radius: 10px;
                cursor: pointer;
                transition: all 0.3s ease;
                box-shadow: 0 5px 15px rgba(0,0,0,0.3);
                font-weight: bold;
                text-transform: uppercase;
                letter-spacing: 2px;
                font-family: 'Orbitron', monospace;
                position: relative;
                overflow: hidden;
            }
            
            .menu-button:hover {
                transform: translateY(-2px);
                animation: buttonHover 0.3s ease forwards;
            }
            
            .menu-button:active {
                transform: translateY(0px);
            }
            
            .menu-button::before {
                content: '';
                position: absolute;
                top: 0;
                left: -100%;
                width: 100%;
                height: 100%;
                background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
                transition: left 0.5s ease;
            }
            
            .menu-button:hover::before {
                left: 100%;
            }
        `;
        document.head.appendChild(style);
    }

    createMenuButton(text, onClick) {
        const button = document.createElement('button');
        button.className = 'menu-button';
        button.textContent = text;

        button.addEventListener('mouseenter', () => {
            // Efecto de partículas en hover
            const rect = button.getBoundingClientRect();
            this.vfx.createParticleBurst(
                rect.left + rect.width / 2,
                rect.top + rect.height / 2,
                15,
                ['var(--primary-glow)', 'var(--secondary-glow)', '#ffffff']
            );
        });

        button.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Efecto épico de click
            anime({
                targets: button,
                scale: [1, 0.95, 1],
                duration: 150,
                easing: 'easeInOutSine'
            });

            this.vfx.flashEffect(0.2, 100);
            
            setTimeout(() => {
                onClick();
            }, 200);
        });

        return button;
    }

    startTitleAnimation() {
        const letters = document.querySelectorAll('.title-letter');
        const menuContainer = document.querySelector('.menu-container');

        // Animación de entrada épica del título
        anime.timeline()
            .add({
                targets: letters,
                opacity: [0, 1],
                translateY: [50, 0],
                rotateX: [90, 0],
                scale: [0.5, 1],
                delay: anime.stagger(100, {start: 500}),
                duration: 800,
                easing: 'easeOutExpo'
            })
            .add({
                targets: menuContainer,
                opacity: [0, 1],
                translateY: [30, 0],
                duration: 600,
                easing: 'easeOutExpo'
            }, '-=400');

        // Efecto de entrada espectacular
        setTimeout(() => {
            this.vfx.createShockwave(
                window.innerWidth / 2,
                window.innerHeight / 2,
                300
            );
            this.vfx.screenShake(8);
        }, 1000);
    }

    startParticleBackground() {
        if (!this.particleCanvas) return;

        const ctx = this.particleCanvas.getContext('2d');
        const particles = [];

        // Crear partículas de fondo
        for (let i = 0; i < 150; i++) {
            particles.push({
                x: Math.random() * this.particleCanvas.width,
                y: Math.random() * this.particleCanvas.height,
                size: Math.random() * 3 + 1,
                speedX: (Math.random() - 0.5) * 1,
                speedY: (Math.random() - 0.5) * 1,
                opacity: Math.random() * 0.5 + 0.2,
                color: this.getRandomColor(),
                pulse: Math.random() * Math.PI * 2
            });
        }

        const animateParticles = () => {
            if (!document.getElementById('title-scene-container')) return;

            ctx.clearRect(0, 0, this.particleCanvas.width, this.particleCanvas.height);

            particles.forEach(particle => {
                // Actualizar posición
                particle.x += particle.speedX;
                particle.y += particle.speedY;
                particle.pulse += 0.02;

                // Rebote en bordes
                if (particle.x < 0 || particle.x > this.particleCanvas.width) {
                    particle.speedX *= -1;
                }
                if (particle.y < 0 || particle.y > this.particleCanvas.height) {
                    particle.speedY *= -1;
                }

                // Efecto de pulsación
                const pulsatingOpacity = particle.opacity + Math.sin(particle.pulse) * 0.2;

                // Dibujar partícula
                ctx.globalAlpha = Math.max(0, pulsatingOpacity);
                ctx.fillStyle = particle.color;
                ctx.beginPath();
                ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
                ctx.fill();

                // Conectar partículas cercanas
                particles.forEach(otherParticle => {
                    const distance = Math.hypot(
                        particle.x - otherParticle.x,
                        particle.y - otherParticle.y
                    );

                    if (distance < 120) {
                        const opacity = (1 - distance / 120) * 0.3;
                        ctx.globalAlpha = opacity;
                        ctx.strokeStyle = particle.color;
                        ctx.lineWidth = 0.5;
                        ctx.beginPath();
                        ctx.moveTo(particle.x, particle.y);
                        ctx.lineTo(otherParticle.x, otherParticle.y);
                        ctx.stroke();
                    }
                });
            });

            requestAnimationFrame(animateParticles);
        };

        animateParticles();
    }

    getRandomColor() {
        const colors = [
            'rgba(0, 242, 255, 0.6)',   // Cian
            'rgba(255, 0, 193, 0.6)',   // Magenta
            'rgba(255, 215, 0, 0.6)',   // Dorado
            'rgba(255, 255, 255, 0.4)'  // Blanco
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    addKeyListener() {
        this.keyListener = (event) => {
            if (event.code === 'Space' || event.code === 'Enter') {
                event.preventDefault();
                this.cleanup();
                if (this.onStart) this.onStart();
            }
        };

        document.addEventListener('keydown', this.keyListener);
    }

    cleanup() {
        // Remover el contenedor de la escena
        const container = document.getElementById('title-scene-container');
        if (container) {
            anime({
                targets: container,
                opacity: [1, 0],
                scale: [1, 1.1],
                duration: 500,
                easing: 'easeInExpo',
                complete: () => {
                    container.remove();
                }
            });
        }

        // Remover estilos CSS
        const styles = document.getElementById('title-scene-styles');
        if (styles) {
            styles.remove();
        }

        // Remover event listener
        if (this.keyListener) {
            document.removeEventListener('keydown', this.keyListener);
            this.keyListener = null;
        }

        // Limpiar efectos visuales
        if (this.vfx) {
            this.vfx.cleanup();
        }

        // Mostrar canvas del juego nuevamente
        const gameCanvas = document.getElementById('gameCanvas');
        if (gameCanvas) {
            gameCanvas.style.display = 'block';
        }
    }
}
