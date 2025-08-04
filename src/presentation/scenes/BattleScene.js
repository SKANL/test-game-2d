/**
 * BattleScene - Escena de batalla REFACTORIZADA v2.0
 * ARQUITECTURA LIMPIA: Separación estricta de responsabilidades
 * PRINCIPIOS SOLID: SRP, OCP, LSP, ISP, DIP implementados
 * ELIMINADO: Código duplicado, lógica mezclada, dependencias circulares
 * ENFOQUE: Solo presentación y orquestación, lógica delegada al dominio
 */
import AssetLoader from '../../infrastructure/AssetLoader.js';
import CanvasRenderer from '../CanvasRenderer.js';
import mockDb from '../../data/mock-db.js';
import InputManager from '../../application/InputManager.js';
import AIController from '../../application/AIController.js';
import PlayerController from '../../application/PlayerController.js';
import HUD from '../HUD.js';
import AudioManager from '../../infrastructure/AudioManager.js';
import Character from '../../domain/Character.js';
import JuiceManager from '../../infrastructure/JuiceManager.js';
import VisualEffectsManager from '../VisualEffectsManager.js';
import ResponsiveUtils from '../../infrastructure/ResponsiveUtils.js';

export default class BattleScene {
    // Indica al SceneManager que no debe pre-cargar esta escena sin configuración
    static skipPreload = true;

    constructor(battleConfig, gameManager = null) {
        // Inyección de dependencia del GameManager (SOLID - DIP)
        this.gameManager = gameManager;
        
        // Configuración de batalla (SOLID - SRP)
        // Solo validar si se proporciona configuración para evitar errores durante registro
        if (battleConfig) {
            this.battleConfig = this.validateBattleConfig(battleConfig);
            this.p1Character = this.battleConfig.p1;
            this.p2Character = this.battleConfig.p2;
            this.gameMode = this.battleConfig.gameMode;
            
            // Validar datos de personajes desde mock DB solo con configuración válida
            this.characterData = this.loadCharacterData();
        } else {
            // Configuración por defecto para registro inicial
            this.battleConfig = null;
            this.p1Character = null;
            this.p2Character = null;
            this.gameMode = 'versus';
            this.characterData = null;
        }
        
        // Sistemas de presentación (SOLID - SRP)
        this.renderer = null;
        this.inputManager = null;
        this.hud = null;
        this.audioManager = null;
        this.juiceManager = null; // Para efectos de feedback visual
        
        // Referencias a objetos de dominio (ÚNICA FUENTE DE VERDAD)
        this.characters = [];
        
        // Controladores (SOLID - SRP)
        this.controllers = [];
        
        // Assets de presentación
        this.assets = {
            sprites: new Map(),
            sounds: new Map(),
            background: null
        };
        
        // Estado de renderizado (solo presentación)
        this.renderState = {
            animationFrameId: null,
            lastFrameTime: 0,
            isRunning: false,
            showDebug: false,
            showControls: false
        };
        
        // Efectos visuales (responsabilidad de presentación)
        this.visualEffects = {
            projectiles: [],
            hitEffects: [],
            particles: []
        };
        
        // Evitar hits múltiples en el mismo frame
        this.hitCooldowns = new Map();
    }

    /**
     * Validar configuración de batalla (SOLID - LSP)
     */
    validateBattleConfig(config) {
        if (!config || !config.p1 || !config.p2) {
            throw new Error('Configuración de batalla inválida');
        }
        return config;
    }

    /**
     * Cargar datos de personajes desde base de datos mock (SOLID - SRP)
     */
    loadCharacterData() {
        // Verificar que tenemos configuración válida
        if (!this.p1Character || !this.p2Character) {
            console.warn('⚠️ BattleScene: No hay personajes seleccionados para cargar');
            return null;
        }
        
        const p1Data = mockDb.characters.find(c => c.name === this.p1Character);
        const p2Data = mockDb.characters.find(c => c.name === this.p2Character);
        
        if (!p1Data || !p2Data) {
            throw new Error(`Personajes no encontrados: P1:${this.p1Character} P2:${this.p2Character}`);
        }
        
        return { p1: p1Data, p2: p2Data };
    }

    /**
     * Inicialización principal (SOLID - SRP)
     */
    async init() {
        console.log('🎮 Inicializando BattleScene v2.0...');
        
        try {
            // Cargar assets en paralelo para mejor performance
            await this.loadAssets();
            
            // Inicializar sistemas de presentación
            await this.initializePresentationSystems();
            
            // Crear objetos de dominio
            this.createDomainObjects();
            
            // Configurar controladores
            this.setupControllers();
            
            // Registrar escena en GameManager si existe
            this.registerWithGameManager();
            
            console.log('✅ BattleScene v2.0 inicializada correctamente');
        } catch (error) {
            console.error('❌ Error inicializando BattleScene:', error);
            throw error;
        }
    }

    /**
     * Carga optimizada de assets (SOLID - SRP)
     */
    async loadAssets() {
        console.log('📦 Cargando assets...');
        
        // Si no hay datos de personajes, no cargar assets (modo registro)
        if (!this.characterData || !this.characterData.p1 || !this.characterData.p2) {
            throw new Error('BattleScene: No se encontraron datos de personajes para cargar assets');
        }
        
        try {
            // Cargar configuraciones de personajes dinámicamente
            const [p1Config, p2Config] = await Promise.all([
                this.loadCharacterConfig(this.characterData.p1),
                this.loadCharacterConfig(this.characterData.p2)
            ]);
            
            // Cargar spritesheets
            const [p1Sprite, p2Sprite, background] = await Promise.all([
                AssetLoader.loadImage(this.characterData.p1.spriteSheetUrl),
                AssetLoader.loadImage(this.characterData.p2.spriteSheetUrl),
                this.loadStageBackground()
            ]);
            
            // Almacenar assets organizadamente
            this.assets.sprites.set('p1', { image: p1Sprite, config: p1Config });
            this.assets.sprites.set('p2', { image: p2Sprite, config: p2Config });
            this.assets.background = background;
            
            console.log('✅ Assets cargados correctamente');
        } catch (error) {
            console.error('❌ Error cargando assets:', error);
            throw error;
        }
    }

    /**
     * Cargar configuración de personaje dinámicamente (SOLID - OCP)
     */
    async loadCharacterConfig(characterData) {
        try {
            console.log(`🔧 Intentando cargar config de ${characterData.name} desde: ${characterData.configPath}`);
            // Usar import estático para mejor compatibilidad con Vite
            let module;
            if (characterData.name === 'Ken') {
                module = await import('../../characters_base/KenBase.js');
            } else if (characterData.name === 'Ryu') {
                module = await import('../../characters_base/RyuBase.js');
            } else {
                throw new Error(`Personaje no soportado: ${characterData.name}`);
            }
            
            console.log(`✅ Config de ${characterData.name} cargada correctamente:`, module.default);
            return module.default;
        } catch (error) {
            console.warn(`⚠️ No se pudo cargar config para ${characterData.name}, usando valores por defecto. Error:`, error);
            return this.getDefaultCharacterConfig();
        }
    }

    /**
     * Configuración por defecto para personajes (SOLID - LSP)
     */
    getDefaultCharacterConfig() {
        return {
            animations: { 
                idle: { 
                    frames: [{ x: 0, y: 0, width: 64, height: 96, type: 'active', duration: 12 }], 
                    frameRate: 8, 
                    loop: true 
                } 
            },
            stats: { health: 1000, speed: 80, jumpForce: -400 },
            specialMoves: [],
            superAttacks: []
        };
    }

    /**
     * Cargar fondo del escenario (SOLID - SRP)
     */
    async loadStageBackground() {
        const stage = mockDb.stages.find(s => s.enabled) || mockDb.stages[0];
        if (stage && stage.backgroundUrl) {
            return await AssetLoader.loadImage(stage.backgroundUrl);
        }
        return null;
    }

    /**
     * Inicializar sistemas de presentación (SOLID - SRP)
     */
    async initializePresentationSystems() {
        console.log('🔧 Inicializando sistemas de presentación...');
        
        // Renderer con ID del canvas
        this.renderer = new CanvasRenderer('gameCanvas');
        
        // Input Manager - Usar el existente del GameManager si está disponible
        if (this.gameManager && this.gameManager.inputManager) {
            this.inputManager = this.gameManager.inputManager;
        } else {
            // Crear uno nuevo solo si no existe
            this.inputManager = new InputManager();
            // Usar el método legacy por ahora para evitar problemas async
            this.inputManager.init();
        }
        
        // HUD (necesita el renderer)
        this.hud = new HUD(this.renderer);
        
        // Visual Effects Manager - Efectos épicos con anime.js
        this.vfx = new VisualEffectsManager();
        this.vfx.init();
        
        // Audio Manager (sin await, inicialización asíncrona opcional)
        this.audioManager = new AudioManager();
        this.audioManager.init().catch(err => 
            console.warn('⚠️ AudioManager falló, continuando sin sonido:', err)
        );
        
        // Juice Manager - Efectos de feedback visual
        this.juiceManager = new JuiceManager();
        await this.juiceManager.initialize();
        
        console.log('✅ Sistemas de presentación inicializados');
    }

    /**
     * Crear objetos de dominio (SOLID - SRP)
     */
    createDomainObjects() {
        console.log('👥 Creando objetos de dominio...');
        
        // NUEVO: Limpiar personajes existentes antes de crear nuevos
        if (this.gameManager && this.gameManager.clearCharactersFromGameState) {
            this.gameManager.clearCharactersFromGameState();
        }
        
        // Obtener configuraciones
        const p1Config = this.assets.sprites.get('p1').config;
        const p2Config = this.assets.sprites.get('p2').config;
        
        // Crear personajes del dominio
        const p1Character = new Character(
            'p1',
            this.p1Character,
            { x: 200, y: 300 },
            this.characterData.p1.health,
            0, // superMeter inicial
            p1Config
        );
        
        const p2Character = new Character(
            'p2',
            this.p2Character,
            { x: 800, y: 300 },
            this.characterData.p2.health,
            0, // superMeter inicial
            p2Config
        );
        
        this.characters = [p1Character, p2Character];
        
        // Registrar personajes en GameManager si existe
        if (this.gameManager) {
            this.gameManager.addCharacterToGameState(p1Character);
            this.gameManager.addCharacterToGameState(p2Character);
        }
        
        console.log('✅ Objetos de dominio creados');
    }

    /**
     * Configurar controladores (SOLID - ISP)
     */
    setupControllers() {
        console.log('🎮 Configurando controladores...');
        console.log(`🎯 Modo de juego detectado: '${this.gameMode}'`);
        
        // Controlador del jugador 1 (humano)
        const p1Controller = new PlayerController(
            1, // playerIndex
            this.characters[0], 
            this.inputManager,
            this.audioManager
        );
        
        // Controlador del jugador 2 (IA o humano según modo)
        let p2Controller;
        if (this.gameMode === 'vs-ai' || this.gameMode === 'cpu') {
            p2Controller = new AIController(
                this.characters[1], 
                'normal' // dificultad
            );
            console.log('🤖 Configurando AIController para jugador 2');
        } else {
            p2Controller = new PlayerController(
                2, // playerIndex
                this.characters[1], 
                this.inputManager,
                this.audioManager
            );
            console.log('👤 Configurando PlayerController para jugador 2');
        }
        
        this.controllers = [p1Controller, p2Controller];
        
        console.log('✅ Controladores configurados');
    }

    /**
     * Registrar con GameManager (SOLID - DIP)
     */
    registerWithGameManager() {
        console.log('🔍 registerWithGameManager - GameManager existe:', !!this.gameManager);
        console.log('🔍 GameManager.registerBattleScene existe:', this.gameManager && typeof this.gameManager.registerBattleScene === 'function');
        console.log('🔍 GameManager.startGame existe:', this.gameManager && typeof this.gameManager.startGame === 'function');
        
        if (this.gameManager && typeof this.gameManager.registerBattleScene === 'function') {
            this.gameManager.registerBattleScene(this);
            console.log('🔗 BattleScene registrada en GameManager');
            
            // ¡CRÍTICO! Iniciar el GameManager para que procese updates
            if (typeof this.gameManager.startGame === 'function') {
                this.gameManager.startGame();
                console.log('🚀 GameManager iniciado para procesar updates');
            } else {
                console.error('❌ GameManager.startGame no existe!');
            }
        } else {
            console.error('❌ GameManager o registerBattleScene no disponible!');
        }
    }

    /**
     * Renderizar escena (SOLID - SRP)
     */
    render() {
        if (!this.renderer) {
            console.warn('⚠️ Renderer no inicializado');
            return;
        }
        
        // Mostrar canvas si está oculto y configurar responsive
        const canvas = document.getElementById('gameCanvas');
        if (canvas) {
            canvas.style.display = 'block';
            // Asegurar que el canvas sea responsivo
            ResponsiveUtils.setupResponsiveCanvas(canvas);
        }
        
        // Iniciar gameloop de renderizado
        this.startGameLoop();
    }

    /**
     * Iniciar gameloop de renderizado (SOLID - SRP)
     */
    startGameLoop() {
        if (this.renderState.isRunning) {
            console.warn('⚠️ GameLoop ya está corriendo');
            return;
        }
        
        this.renderState.isRunning = true;
        this.renderState.lastFrameTime = performance.now();
        
        console.log('🎬 Iniciando gameloop de renderizado');
        this.gameLoop();
    }

    /**
     * GameLoop principal de renderizado (SOLID - SRP)
     */
    gameLoop(timestamp = performance.now()) {
        if (!this.renderState.isRunning) return;
        
        // Calcular deltaTime
        const deltaTime = Math.min((timestamp - this.renderState.lastFrameTime) / 1000, 0.016); // Max 16ms
        this.renderState.lastFrameTime = timestamp;
        
        // Actualizar (solo presentación, no lógica de dominio)
        this.updatePresentationLayer(deltaTime);
        
        // Notificar al GameManager para actualizar dominio si existe
        if (this.gameManager && typeof this.gameManager.updateGameState === 'function') {
            // Debug log ocasional para verificar que se llama
            if (Math.random() < 0.005) {
                console.log(`🎮 BattleScene llamando GameManager.updateGameState con deltaTime=${deltaTime.toFixed(4)}s`);
            }
            this.gameManager.updateGameState(deltaTime);
        } else {
            // Debug si no hay GameManager
            if (Math.random() < 0.01) {
                console.warn('⚠️ GameManager no disponible o updateGameState no existe');
            }
        }
        
        // Renderizar frame
        this.renderFrame();
        
        // Continuar gameloop
        this.renderState.animationFrameId = requestAnimationFrame((ts) => this.gameLoop(ts));
    }

    /**
     * Actualizar solo la capa de presentación (SOLID - SRP)
     */
    updatePresentationLayer(deltaTime) {
        // Actualizar controladores
        this.updateControllers(deltaTime);
        
        // Actualizar efectos visuales
        this.updateVisualEffects(deltaTime);
        
        // Actualizar JuiceManager
        if (this.juiceManager) {
            this.juiceManager.update();
        }
    }

    /**
     * Actualizar controladores (SOLID - SRP)
     */
    updateControllers(deltaTime) {
        this.controllers.forEach((controller, index) => {
            const opponent = this.characters[1 - index];
            controller.update(deltaTime, opponent);
        });
    }

    /**
     * Actualizar efectos visuales (SOLID - SRP)
     */
    updateVisualEffects(deltaTime) {
        // Actualizar proyectiles visuales
        this.visualEffects.projectiles = this.visualEffects.projectiles.filter(projectile => {
            projectile.x += projectile.speed * deltaTime;
            projectile.life -= deltaTime;
            return projectile.life > 0;
        });
        
        // Actualizar efectos de hit
        this.visualEffects.hitEffects = this.visualEffects.hitEffects.filter(effect => {
            effect.life -= deltaTime;
            return effect.life > 0;
        });
        
        // Actualizar partículas
        this.visualEffects.particles = this.visualEffects.particles.filter(particle => {
            particle.x += particle.vx * deltaTime;
            particle.y += particle.vy * deltaTime;
            particle.life -= deltaTime;
            return particle.life > 0;
        });
    }

    /**
     * Renderizar frame completo (SOLID - SRP)
     */
    renderFrame() {
        // Limpiar canvas
        this.renderer.clearCanvas();
        
        // Aplicar screen shake si existe
        const shakeOffset = this.juiceManager ? this.juiceManager.getScreenShakeOffset() : { x: 0, y: 0 };
        if (shakeOffset.x !== 0 || shakeOffset.y !== 0) {
            this.renderer.setScreenShakeOffset(shakeOffset);
        }
        
        // Renderizar fondo
        this.renderBackground();
        
        // Renderizar personajes
        this.renderCharacters();
        
        // Renderizar efectos visuales
        this.renderVisualEffects();
        
        // Renderizar HUD
        this.renderHUD();
        
        // Renderizar debug si está activado
        if (this.renderState.showDebug) {
            this.renderDebugInfo();
        }
    }

    /**
     * Renderizar fondo (SOLID - SRP)
     */
    renderBackground() {
        if (this.assets.background) {
            this.renderer.drawBackground(this.assets.background);
        } else {
            // Fondo por defecto
            const ctx = this.renderer.ctx;
            ctx.fillStyle = '#1a1a2e';
            ctx.fillRect(0, 0, 1200, 600);
        }
    }

    /**
     * Renderizar personajes (SOLID - SRP)
     */
    renderCharacters() {
        this.characters.forEach((character, index) => {
            const playerKey = index === 0 ? 'p1' : 'p2';
            const assetData = this.assets.sprites.get(playerKey);
            
            if (assetData && assetData.image && assetData.config) {
                this.renderCharacter(character, assetData.image, assetData.config);
            } else {
                // Renderizar placeholder si no hay sprite
                this.renderer.drawPlaceholder(
                    character.position.x, 
                    character.position.y, 
                    64, 
                    96
                );
            }
        });
    }

    /**
     * Renderizar un personaje específico (SOLID - SRP)
     */
    renderCharacter(character, spriteSheet, config) {
        const animation = config.animations[character.state];
        if (!animation || !animation.frames) {
            console.warn(`⚠️ No hay animación para el estado: ${character.state}`);
            return;
        }
        
        const frame = animation.frames[character.currentFrameIndex];
        if (!frame) {
            console.warn(`⚠️ No hay frame en índice: ${character.currentFrameIndex} para estado: ${character.state}`);
            return;
        }
        
        // Debug log cada 60 frames (~1 segundo)
        if (performance.now() % 1000 < 16) {
            console.log(`🎬 Renderizando: ${character.name} estado=${character.state} frame=${character.currentFrameIndex}/${animation.frames.length - 1}`);
        }
        
        // Renderizar sprite del personaje
        this.renderer.drawSpriteFrame(
            spriteSheet,
            frame.x, frame.y, frame.width, frame.height,
            character.position.x, character.position.y,
            frame.width * 2, frame.height * 2, // Scale 2x
            character.isFlipped
        );
        
        // Renderizar hitbox en modo debug
        if (this.renderState.showDebug && frame.hitbox) {
            const hitbox = frame.hitbox;
            this.renderer.drawDebugRect(
                character.position.x + hitbox.x,
                character.position.y + hitbox.y,
                hitbox.w,
                hitbox.h,
                'rgba(255,0,0,0.5)',
                'hitbox'
            );
        }
    }

    /**
     * Renderizar efectos visuales (SOLID - SRP)
     */
    renderVisualEffects() {
        const ctx = this.renderer.ctx;
        
        // Renderizar proyectiles
        this.visualEffects.projectiles.forEach(projectile => {
            ctx.fillStyle = projectile.color || 'yellow';
            ctx.fillRect(projectile.x, projectile.y, 20, 10);
        });
        
        // Renderizar efectos de hit
        this.visualEffects.hitEffects.forEach(effect => {
            ctx.fillStyle = `rgba(255,255,0,${effect.life})`;
            ctx.fillRect(effect.x - 10, effect.y - 10, 20, 20);
        });
        
        // Renderizar partículas
        if (this.juiceManager) {
            this.juiceManager.drawParticles(ctx);
        }
    }

    /**
     * Renderizar HUD (SOLID - SRP)
     */
    renderHUD() {
        if (!this.hud) return;
        
        // Obtener estado del juego
        let gameState = null;
        if (this.gameManager && typeof this.gameManager.getGameState === 'function') {
            gameState = this.gameManager.getGameState();
        }
        
        // Renderizar HUD con datos de personajes y estado
        this.hud.render(this.characters, gameState);
    }

    /**
     * Renderizar información de debug (SOLID - SRP)
     */
    renderDebugInfo() {
        const ctx = this.renderer.ctx;
        ctx.fillStyle = 'white';
        ctx.font = '14px monospace';
        
        let y = 20;
        this.characters.forEach((character, index) => {
            ctx.fillText(
                `P${index + 1}: ${character.state} Frame:${character.currentFrameIndex} HP:${character.health}`,
                10, y
            );
            y += 20;
        });
        
        ctx.fillText(`Visual Effects: ${this.visualEffects.projectiles.length + this.visualEffects.hitEffects.length}`, 10, y);
        y += 20;
        
        if (this.gameManager) {
            const metrics = this.gameManager.getMetrics();
            ctx.fillText(`Game Frame: ${metrics.currentFrame}`, 10, y);
        }
    }

    /**
     * Crear efecto visual de proyectil (SOLID - SRP)
     */
    createVisualProjectile(x, y, direction, config = {}) {
        this.visualEffects.projectiles.push({
            x: x,
            y: y,
            speed: (config.speed || 300) * direction,
            life: config.life || 3.0,
            color: config.color || 'yellow'
        });
    }

    /**
     * Crear efecto visual de hit ÉPICO (SOLID - SRP)
     */
    createVisualHitEffect(x, y, damage = 10) {
        this.visualEffects.hitEffects.push({
            x: x,
            y: y,
            life: 0.3
        });
        
        // Efectos épicos con VisualEffectsManager
        const intensity = Math.min(damage / 5, 15); // Escalar intensidad basada en daño
        
        // Screen shake épico
        this.vfx.screenShake(intensity);
        
        // Partículas épicas de impacto
        this.vfx.createParticleBurst(x, y, damage * 2, [
            '#ff4444', '#ffaa44', '#ffffff', '#ffd700'
        ]);
        
        // Efecto de shockwave para golpes fuertes
        if (damage > 15) {
            this.vfx.createShockwave(x, y, damage * 5);
        }
        
        // Flash effect para golpes críticos
        if (damage > 20) {
            this.vfx.flashEffect(0.4, 200);
        }
        
        // Mantener compatibilidad con JuiceManager existente
        if (this.juiceManager) {
            this.juiceManager.triggerScreenShake(5, 100);
            this.juiceManager.createParticles({
                x: x, y: y,
                count: 8,
                color: 'orange',
                life: 20,
                speed: 100
            });
        }
    }

    /**
     * Callbacks para eventos del GameManager (SOLID - ISP)
     */
    onRoundReset() {
        // Limpiar efectos visuales
        this.visualEffects.projectiles = [];
        this.visualEffects.hitEffects = [];
        this.visualEffects.particles = [];
        this.hitCooldowns.clear();
        
        console.log('🔄 BattleScene: Ronda reiniciada');
    }

    onMatchReset() {
        this.onRoundReset();
        console.log('🆕 BattleScene: Match reiniciado');
    }

    /**
     * Eventos épicos de batalla con efectos visuales
     */
    onRoundStart(roundNumber = 1) {
        if (this.vfx) {
            // Efecto épico de inicio de ronda
            this.vfx.createShockwave(400, 300, 300);
            this.vfx.flashEffect(0.5, 300);
        }
        
        if (this.hud && this.hud.triggerRoundStart) {
            this.hud.triggerRoundStart(roundNumber);
        }
        
        console.log(`⚔️ ¡ROUND ${roundNumber} START!`);
    }

    onPlayerKO(playerIndex, winnerIndex) {
        if (this.vfx) {
            // Efecto épico de KO
            const koPlayer = this.characters[playerIndex];
            if (koPlayer) {
                this.vfx.createKOEffect(koPlayer.position.x, koPlayer.position.y);
                this.vfx.screenShake(20);
                this.vfx.flashEffect(0.8, 500);
            }
        }
        
        if (this.hud && this.hud.triggerKO) {
            this.hud.triggerKO(`p${playerIndex + 1}`);
        }
        
        console.log(`💀 Player ${playerIndex + 1} KO! Winner: Player ${winnerIndex + 1}`);
    }

    onSuperMeterFull(playerIndex) {
        if (this.vfx) {
            const player = this.characters[playerIndex];
            if (player) {
                this.vfx.createPowerUpEffect(player.position.x, player.position.y);
                this.vfx.flashEffect(0.3, 200);
            }
        }
        
        console.log(`⚡ Player ${playerIndex + 1} SUPER READY!`);
    }

    onSpecialMove(playerIndex, moveName) {
        if (this.vfx) {
            const player = this.characters[playerIndex];
            if (player) {
                this.vfx.createShockwave(player.position.x, player.position.y, 200);
                this.vfx.createParticleBurst(player.position.x, player.position.y, 50, [
                    '#00f2ff', '#ff00c1', '#ffff00'
                ]);
            }
        }
        
        console.log(`🔥 Player ${playerIndex + 1} usa ${moveName}!`);
    }

    /**
     * Alternar modo debug (SOLID - SRP)
     */
    toggleDebug() {
        this.renderState.showDebug = !this.renderState.showDebug;
        if (this.renderer) {
            this.renderer.setDebugMode(this.renderState.showDebug);
        }
    }

    /**
     * Detener gameloop (SOLID - SRP)
     */
    stopGameLoop() {
        this.renderState.isRunning = false;
        if (this.renderState.animationFrameId) {
            cancelAnimationFrame(this.renderState.animationFrameId);
            this.renderState.animationFrameId = null;
        }
        console.log('🛑 GameLoop detenido');
    }

    /**
     * Limpieza completa (SOLID - SRP)
     */
    async cleanup() {
        console.log('🧹 Limpiando BattleScene v2.0...');
        
        // Detener gameloop
        this.stopGameLoop();
        
        // Limpiar input manager
        if (this.inputManager && typeof this.inputManager.cleanup === 'function') {
            this.inputManager.cleanup();
        }
        
        // Limpiar audio
        if (this.audioManager && typeof this.audioManager.cleanup === 'function') {
            this.audioManager.cleanup();
        }
        
        // Limpiar efectos visuales épicos
        if (this.vfx && typeof this.vfx.cleanup === 'function') {
            this.vfx.cleanup();
        }
        
        // Limpiar HUD
        if (this.hud && typeof this.hud.destroy === 'function') {
            this.hud.destroy();
        }
        
        // Desregistrar del GameManager
        if (this.gameManager && typeof this.gameManager.unregisterBattleScene === 'function') {
            this.gameManager.unregisterBattleScene();
        }
        
        // Limpiar sistemas específicos
        if (this.juiceManager) {
            await this.juiceManager.cleanup();
            this.juiceManager = null;
        }
        
        // Limpiar arrays y maps
        this.characters = [];
        this.controllers = [];
        this.assets.sprites.clear();
        this.assets.sounds.clear();
        this.visualEffects.projectiles = [];
        this.visualEffects.hitEffects = [];
        this.visualEffects.particles = [];
        this.hitCooldowns.clear();
        
        // Ocultar canvas
        const canvas = document.getElementById('gameCanvas');
        if (canvas) {
            canvas.style.display = 'none';
        }
        
        console.log('✅ BattleScene v2.0 limpiada');
    }
}
