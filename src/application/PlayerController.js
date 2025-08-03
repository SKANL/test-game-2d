/**
 * PlayerController - Controlador genérico para jugadores
 * Elimina duplicación entre P1 y P2 siguiendo principios SOLID
 * Sección 7 del Documento Maestro
 */
export default class PlayerController {
    constructor(playerIndex, characterObj, inputManager, audioManager) {
        this.playerIndex = playerIndex; // 1 o 2
        this.playerId = `p${playerIndex}`; // 'p1' o 'p2'
        this.characterObj = characterObj;
        this.inputManager = inputManager;
        this.audioManager = audioManager;
        
        // Estado de control
        this.isAI = false;
        this.aiController = null;
    }

    /**
     * Configurar como jugador controlado por IA
     */
    setAIController(aiController) {
        this.isAI = true;
        this.aiController = aiController;
    }

    /**
     * Procesar input del jugador (humano o IA)
     */
    processInput(opponent) {
        if (!this.characterObj || !opponent) return;

        if (this.isAI) {
            this.processAIInput(opponent);
        } else {
            this.processHumanInput(opponent);
        }

        // Forzar orientación después de cada input
        this.updateOrientation(opponent);
    }

    /**
     * Procesar input humano
     */
    processHumanInput(opponent) {
        // Verificar secuencias especiales primero (hadoken)
        const hadokenSequence = ['down', 'forward', 'punch'];
        if (this.inputManager.checkSequence(hadokenSequence, this.playerIndex - 1)) {
            if (this.characterObj.handleSpecialMove('hadoken')) {
                // Crear proyectil hadoken usando callback
                const direction = this.characterObj.isFacingRight ? 1 : -1;
                this.onCreateProjectile?.('hadoken', this.playerId, this.characterObj.position, direction);
                this.audioManager.playSound('hadoken');
            }
            return;
        }

        // Verificar secuencias especiales para P2 (Control para special)
        if (this.playerIndex === 2 && this.inputManager.isActionPressed(this.playerId, 'special')) {
            if (this.characterObj.handleSpecialMove('hadoken')) {
                const direction = this.characterObj.isFacingRight ? 1 : -1;
                this.onCreateProjectile?.('hadoken', this.playerId, this.characterObj.position, direction);
                this.audioManager.playSound('hadoken');
            }
            return;
        }

        // Verificar salto
        if (this.inputManager.isActionPressed(this.playerId, 'up')) {
            this.characterObj.performJump();
            return;
        }

        // Verificar ataques
        if (this.inputManager.isActionPressed(this.playerId, 'punch')) {
            this.characterObj.performAttack('lightPunch');
            return;
        }

        // Verificar movimiento
        if (this.inputManager.isActionPressed(this.playerId, 'right')) {
            this.characterObj.moveForward();
            return;
        }

        if (this.inputManager.isActionPressed(this.playerId, 'left')) {
            this.characterObj.moveBackward();
            return;
        }

        // Si no hay input, detener movimiento
        this.characterObj.stopMovement();
    }

    /**
     * Método principal de actualización del controlador
     * Interfaz unificada requerida por BattleScene
     */
    update(deltaTime, opponent) {
        // Procesar input según el tipo de controlador
        if (this.isAI) {
            this.processAIInput(opponent);
        } else {
            this.processInput(opponent);
        }
        
        // Actualizar orientación
        this.updateOrientation(opponent);
    }

    /**
     * Procesar input de IA
     */
    processAIInput(opponent) {
        if (!this.aiController) return;

        // IA actualiza el character object directamente
        this.aiController.update(this.characterObj, opponent);
    }

    /**
     * Actualizar orientación del personaje
     */
    updateOrientation(opponent) {
        if (!this.characterObj || !opponent) return;

        // El personaje siempre mira hacia su oponente
        if (opponent.position.x > this.characterObj.position.x) {
            this.characterObj.isFacingRight = true;
        } else {
            this.characterObj.isFacingRight = false;
        }
    }

    /**
     * Configurar callback para creación de proyectiles
     */
    setProjectileCallback(callback) {
        this.onCreateProjectile = callback;
    }

    /**
     * Obtener datos del personaje para rendering
     */
    getCharacterData() {
        return this.characterObj;
    }

    /**
     * Verificar si el personaje está en una animación no interrumpible
     */
    isInUninterruptibleAnimation() {
        if (!this.characterObj) return false;
        
        const uninterruptibleStates = [
            'lightPunch', 'hadoken', 'jump', 'knockout'
        ];
        
        return uninterruptibleStates.includes(this.characterObj.state);
    }
}
