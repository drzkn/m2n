import 'dotenv/config';
import { getDatabaseUseCase, getUserUseCase, queryDatabaseUseCase, getPageUseCase } from '../infrastructure/di/container';
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

// Tipo para errores de Notion
interface NotionError {
  response?: {
    status?: number;
    data?: {
      message?: string;
      code?: string;
      request_id?: string;
    };
  };
}

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

    // Obtener información de la base de datos usando el caso de uso
    const databaseInfo = await getDatabaseUseCase.execute(databaseId);
    console.log('✅GetDatabaseUseCase');

    // Consultar la base de datos usando el caso de uso
    const databaseQuery = await queryDatabaseUseCase.execute(databaseId);
    console.log('✅QueryDatabaseUseCase');

    // Obtener información del usuario usando el caso de uso
    const userInfo = await getUserUseCase.execute();
    console.log('✅GetUserUseCase');

    // Obtener una página específica usando el caso de uso (ejemplo con la primera página)
    let pageInfo = null;
    if (databaseQuery.length > 0) {
      const firstPageId = databaseQuery[0].id;
      pageInfo = await getPageUseCase.execute(firstPageId);
      console.log('✅GetPageUseCase');
    }

    // Guardar los resultados en un archivo JSON
    const outputDir = path.join(getDirname(), '../../output');

    console.log('Volcando el contenido ⏳⏳⏳⏳⏳⏳')
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const outputPath = path.join(outputDir, `notion-query.json`);

    const outputData = {
      'databaseInfo': databaseInfo.toJSON(),
      'userInfo': userInfo.toJSON(),
      'databaseQuery': databaseQuery.map(page => page.toJSON()),
      'pageInfo': pageInfo ? pageInfo.toJSON() : null,
      timestamp: new Date().toISOString()
    };

    fs.writeFileSync(outputPath, JSON.stringify(outputData, null, 2));
    console.log(`\nResultados guardados en: ${outputPath}`);

    console.log('\n📊 Resumen de la conexión:');
    console.log(`- Base de datos: ${databaseInfo.title} (${databaseInfo.id})`);
    console.log(`- Usuario: ${userInfo.name || 'Sin nombre'} (${userInfo.id})`);
    console.log(`- Páginas encontradas: ${databaseQuery.length}`);
    if (pageInfo) {
      console.log(`- Página obtenida: ${pageInfo.id}`);
    }

  } catch (error) {
    console.error('Error en la prueba:', error);

    if (error && typeof error === 'object' && 'response' in error) {
      const notionError = error as NotionError;
      console.error('Detalles del error de Notion:');
      console.error(`- Status: ${notionError.response?.status}`);
      console.error(`- Mensaje: ${notionError.response?.data?.message}`);
      console.error(`- Código: ${notionError.response?.data?.code}`);
      console.error(`- Request ID: ${notionError.response?.data?.request_id}`);
    }
  }
}

// Ejecutar la prueba
testNotionConnection(); 