// Configuración base para Ryu - Sección 8 del Documento Maestro
export default {
    name: 'Ryu',
    archetype: 'SHOTO', // Arquetipo para IA - Mismo que Ken por ser Shoto

    // Configuración del sprite sheet
    spriteConfig: {
        frameWidth: 64,    // Ancho por defecto de frame (puede variar por animación)
        frameHeight: 96,   // Alto por defecto de frame (puede variar por animación)
        sheetWidth: 1549,  // Ancho total del sprite sheet
        sheetHeight: 11279 // Alto total del sprite sheet
    },

    // Ruta al spritesheet
    spriteSheet: '/src/assets/images/ryu-spritesheet.png',

    // Estadísticas del personaje (Sección 13)
    stats: {
        health: 1050,      // Más resistente que Ken
        speed: 1.8,        // Ligeramente más lento que Ken
        jumpForce: -400,   // Misma altura de salto
        gravity: 800,      // Misma gravedad
        superMeterGainOnHit: 12,        // Gana más medidor que Ken
        superMeterGainOnBlock: 6,
        superMeterGainOnTakeDamage: 8
    },

    // Configuración de animaciones con frame data detallado
    animations: {
        idle: {
            frames: [
                // Usando la misma estructura de frames que Ken por ser un Shoto
                // pero con diferentes propiedades de daño/recuperación
                { x: 1, y: 904, width: 64, height: 96, type: 'active', duration: 12 },
                { x: 66, y: 904, width: 64, height: 96, type: 'active', duration: 12 },
                { x: 131, y: 904, width: 64, height: 96, type: 'active', duration: 12 },
                { x: 196, y: 904, width: 64, height: 96, type: 'active', duration: 12 }
            ],
            frameRate: 7,
            loop: true,
            onEnd: 'idle'
        },
        
        walkForward: {
            frames: [
                { x: 1, y: 1276, width: 80, height: 96, type: 'active', duration: 6 },
                { x: 82, y: 1276, width: 80, height: 96, type: 'active', duration: 6 },
                { x: 163, y: 1276, width: 80, height: 96, type: 'active', duration: 6 },
                { x: 244, y: 1276, width: 80, height: 96, type: 'active', duration: 6 },
                { x: 325, y: 1276, width: 80, height: 96, type: 'active', duration: 6 }
            ],
            frameRate: 12,
            loop: true,
            onEnd: 'idle'
        },

        walkBackward: {
            frames: [
                { x: 1, y: 1373, width: 80, height: 96, type: 'active', duration: 6 },
                { x: 82, y: 1373, width: 80, height: 96, type: 'active', duration: 6 },
                { x: 163, y: 1373, width: 80, height: 96, type: 'active', duration: 6 },
                { x: 244, y: 1373, width: 80, height: 96, type: 'active', duration: 6 },
                { x: 325, y: 1373, width: 80, height: 96, type: 'active', duration: 6 },
                { x: 406, y: 1373, width: 80, height: 96, type: 'active', duration: 6 }
            ],
            frameRate: 12,
            loop: true,
            onEnd: 'idle'
        },

        jump: {
            frames: [
                { x: 1, y: 1583, width: 64, height: 112, type: 'active', duration: 6 },
                { x: 66, y: 1583, width: 64, height: 112, type: 'active', duration: 6 },
                { x: 131, y: 1583, width: 64, height: 112, type: 'active', duration: 6 },
                { x: 196, y: 1583, width: 64, height: 112, type: 'active', duration: 6 },
                { x: 261, y: 1583, width: 64, height: 112, type: 'active', duration: 6 },
                { x: 326, y: 1583, width: 64, height: 112, type: 'active', duration: 6 }
            ],
            frameRate: 6,
            loop: false,
            onEnd: 'idle'
        },

        lightPunch: {
            frames: [
                { x: 1, y: 1793, width: 112, height: 96, type: 'startup', duration: 22 }, // Más rápido que Ken
                { x: 114, y: 1793, width: 112, height: 96, type: 'active', duration: 24, 
                    hitbox: { x: 40, y: 20, w: 24, h: 20, damage: 12 } // Más daño que Ken
                }
            ],
            frameRate: 5,
            loop: false,
            onEnd: 'idle',
            cancels: ['lightPunch', 'mediumPunch', 'hadoken'] // Más opciones de cancel que Ken
        },

        hadoken: {
            frames: [
                { x: 768, y: 618, width: 64, height: 96, type: 'startup', duration: 10 }, // Más lento que Ken
                { x: 832, y: 618, width: 64, height: 96, type: 'startup', duration: 4 },
                { x: 896, y: 618, width: 64, height: 96, type: 'active', duration: 3, 
                    projectile: {
                        damage: 85, // Más daño que el de Ken
                        speed: 7,   // Más lento que el de Ken
                        hitStun: 18 // Más hitstun que el de Ken
                    }
                },
                { x: 960, y: 618, width: 64, height: 96, type: 'recovery', duration: 14 }
            ],
            frameRate: 12,
            loop: false,
            onEnd: 'idle',
            meterCost: 0
        }
    },

    // Movimientos especiales (Sección 12 - IA)
    specialMoves: [
        {
            name: 'hadoken',
            sequence: ['down', 'forward', 'attack1'],
            animationState: 'hadoken',
            meterCost: 0
        }
    ],

    // Súper ataques
    superAttacks: [
        {
            name: 'shinkuHadoken',
            sequence: ['down', 'forward', 'down', 'forward', 'attack1'],
            animationState: 'shinkuHadoken',
            meterCost: 100
        }
    ]
};
