/**
 * GameModeScene - Selección de modo de juego
 * Sección 9 del Documento Maestro
 */
export default class GameModeScene {
    constructor(onModeSelected) {
        this.onModeSelected = onModeSelected;
        this.selectedMode = null;
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
            background: linear-gradient(135deg, #2c3e50 0%, #4a6741 100%);
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            z-index: 1000;
            font-family: Arial, sans-serif;
        `;

        // Título principal
        const title = document.createElement('h1');
        title.textContent = 'SELECCIONA EL MODO DE JUEGO';
        title.style.cssText = `
            color: white;
            margin-bottom: 50px;
            font-size: 2.8rem;
            font-weight: bold;
            text-align: center;
            text-shadow: 0 4px 8px rgba(0,0,0,0.3);
            letter-spacing: 2px;
        `;

        // Contenedor de modos
        const modesContainer = document.createElement('div');
        modesContainer.style.cssText = `
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 30px;
            max-width: 1000px;
            width: 100%;
            padding: 0 20px;
        `;

        const modes = [
            {
                id: 'story',
                name: 'Modo Historia',
                description: 'Vive la historia de cada luchador',
                icon: '📖',
                color: '#e74c3c',
                enabled: false
            },
            {
                id: 'arcade',
                name: 'Modo Arcade',
                description: 'Combates consecutivos contra la CPU',
                icon: '🏆',
                color: '#f39c12',
                enabled: false
            },
            {
                id: 'pvp',
                name: 'Jugador vs Jugador',
                description: 'Combate local entre dos jugadores',
                icon: '👥',
                color: '#2ecc71',
                enabled: true
            },
            {
                id: 'cpu',
                name: 'Jugador vs CPU',
                description: 'Combate contra la inteligencia artificial',
                icon: '🤖',
                color: '#3498db',
                enabled: true
            },
            {
                id: 'training',
                name: 'Modo Entrenamiento',
                description: 'Practica combos y movimientos',
                icon: '🥋',
                color: '#9b59b6',
                enabled: false
            },
            {
                id: 'online',
                name: 'Combate Online',
                description: 'Enfréntate a jugadores de todo el mundo',
                icon: '🌐',
                color: '#1abc9c',
                enabled: false
            }
        ];

        modes.forEach(mode => {
            const modeCard = this.createModeCard(mode);
            modesContainer.appendChild(modeCard);
        });

        // Información adicional
        const infoText = document.createElement('p');
        infoText.textContent = 'Los modos marcados como "Próximamente" estarán disponibles en futuras actualizaciones';
        infoText.style.cssText = `
            color: rgba(255,255,255,0.7);
            text-align: center;
            margin-top: 30px;
            font-size: 1rem;
            font-style: italic;
        `;

        container.appendChild(title);
        container.appendChild(modesContainer);
        container.appendChild(infoText);

        document.body.appendChild(container);
    }

    createModeCard(mode) {
        const card = document.createElement('div');
        card.style.cssText = `
            background: ${mode.enabled ? 'rgba(255,255,255,0.1)' : 'rgba(100,100,100,0.1)'};
            border: 2px solid ${mode.enabled ? mode.color : '#666'};
            border-radius: 15px;
            padding: 30px;
            text-align: center;
            cursor: ${mode.enabled ? 'pointer' : 'not-allowed'};
            transition: all 0.3s ease;
            position: relative;
            overflow: hidden;
            opacity: ${mode.enabled ? 1 : 0.6};
        `;

        // Efecto hover solo para modos habilitados
        if (mode.enabled) {
            card.onmouseenter = () => {
                card.style.transform = 'translateY(-10px) scale(1.02)';
                card.style.boxShadow = `0 10px 30px ${mode.color}40`;
                card.style.background = `${mode.color}20`;
            };

            card.onmouseleave = () => {
                card.style.transform = 'translateY(0) scale(1)';
                card.style.boxShadow = 'none';
                card.style.background = 'rgba(255,255,255,0.1)';
            };

            card.onclick = () => {
                this.selectMode(mode.id);
            };
        }

        // Icono del modo
        const icon = document.createElement('div');
        icon.textContent = mode.icon;
        icon.style.cssText = `
            font-size: 4rem;
            margin-bottom: 20px;
            filter: ${mode.enabled ? 'none' : 'grayscale(1)'};
        `;

        // Nombre del modo
        const name = document.createElement('h3');
        name.textContent = mode.name;
        name.style.cssText = `
            color: ${mode.enabled ? mode.color : '#888'};
            font-size: 1.5rem;
            margin: 0 0 15px 0;
            font-weight: bold;
        `;

        // Descripción
        const description = document.createElement('p');
        description.textContent = mode.description;
        description.style.cssText = `
            color: ${mode.enabled ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.5)'};
            font-size: 1rem;
            margin: 0 0 20px 0;
            line-height: 1.4;
        `;

        // Estado del modo
        const status = document.createElement('div');
        if (mode.enabled) {
            status.textContent = 'DISPONIBLE';
            status.style.cssText = `
                background: ${mode.color};
                color: white;
                padding: 8px 16px;
                border-radius: 20px;
                font-size: 0.9rem;
                font-weight: bold;
                display: inline-block;
            `;
        } else {
            status.textContent = 'PRÓXIMAMENTE';
            status.style.cssText = `
                background: #666;
                color: #ccc;
                padding: 8px 16px;
                border-radius: 20px;
                font-size: 0.9rem;
                font-weight: bold;
                display: inline-block;
            `;
        }

        card.appendChild(icon);
        card.appendChild(name);
        card.appendChild(description);
        card.appendChild(status);

        return card;
    }

    selectMode(modeId) {
        this.selectedMode = modeId;
        
        // Efecto visual de selección
        const cards = document.querySelectorAll('[style*="border-radius: 15px"]');
        cards.forEach(card => {
            card.style.transform = 'scale(0.95)';
            card.style.opacity = '0.7';
        });

        // Mostrar confirmación
        setTimeout(() => {
            this.showModeConfirmation(modeId);
        }, 300);
    }

    showModeConfirmation(modeId) {
        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.8);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 2000;
        `;

        const confirmDialog = document.createElement('div');
        confirmDialog.style.cssText = `
            background: linear-gradient(135deg, #34495e, #2c3e50);
            padding: 40px;
            border-radius: 20px;
            text-align: center;
            max-width: 400px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.5);
            transform: scale(0);
            animation: popIn 0.3s ease-out forwards;
        `;

        // Añadir animación
        if (!document.getElementById('modeConfirmStyles')) {
            const style = document.createElement('style');
            style.id = 'modeConfirmStyles';
            style.textContent = `
                @keyframes popIn {
                    0% { transform: scale(0) rotate(180deg); }
                    100% { transform: scale(1) rotate(0deg); }
                }
            `;
            document.head.appendChild(style);
        }

        const modeNames = {
            'pvp': 'Jugador vs Jugador',
            'cpu': 'Jugador vs CPU',
            'story': 'Modo Historia',
            'arcade': 'Modo Arcade',
            'training': 'Modo Entrenamiento',
            'online': 'Combate Online'
        };

        confirmDialog.innerHTML = `
            <h2 style="color: #3498db; margin: 0 0 20px 0; font-size: 1.8rem;">Modo Seleccionado</h2>
            <p style="color: white; font-size: 1.3rem; margin: 0 0 30px 0; font-weight: bold;">${modeNames[modeId]}</p>
            <div style="display: flex; gap: 20px; justify-content: center;">
                <button id="confirmBtn" style="
                    background: #2ecc71;
                    color: white;
                    border: none;
                    padding: 12px 24px;
                    border-radius: 8px;
                    font-size: 1.1rem;
                    cursor: pointer;
                    font-weight: bold;
                ">CONFIRMAR</button>
                <button id="cancelBtn" style="
                    background: #e74c3c;
                    color: white;
                    border: none;
                    padding: 12px 24px;
                    border-radius: 8px;
                    font-size: 1.1rem;
                    cursor: pointer;
                    font-weight: bold;
                ">CANCELAR</button>
            </div>
        `;

        overlay.appendChild(confirmDialog);
        document.body.appendChild(overlay);

        // Event listeners
        document.getElementById('confirmBtn').onclick = () => {
            this.cleanup();
            if (this.onModeSelected) {
                this.onModeSelected(modeId);
            }
        };

        document.getElementById('cancelBtn').onclick = () => {
            overlay.remove();
            // Restaurar cards
            const cards = document.querySelectorAll('[style*="border-radius: 15px"]');
            cards.forEach(card => {
                card.style.transform = 'scale(1)';
                card.style.opacity = '1';
            });
        };
    }

    cleanup() {
        // Limpiar estilos
        const styles = document.getElementById('modeConfirmStyles');
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
