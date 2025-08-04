export default class AuthManager {
    constructor(apiClient = null) {
        this.authToken = null;
        this.currentUser = null;
        this.apiClient = apiClient;
        
        console.log('🔐 AuthManager constructor - limpiando sessionStorage corrupto...');
        this.cleanupCorruptedStorage();
    }
    
    /**
     * Limpiar datos corruptos del sessionStorage
     */
    cleanupCorruptedStorage() {
        const token = sessionStorage.getItem('authToken');
        const user = sessionStorage.getItem('currentUser');
        
        // Si cualquiera de los valores es una string "undefined" o "null", limpiar todo
        if (token === 'undefined' || token === 'null' || 
            user === 'undefined' || user === 'null') {
            console.log('🧹 Limpiando sessionStorage corrupto...');
            sessionStorage.removeItem('authToken');
            sessionStorage.removeItem('currentUser');
            console.log('✅ sessionStorage limpiado');
        }
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
        console.log('🔐 AuthManager.init() - Verificando sessionStorage...');
        
        // Verificar si ya existe un token en sessionStorage
        const savedToken = sessionStorage.getItem('authToken');
        const savedUser = sessionStorage.getItem('currentUser');
        
        console.log('🔐 Datos en sessionStorage:', { 
            savedToken: savedToken, 
            savedUser: savedUser,
            tokenType: typeof savedToken,
            userType: typeof savedUser
        });
        
        // Validar que los valores existan y no sean strings "undefined" o "null"
        if (savedToken && savedToken !== 'undefined' && savedToken !== 'null' && 
            savedUser && savedUser !== 'undefined' && savedUser !== 'null') {
            
            try {
                this.authToken = savedToken;
                this.currentUser = JSON.parse(savedUser);
                console.log('✅ AuthManager: Sesión restaurada correctamente');
                console.log('🔐 Usuario restaurado:', this.currentUser);
            } catch (error) {
                console.error('❌ Error parseando datos de sesión:', error);
                console.log('🔧 Limpiando sessionStorage corrupto...');
                sessionStorage.removeItem('authToken');
                sessionStorage.removeItem('currentUser');
                this.authToken = null;
                this.currentUser = null;
            }
        } else {
            console.log('🔐 No hay sesión válida almacenada');
            this.authToken = null;
            this.currentUser = null;
        }
        
        console.log('🔐 AuthManager inicializado - Estado final:', {
            isAuthenticated: this.isAuthenticated(),
            user: this.currentUser
        });
    }
}