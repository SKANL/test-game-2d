// Mock database completo según especificación
const mockDb = {
    characters: [
        {
            id: 1,
            name: 'Ken',
            spriteSheetUrl: '/src/assets/images/ken-spritesheet.png',
            configPath: '../characters_base/KenBase.js',
            enabled: true,
            health: 1000,
            speed: 2.0,
            jumpForce: -420,
            superMeterGainOnHit: 10,
            superMeterGainOnBlock: 5,
            superMeterGainOnTakeDamage: 7
        },
        {
            id: 2,
            name: 'Ryu',
            spriteSheetUrl: '/src/assets/images/ryu-spritesheet.png',
            configPath: '../characters_base/RyuBase.js',
            enabled: true,
            health: 1050,
            speed: 1.8,
            jumpForce: -400,
            superMeterGainOnHit: 12,
            superMeterGainOnBlock: 6,
            superMeterGainOnTakeDamage: 8
        }
    ],
    stages: [
        { id: 1, name: 'Ken Stage', enabled: true, backgroundUrl: '/src/assets/images/Backgrounds/Ken-Stage.png' },
        { id: 2, name: 'Dojo', enabled: true, backgroundUrl: '' },
        { id: 3, name: 'Street', enabled: false, backgroundUrl: '' }
    ],
    music: [
        { id: 1, name: 'Battle Theme 1', enabled: true, url: '' },
        { id: 2, name: 'Battle Theme 2', enabled: true, url: '' },
        { id: 3, name: 'Menu Theme', enabled: false, url: '' }
    ],
    userPreferences: {
        1: {
            controls: {
                p1: {
                    up: 'w', down: 's', left: 'a', right: 'd',
                    punch: ' ', kick: 'q', special: 'e', super: 'r'
                }
            },
            volume: 0.7,
            debugMode: false
        }
    },
    users: [
        { id: 1, email: 'test@example.com', role: 'USER', name: 'Test User' },
        { id: 2, email: 'admin@example.com', role: 'ADMIN', name: 'Admin User' }
    ]
};

export default mockDb;