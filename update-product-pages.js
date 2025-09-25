const fs = require('fs');
const path = require('path');

// Lista de páginas de productos a actualizar
const productPages = [
    'panes-artesanales.html',
    'pasteleria-fina.html',
    'pan-dulce-tradicional.html',
    'bebidas-acompanamientos.html',
    'especiales-temporada.html'
];

// Plantilla actualizada para las páginas de productos
const updatedTemplate = `    <!-- Scripts -->
    <script src="/js/component-loader.js"></script>
    <script src="/js/content-renderer.js"></script>
    <script>
        document.addEventListener("DOMContentLoaded", async () => {
            try {
                // Cargar todos los componentes HTML reutilizables
                await Promise.all([
                    loadComponent('components/header.html', 'header-container'),
                    loadComponent('components/footer.html', 'footer-container'),
                    loadComponent('components/testimonios.html', 'testimonios-container'),
                    loadComponent('components/formulario_contacto.html', 'contacto-container')
                ]);

                // Una vez cargados los componentes, renderizar el contenido específico de la página
                if (typeof renderPageContent === 'function') {
                    await renderPageContent();
                } else {
                    console.error('La función renderPageContent no está definida');
                }

                // Cargar el script principal que maneja la interactividad general
                const mainScript = document.createElement('script');
                mainScript.src = '/js/script.js';
                document.body.appendChild(mainScript);

                // Lógica para la galería de la página de producto
                const mainImage = document.getElementById('main-product-image');
                const thumbnailsContainer = document.querySelector('.thumbnail-images');
                
                if (mainImage && thumbnailsContainer) {
                    thumbnailsContainer.addEventListener('click', function(e) {
                        if (e.target.tagName === 'IMG') {
                            mainImage.src = e.target.src;
                            // Actualizar la clase activa
                            thumbnailsContainer.querySelectorAll('img').forEach(t => t.classList.remove('active'));
                            e.target.classList.add('active');
                        }
                    });
                }
            } catch (error) {
                console.error('Error al cargar la página:', error);
            }
        });
    </script>`;

// Función para actualizar una página de producto
function updateProductPage(pageName) {
    const filePath = path.join(__dirname, pageName);
    
    try {
        // Leer el contenido del archivo
        let content = fs.readFileSync(filePath, 'utf8');
        
        // Reemplazar la sección de scripts
        const scriptRegex = /<script[\s\S]*?<\/script>/;
        content = content.replace(scriptRegex, updatedTemplate);
        
        // Escribir el archivo actualizado
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`✅ ${pageName} actualizado correctamente`);
    } catch (error) {
        console.error(`❌ Error al actualizar ${pageName}:`, error.message);
    }
}

// Actualizar todas las páginas de productos
productPages.forEach(updateProductPage);
