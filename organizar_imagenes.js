const fs = require('fs').promises;
const path = require('path');

async function moveImages() {
  try {
    // Crear directorios si no existen
    await fs.mkdir(path.join(__dirname, 'images', 'panes-artesanales'), { recursive: true });
    await fs.mkdir(path.join(__dirname, 'images', 'pasteleria-fina'), { recursive: true });
    await fs.mkdir(path.join(__dirname, 'images', 'pan-dulce-tradicional'), { recursive: true });
    await fs.mkdir(path.join(__dirname, 'images', 'bebidas-acompanamientos'), { recursive: true });
    await fs.mkdir(path.join(__dirname, 'images', 'especiales-temporada'), { recursive: true });

    // Mover imágenes de panes artesanales
    try {
      const panesSource = path.join(__dirname, 'images', 'panes artesanales');
      const panesDest = path.join(__dirname, 'images', 'panes-artesanales');
      await fs.rename(panesSource, panesDest);
      console.log('Carpeta de panes artesanales renombrada correctamente');
    } catch (e) {
      console.log('La carpeta de panes artesanales ya está en el formato correcto o no existe');
    }

    // Mover imágenes de pastelería fina
    try {
      const pastelesSource = path.join(__dirname, 'images', 'Pasteleria fina');
      const pastelesDest = path.join(__dirname, 'images', 'pasteleria-fina');
      await fs.rename(pastelesSource, pastelesDest);
      console.log('Carpeta de pastelería fina renombrada correctamente');
    } catch (e) {
      console.log('La carpeta de pastelería fina ya está en el formato correcto o no existe');
    }

    console.log('Proceso de organización de imágenes completado.');
  } catch (error) {
    console.error('Error al organizar las imágenes:', error);
  }
}

moveImages();
