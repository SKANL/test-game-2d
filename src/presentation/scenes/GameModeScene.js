/**
 * GameModeScene - Selección de modo de juego con efectos de paralaje épicos
 * Sección 9 del Documento Maestro - Mejorado con anime.js
 */
// anime.js se carga globalmente desde el HTML

export default class GameModeScene {
    constructor(onModeSelected) {
        this.onModeSelected = onModeSelected;
        this.selectedMode = null;
        this.animations = [];
        this.particleAnimations = [];
    }

    render() {
        // Verificar que anime.js esté disponible
        if (typeof anime === 'undefined') {
            console.error('❌ anime.js no está disponible en GameModeScene. Usando versión básica.');
            this.renderBasicVersion();
            return;
        }

        const gameCanvas = document.getElementById('gameCanvas');
        if (gameCanvas) {
            gameCanvas.style.display = 'none';
        }

        const container = document.createElement('div');
        container.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: 
                radial-gradient(circle at 30% 20%, #ff6b6b30 0%, transparent 60%),
                radial-gradient(circle at 70% 80%, #4ecdc430 0%, transparent 60%),
                linear-gradient(135deg, #0f0f23 0%, #2c1810 50%, #0f0f23 100%);
            background-size: 100% 100%, 100% 100%, 300% 300%;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            z-index: 1000;
            font-family: 'Orbitron', Arial, sans-serif;
            overflow: hidden;
        `;
        container.id = 'gameModeContainer';

        // Animación del fondo dinámico
        anime({
            targets: container,
            backgroundPosition: ['0% 50%', '100% 50%'],
            duration: 15000,
            easing: 'linear',
            loop: true
        });

        // Crear efectos de paralaje
        const parallaxLayer1 = this.createParallaxLayer(1, '#ff6b6b20');
        const parallaxLayer2 = this.createParallaxLayer(2, '#4ecdc420');
        const parallaxLayer3 = this.createParallaxLayer(3, '#ffaa0020');

        container.appendChild(parallaxLayer1);
        container.appendChild(parallaxLayer2);
        container.appendChild(parallaxLayer3);

        // Título principal épico
        const title = document.createElement('h1');
        title.textContent = 'SELECCIONA TU DESTINO';
        title.style.cssText = `
            color: transparent;
            background: linear-gradient(45deg, #ff6b6b, #ffaa00, #4ecdc4, #ff6b6b);
            background-size: 300% 300%;
            background-clip: text;
            -webkit-background-clip: text;
            margin-bottom: 60px;
            font-size: 3.5rem;
            font-weight: 900;
            text-align: center;
            text-shadow: 0 4px 8px rgba(0,0,0,0.3);
            letter-spacing: 4px;
            transform: translateY(-100px) scale(0.5);
            opacity: 0;
        `;
        title.id = 'gameModeTitle';

        // Animación del gradiente del título
        anime({
            targets: title,
            backgroundPosition: ['0% 50%', '100% 50%'],
            duration: 4000,
            easing: 'linear',
            loop: true
        });

        // Contenedor de modos con efectos 3D
        const modesContainer = document.createElement('div');
        modesContainer.style.cssText = `
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
            gap: 30px;
            max-width: 1200px;
            width: 100%;
            padding: 0 20px;
            perspective: 1000px;
            transform: translateY(100px);
            opacity: 0;
        `;
        modesContainer.id = 'modesContainer';

        const modes = [
            {
                id: 'story',
                name: 'Modo Historia',
                description: 'Vive la historia de cada luchador',
                icon: '📖',
                color: '#e74c3c',
                enabled: false,
                gradient: 'linear-gradient(135deg, #e74c3c, #c0392b)'
            },
            {
                id: 'arcade',
                name: 'Modo Arcade',
                description: 'Combates consecutivos contra la CPU',
                icon: '🏆',
                color: '#f39c12',
                enabled: false,
                gradient: 'linear-gradient(135deg, #f39c12, #e67e22)'
            },
            {
                id: 'pvp',
                name: 'Jugador vs Jugador',
                description: 'Combate local entre dos jugadores',
                icon: '👥',
                color: '#2ecc71',
                enabled: true,
                gradient: 'linear-gradient(135deg, #2ecc71, #27ae60)'
            },
            {
                id: 'cpu',
                name: 'Jugador vs CPU',
                description: 'Combate contra la inteligencia artificial',
                icon: '🤖',
                color: '#3498db',
                enabled: true,
                gradient: 'linear-gradient(135deg, #3498db, #2980b9)'
            },
            {
                id: 'training',
                name: 'Modo Entrenamiento',
                description: 'Practica combos y movimientos',
                icon: '🥋',
                color: '#9b59b6',
                enabled: false,
                gradient: 'linear-gradient(135deg, #9b59b6, #8e44ad)'
            },
            {
                id: 'online',
                name: 'Combate Online',
                description: 'Enfréntate a jugadores de todo el mundo',
                icon: '🌐',
                color: '#1abc9c',
                enabled: false,
                gradient: 'linear-gradient(135deg, #1abc9c, #16a085)'
            }
        ];

        modes.forEach((mode, index) => {
            const modeCard = this.createEnhancedModeCard(mode, index);
            modesContainer.appendChild(modeCard);
        });

        // Información adicional con efectos
        const infoText = document.createElement('p');
        infoText.textContent = 'Los modos marcados como "Próximamente" estarán disponibles en futuras actualizaciones';
        infoText.style.cssText = `
            color: rgba(255,255,255,0.7);
            text-align: center;
            margin-top: 40px;
            font-size: 1rem;
            font-style: italic;
            transform: translateY(50px);
            opacity: 0;
        `;
        infoText.id = 'infoText';

        container.appendChild(title);
        container.appendChild(modesContainer);
        container.appendChild(infoText);

        // Agregar estilos épicos
        this.addEpicStyles();

        document.body.appendChild(container);

        // Iniciar animaciones de entrada
        this.playEntranceAnimation();
    }

    createParallaxLayer(depth, color) {
        const layer = document.createElement('div');
        layer.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: ${depth};
            pointer-events: none;
        `;

        // Crear formas geométricas flotantes
        for (let i = 0; i < 8; i++) {
            const shape = document.createElement('div');
            const size = Math.random() * 60 + 20;
            shape.style.cssText = `
                position: absolute;
                width: ${size}px;
                height: ${size}px;
                background: ${color};
                border-radius: ${Math.random() > 0.5 ? '50%' : '0%'};
                left: ${Math.random() * 100}%;
                top: ${Math.random() * 100}%;
                opacity: 0.3;
                transform: rotate(${Math.random() * 360}deg);
            `;

            layer.appendChild(shape);

            // Animación de paralaje basada en profundidad
            anime({
                targets: shape,
                translateX: ['-50px', '50px'],
                translateY: ['-30px', '30px'],
                rotate: '+=360deg',
                duration: 8000 + (depth * 2000),
                easing: 'linear',
                loop: true,
                direction: 'alternate'
            });
        }

        return layer;
    }

    createEnhancedModeCard(mode, index) {
        const card = document.createElement('div');
        card.style.cssText = `
            background: ${mode.enabled ? 
                `linear-gradient(135deg, ${mode.color}20, ${mode.color}10)` : 
                'linear-gradient(135deg, rgba(100,100,100,0.1), rgba(50,50,50,0.1))'
            };
            border: 2px solid ${mode.enabled ? mode.color + '60' : '#666'};
            border-radius: 20px;
            padding: 30px;
            text-align: center;
            cursor: ${mode.enabled ? 'pointer' : 'not-allowed'};
            position: relative;
            overflow: hidden;
            opacity: ${mode.enabled ? 1 : 0.6};
            transform: perspective(1000px) rotateX(5deg) translateY(20px);
            transition: all 0.3s ease;
            backdrop-filter: blur(5px);
            box-shadow: 
                0 10px 30px rgba(0,0,0,0.3),
                inset 0 1px 0 rgba(255,255,255,0.1);
        `;
        card.id = `modeCard${index}`;

        // Efecto de brillo dinámico
        const shimmer = document.createElement('div');
        shimmer.style.cssText = `
            position: absolute;
            top: -50%;
            left: -50%;
            width: 200%;
            height: 200%;
            background: linear-gradient(45deg, transparent, ${mode.enabled ? mode.color + '30' : '#ffffff10'}, transparent);
            transform: translateX(-100%) rotate(45deg);
            transition: transform 0.8s ease;
        `;
        card.appendChild(shimmer);

        // Icono del modo con animación
        const iconContainer = document.createElement('div');
        iconContainer.style.cssText = `
            position: relative;
            z-index: 2;
            margin-bottom: 20px;
        `;

        const icon = document.createElement('div');
        icon.textContent = mode.icon;
        icon.style.cssText = `
            font-size: 4rem;
            margin-bottom: 20px;
            filter: ${mode.enabled ? 'none' : 'grayscale(1)'};
            transform: scale(1);
            transition: all 0.3s ease;
        `;

        // Anillo de energía alrededor del icono
        const energyRing = document.createElement('div');
        energyRing.style.cssText = `
            position: absolute;
            top: 50%;
            left: 50%;
            width: 80px;
            height: 80px;
            border: 2px solid ${mode.enabled ? mode.color : '#666'};
            border-radius: 50%;
            transform: translate(-50%, -50%) scale(0);
            opacity: 0;
        `;

        iconContainer.appendChild(energyRing);
        iconContainer.appendChild(icon);

        // Nombre del modo
        const name = document.createElement('h3');
        name.textContent = mode.name;
        name.style.cssText = `
            color: ${mode.enabled ? mode.color : '#888'};
            font-size: 1.6rem;
            margin: 0 0 15px 0;
            font-weight: 700;
            z-index: 2;
            position: relative;
            text-shadow: 0 2px 4px rgba(0,0,0,0.3);
        `;

        // Descripción
        const description = document.createElement('p');
        description.textContent = mode.description;
        description.style.cssText = `
            color: ${mode.enabled ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.5)'};
            font-size: 1rem;
            margin: 0 0 25px 0;
            line-height: 1.4;
            z-index: 2;
            position: relative;
        `;

        // Estado del modo
        const status = document.createElement('div');
        if (mode.enabled) {
            status.textContent = 'DISPONIBLE';
            status.style.cssText = `
                background: ${mode.gradient};
                color: white;
                padding: 8px 16px;
                border-radius: 20px;
                font-size: 0.8rem;
                font-weight: bold;
                letter-spacing: 1px;
                z-index: 2;
                position: relative;
                box-shadow: 0 4px 15px ${mode.color}40;
            `;
        } else {
            status.textContent = 'PRÓXIMAMENTE';
            status.style.cssText = `
                background: linear-gradient(135deg, #666, #555);
                color: #ccc;
                padding: 8px 16px;
                border-radius: 20px;
                font-size: 0.8rem;
                font-weight: bold;
                letter-spacing: 1px;
                z-index: 2;
                position: relative;
            `;
        }

        // Eventos con animaciones espectaculares
        if (mode.enabled) {
            card.onmouseenter = () => {
                anime({
                    targets: card,
                    scale: 1.05,
                    rotateX: 0,
                    rotateY: 5,
                    borderColor: mode.color,
                    duration: 400,
                    easing: 'easeOutCubic'
                });

                anime({
                    targets: shimmer,
                    translateX: '100%',
                    duration: 800,
                    easing: 'easeInOutQuad'
                });

                anime({
                    targets: icon,
                    scale: 1.2,
                    rotate: '10deg',
                    duration: 300,
                    easing: 'easeOutBack'
                });

                anime({
                    targets: energyRing,
                    scale: [0, 1.2, 1],
                    opacity: [0, 0.8, 0],
                    duration: 800,
                    easing: 'easeOutQuad'
                });
            };

            card.onmouseleave = () => {
                anime({
                    targets: card,
                    scale: 1,
                    rotateX: 5,
                    rotateY: 0,
                    borderColor: mode.color + '60',
                    duration: 400,
                    easing: 'easeOutCubic'
                });

                anime({
                    targets: shimmer,
                    translateX: '-100%',
                    duration: 0
                });

                anime({
                    targets: icon,
                    scale: 1,
                    rotate: '0deg',
                    duration: 300,
                    easing: 'easeOutCubic'
                });
            };

            card.onclick = () => {
                this.selectModeWithAnimation(mode.id, card);
            };
        }

        card.appendChild(iconContainer);
        card.appendChild(name);
        card.appendChild(description);
        card.appendChild(status);

        return card;
    }

    // Mantener el método original para compatibilidad
    createModeCard(mode) {
        return this.createEnhancedModeCard(mode, 0);
    }

    selectModeWithAnimation(modeId, cardElement) {
        // Animación de selección épica
        anime({
            targets: cardElement,
            scale: [1.05, 0.95, 1.1],
            rotateY: [0, 180, 360],
            borderColor: '#ffaa00',
            duration: 1000,
            easing: 'easeInOutBack',
            complete: () => {
                this.selectMode(modeId);
            }
        });

        // Crear explosión de partículas
        this.createModeSelectionExplosion(cardElement);
    }

    createModeSelectionExplosion(element) {
        const rect = element.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        for (let i = 0; i < 20; i++) {
            const particle = document.createElement('div');
            particle.style.cssText = `
                position: fixed;
                left: ${centerX}px;
                top: ${centerY}px;
                width: 8px;
                height: 8px;
                background: #ffaa00;
                border-radius: 50%;
                box-shadow: 0 0 15px #ffaa00;
                pointer-events: none;
                z-index: 1000;
            `;

            document.body.appendChild(particle);

            const angle = (i / 20) * Math.PI * 2;
            const distance = 150;

            anime({
                targets: particle,
                translateX: Math.cos(angle) * distance,
                translateY: Math.sin(angle) * distance,
                scale: [1, 0],
                opacity: [1, 0],
                duration: 1000,
                easing: 'easeOutQuad',
                complete: () => particle.remove()
            });
        }
    }

    playEntranceAnimation() {
        anime.timeline({
            easing: 'easeOutExpo'
        })
        .add({
            targets: '#gameModeTitle',
            translateY: ['-100px', '0px'],
            scale: [0.5, 1],
            opacity: [0, 1],
            duration: 1000
        })
        .add({
            targets: '#modesContainer',
            translateY: ['100px', '0px'],
            opacity: [0, 1],
            duration: 800
        }, '-=600')
        .add({
            targets: '[id^="modeCard"]',
            translateY: ['50px', '0px'],
            rotateX: ['25deg', '5deg'],
            opacity: [0, 1],
            delay: anime.stagger(150),
            duration: 600,
            easing: 'easeOutBack'
        }, '-=400')
        .add({
            targets: '#infoText',
            translateY: ['50px', '0px'],
            opacity: [0, 1],
            duration: 600
        }, '-=200');
    }

    addEpicStyles() {
        if (document.getElementById('gameModeStyles')) return;

        const style = document.createElement('style');
        style.id = 'gameModeStyles';
        style.textContent = `
            @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&display=swap');
            
            #gameModeContainer {
                font-family: 'Orbitron', Arial, sans-serif;
            }
            
            @keyframes float {
                0%, 100% { transform: translateY(0px); }
                50% { transform: translateY(-10px); }
            }
            
            @keyframes energyPulse {
                0%, 100% { 
                    box-shadow: 0 0 10px currentColor;
                    opacity: 0.8;
                }
                50% { 
                    box-shadow: 0 0 20px currentColor, 0 0 30px currentColor;
                    opacity: 1;
                }
            }
        `;
        document.head.appendChild(style);
    }

    selectMode(modeId) {
        this.selectedMode = modeId;
        this.showModeConfirmation(modeId);
    }

    showModeConfirmation(modeId) {
        const modes = {
            'pvp': { name: 'Jugador vs Jugador', description: 'Combate local entre dos jugadores' },
            'cpu': { name: 'Jugador vs CPU', description: 'Combate contra la inteligencia artificial' },
            'story': { name: 'Modo Historia', description: 'Vive la historia de cada luchador' },
            'arcade': { name: 'Modo Arcade', description: 'Combates consecutivos contra la CPU' },
            'training': { name: 'Modo Entrenamiento', description: 'Practica combos y movimientos' },
            'online': { name: 'Combate Online', description: 'Enfréntate a jugadores de todo el mundo' }
        };

        const selectedModeInfo = modes[modeId];
        if (!selectedModeInfo) return;

        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.8);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 2000;
            opacity: 0;
        `;

        const confirmDialog = document.createElement('div');
        confirmDialog.style.cssText = `
            background: linear-gradient(135deg, #2c3e50, #34495e);
            border: 2px solid #3498db;
            border-radius: 15px;
            padding: 40px;
            text-align: center;
            color: white;
            max-width: 400px;
            transform: scale(0.8);
        `;

        confirmDialog.innerHTML = `
            <h2 style="color: #3498db; margin-top: 0;">Modo Seleccionado</h2>
            <h3>${selectedModeInfo.name}</h3>
            <p style="margin: 20px 0; opacity: 0.8;">${selectedModeInfo.description}</p>
            <div style="display: flex; gap: 20px; justify-content: center; margin-top: 30px;">
                <button id="confirmBtn" style="
                    padding: 12px 24px;
                    background: #2ecc71;
                    color: white;
                    border: none;
                    border-radius: 8px;
                    cursor: pointer;
                    font-weight: bold;
                ">CONFIRMAR</button>
                <button id="cancelBtn" style="
                    padding: 12px 24px;
                    background: #e74c3c;
                    color: white;
                    border: none;
                    border-radius: 8px;
                    cursor: pointer;
                    font-weight: bold;
                ">CANCELAR</button>
            </div>
        `;

        overlay.appendChild(confirmDialog);
        document.body.appendChild(overlay);

        // Verificar si anime.js está disponible
        if (typeof anime !== 'undefined') {
            anime({
                targets: overlay,
                opacity: 1,
                duration: 300,
                easing: 'easeOutQuad'
            });

            anime({
                targets: confirmDialog,
                scale: [0.8, 1],
                duration: 400,
                easing: 'easeOutBack',
                delay: 100
            });
        } else {
            // Versión sin animaciones
            overlay.style.opacity = '1';
            confirmDialog.style.transform = 'scale(1)';
        }

        document.getElementById('confirmBtn').onclick = () => {
            if (typeof anime !== 'undefined') {
                anime({
                    targets: overlay,
                    opacity: 0,
                    duration: 300,
                    complete: () => {
                        overlay.remove();
                        if (this.onModeSelected) {
                            this.onModeSelected(modeId);
                        }
                    }
                });
            } else {
                // Versión sin animaciones
                overlay.remove();
                if (this.onModeSelected) {
                    this.onModeSelected(modeId);
                }
            }
        };

        document.getElementById('cancelBtn').onclick = () => {
            if (typeof anime !== 'undefined') {
                anime({
                    targets: overlay,
                    opacity: 0,
                    duration: 300,
                    complete: () => overlay.remove()
                });
            } else {
                // Versión sin animaciones
                overlay.remove();
            }
        };
    }

    cleanup() {
        const gameCanvas = document.getElementById('gameCanvas');
        if (gameCanvas) {
            gameCanvas.style.display = 'block';
        }

        this.animations.forEach(anim => {
            if (anim && anim.pause) anim.pause();
        });

        this.particleAnimations.forEach(anim => {
            if (anim && anim.pause) anim.pause();
        });

        const styles = document.getElementById('gameModeStyles');
        if (styles) {
            styles.remove();
        }

        const container = document.getElementById('gameModeContainer');
        if (container) {
            container.remove();
        }
    }

    // Método básico sin animaciones
    renderBasicVersion() {
        const gameCanvas = document.getElementById('gameCanvas');
        if (gameCanvas) {
            gameCanvas.style.display = 'none';
        }

        const container = document.createElement('div');
        container.id = 'gameModeContainer';
        container.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            font-family: Arial, sans-serif;
            color: white;
        `;

        const title = document.createElement('h1');
        title.textContent = 'SELECCIONA MODO DE JUEGO';
        title.style.cssText = `
            font-size: 2.5rem;
            margin-bottom: 3rem;
            text-align: center;
        `;

        const modesContainer = document.createElement('div');
        modesContainer.style.cssText = `
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            max-width: 800px;
            width: 100%;
            padding: 0 20px;
        `;

        const modes = [
            { id: 'pvp', name: 'PvP Local', desc: 'Dos jugadores' },
            { id: 'cpu', name: 'vs CPU', desc: 'Contra la máquina' },
            { id: 'story', name: 'Historia', desc: 'Modo campaña' },
            { id: 'training', name: 'Entrenamiento', desc: 'Practica movimientos' }
        ];

        modes.forEach(mode => {
            const card = document.createElement('div');
            card.style.cssText = `
                background: rgba(255,255,255,0.1);
                border: 2px solid #3498db;
                border-radius: 10px;
                padding: 20px;
                text-align: center;
                cursor: pointer;
                transition: all 0.3s ease;
            `;

            card.innerHTML = `
                <h3 style="margin: 0 0 10px 0; color: #3498db;">${mode.name}</h3>
                <p style="margin: 0; color: #bdc3c7;">${mode.desc}</p>
            `;

            card.onmouseenter = () => {
                card.style.background = 'rgba(52, 152, 219, 0.2)';
                card.style.transform = 'scale(1.05)';
            };

            card.onmouseleave = () => {
                card.style.background = 'rgba(255,255,255,0.1)';
                card.style.transform = 'scale(1)';
            };

            card.onclick = () => {
                this.selectMode(mode.id);
            };

            modesContainer.appendChild(card);
        });

        container.appendChild(title);
        container.appendChild(modesContainer);
        document.body.appendChild(container);
    }
}
