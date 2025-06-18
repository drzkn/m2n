import 'dotenv/config';
import { getUser } from '../services/getUser';
import { getDatabase } from '../services';
import { queryDatabase } from '../services';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

// Función para obtener variables de entorno compatibles con Vite y Node.js
const getEnvVar = (key: string): string | undefined => {
  // En Vite, usar import.meta.env
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    return import.meta.env[key];
  }
  // En Node.js, usar process.env
  return process.env[key];
};

// Función para obtener __dirname en ESM
const getDirname = () => {
  return path.dirname(fileURLToPath(import.meta.url));
};

async function testNotionConnection() {
  try {
    const databaseId = getEnvVar('NOTION_DATABASE_ID');
    const apiKey = getEnvVar('NOTION_API_KEY');

    console.log('API Key configurada:', apiKey ? 'Sí' : 'No');
    console.log('Database ID configurado:', databaseId ? 'Sí' : 'No');

    if (!databaseId) {
      throw new Error('NOTION_DATABASE_ID no está configurado en las variables de entorno');
    }

    if (!apiKey) {
      throw new Error('NOTION_API_KEY no está configurado en las variables de entorno');
    }

    // Obtener información de la base de datos
    const databaseInfo = await getDatabase(databaseId);
    console.log('✅getDatabase');

    // Obtener información de la base de datos
    const databaseQuery = await queryDatabase(databaseId);
    console.log('✅queryDatabase');

    // Consultar la base de datos
    const userInfo = await getUser();
    console.log('✅getUser');

    // Guardar los resultados en un archivo JSON
    const outputDir = path.join(getDirname(), '../../output');

    console.log('Volcando el contenido ⏳⏳⏳⏳⏳⏳')
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const outputPath = path.join(outputDir, `notion-query.json`);

    const outputData = {
      'databaseInfo': databaseInfo,
      'userInfo': userInfo,
      'databaseQuery': databaseQuery,
      timestamp: new Date().toISOString()
    };

    fs.writeFileSync(outputPath, JSON.stringify(outputData, null, 2));
    console.log(`\nResultados guardados en: ${outputPath}`);

  } catch (error) {
    console.error('Error en la prueba:', error);
  }
}

// Ejecutar la prueba
testNotionConnection(); 