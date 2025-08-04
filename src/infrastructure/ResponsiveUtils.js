/**
 * ResponsiveUtils - Sistema de utilidades para diseño responsivo
 * Proporciona métodos centralizados para gestión responsiva de canvas y contenedores
 */
export default class ResponsiveUtils {
    /**
     * Configura un canvas para ser completamente responsivo
     * @param {HTMLCanvasElement} canvas - El canvas a configurar
     */
    static setupResponsiveCanvas(canvas) {
        if (!canvas) {
            console.warn('⚠️ ResponsiveUtils: Canvas no proporcionado para configuración responsiva');
            return;
        }

        const resizeCanvas = () => {
            const parent = canvas.parentElement || document.body;
            const rect = parent.getBoundingClientRect();
            
            // Configurar dimensiones del canvas
            canvas.width = rect.width;
            canvas.height = rect.height;
            
            // Asegurar que el canvas ocupe el espacio completo
            canvas.style.width = '100%';
            canvas.style.height = '100%';
        };

        // Configuración inicial
        resizeCanvas();

        // Listener para redimensionamiento
        const resizeHandler = () => {
            // Usar requestAnimationFrame para optimizar performance
            requestAnimationFrame(resizeCanvas);
        };

        window.addEventListener('resize', resizeHandler);
        
        // Guardar referencia para cleanup posterior
        canvas._responsiveCleanup = () => {
            window.removeEventListener('resize', resizeHandler);
        };

        return canvas;
    }

    /**
     * Obtiene estilos CSS responsivos para contenedores
     * @param {string} type - Tipo de contenedor ('main', 'card', 'button', etc.)
     * @returns {string} CSS string con estilos responsivos
     */
    static getResponsiveContainerStyles(type = 'main') {
        const baseStyles = {
            main: `
                width: 100%;
                height: 100vh;
                padding: clamp(1rem, 4vw, 2rem);
                font-size: clamp(0.875rem, 2.5vw, 1rem);
                overflow-x: hidden;
                overflow-y: auto;
            `,
            card: `
                width: 100%;
                max-width: min(90vw, 400px);
                padding: clamp(1rem, 4vw, 2rem);
                margin: clamp(0.5rem, 2vw, 1rem);
            `,
            button: `
                padding: clamp(0.5rem, 2vw, 1rem) clamp(1rem, 4vw, 2rem);
                font-size: clamp(0.875rem, 2.5vw, 1rem);
                border-radius: clamp(4px, 1vw, 8px);
            `,
            title: `
                font-size: clamp(1.5rem, 6vw, 3rem);
                margin-bottom: clamp(1rem, 4vw, 2rem);
                line-height: 1.2;
            `,
            text: `
                font-size: clamp(0.875rem, 2.5vw, 1rem);
                line-height: 1.5;
            `
        };

        return baseStyles[type] || baseStyles.main;
    }

    /**
     * Obtiene breakpoints CSS para media queries
     * @returns {object} Objeto con breakpoints definidos
     */
    static getBreakpoints() {
        return {
            mobile: '(max-width: 480px)',
            tablet: '(max-width: 768px)',
            desktop: '(min-width: 769px)',
            large: '(min-width: 1024px)',
            landscape: '(orientation: landscape)',
            portrait: '(orientation: portrait)'
        };
    }

    /**
     * Detecta el tipo de dispositivo actual
     * @returns {string} Tipo de dispositivo ('mobile', 'tablet', 'desktop')
     */
    static getDeviceType() {
        const width = window.innerWidth;
        
        if (width <= 480) return 'mobile';
        if (width <= 768) return 'tablet';
        return 'desktop';
    }

    /**
     * Verifica si el dispositivo está en orientación landscape
     * @returns {boolean} True si está en landscape
     */
    static isLandscape() {
        return window.innerWidth > window.innerHeight;
    }

    /**
     * Inicializa el sistema responsivo globalmente
     */
    static init() {
        console.log('📱 Sistema responsivo inicializado');
        
        // Agregar clase CSS al body según el tipo de dispositivo
        const deviceType = this.getDeviceType();
        document.body.classList.add(`device-${deviceType}`);
        
        // Actualizar clase según orientación
        const updateOrientation = () => {
            document.body.classList.toggle('landscape', this.isLandscape());
            document.body.classList.toggle('portrait', !this.isLandscape());
        };
        
        updateOrientation();
        window.addEventListener('resize', updateOrientation);
        window.addEventListener('orientationchange', updateOrientation);

        // Configurar viewport meta si no existe
        let viewport = document.querySelector('meta[name="viewport"]');
        if (!viewport) {
            viewport = document.createElement('meta');
            viewport.name = 'viewport';
            viewport.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no';
            document.head.appendChild(viewport);
        }
    }

    /**
     * Limpia listeners y recursos responsivos
     * @param {HTMLElement} element - Elemento a limpiar
     */
    static cleanup(element) {
        if (element && element._responsiveCleanup) {
            element._responsiveCleanup();
            delete element._responsiveCleanup;
        }
    }

    /**
     * Aplica estilos responsivos a un elemento
     * @param {HTMLElement} element - Elemento a estilizar
     * @param {string} type - Tipo de estilos a aplicar
     */
    static applyResponsiveStyles(element, type) {
        if (element && element.style) {
            const styles = this.getResponsiveContainerStyles(type);
            element.style.cssText += styles;
        }
    }

    /**
     * Configura un contenedor con estilos responsivos (alias para compatibilidad)
     * @param {HTMLElement} container - Contenedor a configurar
     * @param {string} type - Tipo de estilos a aplicar
     */
    static setupResponsiveContainer(container, type = 'main') {
        this.applyResponsiveStyles(container, type);
    }
}
