// Configuración de construcción para Vercel
'use strict';

const fs = require('fs');
const path = require('path');

// Directorios requeridos
const requiredDirs = ['css', 'js', 'images', 'data', 'components'];

// Función principal
async function build() {
  try {
    console.log('Verificando estructura de directorios...');
    
    // Crear directorios si no existen
    for (const dir of requiredDirs) {
      const dirPath = path.join(process.cwd(), dir);
      if (!fs.existsSync(dirPath)) {
        console.log(`Creando directorio: ${dir}`);
        fs.mkdirSync(dirPath, { recursive: true });
      }
    }
    
    console.log('Configuración de construcción completada');
    return { success: true };
  } catch (error) {
    console.error('Error durante la construcción:', error);
    return { success: false, error };
  }
}

// Ejecutar construcción
build();
