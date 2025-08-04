/**
 * LoadingScene - Pantalla de carga con progreso y animaciones
 * Sección 9 del Documento Maestro
 */
export default class LoadingScene {
    constructor(onComplete) {
        this.onComplete = onComplete;
        this.progress = 0;
        this.progressBar = null;
        this.progressText = null;
        this.animationId = null;
        this.loadingTasks = [
            'Cargando sprites de personajes...',
            'Cargando fondos de escenarios...',
            'Cargando efectos de sonido...',
            'Cargando música de fondo...',
            'Inicializando motor de física...',
            'Configurando sistema de combate...',
            'Preparando interfaz de usuario...',
            'Finalizando carga...'
        ];
        this.currentTaskIndex = 0;
    }

    render() {
        // Ocultar canvas del juego si existe
        const gameCanvas = document.getElementById('gameCanvas');
        if (gameCanvas) {
            gameCanvas.style.display = 'none';
        }

        const container = document.createElement('div');
        container.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            z-index: 1000;
            font-family: Arial, sans-serif;
        `;

        // Logo/Título del juego
        const logo = document.createElement('div');
        logo.style.cssText = `
            text-align: center;
            margin-bottom: 50px;
        `;

        const title = document.createElement('h1');
        title.textContent = 'FIGHTER 2D';
        title.style.cssText = `
            color: white;
            margin: 0;
            font-size: 3.5rem;
            font-weight: bold;
            text-shadow: 0 4px 8px rgba(0,0,0,0.3);
            letter-spacing: 3px;
        `;

        const subtitle = document.createElement('p');
        subtitle.textContent = 'Cargando recursos del juego...';
        subtitle.style.cssText = `
            color: rgba(255,255,255,0.8);
            font-size: 1.2rem;
            margin: 10px 0 0 0;
        `;

        logo.appendChild(title);
        logo.appendChild(subtitle);

        // Contenedor de progreso
        const progressContainer = document.createElement('div');
        progressContainer.style.cssText = `
            width: 400px;
            text-align: center;
            margin-bottom: 30px;
        `;

        // Barra de progreso
        const progressBarContainer = document.createElement('div');
        progressBarContainer.style.cssText = `
            width: 100%;
            height: 20px;
            background: rgba(255,255,255,0.2);
            border-radius: 10px;
            overflow: hidden;
            margin-bottom: 15px;
            box-shadow: inset 0 2px 4px rgba(0,0,0,0.2);
        `;

        this.progressBar = document.createElement('div');
        this.progressBar.style.cssText = `
            width: 0%;
            height: 100%;
            background: linear-gradient(90deg, #4CAF50, #45a049);
            border-radius: 10px;
            transition: width 0.3s ease;
            box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        `;

        progressBarContainer.appendChild(this.progressBar);

        // Texto de progreso
        this.progressText = document.createElement('p');
        this.progressText.textContent = '0%';
        this.progressText.style.cssText = `
            color: white;
            font-size: 1.1rem;
            margin: 0;
            font-weight: bold;
        `;

        progressContainer.appendChild(progressBarContainer);
        progressContainer.appendChild(this.progressText);

        // Mensaje de tarea actual
        this.taskMessage = document.createElement('p');
        this.taskMessage.textContent = this.loadingTasks[0];
        this.taskMessage.style.cssText = `
            color: rgba(255,255,255,0.9);
            font-size: 1rem;
            margin: 20px 0;
            height: 25px;
            transition: opacity 0.3s ease;
        `;

        // Spinner animado
        const spinner = this.createSpinner();

        // Tips de juego
        const tipsContainer = this.createTipsContainer();

        container.appendChild(logo);
        container.appendChild(progressContainer);
        container.appendChild(this.taskMessage);
        container.appendChild(spinner);
        container.appendChild(tipsContainer);

        document.body.appendChild(container);

        // Iniciar simulación de carga
        this.startLoading();
    }

    createSpinner() {
        const spinner = document.createElement('div');
        spinner.style.cssText = `
            width: 40px;
            height: 40px;
            border: 4px solid rgba(255, 255, 255, 0.3);
            border-top: 4px solid white;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin: 20px 0;
        `;

        // Añadir animación CSS
        if (!document.getElementById('loadingSpinnerStyle')) {
            const style = document.createElement('style');
            style.id = 'loadingSpinnerStyle';
            style.textContent = `
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `;
            document.head.appendChild(style);
        }

        return spinner;
    }

    createTipsContainer() {
        const container = document.createElement('div');
        container.style.cssText = `
            position: absolute;
            bottom: 50px;
            left: 50%;
            transform: translateX(-50%);
            text-align: center;
            max-width: 600px;
            padding: 20px;
        `;

        const tipsTitle = document.createElement('h3');
        tipsTitle.textContent = '💡 Consejo:';
        tipsTitle.style.cssText = `
            color: #FFD700;
            margin: 0 0 10px 0;
            font-size: 1.2rem;
        `;

        const tips = [
            'Mantén presionado el botón de bloqueo para defenderte de los ataques enemigos.',
            'Los movimientos especiales consumen medidor de súper. ¡Úsalos sabiamente!',
            'Practica los combos para infligir más daño consecutivo.',
            'Cada personaje tiene diferentes fortalezas y debilidades.',
            'El timing es clave para contrarrestar los ataques del oponente.'
        ];

        this.tipText = document.createElement('p');
        this.tipText.textContent = tips[Math.floor(Math.random() * tips.length)];
        this.tipText.style.cssText = `
            color: rgba(255,255,255,0.8);
            font-size: 1rem;
            margin: 0;
            font-style: italic;
        `;

        container.appendChild(tipsTitle);
        container.appendChild(this.tipText);

        return container;
    }

    startLoading() {
        const totalTasks = this.loadingTasks.length;
        const taskDuration = 2000 / totalTasks; // 2 segundos total dividido entre tareas

        const updateProgress = () => {
            if (this.currentTaskIndex < totalTasks) {
                // Actualizar progreso
                this.progress = ((this.currentTaskIndex + 1) / totalTasks) * 100;
                this.updateProgressBar();

                // Actualizar mensaje de tarea
                this.taskMessage.textContent = this.loadingTasks[this.currentTaskIndex];

                this.currentTaskIndex++;

                // Continuar con la siguiente tarea
                setTimeout(updateProgress, taskDuration + (Math.random() * 500)); // Variación aleatoria
            } else {
                // Carga completada
                this.onLoadingComplete();
            }
        };

        // Iniciar la carga con un pequeño retraso
        setTimeout(updateProgress, 500);
    }

    updateProgressBar() {
        if (this.progressBar) {
            this.progressBar.style.width = `${this.progress}%`;
        }
        if (this.progressText) {
            this.progressText.textContent = `${Math.round(this.progress)}%`;
        }

        // Cambiar color de la barra según el progreso
        if (this.progressBar) {
            if (this.progress < 30) {
                this.progressBar.style.background = 'linear-gradient(90deg, #ff6b6b, #ee5a24)';
            } else if (this.progress < 70) {
                this.progressBar.style.background = 'linear-gradient(90deg, #f39c12, #e67e22)';
            } else {
                this.progressBar.style.background = 'linear-gradient(90deg, #4CAF50, #45a049)';
            }
        }
    }

    onLoadingComplete() {
        // Efecto de finalización
        this.taskMessage.textContent = '¡Carga completada!';
        this.taskMessage.style.color = '#4CAF50';
        this.taskMessage.style.fontWeight = 'bold';

        // Transición suave hacia la siguiente escena
        setTimeout(() => {
            this.cleanup();
            if (this.onComplete) {
                this.onComplete();
            }
        }, 1000);
    }

    cleanup() {
        // Limpiar animaciones
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }

        // Limpiar estilos
        const styles = document.getElementById('loadingSpinnerStyle');
        if (styles) {
            styles.remove();
        }

        // Restaurar canvas del juego si existe
        const gameCanvas = document.getElementById('gameCanvas');
        if (gameCanvas) {
            gameCanvas.style.display = 'block';
        }
    }
}