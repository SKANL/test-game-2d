/**
 * OptionsScene - Pantalla de configuración épica con efectos de anime.js
 * Implementación EXACTA basada en ejemplos funcionales
 * RESPONSIVE: Adaptado para todos los dispositivos con ResponsiveUtils
 */
import UserPreferencesManager from '../../application/UserPreferencesManager.js';
import ResponsiveUtils from '../../infrastructure/ResponsiveUtils.js';

export default class OptionsScene {
    constructor(onBack) {
        this.onBack = onBack;
        this.currentTab = 'video';
        this.preferences = null;
        this.pendingChanges = {};
        this.container = null;
        this.particleCanvas = null;
        this.animationId = null;
        this.saveTimeout = null;
    }

    async init() {
        // Inicializar ResponsiveUtils
        ResponsiveUtils.init();
        
        this.preferences = UserPreferencesManager.getPreferences();
    }

    render() {
        if (!this.preferences) {
            this.init();
        }

        const gameCanvas = document.getElementById('gameCanvas');
        if (gameCanvas) {
            gameCanvas.style.display = 'none';
        }

        // Crear el contenedor principal - RESPONSIVO
        this.container = document.createElement('div');
        this.container.id = 'options-scene-container';
        this.container.className = 'responsive-options-container';
        
        // Aplicar estilos responsivos usando ResponsiveUtils
        const deviceType = ResponsiveUtils.getDeviceType();
        const responsiveStyles = ResponsiveUtils.getResponsiveContainerStyles(deviceType);
        
        this.container.style.cssText = `
            position: relative;
            width: 100%;
            height: 100%;
            min-height: 100vh;
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
            padding: clamp(1rem, 4vw, 2rem);
            ${responsiveStyles}
        `;

        // Canvas para partículas de fondo RESPONSIVO
        this.particleCanvas = document.createElement('canvas');
        this.particleCanvas.id = 'options-particles-canvas';
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

        // Título RESPONSIVO
        const title = document.createElement('h1');
        title.textContent = deviceType === 'mobile' ? 'OPCIONES' : 'CONFIGURACIÓN';
        title.className = 'responsive-options-title';
        title.style.cssText = `
            font-family: 'Orbitron', monospace;
            font-size: clamp(1.5rem, 6vw, 3rem);
            font-weight: 900;
            color: #fff;
            margin-bottom: clamp(1rem, 3vw, 2rem);
            text-shadow: 0 0 10px var(--primary-glow), 0 0 20px var(--primary-glow);
            opacity: 0;
            transform: translateY(-30px);
            z-index: 3;
            text-align: center;
            word-break: break-word;
        `;

        // Contenedor de opciones - RESPONSIVO
        const optionsContainer = document.createElement('div');
        optionsContainer.className = 'options-container responsive-options-content';
        optionsContainer.style.cssText = `
            width: 100%;
            max-width: ${deviceType === 'mobile' ? '95vw' : 'min(90vw, 800px)'};
            min-height: ${deviceType === 'mobile' ? '60vh' : '50vh'};
            background: rgba(0, 0, 0, 0.3);
            border: 1px solid var(--primary-glow);
            border-radius: clamp(10px, 2vw, 15px);
            padding: clamp(1rem, 3vw, 2rem);
            box-shadow: 
                0 0 30px rgba(0, 242, 255, 0.3),
                inset 0 0 30px rgba(0, 242, 255, 0.1);
            backdrop-filter: blur(10px);
            z-index: 3;
            position: relative;
            opacity: 0;
            transform: scale(0.9) translateY(20px);
            overflow: hidden;
        `;

        // Tabs
        const tabs = this.createTabs();
        const tabContent = this.createTabContent();

        // Botón de volver RESPONSIVO
        const backButton = document.createElement('button');
        backButton.textContent = deviceType === 'mobile' ? '← VOLVER' : '← VOLVER';
        backButton.className = 'responsive-back-btn';
        backButton.style.cssText = `
            position: absolute;
            top: clamp(1rem, 3vw, 2rem);
            left: clamp(1rem, 3vw, 2rem);
            background: transparent;
            border: 2px solid var(--secondary-glow);
            color: var(--secondary-glow);
            padding: clamp(8px, 2vw, 12px) clamp(12px, 3vw, 20px);
            border-radius: clamp(6px, 1vw, 8px);
            font-family: 'Orbitron', monospace;
            font-size: clamp(0.8rem, 2vw, 1rem);
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            text-transform: uppercase;
            letter-spacing: clamp(0.5px, 0.2vw, 1px);
            z-index: 4;
            opacity: 0;
            transform: translateX(-20px);
            min-height: 44px; /* Touch-friendly */
            white-space: nowrap;
        `;

        this.setupBackButton(backButton);

        optionsContainer.appendChild(tabs);
        optionsContainer.appendChild(tabContent);

        this.container.appendChild(this.particleCanvas);
        this.container.appendChild(backButton);
        this.container.appendChild(title);
        this.container.appendChild(optionsContainer);
        
        // Agregar la escena al contenedor de escenas manejado por SceneManager
        const sceneContainer = document.getElementById('scene-container');
        if (sceneContainer) {
            sceneContainer.appendChild(this.container);
        } else {
            document.body.appendChild(this.container);
        }

        this.startOptionsAnimation();
        this.startParticleBackground();

        return this.container;
    }

    createTabs() {
        const deviceType = ResponsiveUtils.getDeviceType();
        const isMobile = deviceType === 'mobile';
        
        const tabs = document.createElement('div');
        tabs.className = 'tabs responsive-options-tabs';
        tabs.style.cssText = `
            display: flex;
            border-bottom: 1px solid var(--border-color);
            position: relative;
            margin-bottom: clamp(1rem, 3vw, 2rem);
            overflow-x: auto;
            scroll-behavior: smooth;
            ${isMobile ? 'justify-content: center;' : ''}
        `;

        const tabUnderline = document.createElement('div');
        tabUnderline.className = 'tab-underline';
        tabUnderline.style.cssText = `
            position: absolute;
            bottom: 0;
            height: 2px;
            background-color: var(--primary-glow);
            transition: all 0.3s ease;
            width: 0;
            left: 0;
        `;

        const tabData = [
            { id: 'video', text: isMobile ? 'Video' : 'Video' },
            { id: 'audio', text: isMobile ? 'Audio' : 'Audio' },
            { id: 'game', text: isMobile ? 'Juego' : 'Juego' }
        ];

        tabData.forEach((tabInfo, index) => {
            const tab = document.createElement('div');
            tab.className = `tab responsive-tab ${tabInfo.id === this.currentTab ? 'active' : ''}`;
            tab.dataset.tab = tabInfo.id;
            tab.textContent = tabInfo.text;
            tab.style.cssText = `
                padding: clamp(10px, 2vw, 15px) clamp(15px, 3vw, 20px);
                cursor: pointer;
                color: ${tabInfo.id === this.currentTab ? 'var(--primary-glow)' : 'var(--text-color)'};
                transition: all 0.3s ease;
                z-index: 1;
                position: relative;
                font-family: 'Orbitron', monospace;
                font-weight: 600;
                text-transform: uppercase;
                letter-spacing: clamp(0.5px, 0.2vw, 1px);
                font-size: clamp(0.8rem, 2vw, 1rem);
                white-space: nowrap;
                flex-shrink: 0;
                ${isMobile ? 'flex: 1; text-align: center; min-width: fit-content;' : ''}
            `;

            tab.addEventListener('click', () => {
                this.switchTab(tabInfo.id, tabs, tabUnderline);
            });

            tabs.appendChild(tab);
        });

        tabs.appendChild(tabUnderline);
        this.moveUnderline(tabs.querySelector('.tab.active'), tabUnderline);

        return tabs;
    }

    createTabContent() {
        const tabContentContainer = document.createElement('div');
        tabContentContainer.className = 'tab-content-container';
        tabContentContainer.style.cssText = `
            min-height: clamp(250px, 40vh, 300px);
            position: relative;
            width: 100%;
            overflow-y: auto;
            max-height: 60vh;
        `;

        // Contenido para pestaña de Video
        const videoContent = this.createVideoTabContent();
        videoContent.id = 'video-content';
        videoContent.className = 'tab-content active';
        videoContent.style.display = this.currentTab === 'video' ? 'block' : 'none';

        // Contenido para pestaña de Audio
        const audioContent = this.createAudioTabContent();
        audioContent.id = 'audio-content';
        audioContent.className = 'tab-content';
        audioContent.style.display = this.currentTab === 'audio' ? 'block' : 'none';

        // Contenido para pestaña de Juego
        const gameContent = this.createGameTabContent();
        gameContent.id = 'game-content';
        gameContent.className = 'tab-content';
        gameContent.style.display = this.currentTab === 'game' ? 'block' : 'none';

        tabContentContainer.appendChild(videoContent);
        tabContentContainer.appendChild(audioContent);
        tabContentContainer.appendChild(gameContent);

        return tabContentContainer;
    }

    createVideoTabContent() {
        const content = document.createElement('div');
        content.style.cssText = `
            padding: clamp(0.5rem, 2vw, 1rem);
        `;

        // Debug Mode Toggle
        const debugGroup = this.createControlGroup('Modo Debug', 'checkbox');
        const debugCheckbox = debugGroup.querySelector('input');
        debugCheckbox.checked = this.preferences?.graphics?.debugMode || false;
        debugCheckbox.addEventListener('change', (e) => {
            this.updatePreference('graphics.debugMode', e.target.checked);
        });

        // Show Hitboxes Toggle
        const hitboxGroup = this.createControlGroup('Mostrar Hitboxes', 'checkbox');
        const hitboxCheckbox = hitboxGroup.querySelector('input');
        hitboxCheckbox.checked = this.preferences?.graphics?.showHitboxes || false;
        hitboxCheckbox.addEventListener('change', (e) => {
            this.updatePreference('graphics.showHitboxes', e.target.checked);
        });

        // Show Frame Data Toggle
        const frameDataGroup = this.createControlGroup('Mostrar Frame Data', 'checkbox');
        const frameDataCheckbox = frameDataGroup.querySelector('input');
        frameDataCheckbox.checked = this.preferences?.graphics?.showFrameData || false;
        frameDataCheckbox.addEventListener('change', (e) => {
            this.updatePreference('graphics.showFrameData', e.target.checked);
        });

        content.appendChild(debugGroup);
        content.appendChild(hitboxGroup);
        content.appendChild(frameDataGroup);

        return content;
    }

    createAudioTabContent() {
        const content = document.createElement('div');
        content.style.cssText = `
            padding: clamp(0.5rem, 2vw, 1rem);
        `;

        // Master Volume
        const masterVolumeGroup = this.createControlGroup('Volumen General', 'slider');
        const masterSlider = masterVolumeGroup.querySelector('input');
        masterSlider.min = '0';
        masterSlider.max = '100';
        masterSlider.value = Math.round((this.preferences?.audio?.masterVolume || 0.7) * 100);
        masterSlider.addEventListener('input', (e) => {
            this.updatePreference('audio.masterVolume', e.target.value / 100);
        });

        // Music Volume
        const musicVolumeGroup = this.createControlGroup('Volumen Música', 'slider');
        const musicSlider = musicVolumeGroup.querySelector('input');
        musicSlider.min = '0';
        musicSlider.max = '100';
        musicSlider.value = Math.round((this.preferences?.audio?.musicVolume || 0.6) * 100);
        musicSlider.addEventListener('input', (e) => {
            this.updatePreference('audio.musicVolume', e.target.value / 100);
        });

        // SFX Volume
        const sfxVolumeGroup = this.createControlGroup('Volumen Efectos', 'slider');
        const sfxSlider = sfxVolumeGroup.querySelector('input');
        sfxSlider.min = '0';
        sfxSlider.max = '100';
        sfxSlider.value = Math.round((this.preferences?.audio?.sfxVolume || 0.8) * 100);
        sfxSlider.addEventListener('input', (e) => {
            this.updatePreference('audio.sfxVolume', e.target.value / 100);
        });

        content.appendChild(masterVolumeGroup);
        content.appendChild(musicVolumeGroup);
        content.appendChild(sfxVolumeGroup);

        return content;
    }

    createGameTabContent() {
        const content = document.createElement('div');
        content.style.cssText = `
            padding: clamp(0.5rem, 2vw, 1rem);
        `;

        // Difficulty Selection
        const difficultyGroup = this.createControlGroup('Dificultad IA', 'select');
        const difficultySelect = difficultyGroup.querySelector('select');
        const difficulties = ['easy', 'normal', 'hard'];
        difficulties.forEach(diff => {
            const option = document.createElement('option');
            option.value = diff;
            option.textContent = diff.charAt(0).toUpperCase() + diff.slice(1);
            if (diff === (this.preferences?.gameplay?.difficulty || 'normal')) {
                option.selected = true;
            }
            difficultySelect.appendChild(option);
        });
        difficultySelect.addEventListener('change', (e) => {
            this.updatePreference('gameplay.difficulty', e.target.value);
        });

        // Input Buffer Time
        const bufferGroup = this.createControlGroup('Tiempo Buffer Input (ms)', 'slider');
        const bufferSlider = bufferGroup.querySelector('input');
        bufferSlider.min = '50';
        bufferSlider.max = '300';
        bufferSlider.value = this.preferences?.gameplay?.inputBufferTime || 150;
        bufferSlider.addEventListener('input', (e) => {
            this.updatePreference('gameplay.inputBufferTime', parseInt(e.target.value));
        });

        // Controls Section RESPONSIVO
        const controlsTitle = document.createElement('h3');
        controlsTitle.textContent = 'Controles Jugador 1';
        controlsTitle.style.cssText = `
            color: var(--primary-glow);
            font-family: 'Orbitron', monospace;
            margin: clamp(1rem, 3vw, 2rem) 0 clamp(0.5rem, 2vw, 1rem) 0;
            text-shadow: 0 0 5px var(--primary-glow);
            font-size: clamp(1rem, 3vw, 1.2rem);
        `;

        content.appendChild(difficultyGroup);
        content.appendChild(bufferGroup);
        content.appendChild(controlsTitle);

        // Player 1 Controls
        const p1Controls = this.preferences?.controls?.p1 || {};
        const controlLabels = {
            up: 'Arriba',
            down: 'Abajo', 
            left: 'Izquierda',
            right: 'Derecha',
            punch: 'Puño',
            kick: 'Patada',
            special: 'Especial',
            super: 'Súper'
        };

        Object.entries(controlLabels).forEach(([action, label]) => {
            const controlGroup = this.createControlGroup(label, 'key');
            const keyInput = controlGroup.querySelector('input');
            keyInput.value = p1Controls[action] || '';
            keyInput.addEventListener('keydown', (e) => {
                e.preventDefault();
                keyInput.value = e.key;
                this.updatePreference(`controls.p1.${action}`, e.key);
            });
            content.appendChild(controlGroup);
        });

        return content;
    }

    createControlGroup(labelText, type) {
        const controlGroup = document.createElement('div');
        controlGroup.className = 'control-group';
        controlGroup.style.cssText = `
            margin-bottom: clamp(1rem, 3vw, 1.5rem);
            opacity: 0;
            transform: translateY(10px);
            display: flex;
            flex-direction: column;
            gap: clamp(0.3rem, 1vw, 0.5rem);
        `;

        const label = document.createElement('label');
        label.textContent = labelText;
        label.style.cssText = `
            color: var(--text-color);
            font-family: 'Orbitron', monospace;
            font-weight: 600;
            font-size: clamp(0.8rem, 2vw, 0.9rem);
        `;

        let control;
        
        switch (type) {
            case 'checkbox':
                control = this.createHolographicCheckbox();
                break;
            case 'slider':
                control = this.createHolographicSlider();
                break;
            case 'select':
                control = this.createHolographicSelect();
                break;
            case 'key':
                control = this.createKeyInput();
                break;
            default:
                control = document.createElement('input');
        }

        controlGroup.appendChild(label);
        controlGroup.appendChild(control);

        return controlGroup;
    }

    createHolographicCheckbox() {
        const container = document.createElement('div');
        container.className = 'checkbox-container';
        container.style.cssText = `
            display: flex;
            align-items: center;
            cursor: pointer;
        `;

        const input = document.createElement('input');
        input.type = 'checkbox';
        input.style.display = 'none';

        const customCheckbox = document.createElement('div');
        customCheckbox.className = 'checkbox-custom';
        customCheckbox.style.cssText = `
            width: clamp(16px, 3vw, 20px);
            height: clamp(16px, 3vw, 20px);
            border: 2px solid var(--primary-glow);
            border-radius: 4px;
            position: relative;
            margin-right: clamp(6px, 2vw, 10px);
            background: rgba(0, 242, 255, 0.1);
            transition: all 0.3s ease;
            flex-shrink: 0;
        `;

        const checkmark = document.createElement('div');
        checkmark.innerHTML = '✓';
        checkmark.style.cssText = `
            color: var(--primary-glow);
            font-size: clamp(12px, 2.5vw, 14px);
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) scale(0);
            transition: transform 0.3s ease;
        `;

        const labelText = document.createElement('span');
        labelText.textContent = 'Activado';
        labelText.style.cssText = `
            color: var(--text-color);
            font-family: 'Inter', sans-serif;
            font-size: clamp(0.8rem, 2vw, 1rem);
        `;

        input.addEventListener('change', () => {
            if (input.checked) {
                checkmark.style.transform = 'translate(-50%, -50%) scale(1)';
                customCheckbox.style.boxShadow = '0 0 10px var(--primary-glow)';
            } else {
                checkmark.style.transform = 'translate(-50%, -50%) scale(0)';
                customCheckbox.style.boxShadow = 'none';
            }
        });

        customCheckbox.appendChild(checkmark);
        container.appendChild(input);
        container.appendChild(customCheckbox);
        container.appendChild(labelText);

        container.addEventListener('click', () => {
            input.checked = !input.checked;
            input.dispatchEvent(new Event('change'));
        });

        return container;
    }

    createHolographicSlider() {
        const slider = document.createElement('input');
        slider.type = 'range';
        slider.style.cssText = `
            width: 100%;
            -webkit-appearance: none;
            appearance: none;
            background: transparent;
            cursor: pointer;
        `;

        // Estilos para el track
        const style = document.createElement('style');
        style.textContent = `
            input[type="range"]::-webkit-slider-runnable-track {
                height: 4px;
                background: linear-gradient(90deg, rgba(0, 242, 255, 0.3), rgba(0, 242, 255, 0.8));
                border-radius: 2px;
                border: 1px solid var(--primary-glow);
            }
            input[type="range"]::-webkit-slider-thumb {
                -webkit-appearance: none;
                appearance: none;
                margin-top: -8px;
                height: 20px;
                width: 20px;
                border-radius: 50%;
                background: var(--primary-glow);
                box-shadow: 0 0 10px var(--primary-glow);
                cursor: pointer;
                transition: box-shadow 0.2s ease;
            }
            input[type="range"]:active::-webkit-slider-thumb {
                box-shadow: 0 0 20px 5px var(--primary-glow);
            }
        `;
        document.head.appendChild(style);

        return slider;
    }

    createHolographicSelect() {
        const select = document.createElement('select');
        select.style.cssText = `
            width: 100%;
            padding: clamp(8px, 2vw, 10px);
            background: rgba(0, 242, 255, 0.1);
            border: 1px solid var(--primary-glow);
            border-radius: 5px;
            color: var(--text-color);
            font-family: 'Inter', sans-serif;
            font-size: clamp(0.8rem, 2vw, 1rem);
            box-shadow: 0 0 10px rgba(0, 242, 255, 0.3) inset;
            transition: all 0.3s ease;
        `;

        select.addEventListener('focus', () => {
            select.style.boxShadow = '0 0 15px rgba(0, 242, 255, 0.6) inset, 0 0 5px var(--primary-glow)';
        });

        select.addEventListener('blur', () => {
            select.style.boxShadow = '0 0 10px rgba(0, 242, 255, 0.3) inset';
        });

        return select;
    }

    createKeyInput() {
        const input = document.createElement('input');
        input.type = 'text';
        input.readOnly = true;
        input.placeholder = 'Presiona una tecla...';
        input.style.cssText = `
            width: 100%;
            padding: clamp(8px, 2vw, 10px);
            background: rgba(255, 0, 193, 0.1);
            border: 1px solid var(--secondary-glow);
            border-radius: 5px;
            color: var(--text-color);
            font-family: 'Orbitron', monospace;
            text-align: center;
            font-weight: 600;
            font-size: clamp(0.8rem, 2vw, 1rem);
            box-shadow: 0 0 10px rgba(255, 0, 193, 0.3) inset;
            transition: all 0.3s ease;
            cursor: pointer;
        `;

        input.addEventListener('focus', () => {
            input.style.boxShadow = '0 0 15px rgba(255, 0, 193, 0.6) inset, 0 0 5px var(--secondary-glow)';
            input.placeholder = 'Presionando...';
        });

        input.addEventListener('blur', () => {
            input.style.boxShadow = '0 0 10px rgba(255, 0, 193, 0.3) inset';
            input.placeholder = 'Presiona una tecla...';
        });

        return input;
    }

    updatePreference(path, value) {
        const keys = path.split('.');
        const newPrefs = {};
        let current = newPrefs;
        
        for (let i = 0; i < keys.length - 1; i++) {
            current[keys[i]] = {};
            current = current[keys[i]];
        }
        current[keys[keys.length - 1]] = value;

        this.pendingChanges = this.deepMerge(this.pendingChanges, newPrefs);
        
        // Actualizar inmediatamente en memoria
        this.preferences = this.deepMerge(this.preferences, newPrefs);
        
        // Debounce para evitar demasiadas llamadas a la API
        clearTimeout(this.saveTimeout);
        this.saveTimeout = setTimeout(() => {
            this.savePreferences();
        }, 500);
    }

    async savePreferences() {
        try {
            await UserPreferencesManager.updatePreferences(this.pendingChanges);
            this.pendingChanges = {};
            console.log('✅ Preferencias guardadas');
        } catch (error) {
            console.error('❌ Error guardando preferencias:', error);
        }
    }

    deepMerge(target, source) {
        const result = { ...target };
        
        for (const key in source) {
            if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
                result[key] = this.deepMerge(target[key] || {}, source[key]);
            } else {
                result[key] = source[key];
            }
        }
        
        return result;
    }

    setupBackButton(backButton) {
        backButton.addEventListener('mouseenter', () => {
            if (typeof anime !== 'undefined') {
                anime({
                    targets: backButton,
                    scale: 1.05,
                    boxShadow: '0 0 20px rgba(255, 0, 193, 0.6)',
                    duration: 200,
                    easing: 'easeOutQuad'
                });
            }
        });

        backButton.addEventListener('mouseleave', () => {
            if (typeof anime !== 'undefined') {
                anime({
                    targets: backButton,
                    scale: 1,
                    boxShadow: '0 0 0px rgba(255, 0, 193, 0)',
                    duration: 200,
                    easing: 'easeOutQuad'
                });
            }
        });

        backButton.addEventListener('click', () => {
            this.handleBack();
        });
    }

    switchTab(targetTab, tabs, tabUnderline) {
        if (targetTab === this.currentTab) return;

        const currentContent = this.container.querySelector(`#${this.currentTab}-content`);
        const targetContent = this.container.querySelector(`#${targetTab}-content`);

        if (!targetContent) {
            console.warn(`No se encontró contenido para la pestaña: ${targetTab}`);
            return;
        }

        // Crear efectos de partículas en el click de la pestaña
        const activeTab = tabs.querySelector(`[data-tab="${targetTab}"]`);
        const rect = activeTab.getBoundingClientRect();
        const parentRect = this.particleCanvas.getBoundingClientRect();
        this.createTabParticles(rect.left - parentRect.left + rect.width / 2, rect.top - parentRect.top + rect.height / 2);

        // Actualizar clases de pestañas
        const tabElements = tabs.querySelectorAll('.tab');
        tabElements.forEach(t => {
            t.classList.remove('active');
            t.style.color = 'var(--text-color)';
        });

        activeTab.classList.add('active');
        activeTab.style.color = 'var(--primary-glow)';

        this.moveUnderline(activeTab, tabUnderline);

        // Animar transición de contenido
        if (typeof anime !== 'undefined') {
            anime.timeline()
                .add({
                    targets: currentContent ? currentContent.querySelectorAll('.control-group') : [],
                    translateY: [0, -10],
                    opacity: [1, 0],
                    delay: anime.stagger(50),
                    easing: 'easeInExpo',
                    duration: 300,
                    complete: () => {
                        if (currentContent) {
                            currentContent.style.display = 'none';
                        }
                        targetContent.style.display = 'block';
                        
                        // Resetear y animar el nuevo contenido
                        targetContent.querySelectorAll('.control-group').forEach(el => {
                            el.style.opacity = '0';
                            el.style.transform = 'translateY(10px)';
                        });
                    }
                })
                .add({
                    targets: targetContent.querySelectorAll('.control-group'),
                    translateY: [10, 0],
                    opacity: [0, 1],
                    delay: anime.stagger(100),
                    easing: 'easeOutExpo',
                    duration: 500
                }, '+=50');
        } else {
            if (currentContent) {
                currentContent.style.display = 'none';
            }
            targetContent.style.display = 'block';
            targetContent.querySelectorAll('.control-group').forEach(el => {
                el.style.opacity = '1';
                el.style.transform = 'translateY(0)';
            });
        }

        this.currentTab = targetTab;
    }

    createTabParticles(x, y) {
        if (!this.particleCanvas) return;
        
        const ctx = this.particleCanvas.getContext('2d');
        for (let i = 0; i < 20; i++) {
            const particle = {
                x: x,
                y: y,
                radius: Math.random() * 3 + 1,
                color: 'rgba(0, 242, 255, 1)',
                alpha: 1,
                vx: (Math.random() - 0.5) * 8,
                vy: (Math.random() - 0.5) * 8
            };

            if (typeof anime !== 'undefined') {
                anime({
                    targets: particle,
                    x: particle.x + particle.vx * 20,
                    y: particle.y + particle.vy * 20,
                    alpha: 0,
                    duration: Math.random() * 500 + 500,
                    easing: 'easeOutExpo',
                    update: () => {
                        ctx.fillStyle = particle.color.replace('1)', particle.alpha + ')');
                        ctx.beginPath();
                        ctx.arc(particle.x, particle.y, particle.radius, 0, 2 * Math.PI);
                        ctx.fill();
                    }
                });
            }
        }

        // Limpiar canvas después de las animaciones
        setTimeout(() => {
            if (this.particleCanvas) {
                ctx.clearRect(0, 0, this.particleCanvas.width, this.particleCanvas.height);
            }
        }, 1000);
    }

    moveUnderline(targetTab, tabUnderline) {
        if (typeof anime !== 'undefined') {
            anime({
                targets: tabUnderline,
                left: targetTab.offsetLeft,
                width: targetTab.offsetWidth,
                easing: 'spring(1, 80, 10, 0)',
                duration: 600
            });
        } else {
            tabUnderline.style.left = targetTab.offsetLeft + 'px';
            tabUnderline.style.width = targetTab.offsetWidth + 'px';
        }
    }

    startOptionsAnimation() {
        if (typeof anime === 'undefined') {
            console.warn('⚠️ anime.js no disponible en OptionsScene');
            return;
        }

        const title = this.container.querySelector('h1');
        const optionsContainer = this.container.querySelector('.options-container');
        const backButton = this.container.querySelector('button');
        const controlGroups = this.container.querySelectorAll('.control-group');

        anime.timeline({ easing: 'easeOutExpo' })
            .add({
                targets: backButton,
                opacity: [0, 1],
                translateX: [-20, 0],
                duration: 600
            })
            .add({
                targets: title,
                opacity: [0, 1],
                translateY: [-30, 0],
                duration: 800
            }, '-=400')
            .add({
                targets: optionsContainer,
                opacity: [0, 1],
                scale: [0.9, 1],
                translateY: [20, 0],
                duration: 600
            }, '-=400')
            .add({
                targets: controlGroups,
                opacity: [0, 1],
                translateY: [10, 0],
                delay: anime.stagger(100),
                duration: 500
            }, '-=200');
    }

    startParticleBackground() {
        if (!this.particleCanvas) return;
        
        const ctx = this.particleCanvas.getContext('2d');
        const particles = [];
        
        for (let i = 0; i < 30; i++) {
            particles.push({
                x: Math.random() * this.particleCanvas.width,
                y: Math.random() * this.particleCanvas.height,
                size: Math.random() * 2 + 1,
                speedX: (Math.random() - 0.5) * 0.5,
                speedY: (Math.random() - 0.5) * 0.5,
                opacity: Math.random() * 0.3 + 0.1,
                color: Math.random() > 0.5 ? 'rgba(0, 242, 255, ' : 'rgba(255, 0, 193, '
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
            
            if (document.getElementById('options-scene-container')) {
                this.animationId = requestAnimationFrame(animateParticles);
            }
        };
        
        animateParticles();
    }

    handleBack() {
        console.log('🔙 Volviendo...');
        
        if (typeof anime !== 'undefined') {
            anime({
                targets: this.container,
                opacity: [1, 0],
                scale: [1, 0.9],
                duration: 500,
                easing: 'easeInExpo',
                complete: () => {
                    if (this.onBack) {
                        this.onBack();
                    }
                }
            });
        } else {
            if (this.onBack) {
                this.onBack();
            }
        }
    }

    cleanup() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }

        if (this.saveTimeout) {
            clearTimeout(this.saveTimeout);
            this.saveTimeout = null;
        }

        // Cleanup ResponsiveUtils canvas handlers
        if (this.particleCanvas) {
            ResponsiveUtils.cleanup(this.particleCanvas);
        }

        // Remover event listener de resize (obsoleto, manejado por ResponsiveUtils)
        if (this.resizeHandler) {
            window.removeEventListener('resize', this.resizeHandler);
            this.resizeHandler = null;
        }

        // Guardar cambios pendientes antes de limpiar
        if (Object.keys(this.pendingChanges).length > 0) {
            this.savePreferences();
        }

        if (this.container) {
            this.container.remove();
        }

        // Restaurar canvas del juego
        const gameCanvas = document.getElementById('gameCanvas');
        if (gameCanvas) {
            gameCanvas.style.display = 'block';
        }

        this.container = null;
        this.particleCanvas = null;
        this.preferences = null;
        this.pendingChanges = {};
    }
}