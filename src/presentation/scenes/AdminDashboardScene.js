/**
 * AdminDashboardScene - Panel de administración épico con efectos holográficos
 * Implementación EXACTA basada en ejemplos funcionales
 */
export default class AdminDashboardScene {
    constructor(onLogout) {
        this.onLogout = onLogout;
        this.apiClient = null;
        this.currentTab = 'characters';
        this.data = {
            characters: [],
            stages: [],
            music: []
        };
        this.container = null;
        this.particleCanvas = null;
        this.animationId = null;
        this.statsAnimation = null;
    }

    async init() {
        this.apiClient = window.gameManager?.apiClient;
        
        if (this.apiClient) {
            await this.loadAllData();
        }
    }

    async loadAllData() {
        try {
            this.data.characters = await this.apiClient.getAllCharacters();
            this.data.stages = await this.apiClient.getStages();
            this.data.music = await this.apiClient.getMusic();
        } catch (error) {
            console.error('Error cargando datos del admin:', error);
        }
    }

    render() {
        const gameCanvas = document.getElementById('gameCanvas');
        if (gameCanvas) {
            gameCanvas.style.display = 'none';
        }

        // Crear el contenedor principal - ÉPICO ADMIN STYLE
        this.container = document.createElement('div');
        this.container.id = 'admin-dashboard-container';
        this.container.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: var(--dark-bg);
            background-image: 
                radial-gradient(circle at 10% 20%, rgba(0, 242, 255, 0.1) 0%, transparent 50%),
                radial-gradient(circle at 90% 80%, rgba(255, 215, 0, 0.1) 0%, transparent 50%),
                linear-gradient(45deg, rgba(0, 242, 255, 0.03) 0%, rgba(255, 0, 193, 0.03) 100%);
            color: var(--text-color);
            font-family: 'Inter', sans-serif;
            overflow: hidden;
            z-index: 1000;
        `;

        // Canvas para partículas de fondo
        this.particleCanvas = document.createElement('canvas');
        this.particleCanvas.id = 'admin-particles-canvas';
        this.particleCanvas.width = window.innerWidth;
        this.particleCanvas.height = window.innerHeight;
        this.particleCanvas.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 1;
            pointer-events: none;
        `;

        // Header épico del admin
        const header = this.createEpicHeader();
        
        // Stats container - EXACTO como el ejemplo AdminDashboard
        const statsContainer = this.createStatsContainer();
        
        // Panel principal de contenido
        const mainPanel = this.createMainPanel();
        
        // Ensamblar
        this.container.appendChild(this.particleCanvas);
        this.container.appendChild(header);
        this.container.appendChild(statsContainer);
        this.container.appendChild(mainPanel);
        document.body.appendChild(this.container);

        // Iniciar animaciones
        this.startAdminAnimation();
        this.startParticleBackground();
        this.animateStats();

    }

    createEpicHeader() {
        const header = document.createElement('div');
        header.style.cssText = `
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 2rem 3rem;
            background: rgba(0, 0, 0, 0.3);
            backdrop-filter: blur(10px);
            border-bottom: 2px solid var(--primary-glow);
            box-shadow: 0 4px 20px rgba(0, 242, 255, 0.3);
            z-index: 3;
            position: relative;
            opacity: 0;
            transform: translateY(-20px);
        `;

        // Título épico
        const title = document.createElement('h1');
        title.textContent = 'CENTRO DE COMANDO ADMINISTRATIVO';
        title.style.cssText = `
            font-family: 'Orbitron', monospace;
            font-size: 2rem;
            font-weight: 900;
            color: #fff;
            text-shadow: 
                0 0 10px var(--primary-glow),
                0 0 20px var(--primary-glow),
                0 0 30px rgba(0, 242, 255, 0.5);
            margin: 0;
            letter-spacing: 2px;
            text-transform: uppercase;
        `;

        // Info de usuario
        const userInfo = document.createElement('div');
        userInfo.style.cssText = `
            display: flex;
            align-items: center;
            gap: 1rem;
        `;

        const userAvatar = document.createElement('div');
        userAvatar.style.cssText = `
            width: 50px;
            height: 50px;
            border-radius: 50%;
            background: linear-gradient(45deg, var(--primary-glow), var(--secondary-glow));
            display: flex;
            align-items: center;
            justify-content: center;
            font-family: 'Orbitron', monospace;
            font-weight: bold;
            font-size: 1.2rem;
            color: #000;
            box-shadow: 0 0 20px rgba(0, 242, 255, 0.5);
        `;
        userAvatar.textContent = 'A'; // Admin

        const userDetails = document.createElement('div');
        const userName = document.createElement('div');
        userName.textContent = 'Administrador';
        userName.style.cssText = `
            font-family: 'Orbitron', monospace;
            font-weight: 600;
            color: var(--primary-glow);
        `;

        const userRole = document.createElement('div');
        userRole.textContent = 'CONTROL TOTAL';
        userRole.style.cssText = `
            font-size: 0.8rem;
            color: var(--warning-glow);
            font-family: 'Orbitron', monospace;
            font-weight: 400;
        `;

        userDetails.appendChild(userName);
        userDetails.appendChild(userRole);

        // Botón de logout épico
        const logoutButton = document.createElement('button');
        logoutButton.textContent = '← DESCONECTAR';
        logoutButton.style.cssText = `
            background: transparent;
            border: 2px solid var(--danger-glow);
            color: var(--danger-glow);
            padding: 12px 20px;
            border-radius: 8px;
            font-family: 'Orbitron', monospace;
            font-size: 0.9rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            text-transform: uppercase;
            letter-spacing: 1px;
        `;

        logoutButton.addEventListener('mouseenter', () => {
            if (typeof anime !== 'undefined') {
                anime({
                    targets: logoutButton,
                    scale: 1.05,
                    boxShadow: '0 0 20px rgba(255, 77, 77, 0.6)',
                    duration: 200,
                    easing: 'easeOutQuad'
                });
            }
        });

        logoutButton.addEventListener('mouseleave', () => {
            if (typeof anime !== 'undefined') {
                anime({
                    targets: logoutButton,
                    scale: 1,
                    boxShadow: '0 0 0px rgba(255, 77, 77, 0)',
                    duration: 200,
                    easing: 'easeOutQuad'
                });
            }
        });

        logoutButton.addEventListener('click', () => {
            this.handleLogout();
        });

        userInfo.appendChild(userAvatar);
        userInfo.appendChild(userDetails);
        userInfo.appendChild(logoutButton);

        header.appendChild(title);
        header.appendChild(userInfo);

        return header;
    }

    createStatsContainer() {
        // EXACTO como el ejemplo AdminDashboardScene
        const statsSection = document.createElement('div');
        statsSection.style.cssText = `
            padding: 2rem 3rem;
            z-index: 3;
            position: relative;
            opacity: 0;
            transform: translateY(20px);
        `;

        const statsTitle = document.createElement('h2');
        statsTitle.textContent = 'ESTADÍSTICAS DEL SISTEMA';
        statsTitle.style.cssText = `
            font-family: 'Orbitron', monospace;
            font-size: 1.5rem;
            font-weight: 700;
            color: var(--warning-glow);
            margin-bottom: 1.5rem;
            text-shadow: 0 0 10px var(--warning-glow);
            text-transform: uppercase;
            letter-spacing: 1px;
        `;

        const statsContainer = document.createElement('div');
        statsContainer.className = 'stats-container';
        statsContainer.style.cssText = `
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 1.5rem;
            width: 100%;
        `;

        // Stats cards - EXACTO del ejemplo
        const statsData = [
            { label: 'Usuarios Hoy', value: 1428, color: 'var(--success-glow)' },
            { label: 'Partidas Activas', value: 87, color: 'var(--primary-glow)' },
            { label: 'Win Rate (%)', value: 92.5, color: 'var(--warning-glow)' },
            { label: 'Ping (ms)', value: 215, color: 'var(--secondary-glow)' }
        ];

        statsData.forEach(stat => {
            const statCard = document.createElement('div');
            statCard.className = 'stat-card';
            statCard.style.cssText = `
                background: rgba(0, 0, 0, 0.3);
                border: 1px solid ${stat.color};
                border-radius: 12px;
                padding: 1.5rem;
                text-align: center;
                transition: all 0.3s ease;
                backdrop-filter: blur(5px);
                box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
                cursor: pointer;
            `;

            const value = document.createElement('div');
            value.className = 'value';
            value.dataset.value = stat.value;
            value.textContent = '0';
            value.style.cssText = `
                font-size: 2.5rem;
                font-family: 'Orbitron', monospace;
                font-weight: 900;
                color: ${stat.color};
                margin-bottom: 0.5rem;
                text-shadow: 0 0 10px ${stat.color};
            `;

            const label = document.createElement('div');
            label.className = 'label';
            label.textContent = stat.label;
            label.style.cssText = `
                font-size: 0.9rem;
                color: var(--text-color);
                font-family: 'Orbitron', monospace;
                font-weight: 400;
                text-transform: uppercase;
                letter-spacing: 1px;
            `;

            statCard.appendChild(value);
            statCard.appendChild(label);
            statsContainer.appendChild(statCard);

            // Hover effect
            statCard.addEventListener('mouseenter', () => {
                if (typeof anime !== 'undefined') {
                    anime({
                        targets: statCard,
                        translateY: -5,
                        boxShadow: `0 10px 25px ${stat.color}40`,
                        duration: 200,
                        easing: 'easeOutQuad'
                    });
                }
            });

            statCard.addEventListener('mouseleave', () => {
                if (typeof anime !== 'undefined') {
                    anime({
                        targets: statCard,
                        translateY: 0,
                        boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)',
                        duration: 200,
                        easing: 'easeOutQuad'
                    });
                }
            });
        });

        statsSection.appendChild(statsTitle);
        statsSection.appendChild(statsContainer);

        return statsSection;
    }

    createMainPanel() {
        const mainPanel = document.createElement('div');
        mainPanel.style.cssText = `
            flex: 1;
            padding: 0 3rem 2rem 3rem;
            z-index: 3;
            position: relative;
            overflow-y: auto;
            opacity: 0;
            transform: translateY(30px);
        `;

        // Tabs para gestión
        const tabsContainer = document.createElement('div');
        tabsContainer.style.cssText = `
            background: rgba(0, 0, 0, 0.3);
            border-radius: 15px;
            padding: 2rem;
            border: 1px solid var(--primary-glow);
            box-shadow: 
                0 0 30px rgba(0, 242, 255, 0.2),
                inset 0 0 30px rgba(0, 242, 255, 0.05);
            backdrop-filter: blur(10px);
        `;

        const tabsNav = document.createElement('div');
        tabsNav.style.cssText = `
            display: flex;
            gap: 1rem;
            margin-bottom: 2rem;
            border-bottom: 1px solid var(--border-color);
            padding-bottom: 1rem;
        `;

        const tabs = ['characters', 'stages', 'music'];
        const tabLabels = ['Personajes', 'Escenarios', 'Música'];

        tabs.forEach((tab, index) => {
            const tabButton = document.createElement('button');
            tabButton.textContent = tabLabels[index];
            tabButton.dataset.tab = tab;
            tabButton.className = `admin-tab ${tab === this.currentTab ? 'active' : ''}`;
            tabButton.style.cssText = `
                background: ${tab === this.currentTab ? 'var(--primary-glow)' : 'transparent'};
                color: ${tab === this.currentTab ? '#000' : 'var(--text-color)'};
                border: 2px solid var(--primary-glow);
                padding: 12px 20px;
                border-radius: 8px;
                font-family: 'Orbitron', monospace;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.3s ease;
                text-transform: uppercase;
                letter-spacing: 1px;
            `;

            tabButton.addEventListener('click', () => {
                this.switchTab(tab, tabsNav);
            });

            tabsNav.appendChild(tabButton);
        });

        // Contenido de gestión
        const managementContent = document.createElement('div');
        managementContent.id = 'management-content';
        managementContent.style.cssText = `
            min-height: 300px;
        `;

        const contentText = document.createElement('div');
        contentText.style.cssText = `
            text-align: center;
            color: var(--text-color);
            font-family: 'Orbitron', monospace;
            font-size: 1.2rem;
            padding: 2rem;
        `;
        contentText.textContent = `Panel de gestión de ${tabLabels[tabs.indexOf(this.currentTab)]} - En desarrollo`;

        managementContent.appendChild(contentText);
        tabsContainer.appendChild(tabsNav);
        tabsContainer.appendChild(managementContent);
        mainPanel.appendChild(tabsContainer);

        return mainPanel;
    }

    switchTab(tab, tabsNav) {
        this.currentTab = tab;
        
        // Actualizar tabs visuales
        tabsNav.querySelectorAll('.admin-tab').forEach(tabBtn => {
            if (tabBtn.dataset.tab === tab) {
                tabBtn.style.background = 'var(--primary-glow)';
                tabBtn.style.color = '#000';
                tabBtn.classList.add('active');
            } else {
                tabBtn.style.background = 'transparent';
                tabBtn.style.color = 'var(--text-color)';
                tabBtn.classList.remove('active');
            }
        });

        // Efecto de cambio de contenido
        const content = document.getElementById('management-content');
        if (typeof anime !== 'undefined') {
            anime({
                targets: content,
                opacity: [1, 0],
                translateY: [0, -10],
                duration: 200,
                easing: 'easeInQuad',
                complete: () => {
                    const tabLabels = { characters: 'Personajes', stages: 'Escenarios', music: 'Música' };
                    content.querySelector('div').textContent = `Panel de gestión de ${tabLabels[tab]} - En desarrollo`;
                    anime({
                        targets: content,
                        opacity: [0, 1],
                        translateY: [-10, 0],
                        duration: 300,
                        easing: 'easeOutQuad'
                    });
                }
            });
        }
    }

    startAdminAnimation() {
        if (typeof anime === 'undefined') {
            console.warn('⚠️ anime.js no disponible en AdminDashboardScene');
            return;
        }

        const header = this.container.querySelector('div:nth-child(2)');
        const statsSection = this.container.querySelector('div:nth-child(3)');
        const mainPanel = this.container.querySelector('div:nth-child(4)');

        // Timeline épica de entrada
        anime.timeline({ easing: 'easeOutExpo' })
            .add({
                targets: header,
                opacity: [0, 1],
                translateY: [-20, 0],
                duration: 800
            })
            .add({
                targets: statsSection,
                opacity: [0, 1],
                translateY: [20, 0],
                duration: 600
            }, '-=400')
            .add({
                targets: mainPanel,
                opacity: [0, 1],
                translateY: [30, 0],
                duration: 600
            }, '-=300');
    }

    animateStats() {
        if (typeof anime === 'undefined') return;

        // EXACTO como el ejemplo AdminDashboard
        const statValues = this.container.querySelectorAll('.stat-card .value');
        
        statValues.forEach(el => {
            const target = { val: 0 };
            anime({
                targets: target,
                val: parseFloat(el.dataset.value),
                round: el.dataset.value.includes('.') ? 10 : 1,
                duration: 2000,
                easing: 'easeOutCubic',
                delay: 800,
                update: () => {
                    el.textContent = el.dataset.value.includes('.') ? target.val.toFixed(1) : target.val;
                }
            });
        });
    }

    startParticleBackground() {
        if (!this.particleCanvas) return;
        
        const ctx = this.particleCanvas.getContext('2d');
        const particles = [];
        
        // Partículas más épicas para admin
        for (let i = 0; i < 50; i++) {
            particles.push({
                x: Math.random() * this.particleCanvas.width,
                y: Math.random() * this.particleCanvas.height,
                size: Math.random() * 1.5 + 0.5,
                speedX: (Math.random() - 0.5) * 0.3,
                speedY: (Math.random() - 0.5) * 0.3,
                opacity: Math.random() * 0.4 + 0.1,
                color: ['rgba(0, 242, 255, ', 'rgba(255, 215, 0, ', 'rgba(0, 255, 140, '][Math.floor(Math.random() * 3)]
            });
        }

        const animateParticles = () => {
            ctx.clearRect(0, 0, this.particleCanvas.width, this.particleCanvas.height);
            
            particles.forEach(particle => {
                particle.x += particle.speedX;
                particle.y += particle.speedY;
                
                if (particle.x < 0 || particle.x > this.particleCanvas.width) particle.speedX *= -1;
                if (particle.y < 0 || particle.y > this.particleCanvas.height) particle.speedY *= -1;
                
                ctx.globalAlpha = particle.opacity;
                ctx.fillStyle = particle.color + particle.opacity + ')';
                ctx.beginPath();
                ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
                ctx.fill();
            });
            
            if (document.getElementById('admin-dashboard-container')) {
                this.animationId = requestAnimationFrame(animateParticles);
            }
        };
        
        animateParticles();
    }

    handleLogout() {
        console.log('🚪 Cerrando sesión de administrador...');
        
        if (typeof anime !== 'undefined') {
            anime({
                targets: this.container,
                opacity: [1, 0],
                scale: [1, 0.95],
                duration: 600,
                easing: 'easeInExpo',
                complete: () => {
                    if (this.onLogout) {
                        this.onLogout();
                    }
                }
            });
        } else {
            if (this.onLogout) {
                this.onLogout();
            }
        }
    }

    cleanup() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }

        if (this.statsAnimation) {
            anime.remove(this.statsAnimation);
        }

        if (this.container) {
            this.container.remove();
        }

    }
}