/**
 * IRenderer - Interfaz para sistemas de renderizado
 * Principio ISP: Interface Segregation Principle
 * Define el contrato para cualquier sistema de renderizado
 */

export default class IRenderer {
    /**
     * Inicializa el sistema de renderizado
     * @abstract
     */
    init() {
        throw new Error('El método init() debe ser implementado por la subclase');
    }

    /**
     * Limpia la pantalla/canvas
     * @abstract
     */
    clear() {
        throw new Error('El método clear() debe ser implementado por la subclase');
    }

    /**
     * Renderiza un sprite en la posición especificada
     * @abstract
     * @param {Object} sprite - Sprite a renderizar
     * @param {number} x - Posición X
     * @param {number} y - Posición Y
     */
    drawSprite(sprite, x, y) {
        throw new Error('El método drawSprite() debe ser implementado por la subclase');
    }

    /**
     * Renderiza un rectángulo
     * @abstract
     * @param {number} x - Posición X
     * @param {number} y - Posición Y
     * @param {number} width - Ancho
     * @param {number} height - Alto
     * @param {string} color - Color
     */
    drawRect(x, y, width, height, color) {
        throw new Error('El método drawRect() debe ser implementado por la subclase');
    }

    /**
     * Renderiza texto
     * @abstract
     * @param {string} text - Texto a renderizar
     * @param {number} x - Posición X
     * @param {number} y - Posición Y
     * @param {Object} style - Estilo del texto
     */
    drawText(text, x, y, style) {
        throw new Error('El método drawText() debe ser implementado por la subclase');
    }

    /**
     * Redimensiona el área de renderizado
     * @abstract
     * @param {number} width - Nuevo ancho
     * @param {number} height - Nueva altura
     */
    resize(width, height) {
        throw new Error('El método resize() debe ser implementado por la subclase');
    }
}
