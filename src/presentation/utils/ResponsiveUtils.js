/**
 * ResponsiveUtils - Utilidades para hacer interfaces responsivas
 * Sistema centralizado de responsividad para todas las escenas
 */

export class ResponsiveUtils {
    
    // Breakpoints estándar
    static BREAKPOINTS = {
        mobile: '480px',
        tablet: '768px',
        desktop: '1024px',
        large: '1440px'
    };

    /**
     * Aplica estilos responsivos al contenedor principal de una escena
     */
    static getResponsiveContainerStyles() {
        return `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: var(--dark-bg);
            background-image: 
                radial-gradient(circle at 20% 80%, rgba(0, 242, 255, 0.15) 0%, transparent 50%),
                radial-gradient(circle at 80% 20%, rgba(255, 0, 193, 0.15) 0%, transparent 50%);
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            z-index: 1000;
            font-family: 'Inter', sans-serif;
            overflow-x: hidden;
            overflow-y: auto;
            padding: clamp(1rem, 4vw, 2rem);
        `;
    }

    /**
     * Estilos para títulos responsivos
     */
    static getResponsiveTitleStyles() {
        return `
            font-family: 'Orbitron', monospace;
            font-size: clamp(1.5rem, 6vw, 3rem);
            font-weight: 900;
            color: #fff;
            margin-bottom: clamp(1rem, 4vw, 2rem);
            text-shadow: 0 0 10px var(--primary-glow), 0 0 20px var(--primary-glow);
            text-align: center;
            z-index: 3;
        `;
    }

    /**
     * Estilos para botones responsivos
     */
    static getResponsiveButtonStyles() {
        return `
            background: transparent;
            border: 2px solid var(--primary-glow);
            color: var(--primary-glow);
            padding: clamp(0.8rem, 2vw, 1rem) clamp(1.5rem, 4vw, 2rem);
            border-radius: 8px;
            font-family: 'Orbitron', monospace;
            font-size: clamp(0.9rem, 2.5vw, 1.1rem);
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            text-transform: uppercase;
            letter-spacing: 2px;
            box-shadow: 0 0 10px rgba(0, 242, 255, 0.3);
            width: 100%;
            min-width: 200px;
            max-width: 300px;
        `;
    }

    /**
     * Estilos para contenedores de formulario responsivos
     */
    static getResponsiveFormContainerStyles() {
        return `
            width: 100%;
            max-width: min(90vw, 400px);
            background: rgba(0, 0, 0, 0.3);
            border: 1px solid var(--primary-glow);
            border-radius: 15px;
            padding: clamp(1.5rem, 4vw, 2rem);
            box-shadow: 
                0 0 30px rgba(0, 242, 255, 0.3),
                inset 0 0 30px rgba(0, 242, 255, 0.1);
            backdrop-filter: blur(10px);
            z-index: 3;
            position: relative;
        `;
    }

    /**
     * Estilos para inputs responsivos
     */
    static getResponsiveInputStyles() {
        return `
            width: 100%;
            padding: clamp(0.8rem, 2vw, 1rem);
            background: rgba(0, 242, 255, 0.1);
            border: 1px solid var(--primary-glow);
            border-radius: 8px;
            color: var(--text-color);
            font-family: 'Inter', sans-serif;
            font-size: clamp(0.9rem, 2vw, 1rem);
            box-shadow: 0 0 10px rgba(0, 242, 255, 0.3) inset;
            transition: all 0.3s ease;
        `;
    }

    /**
     * Configura un canvas para ser responsivo
     */
    static setupResponsiveCanvas(canvas) {
        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        
        // Configurar canvas inicial
        canvas.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 1;
            pointer-events: none;
        `;
        
        resizeCanvas();
        
        // Crear handler de resize
        const resizeHandler = resizeCanvas;
        window.addEventListener('resize', resizeHandler);
        
        // Retornar función de cleanup
        return () => {
            window.removeEventListener('resize', resizeHandler);
        };
    }

    /**
     * Estilos para menús responsivos
     */
    static getResponsiveMenuStyles() {
        return `
            display: flex;
            flex-direction: column;
            gap: clamp(0.8rem, 2vw, 1rem);
            z-index: 3;
            width: 100%;
            max-width: 300px;
            align-items: center;
        `;
    }

    /**
     * Estilos para cards responsivos
     */
    static getResponsiveCardStyles() {
        return `
            background: rgba(0, 0, 0, 0.3);
            border: 1px solid var(--primary-glow);
            border-radius: 12px;
            padding: clamp(1rem, 3vw, 1.5rem);
            margin: clamp(0.5rem, 2vw, 1rem);
            box-shadow: 
                0 0 20px rgba(0, 242, 255, 0.3),
                inset 0 0 20px rgba(0, 242, 255, 0.1);
            backdrop-filter: blur(10px);
            transition: all 0.3s ease;
            cursor: pointer;
            position: relative;
            overflow: hidden;
            width: 100%;
            max-width: clamp(250px, 40vw, 300px);
        `;
    }

    /**
     * Estilos para texto responsivo
     */
    static getResponsiveTextStyles() {
        return `
            font-size: clamp(0.8rem, 2vw, 1rem);
            line-height: 1.5;
            color: var(--text-color);
        `;
    }

    /**
     * Aplica media queries para diferentes dispositivos
     */
    static addMediaQueries() {
        const style = document.createElement('style');
        style.textContent = `
            /* Mobile adjustments */
            @media (max-width: ${this.BREAKPOINTS.mobile}) {
                .title-menu {
                    width: 100% !important;
                    max-width: none !important;
                }
                
                .holographic-form {
                    max-width: 95vw !important;
                    padding: 1rem !important;
                }
                
                .options-container {
                    max-width: 95vw !important;
                    padding: 1rem !important;
                }
                
                .tabs {
                    flex-wrap: wrap !important;
                    justify-content: center !important;
                }
            }
            
            /* Tablet adjustments */
            @media (min-width: ${this.BREAKPOINTS.mobile}) and (max-width: ${this.BREAKPOINTS.tablet}) {
                .title-menu {
                    max-width: 80vw !important;
                }
                
                .holographic-form {
                    max-width: 80vw !important;
                }
                
                .options-container {
                    max-width: 85vw !important;
                }
            }
            
            /* Landscape mobile adjustments */
            @media (max-height: 500px) and (orientation: landscape) {
                .title-scene-container,
                .login-scene-container,
                .options-scene-container {
                    justify-content: flex-start !important;
                    padding-top: 2rem !important;
                }
                
                h1 {
                    font-size: clamp(1.2rem, 4vw, 2rem) !important;
                    margin-bottom: 1rem !important;
                }
            }
            
            /* High DPI displays */
            @media (-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi) {
                .holographic-form,
                .options-container,
                .card {
                    border-width: 0.5px !important;
                }
            }
        `;
        
        if (!document.head.querySelector('#responsive-styles')) {
            style.id = 'responsive-styles';
            document.head.appendChild(style);
        }
    }

    /**
     * Inicializa el sistema responsivo
     */
    static init() {
        this.addMediaQueries();
        
        // Detectar cambios de orientación
        window.addEventListener('orientationchange', () => {
            setTimeout(() => {
                window.dispatchEvent(new Event('resize'));
            }, 100);
        });
    }

    /**
     * Cleanup del sistema responsivo
     */
    static cleanup() {
        const style = document.head.querySelector('#responsive-styles');
        if (style) {
            style.remove();
        }
    }
}

export default ResponsiveUtils;
