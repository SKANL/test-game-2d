import GameManager from './application/GameManager.js';
import SceneManager from './application/SceneManager.js';
import AuthManager from './infrastructure/AuthManager.js';
import LoginScene from './presentation/scenes/LoginScene.js';
import LoadingScene from './presentation/scenes/LoadingScene.js';
import GameModeScene from './presentation/scenes/GameModeScene.js';
import CharacterSelectScene from './presentation/scenes/CharacterSelectScene.js';
import BattleScene from './presentation/scenes/BattleScene.js';

// Inicialización del sistema según las instrucciones
const authManager = new AuthManager();
const sceneManager = new SceneManager();
const gameManager = new GameManager();

// Registrar escenas en el SceneManager
sceneManager.registerScene('login', LoginScene);
sceneManager.registerScene('loading', LoadingScene);
sceneManager.registerScene('characterSelect', CharacterSelectScene);
sceneManager.registerScene('battle', BattleScene);

// Función principal de inicialización
async function initializeGame() {
    // 1. Inicializar AuthManager
    authManager.init();
    
    // 2. Verificar autenticación
    if (!authManager.isAuthenticated()) {
        // Si no está autenticado, ir a LoginScene
        const loginScene = new LoginScene((role) => {
            // Callback de autenticación exitosa
            handleAuthentication(role);
        });
        loginScene.render();
    } else {
        // Si ya está autenticado, proceder según el rol
        const user = authManager.getUser();
        handleAuthentication(user.role);
    }
}

function handleAuthentication(role) {
    if (role === 'ADMIN') {
        // Transicionar a AdminDashboard (no implementado aún)
        console.log('Transicionando a Admin Dashboard');
    } else {
        // Flujo normal de usuario
        transitionToGameMode();
    }
}

function transitionToLoading() {
    // Limpiar DOM completamente
    document.body.innerHTML = '';
    
    const loadingScene = new LoadingScene();
    loadingScene.render();
    
    // Simular carga de recursos
    setTimeout(() => {
        transitionToCharacterSelect();
    }, 2000);
}

function transitionToGameMode() {
    const gameModeScene = new GameModeScene((selectedMode) => {
        transitionToCharacterSelect(selectedMode);
    });
    
    document.body.innerHTML = '';
    gameModeScene.render();
}

function transitionToCharacterSelect(gameMode) {
    const characterSelect = new CharacterSelectScene((selections) => {
        transitionToBattle(selections);
    }, gameMode);
    
    document.body.innerHTML = '';
    characterSelect.render();
}

function transitionToBattle(battleConfig) {
    sceneManager.transitionTo('battle', battleConfig);
}

// Iniciar el juego
initializeGame();