import MockApiClient from '../../infrastructure/MockApiClient.js';
import AuthManager from '../../infrastructure/AuthManager.js';
// anime.js se carga globalmente desde el HTML

export default class LoginScene {
    constructor(onAuthSuccess) {
        this.apiClient = new MockApiClient();
        this.authManager = new AuthManager();
        this.onAuthSuccess = onAuthSuccess;
        this.animations = [];
        this.particleAnimations = [];
    }

    render() {
        // Verificar si anime.js está disponible
        if (typeof anime === 'undefined') {
            console.warn('anime.js no está disponible, usando versión básica');
            this.renderBasicVersion();
            return;
        }

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
            background: 
                radial-gradient(circle at 25% 25%, #4ecdc450 0%, transparent 50%),
                radial-gradient(circle at 75% 75%, #ff6b6b50 0%, transparent 50%),
                linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #0a0a0a 100%);
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            z-index: 1000;
            overflow: hidden;
        `;
        container.id = 'loginContainer';

        // Efecto de matriz de fondo
        const matrixBg = this.createMatrixBackground();
        container.appendChild(matrixBg);

        // Título principal futurista
        const title = document.createElement('h1');
        title.textContent = 'ACCESO AL SISTEMA';
        title.style.cssText = `
            color: transparent;
            background: linear-gradient(45deg, #4ecdc4, #ffffff, #4ecdc4);
            background-size: 200% 200%;
            background-clip: text;
            -webkit-background-clip: text;
            margin-bottom: 40px;
            font-size: 3rem;
            font-family: 'Orbitron', monospace;
            font-weight: 900;
            text-align: center;
            letter-spacing: 4px;
            text-shadow: 0 0 30px #4ecdc440;
            transform: translateY(-50px);
            opacity: 0;
        `;
        title.id = 'loginTitle';

        // Animación del gradiente del título
        anime({
            targets: title,
            backgroundPosition: ['0% 50%', '100% 50%'],
            duration: 3000,
            easing: 'linear',
            loop: true
        });

        // Contenedor del formulario con efectos holográficos
        const formContainer = document.createElement('div');
        formContainer.style.cssText = `
            position: relative;
            transform: translateY(50px);
            opacity: 0;
        `;
        formContainer.id = 'formContainer';

        const form = document.createElement('form');
        form.style.cssText = `
            display: flex;
            flex-direction: column;
            gap: 25px;
            padding: 50px;
            background: 
                linear-gradient(135deg, rgba(78, 205, 196, 0.1), rgba(255, 107, 107, 0.1)),
                rgba(0, 0, 0, 0.3);
            border: 2px solid transparent;
            background-clip: padding-box;
            border-radius: 20px;
            min-width: 400px;
            backdrop-filter: blur(10px);
            box-shadow: 
                0 20px 40px rgba(0,0,0,0.3),
                inset 0 1px 0 rgba(255,255,255,0.1),
                0 0 0 1px rgba(78, 205, 196, 0.3);
            position: relative;
            overflow: hidden;
        `;
        form.id = 'loginForm';

        // Efecto de escaneado holográfico
        const scanLine = document.createElement('div');
        scanLine.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 2px;
            background: linear-gradient(90deg, transparent, #4ecdc4, transparent);
            opacity: 0.8;
            transform: translateY(-100%);
        `;
        form.appendChild(scanLine);

        // Animación de escaneado
        anime({
            targets: scanLine,
            translateY: ['0%', '100%', '200%'],
            duration: 2000,
            easing: 'linear',
            loop: true
        });

        // Campo de email futurista
        const emailContainer = this.createFuturisticInput('email', 'Correo Electrónico', '📧');
        const emailInput = emailContainer.querySelector('input');
        
        // Campo de contraseña futurista
        const passwordContainer = this.createFuturisticInput('password', 'Contraseña', '🔒');
        const passwordInput = passwordContainer.querySelector('input');

        // Botón de submit épico
        const submitButton = this.createFuturisticButton('INICIAR SESIÓN', '🚀');

        form.appendChild(emailContainer);
        form.appendChild(passwordContainer);
        form.appendChild(submitButton);

        // Lógica del formulario
        form.onsubmit = async (event) => {
            event.preventDefault();
            
            // Animación de carga
            this.playLoadingAnimation(submitButton);
            
            try {
                const response = await this.authManager.login(emailInput.value, passwordInput.value);
                
                // Animación de éxito
                this.playSuccessAnimation(() => {
                    if (this.onAuthSuccess) {
                        this.onAuthSuccess(response.user.role);
                    }
                });
                
            } catch (error) {
                // Animación de error
                this.playErrorAnimation(form, error.message);
                this.resetButton(submitButton);
            }
        };

        formContainer.appendChild(form);
        container.appendChild(title);
        container.appendChild(formContainer);

        // Agregar estilos
        this.addFuturisticStyles();

        document.body.appendChild(container);

        // Iniciar animaciones de entrada
        this.playEntranceAnimation();
    }

    createMatrixBackground() {
        const matrix = document.createElement('div');
        matrix.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            opacity: 0.05;
            z-index: 1;
        `;

        // Crear líneas de código cayendo
        for (let i = 0; i < 15; i++) {
            const line = document.createElement('div');
            line.style.cssText = `
                position: absolute;
                left: ${i * 7}%;
                top: -100%;
                color: #4ecdc4;
                font-family: 'Courier New', monospace;
                font-size: 12px;
                white-space: pre;
            `;

            let code = '';
            for (let j = 0; j < 40; j++) {
                code += Math.random() > 0.5 ? '1' : '0';
                if (j % 8 === 7) code += '\n';
            }
            line.textContent = code;

            matrix.appendChild(line);

            anime({
                targets: line,
                translateY: ['0%', '110vh'],
                duration: Math.random() * 8000 + 5000,
                delay: Math.random() * 3000,
                easing: 'linear',
                loop: true
            });
        }

        return matrix;
    }

    createFuturisticInput(type, placeholder, icon) {
        const container = document.createElement('div');
        container.style.cssText = `
            position: relative;
            z-index: 2;
        `;

        const inputWrapper = document.createElement('div');
        inputWrapper.style.cssText = `
            position: relative;
            overflow: hidden;
            border-radius: 10px;
        `;

        const input = document.createElement('input');
        input.type = type;
        input.placeholder = placeholder;
        input.required = true;
        input.style.cssText = `
            width: 100%;
            padding: 15px 50px 15px 20px;
            background: rgba(0, 0, 0, 0.3);
            border: 2px solid rgba(78, 205, 196, 0.3);
            border-radius: 10px;
            font-size: 16px;
            color: #ffffff;
            font-family: 'Orbitron', monospace;
            transition: all 0.3s ease;
            box-sizing: border-box;
        `;

        const iconElement = document.createElement('div');
        iconElement.textContent = icon;
        iconElement.style.cssText = `
            position: absolute;
            right: 15px;
            top: 50%;
            transform: translateY(-50%);
            font-size: 1.2rem;
            color: #4ecdc4;
            z-index: 3;
        `;

        // Efecto de brillo en focus
        const glowEffect = document.createElement('div');
        glowEffect.style.cssText = `
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(78, 205, 196, 0.3), transparent);
            transition: left 0.5s ease;
        `;

        inputWrapper.appendChild(glowEffect);
        inputWrapper.appendChild(input);
        container.appendChild(inputWrapper);
        container.appendChild(iconElement);

        // Eventos
        input.onfocus = () => {
            anime({
                targets: input,
                borderColor: '#4ecdc4',
                boxShadow: '0 0 20px rgba(78, 205, 196, 0.5)',
                duration: 300,
                easing: 'easeOutQuad'
            });

            anime({
                targets: glowEffect,
                left: '100%',
                duration: 500,
                easing: 'easeInOutQuad'
            });
        };

        input.onblur = () => {
            anime({
                targets: input,
                borderColor: 'rgba(78, 205, 196, 0.3)',
                boxShadow: '0 0 0px rgba(78, 205, 196, 0)',
                duration: 300,
                easing: 'easeOutQuad'
            });

            anime({
                targets: glowEffect,
                left: '-100%',
                duration: 0
            });
        };

        return container;
    }

    createFuturisticButton(text, icon) {
        const button = document.createElement('button');
        button.innerHTML = `${icon} ${text}`;
        button.type = 'submit';
        button.style.cssText = `
            padding: 18px 30px;
            background: linear-gradient(135deg, #4ecdc4, #45b7d1);
            color: white;
            border: 2px solid transparent;
            border-radius: 10px;
            font-size: 16px;
            font-weight: bold;
            cursor: pointer;
            transition: all 0.3s ease;
            font-family: 'Orbitron', monospace;
            letter-spacing: 2px;
            text-transform: uppercase;
            position: relative;
            overflow: hidden;
            z-index: 2;
        `;

        // Efecto de energía
        const energyEffect = document.createElement('div');
        energyEffect.style.cssText = `
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
            transition: left 0.6s ease;
        `;
        button.appendChild(energyEffect);

        button.onmouseenter = () => {
            anime({
                targets: button,
                scale: 1.05,
                boxShadow: '0 10px 25px rgba(78, 205, 196, 0.4)',
                duration: 300,
                easing: 'easeOutQuad'
            });

            anime({
                targets: energyEffect,
                left: '100%',
                duration: 600,
                easing: 'easeInOutQuad'
            });
        };

        button.onmouseleave = () => {
            anime({
                targets: button,
                scale: 1,
                boxShadow: '0 0 0px rgba(78, 205, 196, 0)',
                duration: 300,
                easing: 'easeOutQuad'
            });

            anime({
                targets: energyEffect,
                left: '-100%',
                duration: 0
            });
        };

        return button;
    }

    playEntranceAnimation() {
        anime.timeline({
            easing: 'easeOutExpo'
        })
        .add({
            targets: '#loginTitle',
            translateY: ['-50px', '0px'],
            opacity: [0, 1],
            duration: 800
        })
        .add({
            targets: '#formContainer',
            translateY: ['50px', '0px'],
            opacity: [0, 1],
            duration: 600,
            easing: 'easeOutBack'
        }, '-=400');
    }

    playLoadingAnimation(button) {
        button.disabled = true;
        button.innerHTML = '⚡ AUTENTICANDO...';

        anime({
            targets: button,
            backgroundColor: '#ffaa00',
            scale: [1, 1.02, 1],
            duration: 1000,
            loop: true,
            easing: 'easeInOutSine'
        });
    }

    playSuccessAnimation(callback) {
        const container = document.getElementById('loginContainer');
        
        anime.timeline({
            complete: callback
        })
        .add({
            targets: '#loginForm',
            scale: 1.05,
            borderColor: '#4ecdc4',
            duration: 300
        })
        .add({
            targets: container,
            opacity: 0,
            scale: 1.1,
            duration: 600,
            easing: 'easeInBack'
        });
    }

    playErrorAnimation(form, message) {
        // Crear mensaje de error
        const errorMsg = document.createElement('div');
        errorMsg.textContent = message;
        errorMsg.style.cssText = `
            color: #ff6b6b;
            background: rgba(255, 107, 107, 0.1);
            border: 1px solid #ff6b6b;
            border-radius: 5px;
            padding: 10px;
            margin-top: 15px;
            text-align: center;
            font-family: 'Orbitron', monospace;
            opacity: 0;
            transform: translateY(-20px);
        `;

        form.appendChild(errorMsg);

        // Animación de error
        anime({
            targets: form,
            translateX: [0, -10, 10, -5, 5, 0],
            borderColor: ['rgba(78, 205, 196, 0.3)', '#ff6b6b', 'rgba(78, 205, 196, 0.3)'],
            duration: 600,
            easing: 'easeInOutQuad'
        });

        anime({
            targets: errorMsg,
            opacity: [0, 1],
            translateY: ['-20px', '0px'],
            duration: 400,
            easing: 'easeOutQuad'
        });

        // Remover mensaje después de 3 segundos
        setTimeout(() => {
            anime({
                targets: errorMsg,
                opacity: 0,
                translateY: '-20px',
                duration: 300,
                complete: () => errorMsg.remove()
            });
        }, 3000);
    }

    resetButton(button) {
        button.disabled = false;
        button.innerHTML = '🚀 INICIAR SESIÓN';
        
        anime({
            targets: button,
            backgroundColor: '#4ecdc4',
            scale: 1,
            duration: 300,
            easing: 'easeOutQuad'
        });
    }

    addFuturisticStyles() {
        if (document.getElementById('loginStyles')) return;

        const style = document.createElement('style');
        style.id = 'loginStyles';
        style.textContent = `
            @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&display=swap');
            
            input::placeholder {
                color: rgba(255, 255, 255, 0.5);
                font-family: 'Orbitron', monospace;
            }
            
            input:focus::placeholder {
                color: rgba(78, 205, 196, 0.7);
            }
        `;
        document.head.appendChild(style);
    }

    cleanup() {
        // Restaurar canvas del juego si existe
        const gameCanvas = document.getElementById('gameCanvas');
        if (gameCanvas) {
            gameCanvas.style.display = 'block';
        }

        // Limpiar animaciones
        this.animations.forEach(anim => {
            if (anim && anim.pause) anim.pause();
        });

        this.particleAnimations.forEach(anim => {
            if (anim && anim.pause) anim.pause();
        });

        // Remover estilos
        const styles = document.getElementById('loginStyles');
        if (styles) {
            styles.remove();
        }

        // Limpiar DOM
        const container = document.getElementById('loginContainer');
        if (container) {
            container.remove();
        }
    }

    // Método básico sin animaciones
    renderBasicVersion() {
        const gameCanvas = document.getElementById('gameCanvas');
        if (gameCanvas) {
            gameCanvas.style.display = 'none';
        }

        const container = document.createElement('div');
        container.id = 'loginContainer';
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
            font-family: Arial, sans-serif;
            color: white;
            padding: 20px;
        `;

        const title = document.createElement('h1');
        title.textContent = 'FIGHTING ARENA';
        title.style.cssText = `
            font-size: 3rem;
            margin-bottom: 2rem;
            text-align: center;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
        `;

        const form = document.createElement('form');
        form.style.cssText = `
            background: rgba(255,255,255,0.1);
            backdrop-filter: blur(10px);
            padding: 2rem;
            border-radius: 15px;
            box-shadow: 0 8px 32px rgba(31, 38, 135, 0.37);
            border: 1px solid rgba(255, 255, 255, 0.18);
            width: 100%;
            max-width: 400px;
            margin-bottom: 2rem;
        `;

        form.innerHTML = `
            <h2 style="text-align: center; margin-bottom: 1.5rem; font-size: 1.5rem;">INICIAR SESIÓN</h2>
            
            <div style="margin-bottom: 1rem;">
                <label style="display: block; margin-bottom: 0.5rem; font-weight: bold;">Email:</label>
                <input type="email" id="email" required 
                       style="width: 100%; padding: 12px; border: none; border-radius: 8px; 
                              background: rgba(255,255,255,0.2); color: white; font-size: 1rem;
                              backdrop-filter: blur(5px);" 
                       placeholder="tu@email.com">
            </div>
            
            <div style="margin-bottom: 1.5rem;">
                <label style="display: block; margin-bottom: 0.5rem; font-weight: bold;">Contraseña:</label>
                <input type="password" id="password" required 
                       style="width: 100%; padding: 12px; border: none; border-radius: 8px; 
                              background: rgba(255,255,255,0.2); color: white; font-size: 1rem;
                              backdrop-filter: blur(5px);" 
                       placeholder="••••••••">
            </div>
            
            <button type="submit" id="loginBtn"
                    style="width: 100%; padding: 15px; border: none; border-radius: 8px; 
                           background: linear-gradient(45deg, #4facfe 0%, #00f2fe 100%);
                           color: white; font-size: 1.1rem; font-weight: bold; cursor: pointer;
                           transition: all 0.3s ease; margin-bottom: 1rem;">
                INGRESAR
            </button>
            
            <div style="text-align: center;">
                <button type="button" id="registerBtn"
                        style="background: none; border: none; color: white; 
                               text-decoration: underline; cursor: pointer; font-size: 1rem;">
                    ¿No tienes cuenta? Regístrate aquí
                </button>
            </div>
        `;

        // Configurar eventos
        form.onsubmit = async (e) => {
            e.preventDefault();
            await this.handleLogin();
        };

        const registerBtn = form.querySelector('#registerBtn');
        registerBtn.onclick = () => this.showRegisterForm();

        const loginBtn = form.querySelector('#loginBtn');
        loginBtn.onmouseenter = () => {
            loginBtn.style.transform = 'translateY(-2px)';
            loginBtn.style.boxShadow = '0 5px 15px rgba(79, 172, 254, 0.4)';
        };
        loginBtn.onmouseleave = () => {
            loginBtn.style.transform = 'translateY(0)';
            loginBtn.style.boxShadow = 'none';
        };

        const footer = document.createElement('div');
        footer.style.cssText = `
            text-align: center;
            opacity: 0.7;
            font-size: 0.9rem;
        `;
        footer.innerHTML = `
            <p>Usa las credenciales de prueba:</p>
            <p><strong>admin@test.com / admin123</strong> (Administrador)</p>
            <p><strong>user@test.com / user123</strong> (Usuario)</p>
        `;

        container.appendChild(title);
        container.appendChild(form);
        container.appendChild(footer);
        document.body.appendChild(container);
    }

    async handleLogin() {
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const loginBtn = document.getElementById('loginBtn');

        try {
            loginBtn.textContent = 'INGRESANDO...';
            loginBtn.disabled = true;

            const response = await this.authManager.login(email, password);
            
            if (response.success) {
                console.log('✅ Login exitoso');
                if (this.onAuthSuccess) {
                    this.cleanup();
                    this.onAuthSuccess();
                }
            } else {
                alert('Error: ' + response.message);
            }
        } catch (error) {
            console.error('❌ Error en login:', error);
            alert('Error de conexión');
        } finally {
            loginBtn.textContent = 'INGRESAR';
            loginBtn.disabled = false;
        }
    }

    showRegisterForm() {
        // Mostrar formulario de registro (implementación básica)
        const form = document.querySelector('form');
        form.innerHTML = `
            <h2 style="text-align: center; margin-bottom: 1.5rem; font-size: 1.5rem;">REGISTRARSE</h2>
            
            <div style="margin-bottom: 1rem;">
                <label style="display: block; margin-bottom: 0.5rem; font-weight: bold;">Nombre:</label>
                <input type="text" id="name" required 
                       style="width: 100%; padding: 12px; border: none; border-radius: 8px; 
                              background: rgba(255,255,255,0.2); color: white; font-size: 1rem;" 
                       placeholder="Tu nombre">
            </div>
            
            <div style="margin-bottom: 1rem;">
                <label style="display: block; margin-bottom: 0.5rem; font-weight: bold;">Email:</label>
                <input type="email" id="email" required 
                       style="width: 100%; padding: 12px; border: none; border-radius: 8px; 
                              background: rgba(255,255,255,0.2); color: white; font-size: 1rem;" 
                       placeholder="tu@email.com">
            </div>
            
            <div style="margin-bottom: 1.5rem;">
                <label style="display: block; margin-bottom: 0.5rem; font-weight: bold;">Contraseña:</label>
                <input type="password" id="password" required 
                       style="width: 100%; padding: 12px; border: none; border-radius: 8px; 
                              background: rgba(255,255,255,0.2); color: white; font-size: 1rem;" 
                       placeholder="••••••••">
            </div>
            
            <button type="submit" id="registerSubmitBtn"
                    style="width: 100%; padding: 15px; border: none; border-radius: 8px; 
                           background: linear-gradient(45deg, #fa709a 0%, #fee140 100%);
                           color: white; font-size: 1.1rem; font-weight: bold; cursor: pointer;
                           transition: all 0.3s ease; margin-bottom: 1rem;">
                CREAR CUENTA
            </button>
            
            <div style="text-align: center;">
                <button type="button" id="backToLoginBtn"
                        style="background: none; border: none; color: white; 
                               text-decoration: underline; cursor: pointer; font-size: 1rem;">
                    ¿Ya tienes cuenta? Inicia sesión
                </button>
            </div>
        `;

        form.onsubmit = async (e) => {
            e.preventDefault();
            await this.handleRegister();
        };

        document.getElementById('backToLoginBtn').onclick = () => {
            this.cleanup();
            this.renderBasicVersion();
        };
    }

    async handleRegister() {
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const registerBtn = document.getElementById('registerSubmitBtn');

        try {
            registerBtn.textContent = 'CREANDO CUENTA...';
            registerBtn.disabled = true;

            const response = await this.authManager.register(name, email, password);
            
            if (response.success) {
                alert('Cuenta creada exitosamente. Puedes iniciar sesión ahora.');
                this.cleanup();
                this.renderBasicVersion();
            } else {
                alert('Error: ' + response.message);
            }
        } catch (error) {
            console.error('❌ Error en registro:', error);
            alert('Error de conexión');
        } finally {
            registerBtn.textContent = 'CREAR CUENTA';
            registerBtn.disabled = false;
        }
    }
}