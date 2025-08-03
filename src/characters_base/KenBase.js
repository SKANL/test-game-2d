// Configuración base para Ken - Sección 8 del Documento Maestro
export default {
    name: 'Ken',
    archetype: 'SHOTO', // Arquetipo para IA
    
    // Configuración del sprite sheet
    spriteConfig: {
        frameWidth: 64,    // Ancho por defecto de frame (puede variar por animación)
        frameHeight: 96,   // Alto por defecto de frame (puede variar por animación)
        sheetWidth: 1549,  // Ancho total del sprite sheet
        sheetHeight: 11279 // Alto total del sprite sheet
    },

    // Ruta al spritesheet
    spriteSheet: '/src/assets/images/ken-spritesheet.png',

    // Estadísticas del personaje (Sección 13)
    stats: {
        health: 100,
        speed: 85,       // Velocidad ajustada para movimiento fluido (ligeramente más rápido que Ryu)
        jumpForce: -400, // Fuerza de salto (negativa porque Y aumenta hacia abajo)
        gravity: 800,    // Gravedad (píxeles por segundo²)
        superMeterGainOnHit: 10,
        superMeterGainOnBlock: 5,
        superMeterGainOnTakeDamage: 8
    },

    // Configuración de animaciones con frame data detallado
    animations: {
        idle: {
            frames: [
                // Prueba: Primer frame desde la esquina superior izquierda
                { x: 1, y: 523, width: 64, height: 96, type: 'active', duration: 12 },
                { x: 66, y: 523, width: 64, height: 96, type: 'active', duration: 12 },
                { x: 131, y: 523, width: 64, height: 96, type: 'active', duration: 12 },
                { x: 196, y: 523, width: 64, height: 96, type: 'active', duration: 12 },
            ],
            frameRate: 7,
            loop: true,
            onEnd: 'idle'
        },
        
        walkForward: {
            frames: [
                // Deberás actualizar estas coordenadas con los valores reales de tu spritesheet
                { x: 1, y: 895, width: 80, height: 96, type: 'active', duration: 6 },
                { x: 82, y: 895, width: 80, height: 96, type: 'active', duration: 6 },
                { x: 163, y: 895, width: 80, height: 96, type: 'active', duration: 6 },
                { x: 244, y: 895, width: 80, height: 96, type: 'active', duration: 6 },
                { x: 325, y: 895, width: 80, height: 96, type: 'active', duration: 6 }
            ],
            frameRate: 12,
            loop: true,
            onEnd: 'idle'
        },
        walkBackward: {
            frames: [
                // Deberás actualizar estas coordenadas con los valores reales de tu spritesheet
                { x: 1, y: 992, width: 80, height: 96, type: 'active', duration: 6 },
                { x: 82, y: 992, width: 80, height: 96, type: 'active', duration: 6 },
                { x: 163, y: 992, width: 80, height: 96, type: 'active', duration: 6 },
                { x: 244, y: 992, width: 80, height: 96, type: 'active', duration: 6 },
                { x: 325, y: 992, width: 80, height: 96, type: 'active', duration: 6 },
                { x: 406, y: 992, width: 80, height: 96, type: 'active', duration: 6 }
            ],
            frameRate: 12,
            loop: true,
            onEnd: 'idle'
        },
        jump: {
            frames: [
                // Coordenadas corregidas para jump - todos con la misma altura
                { x: 1, y: 1202, width: 64, height: 112, type: 'active', duration: 6 },
                { x: 66, y: 1202, width: 64, height: 112, type: 'active', duration: 6 },
                { x: 131, y: 1202, width: 64, height: 112, type: 'active', duration: 6 },
                { x: 196, y: 1202, width: 64, height: 112, type: 'active', duration: 6 },
                { x: 261, y: 1202, width: 64, height: 112, type: 'active', duration: 6 },
                { x: 326, y: 1202, width: 64, height: 112, type: 'active', duration: 6 }
            ],
            frameRate: 6,
            loop: false,
            onEnd: 'idle'
        },

        lightPunch: {
            frames: [
                // Solo 2 frames reales que existen en el sprite sheet
                { x: 1, y: 1412, width: 112, height: 96, type: 'startup', duration: 24 },
                { x: 114, y: 1412, width: 112, height: 96, type: 'active', duration: 24, hitbox: { x: 40, y: 20, w: 24, h: 20, damage: 10 } }
            ],
            frameRate: 5,
            loop: false,
            onEnd: 'idle',
            cancels: ['lightPunch', 'mediumPunch'] // Combos permitidos
        },

        hadoken: {
            frames: [
                // Deberás actualizar estas coordenadas con los valores reales de tu spritesheet
                { x: 768, y: 618, width: 64, height: 96, type: 'startup', duration: 8 },
                { x: 832, y: 618, width: 64, height: 96, type: 'startup', duration: 4 },
                { x: 896, y: 618, width: 64, height: 96, type: 'active', duration: 3, projectile: true },
                { x: 960, y: 618, width: 64, height: 96, type: 'recovery', duration: 12 }
            ],
            frameRate: 12, // Más lento
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
            name: 'shinryuken',
            sequence: ['forward', 'down', 'forward', 'attack1'],
            animationState: 'shinryuken',
            meterCost: 100
        }
    ]
};
