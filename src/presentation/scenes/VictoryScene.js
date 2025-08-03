/**
 * VictoryScene - Pantalla de victoria con puntuación y opciones
 * Implementa interfaz Scene con métodos compatibles con SceneManager
 */
export default class VictoryScene {
    constructor(dataOrGameManager) {
        console.log('🎉 VictoryScene constructor llamado con:', dataOrGameManager);
        
        // Configurar renderer y gameManager desde múltiples fuentes
        this.gameManager = dataOrGameManager?.gameManager || 
                          window.appController?.gameManager || 
                          window.gameManager || 
                          null;
        
        this.renderer = this.gameManager?.battleSceneRef?.renderer || 
                       window.appController?.renderer ||
                       null;
        
        // Si no tenemos renderer, intentar configurar desde DOM
        if (!this.renderer) {
            this.setupCanvasFromDOM();
        } else {
            this.canvas = this.renderer.canvas;
            this.ctx = this.renderer.ctx;
        }
        
        // Estado de la escena
        this.initialized = false;
        this.selectedOption = 0; // 0 = Rematch, 1 = Menu
        this.options = ['Nueva Batalla', 'Menú Principal'];
        
        // Si se pasan datos directamente en el constructor, guardarlos
        if (dataOrGameManager && typeof dataOrGameManager === 'object' && dataOrGameManager.winner !== undefined) {
            this.winnerData = dataOrGameManager;
            this.initialized = true;
            console.log('🎉 VictoryScene inicializada con datos del constructor');
        } else {
            this.winnerData = null;
        }
        
        console.log('🎉 VictoryScene creada, initialized:', this.initialized, 'canvas:', !!this.canvas, 'ctx:', !!this.ctx);
    }

    /**
     * Inicializar escena con datos de victoria
     */
    init(winnerData) {
        // Si no se pasó data en constructor, usar la que se pasa en init
        if (winnerData) {
            this.winnerData = winnerData;
        }
        
        // Configurar renderer si no se tenía
        if (!this.renderer && this.gameManager?.renderer) {
            this.renderer = this.gameManager.renderer;
            this.canvas = this.renderer.canvas;
            this.ctx = this.renderer.ctx;
        }
        
        this.initialized = true;
        console.log('🎉 VictoryScene inicializada con:', this.winnerData);
    }

    /**
     * Actualizar la escena (manejo de entrada)
     */
    update(deltaTime, inputManager) {
        if (!this.initialized || !inputManager) return;

        // Navegación del menú
        if (inputManager.keys['ArrowUp'] || inputManager.keys['w']) {
            this.selectedOption = Math.max(0, this.selectedOption - 1);
            inputManager.keys['ArrowUp'] = false;
            inputManager.keys['w'] = false;
        }
        
        if (inputManager.keys['ArrowDown'] || inputManager.keys['s']) {
            this.selectedOption = Math.min(this.options.length - 1, this.selectedOption + 1);
            inputManager.keys['ArrowDown'] = false;
            inputManager.keys['s'] = false;
        }

        // Selección con Enter o Espacio
        if (inputManager.keys['Enter'] || inputManager.keys[' ']) {
            this.selectOption();
            inputManager.keys['Enter'] = false;
            inputManager.keys[' '] = false;
        }
    }

    /**
     * Seleccionar opción del menú
     */
    selectOption() {
        console.log('🎮 Opción seleccionada:', this.selectedOption);
        
        // Buscar el sceneManager en varias ubicaciones posibles
        const sceneManager = this.sceneManager || 
                           this.gameManager?.sceneManager || 
                           window.appController?.sceneManager;
        
        if (!sceneManager) {
            console.warn('⚠️ SceneManager no encontrado, recargando página como fallback');
            window.location.reload();
            return;
        }
        
        switch (this.selectedOption) {
            case 0: // Nueva Batalla
                console.log('🔄 Iniciando nueva batalla...');
                sceneManager.transitionTo('characterSelect');
                break;
            case 1: // Menú Principal
                console.log('🏠 Volviendo al menú principal...');
                sceneManager.transitionTo('title');
                break;
        }
    }

    /**
     * Renderizar la escena
     */
    render() {
        if (!this.initialized || !this.winnerData) {
            console.warn('⚠️ VictoryScene.render: Escena no inicializada o sin datos');
            return;
        }

        // Verificar que tenemos canvas y contexto
        if (!this.ctx || !this.canvas) {
            console.warn('⚠️ VictoryScene.render: Canvas o contexto no disponible');
            this.setupCanvasFromDOM();
            if (!this.ctx || !this.canvas) {
                console.error('❌ VictoryScene: No se pudo obtener canvas');
                this.handleRenderError();
                return;
            }
        }

        try {
            // Limpiar canvas
            this.ctx.fillStyle = '#000015';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

            // Dibujar fondo con gradiente
            this.drawBackground();
            
            // Dibujar título de victoria
            this.drawVictoryTitle();
            
            // Dibujar información del ganador
            this.drawWinnerInfo();
            
            // Dibujar puntuación
            this.drawScoreInfo();
            
            // Dibujar opciones del menú
            this.drawMenuOptions();
            
            // Dibujar instrucciones
            this.drawInstructions();
        } catch (error) {
            console.error('❌ Error renderizando VictoryScene:', error);
            this.handleRenderError();
        }
    }

    /**
     * Configurar canvas desde DOM como fallback
     */
    setupCanvasFromDOM() {
        try {
            this.canvas = document.getElementById('gameCanvas');
            if (this.canvas) {
                this.ctx = this.canvas.getContext('2d');
                console.log('✅ VictoryScene: Canvas configurado desde DOM');
                return true;
            } else {
                console.warn('⚠️ VictoryScene: No se encontró gameCanvas en DOM');
                return false;
            }
        } catch (error) {
            console.error('❌ Error configurando canvas desde DOM:', error);
            return false;
        }
    }

    /**
     * Manejar errores de renderizado
     */
    handleRenderError() {
        // Mostrar pantalla de victoria alternativa en el DOM
        document.body.innerHTML = `
            <div style="display: flex; flex-direction: column; justify-content: center; align-items: center; height: 100vh; background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); color: #ffffff; font-family: Arial, sans-serif; text-align: center;">
                <div style="background: rgba(0, 0, 0, 0.3); border-radius: 15px; padding: 40px; max-width: 600px;">
                    <h1 style="color: #ffaa00; font-size: 48px; margin-bottom: 20px;">🏆 ${this.winnerData.winnerName || 'Ganador'} GANA!</h1>
                    <p style="font-size: 24px; margin: 20px 0;">Razón: ${this.winnerData.winReason || 'Victoria'}</p>
                    <p style="font-size: 20px; margin: 20px 0;">Puntuación: P1: ${this.winnerData.scores?.p1 || 0} - P2: ${this.winnerData.scores?.p2 || 0}</p>
                    <div style="margin-top: 30px;">
                        <button onclick="window.location.reload()" style="background: #4CAF50; color: white; border: none; padding: 15px 30px; border-radius: 5px; cursor: pointer; font-size: 18px; margin: 10px;">🔄 Nueva Batalla</button>
                        <button onclick="window.location.reload()" style="background: #2196F3; color: white; border: none; padding: 15px 30px; border-radius: 5px; cursor: pointer; font-size: 18px; margin: 10px;">🏠 Menú Principal</button>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Dibujar fondo con gradiente
     */
    drawBackground() {
        const gradient = this.ctx.createRadialGradient(
            this.canvas.width / 2, this.canvas.height / 2, 0,
            this.canvas.width / 2, this.canvas.height / 2, this.canvas.width
        );
        
        if (this.winnerData.winner === 'draw') {
            gradient.addColorStop(0, '#1a1a2e');
            gradient.addColorStop(1, '#16213e');
        } else {
            gradient.addColorStop(0, '#2d1b69');
            gradient.addColorStop(1, '#0f0f23');
        }
        
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    /**
     * Dibujar título de victoria
     */
    drawVictoryTitle() {
        this.ctx.save();
        
        // Sombra del texto
        this.ctx.shadowColor = 'rgba(255, 170, 0, 0.8)';
        this.ctx.shadowBlur = 20;
        this.ctx.shadowOffsetX = 3;
        this.ctx.shadowOffsetY = 3;
        
        // Texto principal
        this.ctx.fillStyle = '#ffaa00';
        this.ctx.font = 'bold 64px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('VICTORIA!', this.canvas.width / 2, 120);
        
        this.ctx.restore();
    }

    /**
     * Dibujar información del ganador
     */
    drawWinnerInfo() {
        this.ctx.save();
        
        let winnerText = '';
        let reasonText = '';
        
        if (this.winnerData.winner === 'draw') {
            winnerText = 'EMPATE!';
            reasonText = 'Tiempo agotado';
        } else {
            winnerText = `${this.winnerData.winnerName || 'Ganador'} GANA!`;
            reasonText = this.winnerData.winReason || 'Victory';
        }
        
        // Nombre del ganador
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = 'bold 36px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(winnerText, this.canvas.width / 2, 200);
        
        // Razón de la victoria
        this.ctx.fillStyle = '#cccccc';
        this.ctx.font = '24px Arial';
        this.ctx.fillText(reasonText, this.canvas.width / 2, 240);
        
        this.ctx.restore();
    }

    /**
     * Dibujar información de puntuación
     */
    drawScoreInfo() {
        this.ctx.save();
        
        const scores = this.winnerData.scores || { p1: 0, p2: 0 };
        const p1Name = this.winnerData.p1Name || 'Player 1';
        const p2Name = this.winnerData.p2Name || 'Player 2';
        
        // Título de puntuación
        this.ctx.fillStyle = '#ffaa00';
        this.ctx.font = 'bold 28px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('PUNTUACIÓN FINAL', this.canvas.width / 2, 320);
        
        // Puntuaciones
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = '24px Arial';
        this.ctx.textAlign = 'left';
        
        const scoreY = 360;
        const leftX = this.canvas.width / 2 - 150;
        
        this.ctx.fillText(`${p1Name}: ${scores.p1}`, leftX, scoreY);
        this.ctx.textAlign = 'right';
        const rightX = this.canvas.width / 2 + 150;
        this.ctx.fillText(`${p2Name}: ${scores.p2}`, rightX, scoreY);
        
        this.ctx.restore();
    }

    /**
     * Dibujar opciones del menú
     */
    drawMenuOptions() {
        this.ctx.save();
        
        // Título del menú
        this.ctx.fillStyle = '#ffaa00';
        this.ctx.font = 'bold 24px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('¿QUÉ DESEAS HACER?', this.canvas.width / 2, 450);
        
        // Opciones
        this.options.forEach((option, index) => {
            const y = 500 + (index * 50);
            const isSelected = index === this.selectedOption;
            
            // Fondo de la opción seleccionada
            if (isSelected) {
                this.ctx.fillStyle = 'rgba(255, 170, 0, 0.3)';
                this.ctx.fillRect(this.canvas.width / 2 - 150, y - 30, 300, 40);
            }
            
            // Texto de la opción
            this.ctx.fillStyle = isSelected ? '#ffaa00' : '#ffffff';
            this.ctx.font = isSelected ? 'bold 24px Arial' : '20px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(option, this.canvas.width / 2, y);
            
            // Indicador de selección
            if (isSelected) {
                this.ctx.fillStyle = '#ffaa00';
                this.ctx.font = 'bold 24px Arial';
                this.ctx.fillText('▶', this.canvas.width / 2 - 180, y);
                this.ctx.fillText('◀', this.canvas.width / 2 + 180, y);
            }
        });
        
        this.ctx.restore();
    }

    /**
     * Dibujar instrucciones
     */
    drawInstructions() {
        this.ctx.save();
        
        this.ctx.fillStyle = '#888888';
        this.ctx.font = '16px Arial';
        this.ctx.textAlign = 'center';
        
        const instructionY = this.canvas.height - 50;
        this.ctx.fillText('Usa ↑/↓ o W/S para navegar, Enter/Espacio para seleccionar', this.canvas.width / 2, instructionY);
        
        this.ctx.restore();
    }

    /**
     * Limpiar la escena al salir
     */
    cleanup() {
        console.log('🧹 Limpiando VictoryScene...');
        this.initialized = false;
        this.winnerData = null;
        this.canvas = null;
        this.ctx = null;
        this.renderer = null;
    }
}
