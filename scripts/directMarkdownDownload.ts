#!/usr/bin/env tsx

import { config } from 'dotenv';
config();

import { promises as fs } from 'fs';
import path from 'path';
import { AxiosHttpClient } from '../src/adapters/output/infrastructure/http/AxiosHttpClient';
import { NotionRepository } from '../src/adapters/output/infrastructure/notion/NotionRepository/NotionRepository';
import { QueryDatabaseUseCase } from '../src/domain/usecases/QueryDatabaseUseCase';
import { GetPageUseCase } from '../src/domain/usecases/GetPageUseCase';
import { MarkdownConverterService } from '../src/services/markdownConverter';
import { Page } from '../src/domain/entities/Page';

// Función helper para extraer el título de una página
const getPageTitle = (page: Page): string => {
  try {
    const properties = page.properties;
    const titleKeys = ['title', 'Title', 'Name', 'name', 'Título'];

    for (const key of titleKeys) {
      if (properties[key]) {
        const prop = properties[key] as {
          title?: { plain_text?: string; text?: { content?: string } }[];
          rich_text?: { plain_text?: string; text?: { content?: string } }[];
        };

        if (prop?.title && Array.isArray(prop.title) && prop.title.length > 0) {
          return prop.title[0]?.plain_text || prop.title[0]?.text?.content || '';
        }
        if (prop?.rich_text && Array.isArray(prop.rich_text) && prop.rich_text.length > 0) {
          return prop.rich_text[0]?.plain_text || prop.rich_text[0]?.text?.content || '';
        }
      }
    }

    return `Página ${page.id.substring(0, 8)}`;
  } catch {
    return `Página ${page.id.substring(0, 8)}`;
  }
};

async function directMarkdownDownload() {
  try {
    console.log('🚀 Iniciando descarga directa de Notion a Markdown...');

    // Verificar variables de entorno
    const notionApiKey = process.env.NOTION_API_KEY || process.env.VITE_NOTION_API_KEY;
    const databaseId = process.env.NOTION_DATABASE_ID || process.env.VITE_NOTION_DATABASE_ID;

    if (!notionApiKey) {
      throw new Error('NOTION_API_KEY o VITE_NOTION_API_KEY no está configurado');
    }

    if (!databaseId) {
      throw new Error('NOTION_DATABASE_ID o VITE_NOTION_DATABASE_ID no está configurado');
    }

    console.log('✅ Variables de entorno configuradas');

    // Crear instancias directamente (como en config.examples.ts)
    const baseURL = 'https://api.notion.com/v1';
    const defaultHeaders = {
      'Authorization': `Bearer ${notionApiKey}`,
      'Notion-Version': '2022-06-28'
    };

    const httpClient = new AxiosHttpClient(baseURL, defaultHeaders);
    const notionRepository = new NotionRepository(httpClient);
    const queryDatabaseUseCase = new QueryDatabaseUseCase(notionRepository);
    const getPageUseCase = new GetPageUseCase(notionRepository);

    // Crear carpeta de destino
    const markdownDir = path.join(process.cwd(), 'output', 'markdown');
    await fs.mkdir(markdownDir, { recursive: true });

    console.log('📁 Carpeta markdown lista:', markdownDir);

    // Paso 1: Obtener páginas de la base de datos
    console.log('🔍 Consultando base de datos...');
    const databasePages = await queryDatabaseUseCase.execute(databaseId);

    if (!databasePages || databasePages.length === 0) {
      throw new Error('No se encontraron páginas en la base de datos');
    }

    console.log(`✅ Encontradas ${databasePages.length} páginas`);

    // Paso 2: Obtener contenido completo de cada página
    const fullPages: Page[] = [];
    const errors: string[] = [];

    for (let i = 0; i < databasePages.length; i++) {
      const dbPage = databasePages[i];
      try {
        const pageTitle = getPageTitle(dbPage);
        console.log(`📄 Procesando página ${i + 1}/${databasePages.length}: ${pageTitle}`);

        const fullPage = await getPageUseCase.execute(dbPage.id);
        fullPages.push(fullPage);

        // Pequeña pausa para no sobrecargar la API
        await new Promise(resolve => setTimeout(resolve, 200));
      } catch (pageError) {
        const errorMsg = `Error en página ${dbPage.id}: ${pageError instanceof Error ? pageError.message : 'Error desconocido'}`;
        errors.push(errorMsg);
        console.error(`❌ ${errorMsg}`);
      }
    }

    console.log(`✅ Procesadas ${fullPages.length}/${databasePages.length} páginas`);

    // Paso 3: Convertir a Markdown
    console.log('📝 Convirtiendo páginas a Markdown...');
    const markdownConverter = new MarkdownConverterService();

    // Convertir páginas individuales
    const markdownFiles = markdownConverter.convertPagesToMarkdown(fullPages);

    // Crear archivo índice
    const indexFile = markdownConverter.generateIndexFile(fullPages);

    // Paso 4: Guardar archivos
    console.log('💾 Guardando archivos...');

    // Guardar índice
    await fs.writeFile(
      path.join(markdownDir, indexFile.filename),
      indexFile.content,
      'utf8'
    );
    console.log(`✅ Guardado: ${indexFile.filename}`);

    // Guardar páginas individuales
    for (const markdownFile of markdownFiles) {
      await fs.writeFile(
        path.join(markdownDir, markdownFile.filename),
        markdownFile.content,
        'utf8'
      );
      console.log(`✅ Guardado: ${markdownFile.filename}`);
    }

    // Resumen final
    console.log('\n🎉 ¡Conversión completada!');
    console.log(`📁 Ubicación: ${markdownDir}`);
    console.log(`📄 Archivos creados: ${markdownFiles.length + 1} (${markdownFiles.length} páginas + índice)`);
    console.log(`✅ Páginas procesadas: ${fullPages.length}/${databasePages.length}`);

    if (errors.length > 0) {
      console.log(`⚠️  Errores: ${errors.length}`);
      errors.forEach(error => console.log(`   - ${error}`));
    }

    console.log('\n📝 Archivos Markdown guardados automáticamente en output/markdown/');
  } catch (error) {
    console.error('❌ Error en conversión:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

// Ejecutar si se llama directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  directMarkdownDownload();
}

export { directMarkdownDownload }; 