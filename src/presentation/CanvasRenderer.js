class CanvasRenderer {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        
        // Configurar suavizado
        this.ctx.imageSmoothingEnabled = false;
    }

    clearCanvas() {
        this.ctx.fillStyle = 'black';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    drawSprite(sprite, x, y, width = null, height = null) {
        if (sprite) {
            // Si hay sprite, usar sus dimensiones naturales o las especificadas
            const drawWidth = width || sprite.width;
            const drawHeight = height || sprite.height;
            this.ctx.drawImage(sprite, x, y, drawWidth, drawHeight);
        } else {
            // Si no hay sprite, usar dimensiones específicas para marcador de posición
            const placeholderWidth = width || 64;
            const placeholderHeight = height || 64;
            this.drawPlaceholder(x, y, placeholderWidth, placeholderHeight);
        }
    }

    drawSpriteFrame(sprite, frameX, frameY, frameWidth, frameHeight, x, y, drawWidth, drawHeight) {
        if (!sprite) {
            console.warn('Sprite no disponible para drawSpriteFrame');
            this.drawPlaceholder(x, y, drawWidth, drawHeight);
            return;
        }

        console.log('drawSpriteFrame:', {
            sprite: sprite.src || 'sprite cargado',
            frameX, frameY, frameWidth, frameHeight,
            x, y, drawWidth, drawHeight,
            spriteSize: `${sprite.width}x${sprite.height}`
        });
        
        // Verificar límites del sprite
        if (frameX + frameWidth > sprite.width || frameY + frameHeight > sprite.height) {
            console.error('Coordenadas fuera de límites:', {
                frame: `(${frameX}, ${frameY}, ${frameWidth}, ${frameHeight})`,
                sprite: `(${sprite.width}, ${sprite.height})`
            });
            this.drawPlaceholder(x, y, drawWidth, drawHeight);
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

        console.log('Dibujando personaje:', {
            spriteSize: `${sprite.width}x${sprite.height}`,
            frameData,
            position: `${x},${y}`,
            scale,
            direction: isFacingRight ? 'derecha' : 'izquierda'
        });

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

    drawPlaceholder(x, y, width, height) {
        this.ctx.fillStyle = 'magenta';
        this.ctx.fillRect(x, y, width, height);
        console.warn(`DIBUJANDO PLACEHOLDER en (${x}, ${y}) con dimensiones ${width}x${height}`);
    }

    drawDebugRect(x, y, width, height, color = 'red') {
        this.ctx.strokeStyle = color;
        this.ctx.strokeRect(x, y, width, height);
    }
}

export default CanvasRenderer;