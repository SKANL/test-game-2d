/**
 * GameOverScene - Pantalla de fin de juego épica con efectos visuales espectaculares
 * Integra efectos avanzados de anime.js
 */
import VisualEffectsManager from '../VisualEffectsManager.js';
import ResponsiveUtils from '../../infrastructure/ResponsiveUtils.js';

export default class GameOverScene {
    constructor(battleResult, onPlayAgain, onMainMenu) {
        this.battleResult = battleResult;
        this.onPlayAgain = onPlayAgain;
        this.onMainMenu = onMainMenu;
        this.vfx = new VisualEffectsManager();
        this.animationPhase = 0;
        this.animationId = null;
        this.isInitialized = false;
        this.confettiInterval = null;
    }

    init() {
        if (this.isInitialized) return;
        this.vfx.init();
        this.isInitialized = true;
    }

    render() {
        if (!this.isInitialized) {
            this.init();
        }

        const container = document.createElement('div');
        container.id = 'gameover-scene-container';
        container.className = 'responsive-container';
        container.style.cssText = `
            position: relative;
            width: 100%;
            height: 100%;
            min-height: 100vh;
            background: var(--dark-bg);
            background-image: 
                radial-gradient(circle at 30% 70%, rgba(239, 68, 68, 0.2) 0%, transparent 50%),
                radial-gradient(circle at 70% 30%, rgba(34, 197, 94, 0.2) 0%, transparent 50%);
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            color: white;
            font-family: 'Orbitron', monospace;
            overflow: hidden;
            z-index: 1000;
            padding: var(--spacing-lg);
        `;

        // Canvas para confetti y efectos
        const effectsCanvas = document.createElement('canvas');
        effectsCanvas.id = 'gameover-effects-canvas';
        effectsCanvas.width = window.innerWidth;
        effectsCanvas.height = window.innerHeight;
        effectsCanvas.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 1;
        `;

        // Shockwave element
        const shockwave = document.createElement('div');
        shockwave.id = 'gameover-shockwave';
        shockwave.style.cssText = `
            position: absolute;
            top: 50%;
            left: 50%;
            width: 10px;
            height: 10px;
            border-radius: 50%;
            border: 3px solid var(--warning-glow);
            transform: translate(-50%, -50%);
            opacity: 0;
            z-index: 1;
        `;

        // Contenedor principal de resultados
        const resultsContainer = document.createElement('div');
        resultsContainer.className = 'results-container';
        resultsContainer.style.cssText = `
            z-index: 10;
            text-align: center;
            transform: scale(0);
            opacity: 0;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 2rem;
        `;

        // Texto del resultado principal
        const resultText = document.createElement('div');
        resultText.className = 'result-text';
        
        if (this.battleResult.winner === 'PLAYER') {
            resultText.innerHTML = '<span>V</span><span>I</span><span>C</span><span>T</span><span>O</span><span>R</span><span>Y</span>';
            resultText.style.color = 'var(--success-glow)';
            container.style.backgroundImage += ', radial-gradient(circle at 50% 50%, rgba(34, 197, 94, 0.3) 0%, transparent 70%)';
        } else if (this.battleResult.winner === 'AI') {
            resultText.innerHTML = '<span>D</span><span>E</span><span>F</span><span>E</span><span>A</span><span>T</span>';
            resultText.style.color = 'var(--danger-glow)';
            container.style.backgroundImage += ', radial-gradient(circle at 50% 50%, rgba(239, 68, 68, 0.3) 0%, transparent 70%)';
        } else {
            resultText.innerHTML = '<span>D</span><span>R</span><span>A</span><span>W</span>';
            resultText.style.color = 'var(--warning-glow)';
        }

        resultText.style.cssText += `
            font-size: 4rem;
            font-weight: 900;
            text-shadow: 0 0 20px currentColor, 0 0 40px currentColor;
            margin-bottom: 1rem;
            position: relative;
        `;

        // Aplicar estilos a las letras individuales
        const letters = resultText.querySelectorAll('span');
        letters.forEach(letter => {
            letter.style.cssText = `
                display: inline-block;
                opacity: 0;
                transform: scale(0) rotateY(180deg);
                margin: 0 0.1em;
            `;
        });

        // Detalles del combate
        const battleDetails = document.createElement('div');
        battleDetails.className = 'battle-details';
        battleDetails.style.cssText = `
            background: rgba(0, 0, 0, 0.6);
            padding: 2rem;
            border-radius: 15px;
            border: 2px solid var(--border-color);
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
            backdrop-filter: blur(10px);
            opacity: 0;
            transform: translateY(30px);
        `;

        const winnerName = document.createElement('div');
        winnerName.textContent = this.battleResult.winnerName || this.battleResult.winner;
        winnerName.style.cssText = `
            font-size: 2rem;
            font-weight: 700;
            color: var(--primary-glow);
            margin-bottom: 1rem;
            text-shadow: 0 0 10px var(--primary-glow);
        `;

        const statsContainer = document.createElement('div');
        statsContainer.style.cssText = `
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 1rem;
            margin-bottom: 2rem;
        `;

        // Estadísticas del combate
        const stats = [
            { label: 'Duración', value: this.formatTime(this.battleResult.duration || 90) },
            { label: 'Golpes Dados', value: this.battleResult.hitsLanded || '0' },
            { label: 'Combos', value: this.battleResult.combosPerformed || '0' },
            { label: 'Daño Total', value: `${this.battleResult.totalDamage || 0}%` }
        ];

        stats.forEach(stat => {
            const statElement = document.createElement('div');
            statElement.style.cssText = `
                text-align: center;
                padding: 1rem;
                background: rgba(255, 255, 255, 0.05);
                border-radius: 8px;
                border: 1px solid var(--border-color);
                opacity: 0;
                transform: scale(0.8);
            `;

            const statValue = document.createElement('div');
            statValue.textContent = stat.value;
            statValue.style.cssText = `
                font-size: 1.5rem;
                font-weight: 700;
                color: var(--primary-glow);
                margin-bottom: 0.5rem;
            `;

            const statLabel = document.createElement('div');
            statLabel.textContent = stat.label;
            statLabel.style.cssText = `
                font-size: 0.9rem;
                color: var(--text-color);
                opacity: 0.8;
            `;

            statElement.appendChild(statValue);
            statElement.appendChild(statLabel);
            statsContainer.appendChild(statElement);
        });

        // Botones de acción
        const buttonsContainer = document.createElement('div');
        buttonsContainer.className = 'buttons-container';
        buttonsContainer.style.cssText = `
            display: flex;
            gap: 2rem;
            margin-top: 2rem;
            opacity: 0;
            transform: translateY(20px);
        `;

        const playAgainButton = this.createActionButton('REVANCHA', () => {
            this.cleanup();
            this.onPlayAgain();
        }, 'var(--success-glow)');

        const mainMenuButton = this.createActionButton('MENÚ PRINCIPAL', () => {
            this.cleanup();
            this.onMainMenu();
        }, 'var(--primary-glow)');

        buttonsContainer.appendChild(playAgainButton);
        buttonsContainer.appendChild(mainMenuButton);

        // Ensamblar la escena
        battleDetails.appendChild(winnerName);
        battleDetails.appendChild(statsContainer);
        battleDetails.appendChild(buttonsContainer);
        
        resultsContainer.appendChild(resultText);
        resultsContainer.appendChild(battleDetails);

        container.appendChild(effectsCanvas);
        container.appendChild(shockwave);
        container.appendChild(resultsContainer);

        // Agregar la escena al contenedor de escenas manejado por SceneManager
        const sceneContainer = document.getElementById('scene-container');
        if (sceneContainer) {
            sceneContainer.appendChild(container);
        } else {
            document.body.appendChild(container);
        }

        // Iniciar animaciones épicas
        this.startGameOverAnimation();
        this.startContinuousEffects(effectsCanvas);

        return container;
    }

    createActionButton(text, onClick, glowColor) {
        const button = document.createElement('button');
        button.textContent = text;
        button.style.cssText = `
            background: transparent;
            border: 2px solid ${glowColor};
            color: ${glowColor};
            padding: 1rem 2rem;
            border-radius: 10px;
            font-size: 1.1rem;
            font-weight: 600;
            font-family: 'Orbitron', monospace;
            cursor: pointer;
            transition: all 0.3s ease;
            box-shadow: 0 0 10px ${glowColor}40;
            text-transform: uppercase;
            letter-spacing: 1px;
            position: relative;
            overflow: hidden;
        `;

        // Efecto hover
        button.addEventListener('mouseenter', () => {
            anime({
                targets: button,
                scale: 1.05,
                boxShadow: `0 0 20px ${glowColor}80`,
                duration: 200,
                easing: 'easeOutQuad'
            });

            // Crear efecto de partículas en hover
            const rect = button.getBoundingClientRect();
            this.vfx.createParticleBurst(
                rect.left + rect.width / 2,
                rect.top + rect.height / 2,
                10,
                [glowColor, '#ffffff']
            );
        });

        button.addEventListener('mouseleave', () => {
            anime({
                targets: button,
                scale: 1,
                boxShadow: `0 0 10px ${glowColor}40`,
                duration: 200,
                easing: 'easeOutQuad'
            });
        });

        button.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Efecto de click épico
            anime({
                targets: button,
                scale: [1, 0.95, 1],
                duration: 150,
                easing: 'easeInOutSine'
            });

            this.vfx.flashEffect(0.3, 150);
            setTimeout(onClick, 200);
        });

        return button;
    }

    startGameOverAnimation() {
        const letters = document.querySelectorAll('.result-text span');
        const resultsContainer = document.querySelector('.results-container');
        const battleDetails = document.querySelector('.battle-details');
        const buttonsContainer = document.querySelector('.buttons-container');
        const shockwave = document.getElementById('gameover-shockwave');
        const statsElements = document.querySelectorAll('.battle-details > div:nth-child(2) > div');

        // Timeline épica de animaciones
        const timeline = anime.timeline({
            easing: 'easeOutExpo'
        });

        // 1. Shockwave inicial
        timeline.add({
            targets: shockwave,
            scale: [0, 60],
            opacity: [1, 0],
            duration: 1000,
            begin: () => {
                this.vfx.screenShake(15);
            }
        });

        // 2. Aparecer contenedor principal
        timeline.add({
            targets: resultsContainer,
            scale: [0, 1],
            opacity: [0, 1],
            duration: 600
        }, '-=800');

        // 3. Letras del resultado con efecto épico
        timeline.add({
            targets: letters,
            opacity: [0, 1],
            scale: [0, 1.2, 1],
            rotateY: [180, 0],
            delay: anime.stagger(100),
            duration: 800
        }, '-=400');

        // 4. Detalles del combate
        timeline.add({
            targets: battleDetails,
            opacity: [0, 1],
            translateY: [30, 0],
            duration: 600
        }, '-=200');

        // 5. Estadísticas con stagger
        timeline.add({
            targets: statsElements,
            opacity: [0, 1],
            scale: [0.8, 1],
            delay: anime.stagger(150),
            duration: 500
        }, '-=300');

        // 6. Botones finales
        timeline.add({
            targets: buttonsContainer,
            opacity: [0, 1],
            translateY: [20, 0],
            duration: 500
        }, '-=200');

        // Efecto continuo en las letras del resultado
        setTimeout(() => {
            anime({
                targets: letters,
                scale: [1, 1.05, 1],
                textShadow: [
                    '0 0 20px currentColor, 0 0 40px currentColor',
                    '0 0 30px currentColor, 0 0 60px currentColor',
                    '0 0 20px currentColor, 0 0 40px currentColor'
                ],
                duration: 2000,
                loop: true,
                direction: 'alternate',
                easing: 'easeInOutSine'
            });
        }, 2000);
    }

    startContinuousEffects(canvas) {
        const ctx = canvas.getContext('2d');
        
        // Si es victoria, confetti continuo
        if (this.battleResult.winner === 'PLAYER') {
            this.confettiInterval = setInterval(() => {
                this.createConfetti(ctx);
            }, 2000);
        }
        
        // Partículas de fondo
        this.createBackgroundParticles(ctx);
    }

    createConfetti(ctx) {
        const colors = ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4'];
        
        for (let i = 0; i < 50; i++) {
            const confetti = {
                x: Math.random() * ctx.canvas.width,
                y: -10,
                width: Math.random() * 10 + 5,
                height: Math.random() * 10 + 5,
                color: colors[Math.floor(Math.random() * colors.length)],
                rotation: Math.random() * 360,
                rotationSpeed: (Math.random() - 0.5) * 10,
                velocityY: Math.random() * 3 + 2,
                velocityX: (Math.random() - 0.5) * 2
            };
            
            anime({
                targets: confetti,
                y: ctx.canvas.height + 20,
                rotation: confetti.rotation + confetti.rotationSpeed * 100,
                duration: Math.random() * 2000 + 2000,
                easing: 'linear',
                update: () => {
                    ctx.save();
                    ctx.translate(confetti.x, confetti.y);
                    ctx.rotate(confetti.rotation * Math.PI / 180);
                    ctx.fillStyle = confetti.color;
                    ctx.fillRect(-confetti.width / 2, -confetti.height / 2, confetti.width, confetti.height);
                    ctx.restore();
                    
                    confetti.x += confetti.velocityX;
                },
                complete: () => {
                    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
                }
            });
        }
    }

    createBackgroundParticles(ctx) {
        const particles = [];
        
        for (let i = 0; i < 30; i++) {
            particles.push({
                x: Math.random() * ctx.canvas.width,
                y: Math.random() * ctx.canvas.height,
                size: Math.random() * 3 + 1,
                alpha: Math.random() * 0.5 + 0.2,
                speed: Math.random() * 2 + 0.5,
                color: this.battleResult.winner === 'PLAYER' ? 
                       'rgba(34, 197, 94, ' : 'rgba(239, 68, 68, '
            });
        }

        const animateParticles = () => {
            ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
            
            particles.forEach(particle => {
                particle.y -= particle.speed;
                particle.alpha *= 0.999;
                
                if (particle.y < 0) {
                    particle.y = ctx.canvas.height;
                    particle.alpha = Math.random() * 0.5 + 0.2;
                }
                
                ctx.globalAlpha = particle.alpha;
                ctx.fillStyle = particle.color + particle.alpha + ')';
                ctx.beginPath();
                ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
                ctx.fill();
            });
            
            if (document.getElementById('gameover-scene-container')) {
                requestAnimationFrame(animateParticles);
            }
        };
        
        animateParticles();
    }

    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }

    cleanup() {
        const container = document.getElementById('gameover-scene-container');
        if (container) {
            anime({
                targets: container,
                opacity: [1, 0],
                scale: [1, 0.9],
                duration: 500,
                easing: 'easeInExpo',
                complete: () => {
                    container.remove();
                }
            });
        }

        if (this.confettiInterval) {
            clearInterval(this.confettiInterval);
        }

        if (this.vfx) {
            this.vfx.cleanup();
        }

        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
    }
}
