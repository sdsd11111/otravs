/**
 * Mapeo de nombres de páginas a sus correspondientes archivos JSON
 */
const pageToJsonMap = {
    'panes-artesanales': 'panes-artesanales',
    'pasteleria-fina': 'pasteleria-fina',
    'pan-dulce-tradicional': 'pan-dulce-tradicional',
    'bebidas-acompanamientos': 'bebidas-acompanamientos',
    'especiales-temporada': 'especiales-temporada'
};

/**
 * Renderiza el contenido de la página cargando datos desde un archivo JSON.
 */
async function renderPageContent() {
    // 1. Determinar la categoría de la página desde el nombre del archivo URL
    const path = window.location.pathname;
    const filename = path.substring(path.lastIndexOf('/') + 1);
    const pageName = filename.split('.')[0];

    if (!pageName || pageName === 'plantilla_producto' || pageName === 'index') {
        console.log('No se requiere renderizado de contenido para esta página.');
        return;
    }

    // Obtener el nombre del archivo JSON correspondiente
    const jsonFileName = pageToJsonMap[pageName];
    if (!jsonFileName) {
        throw new Error(`No se encontró un mapeo para la página: ${pageName}`);
    }

    try {
        // 2. Cargar el archivo JSON correspondiente
        const response = await fetch(`/data/${jsonFileName}.json`);
        if (!response.ok) {
            throw new Error(`No se encontró el archivo de datos: /data/${jsonFileName}.json (${response.status} ${response.statusText})`);
        }
        const data = await response.json();

        // 3. Poblar el contenido en el HTML
        document.title = data.pageTitle || document.title;
        const metaDescription = document.querySelector('meta[name="description"]');
        if (metaDescription) {
            metaDescription.setAttribute('content', data.metaDescription || '');
        }

        // Poblar Hero
        const hero = document.querySelector('.product-hero');
        if (hero) {
            if (data.hero.backgroundImage) {
                // Asegurarse de que la ruta de la imagen sea absoluta
                let bgImage = data.hero.backgroundImage;
                if (!bgImage.startsWith('http') && !bgImage.startsWith('/')) {
                    bgImage = `/${bgImage}`;
                }
                
                // Crear una imagen para verificar si existe
                const img = new Image();
                img.onload = function() {
                    console.log('Imagen de fondo cargada correctamente:', bgImage);
                    hero.style.backgroundImage = `url('${bgImage}')`;
                    hero.style.backgroundColor = '#f5f5f5';
                    hero.style.backgroundSize = 'cover';
                    hero.style.backgroundPosition = 'center';
                    hero.style.backgroundRepeat = 'no-repeat';
                };
                img.onerror = function() {
                    console.error('Error al cargar la imagen de fondo:', bgImage);
                    hero.style.backgroundColor = '#f5f5f5';
                    hero.style.backgroundImage = 'none';
                };
                img.src = bgImage;
            }
            const titleElement = hero.querySelector('.product-title');
            const subtitleElement = hero.querySelector('.product-subtitle');
            
            if (titleElement && data.hero.title) {
                titleElement.textContent = data.hero.title;
            }
            if (subtitleElement && data.hero.subtitle) {
                subtitleElement.textContent = data.hero.subtitle;
            }
        }

        // Poblar Detalles del Producto
        const details = document.querySelector('.product-details');
        if (details) {
            // Obtener las imágenes según la categoría
            let productImages = [];
            
            // Mapeo de categorías a rutas de carpetas
            const categoryFolders = {
                'panes-artesanales': 'panes artesanales',
                'pasteleria-fina': 'Pasteleria fina', // Asegurarse de que el nombre de la carpeta coincida exactamente
                'pan-dulce-tradicional': 'pan dulce',
                'bebidas-acompanamientos': 'Bebidas',
                'especiales-temporada': 'Especiales'
            };
            
            const folderName = categoryFolders[jsonFileName] || jsonFileName.replace('-', ' ');
            const imageBasePath = `/images/${folderName}`;
            
            console.log('Ruta base de imágenes:', imageBasePath);
            
            // Intentar cargar las imágenes definidas en el JSON (comprobando varias posibles propiedades)
            if (data.images && Array.isArray(data.images) && data.images.length > 0) {
                // Si existe el arreglo 'images' en el JSON
                productImages = data.images.map(img => 
                    img.startsWith('http') || img.startsWith('/') ? img : `${imageBasePath}/${img}`
                );
            } else if (data.details?.thumbnails && Array.isArray(data.details.thumbnails)) {
                // Si existe el arreglo 'thumbnails' dentro de 'details'
                productImages = data.details.thumbnails.map(img => 
                    img.startsWith('http') || img.startsWith('/') ? img : `${imageBasePath}/${img}`
                );
            } else if (data.details?.mainImage) {
                // Si solo existe una imagen principal
                productImages = [data.details.mainImage];
            } else {
                // Si no hay imágenes definidas, intentar cargar imágenes por defecto
                console.warn('No se encontraron imágenes definidas en el JSON, intentando cargar imágenes por defecto');
                productImages = [
                    `${imageBasePath}/1.jpg`,
                    `${imageBasePath}/2.jpg`,
                    `${imageBasePath}/3.jpg`,
                    `${imageBasePath}/4.jpg`,
                    `${imageBasePath}/5.jpg`
                ].filter(Boolean);
            }

            // Establecer la primera imagen como principal
            const mainImage = details.querySelector('.main-image');
            if (mainImage && productImages.length > 0) {
                mainImage.src = productImages[0];
                mainImage.alt = data.details?.title || 'Imagen del producto';
            }
            
            // Actualizar el título si existe
            const titleElement = details.querySelector('.product-info h2');
            if (titleElement && data.details?.title) {
                titleElement.textContent = data.details.title;
            }
            
            // Actualizar los párrafos
            const paragraphsContainer = details.querySelector('.product-info p')?.parentElement;
            if (paragraphsContainer) {
                const ctaButton = details.querySelector('.cta-btn');
                const tempDiv = document.createElement('div');
                
                // Limpiar contenido existente
                paragraphsContainer.innerHTML = '';
                
                // Agregar párrafos
                if (data.details?.paragraphs && Array.isArray(data.details.paragraphs)) {
                    data.details.paragraphs.forEach(text => {
                        if (text) {
                            const p = document.createElement('p');
                            p.textContent = text;
                            tempDiv.appendChild(p);
                        }
                    });
                }
                
                // Agregar el botón de CTA si existe
                if (ctaButton) {
                    tempDiv.appendChild(ctaButton);
                    
                    // Configurar el enlace de WhatsApp
                    if (data.details?.ctaText) {
                        const encodedText = encodeURIComponent(data.details.ctaText);
                        ctaButton.href = `https://wa.me/593996976759?text=${encodedText}`;
                    }
                }
                
                paragraphsContainer.appendChild(tempDiv);
            }

            // Cargar miniaturas de las imágenes
            const thumbnailsContainer = details.querySelector('.thumbnail-images');
            if (thumbnailsContainer) {
                console.log('Iniciando carga de miniaturas...');
                console.log('Imágenes a cargar:', productImages);
                
                thumbnailsContainer.innerHTML = ''; // Limpiar miniaturas existentes
                
                productImages.forEach((src, index) => {
                    console.log(`Procesando imagen ${index + 1}:`, src);
                    
                    // Crear contenedor para la miniatura
                    const thumbnailContainer = document.createElement('div');
                    thumbnailContainer.className = 'thumbnail-container';
                    
                    // Crear elemento de imagen
                    const img = document.createElement('img');
                    img.src = src;
                    img.alt = `${data.details?.title || 'Producto'} ${index + 1}`;
                    img.loading = 'lazy';
                    
                    // Añadir clases y estilos
                    img.className = 'thumbnail';
                    img.style.width = '100%';
                    img.style.height = 'auto';
                    img.style.borderRadius = '4px';
                    img.style.cursor = 'pointer';
                    img.style.opacity = index === 0 ? '1' : '0.7';
                    img.style.transition = 'opacity 0.3s';
                    
                    // Añadir evento hover
                    img.addEventListener('mouseenter', () => {
                        img.style.opacity = '1';
                    });
                    
                    img.addEventListener('mouseleave', () => {
                        if (!img.classList.contains('active')) {
                            img.style.opacity = '0.7';
                        }
                    });
                    
                    // Añadir evento click para cambiar la imagen principal
                    img.addEventListener('click', () => {
                        const mainImage = details.querySelector('.main-image');
                        if (mainImage) {
                            mainImage.src = src;
                            mainImage.alt = img.alt;
                        }
                        
                        // Actualizar la miniatura activa
                        const thumbnails = thumbnailsContainer.querySelectorAll('.thumbnail');
                        thumbnails.forEach(thumb => {
                            thumb.classList.remove('active');
                            thumb.style.opacity = '0.7';
                        });
                        
                        img.classList.add('active');
                        img.style.opacity = '1';
                    });
                    
                    // Verificar si la imagen existe antes de agregarla
                    const tempImg = new Image();
                    tempImg.onload = function() {
                        console.log(`Imagen cargada correctamente: ${src}`);
                        // Añadir la imagen al contenedor
                        thumbnailContainer.appendChild(img);
                        
                        // Si es la primera imagen, establecerla como activa
                        if (index === 0) {
                            img.classList.add('active');
                            // Actualizar la imagen principal
                            const mainImage = details.querySelector('.main-image');
                            if (mainImage) {
                                mainImage.src = src;
                                mainImage.alt = img.alt;
                            }
                        }
                        
                        // Asegurarse de que el contenedor esté oculto inicialmente
                        thumbnailContainer.style.display = 'block';
                        
                        // Agregar el contenedor de la miniatura al DOM
                        thumbnailsContainer.appendChild(thumbnailContainer);
                    };
                    
                    tempImg.onerror = function() {
                        console.error(`Error al cargar la miniatura: ${src}`);
                        // Ocultar el contenedor de la miniatura si la imagen no se carga
                        thumbnailContainer.style.display = 'none';
                    };
                    
                    // Iniciar la carga de la imagen
                    tempImg.src = src;
                });
            }
        } // Cierre del if (details)

        // Poblar Características
        const featuresGrid = document.querySelector('.features-grid');
        if (featuresGrid && data.features && Array.isArray(data.features)) {
            featuresGrid.innerHTML = ''; // Limpiar características existentes
            data.features.forEach(feature => {
                if (feature && feature.icon && feature.title && feature.description) {
                    const item = document.createElement('div');
                    item.className = 'feature-item';
                    item.innerHTML = `
                        <i class="${feature.icon}"></i>
                        <h3>${feature.title}</h3>
                        <p>${feature.description}</p>
                    `;
                    featuresGrid.appendChild(item);
                }
            });
        }

    } catch (error) {
        console.error('Error al renderizar el contenido de la página:', error);
        
        // Mostrar mensaje de error en la consola con más detalles
        console.error('Detalles del error:', {
            error: error.message,
            pageName: pageName,
            jsonFileName: jsonFileName,
            url: window.location.href
        });
        
        // Mostrar mensaje de error en la página
        const body = document.querySelector('body');
        if (body) {
            body.innerHTML = `
                <div style="max-width: 800px; margin: 2rem auto; padding: 2rem; background: #fff3f3; border: 1px solid #ffcdd2; border-radius: 4px;">
                    <h2 style="color: #c62828; margin-top: 0;">Error al cargar la página</h2>
                    <p>Lo sentimos, ha ocurrido un error al cargar el contenido de la página.</p>
                    <p><strong>Detalles:</strong> ${error.message}</p>
                    <p>Por favor, intente recargar la página o póngase en contacto con el administrador del sitio.</p>
                    <button onclick="window.location.reload()" style="background: #c62828; color: white; border: none; padding: 0.5rem 1rem; border-radius: 4px; cursor: pointer;">
                        Recargar Página
                    </button>
                </div>
            `;
        }
    }
}
