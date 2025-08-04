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
        this.status = 'playing'; // 'playing', 'paused', 'roundOver', 'gameOver', 'roundStart'
        this.round = 1;
        this.maxRounds = 3; // Mejor de 3 por defecto
        this.scores = { p1: 0, p2: 0 };
        
        // Información del ganador
        this.winner = null; // 'p1', 'p2', 'draw'
        this.winReason = null; // 'ko', 'timeout', 'match'
        this.winnerName = null; // Nombre del personaje ganador
        
        // Estado de la ronda actual
        this.roundStartTime = null;
        this.roundEndTime = null;
        this.roundResult = null; // 'p1_wins', 'p2_wins', 'draw'
        this.isNewRound = true; // Flag para mostrar "ROUND X" al inicio
        
        // Personajes en el juego (ÚNICA FUENTE DE VERDAD)
        this.characters = [];
        
        // Configuración del juego
        this.gameConfig = {
            roundDuration: 99,
            winCondition: 'best-of-3', // 'best-of-3', 'single-round', 'time-attack'
            roundStartDelay: 3, // Segundos de delay antes de empezar la ronda
            roundEndDelay: 3    // Segundos para mostrar resultado de ronda
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
     * Limpiar personajes del estado (SOLID - SRP)
     */
    clearCharacters() {
        console.log(`🧹 Limpiando ${this.characters.length} personajes del GameState`);
        this.characters = [];
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

        // NUEVO: Detectar colisiones y aplicar daño
        this.detectCollisions();

        // Verificar condiciones de victoria
        this.checkVictoryConditions();
    }

    /**
     * Actualizar timer de la ronda (SOLID - SRP)
     */
    updateTimer(deltaTime) {
        if (this.status === 'playing') {
            this.timer -= deltaTime;
            this.timer = Math.max(0, this.timer); // No bajar de 0
        }
    }

    /**
     * Actualizar personajes (SOLID - SRP)
     */
    updateCharacters(deltaTime) {
        // Debug log ocasional para verificar que se está ejecutando
        if (Math.random() < 0.01) {
            console.log(`🎮 GameState.updateCharacters: ${this.characters.length} personajes, deltaTime=${deltaTime.toFixed(4)}s`);
        }
        
        this.characters.forEach((character, index) => {
            const opponent = this.characters[1 - index];
            character.update(deltaTime, opponent);
        });
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
    awardRoundWin(winner, reason = 'ko') {
        if (winner === 'p1') {
            this.scores.p1++;
            this.winner = 'p1';
            this.winnerName = this.characters[0]?.name || 'Player 1';
        } else if (winner === 'p2') {
            this.scores.p2++;
            this.winner = 'p2';
            this.winnerName = this.characters[1]?.name || 'Player 2';
        }
        this.winReason = reason;
        // En caso de empate no se otorgan puntos
    }

    /**
     * Verificar condiciones de victoria (SOLID - SRP)
     */
    /**
     * Verificar condiciones de victoria (SOLID - SRP)
     */
    checkVictoryConditions() {
        // Solo verificar si el juego está en progreso
        if (this.status !== 'playing') return;
        
        // Debug log periódico
        if (Math.random() < 0.02) { // 2% de chance para no saturar los logs
            console.log(`🎯 CheckVictory - Timer: ${this.timer.toFixed(1)}s, P1HP: ${this.characters[0]?.health || 0}, P2HP: ${this.characters[1]?.health || 0}`);
        }
        
        // Verificar tiempo agotado
        this.checkTimeoutConditions();
        
        // Verificar KO
        this.checkKOConditions();
        
        // Verificar victoria del match
        this.checkMatchVictory();
    }

    /**
     * Verificar condiciones de timeout (SOLID - SRP)
     */
    checkTimeoutConditions() {
        if (this.timer <= 0 && this.status === 'playing') {
            console.log('⏰ TIMEOUT DETECTADO - Timer:', this.timer);
            
            if (this.characters.length < 2) return;
            
            const p1 = this.characters[0];
            const p2 = this.characters[1];
            
            console.log(`⏰ Vida P1: ${p1.health}, Vida P2: ${p2.health}`);
            
            if (p1.health > p2.health) {
                this.endRound('p1', 'TIMEOUT');
            } else if (p2.health > p1.health) {
                this.endRound('p2', 'TIMEOUT');
            } else {
                this.endRound('draw', 'TIMEOUT - EMPATE');
            }
        }
    }

    /**
     * Verificar condiciones de KO (SOLID - SRP)
     */
    checkKOConditions() {
        if (this.characters.length < 2 || this.status !== 'playing') return;
        
        const p1 = this.characters[0];
        const p2 = this.characters[1];
        
        // Verificar KO
        if (p1.health <= 0) {
            console.log('💀 KO DETECTADO - P1 derrotado');
            this.endRound('p2', 'KO');
        } else if (p2.health <= 0) {
            console.log('💀 KO DETECTADO - P2 derrotado');
            this.endRound('p1', 'KO');
        }
    }

    /**
     * Verificar victoria del match (SOLID - SRP)
     */
    checkMatchVictory() {
        const roundsToWin = Math.ceil(this.maxRounds / 2);
        
        if (this.scores.p1 >= roundsToWin) {
            console.log('🏆 MATCH TERMINADO - P1 es el ganador del match');
            this.status = 'gameOver';
            this.winner = 'p1';
            this.winnerName = this.characters[0]?.name || 'Player 1';
            this.winReason = 'match';
            console.log('🎉 P1 gana el match');
        } else if (this.scores.p2 >= roundsToWin) {
            console.log('🏆 MATCH TERMINADO - P2 es el ganador del match');
            this.status = 'gameOver';
            this.winner = 'p2';
            this.winnerName = this.characters[1]?.name || 'Player 2';
            this.winReason = 'match';
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
     * Iniciar nueva ronda con countdown visual
     */
    startNewRound() {
        this.isNewRound = true;
        this.roundStartTime = Date.now();
        this.status = 'roundStart';
        this.timer = this.gameConfig.roundDuration;
        
        // Resetear personajes para la nueva ronda
        this.characters.forEach(character => {
            character.reset();
        });
        
        console.log(`🎯 INICIANDO RONDA ${this.round} - Preparación...`);
        
        // Después del delay, cambiar a 'playing'
        setTimeout(() => {
            if (this.status === 'roundStart') {
                this.status = 'playing';
                this.isNewRound = false;
                console.log(`🎮 RONDA ${this.round} - ¡LUCHA!`);
            }
        }, this.gameConfig.roundStartDelay * 1000);
    }

    /**
     * Finalizar ronda con resultado claro
     */
    endRound(winner, reason) {
        this.status = 'roundOver';
        this.roundEndTime = Date.now();
        this.roundResult = winner;
        
        // Actualizar scores
        if (winner === 'p1') {
            this.scores.p1++;
            console.log(`🏆 RONDA ${this.round} - ${this.characters[0]?.name || 'P1'} GANA por ${reason}`);
        } else if (winner === 'p2') {
            this.scores.p2++;
            console.log(`🏆 RONDA ${this.round} - ${this.characters[1]?.name || 'P2'} GANA por ${reason}`);
        } else {
            console.log(`🤝 RONDA ${this.round} - EMPATE por ${reason}`);
        }
        
        // Verificar si el match terminó
        const roundsToWin = Math.ceil(this.maxRounds / 2);
        if (this.scores.p1 >= roundsToWin || this.scores.p2 >= roundsToWin) {
            this.endMatch();
        } else {
            // Preparar siguiente ronda
            setTimeout(() => {
                this.round++;
                this.startNewRound();
            }, this.gameConfig.roundEndDelay * 1000);
        }
    }

    /**
     * Finalizar match completo
     */
    endMatch() {
        this.status = 'gameOver';
        
        if (this.scores.p1 > this.scores.p2) {
            this.winner = 'p1';
            this.winnerName = this.characters[0]?.name || 'Player 1';
        } else if (this.scores.p2 > this.scores.p1) {
            this.winner = 'p2';
            this.winnerName = this.characters[1]?.name || 'Player 2';
        } else {
            this.winner = 'draw';
            this.winnerName = 'EMPATE';
        }
        
        this.winReason = 'match';
        console.log(`🎉 MATCH TERMINADO - ${this.winnerName} gana el match ${this.scores.p1}-${this.scores.p2}`);
    }

    /**
     * Obtener texto descriptivo del estado actual
     */
    getStatusText() {
        switch (this.status) {
            case 'roundStart':
                return `RONDA ${this.round}`;
            case 'playing':
                return 'LUCHA';
            case 'roundOver':
                if (this.roundResult === 'p1') return `${this.characters[0]?.name || 'P1'} GANA LA RONDA`;
                if (this.roundResult === 'p2') return `${this.characters[1]?.name || 'P2'} GANA LA RONDA`;
                return 'RONDA EMPATADA';
            case 'gameOver':
                return `${this.winnerName} GANA EL MATCH`;
            case 'paused':
                return 'PAUSADO';
            default:
                return '';
        }
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

    /**
     * Detectar colisiones entre personajes (SOLID - SRP)
     */
    detectCollisions() {
        if (this.characters.length < 2) return;

        const [p1, p2] = this.characters;

        // Verificar colisiones de hitboxes activos
        this.checkAttackCollisions(p1, p2);
        this.checkAttackCollisions(p2, p1);
    }

    /**
     * Verificar colisiones de ataque entre attacker y defender (SOLID - SRP)
     */
    checkAttackCollisions(attacker, defender) {
        // Solo verificar si el atacante está en un estado de ataque
        if (!this.isAttackingState(attacker.state)) return;

        // Obtener hitbox del frame actual
        const hitbox = this.getActiveHitbox(attacker);
        if (!hitbox) return;

        // Verificar si ya golpeó en este ataque
        if (attacker.attackHasHit) return;

        // Calcular posición real del hitbox
        const hitboxX = attacker.position.x + (attacker.isFlipped ? -hitbox.x - hitbox.w : hitbox.x);
        const hitboxY = attacker.position.y + hitbox.y;

        // Verificar colisión con el defensor
        if (this.isColliding(
            hitboxX, hitboxY, hitbox.w, hitbox.h,
            defender.position.x, defender.position.y, 64, 96 // Tamaño aproximado del personaje
        )) {
            this.applyHit(attacker, defender, hitbox);
        }
    }

    /**
     * Verificar si un estado es de ataque (SOLID - SRP)
     */
    isAttackingState(state) {
        return ['lightPunch', 'heavyPunch', 'hadoken', 'shoryuken'].includes(state);
    }

    /**
     * Obtener hitbox activo del personaje (SOLID - SRP)
     */
    getActiveHitbox(character) {
        const animation = character.animations[character.state];
        if (!animation || !animation.frames) return null;

        const frame = animation.frames[character.currentFrameIndex];
        if (!frame || frame.type !== 'active') return null;

        return frame.hitbox || null;
    }

    /**
     * Verificar colisión entre dos rectángulos (SOLID - SRP)
     */
    isColliding(x1, y1, w1, h1, x2, y2, w2, h2) {
        return !(x1 > x2 + w2 || x1 + w1 < x2 || y1 > y2 + h2 || y1 + h1 < y2);
    }

    /**
     * Aplicar golpe entre atacante y defensor (SOLID - SRP)
     */
    applyHit(attacker, defender, hitbox) {
        console.log(`💥 ${attacker.name} golpea a ${defender.name} por ${hitbox.damage} daño!`);

        // Aplicar daño
        defender.health -= hitbox.damage;
        if (defender.health < 0) defender.health = 0;

        // Marcar que el ataque ya golpeó
        attacker.attackHasHit = true;

        // Incrementar super meter
        attacker.superMeter += attacker.stats.superMeterGainOnHit || 10;
        defender.superMeter += attacker.stats.superMeterGainOnTakeDamage || 7;

        // Limitar super meter al máximo
        if (attacker.superMeter > attacker.maxSuperMeter) attacker.superMeter = attacker.maxSuperMeter;
        if (defender.superMeter > defender.maxSuperMeter) defender.superMeter = defender.maxSuperMeter;

        // Efectos visuales y sonoros (si están disponibles)
        this.triggerHitEffects(defender.position.x, defender.position.y);

        console.log(`💖 ${defender.name} vida: ${defender.health}/${defender.maxHealth}`);
    }

    /**
     * Activar efectos visuales de golpe (SOLID - SRP)
     */
    triggerHitEffects(x, y) {
        // Esto se puede expandir con efectos más elaborados
        if (typeof window !== 'undefined' && window.juiceManager) {
            window.juiceManager.triggerHitStop(3);
            window.juiceManager.triggerScreenShake(8, 150);
            window.juiceManager.createParticles({
                x: x + 32, y: y + 48,
                count: 6,
                color: 'orange',
                life: 20,
                speed: 120
            });
        }
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