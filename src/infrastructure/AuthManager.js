export default class AuthManager {
    constructor(apiClient = null) {
        this.authToken = null;
        this.currentUser = null;
        this.apiClient = apiClient;
    }

    async register(email, password) {
        if (this.apiClient) {
            return await this.apiClient.register(email, password);
        }
        // Fallback a simulación
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    success: true,
                    message: 'Usuario registrado exitosamente'
                });
            }, 100);
        });
    }

    async login(email, password) {
        if (this.apiClient) {
            try {
                const response = await this.apiClient.login(email, password);
                this.authToken = response.token;
                this.currentUser = response.user;
                
                // Guardar en sessionStorage
                sessionStorage.setItem('authToken', this.authToken);
                sessionStorage.setItem('currentUser', JSON.stringify(this.currentUser));
                
                return response;
            } catch (error) {
                throw error;
            }
        }
        
        // Fallback a simulación
        return new Promise((resolve) => {
            setTimeout(() => {
                this.authToken = 'mock-token-123';
                this.currentUser = {
                    id: 1,
                    name: 'Usuario Mock',
                    role: 'USER',
                    email: email
                };
                
                // Guardar en sessionStorage
                sessionStorage.setItem('authToken', this.authToken);
                sessionStorage.setItem('currentUser', JSON.stringify(this.currentUser));
                
                resolve({
                    token: this.authToken,
                    user: this.currentUser
                });
            }, 200);
        });
    }

    logout() {
        this.authToken = null;
        this.currentUser = null;
        sessionStorage.removeItem('authToken');
        sessionStorage.removeItem('currentUser');
    }

    getToken() {
        return this.authToken;
    }

    getUser() {
        return this.currentUser;
    }

    isAuthenticated() {
        return this.authToken !== null;
    }

    init() {
        // Verificar si ya existe un token en sessionStorage
        const savedToken = sessionStorage.getItem('authToken');
        const savedUser = sessionStorage.getItem('currentUser');
        
        if (savedToken && savedUser) {
            this.authToken = savedToken;
            this.currentUser = JSON.parse(savedUser);
        }
    }
}