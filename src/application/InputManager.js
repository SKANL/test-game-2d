/**
 * InputManager - Gestiona las entradas del usuario (teclado)
 * Sección 7.1 del Documento Maestro
 */
class InputManager {
    constructor() {
        // Estado de las teclas
        this.keys = {};
        
        // Buffers de entrada para cada jugador (para combos y movimientos especiales)
        this.inputBuffer_p1 = [];
        this.inputBuffer_p2 = [];
        
        // Longitud máxima del buffer
        this.MAX_BUFFER_LENGTH = 20;
        
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
        this.COOLDOWN_TIME = 300; // Tiempo de enfriamiento en milisegundos
        
        // Inicializar los event listeners
        this.init();
    }
    
    init() {
        // Event listener para keydown (tecla presionada)
        window.addEventListener('keydown', (event) => {
            if (!this.keys[event.key]) {
                this.keys[event.key] = true;
                // Reiniciar el estado de la acción al presionar una nueva tecla
                for (const [player, mapping] of Object.entries(this.keyMap)) {
                    for (const [action, key] of Object.entries(mapping)) {
                        if (key === event.key && this.singlePressActions.includes(action)) {
                            const actionKey = `${player}_${action}`;
                            if (!this.actionStates[actionKey]) {
                                this.actionStates[actionKey] = true;
                            }
                        }
                    }
                }
            }
        });

        // Event listener para keyup (tecla liberada)
        window.addEventListener('keyup', (event) => {
            this.keys[event.key] = false;
            // Resetear el estado de la acción al soltar la tecla
            for (const [player, mapping] of Object.entries(this.keyMap)) {
                for (const [action, key] of Object.entries(mapping)) {
                    if (key === event.key && this.singlePressActions.includes(action)) {
                        const actionKey = `${player}_${action}`;
                        this.actionStates[actionKey] = false;
                    }
                }
            }
        });
    }
    
    // Actualizar el estado de las entradas (llamado en cada frame)
    update() {
        // Procesar entradas del jugador 1
        this.processPlayerInputs('p1');
        
        // Procesar entradas del jugador 2
        this.processPlayerInputs('p2');
        
        // Limpieza de buffers antiguos
        this.cleanupBuffers();
    }
    
    processPlayerInputs(player) {
        const keyMap = this.keyMap[player];
        const buffer = player === 'p1' ? this.inputBuffer_p1 : this.inputBuffer_p2;

        // Comprobar cada acción mapeada
        for (const action in keyMap) {
            const key = keyMap[action];
            const now = Date.now();

            if (this.keys[key] && !this.keyLocks[key]) {
                // Verificar si la acción está en cooldown
                if (!this.actionCooldowns[action] || now - this.actionCooldowns[action] >= this.COOLDOWN_TIME) {
                    // Añadir la acción al buffer con timestamp
                    buffer.push({
                        action: action,
                        timestamp: now
                    });
                    this.keyLocks[key] = true; // Bloquear la acción hasta que se libere la tecla
                    this.actionCooldowns[action] = now; // Registrar el tiempo de la acción
                }
            }
        }
    }
    
    cleanupBuffers() {
        // Mantener los buffers en la longitud máxima
        if (this.inputBuffer_p1.length > this.MAX_BUFFER_LENGTH) {
            this.inputBuffer_p1 = this.inputBuffer_p1.slice(-this.MAX_BUFFER_LENGTH);
        }
        
        if (this.inputBuffer_p2.length > this.MAX_BUFFER_LENGTH) {
            this.inputBuffer_p2 = this.inputBuffer_p2.slice(-this.MAX_BUFFER_LENGTH);
        }
    }
    
    // Verificar si una secuencia específica se ha introducido (para movimientos especiales)
    checkSequence(sequence, playerIndex) {
        const buffer = playerIndex === 0 ? this.inputBuffer_p1 : this.inputBuffer_p2;
        
        if (buffer.length < sequence.length) return false;
        
        // Ventana de tiempo para completar la secuencia (en milisegundos)
        const TIME_WINDOW = 500;
        
        // Iterar desde el final del buffer
        for (let i = 0; i < sequence.length; i++) {
            const requiredAction = sequence[sequence.length - 1 - i];
            const bufferIndex = buffer.length - 1 - i;
            
            // Comprobar que la acción coincide
            if (buffer[bufferIndex].action !== requiredAction) {
                return false;
            }
            
            // Comprobar la ventana de tiempo
            if (i > 0) {
                const timeDiff = buffer[bufferIndex + 1].timestamp - buffer[bufferIndex].timestamp;
                if (timeDiff > TIME_WINDOW / sequence.length) {
                    return false;
                }
            }
        }
        
        return true;
    }
    
    // Métodos de utilidad para comprobar estados de teclas individuales
    isPressed(key) {
        return !!this.keys[key];
    }
    
    // Comprobar si una acción específica está siendo presionada por un jugador
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
    
    // Método para personalizar las teclas (para futuras opciones de configuración)
    remapKey(player, action, newKey) {
        if (this.keyMap[player] && this.keyMap[player][action]) {
            this.keyMap[player][action] = newKey;
            return true;
        }
        return false;
    }
}

export default InputManager;