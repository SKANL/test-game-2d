/**
 * IManager - Interfaz base para todos los managers
 * Principio ISP: Interface Segregation Principle
 * Define el contrato básico para sistemas de gestión
 */

export default class IManager {
    /**
     * Inicializa el manager
     * @abstract
     */
    async init() {
        throw new Error('El método init() debe ser implementado por la subclase');
    }

    /**
     * Actualiza el manager
     * @abstract
     * @param {number} deltaTime - Tiempo transcurrido
     */
    update(deltaTime) {
        throw new Error('El método update() debe ser implementado por la subclase');
    }

    /**
     * Limpia recursos del manager
     * @abstract
     */
    cleanup() {
        throw new Error('El método cleanup() debe ser implementado por la subclase');
    }

    /**
     * Obtiene el estado actual del manager
     * @abstract
     * @returns {Object} Estado actual
     */
    getState() {
        throw new Error('El método getState() debe ser implementado por la subclase');
    }

    /**
     * Establece el estado del manager
     * @abstract
     * @param {Object} state - Nuevo estado
     */
    setState(state) {
        throw new Error('El método setState() debe ser implementado por la subclase');
    }
}
