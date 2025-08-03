export default class GameState {
    constructor() {
        this.timer = 99; // Tiempo de la ronda
        this.characters = []; // Lista de personajes en el juego
        this.status = 'playing'; // Estado del juego ('playing', 'paused', 'gameOver')
    }

    addCharacter(character) {
        this.characters.push(character);
    }

    update(deltaTime) {
        // Actualizar el estado de cada personaje
        this.characters.forEach(character => character.update(deltaTime));

        // Reducir el tiempo de la ronda
        if (this.status === 'playing') {
            this.timer -= deltaTime;
            if (this.timer <= 0) {
                this.status = 'gameOver';
            }
        }
    }

    detectCollisions() {
        // Lógica para detectar colisiones entre personajes
        this.characters.forEach((char1, index) => {
            this.characters.slice(index + 1).forEach(char2 => {
                if (this.checkCollision(char1, char2)) {
                    console.log(`${char1.name} golpeó a ${char2.name}`);
                }
            });
        });
    }

    checkCollision(char1, char2) {
        // Comprobar si dos personajes están colisionando
        return Math.abs(char1.position.x - char2.position.x) < 50 &&
               Math.abs(char1.position.y - char2.position.y) < 50;
    }
}