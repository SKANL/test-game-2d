/**
 * Character - Entidad de dominio REFACTORIZADA v2.0
 * PRINCIPIOS SOLID: SRP - Solo lógica de personaje
 * ARQUITECTURA LIMPIA: Sin dependencias externas
 * ELIMINADO: Propiedades duplicadas, métodos redundantes
 */
export default class Character {
    constructor(id, name, position, health, superMeter, characterConfig = null) {
        // Propiedades básicas del personaje (SOLID - SRP)
        this.id = id;
        this.name = name;
        this.position = position; // { x: number, y: number }
        this.health = health;
        this.maxHealth = health;
        this.superMeter = superMeter;
        this.maxSuperMeter = 100;
        
        // Estado actual del personaje
        this.state = 'idle';
        this.velocity = { x: 0, y: 0 };
        this.isGrounded = true;
        this.isFlipped = false;
        this.isFacingRight = true; // Para compatibilidad con rendering
        
        // Control de animaciones (ELIMINADA DUPLICACIÓN)
        this.currentFrameIndex = 0;
        this.frameTimer = 0;
        this.attackHasHit = false;
        
        // Configuración del personaje (inyección de dependencia)
        this.config = characterConfig || this.getDefaultConfig();
        this.animations = this.config.animations || {};
        this.specialMoves = this.config.specialMoves || [];
        this.superAttacks = this.config.superAttacks || [];
        this.stats = this.config.stats || this.getDefaultStats();
        
        // Queue de inputs para AI (SOLID - ISP)
        this.inputQueue = [];
    }

    /**
     * Configuración por defecto (SOLID - LSP)
     */
    getDefaultConfig() {
        return {
            animations: {
                idle: {
                    frames: [{ x: 0, y: 0, width: 64, height: 96, type: 'active', duration: 12 }],
                    frameRate: 8,
                    loop: true
                }
            },
            specialMoves: [],
            superAttacks: []
        };
    }

    /**
     * Estadísticas por defecto (SOLID - LSP)
     */
    getDefaultStats() {
        return {
            speed: 80,
            jumpForce: -400,
            gravity: 800,
            superMeterGainOnHit: 10,
            superMeterGainOnBlock: 5,
            superMeterGainOnTakeDamage: 7
        };
    }

    /**
     * Actualización principal del personaje (SOLID - SRP)
     */
    update(deltaTime, opponent = null, input = null) {
        // 1. Procesar entrada AI si existe
        this.processAIInput();

        // 2. Aplicar física del personaje
        this.applyPhysics(deltaTime);

        // 3. Procesar animación y frame data
        this.processAnimation(deltaTime);

        // 4. Actualizar orientación basada en oponente
        if (opponent) {
            this.updateFacingDirection(opponent);
        }
    }

    /**
     * Procesar input de AI (SOLID - SRP)
     */
    processAIInput() {
        if (this.inputQueue.length > 0) {
            const nextInput = this.inputQueue.shift();
            this.processInput(nextInput);
        }
    }

    /**
     * Actualizar dirección de enfrentamiento (SOLID - SRP)
     */
    updateFacingDirection(opponent) {
        this.isFacingRight = opponent.position.x > this.position.x;
        this.isFlipped = !this.isFacingRight;
    }

    /**
     * Aplicar física del personaje (SOLID - SRP)
     */
    applyPhysics(deltaTime) {
        // Constantes de física
        const GROUND_Y = 300;
        const FRICTION = 0.95;
        const MIN_VELOCITY = 0.1;
        
        // Aplicar gravedad si no está en el suelo
        if (!this.isGrounded) {
            this.velocity.y += this.stats.gravity * deltaTime;
        }

        // Actualizar posición
        this.position.x += this.velocity.x * deltaTime;
        this.position.y += this.velocity.y * deltaTime;

        // Verificar colisión con el suelo
        this.handleGroundCollision(GROUND_Y);
        
        // Verificar límites horizontales de pantalla
        this.handleScreenBounds();
        
        // Aplicar fricción al movimiento horizontal
        this.velocity.x *= FRICTION;
        if (Math.abs(this.velocity.x) < MIN_VELOCITY) {
            this.velocity.x = 0;
        }
    }

    /**
     * Manejar colisión con el suelo (SOLID - SRP)
     */
    handleGroundCollision(groundY) {
        if (this.position.y >= groundY) {
            this.position.y = groundY;
            this.isGrounded = true;
            this.velocity.y = 0;
            
            // Si estaba saltando y toca el suelo, volver a idle
            if (this.state === 'jump') {
                this.changeState('idle');
            }
        } else {
            this.isGrounded = false;
        }
    }

    /**
     * Manejar límites de pantalla (SOLID - SRP)
     */
    handleScreenBounds() {
        const canvas = document.getElementById('gameCanvas');
        if (!canvas) return;
        
        const minX = 0;
        const maxX = canvas.width - 128; // Ancho aproximado del personaje escalado
        
        if (this.position.x < minX) {
            this.position.x = minX;
            this.velocity.x = 0;
        } else if (this.position.x > maxX) {
            this.position.x = maxX;
            this.velocity.x = 0;
        }
    }

    /**
     * Procesar animación y frame data (SOLID - SRP)
     */
    processAnimation(deltaTime) {
        const anim = this.animations[this.state];
        if (!anim || !anim.frames || anim.frames.length === 0) return;

        const frame = anim.frames[this.currentFrameIndex];
        if (!frame) return;

        // Incrementar frame timer
        this.frameTimer += deltaTime;

        // Procesar frame data según tipo
        this.processFrameData(frame);

        // Avanzar frame si es tiempo
        this.advanceFrameIfNeeded(anim);
    }

    /**
     * Procesar datos del frame actual (SOLID - SRP)
     */
    processFrameData(frame) {
        if (frame.type === 'active' && !this.attackHasHit) {
            this.activateHitbox(frame);
        }
    }

    /**
     * Avanzar frame de animación si es necesario (SOLID - SRP)
     */
    advanceFrameIfNeeded(anim) {
        // Calcular duración del frame en segundos
        const frameRate = anim.frameRate || 10;
        const frameDuration = anim.frames[this.currentFrameIndex].duration || 1;
        const timePerFrame = frameDuration / frameRate;

        // Avanzar frame si es tiempo
        if (this.frameTimer >= timePerFrame) {
            this.frameTimer = 0;
            this.currentFrameIndex++;

            if (this.currentFrameIndex >= anim.frames.length) {
                this.handleAnimationEnd(anim);
            }
        }
    }

    /**
     * Manejar fin de animación (SOLID - SRP)
     */
    handleAnimationEnd(anim) {
        if (anim.loop) {
            this.currentFrameIndex = 0; // Reiniciar animación
        } else {
            this.currentFrameIndex = 0;
            this.attackHasHit = false;
            this.changeState(anim.onEnd || 'idle');
        }
    }

    /**
     * Cambiar estado del personaje (SOLID - SRP)
     */
    changeState(newState) {
        if (this.state !== newState) {
            this.state = newState;
            this.currentFrameIndex = 0;
            this.frameTimer = 0;
        }
    }

    /**
     * Activar hitbox (placeholder para lógica de colisión)
     */
    activateHitbox(frame) {
        if (frame.hitbox && !this.attackHasHit) {
            // Esto será manejado por el sistema de colisiones en la capa de aplicación
            console.log(`${this.name} activa hitbox:`, frame.hitbox);
        }
    }

    /**
     * Procesar input simple (SOLID - SRP)
     */
    processInput(inputAction) {
        switch (inputAction) {
            case 'forward':
                this.moveForward();
                break;
            case 'back':
                this.moveBackward();
                break;
            case 'attack1':
                this.performAttack('lightPunch');
                break;
            case 'jump':
                this.performJump();
                break;
            case 'stop':
                this.stopMovement();
                break;
        }
    }

    /**
     * Mover hacia adelante (SOLID - SRP)
     */
    moveForward() {
        if (this.canMove()) {
            this.velocity.x = this.stats.speed;
            this.changeState('walkForward');
        }
    }

    /**
     * Mover hacia atrás (SOLID - SRP)
     */
    moveBackward() {
        if (this.canMove()) {
            this.velocity.x = -this.stats.speed;
            this.changeState('walkBackward');
        }
    }

    /**
     * Realizar ataque (SOLID - SRP)
     */
    performAttack(attackType = 'lightPunch') {
        if (this.canAttack()) {
            this.velocity.x = 0; // Detener movimiento al atacar
            this.attackHasHit = false;
            this.changeState(attackType);
            return true;
        }
        return false;
    }

    /**
     * Realizar salto (SOLID - SRP)
     */
    performJump() {
        if (this.canJump()) {
            this.velocity.y = this.stats.jumpForce;
            this.velocity.x = 0; // Detener movimiento horizontal al saltar
            this.isGrounded = false;
            this.changeState('jump');
            return true;
        }
        return false;
    }

    /**
     * Detener movimiento (SOLID - SRP)
     */
    stopMovement() {
        if (this.canMove()) {
            this.velocity.x = 0;
            this.changeState('idle');
        }
    }

    /**
     * Verificar si puede moverse (SOLID - SRP)
     */
    canMove() {
        const restrictedStates = ['lightPunch', 'hadoken', 'jump', 'knockedOut'];
        return !restrictedStates.includes(this.state);
    }

    /**
     * Verificar si puede atacar (SOLID - SRP)
     */
    canAttack() {
        const restrictedStates = ['lightPunch', 'hadoken', 'jump', 'knockedOut'];
        return !restrictedStates.includes(this.state);
    }

    /**
     * Verificar si puede saltar (SOLID - SRP)
     */
    canJump() {
        return this.isGrounded && this.state !== 'jump' && this.state !== 'knockedOut';
    }

    /**
     * Agregar input a la cola para AI (SOLID - ISP)
     */
    queueInput(action) {
        this.inputQueue.push(action);
    }

    /**
     * Recibir daño (SOLID - SRP)
     */
    takeDamage(amount) {
        this.health = Math.max(0, this.health - amount);
        
        // Ganar super meter al recibir daño
        this.gainSuperMeter(this.stats.superMeterGainOnTakeDamage);
        
        // Cambiar a estado de knockdown si la salud llega a 0
        if (this.health <= 0) {
            this.changeState('knockedOut');
        }
        
        return this.health <= 0; // Retorna true si fue KO
    }

    /**
     * Ganar medidor de súper (SOLID - SRP)
     */
    gainSuperMeter(amount) {
        this.superMeter = Math.min(this.maxSuperMeter, this.superMeter + amount);
    }

    /**
     * Verificar si puede usar súper ataque (SOLID - SRP)
     */
    canUseSuperAttack(cost = 100) {
        return this.superMeter >= cost;
    }

    /**
     * Usar medidor de súper (SOLID - SRP)
     */
    useSuperMeter(amount) {
        if (this.superMeter >= amount) {
            this.superMeter -= amount;
            return true;
        }
        return false;
    }

    /**
     * Resetear personaje a estado inicial (SOLID - SRP)
     */
    reset() {
        this.health = this.maxHealth;
        this.superMeter = 0;
        this.velocity = { x: 0, y: 0 };
        this.isGrounded = true;
        this.attackHasHit = false;
        this.inputQueue = [];
        this.changeState('idle');
    }

    /**
     * Obtener información básica del personaje (SOLID - ISP)
     */
    getInfo() {
        return {
            id: this.id,
            name: this.name,
            health: this.health,
            maxHealth: this.maxHealth,
            superMeter: this.superMeter,
            state: this.state,
            position: { ...this.position },
            isGrounded: this.isGrounded
        };
    }

    /**
     * Serializar estado para rollback netcode (requerido por especificación)
     */
    serialize() {
        return {
            id: this.id,
            name: this.name,
            position: { ...this.position },
            velocity: { ...this.velocity },
            health: this.health,
            maxHealth: this.maxHealth,
            superMeter: this.superMeter,
            state: this.state,
            currentFrameIndex: this.currentFrameIndex,
            frameTimer: this.frameTimer,
            isGrounded: this.isGrounded,
            isFlipped: this.isFlipped,
            isFacingRight: this.isFacingRight,
            attackHasHit: this.attackHasHit
        };
    }

    /**
     * Deserializar estado desde JSON (requerido por especificación)
     */
    static deserialize(data, characterConfig = null) {
        const character = new Character(
            data.id,
            data.name,
            data.position,
            data.maxHealth,
            data.superMeter,
            characterConfig
        );
        
        // Restaurar estado
        character.health = data.health;
        character.velocity = data.velocity;
        character.state = data.state;
        character.currentFrameIndex = data.currentFrameIndex;
        character.frameTimer = data.frameTimer;
        character.isGrounded = data.isGrounded;
        character.isFlipped = data.isFlipped;
        character.isFacingRight = data.isFacingRight;
        character.attackHasHit = data.attackHasHit;
        
        return character;
    }
}