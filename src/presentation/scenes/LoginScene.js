import MockApiClient from '../../infrastructure/MockApiClient.js';
import AuthManager from '../../infrastructure/AuthManager.js';

export default class LoginScene {
    constructor(onAuthSuccess) {
        this.apiClient = new MockApiClient();
        this.authManager = new AuthManager();
        this.onAuthSuccess = onAuthSuccess;
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
            background-color: #000;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            z-index: 1000;
        `;

        const title = document.createElement('h1');
        title.textContent = 'Iniciar Sesión';
        title.style.cssText = `
            color: white;
            margin-bottom: 30px;
            font-size: 2.5rem;
            font-family: Arial, sans-serif;
        `;
        container.appendChild(title);

        const form = document.createElement('form');
        form.style.cssText = `
            display: flex;
            flex-direction: column;
            gap: 15px;
            padding: 40px;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 10px;
            border: 1px solid rgba(255, 255, 255, 0.3);
            min-width: 300px;
        `;

        const emailInput = document.createElement('input');
        emailInput.type = 'email';
        emailInput.placeholder = 'Correo Electrónico';
        emailInput.required = true;
        emailInput.style.cssText = `
            padding: 12px;
            border: 1px solid #ccc;
            border-radius: 5px;
            font-size: 16px;
        `;
        form.appendChild(emailInput);

        const passwordInput = document.createElement('input');
        passwordInput.type = 'password';
        passwordInput.placeholder = 'Contraseña';
        passwordInput.required = true;
        passwordInput.style.cssText = `
            padding: 12px;
            border: 1px solid #ccc;
            border-radius: 5px;
            font-size: 16px;
        `;
        form.appendChild(passwordInput);

        const submitButton = document.createElement('button');
        submitButton.textContent = 'Iniciar Sesión';
        submitButton.type = 'submit';
        submitButton.style.cssText = `
            padding: 12px;
            background-color: #007bff;
            color: white;
            border: none;
            border-radius: 5px;
            font-size: 16px;
            cursor: pointer;
            transition: background-color 0.3s;
        `;
        submitButton.onmouseover = () => submitButton.style.backgroundColor = '#0056b3';
        submitButton.onmouseout = () => submitButton.style.backgroundColor = '#007bff';
        form.appendChild(submitButton);

        form.onsubmit = async (event) => {
            event.preventDefault();
            submitButton.textContent = 'Iniciando...';
            submitButton.disabled = true;
            
            try {
                const response = await this.authManager.login(emailInput.value, passwordInput.value);
                if (this.onAuthSuccess) {
                    this.onAuthSuccess(response.user.role);
                }
            } catch (error) {
                alert(error.message);
                submitButton.textContent = 'Iniciar Sesión';
                submitButton.disabled = false;
            }
        };

        container.appendChild(form);
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