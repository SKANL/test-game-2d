import GameState from '../domain/GameState.js';
import LoginScene from '../presentation/scenes/LoginScene.js';
import AdminDashboardScene from '../presentation/scenes/AdminDashboardScene.js';
import LoadingScene from '../presentation/scenes/LoadingScene.js';
import CharacterSelectScene from '../presentation/scenes/CharacterSelectScene.js';
import BattleScene from '../presentation/scenes/BattleScene.js';

export default class GameManager {
    constructor() {
        this.gameState = new GameState();
        this.isRunning = false;
        this.currentScene = null;
        this.scenes = {
            login: new LoginScene(),
            adminDashboard: new AdminDashboardScene(),
            loading: new LoadingScene(),
            characterSelect: new CharacterSelectScene(this.handleCharacterSelection.bind(this)),
            battle: null // Se inicializa dinámicamente
        };
    }

    startGame() {
        this.isRunning = true;
        this.transitionToScene('login');
        this.gameLoop();
    }

    gameLoop() {
        if (!this.isRunning) return;

        const deltaTime = 1 / 60; // Simular 60 FPS
        this.gameState.update(deltaTime);

        // Continuar el bucle del juego
        setTimeout(() => this.gameLoop(), deltaTime * 1000);
    }

    stopGame() {
        this.isRunning = false;
    }

    transitionToScene(sceneName, data = null) {
        if (this.currentScene) {
            document.body.innerHTML = ''; // Limpiar la escena actual
        }
        if (sceneName === 'battle' && data) {
            this.scenes.battle = new BattleScene(data);
        }
        this.currentScene = this.scenes[sceneName];
        if (this.currentScene && typeof this.currentScene.render === 'function') {
            this.currentScene.render();
        }
    }

    clearScene() {
        document.body.innerHTML = ''; // Limpiar cualquier contenido previo
    }

    handleAuthentication(role) {
        if (role === 'ADMIN') {
            this.transitionToScene('adminDashboard');
        } else {
            this.transitionToScene('loading');
            setTimeout(() => this.transitionToScene('characterSelect'), 2000); // Simular carga
        }
    }

    handleCharacterSelection(selectedCharacter) {
        this.transitionToScene('battle', selectedCharacter);
    }
}