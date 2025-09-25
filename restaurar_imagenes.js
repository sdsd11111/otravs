const fs = require('fs').promises;
const path = require('path');

async function restaurarImagenes() {
  try {
    // Restaurar nombres de carpetas si existen
    try {
      const panesSource = path.join(__dirname, 'images', 'panes-artesanales');
      const panesDest = path.join(__dirname, 'images', 'panes artesanales');
      
      // Verificar si la carpeta de origen existe
      try {
        await fs.access(panesSource);
        // Si existe, renombrar
        await fs.rename(panesSource, panesDest);
        console.log('Carpeta de panes artesanales restaurada correctamente');
      } catch (e) {
        console.log('La carpeta de panes artesanales ya está en su estado original o no existe');
      }
    } catch (error) {
      console.error('Error al restaurar panes artesanales:', error);
    }

    try {
      const pastelesSource = path.join(__dirname, 'images', 'pasteleria-fina');
      const pastelesDest = path.join(__dirname, 'images', 'Pasteleria fina');
      
      // Verificar si la carpeta de origen existe
      try {
        await fs.access(pastelesSource);
        // Si existe, renombrar
        await fs.rename(pastelesSource, pastelesDest);
        console.log('Carpeta de pastelería fina restaurada correctamente');
      } catch (e) {
        console.log('La carpeta de pastelería fina ya está en su estado original o no existe');
      }
    } catch (error) {
      console.error('Error al restaurar pastelería fina:', error);
    }

    console.log('Proceso de restauración de imágenes completado.');
  } catch (error) {
    console.error('Error al restaurar las imágenes:', error);
  }
}

restaurarImagenes();
