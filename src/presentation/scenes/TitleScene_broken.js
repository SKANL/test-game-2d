/**
 * TitleScene - Pantalla de título principal del juego con efectos épicos
 * Basado en los ejemplos funcionales de anime.js
 */
import VisualEffectsManager from '../VisualEffectsManager.js';

export default class TitleScene {
    constructor(onStart, onOptions) {
        this.onStart = onStart;
        this.onOptions = onOptions;
        this.animationId = null;
        this.titleOffset = 0;
        this.vfx = new VisualEffectsManager();
        this.particleCanvas = null;
        this.isInitialized = false;
    }

    render() {
        const container = document.createElement('div');
        container.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: linear-gradient(45deg, #000428 0%, #004e92 50%, #000428 100%);
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            overflow: hidden;
            font-family: 'Orbitron', sans-serif;
            z-index: 10;
        `;

        // Particle background canvas
        this.particleCanvas = document.createElement('canvas');
        this.particleCanvas.width = window.innerWidth;
        this.particleCanvas.height = window.innerHeight;
        this.particleCanvas.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 1;
            pointer-events: none;
        `;
        container.appendChild(this.particleCanvas);

        // Título principal con animación épica
        const titleContainer = document.createElement('div');
        titleContainer.style.cssText = `
            text-align: center;
            margin-bottom: 50px;
            position: relative;
            z-index: 3;
            cursor: pointer;
        `;

        const title = document.createElement('h1');
        title.className = 'title-text';
        title.textContent = 'FIGHTER 2D';
        title.style.cssText = `
            font-size: 4.5rem;
            color: #fff;
            margin: 0;
            font-weight: 900;
            letter-spacing: 8px;
            text-shadow: 
                0 0 10px var(--primary-glow),
                0 0 20px var(--primary-glow),
                0 0 30px var(--primary-glow);
            font-family: 'Orbitron', sans-serif;
        `;

        // Convertir cada letra en un span para animación individual
        title.innerHTML = title.textContent.replace(/\S/g, "<span class='letter' style='display: inline-block;'>$&</span>");
        
        titleContainer.appendChild(title);

        // Subtitle con efecto glow
        const subtitle = document.createElement('p');
        subtitle.textContent = 'EPIC COMBAT EXPERIENCE';
        subtitle.style.cssText = `
            font-size: 1.2rem;
            color: var(--warning-glow);
            text-shadow: 0 0 10px var(--warning-glow);
            margin: 0;
            letter-spacing: 3px;
            font-weight: 700;
            opacity: 0;
        `;
        titleContainer.appendChild(subtitle);

        // Contenedor de botones con efectos
        const buttonsContainer = document.createElement('div');
        buttonsContainer.style.cssText = `
            display: flex;
            flex-direction: column;
            gap: 20px;
            align-items: center;
            position: relative;
            z-index: 3;
        `;

        // Botón Start con efectos épicos
        const startButton = document.createElement('button');
        startButton.className = 'epic-button';
        startButton.textContent = 'START FIGHT';
        startButton.style.cssText = `
            font-family: 'Orbitron', monospace;
            font-weight: 700;
            font-size: 1.4rem;
            padding: 15px 30px;
            border: 3px solid var(--primary-glow);
            background: rgba(0, 242, 255, 0.1);
            color: var(--primary-glow);
            border-radius: 10px;
            cursor: pointer;
            transition: all 0.3s ease;
            text-transform: uppercase;
            letter-spacing: 2px;
            position: relative;
            overflow: hidden;
            opacity: 0;
            transform: translateY(30px);
        `;

        // Botón Options
        const optionsButton = document.createElement('button');
        optionsButton.className = 'epic-button';
        optionsButton.textContent = 'OPTIONS';
        optionsButton.style.cssText = `
            font-family: 'Orbitron', monospace;
            font-weight: 700;
            font-size: 1.2rem;
            padding: 12px 24px;
            border: 2px solid var(--secondary-glow);
            background: rgba(255, 0, 193, 0.1);
            color: var(--secondary-glow);
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.3s ease;
            text-transform: uppercase;
            letter-spacing: 1px;
            position: relative;
            overflow: hidden;
            opacity: 0;
            transform: translateY(30px);
        `;

        buttonsContainer.appendChild(startButton);
        buttonsContainer.appendChild(optionsButton);

        container.appendChild(titleContainer);
        container.appendChild(buttonsContainer);

        document.body.appendChild(container);

        // Inicializar efectos visuales
        this.vfx.init();
        this.initializeAnimations(title, subtitle, startButton, optionsButton);
        this.setupInteractions(titleContainer, startButton, optionsButton);
        this.createBackgroundParticles();

        return container;
    }

    initializeAnimations(title, subtitle, startButton, optionsButton) {
        // Animación de entrada del título letra por letra
        anime.timeline({ loop: false })
            .add({
                targets: '.title-text .letter',
                translateY: [100, 0],
                translateZ: 0,
                opacity: [0, 1],
                easing: "easeOutExpo",
                duration: 1400,
                delay: anime.stagger(50, { start: 300 })
            })
            .add({
                targets: subtitle,
                opacity: [0, 1],
                translateY: [20, 0],
                duration: 800,
                easing: 'easeOutExpo'
            }, '-=800')
            .add({
                targets: [startButton, optionsButton],
                opacity: [0, 1],
                translateY: [30, 0],
                duration: 800,
                easing: 'easeOutExpo',
                delay: anime.stagger(100)
            }, '-=400');

        // Animación cíclica del título
        anime({
            targets: '.title-text .letter',
            translateY: [0, -5, 0],
            scale: [1, 1.05, 1],
            duration: 3000,
            easing: 'easeInOutSine',
            loop: true,
            delay: anime.stagger(100, { start: 2000 })
        });
    }

    setupInteractions(titleContainer, startButton, optionsButton) {
        // Efecto de click en el título
        titleContainer.addEventListener('click', () => {
            this.vfx.createGlitchEffect(titleContainer.querySelector('.title-text'), 1000);
            
            anime({
                targets: '.title-text .letter',
                translateX: () => anime.random(-10, 10),
                translateY: () => anime.random(-10, 10),
                scale: () => anime.random(0.8, 1.3),
                duration: 600,
                direction: 'alternate',
                easing: 'easeInOutSine',
                delay: anime.stagger(30)
            });
        });

        // Efectos de hover para botones
        startButton.addEventListener('mouseenter', () => {
            anime({
                targets: startButton,
                scale: 1.1,
                boxShadow: '0 0 30px var(--primary-glow)',
                duration: 300,
                easing: 'easeOutExpo'
            });
        });

        startButton.addEventListener('mouseleave', () => {
            anime({
                targets: startButton,
                scale: 1,
                boxShadow: '0 0 0px var(--primary-glow)',
                duration: 300,
                easing: 'easeOutExpo'
            });
        });

        optionsButton.addEventListener('mouseenter', () => {
            anime({
                targets: optionsButton,
                scale: 1.05,
                boxShadow: '0 0 25px var(--secondary-glow)',
                duration: 300,
                easing: 'easeOutExpo'
            });
        });

        optionsButton.addEventListener('mouseleave', () => {
            anime({
                targets: optionsButton,
                scale: 1,
                boxShadow: '0 0 0px var(--secondary-glow)',
                duration: 300,
                easing: 'easeOutExpo'
            });
        });

        // Efectos de click
        startButton.addEventListener('click', (e) => {
            e.preventDefault();
            this.vfx.screenShake(5);
            this.vfx.createParticleBurst(e.clientX, e.clientY, 30, ['#00f2ff', '#ffffff']);
            
            anime({
                targets: startButton,
                scale: [1.1, 0.95, 1.1],
                duration: 200,
                easing: 'easeInOutSine',
                complete: () => {
                    setTimeout(() => this.onStart(), 300);
                }
            });
        });

        optionsButton.addEventListener('click', (e) => {
            e.preventDefault();
            this.vfx.createParticleBurst(e.clientX, e.clientY, 20, ['#ff00c1', '#ffffff']);
            
            anime({
                targets: optionsButton,
                scale: [1.05, 0.95, 1.05],
                duration: 200,
                easing: 'easeInOutSine',
                complete: () => {
                    setTimeout(() => this.onOptions(), 300);
                }
            });
        });
    }

    createBackgroundParticles() {
        if (!this.particleCanvas) return;

        const ctx = this.particleCanvas.getContext('2d');
        const particles = [];

        // Crear partículas de fondo
        for (let i = 0; i < 150; i++) {
            particles.push({
                x: Math.random() * this.particleCanvas.width,
                y: Math.random() * this.particleCanvas.height,
                radius: Math.random() * 2 + 1,
                speedX: (Math.random() - 0.5) * 0.5,
                speedY: (Math.random() - 0.5) * 0.5,
                color: Math.random() > 0.5 ? '#00f2ff' : '#ff00c1',
                alpha: Math.random() * 0.5 + 0.1
            });
        }

        const animateParticles = () => {
            ctx.clearRect(0, 0, this.particleCanvas.width, this.particleCanvas.height);

            particles.forEach((particle, index) => {
                particle.x += particle.speedX;
                particle.y += particle.speedY;

                // Respawn particles that go off screen
                if (particle.x < 0 || particle.x > this.particleCanvas.width) {
                    particle.speedX *= -1;
                }
                if (particle.y < 0 || particle.y > this.particleCanvas.height) {
                    particle.speedY *= -1;
                }

                // Draw particle
                ctx.beginPath();
                ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
                ctx.fillStyle = particle.color;
                ctx.globalAlpha = particle.alpha;
                ctx.fill();

                // Add glow effect
                ctx.shadowBlur = 10;
                ctx.shadowColor = particle.color;
                ctx.fill();
                ctx.shadowBlur = 0;
            });

            this.animationId = requestAnimationFrame(animateParticles);
        };

        animateParticles();
    }

    init() {
        this.isInitialized = true;
    }

    update(deltaTime) {
        // Update logic if needed
    }

    destroy() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        
        if (this.vfx) {
            this.vfx.cleanup();
        }

        // Remove all anime.js animations
        anime.remove('.title-text .letter');
        anime.remove('.epic-button');

        const container = document.querySelector('div[style*="position: fixed"]');
        if (container && container.parentNode) {
            container.parentNode.removeChild(container);
        }
    }
}
        `;

        const subtitle = document.createElement('h2');
        subtitle.textContent = 'Presiona cualquier tecla para comenzar';
        subtitle.style.cssText = `
            font-size: 1.5rem;
            color: #ffffff;
            margin: 20px 0;
            opacity: 0.8;
            animation: blink 1.5s ease-in-out infinite;
        `;

        titleContainer.appendChild(title);
        titleContainer.appendChild(subtitle);

        // Menu de opciones
        const menuContainer = document.createElement('div');
        menuContainer.style.cssText = `
            display: flex;
            flex-direction: column;
            gap: 20px;
            margin-top: 50px;
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

        // Partículas de fondo
        const particlesContainer = this.createParticles();

        container.appendChild(particlesContainer);
        container.appendChild(titleContainer);
        container.appendChild(menuContainer);

        // Añadir estilos CSS para animaciones
        this.addAnimationStyles();

        // Event listener para cualquier tecla
        this.keyListener = (event) => {
            this.cleanup();
            if (this.onStart) this.onStart();
        };
        document.addEventListener('keydown', this.keyListener);

        document.body.appendChild(container);
    }

    createMenuButton(text, onClick) {
        const button = document.createElement('button');
        button.textContent = text;
        button.style.cssText = `
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
        `;

        button.onmouseenter = () => {
            button.style.transform = 'translateY(-5px) scale(1.05)';
            button.style.boxShadow = '0 8px 25px rgba(0,0,0,0.4)';
            button.style.background = 'linear-gradient(45deg, #ff8e8e, #ff7b42)';
        };

        button.onmouseleave = () => {
            button.style.transform = 'translateY(0) scale(1)';
            button.style.boxShadow = '0 5px 15px rgba(0,0,0,0.3)';
            button.style.background = 'linear-gradient(45deg, #ff6b6b, #ee5a24)';
        };

        button.onclick = onClick;

        return button;
    }

    createParticles() {
        const particlesContainer = document.createElement('div');
        particlesContainer.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            overflow: hidden;
        `;

        // Crear múltiples partículas
        for (let i = 0; i < 30; i++) {
            const particle = document.createElement('div');
            particle.style.cssText = `
                position: absolute;
                width: ${Math.random() * 4 + 2}px;
                height: ${Math.random() * 4 + 2}px;
                background: ${this.getRandomColor()};
                border-radius: 50%;
                animation: float ${Math.random() * 10 + 5}s linear infinite;
                left: ${Math.random() * 100}%;
                animation-delay: ${Math.random() * 5}s;
                opacity: 0.7;
            `;
            particlesContainer.appendChild(particle);
        }

        return particlesContainer;
    }

    getRandomColor() {
        const colors = ['#ffaa00', '#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24', '#6c5ce7'];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    addAnimationStyles() {
        if (document.getElementById('titleSceneStyles')) return;

        const style = document.createElement('style');
        style.id = 'titleSceneStyles';
        style.textContent = `
            @keyframes titlePulse {
                0% { 
                    transform: scale(1);
                    text-shadow: 
                        0 0 10px #ffaa00,
                        0 0 20px #ffaa00,
                        0 0 30px #ffaa00,
                        0 0 40px #ff8800;
                }
                100% { 
                    transform: scale(1.05);
                    text-shadow: 
                        0 0 15px #ffaa00,
                        0 0 25px #ffaa00,
                        0 0 35px #ffaa00,
                        0 0 45px #ff8800,
                        0 0 55px #ff6600;
                }
            }

            @keyframes blink {
                0%, 50% { opacity: 0.8; }
                100% { opacity: 0.3; }
            }

            @keyframes float {
                0% {
                    transform: translateY(100vh) rotate(0deg);
                    opacity: 0;
                }
                10% {
                    opacity: 0.7;
                }
                90% {
                    opacity: 0.7;
                }
                100% {
                    transform: translateY(-100px) rotate(360deg);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(style);
    }

    cleanup() {
        // Remover event listener
        if (this.keyListener) {
            document.removeEventListener('keydown', this.keyListener);
            this.keyListener = null;
        }

        // Detener animaciones
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }

        // Remover estilos
        const styles = document.getElementById('titleSceneStyles');
        if (styles) {
            styles.remove();
        }
    }
}