/**
 * HUD - Heads Up Display para el juego de peleas
 * Sección 9 del Documento Maestro
 */
export default class HUD {
    constructor(renderer) {
        this.renderer = renderer;
        this.canvas = renderer.canvas;
        this.ctx = renderer.ctx;
    }

    /**
     * Método render - interfaz compatible con BattleScene
     * @param {Array} characters - Array de personajes
     * @param {Object} gameState - Estado del juego
     */
    render(characters, gameState) {
        // Crear gameState compatible si no se proporciona uno
        const hudGameState = gameState || {
            characters: characters,
            timer: 90, // valor por defecto
            status: 'playing'
        };
        
        // Asegurar que gameState tiene los personajes
        if (characters && characters.length >= 2) {
            hudGameState.characters = characters;
        }
        
        // Llamar al método draw original
        this.draw(hudGameState);
    }

    draw(gameState) {
        if (!gameState || !gameState.characters || gameState.characters.length < 2) {
            return;
        }

        const p1 = gameState.characters[0];
        const p2 = gameState.characters[1];

        // Dibujar barras de vida
        this.drawHealthBars(p1, p2);
        
        // Dibujar barras de súper medidor
        this.drawSuperMeters(p1, p2);
        
        // Dibujar timer de la ronda
        this.drawTimer(gameState.timer);
        
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
        const y = 40;
        
        // Color del timer basado en el tiempo restante
        let timerColor = '#ffffff';
        if (timeLeft <= 10) {
            timerColor = '#ff0000'; // Rojo cuando queda poco tiempo
        } else if (timeLeft <= 30) {
            timerColor = '#ffaa00'; // Naranja cuando queda tiempo moderado
        }
        
        this.ctx.fillStyle = timerColor;
        this.ctx.font = 'bold 36px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(timeLeft.toString(), x, y);
        
        // Sombra del texto
        this.ctx.fillStyle = '#000000';
        this.ctx.fillText(timeLeft.toString(), x + 2, y + 2);
        this.ctx.fillStyle = timerColor;
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

    drawStatusIndicators(gameState) {
        // Indicadores adicionales según el estado del juego
        if (gameState.status === 'paused') {
            this.drawPauseIndicator();
        } else if (gameState.status === 'gameOver') {
            this.drawGameOverIndicator();
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

    drawGameOverIndicator() {
        this.ctx.save();
        
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