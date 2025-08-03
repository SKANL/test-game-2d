/**
 * GameManager - Gestión del estado del juego REFACTORIZADO v2.0
 * PRINCIPIOS SOLID: SRP - Solo gestión de estado y rollback netcode
 * ARQUITECTURA LIMPIA: Capa de aplicación pura
 * ELIMINADO: Responsabilidades de rendering, lógica duplicada
 * ENFOQUE: Orquestación del dominio, comunicación entre capas
 */
import GameState from '../domain/GameState.js';
import JuiceManager from '../infrastructure/JuiceManager.js';

export default class GameManager {
    constructor(apiClient = null) {
        // Estado del dominio (ÚNICA FUENTE DE VERDAD)
        this.gameState = new GameState();
        
        // Estado del GameManager
        this.isRunning = false;
        this.apiClient = apiClient;
        this.performanceMonitor = null; // Será inyectado externamente
        
        // Rollback netcode para multijugador futuro (Sección 11)
        this.rollbackSystem = {
            stateHistory: new Map(), // frameNumber -> gameStateJson
            currentFrame: 0,
            maxHistoryFrames: 180, // 3 segundos a 60fps
            tickRate: 60 // Ticks por segundo
        };
        
        // Comunicación con BattleScene (SOLID - DIP)
        this.battleSceneRef = null;
        
        // Configuración
        this.config = {
            enableRollback: true,
            autoSaveState: true,
            logVictories: true
        };
    }

    /**
     * Inyectar PerformanceMonitor (SOLID - DIP)
     */
    setPerformanceMonitor(performanceMonitor) {
        this.performanceMonitor = performanceMonitor;
        console.log('📊 PerformanceMonitor inyectado en GameManager');
    }

    /**
     * Registrar BattleScene para comunicación (SOLID - DIP)
     */
    registerBattleScene(battleScene) {
        this.battleSceneRef = battleScene;
        console.log('🔗 BattleScene registrada en GameManager v2.0');
    }

    /**
     * Desregistrar BattleScene (SOLID - SRP)
     */
    unregisterBattleScene() {
        this.battleSceneRef = null;
        console.log('🔗 BattleScene desregistrada del GameManager');
    }

    /**
     * Iniciar GameManager (SOLID - SRP)
     */
    startGame() {
        if (this.isRunning) {
            console.warn('⚠️ GameManager ya está corriendo');
            return;
        }
        
        this.isRunning = true;
        this.rollbackSystem.currentFrame = 0;
        this.rollbackSystem.stateHistory.clear();
        
        console.log('🎮 GameManager v2.0 iniciado (gestión de estado del dominio)');
    }

    /**
     * Actualizar estado del dominio (SOLID - SRP)
     * Llamado por BattleScene desde su gameloop
     */
    updateGameState(deltaTime) {
        if (!this.isRunning) return;

        // Debug log ocasional para verificar que GameManager.updateGameState se ejecuta
        if (Math.random() < 0.005) {
            console.log(`🎮 GameManager.updateGameState: deltaTime=${deltaTime.toFixed(4)}s, characters=${this.gameState.characters.length}`);
        }

        // Solo actualizar estado si no hay hitstop
        if (!JuiceManager.isHitStopActive()) {
            this.gameState.update(deltaTime);
            
            // Guardar estado para rollback si está habilitado
            if (this.config.enableRollback) {
                this.handleRollbackState();
            }
            
            // Verificar condiciones especiales del juego
            this.handleGameStateEvents();
        }
    }

    /**
     * Manejar eventos del estado del juego (SOLID - SRP)
     */
    handleGameStateEvents() {
        // Verificar si la ronda terminó
        if (this.gameState.isRoundOver()) {
            this.handleRoundEnd();
        }
        
        // Verificar si el match terminó
        if (this.gameState.isGameOver()) {
            this.handleMatchEnd();
        }
    }

    /**
     * Manejar fin de ronda (SOLID - SRP)
     */
    handleRoundEnd() {
        console.log('🏁 Fin de ronda detectado');
        
        // Notificar a BattleScene si está registrada
        if (this.battleSceneRef && typeof this.battleSceneRef.onRoundReset === 'function') {
            this.battleSceneRef.onRoundReset();
        }
        
        // Log de victoria si está habilitado
        if (this.config.logVictories) {
            const state = this.gameState.getState();
            console.log(`📊 Ronda ${state.round - 1} - Puntuación: P1:${state.scores.p1} P2:${state.scores.p2}`);
        }
    }

    /**
     * Manejar fin de match (SOLID - SRP)
     */
    handleMatchEnd() {
        const winner = this.gameState.getWinner();
        console.log(`🏆 Match terminado - Ganador: ${winner || 'Empate'}`);
        
        // Detener el GameManager
        this.stopGame();
        
        // Notificar a BattleScene si está registrada
        if (this.battleSceneRef && typeof this.battleSceneRef.onMatchEnd === 'function') {
            this.battleSceneRef.onMatchEnd(winner);
        }
    }

    /**
     * Manejar sistema de rollback (SOLID - SRP)
     */
    handleRollbackState() {
        this.rollbackSystem.currentFrame++;
        
        // Guardar estado cada ciertos frames para optimizar
        if (this.rollbackSystem.currentFrame % 2 === 0) {
            this.saveStateForRollback();
        }
    }

    /**
     * Agregar personajes al estado del juego (SOLID - ISP)
     */
    addCharacterToGameState(character) {
        return this.gameState.addCharacter(character);
    }

    /**
     * Obtener personajes del estado (SOLID - ISP)
     */
    getCharacters() {
        return this.gameState.characters;
    }

    /**
     * Obtener estado completo del juego (SOLID - ISP)
     */
    getGameState() {
        return this.gameState;
    }

    /**
     * Pausar el juego (SOLID - SRP)
     */
    pauseGame() {
        this.gameState.pauseGame();
        console.log('⏸️ Juego pausado por GameManager');
    }

    /**
     * Reanudar el juego (SOLID - SRP)
     */
    resumeGame() {
        this.gameState.resumeGame();
        console.log('▶️ Juego reanudado por GameManager');
    }

    /**
     * Reiniciar ronda (SOLID - SRP)
     */
    resetRound() {
        this.gameState.resetRound();
        
        // Limpiar historial de rollback
        this.rollbackSystem.stateHistory.clear();
        this.rollbackSystem.currentFrame = 0;
        
        // Notificar a BattleScene si está registrada
        if (this.battleSceneRef && typeof this.battleSceneRef.onRoundReset === 'function') {
            this.battleSceneRef.onRoundReset();
        }
        
        console.log('🔄 Ronda reiniciada por GameManager');
    }

    /**
     * Reiniciar match completo (SOLID - SRP)
     */
    resetMatch() {
        this.gameState.resetMatch();
        
        // Limpiar completamente el sistema de rollback
        this.rollbackSystem.stateHistory.clear();
        this.rollbackSystem.currentFrame = 0;
        
        // Notificar a BattleScene si está registrada
        if (this.battleSceneRef && typeof this.battleSceneRef.onMatchReset === 'function') {
            this.battleSceneRef.onMatchReset();
        }
        
        console.log('🆕 Match reiniciado por GameManager');
    }

    /**
     * Guardar estado para rollback (optimizado) (SOLID - SRP)
     */
    saveStateForRollback() {
        try {
            const frameNumber = this.rollbackSystem.currentFrame;
            const serializedState = this.gameState.serialize();
            
            this.rollbackSystem.stateHistory.set(frameNumber, serializedState);
            
            // Limpiar estados antiguos para evitar memory leaks
            this.cleanupOldStates();
            
        } catch (error) {
            console.warn('⚠️ Error guardando estado para rollback:', error);
        }
    }

    /**
     * Limpiar estados antiguos (SOLID - SRP)
     */
    cleanupOldStates() {
        const maxFrames = this.rollbackSystem.maxHistoryFrames;
        if (this.rollbackSystem.stateHistory.size > maxFrames) {
            const oldestFrame = this.rollbackSystem.currentFrame - maxFrames;
            this.rollbackSystem.stateHistory.delete(oldestFrame);
        }
    }

    /**
     * Rollback a un frame específico (para netcode futuro) (SOLID - OCP)
     */
    rollbackToFrame(frameNumber, correctInputs = null) {
        if (!this.rollbackSystem.stateHistory.has(frameNumber)) {
            console.warn(`⚠️ No se puede hacer rollback al frame ${frameNumber}`);
            return false;
        }

        try {
            // Cargar estado del frame especificado
            const stateJson = this.rollbackSystem.stateHistory.get(frameNumber);
            this.gameState = GameState.deserialize(stateJson);

            // Re-simular frames si se proporcionan inputs correctos
            if (correctInputs) {
                this.resimulateFrames(frameNumber, correctInputs);
            }
            
            return true;
        } catch (error) {
            console.error('❌ Error durante rollback:', error);
            return false;
        }
    }

    /**
     * Re-simular frames para rollback (SOLID - SRP)
     */
    resimulateFrames(fromFrame, correctInputs) {
        const tickRate = this.rollbackSystem.tickRate;
        const deltaTime = 1 / tickRate;
        
        for (let frame = fromFrame + 1; frame <= this.rollbackSystem.currentFrame; frame++) {
            // Aplicar entradas correctas para re-simulación
            // TODO: Implementar lógica de aplicación de inputs
            this.gameState.update(deltaTime);
        }
    }

    /**
     * Detener GameManager (SOLID - SRP)
     */
    stopGame() {
        if (!this.isRunning) return;
        
        this.isRunning = false;
        
        // Limpiar historial de estados
        this.rollbackSystem.stateHistory.clear();
        this.rollbackSystem.currentFrame = 0;
        
        // Desregistrar BattleScene
        this.unregisterBattleScene();
        
        console.log('🛑 GameManager v2.0 detenido');
    }

    /**
     * Verificar si hay un ganador (SOLID - SRP)
     */
    checkGameOver() {
        const winner = this.gameState.getWinner();
        if (winner) {
            this.stopGame();
            console.log(`🏆 Ganador detectado: ${winner}`);
            return winner;
        }
        return null;
    }

    /**
     * Enviar métricas al sistema de monitoreo (SOLID - DIP)
     */
    sendMetricsUpdate() {
        if (!this.performanceMonitor) return;
        
        try {
            const frameData = {
                currentFrame: this.rollbackSystem.currentFrame,
                gameTime: this.gameState.timer,
                p1Health: this.gameState.player1?.health || 0,
                p2Health: this.gameState.player2?.health || 0,
                gameStatus: this.gameState.status
            };
            
            this.performanceMonitor.recordFrame(frameData);
        } catch (error) {
            console.warn('⚠️ Error enviando métricas:', error);
        }
    }

    /**
     * Establecer velocidad del juego (para debug/testing) (SOLID - OCP)
     */
    setGameSpeed(speedMultiplier = 1.0) {
        this.rollbackSystem.tickRate = 60 * speedMultiplier;
        console.log(`⚙️ Velocidad del juego ajustada: ${speedMultiplier}x`);
    }

    /**
     * Obtener estadísticas actuales del juego (SOLID - ISP)
     */
    getGameStats() {
        return {
            isRunning: this.isRunning,
            currentFrame: this.rollbackSystem.currentFrame,
            tickRate: this.rollbackSystem.tickRate,
            stateHistorySize: this.rollbackSystem.stateHistory.size,
            gameTimer: this.gameState.timer,
            gameStatus: this.gameState.status,
            player1Health: this.gameState.player1?.health || 0,
            player2Health: this.gameState.player2?.health || 0,
            memoryUsage: this.rollbackSystem.stateHistory.size * 512 // Estimación en bytes
        };
    }

    /**
     * API optimizada para comunicación con BattleScene (SOLID - ISP)
     */
    getAPIForBattleScene() {
        return {
            updateGameState: (deltaTime) => this.updateGameState(deltaTime),
            getGameState: () => this.getGameState(),
            pauseGame: () => this.pauseGame(),
            resumeGame: () => this.resumeGame(),
            resetRound: () => this.resetRound(),
            resetMatch: () => this.resetMatch(),
            checkGameOver: () => this.checkGameOver(),
            getStats: () => this.getGameStats(),
            addCharacter: (character) => this.addCharacterToGameState(character),
            getCharacters: () => this.getCharacters()
        };
    }

    /**
     * Cleanup completo del GameManager (SOLID - SRP)
     */
    destroy() {
        this.stopGame();
        
        // Cleanup de todas las dependencias
        this.battleSceneRef = null;
        this.gameState = null;
        this.performanceMonitor = null;
        
        // Cleanup del sistema de rollback
        if (this.rollbackSystem) {
            this.rollbackSystem.stateHistory.clear();
            this.rollbackSystem = null;
        }
        
        console.log('🗑️ GameManager destruido completamente');
    }
}