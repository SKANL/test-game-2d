/**
 * TitleScene - Pantalla de título principal del juego
 * Sección 9 del Documento Maestro
 */
export default class TitleScene {
    constructor(onStart, onOptions) {
        this.onStart = onStart;
        this.onOptions = onOptions;
        this.animationId = null;
        this.titleOffset = 0;
    }

    render() {
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
            overflow: hidden;
            font-family: Arial, sans-serif;
        `;

        // Título principal con animación
        const titleContainer = document.createElement('div');
        titleContainer.style.cssText = `
            text-align: center;
            margin-bottom: 50px;
            animation: titlePulse 2s ease-in-out infinite alternate;
        `;

        const title = document.createElement('h1');
        title.textContent = 'FIGHTER 2D';
        title.style.cssText = `
            font-size: 4rem;
            color: #ffaa00;
            text-shadow: 
                0 0 10px #ffaa00,
                0 0 20px #ffaa00,
                0 0 30px #ffaa00,
                0 0 40px #ff8800;
            margin: 0;
            font-weight: bold;
            letter-spacing: 5px;
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