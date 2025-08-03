class CanvasRenderer {
    constructor(canvasId = 'gameCanvas') {
        this.canvas = document.getElementById(canvasId);
        
        if (!this.canvas) {
            throw new Error(`Canvas con ID '${canvasId}' no encontrado en el DOM`);
        }
        
        this.ctx = this.canvas.getContext('2d');
        
        if (!this.ctx) {
            throw new Error(`No se pudo obtener el contexto 2D del canvas '${canvasId}'`);
        }
        
        // Configurar suavizado
        this.ctx.imageSmoothingEnabled = false;
        
        // Debug mode
        this.debugMode = false;
        
        // Screen shake offset
        this.shakeOffset = { x: 0, y: 0 };
        
        console.log(`✅ CanvasRenderer inicializado correctamente con canvas '${canvasId}'`);
    }

    clearCanvas() {
        this.ctx.save();
        
        // Aplicar screen shake si está activo
        this.ctx.translate(this.shakeOffset.x, this.shakeOffset.y);
        
        this.ctx.fillStyle = 'black';
        this.ctx.fillRect(-this.shakeOffset.x, -this.shakeOffset.y, this.canvas.width, this.canvas.height);
        
        this.ctx.restore();
    }

    drawSprite(sprite, x, y, width = null, height = null, flipped = false) {
        this.ctx.save();
        
        // Aplicar screen shake
        this.ctx.translate(this.shakeOffset.x, this.shakeOffset.y);
        
        // Aplicar flip si es necesario
        if (flipped) {
            this.ctx.scale(-1, 1);
            x = -x - (width || 64);
        }
        
        if (sprite && sprite instanceof Image && sprite.complete && sprite.naturalWidth > 0) {
            // Si hay sprite válido, usar sus dimensiones naturales o las especificadas
            const drawWidth = width || sprite.width;
            const drawHeight = height || sprite.height;
            this.ctx.drawImage(sprite, x, y, drawWidth, drawHeight);
        } else {
            // Si no hay sprite, usar dimensiones específicas para marcador de posición
            const placeholderWidth = width || 64;
            const placeholderHeight = height || 64;
            this.drawPlaceholder(x, y, placeholderWidth, placeholderHeight);
        }
        
        this.ctx.restore();
    }

    drawSpriteFrame(sprite, frameX, frameY, frameWidth, frameHeight, x, y, drawWidth, drawHeight, flipped = false) {
        this.ctx.save();
        
        // Aplicar screen shake
        this.ctx.translate(this.shakeOffset.x, this.shakeOffset.y);
        
        // Aplicar flip si es necesario
        if (flipped) {
            this.ctx.scale(-1, 1);
            x = -x - drawWidth;
        }
        
        if (!sprite || !(sprite instanceof Image) || !sprite.complete || sprite.naturalWidth === 0) {
            console.warn('Sprite no disponible para drawSpriteFrame');
            this.drawPlaceholder(x, y, drawWidth, drawHeight);
            this.ctx.restore();
            return;
        }
        
        // Verificar límites del sprite
        if (frameX + frameWidth > sprite.width || frameY + frameHeight > sprite.height) {
            console.error('Coordenadas fuera de límites:', {
                frame: `(${frameX}, ${frameY}, ${frameWidth}, ${frameHeight})`,
                sprite: `(${sprite.width}, ${sprite.height})`
            });
            this.drawPlaceholder(x, y, drawWidth, drawHeight);
            this.ctx.restore();
            return;
        }
        
        try {
            this.ctx.drawImage(
                sprite,
                frameX, frameY, frameWidth, frameHeight,
                x, y, drawWidth, drawHeight
            );
        } catch (error) {
            console.error('Error al dibujar frame:', error);
            this.drawPlaceholder(x, y, drawWidth, drawHeight);
        }
        
        this.ctx.restore();
    }

    drawPlaceholder(x, y, width, height) {
        this.ctx.save();
        this.ctx.fillStyle = '#ff00ff'; // Magenta brillante según especificación
        this.ctx.globalAlpha = 0.7;
        this.ctx.fillRect(x, y, width, height);
        
        // Dibujar una X para indicar que es un placeholder
        this.ctx.strokeStyle = '#ffffff';
        this.ctx.lineWidth = 2;
        this.ctx.globalAlpha = 1;
        this.ctx.beginPath();
        this.ctx.moveTo(x, y);
        this.ctx.lineTo(x + width, y + height);
        this.ctx.moveTo(x + width, y);
        this.ctx.lineTo(x, y + height);
        this.ctx.stroke();
        
        this.ctx.restore();
    }

    drawDebugRect(x, y, width, height, color = 'rgba(0,255,0,0.4)', label = '') {
        if (!this.debugMode) return;
        
        this.ctx.save();
        this.ctx.strokeStyle = color;
        this.ctx.fillStyle = color;
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(x, y, width, height);
        
        if (label) {
            this.ctx.fillStyle = '#ffffff';
            this.ctx.font = '12px Arial';
            this.ctx.fillText(label, x, y - 5);
        }
        
        this.ctx.restore();
    }

    setDebugMode(enabled) {
        this.debugMode = enabled;
    }
    
    setScreenShakeOffset(offset) {
        this.shakeOffset = offset;
    }

    drawText(text, x, y, options = {}) {
        this.ctx.save();
        
        // Aplicar screen shake
        this.ctx.translate(this.shakeOffset.x, this.shakeOffset.y);
        
        this.ctx.fillStyle = options.color || '#ffffff';
        this.ctx.font = options.font || '16px Arial';
        this.ctx.textAlign = options.align || 'left';
        this.ctx.fillText(text, x, y);
        this.ctx.restore();
    }

    drawBackground(backgroundImage, stageWidth = 1200, stageHeight = 600) {
        this.ctx.save();
        
        // Aplicar screen shake
        this.ctx.translate(this.shakeOffset.x, this.shakeOffset.y);
        
        if (backgroundImage && backgroundImage instanceof Image && backgroundImage.complete && backgroundImage.naturalWidth > 0) {
            // Escalar la imagen para que ocupe todo el canvas
            this.ctx.drawImage(backgroundImage, 0, 0, stageWidth, stageHeight);
        } else {
            // Fondo de placeholder con gradiente
            const gradient = this.ctx.createLinearGradient(0, 0, 0, stageHeight);
            gradient.addColorStop(0, '#001122');
            gradient.addColorStop(1, '#003366');
            this.ctx.fillStyle = gradient;
            this.ctx.fillRect(0, 0, stageWidth, stageHeight);
            
            // Dibujar texto indicando fondo faltante
            this.ctx.fillStyle = 'rgba(255,255,255,0.3)';
            this.ctx.font = '24px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('BACKGROUND MISSING', stageWidth/2, stageHeight/2);
        }
        
        this.ctx.restore();
    }

    drawHealthBar(x, y, width, height, currentHealth, maxHealth, color = '#ff0000') {
        const healthPercent = Math.max(0, currentHealth / maxHealth);
        
        // Fondo de la barra
        this.ctx.save();
        this.ctx.fillStyle = '#333333';
        this.ctx.fillRect(x, y, width, height);
        
        // Barra de salud
        this.ctx.fillStyle = color;
        this.ctx.fillRect(x, y, width * healthPercent, height);
        
        // Borde
        this.ctx.strokeStyle = '#ffffff';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(x, y, width, height);
        
        this.ctx.restore();
    }

    applyScreenShake(offset) {
        if (offset && (offset.x !== 0 || offset.y !== 0)) {
            this.ctx.save();
            this.ctx.translate(offset.x, offset.y);
        }
    }

    resetScreenShake() {
        this.ctx.restore();
    }

    // Método específico para personajes con configuración de frames
    drawCharacterFrame(sprite, frameData, x, y, scale = 1, isFacingRight = true) {
        if (!sprite || !frameData) {
            console.error('Sprite o frameData inválidos:', { sprite, frameData });
            this.drawPlaceholder(x, y, 64 * scale, 96 * scale);
            return;
        }

        // Verificar que todas las propiedades necesarias estén presentes
        if (typeof frameData.x !== 'number' || typeof frameData.y !== 'number' ||
            typeof frameData.width !== 'number' || typeof frameData.height !== 'number') {
            console.error('frameData incompleto:', frameData);
            this.drawPlaceholder(x, y, 64 * scale, 96 * scale);
            return;
        }

        // Validar que las coordenadas estén dentro de los límites del sprite
        if (frameData.x + frameData.width > sprite.width ||
            frameData.y + frameData.height > sprite.height) {
            console.error('Coordenadas fuera de los límites del sprite:', {
                spriteSize: `${sprite.width}x${sprite.height}`,
                frameCoords: `${frameData.x},${frameData.y},${frameData.width},${frameData.height}`
            });
            this.drawPlaceholder(x, y, 64 * scale, 96 * scale);
            return;
        }

        // Dimensiones de renderizado
        const drawWidth = frameData.width * scale;
        const drawHeight = frameData.height * scale;
        
        // Guardar el contexto actual
        this.ctx.save();
        
        try {
            if (!isFacingRight) {
                // Voltear horizontalmente para mirar a la izquierda
                this.ctx.translate(x + drawWidth, y);
                this.ctx.scale(-1, 1);
                this.ctx.drawImage(
                    sprite,
                    frameData.x, frameData.y, frameData.width, frameData.height,
                    0, 0, drawWidth, drawHeight
                );
            } else {
                // Dibujar normalmente mirando a la derecha
                this.ctx.drawImage(
                    sprite,
                    frameData.x, frameData.y, frameData.width, frameData.height,
                    x, y, drawWidth, drawHeight
                );
            }
        } catch (error) {
            console.error('Error al dibujar:', error);
            this.drawPlaceholder(x, y, drawWidth, drawHeight);
        }
        
        // Restaurar el contexto
        this.ctx.restore();
    }
}

export default CanvasRenderer;