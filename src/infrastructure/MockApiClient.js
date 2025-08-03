export default class MockApiClient {
    constructor() {
        this.mockData = {
            characters: [
                { id: 1, name: 'Ryu', health: 100, superMeter: 0 },
                { id: 2, name: 'Ken', health: 100, superMeter: 0 },
                { id: 3, name: 'Chun-Li', health: 100, superMeter: 0 }
            ],
            stages: [
                { id: 1, name: 'Dojo' },
                { id: 2, name: 'Street' }
            ],
            music: [
                { id: 1, name: 'Theme 1' },
                { id: 2, name: 'Theme 2' }
            ]
        };
    }

    async getPlayableCharacters() {
        return new Promise(resolve => {
            setTimeout(() => resolve(this.mockData.characters), Math.random() * 250);
        });
    }

    async getStages() {
        return new Promise(resolve => {
            setTimeout(() => resolve(this.mockData.stages), Math.random() * 250);
        });
    }

    async getMusic() {
        return new Promise(resolve => {
            setTimeout(() => resolve(this.mockData.music), Math.random() * 250);
        });
    }

    async login(email, password) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                if (email === 'test@example.com' && password === 'password') {
                    resolve({ token: 'mockToken123', user: { id: 1, name: 'Test User', role: 'USER' } });
                } else {
                    reject(new Error('Credenciales inválidas'));
                }
            }, Math.random() * 250);
        });
    }
}