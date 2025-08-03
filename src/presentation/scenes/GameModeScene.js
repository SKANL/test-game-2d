export default class GameModeScene {
    constructor(onModeSelected) {
        this.onModeSelected = onModeSelected;
    }

    render() {
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
        title.textContent = 'Selecciona el Modo de Juego';
        title.style.cssText = `
            color: white;
            margin-bottom: 40px;
            font-size: 2.5rem;
            font-family: Arial, sans-serif;
        `;
        container.appendChild(title);

        const modeList = document.createElement('div');
        modeList.style.cssText = `
            display: flex;
            gap: 30px;
            justify-content: center;
            flex-wrap: wrap;
        `;

        const modes = [
            { id: 'pvp', name: 'Jugador vs Jugador' },
            { id: 'cpu', name: 'Jugador vs CPU' }
        ];

        modes.forEach(mode => {
            const modeButton = document.createElement('button');
            modeButton.textContent = mode.name;
            modeButton.style.cssText = `
                padding: 20px 40px;
                background-color: #007bff;
                color: white;
                border: none;
                border-radius: 10px;
                font-size: 18px;
                cursor: pointer;
                transition: all 0.3s;
                min-width: 200px;
            `;
            
            modeButton.onmouseover = () => {
                modeButton.style.backgroundColor = '#0056b3';
                modeButton.style.transform = 'scale(1.05)';
            };
            modeButton.onmouseout = () => {
                modeButton.style.backgroundColor = '#007bff';
                modeButton.style.transform = 'scale(1)';
            };
            
            modeButton.onclick = () => {
                if (this.onModeSelected) {
                    this.onModeSelected(mode.id);
                }
            };
            modeList.appendChild(modeButton);
        });

        container.appendChild(modeList);
        document.body.appendChild(container);
    }

    cleanup() {
        // Restaurar canvas si existe
        const gameCanvas = document.getElementById('gameCanvas');
        if (gameCanvas) {
            gameCanvas.style.display = 'block';
        }
    }
}
