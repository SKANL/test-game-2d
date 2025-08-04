/**
 * InputManager - Gestiona las entradas del usuario REFACTORIZADO v2.0
 * PRINCIPIOS SOLID: SRP - Solo gestión de inputs del usuario
 * OCP: Extensible para nuevos tipos de input (gamepad, touch, etc.)
 * ISP: Interfaces específicas para diferentes tipos de input
 * DIP: Depende de abstracciones para eventos del DOM
 * HERENCIA: Extiende BaseManager para funcionalidad común
 */
import BaseManager from '../domain/base/BaseManager.js';

export default class InputManager extends BaseManager {
    constructor(config = {}) {
        super('InputManager', {
            autoStart: true,
            enableCooldowns: true,
            cooldownTime: 300,
            maxBufferLength: 20,
            ...config
        });

        // Estado de las teclas
        this.keys = {};
        
        // Buffers de entrada para cada jugador (para combos y movimientos especiales)
        this.inputBuffer_p1 = [];
        this.inputBuffer_p2 = [];
        
        // Lista de acciones que solo deben ejecutarse una vez por presión
        this.singlePressActions = ['punch', 'kick', 'special', 'super'];
        
        // Estado de las acciones de única presión
        this.actionStates = {};
        
        // Teclas mapeadas para cada acción
        this.keyMap = {
            p1: {
                up: 'w',
                down: 's',
                left: 'a',
                right: 'd',
                punch: ' ', // Barra espaciadora
                kick: 'q',
                special: 'e',
                super: 'r'
            },
            p2: {
                up: 'ArrowUp',
                down: 'ArrowDown',
                left: 'ArrowLeft',
                right: 'ArrowRight',
                punch: 'Enter', // Enter para P2
                kick: 'Shift',  // Shift derecho
                special: 'Control', // Control derecho  
                super: 'Alt'   // Alt derecho
            }
        };
        
        // Estado de bloqueo para evitar repetición continua de acciones
        this.keyLocks = {};
        
        // Cooldowns para acciones
        this.actionCooldowns = {};
        
        // Event handlers (para poder removerlos después)
        this.keydownHandler = null;
        this.keyupHandler = null;
    }

    /**
     * Inicialización específica del InputManager (SOLID - SRP)
     */
    async initializeSpecific() {
        this.log('info', 'Inicializando InputManager con arquitectura SOLID');
        
        try {
            this.setupEventListeners();
            this.log('info', 'InputManager inicializado correctamente');
        } catch (error) {
            this.handleError('Error inicializando InputManager', error);
            throw error;
        }
    }

    /**
     * Configura los event listeners (SOLID - SRP)
     */
    setupEventListeners() {
        // Event listener para keydown (tecla presionada)
        this.keydownHandler = (event) => {
            if (!this.keys[event.key]) {
                this.keys[event.key] = true;
                // Reiniciar el estado de la acción al presionar una nueva tecla
                for (const [player, mapping] of Object.entries(this.keyMap)) {
                    for (const [action, key] of Object.entries(mapping)) {
                        if (key === event.key && this.singlePressActions.includes(action)) {
                            const actionKey = `${player}_${action}`;
                            if (!this.actionStates[actionKey]) {
                                this.actionStates[actionKey] = true;
                                this.log('debug', `Acción activada: ${actionKey}`);
                            }
                        }
                    }
                }
            }
        };

        // Event listener para keyup (tecla liberada)
        this.keyupHandler = (event) => {
            this.keys[event.key] = false;
            // Resetear el estado de la acción al soltar la tecla
            for (const [player, mapping] of Object.entries(this.keyMap)) {
                for (const [action, key] of Object.entries(mapping)) {
                    if (key === event.key && this.singlePressActions.includes(action)) {
                        const actionKey = `${player}_${action}`;
                        this.actionStates[actionKey] = false;
                        this.log('debug', `Acción desactivada: ${actionKey}`);
                    }
                }
            }
        };

        window.addEventListener('keydown', this.keydownHandler);
        window.addEventListener('keyup', this.keyupHandler);
        
        this.log('debug', 'Event listeners configurados');
    }

    /**
     * Método legacy mantenido para compatibilidad
     * @deprecated Use initializeSpecific() instead
     */
    init() {
        console.warn('InputManager.init() está deprecated, use initialize() en su lugar');
        if (!this.isInitialized) {
            // Llamar al método init() de BaseManager que es async pero no podemos await aquí
            super.init().catch(error => {
                this.log('error', `Error en inicialización legacy: ${error.message}`);
            });
        }
    }

    /**
     * Actualización específica del InputManager (SOLID - SRP)
     */
    updateSpecific(deltaTime) {
        // Procesar entradas del jugador 1
        this.processPlayerInputs('p1');
        
        // Procesar entradas del jugador 2
        this.processPlayerInputs('p2');
        
        // Limpieza de buffers antiguos
        this.cleanupBuffers();
    }

    /**
     * Procesar entradas de un jugador específico (SOLID - SRP)
     */
    processPlayerInputs(player) {
        const keyMap = this.keyMap[player];
        const buffer = player === 'p1' ? this.inputBuffer_p1 : this.inputBuffer_p2;

        // Comprobar cada acción mapeada
        for (const action in keyMap) {
            const key = keyMap[action];
            const now = Date.now();

            if (this.keys[key] && !this.keyLocks[key]) {
                // Verificar si la acción está en cooldown
                if (!this.actionCooldowns[action] || now - this.actionCooldowns[action] >= this.config.cooldownTime) {
                    // Añadir la acción al buffer con timestamp
                    buffer.push({
                        action: action,
                        timestamp: now
                    });
                    this.keyLocks[key] = true; // Bloquear la acción hasta que se libere la tecla
                    this.actionCooldowns[action] = now; // Registrar el tiempo de la acción
                    
                    this.recordMetric('inputProcessed', 1);
                }
            }
        }
    }

    /**
     * Limpia buffers antiguos (SOLID - SRP)
     */
    cleanupBuffers() {
        // Mantener los buffers en la longitud máxima
        if (this.inputBuffer_p1.length > this.config.maxBufferLength) {
            this.inputBuffer_p1 = this.inputBuffer_p1.slice(-this.config.maxBufferLength);
        }
        
        if (this.inputBuffer_p2.length > this.config.maxBufferLength) {
            this.inputBuffer_p2 = this.inputBuffer_p2.slice(-this.config.maxBufferLength);
        }
    }

    /**
     * Verifica si una secuencia de acciones está presente en el buffer del jugador (SOLID - SRP)
     */
    checkSequence(sequence, playerIndex, windowMs = 500) {
        const buffer = playerIndex === 1 ? this.inputBuffer_p1 : this.inputBuffer_p2;
        if (buffer.length < sequence.length) return false;
        
        let seqIdx = sequence.length - 1;
        let now = Date.now();
        let lastTime = null;
        
        for (let i = buffer.length - 1; i >= 0; i--) {
            if (buffer[i].action === sequence[seqIdx]) {
                if (lastTime && (lastTime - buffer[i].timestamp > 150)) return false;
                lastTime = buffer[i].timestamp;
                seqIdx--;
                if (seqIdx < 0) {
                    // Verificar ventana total
                    if (now - buffer[i].timestamp <= windowMs) return true;
                    else return false;
                }
            }
        }
        return false;
    }
    
    /**
     * Verifica si una tecla está presionada (SOLID - ISP)
     */
    isPressed(key) {
        return !!this.keys[key];
    }
    
    /**
     * Verifica si una acción específica está siendo presionada (SOLID - ISP)
     */
    isActionPressed(player, action) {
        const keyMap = this.keyMap[player];
        const keyPressed = this.isPressed(keyMap[action]);
        
        // Para acciones de única presión, verificar también el estado de la acción
        if (this.singlePressActions.includes(action)) {
            const actionKey = `${player}_${action}`;
            // Solo retornar true si la tecla está presionada Y la acción no ha sido procesada
            if (keyPressed && this.actionStates[actionKey]) {
                this.actionStates[actionKey] = false; // Marcar la acción como procesada
                return true;
            }
            return false;
        }
        
        // Para otras acciones (movimiento), comportamiento normal
        return keyPressed;
    }
    
    /**
     * Remapea una tecla para un jugador y acción específicos (SOLID - OCP)
     */
    remapKey(player, action, newKey) {
        if (this.keyMap[player] && this.keyMap[player][action]) {
            this.keyMap[player][action] = newKey;
            this.log('info', `Tecla remapeada: ${player}.${action} -> ${newKey}`);
            return true;
        }
        return false;
    }

    /**
     * Limpieza específica del InputManager (SOLID - SRP)
     */
    async cleanupSpecific() {
        // Remover event listeners
        if (this.keydownHandler) {
            window.removeEventListener('keydown', this.keydownHandler);
        }
        if (this.keyupHandler) {
            window.removeEventListener('keyup', this.keyupHandler);
        }
        
        // Limpiar buffers
        this.inputBuffer_p1 = [];
        this.inputBuffer_p2 = [];
        this.keys = {};
        this.actionStates = {};
        this.keyLocks = {};
        this.actionCooldowns = {};
        
        this.log('info', 'InputManager limpiado');
    }
}