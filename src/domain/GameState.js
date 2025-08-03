/**
 * GameState - Estado del juego REFACTORIZADO v2.0
 * PRINCIPIOS SOLID: SRP - Solo gestión del estado del dominio
 * ARQUITECTURA LIMPIA: Sin dependencias externas
 * ELIMINADO: Lógica duplicada, responsabilidades mezcladas
 * ENFOQUE: Puro estado del dominio, sin lógica de presentación
 */
class GameState {
    constructor() {
        // Estado de la partida (SOLID - SRP)
        this.timer = 99;
        this.status = 'playing'; // 'playing', 'paused', 'roundOver', 'gameOver'
        this.round = 1;
        this.maxRounds = 3;
        this.scores = { p1: 0, p2: 0 };
        
        // Personajes en el juego (ÚNICA FUENTE DE VERDAD)
        this.characters = [];
        
        // Configuración del juego
        this.gameConfig = {
            roundDuration: 99,
            winCondition: 'best-of-3' // 'best-of-3', 'single-round', 'time-attack'
        };
    }

    /**
     * Agregar personaje al estado (SOLID - LSP)
     */
    addCharacter(character) {
        if (!character) {
            console.warn('⚠️ Intento de agregar personaje nulo o indefinido');
            return false;
        }
        
        if (this.characters.length >= 2) {
            console.warn('⚠️ No se pueden agregar más de 2 personajes');
            return false;
        }
        
        this.characters.push(character);
        console.log(`✅ Personaje ${character.name} agregado al GameState`);
        return true;
    }

    /**
     * Actualizar estado del juego (SOLID - SRP)
     */
    update(deltaTime) {
        // Solo actualizar si el juego está en progreso
        if (this.status !== 'playing') return;

        // Actualizar timer de la ronda
        this.updateTimer(deltaTime);

        // Actualizar personajes
        this.updateCharacters(deltaTime);

        // Verificar condiciones de victoria
        this.checkVictoryConditions();
    }

    /**
     * Actualizar timer de la ronda (SOLID - SRP)
     */
    updateTimer(deltaTime) {
        this.timer -= deltaTime;
        if (this.timer <= 0) {
            this.handleTimeOut();
        }
    }

    /**
     * Actualizar personajes (SOLID - SRP)
     */
    updateCharacters(deltaTime) {
        this.characters.forEach((character, index) => {
            const opponent = this.characters[1 - index];
            character.update(deltaTime, opponent);
        });
    }

    /**
     * Manejar tiempo agotado (SOLID - SRP)
     */
    handleTimeOut() {
        this.timer = 0;
        this.status = 'roundOver';
        
        // Determinar ganador por vida restante
        const winner = this.determineWinnerByHealth();
        this.awardRoundWin(winner);
        
        console.log(`⏰ Tiempo agotado - Ganador: ${winner || 'Empate'}`);
    }

    /**
     * Determinar ganador por salud (SOLID - SRP)
     */
    determineWinnerByHealth() {
        if (this.characters.length < 2) return null;
        
        const p1Health = this.characters[0].health;
        const p2Health = this.characters[1].health;
        
        if (p1Health > p2Health) return 'p1';
        if (p2Health > p1Health) return 'p2';
        return null; // Empate
    }

    /**
     * Otorgar victoria de ronda (SOLID - SRP)
     */
    awardRoundWin(winner) {
        if (winner === 'p1') {
            this.scores.p1++;
        } else if (winner === 'p2') {
            this.scores.p2++;
        }
        // En caso de empate no se otorgan puntos
    }

    /**
     * Verificar condiciones de victoria (SOLID - SRP)
     */
    checkVictoryConditions() {
        // Verificar KO
        this.checkKOConditions();
        
        // Verificar victoria del match
        this.checkMatchVictory();
    }

    /**
     * Verificar condiciones de KO (SOLID - SRP)
     */
    checkKOConditions() {
        if (this.characters.length < 2) return;
        
        const p1 = this.characters[0];
        const p2 = this.characters[1];

        if (p1.health <= 0) {
            this.awardRoundWin('p2');
            this.status = 'roundOver';
            console.log('🏆 P2 gana por KO');
        } else if (p2.health <= 0) {
            this.awardRoundWin('p1');
            this.status = 'roundOver';
            console.log('🏆 P1 gana por KO');
        }
    }

    /**
     * Verificar victoria del match (SOLID - SRP)
     */
    checkMatchVictory() {
        const roundsToWin = Math.ceil(this.maxRounds / 2);
        
        if (this.scores.p1 >= roundsToWin) {
            this.status = 'gameOver';
            console.log('🎉 P1 gana el match');
        } else if (this.scores.p2 >= roundsToWin) {
            this.status = 'gameOver';
            console.log('🎉 P2 gana el match');
        }
    }

    /**
     * Reiniciar ronda (SOLID - SRP)
     */
    resetRound() {
        this.timer = this.gameConfig.roundDuration;
        this.status = 'playing';
        this.round++;
        
        // Reiniciar salud de personajes
        this.characters.forEach(character => {
            character.health = character.maxHealth;
            character.superMeter = 0;
            character.changeState('idle');
        });
        
        console.log(`🔄 Nueva ronda ${this.round} iniciada`);
    }

    /**
     * Reiniciar match completo (SOLID - SRP)
     */
    resetMatch() {
        this.timer = this.gameConfig.roundDuration;
        this.status = 'playing';
        this.round = 1;
        this.scores = { p1: 0, p2: 0 };
        
        // Reiniciar personajes completamente
        this.characters.forEach(character => {
            character.reset();
        });
        
        console.log('🆕 Match reiniciado');
    }

    /**
     * Pausar juego (SOLID - SRP)
     */
    pauseGame() {
        if (this.status === 'playing') {
            this.status = 'paused';
            console.log('⏸️ Juego pausado');
        }
    }

    /**
     * Reanudar juego (SOLID - SRP)
     */
    resumeGame() {
        if (this.status === 'paused') {
            this.status = 'playing';
            console.log('▶️ Juego reanudado');
        }
    }

    /**
     * Obtener ganador del match (SOLID - ISP)
     */
    getWinner() {
        if (this.status !== 'gameOver') return null;
        
        if (this.scores.p1 > this.scores.p2) return 'p1';
        if (this.scores.p2 > this.scores.p1) return 'p2';
        return 'draw';
    }

    /**
     * Obtener estado resumido (SOLID - ISP)
     */
    getState() {
        return {
            timer: this.timer,
            status: this.status,
            round: this.round,
            maxRounds: this.maxRounds,
            scores: { ...this.scores },
            characterCount: this.characters.length
        };
    }

    /**
     * Verificar si el juego está activo (SOLID - ISP)
     */
    isActive() {
        return this.status === 'playing';
    }

    /**
     * Verificar si la ronda ha terminado (SOLID - ISP)
     */
    isRoundOver() {
        return this.status === 'roundOver';
    }

    /**
     * Verificar si el match ha terminado (SOLID - ISP)
     */
    isGameOver() {
        return this.status === 'gameOver';
    }

    serialize() {
        return JSON.stringify({
            timer: this.timer,
            status: this.status,
            round: this.round,
            maxRounds: this.maxRounds,
            scores: { ...this.scores },
            characters: this.characters.map(c => ({
                id: c.id,
                name: c.name,
                position: { ...c.position },
                velocity: { ...c.velocity },
                health: c.health,
                maxHealth: c.maxHealth,
                superMeter: c.superMeter,
                state: c.state,
                currentFrameIndex: c.currentFrameIndex,
                frameTimer: c.frameTimer,
                isGrounded: c.isGrounded,
                isFlipped: c.isFlipped,
                isFacingRight: c.isFacingRight,
                attackHasHit: c.attackHasHit
            }))
        });
    }

    static deserialize(jsonData) {
        const data = typeof jsonData === 'string' ? JSON.parse(jsonData) : jsonData;
        const gs = new GameState();
        
        gs.timer = data.timer || 99;
        gs.status = data.status || 'playing';
        gs.round = data.round || 1;
        gs.maxRounds = data.maxRounds || 3;
        gs.scores = data.scores || { p1: 0, p2: 0 };
        gs.characters = (data.characters || []).map(c => Object.assign({}, c));
        
        return gs;
    }
}

export default GameState;