export default class AuthManager {
    constructor() {
        this.authToken = null;
        this.currentUser = null;
    }

    async register(email, password) {
        // Simulación de registro
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
        // Simulación de login
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