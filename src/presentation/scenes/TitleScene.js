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
        
        // Verificar si anime.js está disponible
        if (typeof anime === 'undefined') {
            console.warn('⚠️ TitleScene: anime.js no está disponible. Efectos limitados.');
        } else {
            console.log('✅ TitleScene: anime.js disponible');
        }
        
        // Inicializar VFX de forma segura
        try {
            this.vfx.init();
        } catch (error) {
            console.warn('⚠️ TitleScene: Error inicializando VFX:', error);
            // Continuar sin VFX si fallan
            this.vfx = null;
        }
        
        this.isInitialized = true;
        console.log('✅ TitleScene inicializada correctamente');
    }

    render() {
        console.log('🎬 TitleScene.render() iniciado');
        
        if (!this.isInitialized) {
            console.log('🎬 TitleScene no inicializada, inicializando...');
            this.init();
        }

        // Ocultar canvas del juego si existe
        const gameCanvas = document.getElementById('gameCanvas');
        if (gameCanvas) {
            gameCanvas.style.display = 'none';
            console.log('🎬 Canvas del juego ocultado');
        }

        console.log('🎬 Creando contenedor principal...');

        const container = document.createElement('div');
        container.id = 'title-scene-container';
        container.style.cssText = `
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            width: 100% !important;
            height: 100% !important;
            min-height: 100vh !important;
            background: var(--dark-bg) !important;
            background-image: 
                radial-gradient(circle at 20% 80%, rgba(0, 242, 255, 0.15) 0%, transparent 50%),
                radial-gradient(circle at 80% 20%, rgba(255, 0, 193, 0.15) 0%, transparent 50%),
                radial-gradient(circle at 40% 40%, rgba(255, 215, 0, 0.1) 0%, transparent 50%) !important;
            display: flex !important;
            flex-direction: column !important;
            justify-content: center !important;
            align-items: center !important;
            font-family: 'Orbitron', monospace !important;
            color: white !important;
            overflow: hidden !important;
            z-index: 1500 !important;
            visibility: visible !important;
            opacity: 1 !important;
            pointer-events: auto !important;
        `;

        // Canvas para partículas de fondo
        this.particleCanvas = document.createElement('canvas');
        this.particleCanvas.id = 'title-particles';
        this.particleCanvas.width = window.innerWidth;
        this.particleCanvas.height = window.innerHeight;
        this.particleCanvas.style.cssText = `
            position: absolute !important;
            top: 0 !important;
            left: 0 !important;
            width: 100% !important;
            height: 100% !important;
            pointer-events: none !important;
            z-index: 1 !important;
            visibility: visible !important;
        `;

        // Contenedor del título principal
        const titleContainer = document.createElement('div');
        titleContainer.className = 'title-container';
        titleContainer.style.cssText = `
            text-align: center !important;
            z-index: 10 !important;
            position: relative !important;
            visibility: visible !important;
            display: block !important;
        `;

        // Título principal con letras individuales
        const title = document.createElement('h1');
        title.className = 'main-title';
        title.innerHTML = 'FIGHTER ARENA';
        title.style.cssText = `
            font-size: 5rem !important;
            font-weight: 900 !important;
            margin: 0 !important;
            background: linear-gradient(45deg, var(--primary-glow), var(--secondary-glow), var(--success-glow)) !important;
            -webkit-background-clip: text !important;
            -webkit-text-fill-color: transparent !important;
            background-clip: text !important;
            text-shadow: 0 0 30px rgba(0, 242, 255, 0.5) !important;
            letter-spacing: 8px !important;
            margin-bottom: 2rem !important;
            visibility: visible !important;
            display: block !important;
            color: #00f2ff !important;
            font-family: 'Orbitron', monospace !important;
        `;
        
        // Fallback para navegadores que no soporten background-clip
        if (!CSS.supports('background-clip', 'text')) {
            title.style.cssText = `
                font-size: 5rem !important;
                font-weight: 900 !important;
                margin: 0 !important;
                color: #00f2ff !important;
                text-shadow: 0 0 30px rgba(0, 242, 255, 0.5) !important;
                letter-spacing: 8px !important;
                margin-bottom: 2rem !important;
                visibility: visible !important;
                display: block !important;
                font-family: 'Orbitron', monospace !important;
            `;
            console.log('🎨 Usando fallback de color sólido para título');
        }

        // Convertir título en letras individuales
        title.innerHTML = title.textContent.replace(/\S/g, "<span class='title-letter'>$&</span>");

        // Subtítulo
        const subtitle = document.createElement('h2');
        subtitle.className = 'subtitle';
        subtitle.textContent = 'Presiona cualquier tecla para comenzar';
        subtitle.style.cssText = `
            font-size: 1.5rem !important;
            color: var(--text-color) !important;
            margin: 20px 0 !important;
            opacity: 0.8 !important;
            font-weight: 400 !important;
            visibility: visible !important;
            display: block !important;
        `;

        titleContainer.appendChild(title);
        titleContainer.appendChild(subtitle);

        // Menú de opciones
        const menuContainer = document.createElement('div');
        menuContainer.className = 'menu-container';
        menuContainer.style.cssText = `
            display: flex !important;
            flex-direction: column !important;
            gap: 20px !important;
            margin-top: 50px !important;
            z-index: 10 !important;
            opacity: 0 !important;
            transform: translateY(30px) !important;
            visibility: visible !important;
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

        // Agregar la escena al contenedor de escenas manejado por SceneManager
        const sceneContainer = document.getElementById('scene-container');
        if (sceneContainer) {
            console.log('🎬 Añadiendo TitleScene al scene-container');
            
            // Verificar estado del scene-container
            console.log('📋 Estado scene-container:', {
                id: sceneContainer.id,
                display: sceneContainer.style.display,
                visibility: sceneContainer.style.visibility,
                zIndex: sceneContainer.style.zIndex,
                bounds: sceneContainer.getBoundingClientRect(),
                children: sceneContainer.children.length
            });
            
            sceneContainer.appendChild(container);
        } else {
            console.warn('⚠️ scene-container no encontrado, añadiendo al body');
            document.body.appendChild(container);
        }

        // Verificar que el contenedor esté realmente en el DOM
        if (!document.body.contains(container)) {
            console.error('❌ TitleScene container no está en el DOM');
            document.body.appendChild(container);
            console.log('🔄 TitleScene container re-añadido al body');
        }

        // FORZAR VISIBILIDAD EXTREMA para debug
        container.style.cssText += `
            background-color: rgba(255, 0, 0, 0.05) !important;
            border: 1px solid rgba(255, 255, 255, 0.2) !important;
        `;

        console.log('🎬 TitleScene container añadido al DOM:', {
            id: container.id,
            display: container.style.display,
            visibility: container.style.visibility,
            zIndex: container.style.zIndex,
            bounds: container.getBoundingClientRect(),
            computedStyle: window.getComputedStyle(container),
            isVisible: container.offsetParent !== null
        });

        // Añadir estilos CSS
        console.log('🎨 Añadiendo estilos CSS...');
        this.addTitleStyles();

        // Iniciar animaciones
        console.log('✨ Iniciando animaciones...');
        this.startTitleAnimation();
        this.startParticleBackground();
        this.addKeyListener();

        console.log('✅ TitleScene renderizada completamente');
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
        
        // Asegurar que el botón sea visible
        button.style.cssText = `
            visibility: visible !important;
            display: block !important;
            pointer-events: auto !important;
        `;

        button.addEventListener('mouseenter', () => {
            // Efecto de partículas en hover solo si VFX está disponible
            if (this.vfx) {
                try {
                    const rect = button.getBoundingClientRect();
                    this.vfx.createParticleBurst(
                        rect.left + rect.width / 2,
                        rect.top + rect.height / 2,
                        15,
                        ['var(--primary-glow)', 'var(--secondary-glow)', '#ffffff']
                    );
                } catch (error) {
                    console.warn('⚠️ Error en efecto de partículas:', error);
                }
            }
        });

        button.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Efecto épico de click solo si anime está disponible
            if (typeof anime !== 'undefined') {
                anime({
                    targets: button,
                    scale: [1, 0.95, 1],
                    duration: 150,
                    easing: 'easeInOutSine'
                });
            }

            if (this.vfx) {
                try {
                    this.vfx.flashEffect(0.2, 100);
                } catch (error) {
                    console.warn('⚠️ Error en efecto de flash:', error);
                }
            }
            
            setTimeout(() => {
                onClick();
            }, 200);
        });

        return button;
    }

    startTitleAnimation() {
        const letters = document.querySelectorAll('.title-letter');
        const menuContainer = document.querySelector('.menu-container');

        // Verificar si anime.js está disponible
        if (typeof anime === 'undefined') {
            console.warn('⚠️ TitleScene: anime.js no disponible, usando animaciones CSS fallback');
            // Fallback con CSS si anime.js no está disponible
            letters.forEach((letter, index) => {
                setTimeout(() => {
                    letter.style.opacity = '1';
                    letter.style.transform = 'translateY(0) rotateX(0) scale(1)';
                    letter.style.transition = 'all 0.8s ease-out';
                }, 500 + (index * 100));
            });
            
            if (menuContainer) {
                setTimeout(() => {
                    menuContainer.style.opacity = '1';
                    menuContainer.style.transform = 'translateY(0)';
                    menuContainer.style.transition = 'all 0.6s ease-out';
                }, 1500);
            }
            return;
        }

        // Animación de entrada épica del título con anime.js
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
            if (this.vfx) {
                try {
                    this.vfx.createShockwave(
                        window.innerWidth / 2,
                        window.innerHeight / 2,
                        300
                    );
                    this.vfx.screenShake(8);
                } catch (error) {
                    console.warn('⚠️ TitleScene: Error en efectos VFX:', error);
                }
            }
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
        console.log('🧹 TitleScene.cleanup() iniciado');
        
        // Remover el contenedor de la escena
        const container = document.getElementById('title-scene-container');
        if (container) {
            if (typeof anime !== 'undefined') {
                anime({
                    targets: container,
                    opacity: [1, 0],
                    scale: [1, 1.1],
                    duration: 500,
                    easing: 'easeInExpo',
                    complete: () => {
                        container.remove();
                        console.log('🧹 TitleScene container removido con animación');
                    }
                });
            } else {
                container.remove();
                console.log('🧹 TitleScene container removido directamente');
            }
        }

        // Remover estilos CSS
        const styles = document.getElementById('title-scene-styles');
        if (styles) {
            styles.remove();
            console.log('🧹 TitleScene estilos CSS removidos');
        }

        // Remover event listener
        if (this.keyListener) {
            document.removeEventListener('keydown', this.keyListener);
            this.keyListener = null;
            console.log('🧹 TitleScene keyListener removido');
        }

        // Limpiar efectos visuales
        if (this.vfx) {
            try {
                this.vfx.cleanup();
                console.log('🧹 TitleScene VFX limpiados');
            } catch (error) {
                console.warn('⚠️ Error limpiando VFX:', error);
            }
        }

        // Mostrar canvas del juego nuevamente
        const gameCanvas = document.getElementById('gameCanvas');
        if (gameCanvas) {
            gameCanvas.style.display = 'block';
            console.log('🧹 Canvas del juego mostrado nuevamente');
        }
        
        console.log('✅ TitleScene cleanup completado');
    }
}
