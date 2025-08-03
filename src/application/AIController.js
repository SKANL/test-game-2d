class AIController {
    constructor(difficulty = 'normal', archetype = 'allrounder') {
        this.difficulty = difficulty; // 'easy', 'normal', 'hard'
        this.archetype = archetype;
        this.lastDecisionTime = 0;
        this.decisionDelay = this.getDecisionDelay();
    }

    getDecisionDelay() {
        switch (this.difficulty) {
            case 'easy': return 200 + Math.random() * 300;
            case 'normal': return 100 + Math.random() * 150;
            case 'hard': return 30 + Math.random() * 70;
            default: return 150;
        }
    }

    update(ownCharacter, opponent, gameState) {
        const now = Date.now();
        if (now - this.lastDecisionTime < this.decisionDelay) return;
        this.lastDecisionTime = now;
        this.decisionDelay = this.getDecisionDelay();

        // Recopilación de datos
        const distance = Math.abs(ownCharacter.position.x - opponent.position.x);
        const isOpponentInAir = opponent.state === 'jump' || opponent.state === 'air';
        const isOpponentInRecovery = opponent.state === 'recovery';
        const hasProjectile = ownCharacter.specialMoves && ownCharacter.specialMoves.some(m => m.type === 'projectile');
        const SAFE_PROJECTILE_DISTANCE = 180;
        const CLOSE_COMBAT_RANGE = 60;

        // Árbol de decisiones adaptado por arquetipo
        if (isOpponentInAir && this.canAntiAir(ownCharacter)) {
            this.executeAntiAirMove(ownCharacter);
        } else if (isOpponentInRecovery) {
            this.executePunishCombo(ownCharacter);
        } else if (distance > SAFE_PROJECTILE_DISTANCE && hasProjectile && this.archetype === 'zoner') {
            this.executeProjectileMove(ownCharacter);
        } else if (distance < CLOSE_COMBAT_RANGE) {
            this.executeFastNormalAttack(ownCharacter);
        } else {
            this.executeNeutralGameMovement(ownCharacter);
        }
    }

    canAntiAir(character) {
        // Lógica simple: si tiene un movimiento anti-aéreo
        return character.specialMoves && character.specialMoves.some(m => m.tags && m.tags.includes('antiair'));
    }

    executeAntiAirMove(character) {
        // Ejecutar movimiento anti-aéreo
        character.queueInput && character.queueInput('antiair');
    }

    executePunishCombo(character) {
        character.queueInput && character.queueInput('combo');
    }

    executeProjectileMove(character) {
        character.queueInput && character.queueInput('projectile');
    }

    executeFastNormalAttack(character) {
        character.queueInput && character.queueInput('attack1');
    }

    executeNeutralGameMovement(character) {
        // Movimiento aleatorio: avanzar, retroceder, agacharse
        const moves = ['forward', 'back', 'down'];
        const move = moves[Math.floor(Math.random() * moves.length)];
        character.queueInput && character.queueInput(move);
    }
}

export default AIController;
