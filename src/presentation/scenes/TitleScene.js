/**
 * TitleScene - Pantalla de título principal del juego con efectos cinematográficos
 * Sección 9 del Documento Maestro - Mejorado con anime.js
 */
// anime.js se carga globalmente desde el HTML

export default class TitleScene {
    constructor(onStart, onOptions) {
        this.onStart = onStart;
        this.onOptions = onOptions;
        this.animationId = null;
        this.titleOffset = 0;
        this.particleAnimations = [];
        this.mainTimeline = null;
    }

    render() {
        // Verificar que anime.js esté disponible
        if (typeof anime === 'undefined') {
            console.error('❌ anime.js no está disponible. Asegúrate de que se carga en el HTML.');
            // Fallback sin animaciones
            this.renderWithoutAnimations();
            return;
        }

        const container = document.createElement('div');
        container.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: linear-gradient(45deg, #000428 0%, #004e92 25%, #000428 50%, #004e92 75%, #000428 100%);
            background-size: 400% 400%;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            overflow: hidden;
            font-family: 'Arial', sans-serif;
        `;
        container.id = 'titleSceneContainer';

        // Animación del fondo
        anime({
            targets: container,
            backgroundPosition: ['0% 50%', '100% 50%'],
            duration: 8000,
            easing: 'linear',
            loop: true
        });

        // Crear matriz de código de fondo estilo Matrix
        const matrixOverlay = this.createMatrixEffect();
        container.appendChild(matrixOverlay);

        // Partículas de energía avanzadas
        const particlesContainer = this.createAdvancedParticles();
        container.appendChild(particlesContainer);

        // Título principal con efectos épicos
        const titleContainer = document.createElement('div');
        titleContainer.style.cssText = `
            text-align: center;
            margin-bottom: 50px;
            position: relative;
            z-index: 10;
        `;
        titleContainer.id = 'titleContainer';

        const title = document.createElement('h1');
        title.textContent = 'FIGHTER 2D';
        title.style.cssText = `
            font-size: 5rem;
            color: #ffaa00;
            text-shadow: 
                0 0 10px #ffaa00,
                0 0 20px #ffaa00,
                0 0 30px #ffaa00,
                0 0 40px #ff8800,
                0 0 50px #ff6600;
            margin: 0;
            font-weight: bold;
            letter-spacing: 8px;
            transform: scale(0) rotateY(180deg);
            opacity: 0;
        `;
        title.id = 'mainTitle';

        // Crear letras individuales para animación
        const letters = title.textContent.split('').map((letter, index) => {
            const span = document.createElement('span');
            span.textContent = letter === ' ' ? '\u00A0' : letter;
            span.style.cssText = `
                display: inline-block;
                transform: translateY(100px) rotateX(90deg);
                opacity: 0;
            `;
            span.className = 'title-letter';
            return span;
        });

        title.innerHTML = '';
        letters.forEach(letter => title.appendChild(letter));

        const subtitle = document.createElement('h2');
        subtitle.textContent = 'Presiona cualquier tecla para comenzar';
        subtitle.style.cssText = `
            font-size: 1.5rem;
            color: #ffffff;
            margin: 20px 0;
            opacity: 0;
            transform: translateY(50px);
            text-shadow: 0 0 10px rgba(255,255,255,0.5);
        `;
        subtitle.id = 'subtitle';

        titleContainer.appendChild(title);
        titleContainer.appendChild(subtitle);

        // Menu de opciones con efectos 3D
        const menuContainer = document.createElement('div');
        menuContainer.style.cssText = `
            display: flex;
            flex-direction: column;
            gap: 20px;
            margin-top: 50px;
            position: relative;
            z-index: 10;
            transform: translateY(100px);
            opacity: 0;
        `;
        menuContainer.id = 'menuContainer';

        const startButton = this.createEnhancedMenuButton('INICIAR JUEGO', '⚔️', () => {
            this.playExitAnimation(() => {
                this.cleanup();
                if (this.onStart) this.onStart();
            });
        });

        const optionsButton = this.createEnhancedMenuButton('OPCIONES', '⚙️', () => {
            this.playExitAnimation(() => {
                this.cleanup();
                if (this.onOptions) this.onOptions();
            });
        });

        const exitButton = this.createEnhancedMenuButton('SALIR', '🚪', () => {
            if (confirm('¿Seguro que quieres salir?')) {
                window.close();
            }
        });

        menuContainer.appendChild(startButton);
        menuContainer.appendChild(optionsButton);
        menuContainer.appendChild(exitButton);

        container.appendChild(titleContainer);
        container.appendChild(menuContainer);

        // Añadir estilos CSS avanzados
        this.addAdvancedAnimationStyles();

        // Event listener para cualquier tecla
        this.keyListener = (event) => {
            this.playExitAnimation(() => {
                this.cleanup();
                if (this.onStart) this.onStart();
            });
        };
        document.addEventListener('keydown', this.keyListener);

        document.body.appendChild(container);

        // Iniciar animaciones de entrada
        this.playEntranceAnimation();
    }

    createEnhancedMenuButton(text, icon, onClick) {
        const button = document.createElement('button');
        button.innerHTML = `<span class="button-icon">${icon}</span><span class="button-text">${text}</span>`;
        button.style.cssText = `
            padding: 20px 50px;
            font-size: 1.3rem;
            background: linear-gradient(135deg, #ff6b6b, #ee5a24, #ff6b6b);
            background-size: 200% 200%;
            color: white;
            border: 2px solid transparent;
            border-radius: 15px;
            cursor: pointer;
            transition: all 0.3s ease;
            box-shadow: 
                0 8px 25px rgba(0,0,0,0.3),
                inset 0 1px 0 rgba(255,255,255,0.2);
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 3px;
            position: relative;
            overflow: hidden;
            transform: perspective(1000px) rotateX(0deg);
        `;

        // Crear efecto de brillo interno
        const shine = document.createElement('div');
        shine.style.cssText = `
            position: absolute;
            top: -50%;
            left: -50%;
            width: 200%;
            height: 200%;
            background: linear-gradient(45deg, transparent, rgba(255,255,255,0.1), transparent);
            transform: translateX(-100%);
            transition: transform 0.8s ease;
        `;
        button.appendChild(shine);

        // Eventos con animaciones anime.js
        button.onmouseenter = () => {
            anime({
                targets: button,
                scale: 1.05,
                rotateX: -5,
                backgroundColor: '#ff8e8e',
                boxShadow: '0 12px 35px rgba(255,107,107,0.4), inset 0 1px 0 rgba(255,255,255,0.3)',
                duration: 300,
                easing: 'easeOutCubic'
            });

            anime({
                targets: shine,
                translateX: '100%',
                duration: 800,
                easing: 'easeInOutQuad'
            });
        };

        button.onmouseleave = () => {
            anime({
                targets: button,
                scale: 1,
                rotateX: 0,
                backgroundColor: '#ff6b6b',
                boxShadow: '0 8px 25px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.2)',
                duration: 300,
                easing: 'easeOutCubic'
            });

            anime({
                targets: shine,
                translateX: '-100%',
                duration: 0
            });
        };

        button.onclick = () => {
            anime({
                targets: button,
                scale: 0.95,
                duration: 150,
                easing: 'easeInQuad',
                complete: () => {
                    anime({
                        targets: button,
                        scale: 1.05,
                        duration: 150,
                        easing: 'easeOutQuad',
                        complete: onClick
                    });
                }
            });
        };

        return button;
    }

    createMatrixEffect() {
        const matrixContainer = document.createElement('div');
        matrixContainer.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            overflow: hidden;
            z-index: 1;
            opacity: 0.1;
        `;

        // Crear columnas de código Matrix
        for (let i = 0; i < 20; i++) {
            const column = document.createElement('div');
            column.style.cssText = `
                position: absolute;
                top: -100%;
                left: ${i * 5}%;
                width: 20px;
                color: #00ff00;
                font-family: 'Courier New', monospace;
                font-size: 14px;
                white-space: pre;
                opacity: 0.8;
            `;

            // Generar texto aleatorio tipo matriz
            let matrixText = '';
            for (let j = 0; j < 50; j++) {
                matrixText += Math.random() > 0.5 ? '1' : '0';
                if (j % 10 === 9) matrixText += '\n';
            }
            column.textContent = matrixText;

            matrixContainer.appendChild(column);

            // Animar caída del código
            anime({
                targets: column,
                translateY: ['0%', '120vh'],
                duration: Math.random() * 5000 + 3000,
                delay: Math.random() * 2000,
                easing: 'linear',
                loop: true
            });
        }

        return matrixContainer;
    }

    createAdvancedParticles() {
        const particlesContainer = document.createElement('div');
        particlesContainer.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            overflow: hidden;
            z-index: 2;
        `;

        // Crear partículas de energía más avanzadas
        for (let i = 0; i < 50; i++) {
            const particle = document.createElement('div');
            const size = Math.random() * 6 + 3;
            particle.style.cssText = `
                position: absolute;
                width: ${size}px;
                height: ${size}px;
                background: ${this.getEnergyColor()};
                border-radius: 50%;
                box-shadow: 0 0 ${size * 2}px ${this.getEnergyColor()};
                opacity: 0;
            `;

            particlesContainer.appendChild(particle);

            // Animación compleja de partículas
            const animation = anime({
                targets: particle,
                translateX: [
                    Math.random() * window.innerWidth,
                    Math.random() * window.innerWidth
                ],
                translateY: [
                    Math.random() * window.innerHeight,
                    Math.random() * window.innerHeight
                ],
                scale: [0, 1, 0.5, 1, 0],
                opacity: [0, 0.8, 0.6, 0.9, 0],
                rotate: '1turn',
                duration: Math.random() * 8000 + 5000,
                delay: Math.random() * 3000,
                easing: 'easeInOutSine',
                loop: true
            });

            this.particleAnimations.push(animation);
        }

        return particlesContainer;
    }

    getEnergyColor() {
        const colors = [
            '#ffaa00', '#ff6b6b', '#4ecdc4', '#45b7d1', 
            '#f9ca24', '#6c5ce7', '#a29bfe', '#fd79a8'
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    playEntranceAnimation() {
        // Timeline principal para animaciones de entrada
        this.mainTimeline = anime.timeline({
            easing: 'easeOutExpo',
            duration: 1000
        });

        // Animación de las letras del título
        this.mainTimeline.add({
            targets: '.title-letter',
            translateY: [100, 0],
            rotateX: [90, 0],
            opacity: [0, 1],
            delay: anime.stagger(100),
            duration: 800
        }).add({
            targets: '#subtitle',
            translateY: [50, 0],
            opacity: [0, 1],
            duration: 600
        }, '-=400').add({
            targets: '#menuContainer',
            translateY: [100, 0],
            opacity: [0, 1],
            duration: 800
        }, '-=300');

        // Efecto pulsante continuo en el título
        anime({
            targets: '#mainTitle',
            textShadow: [
                '0 0 10px #ffaa00, 0 0 20px #ffaa00, 0 0 30px #ffaa00, 0 0 40px #ff8800',
                '0 0 15px #ffaa00, 0 0 25px #ffaa00, 0 0 35px #ffaa00, 0 0 45px #ff8800, 0 0 55px #ff6600'
            ],
            scale: [1, 1.02],
            duration: 2000,
            direction: 'alternate',
            loop: true,
            easing: 'easeInOutSine'
        });
    }

    playExitAnimation(callback) {
        // Detener animaciones existentes
        if (this.mainTimeline) this.mainTimeline.pause();
        this.particleAnimations.forEach(anim => anim.pause());

        // Animación de salida épica
        anime.timeline({
            complete: callback
        }).add({
            targets: '#titleSceneContainer',
            scale: 1.1,
            opacity: 0,
            rotateY: 45,
            duration: 800,
            easing: 'easeInBack'
        });
    }

    createParticles() {
        // Método mantenido para compatibilidad, pero mejorado
        return this.createAdvancedParticles();
    }

    getRandomColor() {
        return this.getEnergyColor();
    }

    addAdvancedAnimationStyles() {
        if (document.getElementById('titleSceneAdvancedStyles')) return;

        const style = document.createElement('style');
        style.id = 'titleSceneAdvancedStyles';
        style.textContent = `
            @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&display=swap');
            
            #titleSceneContainer {
                font-family: 'Orbitron', monospace !important;
            }
            
            .button-icon {
                margin-right: 10px;
                font-size: 1.2em;
                display: inline-block;
                transform: translateY(-1px);
            }
            
            .button-text {
                font-weight: 700;
                letter-spacing: 2px;
            }
            
            .title-letter {
                transition: all 0.3s ease;
            }
            
            .title-letter:hover {
                color: #ff6600;
                text-shadow: 
                    0 0 20px #ff6600,
                    0 0 30px #ff6600,
                    0 0 40px #ff6600;
                transform: scale(1.1) rotateY(15deg);
            }
            
            @keyframes energyPulse {
                0%, 100% {
                    box-shadow: 0 0 5px #ffaa00, 0 0 10px #ffaa00, 0 0 15px #ffaa00;
                }
                50% {
                    box-shadow: 0 0 10px #ff6600, 0 0 20px #ff6600, 0 0 30px #ff6600;
                }
            }
            
            @keyframes matrixRain {
                0% {
                    transform: translateY(-100vh);
                    opacity: 0;
                }
                10% {
                    opacity: 1;
                }
                90% {
                    opacity: 1;
                }
                100% {
                    transform: translateY(100vh);
                    opacity: 0;
                }
            }
            
            @keyframes hologramFlicker {
                0%, 100% { opacity: 1; }
                50% { opacity: 0.8; }
                75% { opacity: 0.9; }
            }
        `;
        document.head.appendChild(style);
    }

    addAnimationStyles() {
        // Método mantenido para compatibilidad
        this.addAdvancedAnimationStyles();
    }

    cleanup() {
        // Remover event listener
        if (this.keyListener) {
            document.removeEventListener('keydown', this.keyListener);
            this.keyListener = null;
        }

        // Detener todas las animaciones de anime.js
        if (this.mainTimeline) {
            this.mainTimeline.pause();
            this.mainTimeline = null;
        }

        this.particleAnimations.forEach(animation => {
            if (animation && animation.pause) {
                animation.pause();
            }
        });
        this.particleAnimations = [];

        // Detener animaciones del frame tradicional
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }

        // Remover estilos
        const styles = document.getElementById('titleSceneAdvancedStyles');
        if (styles) {
            styles.remove();
        }

        // Limpiar el DOM
        const container = document.getElementById('titleSceneContainer');
        if (container) {
            container.remove();
        }
    }

    // Método fallback sin animaciones
    renderWithoutAnimations() {
        console.warn('⚠️ Renderizando TitleScene sin animaciones por falta de anime.js');
        
        const container = document.createElement('div');
        container.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: linear-gradient(45deg, #000428 0%, #004e92 100%);
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            font-family: 'Arial', sans-serif;
            color: white;
        `;
        container.id = 'titleSceneContainer';

        // Título simple
        const title = document.createElement('h1');
        title.textContent = 'FIGHTER ARENA';
        title.style.cssText = `
            font-size: 4rem;
            margin-bottom: 2rem;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
        `;

        // Botones simples
        const startButton = document.createElement('button');
        startButton.textContent = 'COMENZAR';
        startButton.style.cssText = `
            padding: 15px 40px;
            font-size: 1.5rem;
            background: #2ecc71;
            color: white;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            margin: 10px;
        `;
        startButton.onclick = () => {
            this.cleanup();
            if (this.onStart) this.onStart();
        };

        const optionsButton = document.createElement('button');
        optionsButton.textContent = 'OPCIONES';
        optionsButton.style.cssText = `
            padding: 15px 40px;
            font-size: 1.5rem;
            background: #3498db;
            color: white;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            margin: 10px;
        `;
        optionsButton.onclick = () => {
            this.cleanup();
            if (this.onOptions) this.onOptions();
        };

        container.appendChild(title);
        container.appendChild(startButton);
        container.appendChild(optionsButton);
        document.body.appendChild(container);
    }
}