/**
 * MockApiClient - Cliente API simulado PRINCIPAL
 * Versión unificada con latencia optimizada y simulación de red realista
 * REFACTORIZADO: Eliminada duplicación con MockApiClient_optimized
 */
import mockDb from '../data/mock-db.js';

class MockApiClient {
    constructor() {
        this.mockData = mockDb;
        // Configuración de latencia simulada (en ms)
        this.latencyConfig = {
            fast: 10,     // Operaciones rápidas (cache hits)
            normal: 50,   // Operaciones normales
            slow: 100     // Operaciones complejas
        };
    }

    /**
     * Simular latencia de red de forma optimizada
     */
    simulateLatency(type = 'normal') {
        const baseLatency = this.latencyConfig[type] || this.latencyConfig.normal;
        const variation = Math.random() * 20; // Máximo 20ms de variación
        return baseLatency + variation;
    }

    // ==================== AUTH ENDPOINTS ====================
    
    async register(email, password) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                if (!email || !password) {
                    reject(new Error('Email y password requeridos'));
                    return;
                }
                
                // Verificar si el usuario ya existe
                const existingUser = this.mockData.users.find(u => u.email === email);
                if (existingUser) {
                    reject(new Error('Usuario ya existe'));
                    return;
                }
                
                resolve({ 
                    success: true, 
                    message: 'Usuario registrado exitosamente',
                    user: { id: Date.now(), email, role: 'USER' }
                });
            }, this.simulateLatency('normal'));
        });
    }

    async login(email, password) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                if (!email || !password) {
                    reject(new Error('Credenciales requeridas'));
                    return;
                }
                
                // Verificar credenciales contra usuarios mock
                const user = this.mockData.users.find(u => u.email === email);
                
                if (user) {
                    resolve({ 
                        token: 'mockToken123', 
                        user: { ...user, name: user.name || 'Mock User' }
                    });
                } else {
                    reject(new Error('Credenciales inválidas'));
                }
            }, this.simulateLatency('normal'));
        });
    }

    // ==================== CHARACTER ENDPOINTS ====================

    async getPlayableCharacters() {
        return new Promise(resolve => {
            setTimeout(() => {
                const playableChars = this.mockData.characters.filter(c => c.enabled !== false);
                resolve(playableChars);
            }, this.simulateLatency('fast')); // Cache hit simulation
        });
    }

    async getAllCharacters() {
        return new Promise(resolve => {
            setTimeout(() => {
                resolve([...this.mockData.characters]); // Return copy to prevent mutations
            }, this.simulateLatency('normal'));
        });
    }

    async addCharacter(character) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                if (!character || !character.name) {
                    reject(new Error('Datos de personaje inválidos'));
                    return;
                }
                
                const newCharacter = {
                    ...character,
                    id: Date.now(),
                    enabled: character.enabled !== undefined ? character.enabled : true
                };
                
                this.mockData.characters.push(newCharacter);
                resolve(newCharacter);
            }, this.simulateLatency('normal'));
        });
    }

    async updateCharacter(id, updates) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                const index = this.mockData.characters.findIndex(c => c.id === id);
                
                if (index === -1) {
                    reject(new Error('Personaje no encontrado'));
                    return;
                }
                
                this.mockData.characters[index] = { 
                    ...this.mockData.characters[index], 
                    ...updates 
                };
                
                resolve(this.mockData.characters[index]);
            }, this.simulateLatency('normal'));
        });
    }

    async deleteCharacter(id) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                const initialLength = this.mockData.characters.length;
                this.mockData.characters = this.mockData.characters.filter(c => c.id !== id);
                
                if (this.mockData.characters.length === initialLength) {
                    reject(new Error('Personaje no encontrado'));
                    return;
                }
                
                resolve({ success: true, message: 'Personaje eliminado' });
            }, this.simulateLatency('normal'));
        });
    }

    // ==================== STAGE ENDPOINTS ====================

    async getStages() {
        return new Promise(resolve => {
            setTimeout(() => {
                resolve([...this.mockData.stages]);
            }, this.simulateLatency('fast'));
        });
    }

    async addStage(stage) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                if (!stage || !stage.name) {
                    reject(new Error('Datos de escenario inválidos'));
                    return;
                }
                
                const newStage = {
                    ...stage,
                    id: Date.now(),
                    enabled: stage.enabled !== undefined ? stage.enabled : true
                };
                
                this.mockData.stages.push(newStage);
                resolve(newStage);
            }, this.simulateLatency('normal'));
        });
    }

    // ==================== MUSIC ENDPOINTS ====================

    async getMusic() {
        return new Promise(resolve => {
            setTimeout(() => {
                resolve([...this.mockData.music]);
            }, this.simulateLatency('fast'));
        });
    }

    async addMusic(track) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                if (!track || !track.name) {
                    reject(new Error('Datos de música inválidos'));
                    return;
                }
                
                const newTrack = {
                    ...track,
                    id: Date.now(),
                    enabled: track.enabled !== undefined ? track.enabled : true
                };
                
                this.mockData.music.push(newTrack);
                resolve(newTrack);
            }, this.simulateLatency('normal'));
        });
    }

    // ==================== USER PREFERENCES ENDPOINTS ====================

    async getUserPreferences(userId) {
        return new Promise(resolve => {
            setTimeout(() => {
                const preferences = this.mockData.userPreferences[userId] || {};
                resolve({ ...preferences }); // Return copy
            }, this.simulateLatency('fast'));
        });
    }

    async updateUserPreferences(prefs) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                if (!prefs || typeof prefs !== 'object') {
                    reject(new Error('Preferencias inválidas'));
                    return;
                }
                
                // Asumir usuario ID 1 para mock
                const userId = 1;
                this.mockData.userPreferences[userId] = { 
                    ...this.mockData.userPreferences[userId], 
                    ...prefs 
                };
                
                resolve(this.mockData.userPreferences[userId]);
            }, this.simulateLatency('normal'));
        });
    }

    // ==================== UTILITY METHODS ====================

    /**
     * Método para simular fallo de red
     */
    simulateNetworkError(probability = 0.1) {
        return Math.random() < probability;
    }

    /**
     * Obtener estadísticas de mock data
     */
    getStats() {
        return {
            totalCharacters: this.mockData.characters.length,
            enabledCharacters: this.mockData.characters.filter(c => c.enabled).length,
            totalStages: this.mockData.stages.length,
            totalTracks: this.mockData.music.length,
            totalUsers: this.mockData.users.length
        };
    }
}

export default MockApiClient;
