/**
 * main.js - Punto de entrada OPTIMIZADO de la aplicación
 * Refactorizado para seguir principios SOLID y Clean Architecture
 * Eliminadas variables globales innecesarias y mejorado manejo de errores
 */
import ApplicationController from './application/ApplicationController.js';
import ResponsiveUtils from './infrastructure/ResponsiveUtils.js';

/**
 * Función principal de inicialización con manejo robusto de errores
 */
async function initializeGame() {
    try {
        console.log('🚀 Iniciando aplicación...');
        
        // Inicializar sistema responsivo
        ResponsiveUtils.init();
        console.log('📱 Sistema responsivo inicializado');
        
        // Esperar a que anime.js esté disponible
        await waitForAnime();
        
        // Verificar que los elementos DOM estén disponibles
        const gameCanvas = document.getElementById('gameCanvas');
        if (!gameCanvas) {
            throw new Error('Canvas del juego no encontrado en el DOM');
        }
        
        console.log('✅ Canvas encontrado, creando ApplicationController...');
        
        // Crear e inicializar el controlador de aplicación
        const applicationController = new ApplicationController();
        
        console.log('✅ ApplicationController creado, inicializando...');
        await applicationController.initialize();
        
        console.log('✅ Aplicación inicializada correctamente');
        
        // Solo hacer disponible globalmente en modo desarrollo para debugging
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            window.debugController = applicationController;
            console.log('🐛 Debug controller disponible como window.debugController');
        }
        
    } catch (error) {
        console.error('❌ Error fatal al inicializar la aplicación:', error);
        showErrorScreen(error);
    }
}

/**
 * Mostrar pantalla de error user-friendly
 */
function showErrorScreen(error) {
    document.body.innerHTML = 
        '<div style="display: flex; flex-direction: column; justify-content: center; align-items: center; height: 100vh; background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%); color: #ffffff; font-family: Arial, sans-serif; text-align: center; padding: 20px;">' +
            '<div style="background: rgba(255, 0, 0, 0.1); border: 2px solid #ff4444; border-radius: 10px; padding: 30px; max-width: 600px; margin-bottom: 20px;">' +
                '<h1 style="color: #ff4444; margin-top: 0;">⚠️ Error de Inicialización</h1>' +
                '<p style="font-size: 18px; margin-bottom: 20px;">No se pudo inicializar la aplicación correctamente.</p>' +
                '<p style="font-size: 14px; color: #cccccc; margin-bottom: 20px;">Error técnico: ' + (error.message || error) + '</p>' +
                '<button onclick="window.location.reload()" style="background: #4CAF50; color: white; border: none; padding: 12px 24px; border-radius: 5px; cursor: pointer; font-size: 16px; margin: 10px;">🔄 Reintentar</button>' +
                '<button onclick="toggleErrorDetails()" style="background: #2196F3; color: white; border: none; padding: 12px 24px; border-radius: 5px; cursor: pointer; font-size: 16px; margin: 10px;">🔍 Ver Detalles</button>' +
            '</div>' +
            '<div id="errorDetails" style="display: none; background: rgba(0, 0, 0, 0.3); border: 1px solid #666; border-radius: 5px; padding: 20px; max-width: 800px; max-height: 300px; overflow-y: auto; text-align: left;">' +
                '<h3>Stack Trace:</h3>' +
                '<pre style="white-space: pre-wrap; word-wrap: break-word; font-size: 12px; color: #ff9999;">' + (error.stack || 'No hay stack trace disponible') + '</pre>' +
            '</div>' +
        '</div>';
    
    // Función para mostrar/ocultar detalles del error
    window.toggleErrorDetails = function() {
        const details = document.getElementById('errorDetails');
        details.style.display = details.style.display === 'none' ? 'block' : 'none';
    };
}

/**
 * Manejar errores no capturados de promises
 */
window.addEventListener('unhandledrejection', (event) => {
    console.error('❌ Promise rechazada no capturada:', {
        reason: event.reason,
        promise: event.promise
    });
    // Prevenir que aparezca en la consola del navegador
    event.preventDefault();
});

/**
 * Esperar a que anime.js esté disponible
 */
function waitForAnime() {
    return new Promise((resolve) => {
        if (typeof anime !== 'undefined') {
            console.log('✅ anime.js ya está disponible');
            resolve();
            return;
        }

        console.log('⏳ Esperando a que anime.js se cargue...');
        
        // Verificar cada 50ms si anime está disponible
        const checkAnime = setInterval(() => {
            if (typeof anime !== 'undefined') {
                console.log('✅ anime.js cargado correctamente');
                clearInterval(checkAnime);
                resolve();
            }
        }, 50);

        // Timeout después de 5 segundos
        setTimeout(() => {
            clearInterval(checkAnime);
            console.warn('⚠️ anime.js no se cargó en 5 segundos, continuando sin él');
            resolve();
        }, 5000);
    });
}

/**
 * Manejar errores JavaScript no capturados
 */
window.addEventListener('error', (event) => {
    console.error('❌ Error JavaScript no capturado:', {
        message: event.message,
        source: event.filename,
        line: event.lineno,
        column: event.colno,
        error: event.error
    });
});

/**
 * Inicialización con detección inteligente del estado del DOM
 */
function startApplication() {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeGame);
    } else {
        // DOM ya está listo, inicializar inmediatamente
        initializeGame();
    }
}

// Iniciar la aplicación
startApplication();
