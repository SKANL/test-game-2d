/**
 * CharacterSelectScene - Selección de personajes con efectos 3D épicos
 * Mejorado con anime.js para una experiencia visual impresionante
 */
// anime.js se carga globalmente desde el HTML

export default class CharacterSelectScene {
    constructor(onCharactersSelected, gameMode) {
        this.onCharactersSelected = onCharactersSelected;
        this.gameMode = gameMode; // 'pvp' o 'cpu'
        this.selectedCharacters = {
            p1: null,
            p2: null
        };
        this.animations = [];
        this.entranceTimeline = null;
    }

    render() {
        // Verificar que anime.js esté disponible
        if (typeof anime === 'undefined') {
            console.error('❌ anime.js no está disponible en CharacterSelectScene. Usando versión básica.');
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
                radial-gradient(circle at 20% 80%, #ff6b6b20 0%, transparent 50%),
                radial-gradient(circle at 80% 20%, #4ecdc420 0%, transparent 50%),
                linear-gradient(135deg, #0f0f0f 0%, #1a1a1a 25%, #0f0f0f 50%, #1a1a1a 75%, #0f0f0f 100%);
            background-size: 100% 100%, 100% 100%, 400% 400%;
            display: flex;
            flex-direction: column;
            align-items: center;
            z-index: 1000;
            overflow: hidden;
        `;
        container.id = 'characterSelectContainer';

        // Animación del fondo
        anime({
            targets: container,
            backgroundPosition: ['0% 50%', '100% 50%'],
            duration: 12000,
            easing: 'linear',
            loop: true
        });

        // Efecto de partículas de energía
        const particlesOverlay = this.createEnergyParticles();
        container.appendChild(particlesOverlay);

        // Título principal épico
        const title = document.createElement('h1');
        title.textContent = 'SELECCIÓN DE GUERREROS';
        title.style.cssText = `
            color: transparent;
            background: linear-gradient(45deg, #ff6b6b, #4ecdc4, #ff6b6b);
            background-size: 200% 200%;
            background-clip: text;
            -webkit-background-clip: text;
            margin: 30px 0;
            font-size: 3rem;
            font-family: 'Orbitron', Arial, sans-serif;
            font-weight: 900;
            text-align: center;
            letter-spacing: 4px;
            transform: translateY(-100px) rotateX(90deg);
            opacity: 0;
            text-shadow: 0 4px 8px rgba(0,0,0,0.3);
        `;
        title.id = 'characterSelectTitle';

        // Animación del gradiente del título
        anime({
            targets: title,
            backgroundPosition: ['0% 50%', '100% 50%'],
            duration: 3000,
            easing: 'linear',
            loop: true
        });

        // Contenedor para las dos selecciones con efecto 3D
        const selectionsContainer = document.createElement('div');
        selectionsContainer.style.cssText = `
            display: flex;
            justify-content: space-around;
            width: 100%;
            max-width: 1200px;
            margin-top: 40px;
            perspective: 1000px;
            transform: translateY(100px);
            opacity: 0;
        `;
        selectionsContainer.id = 'selectionsContainer';

        // Selección Jugador 1
        const p1Section = this.createEnhancedPlayerSection(
            'JUGADOR 1',
            'p1',
            '#ff6b6b',
            (character) => this.selectCharacter('p1', character)
        );

        // VS Divider épico
        const vsDivider = this.createVSDivider();

        // Selección Jugador 2 / CPU
        const p2Section = this.createEnhancedPlayerSection(
            this.gameMode === 'pvp' ? 'JUGADOR 2' : 'CPU',
            'p2',
            '#4ecdc4',
            (character) => this.selectCharacter('p2', character)
        );

        selectionsContainer.appendChild(p1Section);
        selectionsContainer.appendChild(vsDivider);
        selectionsContainer.appendChild(p2Section);

        container.appendChild(title);
        container.appendChild(selectionsContainer);

        // Añadir estilos avanzados
        this.addEnhancedStyles();

        document.body.appendChild(container);

        // Iniciar animaciones de entrada
        this.playEntranceAnimation();
    }

    createEnhancedPlayerSection(title, playerId, themeColor, onSelect) {
        const section = document.createElement('div');
        section.style.cssText = `
            display: flex;
            flex-direction: column;
            align-items: center;
            padding: 30px;
            background: linear-gradient(135deg, ${themeColor}15, transparent);
            border: 2px solid ${themeColor}60;
            border-radius: 20px;
            margin: 20px;
            min-width: 350px;
            transform: perspective(1000px) rotateY(${playerId === 'p1' ? '10deg' : '-10deg'});
            box-shadow: 
                0 10px 30px rgba(0,0,0,0.3),
                inset 0 1px 0 rgba(255,255,255,0.1);
            position: relative;
            overflow: hidden;
        `;
        section.id = `${playerId}Section`;

        // Efecto de brillo de fondo
        const shimmer = document.createElement('div');
        shimmer.style.cssText = `
            position: absolute;
            top: -50%;
            left: -50%;
            width: 200%;
            height: 200%;
            background: linear-gradient(45deg, transparent, ${themeColor}20, transparent);
            transform: translateX(-100%) rotate(45deg);
            transition: transform 0.8s ease;
        `;
        section.appendChild(shimmer);

        const titleEl = document.createElement('h2');
        titleEl.textContent = title;
        titleEl.style.cssText = `
            color: ${themeColor};
            margin-bottom: 30px;
            font-size: 1.8rem;
            font-family: 'Orbitron', Arial, sans-serif;
            font-weight: 700;
            text-shadow: 0 0 10px ${themeColor}80;
            letter-spacing: 2px;
            text-align: center;
            z-index: 2;
            position: relative;
        `;

        // Indicador de selección
        const selectionIndicator = document.createElement('div');
        selectionIndicator.style.cssText = `
            position: absolute;
            top: 10px;
            right: 10px;
            width: 40px;
            height: 40px;
            border-radius: 50%;
            background: transparent;
            border: 3px solid ${themeColor}40;
            z-index: 3;
            transition: all 0.3s ease;
        `;
        selectionIndicator.id = `${playerId}Indicator`;

        const characterList = document.createElement('div');
        characterList.style.cssText = `
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 20px;
            width: 100%;
            z-index: 2;
            position: relative;
        `;

        const characters = ['Ryu', 'Ken'];
        characters.forEach((character, index) => {
            const charCard = this.createCharacterCard(character, themeColor, () => {
                onSelect(character);
                this.updateSelectionIndicator(playerId, character, themeColor);
            });
            characterList.appendChild(charCard);

            // Animación de entrada escalonada
            anime({
                targets: charCard,
                scale: [0, 1],
                rotateY: [90, 0],
                opacity: [0, 1],
                duration: 600,
                delay: index * 200 + 800,
                easing: 'easeOutBack'
            });
        });

        section.appendChild(selectionIndicator);
        section.appendChild(titleEl);
        section.appendChild(characterList);

        // Efecto hover para toda la sección
        section.onmouseenter = () => {
            anime({
                targets: section,
                scale: 1.02,
                rotateY: 0,
                duration: 400,
                easing: 'easeOutCubic'
            });

            anime({
                targets: shimmer,
                translateX: '100%',
                duration: 800,
                easing: 'easeInOutQuad'
            });
        };

        section.onmouseleave = () => {
            anime({
                targets: section,
                scale: 1,
                rotateY: playerId === 'p1' ? '10deg' : '-10deg',
                duration: 400,
                easing: 'easeOutCubic'
            });

            anime({
                targets: shimmer,
                translateX: '-100%',
                duration: 0
            });
        };

        return section;
    }

    createCharacterCard(character, themeColor, onSelect) {
        const card = document.createElement('div');
        card.style.cssText = `
            background: linear-gradient(145deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05));
            border: 2px solid ${themeColor}60;
            border-radius: 15px;
            padding: 20px;
            text-align: center;
            cursor: pointer;
            transition: all 0.3s ease;
            transform: perspective(500px) rotateX(5deg);
            box-shadow: 
                0 5px 15px rgba(0,0,0,0.2),
                inset 0 1px 0 rgba(255,255,255,0.1);
            position: relative;
            overflow: hidden;
        `;

        // Imagen del personaje (placeholder mejorado)
        const charImage = document.createElement('div');
        charImage.style.cssText = `
            width: 80px;
            height: 80px;
            background: linear-gradient(135deg, ${themeColor}40, ${themeColor}20);
            border-radius: 50%;
            margin: 0 auto 15px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 2rem;
            color: ${themeColor};
            box-shadow: 
                0 0 20px ${themeColor}30,
                inset 0 2px 4px rgba(255,255,255,0.2);
        `;
        charImage.textContent = character === 'Ryu' ? '🥋' : '🔥';

        const charName = document.createElement('h3');
        charName.textContent = character;
        charName.style.cssText = `
            color: white;
            font-size: 1.2rem;
            margin: 0;
            font-weight: bold;
            text-shadow: 0 2px 4px rgba(0,0,0,0.5);
        `;

        // Efecto de energía
        const energyRing = document.createElement('div');
        energyRing.style.cssText = `
            position: absolute;
            top: 50%;
            left: 50%;
            width: 0;
            height: 0;
            border-radius: 50%;
            border: 2px solid ${themeColor};
            transform: translate(-50%, -50%);
            opacity: 0;
        `;

        card.appendChild(energyRing);
        card.appendChild(charImage);
        card.appendChild(charName);

        // Eventos con animaciones
        card.onmouseenter = () => {
            anime({
                targets: card,
                scale: 1.1,
                rotateX: 0,
                rotateY: 5,
                borderColor: themeColor,
                duration: 300,
                easing: 'easeOutCubic'
            });

            anime({
                targets: energyRing,
                width: 120,
                height: 120,
                opacity: [0, 0.6, 0],
                duration: 600,
                easing: 'easeOutQuad'
            });

            anime({
                targets: charImage,
                scale: 1.2,
                rotate: '10deg',
                duration: 300,
                easing: 'easeOutBack'
            });
        };

        card.onmouseleave = () => {
            anime({
                targets: card,
                scale: 1,
                rotateX: 5,
                rotateY: 0,
                borderColor: `${themeColor}60`,
                duration: 300,
                easing: 'easeOutCubic'
            });

            anime({
                targets: charImage,
                scale: 1,
                rotate: '0deg',
                duration: 300,
                easing: 'easeOutCubic'
            });
        };

        card.onclick = () => {
            // Animación de selección épica
            anime({
                targets: card,
                scale: [1.1, 0.95, 1.05],
                rotateY: [0, 180, 360],
                duration: 800,
                easing: 'easeInOutBack',
                complete: onSelect
            });

            // Explosión de partículas
            this.createSelectionExplosion(card, themeColor);
        };

        return card;
    }

    createVSDivider() {
        const divider = document.createElement('div');
        divider.style.cssText = `
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-width: 100px;
            margin: 0 20px;
            z-index: 5;
        `;

        const vsText = document.createElement('div');
        vsText.textContent = 'VS';
        vsText.style.cssText = `
            font-size: 3rem;
            font-weight: 900;
            color: #ffaa00;
            text-shadow: 
                0 0 10px #ffaa00,
                0 0 20px #ffaa00,
                0 0 30px #ffaa00;
            transform: scale(0) rotate(180deg);
            opacity: 0;
        `;
        vsText.id = 'vsText';

        divider.appendChild(vsText);
        return divider;
    }

    createEnergyParticles() {
        const container = document.createElement('div');
        container.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 1;
        `;

        for (let i = 0; i < 30; i++) {
            const particle = document.createElement('div');
            const size = Math.random() * 4 + 2;
            particle.style.cssText = `
                position: absolute;
                width: ${size}px;
                height: ${size}px;
                background: ${this.getRandomEnergyColor()};
                border-radius: 50%;
                box-shadow: 0 0 ${size * 3}px ${this.getRandomEnergyColor()};
                opacity: 0.7;
            `;

            container.appendChild(particle);

            anime({
                targets: particle,
                translateX: [Math.random() * window.innerWidth, Math.random() * window.innerWidth],
                translateY: [Math.random() * window.innerHeight, Math.random() * window.innerHeight],
                scale: [0, 1, 0.5, 1, 0],
                opacity: [0, 0.7, 0.4, 0.8, 0],
                duration: Math.random() * 6000 + 4000,
                delay: Math.random() * 2000,
                easing: 'easeInOutSine',
                loop: true
            });
        }

        return container;
    }

    getRandomEnergyColor() {
        const colors = ['#ff6b6b', '#4ecdc4', '#ffaa00', '#6c5ce7', '#fd79a8'];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    updateSelectionIndicator(playerId, character, themeColor) {
        const indicator = document.getElementById(`${playerId}Indicator`);
        if (indicator) {
            anime({
                targets: indicator,
                scale: [1, 1.5, 1],
                backgroundColor: [themeColor, '#ffaa00', themeColor],
                duration: 600,
                easing: 'easeOutElastic'
            });
        }
    }

    createSelectionExplosion(element, color) {
        const rect = element.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        for (let i = 0; i < 12; i++) {
            const particle = document.createElement('div');
            particle.style.cssText = `
                position: fixed;
                left: ${centerX}px;
                top: ${centerY}px;
                width: 6px;
                height: 6px;
                background: ${color};
                border-radius: 50%;
                box-shadow: 0 0 10px ${color};
                pointer-events: none;
                z-index: 1000;
            `;

            document.body.appendChild(particle);

            const angle = (i / 12) * Math.PI * 2;
            const distance = 100;

            anime({
                targets: particle,
                translateX: Math.cos(angle) * distance,
                translateY: Math.sin(angle) * distance,
                scale: [1, 0],
                opacity: [1, 0],
                duration: 800,
                easing: 'easeOutQuad',
                complete: () => particle.remove()
            });
        }
    }

    playEntranceAnimation() {
        this.entranceTimeline = anime.timeline({
            easing: 'easeOutExpo'
        });

        this.entranceTimeline
            .add({
                targets: '#characterSelectTitle',
                translateY: ['-100px', '0px'],
                rotateX: ['90deg', '0deg'],
                opacity: [0, 1],
                duration: 800
            })
            .add({
                targets: '#selectionsContainer',
                translateY: ['100px', '0px'],
                opacity: [0, 1],
                duration: 600
            }, '-=400')
            .add({
                targets: '#vsText',
                scale: [0, 1.2, 1],
                rotate: ['180deg', '0deg'],
                opacity: [0, 1],
                duration: 800,
                easing: 'easeOutElastic'
            }, '-=300');
    }

    addEnhancedStyles() {
        if (document.getElementById('characterSelectStyles')) return;

        const style = document.createElement('style');
        style.id = 'characterSelectStyles';
        style.textContent = `
            @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&display=swap');
            
            #characterSelectContainer {
                font-family: 'Orbitron', Arial, sans-serif;
            }
            
            @keyframes energyPulse {
                0%, 100% { 
                    transform: scale(1);
                    box-shadow: 0 0 10px currentColor;
                }
                50% { 
                    transform: scale(1.05);
                    box-shadow: 0 0 20px currentColor, 0 0 30px currentColor;
                }
            }
        `;
        document.head.appendChild(style);
    }

    selectCharacter(player, character) {
        this.selectedCharacters[player] = character;
        
        // Efecto visual de selección confirmada
        const section = document.getElementById(`${player}Section`);
        if (section) {
            anime({
                targets: section,
                backgroundColor: player === 'p1' ? '#ff6b6b20' : '#4ecdc420',
                borderColor: player === 'p1' ? '#ff6b6b' : '#4ecdc4',
                duration: 500,
                easing: 'easeOutQuad'
            });
        }
        
        // Si ambos jugadores han seleccionado
        if (this.selectedCharacters.p1 && this.selectedCharacters.p2) {
            // Animación de confirmación épica
            this.playConfirmationAnimation(() => {
                this.onCharactersSelected({
                    p1: this.selectedCharacters.p1,
                    p2: this.selectedCharacters.p2,
                    gameMode: this.gameMode
                });
            });
        }
    }

    playConfirmationAnimation(callback) {
        const container = document.getElementById('characterSelectContainer');
        
        anime.timeline({
            complete: callback
        })
        .add({
            targets: container,
            scale: 1.05,
            duration: 300,
            easing: 'easeOutQuad'
        })
        .add({
            targets: container,
            opacity: 0,
            scale: 0.95,
            rotateY: 90,
            duration: 600,
            easing: 'easeInBack'
        });
    }

    cleanup() {
        const gameCanvas = document.getElementById('gameCanvas');
        if (gameCanvas) {
            gameCanvas.style.display = 'block';
        }

        // Limpiar animaciones
        if (this.entranceTimeline) {
            this.entranceTimeline.pause();
        }

        this.animations.forEach(anim => {
            if (anim && anim.pause) anim.pause();
        });

        // Remover estilos
        const styles = document.getElementById('characterSelectStyles');
        if (styles) {
            styles.remove();
        }

        // Limpiar DOM
        const container = document.getElementById('characterSelectContainer');
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
        container.id = 'characterSelectContainer';
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
            padding: 20px;
        `;

        const title = document.createElement('h1');
        title.textContent = 'SELECCIONA TU PERSONAJE';
        title.style.cssText = `
            font-size: 2.5rem;
            margin-bottom: 2rem;
            text-align: center;
        `;

        const charactersContainer = document.createElement('div');
        charactersContainer.style.cssText = `
            display: flex;
            gap: 20px;
            margin-bottom: 2rem;
            flex-wrap: wrap;
            justify-content: center;
        `;

        const characters = [
            { id: 'Ryu', name: 'RYU' },
            { id: 'Ken', name: 'KEN' }
        ];

        characters.forEach(char => {
            const card = document.createElement('div');
            card.style.cssText = `
                background: rgba(255,255,255,0.1);
                border: 2px solid #3498db;
                border-radius: 10px;
                padding: 20px;
                text-align: center;
                cursor: pointer;
                transition: all 0.3s ease;
                min-width: 150px;
            `;

            card.innerHTML = `<h3 style="margin: 0; color: #3498db;">${char.name}</h3>`;

            card.onmouseenter = () => {
                card.style.background = 'rgba(52, 152, 219, 0.2)';
                card.style.transform = 'scale(1.05)';
            };

            card.onmouseleave = () => {
                card.style.background = 'rgba(255,255,255,0.1)';
                card.style.transform = 'scale(1)';
            };

            card.onclick = () => {
                this.selectedCharacters.p1 = char.id;
                this.selectedCharacters.p2 = characters[0].id; // Auto-seleccionar para P2
                if (this.onCharactersSelected) {
                    this.cleanup();
                    this.onCharactersSelected(this.selectedCharacters);
                }
            };

            charactersContainer.appendChild(card);
        });

        const instructions = document.createElement('p');
        instructions.textContent = 'Haz clic en un personaje para comenzar la batalla';
        instructions.style.cssText = `
            font-size: 1.2rem;
            color: #bdc3c7;
            text-align: center;
        `;

        container.appendChild(title);
        container.appendChild(charactersContainer);
        container.appendChild(instructions);
        document.body.appendChild(container);
    }
}