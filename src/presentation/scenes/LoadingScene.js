export default class LoadingScene {
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
            background-color: #000;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            z-index: 1000;
        `;

        const title = document.createElement('h1');
        title.textContent = 'Cargando...';
        title.style.cssText = `
            color: white;
            margin-bottom: 20px;
            font-size: 2.5rem;
            font-family: Arial, sans-serif;
        `;
        container.appendChild(title);

        const loadingMessage = document.createElement('p');
        loadingMessage.textContent = 'Por favor espera mientras se cargan los recursos del juego.';
        loadingMessage.style.cssText = `
            color: white;
            font-size: 1.2rem;
            font-family: Arial, sans-serif;
            margin-bottom: 30px;
        `;
        container.appendChild(loadingMessage);

        // Agregar spinner de carga animado
        const spinner = document.createElement('div');
        spinner.style.cssText = `
            width: 50px;
            height: 50px;
            border: 5px solid rgba(255, 255, 255, 0.3);
            border-top: 5px solid white;
            border-radius: 50%;
            animation: spin 1s linear infinite;
        `;
        
        // Agregar CSS para la animación
        const style = document.createElement('style');
        style.textContent = `
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
        `;
        document.head.appendChild(style);
        
        container.appendChild(spinner);
        document.body.appendChild(container);
    }

    cleanup() {
        // Restaurar canvas del juego si existe
        const gameCanvas = document.getElementById('gameCanvas');
        if (gameCanvas) {
            gameCanvas.style.display = 'block';
        }
    }
}