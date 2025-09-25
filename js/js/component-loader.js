
/**
 * Carga un componente HTML desde la carpeta /components y lo inyecta en un elemento del DOM.
 * @param {string} componentPath - La ruta relativa al componente (ej. 'components/header.html').
 * @param {string} targetElementId - El ID del elemento donde se inyectará el HTML.
 * @returns {Promise<void>}
 */
async function loadComponent(componentPath, targetElementId) {
  const targetElement = document.getElementById(targetElementId);
  if (!targetElement) {
    console.error(`Error: Elemento con ID '${targetElementId}' no encontrado.`);
    return;
  }

  try {
    // Asegurarse de que la ruta sea absoluta y manejar correctamente las rutas en producción
    let path;
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      // En desarrollo, usar la ruta relativa al sitio
      path = componentPath.startsWith('/') ? componentPath : `/${componentPath}`;
    } else {
      // En producción, asegurarse de que la ruta sea absoluta desde la raíz
      path = componentPath.startsWith('/') ? componentPath : `/${componentPath}`;
      // Asegurarse de que no haya dobles barras en la URL
      path = path.replace(/([^:]\/)\/+/g, '$1');
    }
    
    console.log(`Cargando componente: ${path}`);
    const response = await fetch(path);
    
    if (!response.ok) {
      throw new Error(`No se pudo cargar el componente: ${path} (${response.status} ${response.statusText})`);
    }
    
    const html = await response.text();
    targetElement.innerHTML = html;
    
    // Ejecutar cualquier script dentro del componente
    const scripts = targetElement.getElementsByTagName('script');
    for (let script of scripts) {
      if (script.src) {
        // Si el script tiene un src, cargarlo dinámicamente
        const newScript = document.createElement('script');
        newScript.src = script.src.startsWith('http') ? script.src : `/${script.src}`;
        document.body.appendChild(newScript);
      } else {
        // Si el script está en línea, ejecutarlo
        try {
          new Function(script.text)();
        } catch (e) {
          console.error('Error ejecutando script:', e);
        }
      }
    }
  } catch (error) {
    console.error(`Error al cargar el componente '${componentPath}':`, error);
    targetElement.innerHTML = `
      <div style="padding: 10px; background: #ffebee; border-left: 4px solid #f44336; margin: 5px 0;">
        <p style="margin: 0; color: #b71c1c;">Error al cargar el componente: ${componentPath}</p>
        <p style="margin: 5px 0 0 0; color: #c62828; font-size: 0.9em;">${error.message}</p>
      </div>
    `;
  }
}
