import AssetLoader from '../../infrastructure/AssetLoader.js';
import CanvasRenderer from '../CanvasRenderer.js';
import characters from '../../data/mock-db.js';
import KenBase from '../../characters_base/KenBase.js';
import InputManager from '../../application/InputManager.js';
// RyuBase se importará dinámicamente en init() para mejor performance

export default class BattleScene {
    constructor(battleConfig) {
        // Extraer la configuración de la batalla
        this.p1Character = battleConfig.p1;
        this.p2Character = battleConfig.p2;
        this.gameMode = battleConfig.gameMode;
        
        // Buscar datos de los personajes
        this.p1Data = characters.find(c => c.name === this.p1Character);
        this.p2Data = characters.find(c => c.name === this.p2Character);
        
        // Elementos visuales y de juego
        this.p1SpriteSheet = null;
        this.p2SpriteSheet = null;
        this.renderer = null;
        this.p1Config = null;
        this.p2Config = null;
        
        // Estado del personaje P1
        this.currentState = 'idle'; // Estado inicial: idle
        this.currentFrame = 0; // Frame actual de la animación
        this.frameTimer = 0;   // Contador para el control de velocidad de animación
        
        // Estado del personaje P2
        this.currentStateP2 = 'idle'; // Estado inicial P2: idle
        this.currentFrameP2 = 0; // Frame actual de la animación P2
        this.frameTimerP2 = 0;   // Contador para el control de velocidad de animación P2
        
        // Control de animaciones
        this.animationInterval = null;
        this.lastFrameTime = 0; // Para calcular deltaTime
        
        // Input manager
        this.inputManager = new InputManager();
        
        // Posición y dirección del personaje P1
        this.position = { x: 150, y: 300 }; // Posición inicial de P1 - más a la izquierda
        this.velocity = { x: 0, y: 0 }; // Velocidad para física de salto
        this.direction = 1; // 1: derecha, -1: izquierda
        this.isFacingRight = true; // Indica si el personaje está mirando hacia la derecha
        this.isGrounded = true; // Para controlar si está en el suelo
        this.groundY = 300; // Posición Y del suelo
        
        // Posición y dirección del personaje P2
        this.positionP2 = { x: 950, y: 300 }; // Posición inicial de P2 - más a la derecha
        this.velocityP2 = { x: 0, y: 0 }; // Velocidad para física de salto P2
        this.directionP2 = -1; // P2 inicia mirando hacia la izquierda
        this.isFacingRightP2 = false; // P2 inicia mirando hacia la izquierda
        this.isGroundedP2 = true; // Para controlar si P2 está en el suelo
        
        // SISTEMA DE VISIBILIDAD AUTOMÁTICA
        this.cameraOffset = 0; // Desplazamiento de la cámara virtual
        this.maxSeparation = 800; // Distancia máxima antes de ajustar posiciones
        this.minSeparation = 100; // Distancia mínima para evitar solapamiento
        
        // IA para modo CPU - CONFIGURACIÓN ULTRA-AGRESIVA
        this.aiTimer = 0; // Para controlar la frecuencia de decisiones de la IA
        this.aiDecisionInterval = 0.03; // Tomar decisión cada 30ms (ultra-reactivo)
        this.aiMovementSpeed = 3.0; // Velocidad 3x para persecución agresiva
        
        // Configuración de física (se actualizará después de cargar el personaje)
        this.gravity = 800; // Por defecto
        this.jumpForce = -400; // Por defecto
    }

    async init() {
        // Cargar P1
        if (this.p1Data) {
            console.log(`Intentando cargar el sprite sheet para P1: ${this.p1Data.name}`);
            this.p1SpriteSheet = await AssetLoader.loadImage(this.p1Data.spriteSheetUrl);
            
            if (!this.p1SpriteSheet) {
                console.error(`Error al cargar sprite sheet de ${this.p1Character}`);
                // Intentar con una ruta relativa
                this.p1SpriteSheet = await AssetLoader.loadImage(
                    this.p1Data.spriteSheetUrl.replace(/^\//, '')
                );
            }
            
            // Cargar configuración específica del personaje P1
            if (this.p1Character === 'Ken') {
                this.p1Config = KenBase;
                console.log('Configuración de Ken cargada para P1:', this.p1Config);
                
                // Actualizar propiedades de física con los valores del personaje
                if (this.p1Config.stats) {
                    this.gravity = this.p1Config.stats.gravity || 800;
                    this.jumpForce = this.p1Config.stats.jumpForce || -400;
                    console.log(`Física actualizada: gravity=${this.gravity}, jumpForce=${this.jumpForce}`);
                }
            } else if (this.p1Character === 'Ryu') {
                try {
                    const RyuBase = (await import('../../characters_base/RyuBase.js')).default;
                    this.p1Config = RyuBase;
                    console.log('Configuración de Ryu cargada para P1:', this.p1Config);
                    
                    // Actualizar propiedades de física con los valores del personaje
                    if (this.p1Config.stats) {
                        this.gravity = this.p1Config.stats.gravity || 800;
                        this.jumpForce = this.p1Config.stats.jumpForce || -400;
                        console.log(`Física actualizada: gravity=${this.gravity}, jumpForce=${this.jumpForce}`);
                    }
                } catch (error) {
                    console.error('Error al cargar configuración de Ryu:', error);
                }
            }
            
            if (this.p1SpriteSheet) {
                console.log('Sprite sheet P1 cargado:', {
                    width: this.p1SpriteSheet.width,
                    height: this.p1SpriteSheet.height,
                    src: this.p1SpriteSheet.src
                });
            }
        } else {
            console.error(`No se encontró información del personaje P1: ${this.p1Character}`);
        }

        // Cargar P2
        if (this.p2Data) {
            console.log(`Intentando cargar el sprite sheet para P2: ${this.p2Data.name}`);
            this.p2SpriteSheet = await AssetLoader.loadImage(this.p2Data.spriteSheetUrl);
            
            // Cargar configuración específica del personaje P2
            if (this.p2Character === 'Ken') {
                this.p2Config = KenBase;
                console.log('Configuración de Ken cargada para P2:', this.p2Config);
            } else if (this.p2Character === 'Ryu') {
                // Importar dinámicamente RyuBase si no se ha importado antes
                if (!this.p1Config || this.p1Character !== 'Ryu') {
                    const RyuBase = (await import('../../characters_base/RyuBase.js')).default;
                    this.p2Config = RyuBase;
                } else {
                    // Reutilizar la configuración de P1 si es el mismo personaje
                    this.p2Config = this.p1Config;
                }
                console.log('Configuración de Ryu cargada para P2:', this.p2Config);
            }
        } else {
            console.error(`No se encontró información del personaje P2: ${this.p2Character}`);
        }

        // Verificar que todo se cargó correctamente
        if (!this.p1SpriteSheet || !this.p2SpriteSheet || !this.p1Config || !this.p2Config) {
            console.error('Error al cargar recursos de los personajes');
            return;
        }
    }

    render() {
        // Asegurar que el canvas esté visible y limpio
        const gameCanvas = document.getElementById('gameCanvas');
        if (gameCanvas) {
            gameCanvas.style.display = 'block';
        }

        const container = document.createElement('div');
        container.style.cssText = `
            position: fixed;
            top: 10px;
            left: 50%;
            transform: translateX(-50%);
            z-index: 100;
        `;

        const title = document.createElement('h1');
        title.textContent = `Batalla: ${this.p1Character} vs ${this.p2Character} (${this.gameMode === 'pvp' ? 'PvP' : 'vs CPU'})`;
        title.style.cssText = `
            color: white;
            margin: 0;
            font-size: 1.8rem;
            font-family: Arial, sans-serif;
            text-align: center;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.8);
        `;
        container.appendChild(title);

        document.body.appendChild(container);

        // Inicializar renderer con canvas existente
        this.renderer = new CanvasRenderer('gameCanvas');
        this.renderer.clearCanvas();
        
        if (this.p1SpriteSheet && this.p1Config && this.p2SpriteSheet && this.p2Config) {
            console.log('=== INICIANDO BATALLA ===');
            
            // Verificar que tenemos todas las configuraciones necesarias
            console.log('Estado de los recursos:', {
                p1Sprite: !!this.p1SpriteSheet,
                p1Config: !!this.p1Config,
                p2Sprite: !!this.p2SpriteSheet,
                p2Config: !!this.p2Config,
            });
            
            if (this.p1Config.animations && this.p1Config.animations.idle) {
                console.log('P1 Frame Data:', this.p1Config.animations.idle.frames[0]);
            }
            
            // Mostrar controles en pantalla
            this.showControls();
            
            // RENDERIZAR PERSONAJES INMEDIATAMENTE
            this.renderCurrentFrame();
            
            // Iniciar el game loop para animaciones y control
            this.startGameLoop();
        } else {
            console.error('No se pudieron cargar los recursos necesarios:', {
                p1Sprite: !!this.p1SpriteSheet,
                p1Config: !!this.p1Config,
                p2Sprite: !!this.p2SpriteSheet,
                p2Config: !!this.p2Config,
            });
            
            // Mostrar placeholders si no hay recursos
            this.renderer.drawPlaceholder(200, 300, 128, 192);
            this.renderer.drawPlaceholder(600, 300, 128, 192);
        }
    }
    
    startGameLoop() {
        if (!this.p1Config || !this.p2Config) return;
        
        // Iniciar el game loop con requestAnimationFrame
        this.lastFrameTime = performance.now();
        requestAnimationFrame(this.gameLoop.bind(this));
    }
    
    gameLoop(timestamp) {
        // Calcular deltaTime en segundos
        const deltaTime = (timestamp - this.lastFrameTime) / 1000;
        this.lastFrameTime = timestamp;
        
        // Actualizar entradas del usuario
        this.inputManager.update();
        
        // Procesar input P1 y cambiar estados
        this.handleInput();
        
        // Procesar P2 según el modo de juego
        if (this.gameMode === 'pvp') {
            this.handleInputP2(); // P2 controlado por humano
        } else {
            this.handleAI(deltaTime); // P2 controlado por IA
        }
        
        // ORIENTACIÓN AUTOMÁTICA: Aplicar en cada frame
        this.updateOrientation();
        
        // SISTEMA DE VISIBILIDAD: Mantener ambos personajes visibles
        this.ensureCharactersVisible();
        
        // Actualizar física de ambos personajes
        this.updatePhysics(deltaTime);
        this.updatePhysicsP2(deltaTime);
        
        // Avanzar las animaciones respetando el frameRate
        this.updateAnimation(deltaTime);
        this.updateAnimationP2(deltaTime);
        
        // Renderizar el estado actual
        this.renderCurrentFrame();
        
        // Continuar el loop
        requestAnimationFrame(this.gameLoop.bind(this));
    }
    
    handleInput() {
        // Por ahora, solo manejar input para P1 (simplificado)
        // El P2 se controlará por CPU o será añadido más tarde
        
        if (!this.p1Config) return;
        
        // Si ya está en un estado de ataque y aún no termina, no cambiar
        if (this.currentState === 'lightPunch' && 
            this.currentFrame < this.p1Config.animations.lightPunch.frames.length - 1) {
            return;
        }
        
        // Si ya está en un estado de hadoken y aún no termina, no cambiar
        if (this.currentState === 'hadoken' && 
            this.currentFrame < this.p1Config.animations.hadoken.frames.length - 1) {
            return;
        }
        
        // Si ya está en un estado de salto y aún no termina, no cambiar
        if (this.currentState === 'jump' && 
            this.currentFrame < this.p1Config.animations.jump.frames.length - 1) {
            return;
        }
        
        // Verificar secuencias especiales primero (hadoken)
        const hadokenSequence = ['down', 'forward', 'punch'];
        if (this.inputManager.checkSequence(hadokenSequence, 0)) {
            this.currentState = 'hadoken';
            this.currentFrame = 0;
            this.frameTimer = 0;
            return;
        }
        
        // Verificar salto (solo si está en el suelo)
        if (this.inputManager.isActionPressed('p1', 'up') && this.isGrounded) {
            this.currentState = 'jump';
            this.currentFrame = 0;
            this.frameTimer = 0;
            this.velocity.y = this.jumpForce; // Aplicar fuerza de salto
            this.isGrounded = false;
            console.log('=== EJECUTANDO SALTO ===');
            console.log(`jumpForce: ${this.jumpForce}, velocity.y: ${this.velocity.y}`);
            return;
        }
        
        // Verificar ataques
        if (this.inputManager.isActionPressed('p1', 'punch')) {
            console.log('=== EJECUTANDO LIGHT PUNCH ===');
            console.log('Frames de lightPunch:', this.p1Config.animations.lightPunch.frames);
            console.log('Frame 0:', this.p1Config.animations.lightPunch.frames[0]);
            console.log('Frame 1:', this.p1Config.animations.lightPunch.frames[1]);
            console.log('Total frames:', this.p1Config.animations.lightPunch.frames.length);
            this.currentState = 'lightPunch';
            this.currentFrame = 0;
            this.frameTimer = 0;
            return;
        }
        
        // Verificar movimiento (solo si no está atacando)
        if (this.currentState !== 'lightPunch' && this.currentState !== 'hadoken') {
            if (this.inputManager.isActionPressed('p1', 'right')) {
                // LÓGICA INTELIGENTE: Determinar si va hacia el oponente o se aleja
                const isMovingTowardOpponent = this.positionP2.x > this.position.x;
                this.currentState = isMovingTowardOpponent ? 'walkForward' : 'walkBackward';
                this.direction = 1; // Moverse hacia la derecha
                this.position.x += this.p1Config.stats.speed;
                console.log(`🏃 P1 DERECHA: ${this.currentState} (hacia oponente: ${isMovingTowardOpponent})`);
                return;
            }
            
            if (this.inputManager.isActionPressed('p1', 'left')) {
                // LÓGICA INTELIGENTE: Determinar si va hacia el oponente o se aleja
                const isMovingTowardOpponent = this.positionP2.x < this.position.x;
                this.currentState = isMovingTowardOpponent ? 'walkForward' : 'walkBackward';
                this.direction = -1; // Moverse hacia la izquierda
                this.position.x -= this.p1Config.stats.speed;
                console.log(`🏃 P1 IZQUIERDA: ${this.currentState} (hacia oponente: ${isMovingTowardOpponent})`);
                return;
            }
        }
        
        // Si no hay input, volver a idle (solo si no está en una animación en curso)
        if (this.currentState !== 'idle' && 
            this.currentState !== 'lightPunch' && 
            this.currentState !== 'hadoken' && 
            this.currentState !== 'jump') {
            this.currentState = 'idle';
            this.currentFrame = 0;
            this.frameTimer = 0;
        }
        
        // FORZAR ORIENTACIÓN P1 después de cada input
        if (this.positionP2) {
            this.isFacingRight = this.positionP2.x > this.position.x;
        }
    }
    
    handleInputP2() {
        // Manejar input para P2 en modo PvP (teclas de flecha + Enter)
        if (!this.p2Config) return;
        
        // Si ya está en un estado de ataque y aún no termina, no cambiar
        if (this.currentStateP2 === 'lightPunch' && 
            this.currentFrameP2 < this.p2Config.animations.lightPunch.frames.length - 1) {
            return;
        }
        
        // Si ya está en un estado de hadoken y aún no termina, no cambiar
        if (this.currentStateP2 === 'hadoken' && 
            this.currentFrameP2 < this.p2Config.animations.hadoken.frames.length - 1) {
            return;
        }
        
        // Si ya está en un estado de salto y aún no termina, no cambiar
        if (this.currentStateP2 === 'jump' && 
            this.currentFrameP2 < this.p2Config.animations.jump.frames.length - 1) {
            return;
        }
        
        // Verificar salto P2 (solo si está en el suelo) - Flecha Arriba
        if (this.inputManager.isActionPressed('p2', 'up') && this.isGroundedP2) {
            this.currentStateP2 = 'jump';
            this.currentFrameP2 = 0;
            this.frameTimerP2 = 0;
            this.velocityP2.y = this.jumpForce;
            this.isGroundedP2 = false;
            console.log('=== P2 EJECUTANDO SALTO ===');
            return;
        }
        
        // Verificar ataques P2 - Enter
        if (this.inputManager.isActionPressed('p2', 'punch')) {
            console.log('=== P2 EJECUTANDO LIGHT PUNCH ===');
            this.currentStateP2 = 'lightPunch';
            this.currentFrameP2 = 0;
            this.frameTimerP2 = 0;
            return;
        }
        
        // Verificar movimiento P2 (solo si no está atacando)
        if (this.currentStateP2 !== 'lightPunch' && this.currentStateP2 !== 'hadoken') {
            // Flecha Derecha
            if (this.inputManager.isActionPressed('p2', 'right')) {
                // LÓGICA INTELIGENTE P2: Determinar si va hacia el oponente o se aleja
                const isMovingTowardOpponent = this.position.x > this.positionP2.x;
                this.currentStateP2 = isMovingTowardOpponent ? 'walkForward' : 'walkBackward';
                this.directionP2 = 1;
                this.positionP2.x += this.p2Config.stats.speed;
                console.log(`🏃 P2 DERECHA: ${this.currentStateP2} (hacia oponente: ${isMovingTowardOpponent})`);
                return;
            }
            
            // Flecha Izquierda
            if (this.inputManager.isActionPressed('p2', 'left')) {
                // LÓGICA INTELIGENTE P2: Determinar si va hacia el oponente o se aleja
                const isMovingTowardOpponent = this.position.x < this.positionP2.x;
                this.currentStateP2 = isMovingTowardOpponent ? 'walkForward' : 'walkBackward';
                this.directionP2 = -1;
                this.positionP2.x -= this.p2Config.stats.speed;
                console.log(`🏃 P2 IZQUIERDA: ${this.currentStateP2} (hacia oponente: ${isMovingTowardOpponent})`);
                return;
            }
        }
        
        // Si no hay input, volver a idle
        if (this.currentStateP2 !== 'idle' && 
            this.currentStateP2 !== 'lightPunch' && 
            this.currentStateP2 !== 'hadoken' && 
            this.currentStateP2 !== 'jump') {
            this.currentStateP2 = 'idle';
            this.currentFrameP2 = 0;
            this.frameTimerP2 = 0;
        }
        
        // FORZAR ORIENTACIÓN P2 después de cada input
        if (this.position) {
            this.isFacingRightP2 = this.position.x > this.positionP2.x;
        }
    }
    
    updateOrientation() {
        // ORIENTACIÓN AUTOMÁTICA ULTRA-ROBUSTA: Ambos personajes siempre se miran
        if (this.position && this.positionP2) {
            const prevP1Facing = this.isFacingRight;
            const prevP2Facing = this.isFacingRightP2;
            
            // P1 siempre mira hacia P2
            this.isFacingRight = this.positionP2.x > this.position.x;
            
            // P2 siempre mira hacia P1  
            this.isFacingRightP2 = this.position.x > this.positionP2.x;
            
            // FORZAR orientación - Aplicar inmediatamente sin esperar frame
            if (Math.abs(this.positionP2.x - this.position.x) > 10) {
                // Solo aplicar si hay distancia significativa para evitar vibraciones
                this.isFacingRight = this.positionP2.x > this.position.x;
                this.isFacingRightP2 = this.position.x > this.positionP2.x;
            }
            
            // Debug solo cuando cambia la orientación
            if (prevP1Facing !== this.isFacingRight || prevP2Facing !== this.isFacingRightP2) {
                console.log(`🔄 Orientación - P1: ${this.isFacingRight ? '→' : '←'}, P2: ${this.isFacingRightP2 ? '→' : '←'} | Dist: ${Math.abs(this.positionP2.x - this.position.x).toFixed(0)}`);
            }
        }
    }
    
    ensureCharactersVisible() {
        // SISTEMA DE VISIBILIDAD MEJORADO: Mantener ambos personajes siempre visibles
        const canvas = document.getElementById('gameCanvas');
        if (!canvas || !this.position || !this.positionP2) return;
        
        const distance = Math.abs(this.positionP2.x - this.position.x);
        const canvasWidth = canvas.width;
        const strictMargin = 50; // Margen estricto desde los bordes
        
        // LÍMITES ABSOLUTOS: Nunca permitir que salgan del canvas
        const absoluteMinX = strictMargin;
        const absoluteMaxX = canvasWidth - strictMargin - 100; // Espacio para el sprite
        
        // Aplicar límites absolutos a P1
        if (this.position.x < absoluteMinX) {
            this.position.x = absoluteMinX;
            console.log('🔒 P1: Límite absoluto izquierdo aplicado');
        }
        if (this.position.x > absoluteMaxX) {
            this.position.x = absoluteMaxX;
            console.log('🔒 P1: Límite absoluto derecho aplicado');
        }
        
        // Aplicar límites absolutos a P2
        if (this.positionP2.x < absoluteMinX) {
            this.positionP2.x = absoluteMinX;
            console.log('🔒 P2: Límite absoluto izquierdo aplicado');
        }
        if (this.positionP2.x > absoluteMaxX) {
            this.positionP2.x = absoluteMaxX;
            console.log('� P2: Límite absoluto derecho aplicado');
        }
        
        // Si los personajes están demasiado separados, ajustar posiciones proporcionalmente
        if (distance > this.maxSeparation) {
            const excess = distance - this.maxSeparation;
            const adjustment = excess / 2;
            
            if (this.position.x < this.positionP2.x) {
                // P1 a la izquierda, P2 a la derecha
                this.position.x = Math.max(absoluteMinX, this.position.x + adjustment);
                this.positionP2.x = Math.min(absoluteMaxX, this.positionP2.x - adjustment);
            } else {
                // P2 a la izquierda, P1 a la derecha
                this.position.x = Math.min(absoluteMaxX, this.position.x - adjustment);
                this.positionP2.x = Math.max(absoluteMinX, this.positionP2.x + adjustment);
            }
            
            console.log(`📐 Ajuste de visibilidad: distancia reducida de ${distance.toFixed(0)} a ~${this.maxSeparation}`);
        }
        
        // Mantener separación mínima
        const currentDistance = Math.abs(this.positionP2.x - this.position.x);
        if (currentDistance < this.minSeparation) {
            const deficit = this.minSeparation - currentDistance;
            const adjustment = deficit / 2;
            
            if (this.position.x < this.positionP2.x) {
                this.position.x = Math.max(absoluteMinX, this.position.x - adjustment);
                this.positionP2.x = Math.min(absoluteMaxX, this.positionP2.x + adjustment);
            } else {
                this.position.x = Math.min(absoluteMaxX, this.position.x + adjustment);
                this.positionP2.x = Math.max(absoluteMinX, this.positionP2.x - adjustment);
            }
            
            console.log(`🔍 Separación mínima: distancia aumentada de ${currentDistance.toFixed(0)} a ~${this.minSeparation}`);
        }
    }
    
    handleAI(deltaTime) {
        // IA ULTRA-AGRESIVA para P2 en modo CPU
        if (!this.p2Config) {
            console.warn('⚠️ IA: No hay configuración de P2');
            return;
        }
        
        // Verificar que existe stats.speed
        if (!this.p2Config.stats || !this.p2Config.stats.speed) {
            console.warn('⚠️ IA: No hay stats.speed en P2Config, usando valor por defecto');
            // Crear stats por defecto si no existe
            if (!this.p2Config.stats) this.p2Config.stats = {};
            this.p2Config.stats.speed = 2; // Valor por defecto
        }
        
        this.aiTimer += deltaTime;
        
        // ULTRA-REACTIVO: Tomar decisión cada 30ms
        if (this.aiTimer >= this.aiDecisionInterval) {
            this.aiTimer = 0;
            
            // Calcular métricas de combate
            const distance = Math.abs(this.positionP2.x - this.position.x);
            const isP1ToTheLeft = this.position.x < this.positionP2.x;
            const verticalDistance = Math.abs(this.positionP2.y - this.position.y);
            const speed = this.p2Config.stats.speed * this.aiMovementSpeed; // 3x velocidad
            
            console.log(`🤖 IA ULTRA-AGRESIVA | Dist: ${distance.toFixed(0)} | P1←: ${isP1ToTheLeft} | Speed: ${speed.toFixed(1)}`);
            
            // VERIFICAR ANIMACIONES NO INTERRUMPIBLES
            const isInUninterruptibleAnimation = (
                (this.currentStateP2 === 'lightPunch' && 
                 this.currentFrameP2 < this.p2Config.animations.lightPunch.frames.length - 1) ||
                (this.currentStateP2 === 'hadoken' && 
                 this.currentFrameP2 < this.p2Config.animations.hadoken.frames.length - 1) ||
                (this.currentStateP2 === 'jump' && !this.isGroundedP2)
            );
            
            if (isInUninterruptibleAnimation) {
                console.log('🔒 IA: En animación, esperando...');
                return;
            }
            
            // LÓGICA ULTRA-AGRESIVA POR ZONAS DE DISTANCIA - AJUSTADA PARA CANVAS 1200px
            const random = Math.random();
            
            // ZONA 1: MELEE RANGE (0-80px) - ATAQUE CONSTANTE
            if (distance <= 80 && verticalDistance <= 25 && this.isGroundedP2) {
                if (random < 0.95) { // 95% probabilidad de ataque
                    this.currentStateP2 = 'lightPunch';
                    this.currentFrameP2 = 0;
                    this.frameTimerP2 = 0;
                    console.log('⚔️ IA MELEE ATAQUE (95%)');
                    return;
                } else {
                    // 5% - Salto para confundir
                    this.currentStateP2 = 'jump';
                    this.currentFrameP2 = 0;
                    this.frameTimerP2 = 0;
                    this.velocityP2.y = this.jumpForce;
                    this.isGroundedP2 = false;
                    console.log('🦘 IA SALTO CONFUSO');
                    return;
                }
            }
            
            // ZONA 2: CLOSE RANGE (81-150px) - ALTA AGRESIVIDAD
            if (distance > 80 && distance <= 150) {
                if (random < 0.8) { // 80% ataque
                    this.currentStateP2 = 'lightPunch';
                    this.currentFrameP2 = 0;
                    this.frameTimerP2 = 0;
                    console.log('🥊 IA CLOSE ATAQUE (80%)');
                    return;
                } else {
                    // 20% - Acercarse más rápido CON LÓGICA INTELIGENTE
                    if (isP1ToTheLeft) {
                        this.currentStateP2 = 'walkForward'; // Se acerca = walkForward
                        this.positionP2.x -= speed;
                        console.log('🏃 IA RUSH IZQUIERDA (walkForward)');
                    } else {
                        this.currentStateP2 = 'walkForward'; // Se acerca = walkForward
                        this.positionP2.x += speed;
                        console.log('🏃 IA RUSH DERECHA (walkForward)');
                    }
                    return;
                }
            }
            
            // ZONA 3: MID RANGE (151-250px) - AGRESIVIDAD MODERADA
            if (distance > 150 && distance <= 250) {
                if (random < 0.6) { // 60% ataque
                    this.currentStateP2 = 'lightPunch';
                    this.currentFrameP2 = 0;
                    this.frameTimerP2 = 0;
                    console.log('👊 IA MID ATAQUE (60%)');
                    return;
                } else {
                    // 40% - Acercarse rápidamente CON LÓGICA INTELIGENTE
                    if (isP1ToTheLeft) {
                        this.currentStateP2 = 'walkForward'; // Se acerca = walkForward
                        this.positionP2.x -= speed;
                        console.log('🚶 IA ACERCÁNDOSE RÁPIDO IZQUIERDA (walkForward)');
                    } else {
                        this.currentStateP2 = 'walkForward'; // Se acerca = walkForward
                        this.positionP2.x += speed;
                        console.log('🚶 IA ACERCÁNDOSE RÁPIDO DERECHA (walkForward)');
                    }
                    return;
                }
            }
            
            // ZONA 4: LONG RANGE (251+px) - PERSECUCIÓN IMPLACABLE CON LÓGICA INTELIGENTE
            if (distance > 250) {
                // PERSEGUIR SIN PARAR - SIEMPRE walkForward porque se acerca
                if (isP1ToTheLeft) {
                    this.currentStateP2 = 'walkForward'; // Se acerca = walkForward
                    this.positionP2.x -= speed;
                    console.log(`🎯 IA PERSECUCIÓN IMPLACABLE ← walkForward (dist: ${distance.toFixed(0)})`);
                } else {
                    this.currentStateP2 = 'walkForward'; // Se acerca = walkForward
                    this.positionP2.x += speed;
                    console.log(`🎯 IA PERSECUCIÓN IMPLACABLE → walkForward (dist: ${distance.toFixed(0)})`);
                }
                return;
            }
            
            // COMPORTAMIENTO POR DEFECTO - NO DEBERÍA LLEGAR AQUÍ
            console.log('❓ IA: Comportamiento por defecto - distancia extraña:', distance);
            this.currentStateP2 = 'idle';
            this.currentFrameP2 = 0;
            this.frameTimerP2 = 0;
        }
        
        // FORZAR ORIENTACIÓN DESPUÉS DE CADA ACCIÓN DE IA
        this.isFacingRightP2 = this.position.x > this.positionP2.x;
    }
    
    updatePhysics(deltaTime) {
        // Aplicar gravedad si no está en el suelo
        if (!this.isGrounded) {
            this.velocity.y += this.gravity * deltaTime;
        }
        
        // Actualizar posición basada en velocidad
        this.position.y += this.velocity.y * deltaTime;
        
        // Verificar colisión con el suelo
        if (this.position.y >= this.groundY) {
            this.position.y = this.groundY;
            this.velocity.y = 0;
            this.isGrounded = true;
            
            // Si estaba saltando y toca el suelo, volver a idle
            if (this.currentState === 'jump') {
                this.currentState = 'idle';
                this.currentFrame = 0;
                this.frameTimer = 0;
            }
        } else {
            this.isGrounded = false;
        }
        
        // Limitar posición de P1 dentro del canvas - LÍMITES ESTRICTOS
        const canvas = document.getElementById('gameCanvas');
        if (canvas) {
            const minX = 20; // Margen izquierdo estricto
            const maxX = canvas.width - 100; // Margen derecho estricto
            
            if (this.position.x < minX) {
                this.position.x = minX;
                console.log('🚧 P1: Límite izquierdo alcanzado');
            }
            if (this.position.x > maxX) {
                this.position.x = maxX;
                console.log('🚧 P1: Límite derecho alcanzado');
            }
        }
    }
    
    updatePhysicsP2(deltaTime) {
        // Aplicar gravedad si no está en el suelo
        if (!this.isGroundedP2) {
            this.velocityP2.y += this.gravity * deltaTime;
        }
        
        // Actualizar posición basada en velocidad
        this.positionP2.y += this.velocityP2.y * deltaTime;
        
        // Verificar colisión con el suelo
        if (this.positionP2.y >= this.groundY) {
            this.positionP2.y = this.groundY;
            this.velocityP2.y = 0;
            this.isGroundedP2 = true;
            
            // Si estaba saltando y toca el suelo, volver a idle
            if (this.currentStateP2 === 'jump') {
                this.currentStateP2 = 'idle';
                this.currentFrameP2 = 0;
                this.frameTimerP2 = 0;
            }
        } else {
            this.isGroundedP2 = false;
        }
        
        // Limitar posición de P2 dentro del canvas - LÍMITES ESTRICTOS
        const canvas = document.getElementById('gameCanvas');
        if (canvas) {
            const minX = 20; // Margen izquierdo estricto
            const maxX = canvas.width - 100; // Margen derecho estricto
            
            if (this.positionP2.x < minX) {
                this.positionP2.x = minX;
                console.log('🚧 P2: Límite izquierdo alcanzado');
            }
            if (this.positionP2.x > maxX) {
                this.positionP2.x = maxX;
                console.log('🚧 P2: Límite derecho alcanzado');
            }
        }
    }

    updateAnimation(deltaTime) {
        // Actualizar animación de P1 con verificaciones robustas
        if (!this.p1Config || !this.p1Config.animations) {
            console.warn('⚠️ P1: Sin configuración de animaciones');
            return;
        }
        
        // Obtener la animación actual según el estado
        const currentAnimation = this.p1Config.animations[this.currentState];

        if (!currentAnimation || !currentAnimation.frames || currentAnimation.frames.length === 0) {
            console.warn(`⚠️ P1: Animación inválida para estado: ${this.currentState}, volviendo a idle`);
            this.currentState = 'idle';
            this.currentFrame = 0;
            this.frameTimer = 0;
            return;
        }

        // Asegurar que currentFrame sea válido
        if (this.currentFrame >= currentAnimation.frames.length) {
            console.warn(`⚠️ P1: Frame ${this.currentFrame} fuera de rango para ${this.currentState} (max: ${currentAnimation.frames.length - 1}). Corrigiendo.`);
            this.currentFrame = currentAnimation.frames.length - 1;
        }

        // Incrementar el contador de tiempo
        this.frameTimer += deltaTime * 60; // Convertir deltaTime a frames (asumiendo 60 FPS base)

        // Obtener la duración del frame actual de forma segura
        const currentFrameDuration = currentAnimation.frames[this.currentFrame]?.duration || 12;

        // Si ha pasado suficiente tiempo según la duración del frame actual
        if (this.frameTimer >= currentFrameDuration) {
            const previousFrame = this.currentFrame;
            this.currentFrame++;

            // Verificar si la animación ha terminado
            if (this.currentFrame >= currentAnimation.frames.length) {
                if (!currentAnimation.loop) {
                    // Transicionar a la siguiente animación
                    console.log(`✅ P1: Animación ${this.currentState} terminada, transicionando a ${currentAnimation.onEnd || 'idle'}`);
                    this.currentState = currentAnimation.onEnd || 'idle';
                    this.currentFrame = 0;
                } else {
                    // Volver al inicio si es una animación en bucle
                    this.currentFrame = 0;
                }
            }

            // Reiniciar el timer para el nuevo frame
            this.frameTimer = 0;
        }
    }
    
    updateAnimationP2(deltaTime) {
        // Actualizar animación de P2 con verificaciones robustas
        if (!this.p2Config || !this.p2Config.animations) {
            console.warn('⚠️ P2: No hay configuración de animaciones');
            return;
        }
        
        // Obtener la animación actual según el estado de P2
        const currentAnimation = this.p2Config.animations[this.currentStateP2];

        if (!currentAnimation || !currentAnimation.frames || currentAnimation.frames.length === 0) {
            console.warn(`⚠️ P2: Animación no encontrada o inválida para el estado: ${this.currentStateP2}`);
            // Forzar estado válido
            this.currentStateP2 = 'idle';
            this.currentFrameP2 = 0;
            this.frameTimerP2 = 0;
            return;
        }

        // Asegurar que currentFrameP2 sea válido
        if (this.currentFrameP2 >= currentAnimation.frames.length || this.currentFrameP2 < 0) {
            console.warn(`⚠️ P2: Frame inválido ${this.currentFrameP2} para animación ${this.currentStateP2}. Reseteando a 0.`);
            this.currentFrameP2 = 0;
            this.frameTimerP2 = 0;
        }

        // Incrementar el contador de tiempo
        this.frameTimerP2 += deltaTime * 60; // Convertir deltaTime a frames (asumiendo 60 FPS base)

        // Obtener la duración del frame actual de forma segura
        const currentFrameDuration = currentAnimation.frames[this.currentFrameP2]?.duration || 12; // valor por defecto si no hay duration

        console.log(`P2 Estado: ${this.currentStateP2}, Frame: ${this.currentFrameP2}/${currentAnimation.frames.length - 1}, Duration: ${currentFrameDuration}, Timer: ${this.frameTimerP2.toFixed(2)}`);

        // Si ha pasado suficiente tiempo según la duración del frame actual
        if (this.frameTimerP2 >= currentFrameDuration) {
            const previousFrame = this.currentFrameP2;
            this.currentFrameP2++;

            // Verificar si la animación ha terminado
            if (this.currentFrameP2 >= currentAnimation.frames.length) {
                if (!currentAnimation.loop) {
                    // Transicionar a la siguiente animación
                    const nextState = currentAnimation.onEnd || 'idle';
                    console.log(`P2 Animación ${this.currentStateP2} terminada, transicionando a ${nextState}`);
                    this.currentStateP2 = nextState;
                    this.currentFrameP2 = 0;
                } else {
                    // Volver al inicio si es una animación en bucle
                    this.currentFrameP2 = 0;
                }
            }

            // Reiniciar el timer para el nuevo frame
            this.frameTimerP2 = 0;
            console.log(`P2 Avanzando frame: ${previousFrame} -> ${this.currentFrameP2}`);
        }
    }
    
    renderCurrentFrame() {
        // Limpiar el canvas
        this.renderer.clearCanvas();
        
        // Factor de escala común
        const scale = 2;
        
        // RENDERIZAR P1 CON VERIFICACIONES ROBUSTAS
        if (this.p1Config && this.p1Config.animations && this.p1SpriteSheet) {
            const p1Animation = this.p1Config.animations[this.currentState];
            if (p1Animation && p1Animation.frames && p1Animation.frames.length > 0) {
                // Asegurar que el frame esté dentro de los límites
                const safeFrame = Math.min(this.currentFrame, p1Animation.frames.length - 1);
                const p1FrameData = p1Animation.frames[safeFrame];
                
                if (p1FrameData) {
                    console.log('✅ Renderizando P1:', {
                        character: this.p1Character,
                        state: this.currentState,
                        frame: `${safeFrame}/${p1Animation.frames.length - 1}`,
                        position: `(${this.position.x.toFixed(0)}, ${this.position.y.toFixed(0)})`,
                        facing: this.isFacingRight ? '→' : '←'
                    });
                    
                    this.renderer.drawCharacterFrame(
                        this.p1SpriteSheet,
                        p1FrameData,
                        this.position.x,
                        this.position.y,
                        scale,
                        this.isFacingRight
                    );
                } else {
                    console.error('❌ P1 frameData nulo para frame:', safeFrame);
                    this.renderer.drawPlaceholder(this.position.x, this.position.y, 64 * scale, 96 * scale);
                }
            } else {
                console.error('❌ P1 animación inválida:', this.currentState);
                this.renderer.drawPlaceholder(this.position.x, this.position.y, 64 * scale, 96 * scale);
            }
        } else {
            console.error('❌ P1 recursos faltantes:', {
                config: !!this.p1Config,
                animations: !!this.p1Config?.animations,
                sprite: !!this.p1SpriteSheet
            });
            this.renderer.drawPlaceholder(this.position.x, this.position.y, 64 * scale, 96 * scale);
        }
        
        // RENDERIZAR P2 CON VERIFICACIONES ROBUSTAS
        if (this.p2Config && this.p2Config.animations && this.p2SpriteSheet) {
            const p2Animation = this.p2Config.animations[this.currentStateP2];
            if (p2Animation && p2Animation.frames && p2Animation.frames.length > 0) {
                // Asegurar que el frame esté dentro de los límites
                const safeFrame = Math.min(this.currentFrameP2, p2Animation.frames.length - 1);
                const p2FrameData = p2Animation.frames[safeFrame];
                
                if (p2FrameData) {
                    console.log('✅ Renderizando P2:', {
                        character: this.p2Character,
                        state: this.currentStateP2,
                        frame: `${safeFrame}/${p2Animation.frames.length - 1}`,
                        position: `(${this.positionP2.x.toFixed(0)}, ${this.positionP2.y.toFixed(0)})`,
                        facing: this.isFacingRightP2 ? '→' : '←',
                        mode: this.gameMode
                    });
                    
                    this.renderer.drawCharacterFrame(
                        this.p2SpriteSheet,
                        p2FrameData,
                        this.positionP2.x,
                        this.positionP2.y,
                        scale,
                        this.isFacingRightP2
                    );
                } else {
                    console.error('❌ P2 frameData nulo para frame:', safeFrame);
                    this.renderer.drawPlaceholder(this.positionP2.x, this.positionP2.y, 64 * scale, 96 * scale);
                }
            } else {
                console.error('❌ P2 animación inválida:', this.currentStateP2);
                this.renderer.drawPlaceholder(this.positionP2.x, this.positionP2.y, 64 * scale, 96 * scale);
            }
        } else {
            console.error('❌ P2 recursos faltantes:', {
                config: !!this.p2Config,
                animations: !!this.p2Config?.animations,
                sprite: !!this.p2SpriteSheet
            });
            this.renderer.drawPlaceholder(this.positionP2.x, this.positionP2.y, 64 * scale, 96 * scale);
        }
        
        // Mostrar información de depuración
        this.showStateInfo();
    }
    
    updateCharacterPosition() {
        // Mantener al personaje dentro de los límites del canvas
        const canvas = document.getElementById('gameCanvas');
        
        if (!this.p1Config) return;
        
        // Obtener el ancho del frame actual para cálculos más precisos
        const currentAnimation = this.p1Config.animations[this.currentState];
        let frameWidth = 64; // Valor por defecto
        
        if (currentAnimation && currentAnimation.frames[this.currentFrame]) {
            frameWidth = currentAnimation.frames[this.currentFrame].width || 64;
        }
        
        const scale = 2; // Factor de escala usado en el renderizado
        const scaledWidth = frameWidth * scale;
        
        // Asegurarse de que la posición X está dentro de los límites
        const minX = 0;
        const maxX = canvas.width - scaledWidth;
        
        if (this.position.x < minX) {
            this.position.x = minX;
        } else if (this.position.x > maxX) {
            this.position.x = maxX;
        }
        
        console.log(`Posición del personaje: x=${this.position.x}, y=${this.position.y}, frameWidth=${frameWidth}, scaledWidth=${scaledWidth}, canvasWidth=${canvas.width}`);
    }
    
    showControls() {
        // Crear un contenedor para los controles
        const controlsContainer = document.createElement('div');
        controlsContainer.id = 'controls-info';
        controlsContainer.style.cssText = `
            position: fixed;
            bottom: 20px;
            left: 20px;
            background-color: rgba(0, 0, 0, 0.7);
            color: white;
            padding: 10px;
            border-radius: 5px;
            font-family: Arial, sans-serif;
            font-size: 14px;
        `;
        
        controlsContainer.innerHTML = `
            <h3 style="margin: 0 0 10px 0;">Controles:</h3>
            <div style="display: flex; gap: 20px;">
                <div>
                    <strong>P1 (${this.p1Character}):</strong>
                    <ul style="margin: 5px 0; padding-left: 20px;">
                        <li><kbd>W</kbd>: Saltar</li>
                        <li><kbd>A</kbd>: Moverse izquierda</li>
                        <li><kbd>D</kbd>: Moverse derecha</li>
                        <li><kbd>Espacio</kbd>: Golpe</li>
                        <li>Hadoken: <kbd>S</kbd> → <kbd>D</kbd> → <kbd>Espacio</kbd></li>
                    </ul>
                </div>
                ${this.gameMode === 'pvp' ? `
                <div>
                    <strong>P2 (${this.p2Character}):</strong>
                    <ul style="margin: 5px 0; padding-left: 20px;">
                        <li><kbd>↑</kbd>: Saltar</li>
                        <li><kbd>←</kbd>: Moverse izquierda</li>
                        <li><kbd>→</kbd>: Moverse derecha</li>
                        <li><kbd>Enter</kbd>: Golpe</li>
                        <li><kbd>Shift</kbd>: Patada</li>
                        <li><kbd>Ctrl</kbd>: Especial</li>
                    </ul>
                </div>
                ` : `
                <div>
                    <strong>P2 (${this.p2Character}):</strong>
                    <ul style="margin: 5px 0; padding-left: 20px;">
                        <li>Controlado por IA</li>
                        <li>Se mueve automáticamente</li>
                        <li>Ataca cuando está cerca</li>
                    </ul>
                </div>
                `}
            </div>
        `;
        
        document.body.appendChild(controlsContainer);
    }
    
    showStateInfo() {
        // Mostrar el estado actual para depuración
        const stateContainer = document.getElementById('state-info') || document.createElement('div');
        stateContainer.id = 'state-info';
        stateContainer.style.cssText = `
            position: fixed;
            top: 60px;
            left: 50%;
            transform: translateX(-50%);
            background-color: rgba(0, 0, 0, 0.7);
            color: white;
            padding: 5px 10px;
            border-radius: 5px;
            font-family: Arial, sans-serif;
            font-size: 12px;
        `;
        
        // Información de depuración dinámica
        const distance = this.position && this.positionP2 ? Math.abs(this.positionP2.x - this.position.x) : 0;
        const aiSpeed = this.p2Config?.stats?.speed ? (this.p2Config.stats.speed * this.aiMovementSpeed).toFixed(1) : 'N/A';
        
        stateContainer.innerHTML = `
            P1 (${this.p1Character}): 
            Estado: ${this.currentState} | Frame: ${this.currentFrame}/${this.p1Config?.animations?.[this.currentState]?.frames?.length - 1} | Timer: ${this.frameTimer.toFixed(2)}
            <br>
            Posición: x=${this.position.x.toFixed(0)}, y=${this.position.y.toFixed(0)} | 
            Grounded: ${this.isGrounded} | 
            Direction: ${this.isFacingRight ? '→' : '←'}
            <br>
            P2 (${this.p2Character}): 
            Estado: ${this.currentStateP2} | Frame: ${this.currentFrameP2}/${this.p2Config?.animations?.[this.currentStateP2]?.frames?.length - 1} | Timer: ${this.frameTimerP2.toFixed(2)}
            <br>
            Posición: x=${this.positionP2.x.toFixed(0)}, y=${this.positionP2.y.toFixed(0)} | 
            Grounded: ${this.isGroundedP2} | 
            Direction: ${this.isFacingRightP2 ? '→' : '←'}
            <br>
            🤖 IA: Distancia=${distance.toFixed(0)}px | Velocidad=${aiSpeed}x | Intervalo=${(this.aiDecisionInterval*1000).toFixed(0)}ms | Modo: ${this.gameMode}
        `;
        
        if (!document.getElementById('state-info')) {
            document.body.appendChild(stateContainer);
        }
    }

    cleanup() {
        // Detener el game loop
        this.isRunning = false;
        
        // Eliminar elementos de la UI
        const controlsElement = document.getElementById('controls-info');
        if (controlsElement) controlsElement.remove();
        
        const stateElement = document.getElementById('state-info');
        if (stateElement) stateElement.remove();
        
        // Ocultar el canvas
        const gameCanvas = document.getElementById('gameCanvas');
        if (gameCanvas) {
            gameCanvas.style.display = 'none';
        }
    }
}