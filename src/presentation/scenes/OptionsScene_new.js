import UserPreferencesManager from '../../application/UserPreferencesManager.js';
import anime from 'https://cdn.jsdelivr.net/npm/animejs@4.1.2/+esm';

/**
 * OptionsScene - Pantalla de configuración y opciones futurista
 * Sección 9 del Documento Maestro
 */
export default class OptionsScene {
    constructor(onBack) {
        this.onBack = onBack;
        this.currentTab = 'audio';
        this.preferences = null;
        this.pendingChanges = {};
        this.animations = [];
        this.particleAnimations = [];
    }

    async init() {
        // Cargar preferencias actuales
        this.preferences = UserPreferencesManager.getPreferences();
    }

    render() {
        // Ocultar canvas del juego
        const gameCanvas = document.getElementById('gameCanvas');
        if (gameCanvas) {
            gameCanvas.style.display = 'none';
        }

        const container = document.createElement('div');
        container.id = 'optionsContainer';
        container.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: radial-gradient(circle at 50% 50%, #1a1a2e 0%, #0f0f0f 70%);
            color: white;
            font-family: 'Orbitron', 'Arial', sans-serif;
            overflow: hidden;
            opacity: 0;
        `;

        // Crear fondo de partículas hexagonales
        this.createHexParticleField(container);

        // Grid background animado
        this.createAnimatedGrid(container);

        // Header con efectos holográficos
        const header = this.createFuturisticHeader();
        container.appendChild(header);

        // Navigation con efectos 3D
        const nav = this.createAdvancedNavigation();
        container.appendChild(nav);

        // Content con paneles holográficos
        const content = this.createHolographicContent();
        container.appendChild(content);

        // Footer con botones cyberpunk
        const footer = this.createCyberpunkFooter();
        container.appendChild(footer);

        document.body.appendChild(container);

        // Añadir estilos épicos
        this.addFuturisticStyles();

        // Animación de entrada
        this.playEntranceAnimation(container);
    }

    createHexParticleField(container) {
        const particleContainer = document.createElement('div');
        particleContainer.id = 'hexParticleField';
        particleContainer.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 1;
        `;

        // Crear partículas hexagonales flotantes
        for (let i = 0; i < 25; i++) {
            const hex = document.createElement('div');
            hex.className = 'hex-particle';
            hex.style.cssText = `
                position: absolute;
                width: ${Math.random() * 30 + 20}px;
                height: ${Math.random() * 30 + 20}px;
                background: linear-gradient(45deg, #00ffff, #0080ff);
                clip-path: polygon(30% 0%, 70% 0%, 100% 50%, 70% 100%, 30% 100%, 0% 50%);
                opacity: ${Math.random() * 0.6 + 0.2};
                left: ${Math.random() * 100}%;
                top: ${Math.random() * 100}%;
                transform: rotate(${Math.random() * 360}deg);
                filter: blur(${Math.random() * 2}px);
            `;
            particleContainer.appendChild(hex);

            // Animación flotante con rotación
            this.particleAnimations.push(
                anime({
                    targets: hex,
                    translateY: [0, Math.random() * 200 - 100],
                    translateX: [0, Math.random() * 100 - 50],
                    rotate: [0, 360],
                    scale: [1, Math.random() * 0.5 + 0.5],
                    opacity: [hex.style.opacity, 0, hex.style.opacity],
                    duration: Math.random() * 8000 + 6000,
                    loop: true,
                    direction: 'alternate',
                    easing: 'easeInOutSine'
                })
            );
        }

        container.appendChild(particleContainer);
    }

    createAnimatedGrid(container) {
        const grid = document.createElement('div');
        grid.id = 'animatedGrid';
        grid.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-image: 
                linear-gradient(rgba(0,255,255,0.1) 1px, transparent 1px),
                linear-gradient(90deg, rgba(0,255,255,0.1) 1px, transparent 1px);
            background-size: 50px 50px;
            pointer-events: none;
            z-index: 2;
            opacity: 0.3;
        `;

        container.appendChild(grid);

        // Animación de pulso de la grid
        this.animations.push(
            anime({
                targets: grid,
                opacity: [0.3, 0.6, 0.3],
                duration: 4000,
                loop: true,
                easing: 'easeInOutQuad'
            })
        );
    }

    createFuturisticHeader() {
        const header = document.createElement('div');
        header.style.cssText = `
            position: relative;
            background: linear-gradient(135deg, rgba(0,255,255,0.1), rgba(0,128,255,0.1));
            backdrop-filter: blur(10px);
            border: 1px solid rgba(0,255,255,0.3);
            border-radius: 0 0 30px 30px;
            padding: 30px;
            text-align: center;
            z-index: 10;
            margin-bottom: 20px;
            box-shadow: 0 10px 30px rgba(0,255,255,0.2);
        `;

        const title = document.createElement('h1');
        title.textContent = 'CONFIGURACIÓN AVANZADA';
        title.style.cssText = `
            margin: 0;
            background: linear-gradient(45deg, #00ffff, #0080ff, #00ffff);
            background-size: 200% 200%;
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            font-size: 3rem;
            font-weight: bold;
            text-shadow: 0 0 20px rgba(0,255,255,0.5);
            letter-spacing: 3px;
        `;

        const subtitle = document.createElement('div');
        subtitle.textContent = '━━━ SISTEMA DE CONTROL NEURAL ━━━';
        subtitle.style.cssText = `
            color: rgba(0,255,255,0.8);
            font-size: 1rem;
            margin-top: 10px;
            font-family: 'Courier New', monospace;
            letter-spacing: 2px;
        `;

        header.appendChild(title);
        header.appendChild(subtitle);

        // Animación del gradiente del título
        this.animations.push(
            anime({
                targets: title,
                backgroundPosition: ['0% 50%', '100% 50%'],
                duration: 3000,
                loop: true,
                direction: 'alternate',
                easing: 'easeInOutSine'
            })
        );

        return header;
    }

    createAdvancedNavigation() {
        const nav = document.createElement('div');
        nav.style.cssText = `
            display: flex;
            justify-content: center;
            gap: 10px;
            padding: 20px;
            z-index: 10;
            position: relative;
        `;

        const tabs = [
            { id: 'audio', label: 'AUDIO', icon: '🔊', color: '#ff6b6b' },
            { id: 'controls', label: 'CONTROLES', icon: '🎮', color: '#4ecdc4' },
            { id: 'graphics', label: 'GRÁFICOS', icon: '🎨', color: '#45b7d1' },
            { id: 'gameplay', label: 'GAMEPLAY', icon: '⚡', color: '#96ceb4' }
        ];

        tabs.forEach(tab => {
            const button = this.createAdvancedTabButton(tab);
            nav.appendChild(button);
        });

        return nav;
    }

    createAdvancedTabButton(tab) {
        const button = document.createElement('button');
        button.className = 'futuristic-tab';
        button.innerHTML = `
            <div class="tab-icon">${tab.icon}</div>
            <div class="tab-label">${tab.label}</div>
            <div class="tab-glow"></div>
        `;

        const isActive = this.currentTab === tab.id;
        button.style.cssText = `
            position: relative;
            padding: 20px 25px;
            background: ${isActive ? 
                `linear-gradient(135deg, ${tab.color}40, ${tab.color}20)` : 
                'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))'
            };
            border: 2px solid ${isActive ? tab.color : 'rgba(255,255,255,0.2)'};
            border-radius: 15px;
            color: white;
            cursor: pointer;
            font-family: inherit;
            font-size: 0.9rem;
            font-weight: bold;
            backdrop-filter: blur(10px);
            overflow: hidden;
            transition: all 0.3s ease;
            transform: ${isActive ? 'scale(1.05)' : 'scale(1)'};
            min-width: 120px;
            text-align: center;
        `;

        // Eventos de hover
        button.onmouseenter = () => {
            if (this.currentTab !== tab.id) {
                anime({
                    targets: button,
                    scale: 1.05,
                    borderColor: tab.color,
                    duration: 200,
                    easing: 'easeOutQuad'
                });

                // Efecto de glow
                const glow = button.querySelector('.tab-glow');
                anime({
                    targets: glow,
                    opacity: [0, 0.6, 0],
                    scale: [0.8, 1.2],
                    duration: 600,
                    easing: 'easeOutQuad'
                });
            }
        };

        button.onmouseleave = () => {
            if (this.currentTab !== tab.id) {
                anime({
                    targets: button,
                    scale: 1,
                    borderColor: 'rgba(255,255,255,0.2)',
                    duration: 200,
                    easing: 'easeOutQuad'
                });
            }
        };

        button.onclick = () => {
            this.switchTab(tab.id);
        };

        return button;
    }

    switchTab(tabId) {
        const oldTab = this.currentTab;
        this.currentTab = tabId;

        // Actualizar botones
        const buttons = document.querySelectorAll('.futuristic-tab');
        buttons.forEach((btn, index) => {
            const tabInfo = [
                { id: 'audio', color: '#ff6b6b' },
                { id: 'controls', color: '#4ecdc4' },
                { id: 'graphics', color: '#45b7d1' },
                { id: 'gameplay', color: '#96ceb4' }
            ][index];

            const isActive = tabInfo.id === tabId;
            
            anime({
                targets: btn,
                scale: isActive ? 1.05 : 1,
                background: isActive ? 
                    `linear-gradient(135deg, ${tabInfo.color}40, ${tabInfo.color}20)` : 
                    'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))',
                borderColor: isActive ? tabInfo.color : 'rgba(255,255,255,0.2)',
                duration: 300,
                easing: 'easeOutQuad'
            });
        });

        // Actualizar contenido
        this.refreshHolographicContent();
    }

    createHolographicContent() {
        const content = document.createElement('div');
        content.id = 'holographicContent';
        content.style.cssText = `
            padding: 30px;
            min-height: 400px;
            max-width: 900px;
            margin: 0 auto;
            position: relative;
            z-index: 10;
        `;

        this.renderCurrentHolographicTab(content);
        return content;
    }

    refreshHolographicContent() {
        const content = document.getElementById('holographicContent');
        if (content) {
            // Animación de salida
            anime({
                targets: content.children,
                opacity: 0,
                translateY: -20,
                duration: 200,
                complete: () => {
                    this.renderCurrentHolographicTab(content);
                    // Animación de entrada
                    anime({
                        targets: content.children,
                        opacity: [0, 1],
                        translateY: [20, 0],
                        duration: 400,
                        delay: anime.stagger(100),
                        easing: 'easeOutQuad'
                    });
                }
            });
        }
    }

    renderCurrentHolographicTab(container) {
        container.innerHTML = '';

        switch (this.currentTab) {
            case 'audio':
                this.renderFuturisticAudioTab(container);
                break;
            case 'controls':
                this.renderFuturisticControlsTab(container);
                break;
            case 'graphics':
                this.renderFuturisticGraphicsTab(container);
                break;
            case 'gameplay':
                this.renderFuturisticGameplayTab(container);
                break;
        }
    }

    renderFuturisticAudioTab(container) {
        const panel = this.createHolographicPanel('CONFIGURACIÓN DE AUDIO', '#ff6b6b');
        
        // Volumen Master
        const masterSection = this.createQuantumSlider(
            'VOLUMEN MASTER',
            this.preferences.audio?.masterVolume || 0.7,
            '#ff6b6b',
            (value) => {
                this.pendingChanges.audio = this.pendingChanges.audio || {};
                this.pendingChanges.audio.masterVolume = value;
            }
        );
        
        // Volumen Música
        const musicSection = this.createQuantumSlider(
            'VOLUMEN MÚSICA',
            this.preferences.audio?.musicVolume || 0.6,
            '#ff8e53',
            (value) => {
                this.pendingChanges.audio = this.pendingChanges.audio || {};
                this.pendingChanges.audio.musicVolume = value;
            }
        );
        
        // Volumen Efectos
        const sfxSection = this.createQuantumSlider(
            'VOLUMEN EFECTOS',
            this.preferences.audio?.sfxVolume || 0.8,
            '#ff6b9d',
            (value) => {
                this.pendingChanges.audio = this.pendingChanges.audio || {};
                this.pendingChanges.audio.sfxVolume = value;
            }
        );

        panel.appendChild(masterSection);
        panel.appendChild(musicSection);
        panel.appendChild(sfxSection);
        container.appendChild(panel);
    }

    renderFuturisticControlsTab(container) {
        const panel = this.createHolographicPanel('CONFIGURACIÓN DE CONTROLES', '#4ecdc4');
        
        const controlsInfo = document.createElement('div');
        controlsInfo.innerHTML = `
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin-top: 20px;">
                ${this.createControlBinding('JUGADOR 1 - PUÑETAZO', 'A', '#4ecdc4')}
                ${this.createControlBinding('JUGADOR 1 - PATADA', 'S', '#4ecdc4')}
                ${this.createControlBinding('JUGADOR 1 - SALTO', 'W', '#4ecdc4')}
                ${this.createControlBinding('JUGADOR 1 - AGACHARSE', 'S', '#4ecdc4')}
                ${this.createControlBinding('JUGADOR 2 - PUÑETAZO', 'J', '#26d0ce')}
                ${this.createControlBinding('JUGADOR 2 - PATADA', 'K', '#26d0ce')}
                ${this.createControlBinding('JUGADOR 2 - SALTO', 'I', '#26d0ce')}
                ${this.createControlBinding('JUGADOR 2 - AGACHARSE', 'K', '#26d0ce')}
            </div>
        `;
        
        panel.appendChild(controlsInfo);
        container.appendChild(panel);
    }

    renderFuturisticGraphicsTab(container) {
        const panel = this.createHolographicPanel('CONFIGURACIÓN GRÁFICA', '#45b7d1');
        
        // Calidad
        const qualitySection = this.createQuantumSelector(
            'CALIDAD VISUAL',
            ['Bajo', 'Medio', 'Alto', 'Ultra'],
            this.preferences.graphics?.quality || 'Alto',
            '#45b7d1',
            (value) => {
                this.pendingChanges.graphics = this.pendingChanges.graphics || {};
                this.pendingChanges.graphics.quality = value;
            }
        );

        // VSync
        const vsyncSection = this.createQuantumToggle(
            'SINCRONIZACIÓN VERTICAL',
            this.preferences.graphics?.vsync || true,
            '#45b7d1',
            (value) => {
                this.pendingChanges.graphics = this.pendingChanges.graphics || {};
                this.pendingChanges.graphics.vsync = value;
            }
        );

        panel.appendChild(qualitySection);
        panel.appendChild(vsyncSection);
        container.appendChild(panel);
    }

    renderFuturisticGameplayTab(container) {
        const panel = this.createHolographicPanel('CONFIGURACIÓN DE GAMEPLAY', '#96ceb4');
        
        // Dificultad
        const difficultySection = this.createQuantumSelector(
            'DIFICULTAD DE IA',
            ['Fácil', 'Normal', 'Difícil', 'Pesadilla'],
            this.preferences.gameplay?.difficulty || 'Normal',
            '#96ceb4',
            (value) => {
                this.pendingChanges.gameplay = this.pendingChanges.gameplay || {};
                this.pendingChanges.gameplay.difficulty = value;
            }
        );

        // Tiempo de ronda
        const roundTimeSection = this.createQuantumSelector(
            'TIEMPO DE RONDA',
            ['30s', '60s', '90s', '120s', 'Infinito'],
            this.preferences.gameplay?.roundTime || '90s',
            '#96ceb4',
            (value) => {
                this.pendingChanges.gameplay = this.pendingChanges.gameplay || {};
                this.pendingChanges.gameplay.roundTime = value;
            }
        );

        panel.appendChild(difficultySection);
        panel.appendChild(roundTimeSection);
        container.appendChild(panel);
    }

    createHolographicPanel(title, color) {
        const panel = document.createElement('div');
        panel.style.cssText = `
            background: linear-gradient(135deg, ${color}20, ${color}10);
            border: 2px solid ${color}60;
            border-radius: 20px;
            padding: 30px;
            margin-bottom: 20px;
            backdrop-filter: blur(15px);
            position: relative;
            overflow: hidden;
            box-shadow: 0 15px 35px ${color}30;
        `;

        // Título holográfico
        const titleElement = document.createElement('h2');
        titleElement.textContent = title;
        titleElement.style.cssText = `
            color: ${color};
            font-size: 1.8rem;
            font-weight: bold;
            margin: 0 0 25px 0;
            text-align: center;
            text-shadow: 0 0 20px ${color};
            letter-spacing: 2px;
        `;

        // Línea decorativa animada
        const decorLine = document.createElement('div');
        decorLine.style.cssText = `
            width: 100%;
            height: 2px;
            background: linear-gradient(90deg, transparent, ${color}, transparent);
            margin-bottom: 20px;
        `;

        panel.appendChild(titleElement);
        panel.appendChild(decorLine);

        // Animación de la línea
        this.animations.push(
            anime({
                targets: decorLine,
                scaleX: [0, 1],
                duration: 1000,
                easing: 'easeOutQuad',
                delay: 300
            })
        );

        return panel;
    }

    createQuantumSlider(label, currentValue, color, onChange) {
        const container = document.createElement('div');
        container.style.cssText = `
            margin-bottom: 25px;
            padding: 20px;
            background: linear-gradient(135deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02));
            border: 1px solid ${color}40;
            border-radius: 15px;
            position: relative;
        `;

        const labelElement = document.createElement('div');
        labelElement.textContent = label;
        labelElement.style.cssText = `
            color: ${color};
            font-weight: bold;
            margin-bottom: 15px;
            font-size: 1.1rem;
            letter-spacing: 1px;
        `;

        const sliderContainer = document.createElement('div');
        sliderContainer.style.cssText = `
            position: relative;
            height: 40px;
            display: flex;
            align-items: center;
        `;

        const track = document.createElement('div');
        track.style.cssText = `
            width: 100%;
            height: 6px;
            background: rgba(255,255,255,0.1);
            border-radius: 3px;
            position: relative;
            overflow: hidden;
        `;

        const fill = document.createElement('div');
        fill.style.cssText = `
            height: 100%;
            background: linear-gradient(90deg, ${color}, ${color}80);
            border-radius: 3px;
            width: ${currentValue * 100}%;
            box-shadow: 0 0 15px ${color}60;
            transition: width 0.3s ease;
        `;

        const thumb = document.createElement('div');
        thumb.style.cssText = `
            position: absolute;
            top: -8px;
            left: ${currentValue * 100}%;
            transform: translateX(-50%);
            width: 22px;
            height: 22px;
            background: radial-gradient(circle, ${color}, ${color}80);
            border: 3px solid white;
            border-radius: 50%;
            cursor: pointer;
            box-shadow: 0 0 20px ${color}80;
            transition: all 0.2s ease;
        `;

        const valueDisplay = document.createElement('div');
        valueDisplay.textContent = Math.round(currentValue * 100) + '%';
        valueDisplay.style.cssText = `
            position: absolute;
            right: 0;
            color: ${color};
            font-weight: bold;
            font-size: 1.1rem;
            min-width: 50px;
            text-align: center;
        `;

        track.appendChild(fill);
        track.appendChild(thumb);
        sliderContainer.appendChild(track);
        sliderContainer.appendChild(valueDisplay);
        container.appendChild(labelElement);
        container.appendChild(sliderContainer);

        // Interactividad del slider
        let isDragging = false;
        const updateSlider = (e) => {
            const rect = track.getBoundingClientRect();
            const percent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
            fill.style.width = percent * 100 + '%';
            thumb.style.left = percent * 100 + '%';
            valueDisplay.textContent = Math.round(percent * 100) + '%';
            onChange(percent);
        };

        thumb.onmousedown = () => isDragging = true;
        document.onmousemove = (e) => isDragging && updateSlider(e);
        document.onmouseup = () => isDragging = false;
        track.onclick = updateSlider;

        return container;
    }

    createQuantumSelector(label, options, currentValue, color, onChange) {
        const container = document.createElement('div');
        container.style.cssText = `
            margin-bottom: 25px;
            padding: 20px;
            background: linear-gradient(135deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02));
            border: 1px solid ${color}40;
            border-radius: 15px;
        `;

        const labelElement = document.createElement('div');
        labelElement.textContent = label;
        labelElement.style.cssText = `
            color: ${color};
            font-weight: bold;
            margin-bottom: 15px;
            font-size: 1.1rem;
            letter-spacing: 1px;
        `;

        const optionsContainer = document.createElement('div');
        optionsContainer.style.cssText = `
            display: flex;
            gap: 10px;
            flex-wrap: wrap;
        `;

        options.forEach(option => {
            const button = document.createElement('button');
            button.textContent = option;
            const isSelected = option === currentValue;
            
            button.style.cssText = `
                padding: 10px 20px;
                background: ${isSelected ? 
                    `linear-gradient(135deg, ${color}, ${color}80)` : 
                    'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))'
                };
                border: 2px solid ${isSelected ? color : 'rgba(255,255,255,0.2)'};
                border-radius: 10px;
                color: white;
                cursor: pointer;
                font-weight: bold;
                transition: all 0.3s ease;
                backdrop-filter: blur(10px);
            `;

            button.onmouseenter = () => {
                if (option !== currentValue) {
                    button.style.borderColor = color;
                    button.style.transform = 'scale(1.05)';
                }
            };

            button.onmouseleave = () => {
                if (option !== currentValue) {
                    button.style.borderColor = 'rgba(255,255,255,0.2)';
                    button.style.transform = 'scale(1)';
                }
            };

            button.onclick = () => {
                onChange(option);
                this.refreshHolographicContent();
            };

            optionsContainer.appendChild(button);
        });

        container.appendChild(labelElement);
        container.appendChild(optionsContainer);
        return container;
    }

    createQuantumToggle(label, currentValue, color, onChange) {
        const container = document.createElement('div');
        container.style.cssText = `
            margin-bottom: 25px;
            padding: 20px;
            background: linear-gradient(135deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02));
            border: 1px solid ${color}40;
            border-radius: 15px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        `;

        const labelElement = document.createElement('div');
        labelElement.textContent = label;
        labelElement.style.cssText = `
            color: ${color};
            font-weight: bold;
            font-size: 1.1rem;
            letter-spacing: 1px;
        `;

        const toggle = document.createElement('div');
        toggle.style.cssText = `
            width: 60px;
            height: 30px;
            background: ${currentValue ? color : 'rgba(255,255,255,0.2)'};
            border-radius: 15px;
            position: relative;
            cursor: pointer;
            transition: all 0.3s ease;
            box-shadow: ${currentValue ? `0 0 20px ${color}60` : 'none'};
        `;

        const toggleThumb = document.createElement('div');
        toggleThumb.style.cssText = `
            width: 26px;
            height: 26px;
            background: white;
            border-radius: 50%;
            position: absolute;
            top: 2px;
            left: ${currentValue ? '32px' : '2px'};
            transition: all 0.3s ease;
            box-shadow: 0 2px 5px rgba(0,0,0,0.3);
        `;

        toggle.appendChild(toggleThumb);
        toggle.onclick = () => {
            const newValue = !currentValue;
            onChange(newValue);
            this.refreshHolographicContent();
        };

        container.appendChild(labelElement);
        container.appendChild(toggle);
        return container;
    }

    createControlBinding(label, key, color) {
        return `
            <div style="
                padding: 15px;
                background: linear-gradient(135deg, ${color}20, ${color}10);
                border: 1px solid ${color}40;
                border-radius: 10px;
                text-align: center;
            ">
                <div style="color: ${color}; font-weight: bold; margin-bottom: 10px; font-size: 0.9rem;">
                    ${label}
                </div>
                <div style="
                    background: ${color};
                    color: white;
                    padding: 8px 16px;
                    border-radius: 5px;
                    font-weight: bold;
                    font-size: 1.2rem;
                    display: inline-block;
                    box-shadow: 0 0 15px ${color}60;
                ">
                    ${key}
                </div>
            </div>
        `;
    }

    createCyberpunkFooter() {
        const footer = document.createElement('div');
        footer.style.cssText = `
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            padding: 20px;
            background: linear-gradient(135deg, rgba(0,0,0,0.8), rgba(26,26,46,0.9));
            backdrop-filter: blur(20px);
            border-top: 2px solid rgba(0,255,255,0.3);
            display: flex;
            justify-content: center;
            gap: 30px;
            z-index: 20;
        `;

        const saveButton = this.createCyberpunkButton('GUARDAR CAMBIOS', '#00ff00', () => {
            this.savePreferences();
        });

        const resetButton = this.createCyberpunkButton('RESTABLECER', '#ff6b6b', () => {
            this.resetToDefaults();
        });

        const backButton = this.createCyberpunkButton('VOLVER', '#ffaa00', () => {
            this.goBack();
        });

        footer.appendChild(saveButton);
        footer.appendChild(resetButton);
        footer.appendChild(backButton);
        return footer;
    }

    createCyberpunkButton(text, color, onClick) {
        const button = document.createElement('button');
        button.textContent = text;
        button.style.cssText = `
            padding: 15px 30px;
            background: linear-gradient(135deg, ${color}40, ${color}20);
            border: 2px solid ${color};
            border-radius: 10px;
            color: white;
            font-weight: bold;
            font-size: 1rem;
            cursor: pointer;
            backdrop-filter: blur(10px);
            transition: all 0.3s ease;
            position: relative;
            overflow: hidden;
            letter-spacing: 1px;
        `;

        button.onmouseenter = () => {
            anime({
                targets: button,
                scale: 1.05,
                boxShadow: `0 0 30px ${color}60`,
                duration: 200,
                easing: 'easeOutQuad'
            });
        };

        button.onmouseleave = () => {
            anime({
                targets: button,
                scale: 1,
                boxShadow: 'none',
                duration: 200,
                easing: 'easeOutQuad'
            });
        };

        button.onclick = onClick;
        return button;
    }

    addFuturisticStyles() {
        const style = document.createElement('style');
        style.id = 'optionsStyles';
        style.textContent = `
            @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&display=swap');
            
            .futuristic-tab .tab-icon {
                font-size: 1.5rem;
                margin-bottom: 5px;
            }
            
            .futuristic-tab .tab-label {
                font-size: 0.9rem;
                letter-spacing: 1px;
            }
            
            .futuristic-tab .tab-glow {
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: radial-gradient(circle, rgba(255,255,255,0.3), transparent);
                opacity: 0;
                border-radius: inherit;
            }
            
            .hex-particle {
                animation: hexFloat 8s infinite ease-in-out alternate;
            }
            
            @keyframes hexFloat {
                0% { transform: translate(0, 0) rotate(0deg); }
                25% { transform: translate(20px, -15px) rotate(90deg); }
                50% { transform: translate(-10px, -30px) rotate(180deg); }
                75% { transform: translate(-25px, -10px) rotate(270deg); }
                100% { transform: translate(0, -20px) rotate(360deg); }
            }
            
            *::-webkit-scrollbar {
                width: 8px;
            }
            
            *::-webkit-scrollbar-track {
                background: rgba(0,0,0,0.3);
            }
            
            *::-webkit-scrollbar-thumb {
                background: linear-gradient(45deg, #00ffff, #0080ff);
                border-radius: 4px;
            }
        `;
        document.head.appendChild(style);
    }

    playEntranceAnimation(container) {
        anime({
            targets: container,
            opacity: [0, 1],
            duration: 800,
            easing: 'easeOutQuad'
        });

        // Animación escalonada de elementos
        const elements = container.querySelectorAll('div');
        anime({
            targets: elements,
            translateY: [50, 0],
            opacity: [0, 1],
            duration: 600,
            delay: anime.stagger(100),
            easing: 'easeOutQuad'
        });
    }

    refreshContent() {
        this.refreshHolographicContent();
    }

    savePreferences() {
        // Aplicar cambios pendientes
        const updatedPreferences = { ...this.preferences };
        
        Object.keys(this.pendingChanges).forEach(category => {
            updatedPreferences[category] = {
                ...updatedPreferences[category],
                ...this.pendingChanges[category]
            };
        });

        UserPreferencesManager.updatePreferences(updatedPreferences);
        this.preferences = updatedPreferences;
        this.pendingChanges = {};

        // Animación de confirmación
        this.showConfirmationMessage('Configuración guardada correctamente', '#00ff00');
    }

    resetToDefaults() {
        this.pendingChanges = {};
        this.preferences = UserPreferencesManager.resetToDefaults();
        this.refreshHolographicContent();
        
        this.showConfirmationMessage('Configuración restablecida a valores predeterminados', '#ffaa00');
    }

    showConfirmationMessage(message, color) {
        const notification = document.createElement('div');
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: linear-gradient(135deg, ${color}40, ${color}20);
            border: 2px solid ${color};
            border-radius: 15px;
            padding: 20px 30px;
            color: white;
            font-weight: bold;
            z-index: 9999;
            backdrop-filter: blur(20px);
            box-shadow: 0 0 30px ${color}60;
        `;

        document.body.appendChild(notification);

        anime({
            targets: notification,
            scale: [0, 1],
            opacity: [0, 1],
            duration: 400,
            easing: 'easeOutBack',
            complete: () => {
                setTimeout(() => {
                    anime({
                        targets: notification,
                        scale: [1, 0],
                        opacity: [1, 0],
                        duration: 300,
                        easing: 'easeInBack',
                        complete: () => notification.remove()
                    });
                }, 2000);
            }
        });
    }

    goBack() {
        this.cleanup();
        if (this.onBack) {
            this.onBack();
        }
    }

    cleanup() {
        const gameCanvas = document.getElementById('gameCanvas');
        if (gameCanvas) {
            gameCanvas.style.display = 'block';
        }

        this.animations.forEach(anim => {
            if (anim && anim.pause) anim.pause();
        });

        this.particleAnimations.forEach(anim => {
            if (anim && anim.pause) anim.pause();
        });

        const styles = document.getElementById('optionsStyles');
        if (styles) {
            styles.remove();
        }

        const container = document.getElementById('optionsContainer');
        if (container) {
            container.remove();
        }
    }
}
