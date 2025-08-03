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

export default class BattleScene {
    constructor(battleConfig, gameManager = null) {
        // Inyección de dependencia del GameManager (SOLID - DIP)
        this.gameManager = gameManager;
        
        // Configuración de batalla (SOLID - SRP)
        this.battleConfig = this.validateBattleConfig(battleConfig);
        this.p1Character = this.battleConfig.p1;
        this.p2Character = this.battleConfig.p2;
        this.gameMode = this.battleConfig.gameMode;
        
        // Validar datos de personajes desde mock DB
        this.characterData = this.loadCharacterData();
        
        // Sistemas de presentación (SOLID - SRP)
        this.renderer = null;
        this.inputManager = null;
        this.hud = null;
        this.audioManager = null;
        
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
            this.initializePresentationSystems();
            
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
            const module = await import(characterData.configPath);
            return module.default;
        } catch (error) {
            console.warn(`⚠️ No se pudo cargar config para ${characterData.name}, usando valores por defecto`);
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
    initializePresentationSystems() {
        console.log('🔧 Inicializando sistemas de presentación...');
        
        // Renderer
        this.renderer = new CanvasRenderer();
        
        // Input Manager
        this.inputManager = new InputManager();
        this.inputManager.init();
        
        // HUD
        this.hud = new HUD();
        
        // Audio Manager (sin await, inicialización asíncrona opcional)
        this.audioManager = new AudioManager();
        this.audioManager.init().catch(err => 
            console.warn('⚠️ AudioManager falló, continuando sin sonido:', err)
        );
        
        console.log('✅ Sistemas de presentación inicializados');
    }

    /**
     * Crear objetos de dominio (SOLID - SRP)
     */
    createDomainObjects() {
        console.log('👥 Creando objetos de dominio...');
        
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
        
        // Controlador del jugador 1 (humano)
        const p1Controller = new PlayerController(
            this.characters[0], 
            this.inputManager, 
            1 // playerIndex
        );
        
        // Controlador del jugador 2 (IA o humano según modo)
        let p2Controller;
        if (this.gameMode === 'vs-ai') {
            p2Controller = new AIController(
                this.characters[1], 
                'normal' // dificultad
            );
        } else {
            p2Controller = new PlayerController(
                this.characters[1], 
                this.inputManager, 
                2 // playerIndex
            );
        }
        
        this.controllers = [p1Controller, p2Controller];
        
        console.log('✅ Controladores configurados');
    }

    /**
     * Registrar con GameManager (SOLID - DIP)
     */
    registerWithGameManager() {
        if (this.gameManager && typeof this.gameManager.registerBattleScene === 'function') {
            this.gameManager.registerBattleScene(this);
            console.log('🔗 BattleScene registrada en GameManager');
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
        
        // Mostrar canvas si está oculto
        const canvas = document.getElementById('gameCanvas');
        if (canvas) {
            canvas.style.display = 'block';
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
            this.gameManager.updateGameState(deltaTime);
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
        JuiceManager.update();
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
        const shakeOffset = JuiceManager.getScreenShakeOffset();
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
        if (!animation || !animation.frames) return;
        
        const frame = animation.frames[character.currentFrameIndex];
        if (!frame) return;
        
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
        JuiceManager.drawParticles(ctx);
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
     * Crear efecto visual de hit (SOLID - SRP)
     */
    createVisualHitEffect(x, y) {
        this.visualEffects.hitEffects.push({
            x: x,
            y: y,
            life: 0.3
        });
        
        // Trigger screen shake y partículas
        JuiceManager.triggerScreenShake(5, 100);
        JuiceManager.createParticles({
            x: x, y: y,
            count: 8,
            color: 'orange',
            life: 20,
            speed: 100
        });
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
    cleanup() {
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
        
        // Desregistrar del GameManager
        if (this.gameManager && typeof this.gameManager.unregisterBattleScene === 'function') {
            this.gameManager.unregisterBattleScene();
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
