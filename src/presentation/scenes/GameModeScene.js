/**
 * GameModeScene - Selección épica de modo de juego con anime.js
 * Implementación EXACTA basada en ejemplos funcionales
 * RESPONSIVE: Adaptado para todos los dispositivos con ResponsiveUtils
 */
import ResponsiveUtils from '../../infrastructure/ResponsiveUtils.js';
import BaseScene from '../../domain/base/BaseScene.js';

export default class GameModeScene extends BaseScene {
    constructor(data = null) {
        super('gameMode');
        
        // Configurar callback usando ApplicationController global con verificación robusta
        this.applicationController = window.applicationController;
        
        // Si no está disponible inmediatamente, intentar obtenerlo después
        if (!this.applicationController) {
            console.warn('⚠️ ApplicationController no disponible inmediatamente en GameModeScene constructor');
            // Intentar obtenerlo en la próxima iteración del event loop
            setTimeout(() => {
                this.applicationController = window.applicationController;
                if (this.applicationController) {
                    console.log('✅ ApplicationController obtenido exitosamente en GameModeScene');
                } else {
                    console.error('❌ ApplicationController sigue sin estar disponible en GameModeScene');
                }
            }, 100);
        } else {
            console.log('✅ ApplicationController disponible inmediatamente en GameModeScene constructor');
        }
        
        this.selectedMode = null;
        this.particleCanvas = null;
        this.animationId = null;
        
        // Inicializar ResponsiveUtils
        ResponsiveUtils.init();
    }

    /**
     * Inicialización de la escena - Implementa IScene
     */
    async init() {
        try {
            // Llamar a inicialización base
            await super.init();
            
            // Inicialización específica de GameModeScene
            console.log('🎮 Inicializando GameModeScene...');
            
            // Pre-configurar elementos si es necesario
            this.selectedMode = null;
            
        } catch (error) {
            console.error('❌ Error inicializando GameModeScene:', error);
            throw error;
        }
    }

    /**
     * Actualización de la escena - Implementa IScene
     */
    update(deltaTime) {
        // Implementación básica - puede expandirse según necesidades
        if (this.animationId && this.particleCanvas) {
            // Aquí se pueden añadir actualizaciones de partículas si es necesario
        }
    }

    render() {
        const gameCanvas = document.getElementById('gameCanvas');
        if (gameCanvas) {
            gameCanvas.style.display = 'none';
        }

        // Aplicar estilos responsivos usando ResponsiveUtils
        const deviceType = ResponsiveUtils.getDeviceType();

        // Crear el contenedor principal RESPONSIVO - ÉPICO GAME MODE STYLE
        this.container = document.createElement('div');
        this.container.id = 'game-mode-scene-container';
        this.container.className = 'responsive-container gamemode-container';
        
        // Aplicar estilos específicos responsivos para GameMode
        this.container.style.cssText = `
            position: relative;
            width: 100%;
            height: 100%;
            min-height: 100vh;
            background: var(--dark-bg);
            background-image: 
                radial-gradient(circle at 25% 25%, rgba(0, 242, 255, 0.15) 0%, transparent 50%),
                radial-gradient(circle at 75% 75%, rgba(255, 0, 193, 0.15) 0%, transparent 50%),
                linear-gradient(135deg, rgba(0, 0, 0, 0.7) 0%, rgba(0, 0, 0, 0.9) 100%);
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            font-family: 'Inter', sans-serif;
            overflow-x: hidden;
            overflow-y: auto;
            padding: ${deviceType === 'mobile' ? 'clamp(1rem, 5vw, 1.5rem)' : 'clamp(1rem, 4vw, 2rem)'};
            gap: ${deviceType === 'mobile' ? '1rem' : '1.5rem'};
            box-sizing: border-box;
        `;

        // Canvas para partículas de fondo RESPONSIVO
        this.particleCanvas = document.createElement('canvas');
        this.particleCanvas.id = 'gamemode-particles-canvas';
        this.particleCanvas.className = 'responsive-canvas';
        this.particleCanvas.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 1;
            pointer-events: none;
        `;
        
        // Configurar canvas responsivo usando ResponsiveUtils
        ResponsiveUtils.setupResponsiveCanvas(this.particleCanvas);

        // Título épico RESPONSIVO MEJORADO
        const title = document.createElement('h1');
        title.textContent = deviceType === 'mobile' ? 'SELECCIONA MODO' : 'SELECCIONA TU MODO DE BATALLA';
        title.className = 'responsive-title gamemode-title';
        title.style.cssText = `
            font-family: 'Orbitron', monospace;
            font-size: ${deviceType === 'mobile' ? 'clamp(1rem, 6vw, 1.8rem)' : 'clamp(1.5rem, 5vw, 3rem)'};
            font-weight: 900;
            color: #fff;
            margin-bottom: ${deviceType === 'mobile' ? '1rem' : 'clamp(1.5rem, 4vw, 2.5rem)'};
            text-shadow: 
                0 0 10px var(--primary-glow),
                0 0 20px var(--primary-glow),
                0 0 30px rgba(0, 242, 255, 0.5);
            text-align: center;
            letter-spacing: ${deviceType === 'mobile' ? '1px' : 'clamp(1px, 0.5vw, 3px)'};
            text-transform: uppercase;
            z-index: 3;
            position: relative;
            opacity: 0;
            transform: translateY(-30px);
            max-width: 100%;
            word-wrap: break-word;
            padding: 0 1rem;
            box-sizing: border-box;
        `;

        // Contenedor de modos RESPONSIVO MEJORADO
        const modesContainer = document.createElement('div');
        modesContainer.className = 'modes-container responsive-grid';
        modesContainer.style.cssText = `
            display: grid;
            grid-template-columns: ${deviceType === 'mobile' ? 
                '1fr' : 
                'repeat(auto-fit, minmax(min(280px, 100%), 1fr))'};
            gap: ${deviceType === 'mobile' ? '1rem' : 'clamp(1rem, 3vw, 2rem)'};
            width: 100%;
            max-width: ${deviceType === 'mobile' ? '100%' : 'min(95vw, 1200px)'};
            z-index: 3;
            position: relative;
            padding: ${deviceType === 'mobile' ? '0.5rem' : '1rem'};
            box-sizing: border-box;
            overflow: visible;
            margin: ${deviceType === 'mobile' ? '0.5rem' : '1rem'};
        `;

        // Modos de juego - ÉPICOS
        const gameModes = [
            {
                id: 'story',
                title: 'MODO HISTORIA',
                subtitle: 'Aventura Épica',
                description: 'Descubre la historia de cada luchador en una aventura cinematográfica',
                icon: '📖',
                color: 'var(--primary-glow)',
                gradient: 'linear-gradient(135deg, rgba(0, 242, 255, 0.2) 0%, rgba(0, 242, 255, 0.05) 100%)',
                features: ['Cinemáticas épicas', 'Múltiples finales', 'Desafíos únicos']
            },
            {
                id: 'arcade',
                title: 'MODO ARCADE',
                subtitle: 'Combate Clásico',
                description: 'Enfréntate a oponentes cada vez más difíciles en batallas consecutivas',
                icon: '🕹️',
                color: 'var(--warning-glow)',
                gradient: 'linear-gradient(135deg, rgba(255, 215, 0, 0.2) 0%, rgba(255, 215, 0, 0.05) 100%)',
                features: ['8 oponentes', 'Dificultad creciente', 'Rankings globales']
            },
            {
                id: 'versus',
                title: 'MODO VS',
                subtitle: 'Combate Directo',
                description: 'Lucha contra otro jugador o la IA en batallas personalizadas',
                icon: '⚔️',
                color: 'var(--secondary-glow)',
                gradient: 'linear-gradient(135deg, rgba(255, 0, 193, 0.2) 0%, rgba(255, 0, 193, 0.05) 100%)',
                features: ['1v1 épico', 'Configuración libre', 'Multijugador local']
            },
            {
                id: 'training',
                title: 'MODO ENTRENAMIENTO',
                subtitle: 'Perfecciona tu Técnica',
                description: 'Practica combos, movimientos especiales y estrategias avanzadas',
                icon: '🥋',
                color: 'var(--success-glow)',
                gradient: 'linear-gradient(135deg, rgba(0, 255, 140, 0.2) 0%, rgba(0, 255, 140, 0.05) 100%)',
                features: ['Modo libre', 'Análisis de datos', 'Combos avanzados']
            }
        ];

        gameModes.forEach((mode, index) => {
            const modeCard = this.createModeCard(mode, index);
            modesContainer.appendChild(modeCard);
        });

        // Botón de volver RESPONSIVO
        const backButton = document.createElement('button');
        backButton.textContent = '← VOLVER';
        backButton.className = 'responsive-button back-button';
        backButton.style.cssText = `
            position: absolute;
            top: ${deviceType === 'mobile' ? '1rem' : '2rem'};
            left: ${deviceType === 'mobile' ? '1rem' : '2rem'};
            background: transparent;
            border: 2px solid var(--secondary-glow);
            color: var(--secondary-glow);
            padding: ${deviceType === 'mobile' ? '10px 16px' : '12px 20px'};
            border-radius: 8px;
            font-family: 'Orbitron', monospace;
            font-size: ${deviceType === 'mobile' ? '0.85rem' : '1rem'};
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            text-transform: uppercase;
            letter-spacing: 1px;
            z-index: 4;
            opacity: 0;
            transform: translateX(-20px);
            min-height: ${deviceType === 'mobile' ? '44px' : 'auto'};
            touch-action: manipulation;
        `;

        this.setupBackButton(backButton);

        // Ensamblar
        this.container.appendChild(this.particleCanvas);
        this.container.appendChild(backButton);
        this.container.appendChild(title);
        this.container.appendChild(modesContainer);
        
        // Agregar la escena al contenedor de escenas manejado por SceneManager
        const sceneContainer = document.getElementById('scene-container');
        if (sceneContainer) {
            sceneContainer.appendChild(this.container);
        } else {
            document.body.appendChild(this.container);
        }

        // Iniciar animaciones
        this.startGameModeAnimation();
        this.startParticleBackground();

        return this.container;
    }

    setupBackButton(backButton) {
        backButton.addEventListener('mouseenter', () => {
            if (typeof anime !== 'undefined') {
                anime({
                    targets: backButton,
                    scale: 1.05,
                    boxShadow: '0 0 20px rgba(255, 0, 193, 0.6)',
                    duration: 200,
                    easing: 'easeOutQuad'
                });
            }
        });

        backButton.addEventListener('mouseleave', () => {
            if (typeof anime !== 'undefined') {
                anime({
                    targets: backButton,
                    scale: 1,
                    boxShadow: '0 0 0px rgba(255, 0, 193, 0)',
                    duration: 200,
                    easing: 'easeOutQuad'
                });
            }
        });

        backButton.addEventListener('click', () => {
            this.handleBack();
        });
    }

    createModeCard(mode, index) {
        const deviceType = ResponsiveUtils.getDeviceType();
        
        const card = document.createElement('div');
        card.className = 'mode-card responsive-card';
        card.dataset.mode = mode.id;
        card.style.cssText = `
            background: rgba(0, 0, 0, 0.3);
            background-image: ${mode.gradient};
            border: 2px solid ${mode.color};
            border-radius: ${deviceType === 'mobile' ? '10px' : '15px'};
            padding: ${deviceType === 'mobile' ? '1rem' : '1.5rem'};
            text-align: center;
            cursor: pointer;
            transition: all 0.3s ease;
            backdrop-filter: blur(10px);
            box-shadow: 
                0 4px 20px rgba(0, 0, 0, 0.3),
                0 0 30px ${mode.color}20;
            position: relative;
            overflow: visible;
            opacity: 0;
            transform: translateY(50px) scale(0.9);
            min-height: ${deviceType === 'mobile' ? '220px' : '280px'};
            max-width: 100%;
            width: 100%;
            box-sizing: border-box;
            touch-action: manipulation;
            margin: ${deviceType === 'mobile' ? '0.25rem' : '0.5rem'};
        `;

        // Efecto de brillo interno
        const glowOverlay = document.createElement('div');
        glowOverlay.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: linear-gradient(45deg, transparent 30%, ${mode.color}10 50%, transparent 70%);
            opacity: 0;
            transition: opacity 0.3s ease;
            pointer-events: none;
        `;

        // Icono épico RESPONSIVO
        const icon = document.createElement('div');
        icon.textContent = mode.icon;
        icon.className = 'mode-icon';
        icon.style.cssText = `
            font-size: ${deviceType === 'mobile' ? '3rem' : '4rem'};
            margin-bottom: ${deviceType === 'mobile' ? '0.8rem' : '1rem'};
            filter: drop-shadow(0 0 10px ${mode.color});
        `;

        // Título del modo RESPONSIVO
        const title = document.createElement('h3');
        title.textContent = mode.title;
        title.className = 'mode-title';
        title.style.cssText = `
            font-family: 'Orbitron', monospace;
            font-size: ${deviceType === 'mobile' ? 'clamp(1rem, 4vw, 1.2rem)' : 'clamp(1.2rem, 2.5vw, 1.5rem)'};
            font-weight: 700;
            color: ${mode.color};
            margin-bottom: 0.5rem;
            text-shadow: 0 0 10px ${mode.color};
            text-transform: uppercase;
            letter-spacing: ${deviceType === 'mobile' ? '0.5px' : '1px'};
            line-height: 1.2;
            overflow-wrap: break-word;
            hyphens: auto;
            word-break: break-word;
        `;

        // Subtítulo RESPONSIVO
        const subtitle = document.createElement('div');
        subtitle.textContent = mode.subtitle;
        subtitle.className = 'mode-subtitle';
        subtitle.style.cssText = `
            font-family: 'Inter', sans-serif;
            font-size: ${deviceType === 'mobile' ? 'clamp(0.7rem, 3vw, 0.8rem)' : 'clamp(0.8rem, 2vw, 0.9rem)'};
            color: var(--text-color);
            margin-bottom: ${deviceType === 'mobile' ? '0.8rem' : '1rem'};
            font-weight: 500;
            opacity: 0.8;
            overflow-wrap: break-word;
            hyphens: auto;
            word-break: break-word;
        `;

        // Descripción RESPONSIVA
        const description = document.createElement('p');
        description.textContent = mode.description;
        description.className = 'mode-description';
        description.style.cssText = `
            font-family: 'Inter', sans-serif;
            color: var(--text-color);
            font-size: ${deviceType === 'mobile' ? 'clamp(0.75rem, 3.5vw, 0.85rem)' : 'clamp(0.85rem, 2.2vw, 0.95rem)'};
            line-height: ${deviceType === 'mobile' ? '1.4' : '1.5'};
            margin-bottom: ${deviceType === 'mobile' ? '1rem' : '1.5rem'};
            opacity: 0.9;
            overflow-wrap: break-word;
            hyphens: auto;
            word-break: break-word;
        `;

        // Features list RESPONSIVO
        const featuresList = document.createElement('ul');
        featuresList.className = 'features-list';
        featuresList.style.cssText = `
            list-style: none;
            padding: 0;
            margin: 0;
            text-align: left;
        `;

        mode.features.forEach(feature => {
            const li = document.createElement('li');
            li.className = 'feature-item';
            li.style.cssText = `
                color: var(--text-color);
                margin-bottom: 0.5rem;
                padding-left: 1.5rem;
                position: relative;
                font-family: 'Inter', sans-serif;
                font-size: ${deviceType === 'mobile' ? 'clamp(0.7rem, 3vw, 0.8rem)' : 'clamp(0.8rem, 2vw, 0.9rem)'};
                opacity: 0.8;
                overflow-wrap: break-word;
                hyphens: auto;
                word-break: break-word;
            `;

            li.innerHTML = `
                <span style="
                    position: absolute;
                    left: 0;
                    top: 0;
                    color: ${mode.color};
                    font-weight: bold;
                ">✓</span>
                ${feature}
            `;

            featuresList.appendChild(li);
        });

        // Botón de selección RESPONSIVO
        const selectButton = document.createElement('button');
        selectButton.textContent = 'SELECCIONAR';
        selectButton.className = 'select-button responsive-button';
        selectButton.style.cssText = `
            width: 100%;
            padding: ${deviceType === 'mobile' ? '10px' : '12px'};
            background: transparent;
            border: 2px solid ${mode.color};
            color: ${mode.color};
            border-radius: 8px;
            font-family: 'Orbitron', monospace;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-top: 1rem;
            min-height: ${deviceType === 'mobile' ? '44px' : 'auto'};
            touch-action: manipulation;
            font-size: ${deviceType === 'mobile' ? '0.85rem' : '1rem'};
        `;

        this.setupButtonEvents(selectButton, mode);
        this.setupCardEvents(card, glowOverlay, mode);

        // Ensamblar card
        card.appendChild(glowOverlay);
        card.appendChild(icon);
        card.appendChild(title);
        card.appendChild(subtitle);
        card.appendChild(description);
        card.appendChild(featuresList);
        card.appendChild(selectButton);

        return card;
    }

    setupButtonEvents(selectButton, mode) {
        selectButton.addEventListener('mouseenter', () => {
            selectButton.style.background = mode.color;
            selectButton.style.color = '#000';
            selectButton.style.boxShadow = `0 0 20px ${mode.color}`;
        });

        selectButton.addEventListener('mouseleave', () => {
            selectButton.style.background = 'transparent';
            selectButton.style.color = mode.color;
            selectButton.style.boxShadow = 'none';
        });

        selectButton.addEventListener('click', (e) => {
            e.stopPropagation();
            this.selectMode(mode.id);
        });
    }

    setupCardEvents(card, glowOverlay, mode) {
        const deviceType = ResponsiveUtils.getDeviceType();
        
        card.addEventListener('mouseenter', () => {
            glowOverlay.style.opacity = '1';
            
            if (typeof anime !== 'undefined') {
                anime({
                    targets: card,
                    scale: deviceType === 'mobile' ? 1.02 : 1.05,
                    boxShadow: `0 10px 30px rgba(0, 0, 0, 0.4), 0 0 40px ${mode.color}40`,
                    duration: 300,
                    easing: 'easeOutQuad'
                });

                this.createHoverParticles(card, mode.color);
            }
        });

        card.addEventListener('mouseleave', () => {
            glowOverlay.style.opacity = '0';
            
            if (typeof anime !== 'undefined') {
                anime({
                    targets: card,
                    scale: 1,
                    boxShadow: `0 4px 20px rgba(0, 0, 0, 0.3), 0 0 30px ${mode.color}20`,
                    duration: 300,
                    easing: 'easeOutQuad'
                });
            }
        });

        card.addEventListener('click', () => {
            this.selectMode(mode.id);
        });
    }

    createHoverParticles(card, color) {
        if (!this.particleCanvas) return;
        
        const rect = card.getBoundingClientRect();
        const containerRect = this.particleCanvas.getBoundingClientRect();
        const centerX = rect.left - containerRect.left + rect.width / 2;
        const centerY = rect.top - containerRect.top + rect.height / 2;
        
        const ctx = this.particleCanvas.getContext('2d');
        
        for (let i = 0; i < 15; i++) {
            const p = {
                x: centerX,
                y: centerY,
                radius: anime.random(1, 3),
                alpha: 1
            };
            
            const angle = anime.random(0, 360) * Math.PI / 180;
            const distance = anime.random(30, 60);
            
            anime({
                targets: p,
                x: centerX + Math.cos(angle) * distance,
                y: centerY + Math.sin(angle) * distance,
                alpha: 0,
                duration: anime.random(800, 1200),
                easing: 'easeOutExpo',
                update: () => {
                    const colorRgb = color === 'var(--primary-glow)' ? '0, 242, 255' :
                                   color === 'var(--warning-glow)' ? '255, 215, 0' :
                                   color === 'var(--secondary-glow)' ? '255, 0, 193' : '0, 255, 140';
                    
                    ctx.fillStyle = `rgba(${colorRgb}, ${p.alpha})`;
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, p.radius, 0, 2 * Math.PI);
                    ctx.fill();
                }
            });
        }
    }

    selectMode(modeId) {
        console.log('🎮 Modo seleccionado:', modeId);
        this.selectedMode = modeId;

        if (typeof anime !== 'undefined') {
            const selectedCard = this.container.querySelector(`[data-mode="${modeId}"]`);
            if (selectedCard) {
                anime({
                    targets: selectedCard,
                    scale: [1, 1.1, 1],
                    duration: 400,
                    easing: 'easeOutElastic(1, .6)'
                });

                this.createSelectionBurst(selectedCard);
            }
        }

        setTimeout(() => {
            // Obtener applicationController con verificación robusta
            const appController = this.applicationController || window.applicationController;
            
            if (appController && typeof appController.transitionToCharacterSelect === 'function') {
                console.log('🎮 Transicionando a selección de personajes...');
                appController.transitionToCharacterSelect(modeId);
            } else {
                console.error('❌ ApplicationController no disponible o método transitionToCharacterSelect no encontrado');
                console.log('🔍 Debugging info:', {
                    thisController: this.applicationController,
                    windowController: window.applicationController,
                    appController: appController,
                    hasMethod: appController ? typeof appController.transitionToCharacterSelect : 'no controller'
                });
                
                // Fallback: intentar recargar la página o mostrar error
                alert('Error: No se pudo continuar. La aplicación se reiniciará.');
                window.location.reload();
            }
        }, 600);
    }

    createSelectionBurst(card) {
        if (!this.particleCanvas) return;
        
        const rect = card.getBoundingClientRect();
        const containerRect = this.particleCanvas.getBoundingClientRect();
        const centerX = rect.left - containerRect.left + rect.width / 2;
        const centerY = rect.top - containerRect.top + rect.height / 2;
        
        const ctx = this.particleCanvas.getContext('2d');
        
        for (let i = 0; i < 30; i++) {
            const p = {
                x: centerX,
                y: centerY,
                radius: anime.random(2, 5),
                alpha: 1
            };
            
            const angle = anime.random(0, 360) * Math.PI / 180;
            const distance = anime.random(50, 100);
            
            anime({
                targets: p,
                x: centerX + Math.cos(angle) * distance,
                y: centerY + Math.sin(angle) * distance,
                alpha: 0,
                radius: [p.radius, 0],
                duration: anime.random(1000, 1500),
                easing: 'easeOutExpo',
                update: () => {
                    ctx.fillStyle = `rgba(255, 215, 0, ${p.alpha})`;
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, p.radius, 0, 2 * Math.PI);
                    ctx.fill();
                }
            });
        }
    }

    startGameModeAnimation() {
        if (typeof anime === 'undefined') {
            console.warn('⚠️ anime.js no disponible en GameModeScene');
            return;
        }

        const title = this.container.querySelector('h1');
        const backButton = this.container.querySelector('button');
        const modeCards = this.container.querySelectorAll('.mode-card');

        anime.timeline({ easing: 'easeOutExpo' })
            .add({
                targets: backButton,
                opacity: [0, 1],
                translateX: [-20, 0],
                duration: 600
            })
            .add({
                targets: title,
                opacity: [0, 1],
                translateY: [-30, 0],
                duration: 800
            }, '-=400')
            .add({
                targets: modeCards,
                opacity: [0, 1],
                translateY: [50, 0],
                scale: [0.9, 1],
                delay: anime.stagger(150),
                duration: 600
            }, '-=400');
    }

    startParticleBackground() {
        if (!this.particleCanvas) return;
        
        const ctx = this.particleCanvas.getContext('2d');
        const particles = [];
        
        for (let i = 0; i < 40; i++) {
            particles.push({
                x: Math.random() * this.particleCanvas.width,
                y: Math.random() * this.particleCanvas.height,
                size: Math.random() * 2 + 0.5,
                speedX: (Math.random() - 0.5) * 0.4,
                speedY: (Math.random() - 0.5) * 0.4,
                opacity: Math.random() * 0.3 + 0.1,
                color: ['rgba(0, 242, 255, ', 'rgba(255, 215, 0, ', 'rgba(255, 0, 193, ', 'rgba(0, 255, 140, '][Math.floor(Math.random() * 4)]
            });
        }

        const animateParticles = () => {
            ctx.clearRect(0, 0, this.particleCanvas.width, this.particleCanvas.height);
            
            particles.forEach(particle => {
                particle.x += particle.speedX;
                particle.y += particle.speedY;
                
                if (particle.x < 0 || particle.x > this.particleCanvas.width) particle.speedX *= -1;
                if (particle.y < 0 || particle.y > this.particleCanvas.height) particle.speedY *= -1;
                
                ctx.globalAlpha = particle.opacity;
                ctx.fillStyle = particle.color + particle.opacity + ')';
                ctx.beginPath();
                ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
                ctx.fill();
            });
            
            if (document.getElementById('game-mode-scene-container')) {
                this.animationId = requestAnimationFrame(animateParticles);
            }
        };
        
        animateParticles();
    }

    handleBack() {
        console.log('🔙 Volviendo desde selección de modos...');
        
        if (typeof anime !== 'undefined') {
            anime({
                targets: this.container,
                opacity: [1, 0],
                scale: [1, 0.9],
                duration: 500,
                easing: 'easeInExpo',
                complete: () => {
                    window.location.reload();
                }
            });
        } else {
            window.location.reload();
        }
    }

    cleanup() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }

        // Cleanup ResponsiveUtils canvas handlers
        if (this.particleCanvas) {
            ResponsiveUtils.cleanup(this.particleCanvas);
        }

        if (this.container) {
            this.container.remove();
        }

        this.container = null;
        this.particleCanvas = null;
    }
}
