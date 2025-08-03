export default class CharacterSelectScene {
    constructor(onCharactersSelected, gameMode) {
        this.onCharactersSelected = onCharactersSelected;
        this.gameMode = gameMode; // 'pvp' o 'cpu'
        this.selectedCharacters = {
            p1: null,
            p2: null
        };
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
            align-items: center;
            z-index: 1000;
        `;

        // Título principal
        const title = document.createElement('h1');
        title.textContent = 'Selección de Personajes';
        title.style.cssText = `
            color: white;
            margin: 20px 0;
            font-size: 2.5rem;
            font-family: Arial, sans-serif;
        `;
        container.appendChild(title);

        // Contenedor para las dos selecciones
        const selectionsContainer = document.createElement('div');
        selectionsContainer.style.cssText = `
            display: flex;
            justify-content: space-around;
            width: 100%;
            margin-top: 20px;
        `;

        // Selección Jugador 1
        const p1Section = this.createPlayerSection(
            'JUGADOR 1',
            (character) => this.selectCharacter('p1', character)
        );

        // Selección Jugador 2 / CPU
        const p2Section = this.createPlayerSection(
            this.gameMode === 'pvp' ? 'JUGADOR 2' : 'CPU',
            (character) => this.selectCharacter('p2', character)
        );

        selectionsContainer.appendChild(p1Section);
        selectionsContainer.appendChild(p2Section);
        container.appendChild(selectionsContainer);

        document.body.appendChild(container);
    }

    createPlayerSection(title, onSelect) {
        const section = document.createElement('div');
        section.style.cssText = `
            display: flex;
            flex-direction: column;
            align-items: center;
            padding: 20px;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 10px;
            margin: 10px;
        `;

        const titleEl = document.createElement('h2');
        titleEl.textContent = title;
        titleEl.style.cssText = `
            color: white;
            margin-bottom: 20px;
            font-size: 1.8rem;
            font-family: Arial, sans-serif;
        `;
        section.appendChild(titleEl);

        const characterList = document.createElement('div');
        characterList.style.cssText = `
            display: flex;
            flex-direction: column;
            gap: 15px;
        `;

        const characters = ['Ryu', 'Ken'];
        characters.forEach(character => {
            const charButton = document.createElement('button');
            charButton.textContent = character;
            charButton.style.cssText = `
                padding: 15px 30px;
                background-color: #007bff;
                color: white;
                border: none;
                border-radius: 5px;
                font-size: 16px;
                cursor: pointer;
                transition: all 0.3s;
                min-width: 150px;
            `;
            
            charButton.onmouseover = () => {
                charButton.style.backgroundColor = '#0056b3';
                charButton.style.transform = 'scale(1.05)';
            };
            charButton.onmouseout = () => {
                charButton.style.backgroundColor = '#007bff';
                charButton.style.transform = 'scale(1)';
            };
            
            charButton.onclick = () => onSelect(character);
            characterList.appendChild(charButton);
        });

        section.appendChild(characterList);
        return section;
    }

    selectCharacter(player, character) {
        this.selectedCharacters[player] = character;
        
        // Si ambos jugadores han seleccionado
        if (this.selectedCharacters.p1 && this.selectedCharacters.p2) {
            // Pasar la selección completa y el modo de juego
            this.onCharactersSelected({
                p1: this.selectedCharacters.p1,
                p2: this.selectedCharacters.p2,
                gameMode: this.gameMode
            });
        }
    }

    cleanup() {
        const gameCanvas = document.getElementById('gameCanvas');
        if (gameCanvas) {
            gameCanvas.style.display = 'block';
        }
    }
}