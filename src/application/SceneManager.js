export default class SceneManager {
    constructor() {
        this.currentScene = null;
        this.scenes = new Map();
    }

    registerScene(name, scene) {
        this.scenes.set(name, scene);
    }

    transitionTo(sceneName, data = null) {
        // Limpiar escena actual
        if (this.currentScene && typeof this.currentScene.cleanup === 'function') {
            this.currentScene.cleanup();
        }
        
        // Limpiar DOM
        document.body.innerHTML = '';
        
        // Recrear canvas si es necesario (solo para battle scene)
        if (sceneName === 'battle') {
            this.ensureCanvas();
        }
        
        // Obtener nueva escena
        const SceneClass = this.scenes.get(sceneName);
        if (SceneClass) {
            this.currentScene = data ? new SceneClass(data) : new SceneClass();
            
            // Inicializar escena si tiene método init
            if (typeof this.currentScene.init === 'function') {
                this.currentScene.init().then(() => {
                    this.currentScene.render();
                });
            } else {
                this.currentScene.render();
            }
        } else {
            console.error(`Escena no encontrada: ${sceneName}`);
        }
    }

    ensureCanvas() {
        const canvas = document.createElement('canvas');
        canvas.id = 'gameCanvas';
        canvas.width = 800;
        canvas.height = 600;
        canvas.style.border = '1px solid white';
        document.body.appendChild(canvas);
    }

    getCurrentScene() {
        return this.currentScene;
    }
}