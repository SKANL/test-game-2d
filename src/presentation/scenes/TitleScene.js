/**
 * TitleScene - Pantalla de título épica con efectos visuales avanzados
 * Implementación EXACTA basada en ejemplos funcionales de anime.js
 */
export default class TitleScene {
    constructor(onStart, onOptions) {
        this.onStart = onStart;
        this.onOptions = onOptions;
        this.container = null;
        this.titleText = null;
        this.isInitialized = false;
        this.backgroundParticles = [];
        this.animationId = null;
    }

    async init() {
        if (this.isInitialized) return;
        this.isInitialized = true;
        console.log('🎬 TitleScene inicializada');
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

        // Crear el contenedor principal
        this.container = document.createElement('div');
        this.container.id = 'title-scene-container';
        this.container.style.cssText = `
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

        // Canvas para partículas de fondo (como en el ejemplo)
        const particleCanvas = document.createElement('canvas');
        particleCanvas.id = 'title-particles';
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

        // Título principal - EXACTO como en el ejemplo
        this.titleText = document.createElement('h1');
        this.titleText.className = 'title-text';
        this.titleText.textContent = 'FIGHTER 2D';
        this.titleText.style.cssText = `
            font-family: 'Orbitron', sans-serif;
            font-size: 4rem;
            font-weight: 900;
            color: #fff;
            position: relative;
            z-index: 3;
            cursor: pointer;
            margin-bottom: 2rem;
            text-shadow: 0 0 10px var(--primary-glow), 0 0 20px var(--primary-glow);
        `;

        // Convertir texto a letras individuales - EXACTO como en el ejemplo
        this.titleText.innerHTML = this.titleText.textContent.replace(/\S/g, "<span class='letter'>$&</span>");
        
        // Aplicar estilos a las letras
        const letters = this.titleText.querySelectorAll('.letter');
        letters.forEach(letter => {
            letter.style.cssText = `
                display: inline-block;
                line-height: 1em;
                text-shadow: 0 0 10px var(--primary-glow), 0 0 20px var(--primary-glow);
            `;
        });

        // Menú de navegación
        const menu = document.createElement('div');
        menu.className = 'title-menu';
        menu.style.cssText = `
            display: flex;
            flex-direction: column;
            gap: 1rem;
            z-index: 3;
            opacity: 0;
        `;

        // Botones del menú
        const menuItems = [
            { text: 'JUGAR', action: () => this.onStartGame() },
            { text: 'OPCIONES', action: () => this.onOptionsGame() },
            { text: 'SALIR', action: () => this.onExit() }
        ];

        menuItems.forEach((item, index) => {
            const button = document.createElement('button');
            button.textContent = item.text;
            button.style.cssText = `
                background: transparent;
                border: 2px solid var(--primary-glow);
                color: var(--primary-glow);
                padding: 1rem 2rem;
                border-radius: 8px;
                font-family: 'Orbitron', monospace;
                font-size: 1.1rem;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.3s ease;
                text-transform: uppercase;
                letter-spacing: 2px;
                box-shadow: 0 0 10px rgba(0, 242, 255, 0.3);
                opacity: 0;
                transform: translateY(20px);
            `;

            button.addEventListener('mouseenter', () => {
                if (typeof anime !== 'undefined') {
                    anime({
                        targets: button,
                        scale: 1.05,
                        boxShadow: '0 0 20px rgba(0, 242, 255, 0.6)',
                        duration: 200,
                        easing: 'easeOutQuad'
                    });
                }
            });

            button.addEventListener('mouseleave', () => {
                if (typeof anime !== 'undefined') {
                    anime({
                        targets: button,
                        scale: 1,
                        boxShadow: '0 0 10px rgba(0, 242, 255, 0.3)',
                        duration: 200,
                        easing: 'easeOutQuad'
                    });
                }
            });

            button.addEventListener('click', item.action);
            menu.appendChild(button);
        });

        // Ensamblar la escena
        this.container.appendChild(particleCanvas);
        this.container.appendChild(this.titleText);
        this.container.appendChild(menu);
        document.body.appendChild(this.container);

        // Iniciar animaciones - EXACTO como en el ejemplo
        this.startTitleAnimation();
        this.startMenuAnimation();
        this.startParticleBackground(particleCanvas);

        return this.container;
    }

    startTitleAnimation() {
        // Verificar que anime esté disponible
        if (typeof anime === 'undefined') {
            console.warn('⚠️ anime.js no está disponible, usando fallback');
            this.fallbackTitleAnimation();
            return;
        }

        console.log('🎭 Iniciando animación del título con anime.js');

        // Implementación EXACTA del ejemplo funcional
        anime.timeline({loop: true})
            .add({ 
                targets: '.title-text .letter', 
                translateY: [100, 0], 
                translateZ: 0, 
                opacity: [0, 1], 
                easing: "easeOutExpo", 
                duration: 1400, 
                delay: anime.stagger(50, {start: 300}) 
            })
            .add({ 
                targets: '.title-text .letter', 
                translateY: [0, -100], 
                opacity: [1, 0], 
                easing: "easeInExpo", 
                duration: 1200, 
                delay: anime.stagger(50, {start: 100}) 
            });

        // Evento de click - EXACTO como en el ejemplo
        this.titleText.addEventListener('click', () => {
            anime({
                targets: '.title-text .letter',
                translateX: () => anime.random(-5, 5),
                translateY: () => anime.random(-5, 5),
                scale: () => anime.random(0.8, 1.2),
                textShadow: [
                    '0 0 10px var(--primary-glow)', 
                    '0 0 40px var(--secondary-glow)', 
                    '0 0 10px var(--primary-glow)'
                ],
                duration: 800,
                direction: 'alternate',
                easing: 'easeInOutSine',
                delay: anime.stagger(30)
            });
        });
    }

    startMenuAnimation() {
        if (typeof anime === 'undefined') return;

        const menuButtons = document.querySelectorAll('.title-menu button');
        
        // Mostrar menú después del título
        setTimeout(() => {
            anime({
                targets: '.title-menu',
                opacity: [0, 1],
                duration: 800,
                easing: 'easeOutExpo'
            });

            anime({
                targets: menuButtons,
                opacity: [0, 1],
                translateY: [20, 0],
                delay: anime.stagger(100, {start: 200}),
                duration: 600,
                easing: 'easeOutExpo'
            });
        }, 2000);
    }

    startParticleBackground(canvas) {
        const ctx = canvas.getContext('2d');
        const particles = [];
        
        // Crear partículas como en el ejemplo
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
            
            if (document.getElementById('title-scene-container')) {
                this.animationId = requestAnimationFrame(animateParticles);
            }
        };
        
        animateParticles();
    }

    fallbackTitleAnimation() {
        // Fallback sin anime.js
        const letters = document.querySelectorAll('.title-text .letter');
        letters.forEach((letter, index) => {
            setTimeout(() => {
                letter.style.opacity = '1';
                letter.style.transform = 'translateY(0)';
                letter.style.transition = 'all 0.5s ease';
            }, index * 100);
        });
    }

    // Métodos de navegación
    onStartGame() {
        console.log('🎮 Iniciando juego...');
        if (this.onStart) {
            this.onStart();
        }
    }

    onOptionsGame() {
        console.log('⚙️ Abriendo opciones...');
        if (this.onOptions) {
            this.onOptions();
        }
    }

    onExit() {
        console.log('👋 Saliendo...');
        // Lógica de salida
    }

    cleanup() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }

        if (this.container) {
            // Animación de salida épica
            if (typeof anime !== 'undefined') {
                anime({
                    targets: this.container,
                    opacity: [1, 0],
                    scale: [1, 0.9],
                    duration: 500,
                    easing: 'easeInExpo',
                    complete: () => {
                        if (this.container) {
                            this.container.remove();
                        }
                    }
                });
            } else {
                this.container.remove();
            }
        }

        // Limpiar referencias
        this.container = null;
        this.titleText = null;
        this.backgroundParticles = [];
    }
}
