/**
 * LoginScene - Pantalla de login épica con efectos holográficos
 * Implementación EXACTA basada en ejemplos funcionales de anime.js
 * RESPONSIVE: Adaptado para todos los dispositivos con ResponsiveUtils
 */
import MockApiClient from '../../infrastructure/MockApiClient.js';
import AuthManager from '../../infrastructure/AuthManager.js';
import ResponsiveUtils from '../../infrastructure/ResponsiveUtils.js';

export default class LoginScene {
    constructor(onAuthSuccess) {
        this.apiClient = new MockApiClient();
        this.authManager = new AuthManager();
        this.onAuthSuccess = onAuthSuccess;
        this.container = null;
        this.particleCanvas = null;
        this.animationId = null;
        
        // Inicializar ResponsiveUtils
        ResponsiveUtils.init();
    }

    render() {
        // Ocultar canvas del juego si existe
        const gameCanvas = document.getElementById('gameCanvas');
        if (gameCanvas) {
            gameCanvas.style.display = 'none';
        }

        // Aplicar estilos responsivos usando ResponsiveUtils
        const deviceType = ResponsiveUtils.getDeviceType();

        // Crear el contenedor principal RESPONSIVO
        this.container = document.createElement('div');
        this.container.id = 'login-scene-container';
        this.container.className = 'responsive-container login-container';
        
        // Aplicar estilos específicos responsivos para Login
        this.container.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: var(--dark-bg);
            background-image: 
                radial-gradient(circle at 20% 80%, rgba(0, 242, 255, 0.15) 0%, transparent 50%),
                radial-gradient(circle at 80% 20%, rgba(255, 0, 193, 0.15) 0%, transparent 50%);
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            z-index: 1000;
            font-family: 'Inter', sans-serif;
            overflow-x: hidden;
            overflow-y: auto;
            padding: ${deviceType === 'mobile' ? 'clamp(1rem, 5vw, 1.5rem)' : 'clamp(1rem, 4vw, 2rem)'};
            gap: ${deviceType === 'mobile' ? '1rem' : '1.5rem'};
        `;

        // Canvas para partículas de fondo RESPONSIVO
        this.particleCanvas = document.createElement('canvas');
        this.particleCanvas.id = 'login-particles';
        this.particleCanvas.className = 'responsive-canvas';
        this.particleCanvas.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 1;
            pointer-events: none;
        `;
        
        // Configurar canvas responsivo usando ResponsiveUtils
        ResponsiveUtils.setupResponsiveCanvas(this.particleCanvas);

        // Título del login RESPONSIVO
        const title = document.createElement('h1');
        title.textContent = deviceType === 'mobile' ? 'FIGHTER 2D' : 'FIGHTER 2D LOGIN';
        title.className = 'responsive-title login-title';
        title.style.cssText = `
            font-family: 'Orbitron', monospace;
            font-size: ${deviceType === 'mobile' ? 'clamp(1.2rem, 5vw, 2rem)' : 'clamp(1.5rem, 6vw, 3rem)'};
            font-weight: 900;
            color: #fff;
            margin-bottom: ${deviceType === 'mobile' ? 'clamp(1rem, 4vw, 1.5rem)' : 'clamp(2rem, 5vw, 3rem)'};
            text-shadow: 0 0 10px var(--primary-glow), 0 0 20px var(--primary-glow);
            opacity: 0;
            transform: translateY(-30px);
            z-index: 3;
            text-align: center;
            max-width: 100%;
            word-wrap: break-word;
        `;

        // Formulario holográfico RESPONSIVO
        const form = document.createElement('form');
        form.className = 'holographic-form responsive-form';
        form.style.cssText = `
            width: 100%;
            max-width: ${deviceType === 'mobile' ? '95vw' : 'min(90vw, 400px)'};
            background: rgba(0, 0, 0, 0.3);
            border: 1px solid var(--primary-glow);
            border-radius: 15px;
            padding: ${deviceType === 'mobile' ? 'clamp(1rem, 4vw, 1.5rem)' : 'clamp(1.5rem, 4vw, 2rem)'};
            box-shadow: 
                0 0 30px rgba(0, 242, 255, 0.3),
                inset 0 0 30px rgba(0, 242, 255, 0.1);
            backdrop-filter: blur(10px);
            z-index: 3;
            position: relative;
            opacity: 0;
            transform: scale(0.9) translateY(20px);
        `;

        // Email input wrapper - RESPONSIVO
        const emailWrapper = document.createElement('div');
        emailWrapper.className = 'input-wrapper responsive-input-wrapper';
        emailWrapper.style.cssText = `
            position: relative;
            margin-bottom: ${deviceType === 'mobile' ? '1.2rem' : '1.5rem'};
        `;

        const emailInput = document.createElement('input');
        emailInput.type = 'email';
        emailInput.id = 'email-input';
        emailInput.className = 'responsive-input';
        emailInput.placeholder = 'usuario@dominio.com';
        emailInput.required = true;
        emailInput.style.cssText = `
            width: 100%;
            padding: ${deviceType === 'mobile' ? '12px' : '15px'};
            background: rgba(0, 242, 255, 0.1);
            border: 1px solid var(--primary-glow);
            border-radius: 8px;
            color: #fff;
            font-size: ${deviceType === 'mobile' ? '1rem' : '1.1rem'};
            box-shadow: 0 0 10px rgba(0, 242, 255, 0.5) inset;
            transition: all 0.3s ease;
            opacity: 0;
            transform: translateY(15px);
            box-sizing: border-box;
            min-height: ${deviceType === 'mobile' ? '44px' : 'auto'};
            touch-action: manipulation;
        `;

        const emailBurst = document.createElement('div');
        emailBurst.className = 'validation-burst';
        emailBurst.style.cssText = `
            position: absolute;
            right: -10px;
            top: ${deviceType === 'mobile' ? '12px' : '15px'};
            width: 20px;
            height: 20px;
        `;

        emailWrapper.appendChild(emailInput);
        emailWrapper.appendChild(emailBurst);

        // Password input wrapper - RESPONSIVO
        const passwordWrapper = document.createElement('div');
        passwordWrapper.className = 'input-wrapper responsive-input-wrapper';
        passwordWrapper.style.cssText = `
            position: relative;
            margin-bottom: ${deviceType === 'mobile' ? '1.5rem' : '2rem'};
        `;

        const passwordInput = document.createElement('input');
        passwordInput.type = 'password';
        passwordInput.id = 'password-input';
        passwordInput.className = 'responsive-input';
        passwordInput.placeholder = 'contraseña';
        passwordInput.required = true;
        passwordInput.style.cssText = `
            width: 100%;
            padding: ${deviceType === 'mobile' ? '12px' : '15px'};
            background: rgba(0, 242, 255, 0.1);
            border: 1px solid var(--primary-glow);
            border-radius: 8px;
            color: #fff;
            font-size: ${deviceType === 'mobile' ? '1rem' : '1.1rem'};
            box-shadow: 0 0 10px rgba(0, 242, 255, 0.5) inset;
            transition: all 0.3s ease;
            opacity: 0;
            transform: translateY(15px);
            box-sizing: border-box;
            min-height: ${deviceType === 'mobile' ? '44px' : 'auto'};
            touch-action: manipulation;
        `;

        const passwordBurst = document.createElement('div');
        passwordBurst.className = 'validation-burst';
        passwordBurst.style.cssText = `
            position: absolute;
            right: -10px;
            top: ${deviceType === 'mobile' ? '12px' : '15px'};
            width: 20px;
            height: 20px;
        `;

        passwordWrapper.appendChild(passwordInput);
        passwordWrapper.appendChild(passwordBurst);

        // Botón de login RESPONSIVO
        const loginButton = document.createElement('button');
        loginButton.type = 'submit';
        loginButton.textContent = 'INICIAR SESIÓN';
        loginButton.className = 'login-button responsive-button';
        loginButton.style.cssText = `
            width: 100%;
            padding: ${deviceType === 'mobile' ? '12px' : '15px'};
            background: linear-gradient(45deg, var(--primary-glow), var(--secondary-glow));
            border: none;
            border-radius: 8px;
            color: #000;
            font-family: 'Orbitron', monospace;
            font-size: ${deviceType === 'mobile' ? '1rem' : '1.1rem'};
            font-weight: 700;
            cursor: pointer;
            transition: all 0.3s ease;
            text-transform: uppercase;
            letter-spacing: 1px;
            box-shadow: 0 0 20px rgba(0, 242, 255, 0.5);
            opacity: 0;
            transform: translateY(15px);
            min-height: ${deviceType === 'mobile' ? '44px' : 'auto'};
            touch-action: manipulation;
        `;

        // Botón de registro RESPONSIVO
        const registerButton = document.createElement('button');
        registerButton.type = 'button';
        registerButton.textContent = 'CREAR CUENTA';
        registerButton.className = 'register-button responsive-button';
        registerButton.style.cssText = `
            width: 100%;
            padding: ${deviceType === 'mobile' ? '12px' : '15px'};
            background: transparent;
            border: 2px solid var(--secondary-glow);
            border-radius: 8px;
            color: var(--secondary-glow);
            font-family: 'Orbitron', monospace;
            font-size: ${deviceType === 'mobile' ? '0.9rem' : '1rem'};
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-top: ${deviceType === 'mobile' ? '0.8rem' : '1rem'};
            opacity: 0;
            transform: translateY(15px);
            min-height: ${deviceType === 'mobile' ? '44px' : 'auto'};
            touch-action: manipulation;
        `;

        // Ensamblar formulario
        form.appendChild(emailWrapper);
        form.appendChild(passwordWrapper);
        form.appendChild(loginButton);
        form.appendChild(registerButton);

        // Ensamblar escena
        this.container.appendChild(this.particleCanvas);
        this.container.appendChild(title);
        this.container.appendChild(form);
        document.body.appendChild(this.container);

        // Iniciar animaciones - EXACTO como el ejemplo
        this.startLoginAnimation();
        this.setupValidation();
        this.setupEventListeners(form, emailInput, passwordInput);
        this.startParticleBackground();

        return this.container;
    }

    startLoginAnimation() {
        if (typeof anime === 'undefined') {
            console.warn('⚠️ anime.js no disponible en LoginScene');
            return;
        }

        const title = this.container.querySelector('h1');
        const form = this.container.querySelector('.holographic-form');
        const inputs = this.container.querySelectorAll('input');
        const buttons = this.container.querySelectorAll('button');

        // Timeline de entrada - EXACTO como el ejemplo
        anime.timeline({ easing: 'easeOutExpo' })
            .add({
                targets: title,
                opacity: [0, 1],
                translateY: [-30, 0],
                duration: 800
            })
            .add({
                targets: form,
                opacity: [0, 1],
                scale: [0.9, 1],
                translateY: [20, 0],
                duration: 600
            }, '-=400')
            .add({
                targets: inputs,
                opacity: [0, 1],
                translateY: [15, 0],
                delay: anime.stagger(200, {start: 300}),
                duration: 500
            }, '-=400')
            .add({
                targets: buttons,
                opacity: [0, 1],
                translateY: [15, 0],
                delay: anime.stagger(100),
                duration: 400
            }, '-=200');
    }

    setupValidation() {
        const emailInput = document.getElementById('email-input');
        
        // Validación épica - EXACTA del ejemplo
        emailInput.addEventListener('input', () => {
            const burstEl = emailInput.parentElement.querySelector('.validation-burst');
            const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInput.value);
            
            if (emailInput.value.length === 0) {
                emailInput.className = '';
            } else {
                emailInput.className = isValid ? 'valid' : 'invalid';
                emailInput.style.borderColor = isValid ? 'var(--success-glow)' : 'var(--secondary-glow)';
                emailInput.style.boxShadow = isValid ? 
                    '0 0 10px rgba(0, 255, 140, 0.7) inset, 0 0 5px var(--success-glow)' :
                    '0 0 10px rgba(255, 0, 193, 0.7) inset, 0 0 5px var(--secondary-glow)';
                
                const burstColor = isValid ? 'var(--success-glow)' : 'var(--secondary-glow)';
                
                // Burst de validación - EXACTO del ejemplo
                if (typeof anime !== 'undefined') {
                    anime({
                        targets: burstEl,
                        innerHTML: [0, 10],
                        easing: 'linear',
                        duration: 200,
                        update: () => {
                            for(let i = 0; i < 2; i++){
                                const p = document.createElement('div');
                                p.style.cssText = `
                                    position: absolute;
                                    width: ${anime.random(3, 8)}px;
                                    height: ${anime.random(3, 8)}px;
                                    background: ${burstColor};
                                    border-radius: 50%;
                                `;
                                burstEl.appendChild(p);
                                
                                anime({
                                    targets: p,
                                    top: anime.random(-20, 20),
                                    left: anime.random(-20, 20),
                                    opacity: [1, 0],
                                    duration: anime.random(300, 600),
                                    easing: 'easeOutExpo',
                                    complete: () => p.remove()
                                });
                            }
                        }
                    });
                }
            }
        });
    }

    setupEventListeners(form, emailInput, passwordInput) {
        // Efectos hover en botones
        const buttons = form.querySelectorAll('button');
        buttons.forEach(button => {
            button.addEventListener('mouseenter', () => {
                if (typeof anime !== 'undefined') {
                    anime({
                        targets: button,
                        scale: 1.05,
                        boxShadow: button.type === 'submit' ? 
                            '0 0 30px rgba(0, 242, 255, 0.8)' :
                            '0 0 20px rgba(255, 0, 193, 0.6)',
                        duration: 200,
                        easing: 'easeOutQuad'
                    });
                }
            });

            button.addEventListener('mouseleave', () => {
                if (typeof anime !== 'undefined') {
                    anime({
                        targets: button,
                        scale: 1,
                        boxShadow: button.type === 'submit' ? 
                            '0 0 20px rgba(0, 242, 255, 0.5)' :
                            '0 0 0px rgba(255, 0, 193, 0)',
                        duration: 200,
                        easing: 'easeOutQuad'
                    });
                }
            });
        });

        // Submit del formulario
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.handleLogin(emailInput.value, passwordInput.value);
        });

        // Registro
        const registerButton = form.querySelector('button[type="button"]');
        registerButton.addEventListener('click', () => {
            this.handleRegister();
        });
    }

    startParticleBackground() {
        if (!this.particleCanvas) return;
        
        const ctx = this.particleCanvas.getContext('2d');
        const particles = [];
        
        // Crear partículas holográficas
        for (let i = 0; i < 50; i++) {
            particles.push({
                x: Math.random() * this.particleCanvas.width,
                y: Math.random() * this.particleCanvas.height,
                size: Math.random() * 2 + 1,
                speedX: (Math.random() - 0.5) * 1,
                speedY: (Math.random() - 0.5) * 1,
                opacity: Math.random() * 0.5 + 0.2,
                color: Math.random() > 0.5 ? 'rgba(0, 242, 255, ' : 'rgba(255, 0, 193, '
            });
        }

        const animateParticles = () => {
            ctx.clearRect(0, 0, this.particleCanvas.width, this.particleCanvas.height);
            
            particles.forEach(particle => {
                particle.x += particle.speedX;
                particle.y += particle.speedY;
                
                // Rebote en bordes
                if (particle.x < 0 || particle.x > this.particleCanvas.width) particle.speedX *= -1;
                if (particle.y < 0 || particle.y > this.particleCanvas.height) particle.speedY *= -1;
                
                // Dibujar partícula
                ctx.globalAlpha = particle.opacity;
                ctx.fillStyle = particle.color + particle.opacity + ')';
                ctx.beginPath();
                ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
                ctx.fill();
            });
            
            if (document.getElementById('login-scene-container')) {
                this.animationId = requestAnimationFrame(animateParticles);
            }
        };
        
        animateParticles();
    }

    async handleLogin(email, password) {
        console.log('🔐 Intentando login...', { email });
        
        if (typeof anime !== 'undefined') {
            // Animación de carga épica
            const form = this.container.querySelector('.holographic-form');
            anime({
                targets: form,
                scale: [1, 0.98, 1],
                boxShadow: [
                    '0 0 30px rgba(0, 242, 255, 0.3)',
                    '0 0 50px rgba(0, 242, 255, 0.8)',
                    '0 0 30px rgba(0, 242, 255, 0.3)'
                ],
                duration: 600,
                easing: 'easeInOutSine'
            });
        }

        try {
            const response = await this.apiClient.login(email, password);
            
            if (response.success) {
                console.log('✅ Login exitoso');
                
                // Animación de éxito
                if (typeof anime !== 'undefined') {
                    anime({
                        targets: this.container,
                        opacity: [1, 0],
                        scale: [1, 1.1],
                        duration: 500,
                        easing: 'easeInExpo',
                        complete: () => {
                            if (this.onAuthSuccess) {
                                this.onAuthSuccess(response.user);
                            }
                        }
                    });
                } else {
                    if (this.onAuthSuccess) {
                        this.onAuthSuccess(response.user);
                    }
                }
            } else {
                this.showError('Credenciales inválidas');
            }
        } catch (error) {
            console.error('❌ Error en login:', error);
            this.showError('Error de conexión');
        }
    }

    handleRegister() {
        console.log('📝 Abriendo registro...');
        this.showError('Funcionalidad de registro no implementada aún');
    }

    showError(message) {
        const form = this.container.querySelector('.holographic-form');
        
        // Crear mensaje de error
        let errorDiv = form.querySelector('.error-message');
        if (!errorDiv) {
            errorDiv = document.createElement('div');
            errorDiv.className = 'error-message';
            errorDiv.style.cssText = `
                background: rgba(255, 0, 0, 0.1);
                border: 1px solid var(--danger-glow);
                border-radius: 8px;
                padding: 10px;
                margin-top: 1rem;
                color: var(--danger-glow);
                text-align: center;
                font-family: 'Orbitron', monospace;
                opacity: 0;
                transform: translateY(-10px);
            `;
            form.appendChild(errorDiv);
        }
        
        errorDiv.textContent = message;
        
        if (typeof anime !== 'undefined') {
            // Shake del formulario
            anime({
                targets: form,
                translateX: [0, -10, 10, -5, 5, 0],
                duration: 400,
                easing: 'easeInOutSine'
            });
            
            // Mostrar error
            anime({
                targets: errorDiv,
                opacity: [0, 1],
                translateY: [-10, 0],
                duration: 300,
                easing: 'easeOutExpo'
            });
            
            // Ocultar error después de 3 segundos
            setTimeout(() => {
                anime({
                    targets: errorDiv,
                    opacity: [1, 0],
                    translateY: [0, -10],
                    duration: 300,
                    easing: 'easeInExpo'
                });
            }, 3000);
        } else {
            errorDiv.style.opacity = '1';
            errorDiv.style.transform = 'translateY(0)';
        }
    }

    cleanup() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }

        // Cleanup ResponsiveUtils canvas handlers
        if (this.particleCanvas) {
            ResponsiveUtils.cleanup(this.particleCanvas);
        }

        if (this.container) {
            this.container.remove();
        }

        this.container = null;
        this.particleCanvas = null;
    }
}