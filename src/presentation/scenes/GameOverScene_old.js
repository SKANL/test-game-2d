/**
 * GameOverScene - Pantalla de fin de juego con resultados
 * Sección 9 del Documento Maestro
 */
export default class GameOverScene {
    constructor(battleResult, onPlayAgain, onMainMenu) {
        this.battleResult = battleResult;
        this.onPlayAgain = onPlayAgain;
        this.onMainMenu = onMainMenu;
        this.animationPhase = 0;
        this.animationId = null;
    }

    render() {
        const container = document.createElement('div');
        container.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: linear-gradient(45deg, #000000 0%, #434343 100%);
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            color: white;
            font-family: Arial, sans-serif;
            overflow: hidden;
        `;

        // Overlay con efecto de desvanecimiento
        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.8);
            z-index: 1;
        `;

        // Contenedor principal de resultados
        const resultsContainer = document.createElement('div');
        resultsContainer.style.cssText = `
            z-index: 2;
            text-align: center;
            transform: scale(0);
            animation: scaleIn 1s ease-out forwards;
        `;

        // Determinar ganador y resultado
        const winnerInfo = this.determineWinner();
        
        // Título principal
        const mainTitle = document.createElement('h1');
        mainTitle.textContent = 'GAME OVER';
        mainTitle.style.cssText = `
            font-size: 4rem;
            margin: 0 0 20px 0;
            color: #ff6b6b;
            text-shadow: 
                0 0 10px #ff6b6b,
                0 0 20px #ff6b6b,
                0 0 30px #ff6b6b;
            animation: glow 2s ease-in-out infinite alternate;
        `;

        // Resultado del combate
        const resultTitle = document.createElement('h2');
        resultTitle.textContent = winnerInfo.title;
        resultTitle.style.cssText = `
            font-size: 2.5rem;
            margin: 20px 0;
            color: ${winnerInfo.color};
            text-shadow: 0 2px 4px rgba(0,0,0,0.5);
        `;

        // Información detallada del combate
        const battleInfo = this.createBattleInfo();
        
        // Estadísticas del combate
        const stats = this.createBattleStats();

        // Botones de acción
        const actionButtons = this.createActionButtons();

        resultsContainer.appendChild(mainTitle);
        resultsContainer.appendChild(resultTitle);
        resultsContainer.appendChild(battleInfo);
        resultsContainer.appendChild(stats);
        resultsContainer.appendChild(actionButtons);

        container.appendChild(overlay);
        container.appendChild(resultsContainer);

        // Añadir estilos de animación
        this.addAnimationStyles();

        // Auto-continuar después de 30 segundos si no hay acción
        this.autoTimeout = setTimeout(() => {
            if (this.onMainMenu) this.onMainMenu();
        }, 30000);

        document.body.appendChild(container);
    }

    determineWinner() {
        const { winner, timeUp, p1Character, p2Character, battleDuration } = this.battleResult;

        if (timeUp) {
            return {
                title: '¡TIEMPO AGOTADO!',
                subtitle: 'Combate terminado por tiempo',
                color: '#f39c12'
            };
        }

        if (winner === 'p1') {
            return {
                title: `¡${p1Character} GANA!`,
                subtitle: 'Victoria del Jugador 1',
                color: '#2ecc71'
            };
        } else if (winner === 'p2') {
            return {
                title: `¡${p2Character} GANA!`,
                subtitle: 'Victoria del Jugador 2',
                color: '#3498db'
            };
        } else {
            return {
                title: '¡EMPATE!',
                subtitle: 'Ningún ganador',
                color: '#95a5a6'
            };
        }
    }

    createBattleInfo() {
        const container = document.createElement('div');
        container.style.cssText = `
            background: rgba(255,255,255,0.1);
            padding: 20px;
            border-radius: 15px;
            margin: 30px 0;
            max-width: 600px;
        `;

        const info = document.createElement('div');
        info.style.cssText = `
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            text-align: left;
        `;

        // Información del Jugador 1
        const p1Info = document.createElement('div');
        p1Info.style.cssText = `
            padding: 15px;
            background: rgba(46, 204, 113, 0.2);
            border-radius: 10px;
            border-left: 4px solid #2ecc71;
        `;
        p1Info.innerHTML = `
            <h3 style="margin: 0 0 10px 0; color: #2ecc71;">Jugador 1</h3>
            <p style="margin: 5px 0;"><strong>Personaje:</strong> ${this.battleResult.p1Character}</p>
            <p style="margin: 5px 0;"><strong>Vida Final:</strong> ${this.battleResult.p1FinalHealth}/${this.battleResult.p1MaxHealth}</p>
            <p style="margin: 5px 0;"><strong>Súper Medidor:</strong> ${Math.round(this.battleResult.p1SuperMeter)}%</p>
        `;

        // Información del Jugador 2
        const p2Info = document.createElement('div');
        p2Info.style.cssText = `
            padding: 15px;
            background: rgba(52, 152, 219, 0.2);
            border-radius: 10px;
            border-left: 4px solid #3498db;
        `;
        p2Info.innerHTML = `
            <h3 style="margin: 0 0 10px 0; color: #3498db;">Jugador 2</h3>
            <p style="margin: 5px 0;"><strong>Personaje:</strong> ${this.battleResult.p2Character}</p>
            <p style="margin: 5px 0;"><strong>Vida Final:</strong> ${this.battleResult.p2FinalHealth}/${this.battleResult.p2MaxHealth}</p>
            <p style="margin: 5px 0;"><strong>Súper Medidor:</strong> ${Math.round(this.battleResult.p2SuperMeter)}%</p>
        `;

        info.appendChild(p1Info);
        info.appendChild(p2Info);
        container.appendChild(info);

        return container;
    }

    createBattleStats() {
        const container = document.createElement('div');
        container.style.cssText = `
            background: rgba(255,255,255,0.05);
            padding: 20px;
            border-radius: 10px;
            margin: 20px 0;
        `;

        const title = document.createElement('h3');
        title.textContent = 'Estadísticas del Combate';
        title.style.cssText = `
            margin: 0 0 15px 0;
            color: #f39c12;
            text-align: center;
        `;

        const statsGrid = document.createElement('div');
        statsGrid.style.cssText = `
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 15px;
            text-align: center;
        `;

        const stats = [
            { label: 'Duración del Combate', value: this.formatDuration(this.battleResult.battleDuration) },
            { label: 'Modo de Juego', value: this.battleResult.gameMode || 'Clásico' },
            { label: 'Escenario', value: this.battleResult.stage || 'Ken Stage' },
            { label: 'Total de Golpes', value: (this.battleResult.totalHits || 0).toString() }
        ];

        stats.forEach(stat => {
            const statElement = document.createElement('div');
            statElement.style.cssText = `
                padding: 10px;
                background: rgba(0,0,0,0.3);
                border-radius: 8px;
            `;
            statElement.innerHTML = `
                <div style="font-size: 1.2rem; font-weight: bold; color: #fff;">${stat.value}</div>
                <div style="font-size: 0.9rem; color: #bbb; margin-top: 5px;">${stat.label}</div>
            `;
            statsGrid.appendChild(statElement);
        });

        container.appendChild(title);
        container.appendChild(statsGrid);

        return container;
    }

    createActionButtons() {
        const container = document.createElement('div');
        container.style.cssText = `
            display: flex;
            gap: 20px;
            margin-top: 40px;
            flex-wrap: wrap;
            justify-content: center;
        `;

        // Botón Jugar de Nuevo
        const playAgainBtn = this.createButton(
            'JUGAR DE NUEVO',
            '#2ecc71',
            () => {
                this.cleanup();
                if (this.onPlayAgain) this.onPlayAgain();
            }
        );

        // Botón Menú Principal
        const mainMenuBtn = this.createButton(
            'MENÚ PRINCIPAL',
            '#3498db',
            () => {
                this.cleanup();
                if (this.onMainMenu) this.onMainMenu();
            }
        );

        // Botón Salir
        const exitBtn = this.createButton(
            'SALIR',
            '#e74c3c',
            () => {
                if (confirm('¿Seguro que quieres salir del juego?')) {
                    window.close();
                }
            }
        );

        container.appendChild(playAgainBtn);
        container.appendChild(mainMenuBtn);
        container.appendChild(exitBtn);

        return container;
    }

    createButton(text, color, onClick) {
        const button = document.createElement('button');
        button.textContent = text;
        button.style.cssText = `
            padding: 15px 30px;
            font-size: 1.1rem;
            background: ${color};
            color: white;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.3s ease;
            box-shadow: 0 4px 15px rgba(0,0,0,0.3);
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 1px;
        `;

        button.onmouseenter = () => {
            button.style.transform = 'translateY(-3px) scale(1.05)';
            button.style.boxShadow = '0 6px 20px rgba(0,0,0,0.4)';
        };

        button.onmouseleave = () => {
            button.style.transform = 'translateY(0) scale(1)';
            button.style.boxShadow = '0 4px 15px rgba(0,0,0,0.3)';
        };

        button.onclick = onClick;

        return button;
    }

    formatDuration(seconds) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = Math.floor(seconds % 60);
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    }

    addAnimationStyles() {
        if (document.getElementById('gameOverStyles')) return;

        const style = document.createElement('style');
        style.id = 'gameOverStyles';
        style.textContent = `
            @keyframes scaleIn {
                0% {
                    transform: scale(0) rotate(180deg);
                    opacity: 0;
                }
                50% {
                    transform: scale(1.1) rotate(0deg);
                }
                100% {
                    transform: scale(1) rotate(0deg);
                    opacity: 1;
                }
            }

            @keyframes glow {
                0% {
                    text-shadow: 
                        0 0 10px #ff6b6b,
                        0 0 20px #ff6b6b,
                        0 0 30px #ff6b6b;
                }
                100% {
                    text-shadow: 
                        0 0 15px #ff6b6b,
                        0 0 25px #ff6b6b,
                        0 0 35px #ff6b6b,
                        0 0 45px #ff4757;
                }
            }
        `;
        document.head.appendChild(style);
    }

    cleanup() {
        // Limpiar timeout
        if (this.autoTimeout) {
            clearTimeout(this.autoTimeout);
            this.autoTimeout = null;
        }

        // Limpiar animaciones
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }

        // Remover estilos
        const styles = document.getElementById('gameOverStyles');
        if (styles) {
            styles.remove();
        }
    }
}