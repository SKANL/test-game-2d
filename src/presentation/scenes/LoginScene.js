/**
 * LoginScene - Pantalla de login épica con efectos holográficos
 * Implementación LIMPIA basada en BaseScene y arquitectura SOLID
 * RESPONSIVE: Adaptado para todos los dispositivos con ResponsiveUtils
 */
import MockApiClient from '../../infrastructure/MockApiClient.js';
import AuthManager from '../../infrastructure/AuthManager.js';
import ResponsiveUtils from '../../infrastructure/ResponsiveUtils.js';

export default class LoginScene {
    constructor(data = null) {
        this.sceneName = 'login';
        
        this.apiClient = new MockApiClient();
        this.authManager = new AuthManager(this.apiClient);
        
        // Referencia al ApplicationController global
        this.applicationController = window.applicationController;
        
        this.container = null;
        this.particleCanvas = null;
        this.animationId = null;
        this.isRegistering = data?.isRegistering || false;
        
        console.log('🔐 LoginScene constructor completado');
    }

    /**
     * Inicialización de la escena - Implementa IScene
     */
    async init() {
        try {
            console.log('🔐 Inicializando LoginScene...');
            
            // Configurar ResponsiveUtils
            ResponsiveUtils.init();
            
            console.log('🔐 LoginScene inicializada correctamente');
            
        } catch (error) {
            console.error('❌ Error inicializando LoginScene:', error);
            throw error;
        }
    }

    /**
     * Renderizar la escena - Implementa IScene
     */
    render() {
        console.log('🔐 LoginScene.render() - Iniciando renderizado');

        // Ocultar canvas del juego
        const gameCanvas = document.getElementById('gameCanvas');
        if (gameCanvas) {
            gameCanvas.style.display = 'none';
            console.log('🔐 Canvas del juego ocultado');
        }

        // Obtener contenedor de escenas
        const sceneContainer = document.getElementById('scene-container');
        if (!sceneContainer) {
            console.error('❌ scene-container no encontrado en el DOM');
            return;
        }
        
        console.log('🔐 scene-container encontrado:', sceneContainer);

        // Detectar tipo de dispositivo
        let deviceType = 'desktop';
        try {
            deviceType = ResponsiveUtils.getDeviceType();
            console.log('🔐 Tipo de dispositivo detectado:', deviceType);
        } catch (error) {
            console.warn('⚠️ Error detectando tipo de dispositivo, usando desktop por defecto:', error);
        }
        
        // Crear contenedor principal
        console.log('🔐 Creando contenedor principal...');
        this.createMainContainer(deviceType);
        
        // Crear elementos de la interfaz
        console.log('🔐 Creando elementos de la interfaz...');
        this.createTitle(deviceType);
        this.createLoginForm(deviceType);
        this.createCredentialsHelper(deviceType);
        
        // Ensamblar interfaz
        console.log('🔐 Ensamblando interfaz...');
        this.assembleInterface();
        
        // Verificar que el contenedor esté correctamente configurado
        if (!this.container) {
            console.error('❌ Container no fue creado correctamente');
            return;
        }
        
        // Forzar estilos críticos para asegurar visibilidad
        this.container.style.display = 'flex';
        this.container.style.visibility = 'visible';
        this.container.style.opacity = '1';
        this.container.style.zIndex = '1000';
        
        console.log('🔐 Estilos del container forzados:', {
            display: this.container.style.display,
            visibility: this.container.style.visibility,
            opacity: this.container.style.opacity,
            zIndex: this.container.style.zIndex
        });
        
        // Limpiar contenido anterior del scene-container
        sceneContainer.innerHTML = '';
        
        // Añadir al DOM
        sceneContainer.appendChild(this.container);
        
        console.log('🔐 Container añadido al DOM');
        
        // DEBUGGING: Forzar visibilidad después de un tiempo
        setTimeout(() => {
            this.forceVisibility();
        }, 200);
        
        console.log('🔐 Estado final del scene-container:', {
            children: sceneContainer.children.length,
            firstChild: sceneContainer.firstChild ? sceneContainer.firstChild.id : 'none',
            visibility: window.getComputedStyle(sceneContainer).visibility,
            display: window.getComputedStyle(sceneContainer).display
        });
        
        console.log('🔐 LoginScene renderizada exitosamente');
        
        // Iniciar efectos visuales con delay para asegurar que el DOM esté listo
        setTimeout(() => {
            console.log('🔐 Iniciando efectos visuales...');
            this.startVisualEffects();
        }, 100);

        return this.container;
    }

    /**
     * Crear contenedor principal
     */
    createMainContainer(deviceType) {
        this.container = document.createElement('div');
        this.container.id = 'login-scene-container';
        this.container.className = 'login-container';
        
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
            padding: ${deviceType === 'mobile' ? '1rem' : '2rem'};
            overflow-y: auto;
            box-sizing: border-box;
            gap: ${deviceType === 'mobile' ? '1rem' : '1.5rem'};
            opacity: 1 !important;
            visibility: visible !important;
        `;
    }

    /**
     * Crear título
     */
    createTitle(deviceType) {
        this.titleElement = document.createElement('h1');
        this.titleElement.textContent = deviceType === 'mobile' ? 'FIGHTER 2D' : 'FIGHTER 2D LOGIN';
        this.titleElement.className = 'login-title';
        
        this.titleElement.style.cssText = `
            font-family: 'Orbitron', monospace;
            font-size: ${deviceType === 'mobile' ? '2rem' : '3rem'};
            font-weight: 900;
            color: #fff;
            text-shadow: 0 0 10px var(--primary-glow), 0 0 20px var(--primary-glow);
            margin: 0;
            text-align: center;
            opacity: 1;
            transform: translateY(0);
            z-index: 3;
        `;
    }

    /**
     * Crear formulario de login
     */
    createLoginForm(deviceType) {
        // Contenedor del formulario
        this.formElement = document.createElement('form');
        this.formElement.className = 'holographic-form';
        
        this.formElement.style.cssText = `
            width: 100%;
            max-width: ${deviceType === 'mobile' ? '90vw' : '400px'};
            background: rgba(0, 0, 0, 0.3);
            border: 1px solid var(--primary-glow);
            border-radius: 15px;
            padding: ${deviceType === 'mobile' ? '1.5rem' : '2rem'};
            box-shadow: 
                0 0 30px rgba(0, 242, 255, 0.3),
                inset 0 0 30px rgba(0, 242, 255, 0.1);
            backdrop-filter: blur(10px);
            z-index: 3;
            opacity: 1;
            transform: scale(1);
            display: flex;
            flex-direction: column;
            gap: 1.5rem;
        `;

        // Email input
        this.createEmailInput(deviceType);
        
        // Password input
        this.createPasswordInput(deviceType);
        
        // Botones
        this.createButtons(deviceType);
        
        // Ensamblar formulario
        this.formElement.appendChild(this.emailWrapper);
        this.formElement.appendChild(this.passwordWrapper);
        this.formElement.appendChild(this.loginButton);
        this.formElement.appendChild(this.registerButton);
        
        // Event listeners
        this.setupFormEventListeners();
    }

    /**
     * Crear input de email
     */
    createEmailInput(deviceType) {
        this.emailWrapper = document.createElement('div');
        this.emailWrapper.className = 'input-wrapper';
        this.emailWrapper.style.cssText = `position: relative; margin-bottom: 0;`;

        this.emailInput = document.createElement('input');
        this.emailInput.type = 'email';
        this.emailInput.id = 'email-input';
        this.emailInput.placeholder = 'usuario@dominio.com';
        this.emailInput.required = true;
        
        this.emailInput.style.cssText = `
            width: 100%;
            padding: ${deviceType === 'mobile' ? '12px' : '15px'};
            background: rgba(0, 242, 255, 0.1);
            border: 1px solid var(--primary-glow);
            border-radius: 8px;
            color: #fff;
            font-size: ${deviceType === 'mobile' ? '1rem' : '1.1rem'};
            box-shadow: 0 0 10px rgba(0, 242, 255, 0.5) inset;
            transition: all 0.3s ease;
            box-sizing: border-box;
            opacity: 1;
            transform: translateY(0);
            min-height: 44px;
        `;

        this.emailWrapper.appendChild(this.emailInput);
    }

    /**
     * Crear input de password
     */
    createPasswordInput(deviceType) {
        this.passwordWrapper = document.createElement('div');
        this.passwordWrapper.className = 'input-wrapper';
        this.passwordWrapper.style.cssText = `position: relative; margin-bottom: 0;`;

        this.passwordInput = document.createElement('input');
        this.passwordInput.type = 'password';
        this.passwordInput.id = 'password-input';
        this.passwordInput.placeholder = 'contraseña';
        this.passwordInput.required = true;
        
        this.passwordInput.style.cssText = `
            width: 100%;
            padding: ${deviceType === 'mobile' ? '12px' : '15px'};
            background: rgba(0, 242, 255, 0.1);
            border: 1px solid var(--primary-glow);
            border-radius: 8px;
            color: #fff;
            font-size: ${deviceType === 'mobile' ? '1rem' : '1.1rem'};
            box-shadow: 0 0 10px rgba(0, 242, 255, 0.5) inset;
            transition: all 0.3s ease;
            box-sizing: border-box;
            opacity: 1;
            transform: translateY(0);
            min-height: 44px;
        `;

        this.passwordWrapper.appendChild(this.passwordInput);
    }

    /**
     * Crear botones
     */
    createButtons(deviceType) {
        // Botón de login
        this.loginButton = document.createElement('button');
        this.loginButton.type = 'submit';
        this.loginButton.textContent = 'INICIAR SESIÓN';
        this.loginButton.className = 'login-button';
        
        this.loginButton.style.cssText = `
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
            opacity: 1;
            transform: translateY(0);
            min-height: 44px;
        `;

        // Botón de registro
        this.registerButton = document.createElement('button');
        this.registerButton.type = 'button';
        this.registerButton.textContent = 'CREAR CUENTA';
        this.registerButton.className = 'register-button';
        
        this.registerButton.style.cssText = `
            width: 100%;
            padding: ${deviceType === 'mobile' ? '12px' : '15px'};
            background: transparent;
            border: 1px solid var(--secondary-glow);
            border-radius: 8px;
            color: var(--secondary-glow);
            font-family: 'Orbitron', monospace;
            font-size: ${deviceType === 'mobile' ? '1rem' : '1.1rem'};
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            text-transform: uppercase;
            letter-spacing: 1px;
            opacity: 1;
            transform: translateY(0);
            min-height: 44px;
        `;
    }

    /**
     * Crear helper de credenciales
     */
    createCredentialsHelper(deviceType) {
        this.credentialsHelper = document.createElement('div');
        this.credentialsHelper.className = 'credentials-helper';
        
        this.credentialsHelper.style.cssText = `
            width: 100%;
            max-width: ${deviceType === 'mobile' ? '90vw' : '400px'};
            padding: ${deviceType === 'mobile' ? '1rem' : '1.2rem'};
            background: rgba(0, 255, 140, 0.1);
            border: 1px solid rgba(0, 255, 140, 0.3);
            border-radius: 8px;
            font-size: ${deviceType === 'mobile' ? '0.8rem' : '0.9rem'};
            line-height: 1.4;
            color: rgba(255, 255, 255, 0.8);
            opacity: 1;
            transform: translateY(0);
        `;

        this.credentialsHelper.innerHTML = `
            <div style="color: #00ff8c; font-weight: bold; margin-bottom: 0.5rem;">
                🔑 CREDENCIALES VÁLIDAS (Demo):
            </div>
            <div style="margin-bottom: 0.3rem;">
                <strong>Email:</strong> admin@fighter2d.com
            </div>
            <div style="margin-bottom: 0.3rem;">
                <strong>Password:</strong> admin123
            </div>
            <div style="font-size: 0.8em; opacity: 0.7;">
                (Cualquier email válido también funciona)
            </div>
        `;
    }

    /**
     * Ensamblar interfaz
     */
    assembleInterface() {
        console.log('🔧 Ensamblando interfaz LoginScene...');
        
        // Crear canvas de partículas
        this.createParticleCanvas();
        
        // Verificar que todos los elementos existan antes de añadirlos
        if (!this.titleElement) {
            console.error('❌ titleElement no creado');
            return;
        }
        if (!this.formElement) {
            console.error('❌ formElement no creado');
            return;
        }
        if (!this.credentialsHelper) {
            console.error('❌ credentialsHelper no creado');
            return;
        }
        
        // Añadir elementos al contenedor en el orden correcto
        if (this.particleCanvas) {
            this.container.appendChild(this.particleCanvas);
            console.log('✅ Canvas de partículas añadido');
        }
        
        this.container.appendChild(this.titleElement);
        console.log('✅ Título añadido');
        
        this.container.appendChild(this.formElement);
        console.log('✅ Formulario añadido');
        
        this.container.appendChild(this.credentialsHelper);
        console.log('✅ Helper de credenciales añadido');
        
        console.log('✅ Interfaz LoginScene ensamblada correctamente');
    }

    /**
     * Crear canvas de partículas
     */
    createParticleCanvas() {
        console.log('🎨 Creando canvas de partículas...');
        
        this.particleCanvas = document.createElement('canvas');
        this.particleCanvas.id = 'login-particles';
        this.particleCanvas.className = 'particles-canvas';
        
        this.particleCanvas.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 1;
            pointer-events: none;
        `;
        
        // Configurar tamaño del canvas manualmente si ResponsiveUtils falla
        try {
            if (ResponsiveUtils && typeof ResponsiveUtils.setupResponsiveCanvas === 'function') {
                ResponsiveUtils.setupResponsiveCanvas(this.particleCanvas);
                console.log('✅ Canvas configurado con ResponsiveUtils');
            } else {
                console.warn('⚠️ ResponsiveUtils no disponible, configurando canvas manualmente');
                this.setupCanvasManually();
            }
        } catch (error) {
            console.warn('⚠️ Error con ResponsiveUtils, configurando canvas manualmente:', error);
            this.setupCanvasManually();
        }
    }
    
    /**
     * Configurar canvas manualmente como fallback
     */
    setupCanvasManually() {
        const canvas = this.particleCanvas;
        const container = this.container;
        
        // Obtener dimensiones del contenedor
        const rect = container.getBoundingClientRect();
        const width = rect.width || window.innerWidth;
        const height = rect.height || window.innerHeight;
        
        // Configurar tamaño del canvas
        canvas.width = width;
        canvas.height = height;
        
        console.log('✅ Canvas configurado manualmente:', { width, height });
        
        // Listener para redimensionamiento
        const resizeHandler = () => {
            const newRect = container.getBoundingClientRect();
            canvas.width = newRect.width || window.innerWidth;
            canvas.height = newRect.height || window.innerHeight;
        };
        
        window.addEventListener('resize', resizeHandler);
        
        // Guardar referencia para limpieza posterior
        this.canvasResizeHandler = resizeHandler;
    }

    /**
     * Configurar event listeners del formulario
     */
    setupFormEventListeners() {
        // Prevenir submit por defecto
        this.formElement.addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.handleLogin();
        });

        // Click en botón de registro
        this.registerButton.addEventListener('click', () => {
            this.handleRegister();
        });

        // Validación en tiempo real
        this.emailInput.addEventListener('input', () => {
            this.validateEmail();
        });

        // Efectos hover en botones
        this.setupButtonEffects();
    }

    /**
     * Configurar efectos de botones
     */
    setupButtonEffects() {
        // Efectos para botón de login
        this.loginButton.addEventListener('mouseenter', () => {
            this.loginButton.style.transform = 'translateY(-2px)';
            this.loginButton.style.boxShadow = '0 5px 30px rgba(0, 242, 255, 0.7)';
        });

        this.loginButton.addEventListener('mouseleave', () => {
            this.loginButton.style.transform = 'translateY(0)';
            this.loginButton.style.boxShadow = '0 0 20px rgba(0, 242, 255, 0.5)';
        });

        // Efectos para botón de registro
        this.registerButton.addEventListener('mouseenter', () => {
            this.registerButton.style.background = 'rgba(255, 0, 193, 0.1)';
            this.registerButton.style.transform = 'translateY(-2px)';
        });

        this.registerButton.addEventListener('mouseleave', () => {
            this.registerButton.style.background = 'transparent';
            this.registerButton.style.transform = 'translateY(0)';
        });
    }

    /**
     * Validar email
     */
    validateEmail() {
        const email = this.emailInput.value;
        const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
        
        if (email.length === 0) {
            this.emailInput.style.borderColor = 'var(--primary-glow)';
        } else if (isValid) {
            this.emailInput.style.borderColor = 'var(--success-glow)';
            this.emailInput.style.boxShadow = '0 0 10px rgba(0, 255, 140, 0.5) inset';
        } else {
            this.emailInput.style.borderColor = 'var(--danger-glow)';
            this.emailInput.style.boxShadow = '0 0 10px rgba(255, 77, 77, 0.5) inset';
        }
    }

    /**
     * Manejar login
     */
    async handleLogin() {
        const email = this.emailInput.value;
        const password = this.passwordInput.value;

        if (!email || !password) {
            this.showError('Por favor complete todos los campos');
            return;
        }

        let shouldResetButton = true;

        try {
            console.log('🔐 Intentando login...');
            
            // Deshabilitar botón durante login
            this.loginButton.disabled = true;
            this.loginButton.textContent = 'INICIANDO...';

            const response = await this.authManager.login(email, password);

            if (response.success) {
                console.log('✅ Login exitoso');
                this.showSuccess('¡Login exitoso!');
                
                // Marcar que no se debe resetear el botón porque vamos a cambiar de escena
                shouldResetButton = false;
                
                // Notificar al ApplicationController
                if (this.applicationController) {
                    await this.applicationController.onAuthenticationSuccess(response.user);
                }
            } else {
                this.showError(response.message || 'Error en el login');
            }

        } catch (error) {
            console.error('❌ Error en login:', error);
            this.showError('Error de conexión. Intente nuevamente.');
        } finally {
            // Solo rehabilitar botón si no se cambió de escena exitosamente
            if (shouldResetButton && this.loginButton) {
                this.loginButton.disabled = false;
                this.loginButton.textContent = 'INICIAR SESIÓN';
            }
        }
    }

    /**
     * Manejar registro
     */
    async handleRegister() {
        const email = this.emailInput.value;
        const password = this.passwordInput.value;

        if (!email || !password) {
            this.showError('Por favor complete todos los campos para registrarse');
            return;
        }

        try {
            console.log('🔐 Intentando registro...');
            
            this.registerButton.disabled = true;
            this.registerButton.textContent = 'REGISTRANDO...';

            const response = await this.authManager.register(email, password);

            if (response.success) {
                this.showSuccess('¡Cuenta creada exitosamente! Ahora puede iniciar sesión.');
            } else {
                this.showError(response.message || 'Error en el registro');
            }

        } catch (error) {
            console.error('❌ Error en registro:', error);
            this.showError('Error de conexión. Intente nuevamente.');
        } finally {
            this.registerButton.disabled = false;
            this.registerButton.textContent = 'CREAR CUENTA';
        }
    }

    /**
     * Mostrar mensaje de error
     */
    showError(message) {
        this.showMessage(message, 'error');
    }

    /**
     * Mostrar mensaje de éxito
     */
    showSuccess(message) {
        this.showMessage(message, 'success');
    }

    /**
     * Mostrar mensaje
     */
    showMessage(message, type = 'info') {
        // Remover mensaje anterior si existe
        const existingMessage = this.container.querySelector('.message');
        if (existingMessage) {
            existingMessage.remove();
        }

        const messageDiv = document.createElement('div');
        messageDiv.className = 'message';
        messageDiv.textContent = message;
        
        const color = type === 'error' ? 'var(--danger-glow)' : 
                     type === 'success' ? 'var(--success-glow)' : 
                     'var(--primary-glow)';
        
        messageDiv.style.cssText = `
            background: rgba(0, 0, 0, 0.8);
            border: 1px solid ${color};
            border-radius: 8px;
            padding: 1rem;
            color: ${color};
            text-align: center;
            font-size: 0.9rem;
            margin-top: 1rem;
            opacity: 0;
            transform: translateY(10px);
            transition: all 0.3s ease;
        `;

        this.container.appendChild(messageDiv);

        // Animar entrada
        setTimeout(() => {
            messageDiv.style.opacity = '1';
            messageDiv.style.transform = 'translateY(0)';
        }, 10);

        // Auto-remover después de 3 segundos
        setTimeout(() => {
            if (messageDiv.parentElement) {
                messageDiv.style.opacity = '0';
                messageDiv.style.transform = 'translateY(-10px)';
                setTimeout(() => messageDiv.remove(), 300);
            }
        }, 3000);
    }

    /**
     * Iniciar efectos visuales
     */
    startVisualEffects() {
        console.log('🎬 Iniciando efectos visuales...');
        
        // Verificar que anime.js esté disponible
        if (typeof anime !== 'undefined') {
            this.startAnimations();
        } else {
            console.warn('⚠️ anime.js no disponible, saltando animaciones');
        }
        
        // Iniciar partículas de fondo
        this.startParticleBackground();
    }

    /**
     * Iniciar animaciones con anime.js
     */
    startAnimations() {
        const timeline = anime.timeline({
            easing: 'easeOutExpo',
            complete: () => {
                console.log('🎬 Animaciones de entrada completadas');
            }
        });

        // Animar desde posiciones iniciales
        anime.set(this.titleElement, { opacity: 0, translateY: -30 });
        anime.set(this.formElement, { opacity: 0, scale: 0.9, translateY: 20 });
        anime.set(this.credentialsHelper, { opacity: 0, translateY: 15 });

        timeline
            .add({
                targets: this.titleElement,
                opacity: [0, 1],
                translateY: [-30, 0],
                duration: 800
            })
            .add({
                targets: this.formElement,
                opacity: [0, 1],
                scale: [0.9, 1],
                translateY: [20, 0],
                duration: 600
            }, '-=400')
            .add({
                targets: this.credentialsHelper,
                opacity: [0, 1],
                translateY: [15, 0],
                duration: 500
            }, '-=200');
    }

    /**
     * Iniciar partículas de fondo
     */
    startParticleBackground() {
        if (!this.particleCanvas) return;

        const ctx = this.particleCanvas.getContext('2d');
        const particles = [];
        const particleCount = 50;

        // Crear partículas
        for (let i = 0; i < particleCount; i++) {
            particles.push({
                x: Math.random() * this.particleCanvas.width,
                y: Math.random() * this.particleCanvas.height,
                size: Math.random() * 2 + 1,
                speedX: (Math.random() - 0.5) * 0.5,
                speedY: (Math.random() - 0.5) * 0.5,
                opacity: Math.random() * 0.5 + 0.2,
                color: Math.random() > 0.5 ? '#00f2ff' : '#ff00c1'
            });
        }

        // Animar partículas
        const animateParticles = () => {
            ctx.clearRect(0, 0, this.particleCanvas.width, this.particleCanvas.height);

            particles.forEach(particle => {
                // Actualizar posición
                particle.x += particle.speedX;
                particle.y += particle.speedY;

                // Rebote en bordes
                if (particle.x <= 0 || particle.x >= this.particleCanvas.width) {
                    particle.speedX *= -1;
                }
                if (particle.y <= 0 || particle.y >= this.particleCanvas.height) {
                    particle.speedY *= -1;
                }

                // Dibujar partícula
                ctx.save();
                ctx.globalAlpha = particle.opacity;
                ctx.fillStyle = particle.color;
                ctx.beginPath();
                ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            });

            this.animationId = requestAnimationFrame(animateParticles);
        };

        animateParticles();
    }

    /**
     * Forzar visibilidad para debugging
     */
    forceVisibility() {
        console.log('🔧 Forzando visibilidad de LoginScene...');
        
        const sceneContainer = document.getElementById('scene-container');
        const loginContainer = document.getElementById('login-scene-container');
        
        if (sceneContainer) {
            sceneContainer.style.cssText = `
                position: fixed !important;
                top: 0 !important;
                left: 0 !important;
                width: 100% !important;
                height: 100% !important;
                z-index: 1000 !important;
                display: block !important;
                visibility: visible !important;
                opacity: 1 !important;
                background: transparent !important;
            `;
            console.log('✅ scene-container forzado visible');
        }
        
        if (loginContainer) {
            loginContainer.style.cssText = `
                position: fixed !important;
                top: 0 !important;
                left: 0 !important;
                width: 100% !important;
                height: 100% !important;
                background: #0d0d1a !important;
                background-image: 
                    radial-gradient(circle at 20% 80%, rgba(0, 242, 255, 0.15) 0%, transparent 50%),
                    radial-gradient(circle at 80% 20%, rgba(255, 0, 193, 0.15) 0%, transparent 50%) !important;
                display: flex !important;
                flex-direction: column !important;
                justify-content: center !important;
                align-items: center !important;
                z-index: 1001 !important;
                font-family: 'Inter', sans-serif !important;
                padding: 2rem !important;
                overflow-y: auto !important;
                box-sizing: border-box !important;
                gap: 1.5rem !important;
                opacity: 1 !important;
                visibility: visible !important;
                pointer-events: auto !important;
            `;
            console.log('✅ login-scene-container forzado visible');
        }
        
        // Forzar visibilidad de elementos principales
        if (this.titleElement) {
            this.titleElement.style.cssText += `
                display: block !important;
                visibility: visible !important;
                opacity: 1 !important;
                z-index: 1002 !important;
            `;
        }
        
        if (this.formElement) {
            this.formElement.style.cssText += `
                display: flex !important;
                visibility: visible !important;
                opacity: 1 !important;
                z-index: 1002 !important;
            `;
        }
        
        if (this.credentialsHelper) {
            this.credentialsHelper.style.cssText += `
                display: block !important;
                visibility: visible !important;
                opacity: 1 !important;
                z-index: 1002 !important;
            `;
        }
        
        console.log('✅ Visibilidad forzada en todos los elementos');
    }

    /**
     * Actualización de la escena
     */
    update(deltaTime) {
        // Implementación básica - puede expandirse según necesidades
    }

    /**
     * Limpiar recursos
     */
    cleanup() {
        console.log('🔐 Limpiando LoginScene...');
        
        try {
            // Cancelar animaciones
            if (this.animationId) {
                cancelAnimationFrame(this.animationId);
                this.animationId = null;
            }

            // Limpiar canvas responsivo
            if (this.particleCanvas) {
                try {
                    if (ResponsiveUtils && typeof ResponsiveUtils.cleanup === 'function') {
                        ResponsiveUtils.cleanup(this.particleCanvas);
                    }
                } catch (error) {
                    console.warn('⚠️ Error limpiando ResponsiveUtils:', error);
                }
            }
            
            // Limpiar resize handler manual si existe
            if (this.canvasResizeHandler) {
                window.removeEventListener('resize', this.canvasResizeHandler);
                this.canvasResizeHandler = null;
            }

            // Remover del DOM
            if (this.container && this.container.parentElement) {
                this.container.remove();
            }

            // Limpiar referencias
            this.container = null;
            this.particleCanvas = null;
            this.titleElement = null;
            this.formElement = null;
            this.emailInput = null;
            this.passwordInput = null;
            this.loginButton = null;
            this.registerButton = null;
            this.credentialsHelper = null;
            
            console.log('✅ LoginScene limpiada correctamente');
            
        } catch (error) {
            console.error('❌ Error durante cleanup de LoginScene:', error);
        }
    }
}