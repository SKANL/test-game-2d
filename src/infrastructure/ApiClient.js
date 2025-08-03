// ApiClient real para comunicación con backend
// Actualmente inactivo, se activará cuando el backend esté disponible
class ApiClient {
    constructor(baseUrl = '/api') {
        this.baseUrl = baseUrl;
    }

    // Auth endpoints
    async register(email, password) {
        const response = await fetch(`${this.baseUrl}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        return await response.json();
    }

    async login(email, password) {
        const response = await fetch(`${this.baseUrl}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        return await response.json();
    }

    // Characters endpoints
    async getPlayableCharacters() {
        const response = await fetch(`${this.baseUrl}/characters/playable`);
        return await response.json();
    }

    async getAllCharacters() {
        const response = await fetch(`${this.baseUrl}/characters`);
        return await response.json();
    }

    async addCharacter(character) {
        const response = await fetch(`${this.baseUrl}/characters`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(character)
        });
        return await response.json();
    }

    async updateCharacter(id, updates) {
        const response = await fetch(`${this.baseUrl}/characters/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updates)
        });
        return await response.json();
    }

    async deleteCharacter(id) {
        const response = await fetch(`${this.baseUrl}/characters/${id}`, {
            method: 'DELETE'
        });
        return response.ok;
    }

    // Stages endpoints
    async getStages() {
        const response = await fetch(`${this.baseUrl}/stages`);
        return await response.json();
    }

    async addStage(stage) {
        const response = await fetch(`${this.baseUrl}/stages`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(stage)
        });
        return await response.json();
    }

    // Music endpoints
    async getMusic() {
        const response = await fetch(`${this.baseUrl}/music`);
        return await response.json();
    }

    async addMusic(track) {
        const response = await fetch(`${this.baseUrl}/music`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(track)
        });
        return await response.json();
    }

    // User preferences endpoints
    async getUserPreferences(userId) {
        const response = await fetch(`${this.baseUrl}/users/me/preferences`);
        return await response.json();
    }

    async updateUserPreferences(prefs) {
        const response = await fetch(`${this.baseUrl}/users/me/preferences`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(prefs)
        });
        return await response.json();
    }
}

export default ApiClient;