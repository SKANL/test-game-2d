class AssetLoader {
    static loadImage(url) {
        return new Promise((resolve, reject) => {
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
                console.error(`Error al cargar la imagen en ${url}:`, error);
                // Intentar con una URL relativa si la absoluta falla
                if (url.startsWith('/')) {
                    const relativeUrl = url.substring(1); // Quitar el / inicial
                    console.log(`Intentando con URL relativa: ${relativeUrl}`);
                    img.src = relativeUrl;
                } else {
                    resolve(null);
                }
            };
            
            img.src = url;
        });
    }
} 

export default AssetLoader;