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