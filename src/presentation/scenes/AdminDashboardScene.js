/**
 * AdminDashboardScene - Panel de administración completo
 * Sección 9 del Documento Maestro
 */
export default class AdminDashboardScene {
    constructor(onLogout) {
        this.onLogout = onLogout;
        this.apiClient = null; // Se asigna desde el contexto
        this.currentTab = 'characters';
        this.data = {
            characters: [],
            stages: [],
            music: []
        };
    }

    async init() {
        // El apiClient se pasa desde el GameManager
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
        const container = document.createElement('div');
        container.style.cssText = `
            width: 100%;
            height: 100vh;
            background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
            color: white;
            font-family: Arial, sans-serif;
            overflow-y: auto;
        `;

        // Header
        const header = this.createHeader();
        container.appendChild(header);

        // Navigation tabs
        const nav = this.createNavigation();
        container.appendChild(nav);

        // Content area
        const content = this.createContentArea();
        container.appendChild(content);

        document.body.appendChild(container);
    }

    createHeader() {
        const header = document.createElement('div');
        header.style.cssText = `
            background: rgba(0,0,0,0.3);
            padding: 20px;
            border-bottom: 2px solid #333;
            display: flex;
            justify-content: space-between;
            align-items: center;
        `;

        const title = document.createElement('h1');
        title.textContent = 'Panel de Administración';
        title.style.cssText = `
            margin: 0;
            color: #ffaa00;
            font-size: 2rem;
        `;

        const logoutBtn = document.createElement('button');
        logoutBtn.textContent = 'Cerrar Sesión';
        logoutBtn.style.cssText = `
            padding: 10px 20px;
            background: #dc3545;
            color: white;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            font-size: 16px;
        `;
        logoutBtn.onclick = () => {
            if (this.onLogout) this.onLogout();
        };

        header.appendChild(title);
        header.appendChild(logoutBtn);
        return header;
    }

    createNavigation() {
        const nav = document.createElement('div');
        nav.style.cssText = `
            display: flex;
            background: rgba(0,0,0,0.2);
            border-bottom: 1px solid #333;
        `;

        const tabs = [
            { id: 'characters', label: 'Personajes' },
            { id: 'stages', label: 'Escenarios' },
            { id: 'music', label: 'Música' }
        ];

        tabs.forEach(tab => {
            const button = document.createElement('button');
            button.textContent = tab.label;
            button.style.cssText = `
                padding: 15px 30px;
                background: ${this.currentTab === tab.id ? '#ffaa00' : 'transparent'};
                color: ${this.currentTab === tab.id ? '#000' : '#fff'};
                border: none;
                cursor: pointer;
                font-size: 16px;
                border-bottom: 3px solid ${this.currentTab === tab.id ? '#ffaa00' : 'transparent'};
            `;
            
            button.onclick = () => {
                this.currentTab = tab.id;
                this.refreshContent();
            };
            
            nav.appendChild(button);
        });

        return nav;
    }

    createContentArea() {
        const content = document.createElement('div');
        content.id = 'adminContent';
        content.style.cssText = `
            padding: 30px;
            min-height: calc(100vh - 200px);
        `;

        this.renderCurrentTab(content);
        return content;
    }

    renderCurrentTab(container) {
        container.innerHTML = '';

        switch (this.currentTab) {
            case 'characters':
                this.renderCharactersTab(container);
                break;
            case 'stages':
                this.renderStagesTab(container);
                break;
            case 'music':
                this.renderMusicTab(container);
                break;
        }
    }

    renderCharactersTab(container) {
        const header = document.createElement('div');
        header.style.cssText = `
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 30px;
        `;

        const title = document.createElement('h2');
        title.textContent = 'Gestión de Personajes';
        title.style.color = '#ffaa00';

        const addBtn = document.createElement('button');
        addBtn.textContent = '+ Añadir Personaje';
        addBtn.style.cssText = `
            padding: 10px 20px;
            background: #28a745;
            color: white;
            border: none;
            border-radius: 5px;
            cursor: pointer;
        `;
        addBtn.onclick = () => this.showAddCharacterForm();

        header.appendChild(title);
        header.appendChild(addBtn);
        container.appendChild(header);

        // Characters table
        const table = this.createCharactersTable();
        container.appendChild(table);
    }

    createCharactersTable() {
        const table = document.createElement('table');
        table.style.cssText = `
            width: 100%;
            border-collapse: collapse;
            background: rgba(255,255,255,0.1);
            border-radius: 10px;
            overflow: hidden;
        `;

        // Header
        const thead = document.createElement('thead');
        thead.innerHTML = `
            <tr style="background: rgba(0,0,0,0.3);">
                <th style="padding: 15px; text-align: left;">Nombre</th>
                <th style="padding: 15px; text-align: left;">Vida</th>
                <th style="padding: 15px; text-align: left;">Velocidad</th>
                <th style="padding: 15px; text-align: left;">Estado</th>
                <th style="padding: 15px; text-align: left;">Acciones</th>
            </tr>
        `;
        table.appendChild(thead);

        // Body
        const tbody = document.createElement('tbody');
        this.data.characters.forEach(character => {
            const row = document.createElement('tr');
            row.style.cssText = `
                border-bottom: 1px solid #333;
            `;

            row.innerHTML = `
                <td style="padding: 15px;">${character.name}</td>
                <td style="padding: 15px;">${character.health}</td>
                <td style="padding: 15px;">${character.speed}</td>
                <td style="padding: 15px;">
                    <span style="padding: 5px 10px; border-radius: 15px; background: ${character.enabled ? '#28a745' : '#dc3545'};">
                        ${character.enabled ? 'Activo' : 'Inactivo'}
                    </span>
                </td>
                <td style="padding: 15px;">
                    <button onclick="adminScene.editCharacter(${character.id})" style="margin-right: 10px; padding: 5px 10px; background: #007bff; color: white; border: none; border-radius: 3px; cursor: pointer;">Editar</button>
                    <button onclick="adminScene.toggleCharacter(${character.id})" style="margin-right: 10px; padding: 5px 10px; background: #ffc107; color: black; border: none; border-radius: 3px; cursor: pointer;">${character.enabled ? 'Desactivar' : 'Activar'}</button>
                    <button onclick="adminScene.deleteCharacter(${character.id})" style="padding: 5px 10px; background: #dc3545; color: white; border: none; border-radius: 3px; cursor: pointer;">Eliminar</button>
                </td>
            `;

            tbody.appendChild(row);
        });
        table.appendChild(tbody);

        // Hacer disponible la instancia para los botones
        window.adminScene = this;

        return table;
    }

    renderStagesTab(container) {
        const header = document.createElement('div');
        header.style.cssText = `
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 30px;
        `;

        const title = document.createElement('h2');
        title.textContent = 'Gestión de Escenarios';
        title.style.color = '#ffaa00';

        header.appendChild(title);
        container.appendChild(header);

        // Stages list
        this.data.stages.forEach(stage => {
            const stageCard = document.createElement('div');
            stageCard.style.cssText = `
                background: rgba(255,255,255,0.1);
                padding: 20px;
                margin-bottom: 15px;
                border-radius: 10px;
                display: flex;
                justify-content: space-between;
                align-items: center;
            `;

            stageCard.innerHTML = `
                <div>
                    <h3 style="margin: 0; color: white;">${stage.name}</h3>
                    <p style="margin: 5px 0; color: #ccc;">Estado: ${stage.enabled ? 'Activo' : 'Inactivo'}</p>
                </div>
                <div>
                    <button onclick="adminScene.toggleStage(${stage.id})" style="padding: 10px 15px; background: #ffc107; color: black; border: none; border-radius: 5px; cursor: pointer; margin-right: 10px;">
                        ${stage.enabled ? 'Desactivar' : 'Activar'}
                    </button>
                </div>
            `;

            container.appendChild(stageCard);
        });
    }

    renderMusicTab(container) {
        const header = document.createElement('div');
        header.style.cssText = `
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 30px;
        `;

        const title = document.createElement('h2');
        title.textContent = 'Gestión de Música';
        title.style.color = '#ffaa00';

        header.appendChild(title);
        container.appendChild(header);

        // Music list
        this.data.music.forEach(track => {
            const trackCard = document.createElement('div');
            trackCard.style.cssText = `
                background: rgba(255,255,255,0.1);
                padding: 20px;
                margin-bottom: 15px;
                border-radius: 10px;
                display: flex;
                justify-content: space-between;
                align-items: center;
            `;

            trackCard.innerHTML = `
                <div>
                    <h3 style="margin: 0; color: white;">${track.name}</h3>
                    <p style="margin: 5px 0; color: #ccc;">Estado: ${track.enabled ? 'Activo' : 'Inactivo'}</p>
                </div>
                <div>
                    <button onclick="adminScene.toggleMusic(${track.id})" style="padding: 10px 15px; background: #ffc107; color: black; border: none; border-radius: 5px; cursor: pointer;">
                        ${track.enabled ? 'Desactivar' : 'Activar'}
                    </button>
                </div>
            `;

            container.appendChild(trackCard);
        });
    }

    refreshContent() {
        const contentArea = document.getElementById('adminContent');
        if (contentArea) {
            this.renderCurrentTab(contentArea);
        }
        
        // Actualizar navegación
        document.querySelectorAll('nav button').forEach(btn => {
            btn.style.background = 'transparent';
            btn.style.color = '#fff';
            btn.style.borderBottom = '3px solid transparent';
        });
    }

    // Métodos de acción para personajes
    async editCharacter(id) {
        const character = this.data.characters.find(c => c.id === id);
        if (character) {
            const newHealth = prompt('Nueva vida:', character.health);
            const newSpeed = prompt('Nueva velocidad:', character.speed);
            
            if (newHealth && newSpeed) {
                try {
                    await this.apiClient.updateCharacter(id, {
                        health: parseInt(newHealth),
                        speed: parseFloat(newSpeed)
                    });
                    await this.loadAllData();
                    this.refreshContent();
                } catch (error) {
                    alert('Error actualizando personaje: ' + error.message);
                }
            }
        }
    }

    async toggleCharacter(id) {
        const character = this.data.characters.find(c => c.id === id);
        if (character) {
            try {
                await this.apiClient.updateCharacter(id, {
                    enabled: !character.enabled
                });
                await this.loadAllData();
                this.refreshContent();
            } catch (error) {
                alert('Error cambiando estado del personaje: ' + error.message);
            }
        }
    }

    async deleteCharacter(id) {
        if (confirm('¿Estás seguro de que quieres eliminar este personaje?')) {
            try {
                await this.apiClient.deleteCharacter(id);
                await this.loadAllData();
                this.refreshContent();
            } catch (error) {
                alert('Error eliminando personaje: ' + error.message);
            }
        }
    }

    async toggleStage(id) {
        const stage = this.data.stages.find(s => s.id === id);
        if (stage && this.apiClient.updateStage) {
            try {
                await this.apiClient.updateStage(id, {
                    enabled: !stage.enabled
                });
                await this.loadAllData();
                this.refreshContent();
            } catch (error) {
                console.warn('Funcionalidad no implementada en la API mock');
            }
        }
    }

    async toggleMusic(id) {
        const track = this.data.music.find(m => m.id === id);
        if (track && this.apiClient.updateMusic) {
            try {
                await this.apiClient.updateMusic(id, {
                    enabled: !track.enabled
                });
                await this.loadAllData();
                this.refreshContent();
            } catch (error) {
                console.warn('Funcionalidad no implementada en la API mock');
            }
        }
    }

    showAddCharacterForm() {
        // Implementación simplificada con prompts
        const name = prompt('Nombre del personaje:');
        const health = prompt('Vida:', '1000');
        const speed = prompt('Velocidad:', '2.0');
        
        if (name && health && speed) {
            this.apiClient.addCharacter({
                name,
                health: parseInt(health),
                speed: parseFloat(speed),
                enabled: true,
                spriteSheetUrl: '',
                configPath: ''
            }).then(() => {
                this.loadAllData().then(() => this.refreshContent());
            }).catch(error => {
                alert('Error añadiendo personaje: ' + error.message);
            });
        }
    }

    cleanup() {
        // Limpiar referencias globales
        if (window.adminScene === this) {
            delete window.adminScene;
        }
    }
}