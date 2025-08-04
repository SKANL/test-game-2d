/**
 * IScene - Interfaz base para todas las escenas
 * Principio ISP: Interface Segregation Principle
 * Define el contrato mínimo que debe cumplir cualquier escena
 */

export default class IScene {
    /**
     * Inicializa la escena
     * @abstract
     */
    async init() {
        throw new Error('El método init() debe ser implementado por la subclase');
    }

    /**
     * Renderiza la escena
     * @abstract
     */
    render() {
        throw new Error('El método render() debe ser implementado por la subclase');
    }

    /**
     * Actualiza la lógica de la escena
     * @abstract
     * @param {number} deltaTime - Tiempo transcurrido desde la última actualización
     */
    update(deltaTime) {
        throw new Error('El método update() debe ser implementado por la subclase');
    }

    /**
     * Limpia recursos cuando la escena se destruye
     * @abstract
     */
    cleanup() {
        throw new Error('El método cleanup() debe ser implementado por la subclase');
    }

    /**
     * Maneja eventos de entrada
     * @abstract
     * @param {Event} event - Evento a manejar
     */
    handleInput(event) {
        // Implementación opcional
    }

    /**
     * Pausa la escena
     * @abstract
     */
    pause() {
        // Implementación opcional
    }

    /**
     * Reanuda la escena
     * @abstract
     */
    resume() {
        // Implementación opcional
    }
}
