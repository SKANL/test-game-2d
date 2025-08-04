/**
 * CharacterSelectScene - Selección de personajes con efectos épicos 3D
 * Basado en los ejemplos funcionales de anime.js
 */
import VisualEffectsManager from '../VisualEffectsManager.js';
import ResponsiveUtils from '../../infrastructure/ResponsiveUtils.js';

export default class CharacterSelectScene {
    constructor(onCharactersSelected, gameMode) {
        this.onCharactersSelected = onCharactersSelected;
        this.gameMode = gameMode; // 'pvp' o 'cpu'
        this.selectedCharacters = {
            p1: null,
            p2: null
        };
        this.vfx = new VisualEffectsManager();
        this.characters = ['Ryu', 'Ken'];
    }

    render() {
        const gameCanvas = document.getElementById('gameCanvas');
        if (gameCanvas) {
            gameCanvas.style.display = 'none';
        }

        const container = document.createElement('div');
        container.className = 'scene-transition responsive-container';
        container.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: linear-gradient(135deg, var(--dark-bg) 0%, #1a1a2e 50%, var(--dark-bg) 100%);
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            z-index: 1000;
            font-family: 'Orbitron', sans-serif;
            perspective: 1000px;
            padding: var(--spacing-lg);
            overflow-x: hidden;
            overflow-y: auto;
        `;

        // Inicializar efectos visuales
        this.vfx.init();

        // Título principal con efectos RESPONSIVO
        const title = document.createElement('h1');
        title.className = 'glitch-text';
        title.textContent = 'CHARACTER SELECT';
        title.style.cssText = `
            color: var(--primary-glow);
            font-size: var(--font-size-3xl);
            font-weight: 900;
            margin-bottom: var(--spacing-lg);
            text-align: center;
            text-shadow: 0 0 20px var(--primary-glow);
            letter-spacing: clamp(2px, 1vw, 4px);
            opacity: 0;
            transform: translateY(-50px);
        `;
        container.appendChild(title);

        // Contenedor principal para las selecciones RESPONSIVO
        const mainContainer = document.createElement('div');
        mainContainer.style.cssText = `
            display: grid;
            grid-template-columns: 1fr auto 1fr;
            grid-template-areas: "player1 vs player2";
            width: 100%;
            max-width: var(--container-xl);
            margin-top: var(--spacing-lg);
            gap: var(--spacing-md);
            align-items: center;
            justify-items: center;
        `;
        
        // Media query para móvil
        if (ResponsiveUtils.getDeviceType() === 'mobile') {
            mainContainer.style.cssText = `
                display: flex;
                flex-direction: column;
                width: 100%;
                max-width: var(--container-sm);
                margin-top: var(--spacing-md);
                gap: var(--spacing-sm);
                align-items: center;
            `;
        }

        // Selección Jugador 1
        const p1Section = this.createPlayerSection(
            'PLAYER 1',
            'p1',
            '--combat-blue'
        );

        // VS Indicator
        const vsIndicator = this.createVSIndicator();

        // Selección Jugador 2 / CPU
        const p2Section = this.createPlayerSection(
            this.gameMode === 'pvp' ? 'PLAYER 2' : 'CPU',
            'p2',
            '--combat-red'
        );

        mainContainer.appendChild(p1Section);
        mainContainer.appendChild(vsIndicator);
        mainContainer.appendChild(p2Section);
        container.appendChild(mainContainer);

        // Botón de combate
        const fightButton = this.createFightButton();
        container.appendChild(fightButton);

        document.body.appendChild(container);

        // Inicializar animaciones
        this.initializeAnimations(container, title, [p1Section, p2Section], fightButton);

        // Aplicar clase para activar transición
        setTimeout(() => container.classList.add('active'), 100);

        return container;
    }

    createPlayerSection(title, playerId, colorVar) {
        const section = document.createElement('div');
        section.className = playerId === 'p1' ? 'slide-in-left' : 'slide-in-right';
        section.style.cssText = `
            display: flex;
            flex-direction: column;
            align-items: center;
            padding: var(--spacing-lg);
            background: rgba(255, 255, 255, 0.05);
            border: 2px solid var(${colorVar});
            border-radius: var(--border-radius-lg);
            margin: var(--spacing-sm);
            backdrop-filter: blur(10px);
            min-width: clamp(250px, 40vw, 300px);
            max-width: var(--container-sm);
            width: 100%;
            transform-style: preserve-3d;
            transition: all 0.5s ease;
            box-shadow: 0 10px 30px rgba(0,0,0,0.3);
        `;

        const titleEl = document.createElement('h2');
        titleEl.textContent = title;
        titleEl.style.cssText = `
            color: var(${colorVar});
            margin-bottom: var(--spacing-lg);
            font-size: var(--font-size-xl);
            font-family: 'Orbitron', sans-serif;
            font-weight: 700;
            text-shadow: 0 0 10px var(${colorVar});
            text-align: center;
            letter-spacing: clamp(1px, 0.5vw, 2px);
        `;
        section.appendChild(titleEl);

        // Contenedor de personajes con efecto 3D RESPONSIVO
        const characterGrid = document.createElement('div');
        characterGrid.style.cssText = `
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(clamp(100px, 20vw, 120px), 1fr));
            gap: var(--spacing-md);
            perspective: 1000px;
            width: 100%;
        `;

        this.characters.forEach((character, index) => {
            const charCard = this.createCharacterCard(character, playerId, colorVar, index);
            characterGrid.appendChild(charCard);
        });

        section.appendChild(characterGrid);

        // Preview del personaje seleccionado RESPONSIVO
        const preview = document.createElement('div');
        preview.id = `preview-${playerId}`;
        preview.style.cssText = `
            margin-top: var(--spacing-md);
            padding: var(--spacing-md);
            border: 2px dashed transparent;
            border-radius: var(--border-radius-md);
            min-height: clamp(80px, 15vw, 100px);
            display: flex;
            align-items: center;
            justify-content: center;
            color: var(--text-color);
            font-size: var(--font-size-md);
            font-weight: 600;
            text-align: center;
            opacity: 0.7;
        `;
        preview.textContent = 'Select a fighter';
        section.appendChild(preview);

        return section;
    }

    createCharacterCard(character, playerId, colorVar, index) {
        const card = document.createElement('div');
        card.className = 'card-3d';
        card.dataset.character = character;
        card.dataset.player = playerId;
        card.style.cssText = `
            width: 120px;
            height: 160px;
            background: linear-gradient(45deg, #3a1c71, #d76d77, #ffaf7b);
            border-radius: 12px;
            color: white;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            font-size: 1.1rem;
            font-family: 'Orbitron', sans-serif;
            font-weight: 700;
            cursor: pointer;
            border: 3px solid transparent;
            transform-style: preserve-3d;
            transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
            position: relative;
            overflow: hidden;
            text-align: center;
            letter-spacing: 1px;
            text-shadow: 0 2px 5px rgba(0,0,0,0.5);
            opacity: 0;
            transform: translateY(30px) rotateX(15deg);
        `;

        // Character name with letter animation
        const nameEl = document.createElement('div');
        nameEl.className = 'char-name';
        nameEl.textContent = character;
        nameEl.innerHTML = nameEl.textContent.replace(/\S/g, "<span style='display: inline-block; transition: all 0.3s ease;'>$&</span>");
        card.appendChild(nameEl);

        // Setup interactions
        this.setupCardInteractions(card, playerId, character);

        return card;
    }

    setupCardInteractions(card, playerId, character) {
        // Hover effects
        card.addEventListener('mouseenter', () => {
            anime({
                targets: card,
                scale: 1.1,
                rotateY: 15,
                translateZ: 25,
                boxShadow: `0 20px 40px rgba(0,0,0,0.4)`,
                duration: 400,
                easing: 'easeOutExpo'
            });

            anime({
                targets: card.querySelectorAll('.char-name span'),
                translateZ: [0, 15],
                rotateY: () => anime.random(-10, 10),
                duration: 500,
                delay: anime.stagger(50),
                easing: 'easeOutExpo'
            });
        });

        card.addEventListener('mouseleave', () => {
            if (!card.classList.contains('selected')) {
                anime({
                    targets: card,
                    scale: 1,
                    rotateY: 0,
                    translateZ: 0,
                    boxShadow: `0 10px 20px rgba(0,0,0,0.2)`,
                    duration: 400,
                    easing: 'easeOutExpo'
                });

                anime({
                    targets: card.querySelectorAll('.char-name span'),
                    translateZ: 0,
                    rotateY: 0,
                    duration: 500,
                    delay: anime.stagger(50, { direction: 'reverse' }),
                    easing: 'easeOutExpo'
                });
            }
        });

        // Click selection
        card.addEventListener('click', (e) => {
            this.selectCharacter(playerId, character, card, e);
        });
    }

    createVSIndicator() {
        const vsContainer = document.createElement('div');
        vsContainer.style.cssText = `
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        `;

        const vsText = document.createElement('div');
        vsText.textContent = 'VS';
        vsText.style.cssText = `
            font-size: 4rem;
            font-weight: 900;
            color: var(--warning-glow);
            text-shadow: 0 0 20px var(--warning-glow);
            font-family: 'Orbitron', sans-serif;
            opacity: 0;
            transform: scale(0);
        `;
        vsContainer.appendChild(vsText);

        // Animar el VS después de que aparezcan las secciones
        setTimeout(() => {
            anime({
                targets: vsText,
                opacity: [0, 1],
                scale: [0, 1.2, 1],
                rotate: [0, 360],
                duration: 1000,
                easing: 'easeOutElastic(1, .6)'
            });
        }, 800);

        return vsContainer;
    }

    createFightButton() {
        const button = document.createElement('button');
        button.className = 'epic-button';
        button.textContent = 'READY TO FIGHT!';
        button.style.cssText = `
            font-family: 'Orbitron', monospace;
            font-weight: 900;
            font-size: 1.5rem;
            padding: 15px 40px;
            border: 3px solid var(--danger-glow);
            background: rgba(220, 38, 38, 0.2);
            color: var(--danger-glow);
            border-radius: 12px;
            cursor: pointer;
            margin-top: 40px;
            text-transform: uppercase;
            letter-spacing: 2px;
            transition: all 0.3s ease;
            opacity: 0.5;
            transform: translateY(50px);
            pointer-events: none;
            box-shadow: 0 0 20px rgba(220, 38, 38, 0.3);
        `;

        button.addEventListener('click', (e) => {
            if (this.selectedCharacters.p1 && this.selectedCharacters.p2) {
                this.vfx.screenShake(10);
                this.vfx.createParticleBurst(e.clientX, e.clientY, 50, ['#dc2626', '#ffffff', '#ffd700']);
                
                anime({
                    targets: button,
                    scale: [1, 0.9, 1.1],
                    duration: 300,
                    easing: 'easeInOutSine',
                    complete: () => {
                        this.onCharactersSelected(this.selectedCharacters);
                    }
                });
            }
        });

        return button;
    }

    selectCharacter(playerId, character, cardElement, event) {
        // Efectos visuales del click
        this.vfx.createParticleBurst(event.clientX, event.clientY, 20, ['#00f2ff', '#ff00c1']);
        
        // Limpiar selección anterior
        const previousSelected = document.querySelector(`[data-player="${playerId}"].selected`);
        if (previousSelected) {
            previousSelected.classList.remove('selected');
            anime({
                targets: previousSelected,
                borderColor: 'transparent',
                scale: 1,
                duration: 300
            });
        }

        // Aplicar nueva selección
        cardElement.classList.add('selected');
        this.selectedCharacters[playerId] = character;

        anime({
            targets: cardElement,
            borderColor: playerId === 'p1' ? 'var(--combat-blue)' : 'var(--combat-red)',
            scale: 1.1,
            duration: 400,
            easing: 'easeOutExpo'
        });

        // Actualizar preview
        const preview = document.getElementById(`preview-${playerId}`);
        if (preview) {
            preview.textContent = `Selected: ${character}`;
            preview.style.borderColor = playerId === 'p1' ? 'var(--combat-blue)' : 'var(--combat-red)';
            preview.style.color = playerId === 'p1' ? 'var(--combat-blue)' : 'var(--combat-red)';
            
            anime({
                targets: preview,
                scale: [1, 1.05, 1],
                duration: 400,
                easing: 'easeOutExpo'
            });
        }

        // Activar botón de pelea si ambos jugadores han seleccionado
        if (this.selectedCharacters.p1 && this.selectedCharacters.p2) {
            const fightButton = document.querySelector('.epic-button');
            if (fightButton) {
                fightButton.style.pointerEvents = 'auto';
                anime({
                    targets: fightButton,
                    opacity: [0.5, 1],
                    translateY: [50, 0],
                    scale: [1, 1.05, 1],
                    duration: 600,
                    easing: 'easeOutExpo'
                });

                // Efecto de pulsación
                anime({
                    targets: fightButton,
                    boxShadow: [
                        '0 0 20px rgba(220, 38, 38, 0.3)',
                        '0 0 40px rgba(220, 38, 38, 0.8)',
                        '0 0 20px rgba(220, 38, 38, 0.3)'
                    ],
                    duration: 2000,
                    loop: true,
                    easing: 'easeInOutSine'
                });
            }
        }
    }

    initializeAnimations(container, title, sections, fightButton) {
        // Animación de entrada del título
        anime({
            targets: title,
            opacity: [0, 1],
            translateY: [-50, 0],
            duration: 800,
            easing: 'easeOutExpo',
            delay: 200
        });

        // Animación de las tarjetas de personajes
        sections.forEach((section, sectionIndex) => {
            const cards = section.querySelectorAll('.card-3d');
            anime({
                targets: cards,
                opacity: [0, 1],
                translateY: [30, 0],
                rotateX: [15, 0],
                duration: 600,
                easing: 'easeOutExpo',
                delay: anime.stagger(100, { start: 400 + (sectionIndex * 200) })
            });
        });

        // Efecto de glitch ocasional en el título
        setInterval(() => {
            if (Math.random() > 0.8) {
                this.vfx.createGlitchEffect(title, 500);
            }
        }, 3000);
    }

    init() {
        // Initialization logic
    }

    update(deltaTime) {
        // Update logic if needed
    }

    destroy() {
        if (this.vfx) {
            this.vfx.cleanup();
        }

        // Clean up anime.js animations
        anime.remove('.card-3d');
        anime.remove('.epic-button');
        anime.remove('.char-name span');

        const container = document.querySelector('.scene-transition');
        if (container && container.parentNode) {
            container.parentNode.removeChild(container);
        }
    }
}
