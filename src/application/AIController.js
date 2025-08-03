/**
 * AIController - Controlador de IA MEJORADO v2.0
 * CARACTERÍSTICAS: IA agresiva, persecución fluida, combos inteligentes
 * PRINCIPIOS SOLID: SRP - Solo lógica de IA
 */
class AIController {
    constructor(character, difficulty = 'normal', archetype = 'allrounder') {
        this.character = character;
        this.difficulty = difficulty;
        this.archetype = archetype;
        
        // Sistema de decisiones mejorado
        this.decisionTimer = 0;
        this.currentState = 'neutral'; // 'neutral', 'approaching', 'attacking', 'retreating'
        this.lastAction = null;
        this.comboCounter = 0;
        
        // Configuración por dificultad
        this.config = this.getDifficultyConfig();
        
        // Estado de seguimiento del oponente
        this.opponentTracking = {
            lastPosition: { x: 0, y: 0 },
            velocity: { x: 0, y: 0 },
            predictedPosition: { x: 0, y: 0 }
        };
        
        console.log(`🤖 IA Mejorada v2.0 creada para ${character?.id || 'unknown'}, dificultad: ${difficulty}, arquetipo: ${archetype}`);
    }

    getDifficultyConfig() {
        switch (this.difficulty) {
            case 'easy':
                return {
                    reactionTime: 0.4,
                    accuracy: 0.6,
                    aggressiveness: 0.3,
                    predictionSkill: 0.2
                };
            case 'normal':
                return {
                    reactionTime: 0.2,
                    accuracy: 0.8,
                    aggressiveness: 0.6,
                    predictionSkill: 0.5
                };
            case 'hard':
                return {
                    reactionTime: 0.1,
                    accuracy: 0.95,
                    aggressiveness: 0.9,
                    predictionSkill: 0.8
                };
            default:
                return this.getDifficultyConfig();
        }
    }

    update(deltaTime, opponent) {
        if (!this.character || !opponent) {
            console.warn('⚠️ AIController: character u opponent no disponible');
            return;
        }

        // Debug log ocasional
        if (Math.random() < 0.02) {
            const distance = this.getDistanceToOpponent(opponent);
            console.log(`🤖 IA v2.0: state=${this.currentState}, distance=${distance.toFixed(1)}, comboCounter=${this.comboCounter}`);
        }

        // Actualizar seguimiento del oponente
        this.updateOpponentTracking(opponent, deltaTime);
        
        // Actualizar timer de decisión
        this.decisionTimer += deltaTime;
        
        // Tomar decisiones basadas en la configuración de dificultad
        if (this.decisionTimer >= this.config.reactionTime) {
            this.makeIntelligentDecision(opponent);
            this.decisionTimer = 0;
        }
    }

    updateOpponentTracking(opponent, deltaTime) {
        // Calcular velocidad del oponente
        const dx = opponent.position.x - this.opponentTracking.lastPosition.x;
        const dy = opponent.position.y - this.opponentTracking.lastPosition.y;
        
        this.opponentTracking.velocity.x = dx / deltaTime;
        this.opponentTracking.velocity.y = dy / deltaTime;
        
        // Predecir posición futura del oponente
        const predictionTime = this.config.predictionSkill * 0.5; // Hasta 0.4s en el futuro
        this.opponentTracking.predictedPosition.x = opponent.position.x + (this.opponentTracking.velocity.x * predictionTime);
        this.opponentTracking.predictedPosition.y = opponent.position.y + (this.opponentTracking.velocity.y * predictionTime);
        
        // Actualizar última posición
        this.opponentTracking.lastPosition.x = opponent.position.x;
        this.opponentTracking.lastPosition.y = opponent.position.y;
    }

    makeIntelligentDecision(opponent) {
        const distance = this.getDistanceToOpponent(opponent);
        const isOpponentVulnerable = this.isOpponentVulnerable(opponent);
        const canCombo = this.canContinueCombo();
        
        // Resetear contador de combo si el oponente no está en hit/block stun
        if (!isOpponentVulnerable && this.comboCounter > 0) {
            this.comboCounter = 0;
        }

        // Árbol de decisiones inteligente
        if (canCombo && isOpponentVulnerable) {
            this.executeComboContinuation(opponent);
        } else if (this.shouldAttack(opponent, distance)) {
            this.executeOptimalAttack(opponent, distance);
        } else if (this.shouldApproach(opponent, distance)) {
            this.executeApproachStrategy(opponent);
        } else if (this.shouldRetreat(opponent, distance)) {
            this.executeRetreatStrategy(opponent);
        } else {
            this.executeNeutralStrategy(opponent, distance);
        }
    }

    getDistanceToOpponent(opponent) {
        return Math.abs(this.character.position.x - opponent.position.x);
    }

    isOpponentVulnerable(opponent) {
        // Oponente vulnerable si está en recovery, hit stun, o ciertos estados
        const vulnerableStates = ['lightPunch', 'hadoken', 'recovery', 'hitstun', 'blockstun'];
        return vulnerableStates.includes(opponent.state);
    }

    canContinueCombo() {
        return this.comboCounter > 0 && this.comboCounter < 5 && this.lastAction !== 'stop';
    }

    shouldAttack(opponent, distance) {
        const inAttackRange = distance <= 80;
        const opponentRecovering = this.isOpponentVulnerable(opponent);
        const aggressionRoll = Math.random() < this.config.aggressiveness;
        
        return inAttackRange && (opponentRecovering || aggressionRoll);
    }

    shouldApproach(opponent, distance) {
        const tooFar = distance > 120;
        const opponentNotThreatening = !this.isOpponentThreatening(opponent);
        
        return tooFar && opponentNotThreatening;
    }

    shouldRetreat(opponent, distance) {
        const tooClose = distance < 40;
        const lowHealth = this.character.health < this.character.maxHealth * 0.3;
        const opponentThreatening = this.isOpponentThreatening(opponent);
        
        return (tooClose && opponentThreatening) || lowHealth;
    }

    isOpponentThreatening(opponent) {
        // Oponente amenazante si está atacando o en aire (puede atacar)
        const threateningStates = ['lightPunch', 'heavyPunch', 'hadoken', 'jump'];
        return threateningStates.includes(opponent.state);
    }

    executeComboContinuation(opponent) {
        this.currentState = 'attacking';
        this.comboCounter++;
        
        // Alternar entre ataques para crear combos fluidos más variados
        const comboMoves = ['attack1', 'heavyPunch', 'attack1', 'projectile'];
        const moveIndex = this.comboCounter % comboMoves.length;
        const move = comboMoves[moveIndex];
        
        console.log(`🤖 IA continúa combo (${this.comboCounter}): ${move}`);
        this.executeAction(move);
    }

    executeOptimalAttack(opponent, distance) {
        this.currentState = 'attacking';
        this.comboCounter = 1;
        
        let attack;
        
        // Seleccionar ataque basado en distancia y estado del oponente
        if (opponent.state === 'jump') {
            attack = 'antiair';
        } else if (distance > 60) {
            attack = 'projectile';
        } else if (distance < 50 && Math.random() < 0.4) {
            // Usar heavyPunch a corta distancia para más daño
            attack = 'heavyPunch';
        } else {
            attack = 'attack1';
        }
        
        // Aplicar precisión basada en dificultad
        if (Math.random() > this.config.accuracy) {
            attack = 'attack1'; // Ataque fallido/subóptimo
        }
        
        console.log(`🤖 IA ataca (distance=${distance.toFixed(1)}): ${attack}`);
        this.executeAction(attack);
    }

    executeApproachStrategy(opponent) {
        this.currentState = 'approaching';
        
        // Moverse hacia la posición predicha del oponente
        const targetX = this.opponentTracking.predictedPosition.x;
        const myX = this.character.position.x;
        
        let action;
        if (targetX > myX + 20) {
            action = 'forward';
        } else if (targetX < myX - 20) {
            action = 'back';
        } else {
            // Si estamos cerca de la posición predicha, prepararse para atacar
            action = 'stop';
        }
        
        // Ocasionalmente saltar para variar el approach
        if (Math.random() < 0.15 && action === 'forward') {
            action = 'jump';
        }
        
        console.log(`🤖 IA se acerca: ${action} (target=${targetX.toFixed(1)}, my=${myX.toFixed(1)})`);
        this.executeAction(action);
    }

    executeRetreatStrategy(opponent) {
        this.currentState = 'retreating';
        
        // Retroceder del oponente
        const opponentX = opponent.position.x;
        const myX = this.character.position.x;
        
        let action;
        if (opponentX > myX) {
            action = 'back'; // Oponente a la derecha, retroceder hacia la izquierda
        } else {
            action = 'forward'; // Oponente a la izquierda, retroceder hacia la derecha
        }
        
        // Ocasionalmente saltar hacia atrás
        if (Math.random() < 0.2) {
            action = 'jump';
        }
        
        console.log(`🤖 IA se retira: ${action}`);
        this.executeAction(action);
    }

    executeNeutralStrategy(opponent, distance) {
        this.currentState = 'neutral';
        
        // Estrategia neutral: controlar espacio, zoning, o posicionamiento
        const strategies = [];
        
        // Barajar entre diferentes opciones neutrales
        if (distance > 100) {
            strategies.push('forward', 'projectile');
        } else if (distance < 60) {
            strategies.push('back', 'down');
        } else {
            strategies.push('forward', 'back', 'stop');
        }
        
        // Añadir salto ocasional para impredecibilidad
        if (Math.random() < 0.1) {
            strategies.push('jump');
        }
        
        const action = strategies[Math.floor(Math.random() * strategies.length)];
        
        console.log(`🤖 IA neutral (distance=${distance.toFixed(1)}): ${action}`);
        this.executeAction(action);
    }

    executeAction(action) {
        this.lastAction = action;
        
        if (this.character.queueInput) {
            this.character.queueInput(action);
        } else {
            console.warn('⚠️ Character.queueInput no disponible');
        }
    }
}

export default AIController;
