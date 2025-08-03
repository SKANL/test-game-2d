import UserPreferencesManager from '../../application/UserPreferencesManager.js';

/**
 * OptionsScene - Pantalla de configuración y opciones
 * Sección 9 del Documento Maestro
 */
export default class OptionsScene {
    constructor(onBack) {
        this.onBack = onBack;
        this.currentTab = 'audio';
        this.preferences = null;
        this.pendingChanges = {};
    }

    async init() {
        // Cargar preferencias actuales
        this.preferences = UserPreferencesManager.getPreferences();
    }

    render() {
        const container = document.createElement('div');
        container.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
            color: white;
            font-family: Arial, sans-serif;
            overflow-y: auto;
        `;

        // Header
        const header = this.createHeader();
        container.appendChild(header);

        // Navigation
        const nav = this.createNavigation();
        container.appendChild(nav);

        // Content
        const content = this.createContent();
        container.appendChild(content);

        // Footer con botones
        const footer = this.createFooter();
        container.appendChild(footer);

        document.body.appendChild(container);
    }

    createHeader() {
        const header = document.createElement('div');
        header.style.cssText = `
            background: rgba(0,0,0,0.3);
            padding: 20px;
            text-align: center;
            border-bottom: 2px solid #34495e;
        `;

        const title = document.createElement('h1');
        title.textContent = 'OPCIONES';
        title.style.cssText = `
            margin: 0;
            color: #3498db;
            font-size: 2.5rem;
            text-shadow: 0 2px 4px rgba(0,0,0,0.3);
        `;

        header.appendChild(title);
        return header;
    }

    createNavigation() {
        const nav = document.createElement('div');
        nav.style.cssText = `
            display: flex;
            justify-content: center;
            background: rgba(0,0,0,0.2);
            padding: 0;
        `;

        const tabs = [
            { id: 'audio', label: 'Audio', icon: '🔊' },
            { id: 'controls', label: 'Controles', icon: '🎮' },
            { id: 'graphics', label: 'Gráficos', icon: '🎨' },
            { id: 'gameplay', label: 'Jugabilidad', icon: '⚡' }
        ];

        tabs.forEach(tab => {
            const button = document.createElement('button');
            button.innerHTML = `${tab.icon} ${tab.label}`;
            button.style.cssText = `
                padding: 15px 25px;
                background: ${this.currentTab === tab.id ? '#3498db' : 'transparent'};
                color: white;
                border: none;
                cursor: pointer;
                font-size: 16px;
                transition: background 0.3s ease;
                flex: 1;
                max-width: 200px;
            `;

            button.onmouseenter = () => {
                if (this.currentTab !== tab.id) {
                    button.style.background = 'rgba(52, 152, 219, 0.3)';
                }
            };

            button.onmouseleave = () => {
                if (this.currentTab !== tab.id) {
                    button.style.background = 'transparent';
                }
            };

            button.onclick = () => {
                this.currentTab = tab.id;
                this.refreshContent();
            };

            nav.appendChild(button);
        });

        return nav;
    }

    createContent() {
        const content = document.createElement('div');
        content.id = 'optionsContent';
        content.style.cssText = `
            padding: 40px;
            min-height: 400px;
            max-width: 800px;
            margin: 0 auto;
        `;

        this.renderCurrentTab(content);
        return content;
    }

    renderCurrentTab(container) {
        container.innerHTML = '';

        switch (this.currentTab) {
            case 'audio':
                this.renderAudioTab(container);
                break;
            case 'controls':
                this.renderControlsTab(container);
                break;
            case 'graphics':
                this.renderGraphicsTab(container);
                break;
            case 'gameplay':
                this.renderGameplayTab(container);
                break;
        }
    }

    renderAudioTab(container) {
        const title = document.createElement('h2');
        title.textContent = 'Configuración de Audio';
        title.style.color = '#3498db';
        container.appendChild(title);

        // Volumen Master
        const masterSection = this.createSliderSection(
            'Volumen Master',
            this.preferences.audio?.masterVolume || 0.7,
            (value) => {
                this.pendingChanges.audio = this.pendingChanges.audio || {};
                this.pendingChanges.audio.masterVolume = value;
            }
        );
        container.appendChild(masterSection);

        // Volumen Música
        const musicSection = this.createSliderSection(
            'Volumen Música',
            this.preferences.audio?.musicVolume || 0.6,
            (value) => {
                this.pendingChanges.audio = this.pendingChanges.audio || {};
                this.pendingChanges.audio.musicVolume = value;
            }
        );
        container.appendChild(musicSection);

        // Volumen Efectos
        const sfxSection = this.createSliderSection(
            'Volumen Efectos',
            this.preferences.audio?.sfxVolume || 0.8,
            (value) => {
                this.pendingChanges.audio = this.pendingChanges.audio || {};
                this.pendingChanges.audio.sfxVolume = value;
            }
        );
        container.appendChild(sfxSection);
    }

    renderControlsTab(container) {
        const title = document.createElement('h2');
        title.textContent = 'Configuración de Controles';
        title.style.color = '#3498db';
        container.appendChild(title);

        // Controles Jugador 1
        const p1Section = this.createControlsSection('Jugador 1', 'p1');
        container.appendChild(p1Section);

        // Controles Jugador 2
        const p2Section = this.createControlsSection('Jugador 2', 'p2');
        container.appendChild(p2Section);
    }

    renderGraphicsTab(container) {
        const title = document.createElement('h2');
        title.textContent = 'Configuración Gráfica';
        title.style.color = '#3498db';
        container.appendChild(title);

        // Modo Debug
        const debugSection = this.createCheckboxSection(
            'Modo Debug',
            this.preferences.graphics?.debugMode || false,
            (value) => {
                this.pendingChanges.graphics = this.pendingChanges.graphics || {};
                this.pendingChanges.graphics.debugMode = value;
            }
        );
        container.appendChild(debugSection);

        // Mostrar Hitboxes
        const hitboxSection = this.createCheckboxSection(
            'Mostrar Hitboxes',
            this.preferences.graphics?.showHitboxes || false,
            (value) => {
                this.pendingChanges.graphics = this.pendingChanges.graphics || {};
                this.pendingChanges.graphics.showHitboxes = value;
            }
        );
        container.appendChild(hitboxSection);

        // Mostrar Frame Data
        const frameDataSection = this.createCheckboxSection(
            'Mostrar Frame Data',
            this.preferences.graphics?.showFrameData || false,
            (value) => {
                this.pendingChanges.graphics = this.pendingChanges.graphics || {};
                this.pendingChanges.graphics.showFrameData = value;
            }
        );
        container.appendChild(frameDataSection);
    }

    renderGameplayTab(container) {
        const title = document.createElement('h2');
        title.textContent = 'Configuración de Jugabilidad';
        title.style.color = '#3498db';
        container.appendChild(title);

        // Dificultad
        const difficultySection = this.createSelectSection(
            'Dificultad',
            ['easy', 'normal', 'hard'],
            ['Fácil', 'Normal', 'Difícil'],
            this.preferences.gameplay?.difficulty || 'normal',
            (value) => {
                this.pendingChanges.gameplay = this.pendingChanges.gameplay || {};
                this.pendingChanges.gameplay.difficulty = value;
            }
        );
        container.appendChild(difficultySection);

        // Buffer de entrada
        const bufferSection = this.createSliderSection(
            'Buffer de Entrada (ms)',
            this.preferences.gameplay?.inputBufferTime || 150,
            (value) => {
                this.pendingChanges.gameplay = this.pendingChanges.gameplay || {};
                this.pendingChanges.gameplay.inputBufferTime = value;
            },
            50,
            300,
            'ms'
        );
        container.appendChild(bufferSection);
    }

    createSliderSection(label, currentValue, onChange, min = 0, max = 1, unit = '') {
        const section = document.createElement('div');
        section.style.cssText = `
            margin-bottom: 30px;
            padding: 20px;
            background: rgba(255,255,255,0.1);
            border-radius: 10px;
        `;

        const labelElement = document.createElement('label');
        labelElement.textContent = label;
        labelElement.style.cssText = `
            display: block;
            margin-bottom: 10px;
            font-size: 18px;
            font-weight: bold;
        `;

        const sliderContainer = document.createElement('div');
        sliderContainer.style.cssText = `
            display: flex;
            align-items: center;
            gap: 15px;
        `;

        const slider = document.createElement('input');
        slider.type = 'range';
        slider.min = min;
        slider.max = max;
        slider.step = max > 1 ? 1 : 0.01;
        slider.value = currentValue;
        slider.style.cssText = `
            flex: 1;
            height: 8px;
            background: #34495e;
            border-radius: 5px;
            outline: none;
        `;

        const valueDisplay = document.createElement('span');
        valueDisplay.textContent = `${max > 1 ? Math.round(currentValue) : (currentValue * 100).toFixed(0)}${unit === 'ms' ? unit : '%'}`;
        valueDisplay.style.cssText = `
            min-width: 50px;
            text-align: right;
            font-weight: bold;
            color: #3498db;
        `;

        slider.oninput = () => {
            const value = parseFloat(slider.value);
            valueDisplay.textContent = `${max > 1 ? Math.round(value) : (value * 100).toFixed(0)}${unit === 'ms' ? unit : '%'}`;
            onChange(value);
        };

        sliderContainer.appendChild(slider);
        sliderContainer.appendChild(valueDisplay);
        section.appendChild(labelElement);
        section.appendChild(sliderContainer);

        return section;
    }

    createCheckboxSection(label, currentValue, onChange) {
        const section = document.createElement('div');
        section.style.cssText = `
            margin-bottom: 20px;
            padding: 15px;
            background: rgba(255,255,255,0.1);
            border-radius: 10px;
            display: flex;
            align-items: center;
            justify-content: space-between;
        `;

        const labelElement = document.createElement('label');
        labelElement.textContent = label;
        labelElement.style.cssText = `
            font-size: 18px;
            font-weight: bold;
        `;

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = currentValue;
        checkbox.style.cssText = `
            transform: scale(1.5);
            accent-color: #3498db;
        `;

        checkbox.onchange = () => onChange(checkbox.checked);

        section.appendChild(labelElement);
        section.appendChild(checkbox);

        return section;
    }

    createSelectSection(label, values, labels, currentValue, onChange) {
        const section = document.createElement('div');
        section.style.cssText = `
            margin-bottom: 20px;
            padding: 20px;
            background: rgba(255,255,255,0.1);
            border-radius: 10px;
        `;

        const labelElement = document.createElement('label');
        labelElement.textContent = label;
        labelElement.style.cssText = `
            display: block;
            margin-bottom: 10px;
            font-size: 18px;
            font-weight: bold;
        `;

        const select = document.createElement('select');
        select.style.cssText = `
            width: 100%;
            padding: 10px;
            font-size: 16px;
            background: #34495e;
            color: white;
            border: none;
            border-radius: 5px;
        `;

        values.forEach((value, index) => {
            const option = document.createElement('option');
            option.value = value;
            option.textContent = labels[index];
            option.selected = value === currentValue;
            select.appendChild(option);
        });

        select.onchange = () => onChange(select.value);

        section.appendChild(labelElement);
        section.appendChild(select);

        return section;
    }

    createControlsSection(playerLabel, playerKey) {
        const section = document.createElement('div');
        section.style.cssText = `
            margin-bottom: 30px;
            padding: 20px;
            background: rgba(255,255,255,0.1);
            border-radius: 10px;
        `;

        const title = document.createElement('h3');
        title.textContent = playerLabel;
        title.style.color = '#e74c3c';
        section.appendChild(title);

        const controls = this.preferences.controls?.[playerKey] || {};
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
            const controlRow = document.createElement('div');
            controlRow.style.cssText = `
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 10px;
                padding: 10px;
                background: rgba(0,0,0,0.2);
                border-radius: 5px;
            `;

            const actionLabel = document.createElement('span');
            actionLabel.textContent = label;
            actionLabel.style.fontSize = '16px';

            const keyButton = document.createElement('button');
            keyButton.textContent = controls[action] || 'No asignado';
            keyButton.style.cssText = `
                padding: 5px 15px;
                background: #e74c3c;
                color: white;
                border: none;
                border-radius: 5px;
                cursor: pointer;
                min-width: 80px;
            `;

            keyButton.onclick = () => {
                this.remapKey(playerKey, action, keyButton);
            };

            controlRow.appendChild(actionLabel);
            controlRow.appendChild(keyButton);
            section.appendChild(controlRow);
        });

        return section;
    }

    remapKey(playerKey, action, button) {
        button.textContent = 'Presiona una tecla...';
        button.style.background = '#f39c12';

        const keyListener = (event) => {
            event.preventDefault();
            const key = event.key;
            
            button.textContent = key;
            button.style.background = '#e74c3c';

            // Guardar cambio pendiente
            this.pendingChanges.controls = this.pendingChanges.controls || {};
            this.pendingChanges.controls[playerKey] = this.pendingChanges.controls[playerKey] || {};
            this.pendingChanges.controls[playerKey][action] = key;

            document.removeEventListener('keydown', keyListener);
        };

        document.addEventListener('keydown', keyListener);
    }

    createFooter() {
        const footer = document.createElement('div');
        footer.style.cssText = `
            background: rgba(0,0,0,0.3);
            padding: 20px;
            display: flex;
            justify-content: center;
            gap: 20px;
            border-top: 2px solid #34495e;
        `;

        const saveButton = document.createElement('button');
        saveButton.textContent = 'Guardar Cambios';
        saveButton.style.cssText = `
            padding: 12px 25px;
            background: #27ae60;
            color: white;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            font-size: 16px;
            font-weight: bold;
        `;
        saveButton.onclick = () => this.saveChanges();

        const resetButton = document.createElement('button');
        resetButton.textContent = 'Restaurar Valores por Defecto';
        resetButton.style.cssText = `
            padding: 12px 25px;
            background: #e67e22;
            color: white;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            font-size: 16px;
            font-weight: bold;
        `;
        resetButton.onclick = () => this.resetToDefaults();

        const backButton = document.createElement('button');
        backButton.textContent = 'Volver';
        backButton.style.cssText = `
            padding: 12px 25px;
            background: #95a5a6;
            color: white;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            font-size: 16px;
            font-weight: bold;
        `;
        backButton.onclick = () => {
            if (this.onBack) this.onBack();
        };

        footer.appendChild(saveButton);
        footer.appendChild(resetButton);
        footer.appendChild(backButton);

        return footer;
    }

    async saveChanges() {
        if (Object.keys(this.pendingChanges).length === 0) {
            alert('No hay cambios para guardar.');
            return;
        }

        try {
            await UserPreferencesManager.updatePreferences(this.pendingChanges);
            this.preferences = UserPreferencesManager.getPreferences();
            this.pendingChanges = {};
            alert('Configuración guardada exitosamente.');
        } catch (error) {
            alert('Error guardando la configuración: ' + error.message);
        }
    }

    async resetToDefaults() {
        if (confirm('¿Estás seguro de que quieres restaurar todas las configuraciones a sus valores por defecto?')) {
            try {
                await UserPreferencesManager.resetToDefaults();
                this.preferences = UserPreferencesManager.getPreferences();
                this.pendingChanges = {};
                this.refreshContent();
                alert('Configuración restaurada a valores por defecto.');
            } catch (error) {
                alert('Error restaurando la configuración: ' + error.message);
            }
        }
    }

    refreshContent() {
        const contentArea = document.getElementById('optionsContent');
        if (contentArea) {
            this.renderCurrentTab(contentArea);
        }

        // Actualizar navegación
        const nav = contentArea.parentElement.querySelector('div:nth-child(2)');
        if (nav) {
            Array.from(nav.children).forEach((button, index) => {
                const tabs = ['audio', 'controls', 'graphics', 'gameplay'];
                button.style.background = this.currentTab === tabs[index] ? '#3498db' : 'transparent';
            });
        }
    }

    cleanup() {
        // Remover event listeners si existen
        document.removeEventListener('keydown', this.keyListener);
    }
}