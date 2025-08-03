class AssetLoader {
    static loadImage(url) {
        return new Promise((resolve) => {
            console.log(`Intentando cargar la imagen desde: ${url}`);
            const img = new Image();
            
            // Manejar errores de CORS
            img.crossOrigin = 'anonymous';
            
            img.onload = () => {
                console.log(`Imagen cargada correctamente: ${url}`, {
                    width: img.width,
                    height: img.height,
                    src: img.src
                });
                resolve(img);
            };
            
            img.onerror = (error) => {
                console.warn(`Advertencia: No se pudo encontrar el recurso de imagen [${url}]`);
                // Resolver con null según especificación
                resolve(null);
            };
            
            img.src = url;
        });
    }

    static loadSound(url) {
        return new Promise((resolve) => {
            console.log(`Intentando cargar sonido desde: ${url}`);
            const audio = new Audio();
            
            audio.oncanplaythrough = () => {
                console.log(`Sonido cargado correctamente: ${url}`);
                resolve(audio);
            };
            
            audio.onerror = (error) => {
                console.warn(`Advertencia: No se pudo encontrar el recurso de sonido [${url}]`);
                // Resolver con null según especificación
                resolve(null);
            };
            
            audio.src = url;
        });
    }

    static playSound(audioElement) {
        if (audioElement && audioElement instanceof Audio) {
            try {
                audioElement.currentTime = 0; // Reiniciar desde el principio
                audioElement.play();
            } catch (error) {
                console.warn('No se pudo reproducir el sonido:', error);
            }
        } else {
            console.warn('Advertencia: Intento de reproducir sonido inexistente');
        }
    }
    
    static async loadAssets(assetList) {
        const results = {};
        
        for (const [key, asset] of Object.entries(assetList)) {
            if (asset.type === 'image') {
                results[key] = await this.loadImage(asset.url);
            } else if (asset.type === 'sound') {
                results[key] = await this.loadSound(asset.url);
            }
        }
        
        return results;
    }
} 

export default AssetLoader;