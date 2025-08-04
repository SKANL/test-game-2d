/**
 * HUD - Heads Up Display épico para el juego de peleas
 * Con efectos visuales avanzados usando anime.js
 */
import VisualEffectsManager from './VisualEffectsManager.js';

export default class HUD {
    constructor(renderer) {
        this.renderer = renderer;
        this.canvas = renderer.canvas;
        this.ctx = renderer.ctx;
        this.vfx = new VisualEffectsManager();
        this.hudElements = null;
        this.animatedHealthValues = { p1: 100, p2: 100 };
        this.animatedSuperValues = { p1: 0, p2: 0 };
        this.lastDamageTime = { p1: 0, p2: 0 };
        this.isLowHealthWarning = { p1: false, p2: false };
        this.isInitialized = false;
        
        this.init();
    }

    init() {
        if (this.isInitialized) return;
        
        this.vfx.init();
        this.createHUDElements();
        this.isInitialized = true;
    }

    createHUDElements() {
        // Crear contenedor HUD si no existe
        let hudContainer = document.getElementById('hud-container');
        if (!hudContainer) {
            hudContainer = document.createElement('div');
            hudContainer.id = 'hud-container';
            hudContainer.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                pointer-events: none;
                z-index: 50;
                font-family: 'Orbitron', monospace;
            `;
            document.body.appendChild(hudContainer);
        }

        // Limpiar contenido previo
        hudContainer.innerHTML = '';

        // Crear HUD superior
        const topHUD = document.createElement('div');
        topHUD.style.cssText = `
            position: absolute;
            top: 20px;
            left: 20px;
            right: 20px;
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            gap: 20px;
        `;

        // Sección Jugador 1 (izquierda)
        const p1Section = this.createPlayerSection('p1', 'left');
        
        // Timer central
        const timerSection = this.createTimerSection();
        
        // Sección Jugador 2 (derecha)
        const p2Section = this.createPlayerSection('p2', 'right');

        topHUD.appendChild(p1Section);
        topHUD.appendChild(timerSection);
        topHUD.appendChild(p2Section);

        hudContainer.appendChild(topHUD);

        this.hudElements = {
            container: hudContainer,
            p1Section: p1Section,
            p2Section: p2Section,
            timerSection: timerSection
        };

        // Añadir estilos de animación CSS
        this.addAnimationStyles();
    }

    createPlayerSection(playerId, side) {
        const section = document.createElement('div');
        section.id = `hud-${playerId}`;
        section.style.cssText = `
            display: flex;
            flex-direction: column;
            gap: 10px;
            min-width: 300px;
            ${side === 'right' ? 'align-items: flex-end;' : ''}
        `;

        // Nombre del personaje
        const nameLabel = document.createElement('div');
        nameLabel.className = `player-name hud-element`;
        nameLabel.textContent = playerId.toUpperCase();
        nameLabel.style.cssText = `
            color: ${playerId === 'p1' ? 'var(--combat-blue)' : 'var(--combat-red)'};
            font-size: 1.2rem;
            font-weight: 700;
            text-shadow: 0 0 10px currentColor;
            margin-bottom: 5px;
            ${side === 'right' ? 'text-align: right;' : ''}
        `;

        // Barra de vida
        const healthContainer = document.createElement('div');
        healthContainer.style.cssText = `
            position: relative;
            width: 300px;
            height: 25px;
            ${side === 'right' ? 'transform: scaleX(-1);' : ''}
        `;

        const healthBG = document.createElement('div');
        healthBG.style.cssText = `
            width: 100%;
            height: 100%;
            background: #333;
            border: 2px solid #555;
            border-radius: 12px;
            overflow: hidden;
            position: relative;
        `;

        const healthFill = document.createElement('div');
        healthFill.className = `health-fill`;
        healthFill.id = `health-${playerId}`;
        healthFill.style.cssText = `
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, var(--success-glow), var(--primary-glow));
            border-radius: 10px;
            transition: width 0.3s ease;
            position: relative;
            overflow: hidden;
        `;

        // Efecto de resplandor en la barra de vida
        const healthGlow = document.createElement('div');
        healthGlow.style.cssText = `
            position: absolute;
            top: 0;
            left: -100%;
            width: 50%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
            animation: healthGlide 3s ease-in-out infinite;
        `;

        const healthDamage = document.createElement('div');
        healthDamage.className = 'damage-indicator';
        healthDamage.id = `damage-${playerId}`;
        healthDamage.style.cssText = `
            position: absolute;
            top: 0;
            right: 0;
            height: 100%;
            width: 0%;
            background: rgba(255, 255, 255, 0.7);
            transition: width 0.1s ease;
        `;

        healthFill.appendChild(healthGlow);
        healthBG.appendChild(healthFill);
        healthBG.appendChild(healthDamage);
        healthContainer.appendChild(healthBG);

        // Barra de súper medidor
        const superContainer = document.createElement('div');
        superContainer.style.cssText = `
            position: relative;
            width: 300px;
            height: 15px;
            ${side === 'right' ? 'transform: scaleX(-1);' : ''}
        `;

        const superBG = document.createElement('div');
        superBG.style.cssText = `
            width: 100%;
            height: 100%;
            background: #222;
            border: 1px solid var(--warning-glow);
            border-radius: 8px;
            overflow: hidden;
        `;

        const superFill = document.createElement('div');
        superFill.id = `super-${playerId}`;
        superFill.style.cssText = `
            width: 0%;
            height: 100%;
            background: linear-gradient(90deg, var(--warning-glow), #ffff00);
            border-radius: 6px;
            transition: width 0.3s ease;
            box-shadow: 0 0 10px var(--warning-glow);
        `;

        superBG.appendChild(superFill);
        superContainer.appendChild(superBG);

        section.appendChild(nameLabel);
        section.appendChild(healthContainer);
        section.appendChild(superContainer);

        return section;
    }

    createTimerSection() {
        const section = document.createElement('div');
        section.style.cssText = `
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 10px;
        `;

        const timerDisplay = document.createElement('div');
        timerDisplay.id = 'timer-display';
        timerDisplay.className = 'hud-element';
        timerDisplay.textContent = '90';
        timerDisplay.style.cssText = `
            font-size: 3rem;
            font-weight: 900;
            color: var(--text-color);
            text-shadow: 0 0 15px currentColor;
            background: rgba(0,0,0,0.3);
            padding: 10px 20px;
            border-radius: 10px;
            border: 2px solid var(--border-color);
            min-width: 80px;
            text-align: center;
        `;

        const roundDisplay = document.createElement('div');
        roundDisplay.id = 'round-display';
        roundDisplay.className = 'hud-element';
        roundDisplay.textContent = 'ROUND 1';
        roundDisplay.style.cssText = `
            font-size: 1.2rem;
            font-weight: 700;
            color: var(--warning-glow);
            text-shadow: 0 0 10px var(--warning-glow);
            text-align: center;
        `;

        section.appendChild(timerDisplay);
        section.appendChild(roundDisplay);

        return section;
    }

    addAnimationStyles() {
        const style = document.createElement('style');
        style.textContent = `
            @keyframes healthGlide {
                0% { left: -100%; }
                50% { left: 100%; }
                100% { left: 100%; }
            }
            
            @keyframes superPulse {
                from { box-shadow: 0 0 10px var(--warning-glow); }
                to { box-shadow: 0 0 25px var(--warning-glow), 0 0 35px var(--warning-glow); }
            }
        `;
        document.head.appendChild(style);
    }

    /**
     * Método render - interfaz compatible con BattleScene
     */
    render(characters, gameState) {
        if (!this.isInitialized) {
            this.init();
        }

        const hudGameState = gameState || {
            characters: characters,
            timer: 90,
            status: 'playing'
        };
        
        if (characters && characters.length >= 2) {
            hudGameState.characters = characters;
        }
        
        this.updateHUD(hudGameState);
    }

    updateHUD(gameState) {
        if (!gameState || !gameState.characters || gameState.characters.length < 2) {
            return;
        }

        const p1 = gameState.characters[0];
        const p2 = gameState.characters[1];

        this.updateHealthBar('p1', p1.health, p1.maxHealth);
        this.updateHealthBar('p2', p2.health, p2.maxHealth);
        
        this.updateSuperMeter('p1', p1.superMeter || 0);
        this.updateSuperMeter('p2', p2.superMeter || 0);
        
        this.updateTimer(gameState.timer);
        
        this.updatePlayerNames(p1.name || 'P1', p2.name || 'P2');
    }

    updateHealthBar(playerId, currentHealth, maxHealth) {
        const healthPercentage = Math.max(0, (currentHealth / maxHealth) * 100);
        const healthElement = document.getElementById(`health-${playerId}`);
        const damageElement = document.getElementById(`damage-${playerId}`);
        
        if (!healthElement) return;

        const oldHealth = this.animatedHealthValues[playerId];
        if (healthPercentage < oldHealth) {
            this.triggerDamageEffect(playerId, oldHealth, healthPercentage);
        }

        anime({
            targets: this.animatedHealthValues,
            [playerId]: healthPercentage,
            duration: 500,
            easing: 'easeOutCubic',
            update: () => {
                healthElement.style.width = this.animatedHealthValues[playerId] + '%';
                
                if (this.animatedHealthValues[playerId] < 25) {
                    healthElement.style.background = 'linear-gradient(90deg, var(--danger-glow), #ff6b6b)';
                    this.triggerLowHealthWarning(playerId);
                } else if (this.animatedHealthValues[playerId] < 50) {
                    healthElement.style.background = 'linear-gradient(90deg, var(--warning-glow), #ffd93d)';
                } else {
                    healthElement.style.background = 'linear-gradient(90deg, var(--success-glow), var(--primary-glow))';
                }
            }
        });
    }

    updateSuperMeter(playerId, superValue) {
        const superElement = document.getElementById(`super-${playerId}`);
        if (!superElement) return;

        const superPercentage = Math.min(100, superValue);
        
        if (superPercentage >= 100 && this.animatedSuperValues[playerId] < 100) {
            this.triggerSuperReadyEffect(playerId);
        }

        anime({
            targets: this.animatedSuperValues,
            [playerId]: superPercentage,
            duration: 300,
            easing: 'easeOutCubic',
            update: () => {
                superElement.style.width = this.animatedSuperValues[playerId] + '%';
                
                if (this.animatedSuperValues[playerId] >= 100) {
                    superElement.style.animation = 'superPulse 1s ease-in-out infinite alternate';
                } else {
                    superElement.style.animation = 'none';
                }
            }
        });
    }

    updateTimer(time) {
        const timerElement = document.getElementById('timer-display');
        if (!timerElement) return;

        timerElement.textContent = Math.max(0, Math.floor(time));
        
        if (time <= 10 && time > 0) {
            timerElement.style.color = 'var(--danger-glow)';
            
            if (!timerElement.classList.contains('urgent-timer')) {
                timerElement.classList.add('urgent-timer');
                anime({
                    targets: timerElement,
                    scale: [1, 1.2, 1],
                    duration: 800,
                    loop: true,
                    easing: 'easeInOutSine'
                });
            }
        } else {
            timerElement.style.color = 'var(--text-color)';
            timerElement.classList.remove('urgent-timer');
            anime.remove(timerElement);
        }
    }

    updatePlayerNames(p1Name, p2Name) {
        const p1NameElement = document.querySelector('#hud-p1 .player-name');
        const p2NameElement = document.querySelector('#hud-p2 .player-name');
        
        if (p1NameElement) p1NameElement.textContent = p1Name.toUpperCase();
        if (p2NameElement) p2NameElement.textContent = p2Name.toUpperCase();
    }

    triggerDamageEffect(playerId, oldHealth, newHealth) {
        const damageElement = document.getElementById(`damage-${playerId}`);
        if (!damageElement) return;

        const damageAmount = oldHealth - newHealth;
        
        const playerSection = document.getElementById(`hud-${playerId}`);
        if (playerSection) {
            anime({
                targets: playerSection,
                translateX: [0, -5, 5, -3, 3, 0],
                duration: 300,
                easing: 'easeInOutSine'
            });
        }

        damageElement.style.width = damageAmount + '%';
        anime({
            targets: damageElement,
            width: '0%',
            duration: 800,
            easing: 'easeOutExpo',
            delay: 200
        });

        if (damageAmount > 20) {
            this.vfx.screenShake(Math.min(15, damageAmount / 5));
        }

        const rect = playerSection.getBoundingClientRect();
        this.vfx.createParticleBurst(
            rect.left + rect.width / 2,
            rect.top + rect.height / 2,
            Math.min(30, damageAmount),
            ['#ff4444', '#ffaa44', '#ffffff']
        );
    }

    triggerLowHealthWarning(playerId) {
        if (this.isLowHealthWarning[playerId]) return;
        
        this.isLowHealthWarning[playerId] = true;
        const healthElement = document.getElementById(`health-${playerId}`);
        
        if (healthElement) {
            anime({
                targets: healthElement,
                boxShadow: [
                    '0 0 10px var(--danger-glow)',
                    '0 0 25px var(--danger-glow)',
                    '0 0 10px var(--danger-glow)'
                ],
                duration: 1000,
                loop: true,
                easing: 'easeInOutSine'
            });
        }

        setTimeout(() => {
            this.isLowHealthWarning[playerId] = false;
        }, 5000);
    }

    triggerSuperReadyEffect(playerId) {
        const superElement = document.getElementById(`super-${playerId}`);
        const playerSection = document.getElementById(`hud-${playerId}`);
        
        if (superElement && playerSection) {
            this.vfx.flashEffect(0.3, 200);
            
            const rect = playerSection.getBoundingClientRect();
            this.vfx.createParticleBurst(
                rect.left + rect.width / 2,
                rect.top + rect.height,
                40,
                ['#ffd700', '#ffff00', '#ffffff']
            );

            anime({
                targets: superElement,
                scale: [1, 1.1, 1],
                duration: 400,
                easing: 'easeOutExpo'
            });
        }
    }

    triggerRoundStart(roundNumber) {
        const roundElement = document.getElementById('round-display');
        if (roundElement) {
            roundElement.textContent = `ROUND ${roundNumber}`;
            
            const fightText = document.createElement('div');
            fightText.textContent = 'FIGHT!';
            fightText.style.cssText = `
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                font-size: 6rem;
                font-weight: 900;
                color: var(--danger-glow);
                text-shadow: 0 0 30px var(--danger-glow);
                font-family: 'Orbitron', monospace;
                z-index: 200;
                opacity: 0;
                pointer-events: none;
            `;
            
            document.body.appendChild(fightText);

            anime.timeline()
                .add({
                    targets: fightText,
                    opacity: [0, 1],
                    scale: [0.5, 1.2, 1],
                    duration: 800,
                    easing: 'easeOutExpo'
                })
                .add({
                    targets: fightText,
                    opacity: [1, 0],
                    scale: [1, 0.8],
                    duration: 500,
                    easing: 'easeInExpo',
                    complete: () => fightText.remove()
                }, '+=1000');

            this.vfx.screenShake(10);
        }
    }

    triggerKO(playerId) {
        const koText = document.createElement('div');
        koText.innerHTML = '<span>K</span><span>.</span><span>O</span><span>.</span>';
        koText.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            font-size: 5rem;
            font-weight: 900;
            color: var(--danger-glow);
            text-shadow: 0 0 30px var(--danger-glow);
            font-family: 'Orbitron', monospace;
            z-index: 200;
            pointer-events: none;
        `;

        const letters = koText.querySelectorAll('span');
        letters.forEach(letter => {
            letter.style.display = 'inline-block';
            letter.style.opacity = '0';
            letter.style.transform = 'scale(0)';
        });

        document.body.appendChild(koText);

        anime.timeline()
            .add({
                targets: letters,
                opacity: [0, 1],
                scale: [0, 1.2, 1],
                duration: 800,
                delay: anime.stagger(100),
                easing: 'easeOutExpo'
            })
            .add({
                targets: koText,
                scale: [1, 1.1, 1],
                duration: 300,
                easing: 'easeInOutSine'
            })
            .add({
                targets: koText,
                opacity: [1, 0],
                duration: 1000,
                easing: 'easeInExpo',
                complete: () => koText.remove()
            }, '+=2000');

        this.vfx.createKOEffect(koText);
    }

    // Método legacy para compatibilidad
    draw(gameState) {
        this.updateHUD(gameState);
    }

    destroy() {
        if (this.vfx) {
            this.vfx.cleanup();
        }

        const hudContainer = document.getElementById('hud-container');
        if (hudContainer) {
            hudContainer.remove();
        }

        anime.remove('#timer-display');
        anime.remove('.health-fill');
        anime.remove('.player-name');
    }
}
