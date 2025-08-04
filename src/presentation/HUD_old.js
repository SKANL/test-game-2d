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

    /**
     * Método render - interfaz compatible con BattleScene
     * @param {Array} characters - Array de personajes
     * @param {Object} gameState - Estado del juego
     */
    render(characters, gameState) {
        if (!this.isInitialized) {
            this.init();
        }

        // Crear gameState compatible si no se proporciona uno
        const hudGameState = gameState || {
            characters: characters,
            timer: 90,
            status: 'playing'
        };
        
        // Asegurar que gameState tiene los personajes
        if (characters && characters.length >= 2) {
            hudGameState.characters = characters;
        }
        
        // Actualizar HUD con efectos
        this.updateHUD(hudGameState);
    }

    updateHUD(gameState) {
        if (!gameState || !gameState.characters || gameState.characters.length < 2) {
            return;
        }

        const p1 = gameState.characters[0];
        const p2 = gameState.characters[1];

        // Actualizar barras de vida con animaciones
        this.updateHealthBar('p1', p1.health, p1.maxHealth);
        this.updateHealthBar('p2', p2.health, p2.maxHealth);
        
        // Actualizar súper medidores
        this.updateSuperMeter('p1', p1.superMeter || 0);
        this.updateSuperMeter('p2', p2.superMeter || 0);
        
        // Actualizar timer
        this.updateTimer(gameState.timer);
        
        // Actualizar nombres de personajes
        this.updatePlayerNames(p1.name || 'P1', p2.name || 'P2');
    }

    updateHealthBar(playerId, currentHealth, maxHealth) {
        const healthPercentage = Math.max(0, (currentHealth / maxHealth) * 100);
        const healthElement = document.getElementById(`health-${playerId}`);
        const damageElement = document.getElementById(`damage-${playerId}`);
        
        if (!healthElement) return;

        // Detectar daño
        const oldHealth = this.animatedHealthValues[playerId];
        if (healthPercentage < oldHealth) {
            this.triggerDamageEffect(playerId, oldHealth, healthPercentage);
        }

        // Animar la barra de vida
        anime({
            targets: this.animatedHealthValues,
            [playerId]: healthPercentage,
            duration: 500,
            easing: 'easeOutCubic',
            update: () => {
                healthElement.style.width = this.animatedHealthValues[playerId] + '%';
                
                // Cambiar color según la vida restante
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
        
        // Detectar super completo
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
                
                // Efecto de pulsación cuando está lleno
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
        
        // Efectos de urgencia cuando queda poco tiempo
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
        
        // Efecto de shake en la sección del jugador
        const playerSection = document.getElementById(`hud-${playerId}`);
        if (playerSection) {
            anime({
                targets: playerSection,
                translateX: [0, -5, 5, -3, 3, 0],
                duration: 300,
                easing: 'easeInOutSine'
            });
        }

        // Mostrar indicador de daño
        damageElement.style.width = damageAmount + '%';
        anime({
            targets: damageElement,
            width: '0%',
            duration: 800,
            easing: 'easeOutExpo',
            delay: 200
        });

        // Screen shake proporcional al daño
        if (damageAmount > 20) {
            this.vfx.screenShake(Math.min(15, damageAmount / 5));
        }

        // Partículas de impacto
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

        // Reset warning cuando la vida mejore
        setTimeout(() => {
            this.isLowHealthWarning[playerId] = false;
        }, 5000);
    }

    triggerSuperReadyEffect(playerId) {
        const superElement = document.getElementById(`super-${playerId}`);
        const playerSection = document.getElementById(`hud-${playerId}`);
        
        if (superElement && playerSection) {
            // Efecto de destello
            this.vfx.flashEffect(0.3, 200);
            
            // Partículas doradas
            const rect = playerSection.getBoundingClientRect();
            this.vfx.createParticleBurst(
                rect.left + rect.width / 2,
                rect.top + rect.height,
                40,
                ['#ffd700', '#ffff00', '#ffffff']
            );

            // Animación del súper medidor
            anime({
                targets: superElement,
                scale: [1, 1.1, 1],
                duration: 400,
                easing: 'easeOutExpo'
            });
        }
    }

    // Métodos de combate épicos
    triggerRoundStart(roundNumber) {
        const roundElement = document.getElementById('round-display');
        if (roundElement) {
            roundElement.textContent = `ROUND ${roundNumber}`;
            
            // Crear texto "FIGHT!" temporal
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

        // Convertir cada letra en span para animación individual
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
        
        // NUEVO: Dibujar información de rondas y match
        this.drawRoundInfo(gameState);
        
        // NUEVO: Dibujar estado prominente de la ronda
        this.drawRoundStatus(gameState);
        
        // Dibujar nombres de los personajes
        this.drawPlayerNames(p1, p2);
        
        // Dibujar indicadores de estado si es necesario
        this.drawStatusIndicators(gameState);
    }

    drawHealthBars(p1, p2) {
        const barWidth = 300;
        const barHeight = 20;
        const margin = 50;
        const topMargin = 30;

        // Barra de vida P1 (izquierda)
        this.drawHealthBar(
            margin, topMargin, 
            barWidth, barHeight, 
            p1.health, p1.maxHealth, 
            '#ff0000', '#cc0000'
        );

        // Barra de vida P2 (derecha)
        this.drawHealthBar(
            this.canvas.width - margin - barWidth, topMargin,
            barWidth, barHeight,
            p2.health, p2.maxHealth,
            '#ff0000', '#cc0000'
        );
    }

    drawSuperMeters(p1, p2) {
        const barWidth = 200;
        const barHeight = 15;
        const margin = 50;
        const topMargin = 60;

        // Súper medidor P1 (izquierda)
        this.drawSuperMeter(
            margin, topMargin,
            barWidth, barHeight,
            p1.superMeter, p1.maxSuperMeter || 100
        );

        // Súper medidor P2 (derecha)
        this.drawSuperMeter(
            this.canvas.width - margin - barWidth, topMargin,
            barWidth, barHeight,
            p2.superMeter, p2.maxSuperMeter || 100
        );
    }

    drawHealthBar(x, y, width, height, currentHealth, maxHealth, fillColor = '#ff0000', borderColor = '#cc0000') {
        const healthPercentage = Math.max(0, currentHealth / maxHealth);
        
        this.ctx.save();
        
        // Fondo de la barra
        this.ctx.fillStyle = '#333333';
        this.ctx.fillRect(x, y, width, height);
        
        // Barra de vida actual
        this.ctx.fillStyle = fillColor;
        this.ctx.fillRect(x, y, width * healthPercentage, height);
        
        // Borde
        this.ctx.strokeStyle = borderColor;
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(x, y, width, height);
        
        // Texto de vida
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = '14px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(
            `${Math.ceil(currentHealth)}/${maxHealth}`,
            x + width / 2,
            y + height / 2 + 5
        );
        
        this.ctx.restore();
    }

    drawSuperMeter(x, y, width, height, currentMeter, maxMeter) {
        const meterPercentage = Math.max(0, currentMeter / maxMeter);
        
        this.ctx.save();
        
        // Fondo del medidor
        this.ctx.fillStyle = '#222222';
        this.ctx.fillRect(x, y, width, height);
        
        // Medidor actual (gradiente dorado)
        const gradient = this.ctx.createLinearGradient(x, y, x + width, y);
        gradient.addColorStop(0, '#ffaa00');
        gradient.addColorStop(1, '#ffdd00');
        
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(x, y, width * meterPercentage, height);
        
        // Borde
        this.ctx.strokeStyle = '#ffaa00';
        this.ctx.lineWidth = 1;
        this.ctx.strokeRect(x, y, width, height);
        
        // Indicador de nivel completo
        if (meterPercentage >= 1.0) {
            this.ctx.strokeStyle = '#ffffff';
            this.ctx.lineWidth = 2;
            this.ctx.strokeRect(x - 1, y - 1, width + 2, height + 2);
        }
        
        this.ctx.restore();
    }

    drawTimer(timer) {
        const timeLeft = Math.max(0, Math.ceil(timer));
        
        this.ctx.save();
        
        // Posición centrada en la parte superior
        const x = this.canvas.width / 2;
        const y = 45;
        
        // Color del timer basado en el tiempo restante
        let timerColor = '#ffffff';
        let glowColor = 'rgba(255, 255, 255, 0.3)';
        
        if (timeLeft <= 10) {
            timerColor = '#ff0000'; // Rojo cuando queda poco tiempo
            glowColor = 'rgba(255, 0, 0, 0.5)';
            
            // Efecto de parpadeo en los últimos 10 segundos
            if (Math.floor(Date.now() / 500) % 2 === 0) {
                timerColor = '#ffffff';
            }
        } else if (timeLeft <= 30) {
            timerColor = '#ffaa00'; // Naranja cuando queda tiempo moderado
            glowColor = 'rgba(255, 170, 0, 0.4)';
        }
        
        // Fondo del timer
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(x - 50, y - 35, 100, 50);
        
        // Borde del timer
        this.ctx.strokeStyle = timerColor;
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(x - 50, y - 35, 100, 50);
        
        // Sombra/glow del texto
        this.ctx.shadowColor = glowColor;
        this.ctx.shadowBlur = 10;
        
        // Texto del timer
        this.ctx.fillStyle = timerColor;
        this.ctx.font = 'bold 28px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(timeLeft.toString(), x, y);
        
        this.ctx.restore();
    }

    drawPlayerNames(p1, p2) {
        this.ctx.save();
        
        this.ctx.font = 'bold 18px Arial';
        this.ctx.fillStyle = '#ffffff';
        
        // Nombre P1 (izquierda)
        this.ctx.textAlign = 'left';
        this.ctx.fillText(p1.name || 'Player 1', 50, 20);
        
        // Nombre P2 (derecha)
        this.ctx.textAlign = 'right';
        this.ctx.fillText(p2.name || 'Player 2', this.canvas.width - 50, 20);
        
        this.ctx.restore();
    }

    /**
     * Dibujar información clara de rondas y match
     */
    drawRoundInfo(gameState) {
        this.ctx.save();
        
        // Obtener información de rondas del gameState
        const currentRound = gameState.round || 1;
        const maxRounds = gameState.maxRounds || 3; // Mejor de 3 por defecto
        const scores = gameState.scores || { p1: 0, p2: 0 };
        const roundsToWin = Math.ceil(maxRounds / 2);
        
        // Posición central superior
        const centerX = this.canvas.width / 2;
        const roundInfoY = 100;
        
        // Fondo para la información de rondas
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        this.ctx.fillRect(centerX - 120, roundInfoY - 25, 240, 50);
        
        // Borde decorativo
        this.ctx.strokeStyle = '#ffaa00';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(centerX - 120, roundInfoY - 25, 240, 50);
        
        // Texto de ronda actual
        this.ctx.fillStyle = '#ffaa00';
        this.ctx.font = 'bold 16px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(`RONDA ${currentRound}`, centerX, roundInfoY - 5);
        
        // Texto de formato del match
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = '12px Arial';
        this.ctx.fillText(`Mejor de ${maxRounds} (${roundsToWin} para ganar)`, centerX, roundInfoY + 12);
        
        // Indicadores de rondas ganadas (como círculos)
        this.drawRoundWinIndicators(centerX, roundInfoY + 35, scores, roundsToWin);
        
        this.ctx.restore();
    }

    /**
     * Dibujar indicadores visuales de rondas ganadas
     */
    drawRoundWinIndicators(centerX, y, scores, roundsToWin) {
        const circleRadius = 8;
        const spacing = 20;
        const startX = centerX - ((roundsToWin - 1) * spacing) / 2;
        
        // Indicadores para P1 (lado izquierdo)
        for (let i = 0; i < roundsToWin; i++) {
            const x = startX + (i * spacing) - 60;
            
            this.ctx.beginPath();
            this.ctx.arc(x, y, circleRadius, 0, 2 * Math.PI);
            
            if (i < scores.p1) {
                // Ronda ganada - círculo lleno
                this.ctx.fillStyle = '#00ff00';
                this.ctx.fill();
                this.ctx.strokeStyle = '#ffffff';
                this.ctx.lineWidth = 2;
                this.ctx.stroke();
            } else {
                // Ronda no ganada - círculo vacío
                this.ctx.strokeStyle = '#666666';
                this.ctx.lineWidth = 2;
                this.ctx.stroke();
            }
        }
        
        // Etiqueta P1
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = 'bold 12px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('P1', startX - 80, y + 4);
        
        // Indicadores para P2 (lado derecho)
        for (let i = 0; i < roundsToWin; i++) {
            const x = startX + (i * spacing) + 60;
            
            this.ctx.beginPath();
            this.ctx.arc(x, y, circleRadius, 0, 2 * Math.PI);
            
            if (i < scores.p2) {
                // Ronda ganada - círculo lleno
                this.ctx.fillStyle = '#00ff00';
                this.ctx.fill();
                this.ctx.strokeStyle = '#ffffff';
                this.ctx.lineWidth = 2;
                this.ctx.stroke();
            } else {
                // Ronda no ganada - círculo vacío
                this.ctx.strokeStyle = '#666666';
                this.ctx.lineWidth = 2;
                this.ctx.stroke();
            }
        }
        
        // Etiqueta P2
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = 'bold 12px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('P2', startX + 80, y + 4);
    }

    /**
     * Dibujar estado prominente de la ronda (ROUND START, FIGHT, etc.)
     */
    drawRoundStatus(gameState) {
        if (!gameState || gameState.status === 'playing') return;
        
        this.ctx.save();
        
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        let statusText = '';
        let textColor = '#ffffff';
        let glowColor = 'rgba(255, 255, 255, 0.5)';
        let fontSize = '64px';
        
        // Determinar texto y color según el estado
        switch (gameState.status) {
            case 'roundStart':
                statusText = `RONDA ${gameState.round}`;
                textColor = '#ffaa00';
                glowColor = 'rgba(255, 170, 0, 0.8)';
                
                // Mostrar countdown si está disponible
                if (gameState.roundStartTime) {
                    const elapsed = (Date.now() - gameState.roundStartTime) / 1000;
                    const remaining = Math.ceil(gameState.gameConfig.roundStartDelay - elapsed);
                    if (remaining > 0) {
                        statusText = `RONDA ${gameState.round}\n${remaining}`;
                    } else {
                        statusText = '¡LUCHA!';
                        textColor = '#ff0000';
                        glowColor = 'rgba(255, 0, 0, 0.8)';
                    }
                }
                break;
                
            case 'roundOver':
                if (gameState.roundResult === 'p1') {
                    statusText = `${gameState.characters[0]?.name || 'P1'}\nGANA LA RONDA`;
                    textColor = '#00ff00';
                    glowColor = 'rgba(0, 255, 0, 0.8)';
                } else if (gameState.roundResult === 'p2') {
                    statusText = `${gameState.characters[1]?.name || 'P2'}\nGANA LA RONDA`;
                    textColor = '#00ff00';
                    glowColor = 'rgba(0, 255, 0, 0.8)';
                } else {
                    statusText = 'RONDA\nEMPATADA';
                    textColor = '#ffaa00';
                    glowColor = 'rgba(255, 170, 0, 0.8)';
                }
                fontSize = '48px';
                break;
                
            case 'gameOver':
                statusText = `${gameState.winnerName}\nGANA EL MATCH`;
                textColor = '#ffff00';
                glowColor = 'rgba(255, 255, 0, 1.0)';
                fontSize = '56px';
                break;
                
            case 'paused':
                statusText = 'PAUSADO';
                textColor = '#cccccc';
                glowColor = 'rgba(255, 255, 255, 0.5)';
                break;
                
            default:
                return; // No mostrar nada para otros estados
        }
        
        // Fondo semitransparente
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Efecto de glow
        this.ctx.shadowColor = glowColor;
        this.ctx.shadowBlur = 20;
        this.ctx.shadowOffsetX = 0;
        this.ctx.shadowOffsetY = 0;
        
        // Texto principal
        this.ctx.fillStyle = textColor;
        this.ctx.font = `bold ${fontSize} Arial`;
        this.ctx.textAlign = 'center';
        
        // Manejar texto multilinea
        const lines = statusText.split('\n');
        const lineHeight = parseInt(fontSize) * 1.2;
        const startY = centerY - ((lines.length - 1) * lineHeight) / 2;
        
        lines.forEach((line, index) => {
            this.ctx.fillText(line, centerX, startY + (index * lineHeight));
        });
        
        this.ctx.restore();
    }

    drawStatusIndicators(gameState) {
        // Indicadores adicionales según el estado del juego
        if (gameState.status === 'paused') {
            this.drawPauseIndicator();
        } else if (gameState.status === 'gameOver') {
            this.drawGameOverIndicator(gameState);
        }
    }

    drawPauseIndicator() {
        this.ctx.save();
        
        // Fondo semitransparente
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Texto de pausa
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = 'bold 48px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('PAUSA', this.canvas.width / 2, this.canvas.height / 2);
        
        this.ctx.restore();
    }

    drawGameOverIndicator(gameState) {
        this.ctx.save();
        
        // Validar gameState
        if (!gameState || !gameState.characters || gameState.characters.length < 2) {
            console.warn('⚠️ HUD.drawGameOverIndicator: gameState inválido');
            this.ctx.restore();
            return;
        }
        
        // Determinar ganador
        const p1 = gameState.characters[0];
        const p2 = gameState.characters[1];
        let winner = '';
        
        if (p1.health <= 0) {
            winner = p2.name + ' GANA!';
        } else if (p2.health <= 0) {
            winner = p1.name + ' GANA!';
        } else {
            winner = 'TIEMPO AGOTADO!';
        }
        
        // Fondo semitransparente
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Texto de game over
        this.ctx.fillStyle = '#ffaa00';
        this.ctx.font = 'bold 48px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(winner, this.canvas.width / 2, this.canvas.height / 2);
        
        this.ctx.restore();
    }

    drawDebugInfo(gameState) {
        if (!this.renderer.debugMode) return;
        
        this.ctx.save();
        
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(10, this.canvas.height - 150, 300, 140);
        
        this.ctx.fillStyle = '#00ff00';
        this.ctx.font = '12px monospace';
        this.ctx.textAlign = 'left';
        
        let y = this.canvas.height - 130;
        const lineHeight = 15;
        
        this.ctx.fillText(`Timer: ${gameState.timer.toFixed(2)}`, 15, y);
        y += lineHeight;
        
        this.ctx.fillText(`Status: ${gameState.status}`, 15, y);
        y += lineHeight;
        
        if (gameState.characters[0]) {
            const p1 = gameState.characters[0];
            this.ctx.fillText(`P1: ${p1.state} (${p1.currentFrameIndex})`, 15, y);
            y += lineHeight;
            this.ctx.fillText(`P1 Pos: (${p1.position.x.toFixed(1)}, ${p1.position.y.toFixed(1)})`, 15, y);
            y += lineHeight;
        }
        
        if (gameState.characters[1]) {
            const p2 = gameState.characters[1];
            this.ctx.fillText(`P2: ${p2.state} (${p2.currentFrameIndex})`, 15, y);
            y += lineHeight;
            this.ctx.fillText(`P2 Pos: (${p2.position.x.toFixed(1)}, ${p2.position.y.toFixed(1)})`, 15, y);
        }
        
        this.ctx.restore();
    }
}