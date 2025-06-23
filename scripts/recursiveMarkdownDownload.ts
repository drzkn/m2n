#!/usr/bin/env tsx

import { config } from 'dotenv';
config();

import { promises as fs } from 'fs';
import path from 'path';
import { AxiosHttpClient } from '../src/adapters/output/infrastructure/http/AxiosHttpClient';
import { NotionRepository } from '../src/adapters/output/infrastructure/notion/NotionRepository/NotionRepository';
import { QueryDatabaseUseCase } from '../src/domain/usecases/QueryDatabaseUseCase';
import { GetPageUseCase } from '../src/domain/usecases/GetPageUseCase';
import { GetBlockChildrenRecursiveUseCase } from '../src/domain/usecases/GetBlockChildrenRecursiveUseCase';
import { Page } from '../src/domain/entities/Page';
import { Block } from '../src/domain/entities/Block';

interface PageWithBlocks {
  id: string;
  properties: Record<string, unknown>;
  createdTime?: string;
  lastEditedTime?: string;
  url?: string;
  blocks: Block[];
  blocksStats: {
    totalBlocks: number;
    maxDepthReached: number;
    totalApiCalls: number;
  };
  blocksError?: string;
}

// Función helper para extraer el título de una página
const getPageTitle = (page: Page | PageWithBlocks): string => {
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

// Función para convertir bloques a Markdown básico
const convertBlocksToMarkdown = (blocks: Block[], level = 0): string => {
  const indent = '  '.repeat(level);
  let markdown = '';

  for (const block of blocks) {
    switch (block.type) {
      case 'paragraph': {
        const paragraphData = block.data.paragraph as { rich_text?: Array<{ plain_text?: string }> };
        const text = paragraphData?.rich_text?.map(rt => rt.plain_text).join('') || '';
        if (text.trim()) {
          markdown += `${indent}${text}\n\n`;
        }
        break;
      }

      case 'heading_1': {
        const headingData = block.data.heading_1 as { rich_text?: Array<{ plain_text?: string }> };
        const text = headingData?.rich_text?.map(rt => rt.plain_text).join('') || '';
        if (text.trim()) {
          markdown += `${indent}# ${text}\n\n`;
        }
        break;
      }

      case 'heading_2': {
        const headingData = block.data.heading_2 as { rich_text?: Array<{ plain_text?: string }> };
        const text = headingData?.rich_text?.map(rt => rt.plain_text).join('') || '';
        if (text.trim()) {
          markdown += `${indent}## ${text}\n\n`;
        }
        break;
      }

      case 'heading_3': {
        const headingData = block.data.heading_3 as { rich_text?: Array<{ plain_text?: string }> };
        const text = headingData?.rich_text?.map(rt => rt.plain_text).join('') || '';
        if (text.trim()) {
          markdown += `${indent}### ${text}\n\n`;
        }
        break;
      }

      case 'bulleted_list_item': {
        const listData = block.data.bulleted_list_item as { rich_text?: Array<{ plain_text?: string }> };
        const text = listData?.rich_text?.map(rt => rt.plain_text).join('') || '';
        if (text.trim()) {
          markdown += `${indent}- ${text}\n`;
        }
        break;
      }

      case 'numbered_list_item': {
        const listData = block.data.numbered_list_item as { rich_text?: Array<{ plain_text?: string }> };
        const text = listData?.rich_text?.map(rt => rt.plain_text).join('') || '';
        if (text.trim()) {
          markdown += `${indent}1. ${text}\n`;
        }
        break;
      }

      case 'divider': {
        markdown += `${indent}---\n\n`;
        break;
      }

      case 'quote': {
        const quoteData = block.data.quote as { rich_text?: Array<{ plain_text?: string }> };
        const text = quoteData?.rich_text?.map(rt => rt.plain_text).join('') || '';
        if (text.trim()) {
          markdown += `${indent}> ${text}\n\n`;
        }
        break;
      }

      case 'code': {
        const codeData = block.data.code as {
          rich_text?: Array<{ plain_text?: string }>;
          language?: string;
        };
        const text = codeData?.rich_text?.map(rt => rt.plain_text).join('') || '';
        const language = codeData?.language || '';
        if (text.trim()) {
          markdown += `${indent}\`\`\`${language}\n${text}\n\`\`\`\n\n`;
        }
        break;
      }

      default: {
        // Para tipos no manejados, intentar extraer texto básico
        const blockData = block.data[block.type] as { rich_text?: Array<{ plain_text?: string }> };
        if (blockData?.rich_text) {
          const text = blockData.rich_text.map(rt => rt.plain_text).join('') || '';
          if (text.trim()) {
            markdown += `${indent}${text} *(${block.type})*\n\n`;
          }
        } else {
          markdown += `${indent}*[${block.type}]*\n\n`;
        }
        break;
      }
    }

    // Procesar bloques hijos recursivamente
    if (block.children && block.children.length > 0) {
      markdown += convertBlocksToMarkdown(block.children, level + 1);
    }
  }

  return markdown;
};

// Función para crear nombre de archivo seguro
const createSafeFilename = (title: string): string => {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
    .substring(0, 50) || 'sin-titulo';
};

async function recursiveMarkdownDownload() {
  try {
    console.log('🚀 Iniciando descarga recursiva de Notion a Markdown...');

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

    // Crear instancias
    const baseURL = 'https://api.notion.com/v1';
    const defaultHeaders = {
      'Authorization': `Bearer ${notionApiKey}`,
      'Notion-Version': '2022-06-28'
    };

    const httpClient = new AxiosHttpClient(baseURL, defaultHeaders);
    const notionRepository = new NotionRepository(httpClient);
    const queryDatabaseUseCase = new QueryDatabaseUseCase(notionRepository);
    const getPageUseCase = new GetPageUseCase(notionRepository);
    const getBlockChildrenRecursiveUseCase = new GetBlockChildrenRecursiveUseCase(notionRepository);

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

    // Paso 2: Obtener contenido completo de cada página CON bloques recursivos (EN PARALELO)
    console.log('🚀 Obteniendo páginas completas y bloques recursivos en paralelo...');

    const pagePromises = databasePages.map(async (dbPage, index) => {
      try {
        const pageTitle = getPageTitle(dbPage);
        console.log(`📄 Iniciando procesamiento página ${index + 1}/${databasePages.length}: ${pageTitle}`);

        // Obtener página completa
        const fullPage = await getPageUseCase.execute(dbPage.id);

        // Obtener bloques recursivos
        const blocksResult = await getBlockChildrenRecursiveUseCase.execute(fullPage.id, {
          maxDepth: 5,
          includeEmptyBlocks: false,
          delayBetweenRequests: 100 // Reducido porque ahora procesamos en paralelo
        });

        const pageWithBlocks: PageWithBlocks = {
          ...fullPage,
          blocks: blocksResult.blocks,
          blocksStats: {
            totalBlocks: blocksResult.totalBlocks,
            maxDepthReached: blocksResult.maxDepthReached,
            totalApiCalls: blocksResult.apiCallsCount
          }
        };

        console.log(`   ✅ ${pageTitle}: ${blocksResult.totalBlocks} bloques obtenidos (profundidad: ${blocksResult.maxDepthReached})`);

        return { success: true, page: pageWithBlocks, error: null };
      } catch (pageError) {
        const pageTitle = getPageTitle(dbPage);
        const errorMsg = `Error en página ${pageTitle} (${dbPage.id}): ${pageError instanceof Error ? pageError.message : 'Error desconocido'}`;
        console.error(`❌ ${errorMsg}`);
        return { success: false, page: null, error: errorMsg };
      }
    });

    // Ejecutar todas las promesas en paralelo
    console.log('⏳ Esperando que todas las páginas se procesen...');
    const results = await Promise.all(pagePromises);

    // Procesar resultados
    const pagesWithBlocks: PageWithBlocks[] = [];
    const errors: string[] = [];
    let totalBlocks = 0;
    let totalApiCalls = 0;

    results.forEach(result => {
      if (result.success && result.page) {
        pagesWithBlocks.push(result.page);
        totalBlocks += result.page.blocksStats.totalBlocks;
        totalApiCalls += result.page.blocksStats.totalApiCalls;
      } else if (result.error) {
        errors.push(result.error);
      }
    });

    console.log(`✅ Procesadas ${pagesWithBlocks.length}/${databasePages.length} páginas`);
    console.log(`📊 Total de bloques obtenidos: ${totalBlocks}`);
    console.log(`🔄 Total de llamadas API: ${totalApiCalls}`);

    // Paso 3: Convertir a Markdown con bloques recursivos
    console.log('📝 Convirtiendo páginas a Markdown con contenido recursivo...');

    const markdownFiles: Array<{ filename: string; content: string }> = [];

    for (const pageWithBlocks of pagesWithBlocks) {
      const title = getPageTitle(pageWithBlocks);
      const filename = `${createSafeFilename(title)}.md`;

      // Crear contenido Markdown
      let content = `# ${title}\n\n`;

      // Agregar metadatos
      content += `---\n`;
      content += `**ID de Página:** ${pageWithBlocks.id}\n`;
      content += `**Fecha de Creación:** ${pageWithBlocks.createdTime || 'N/A'}\n`;
      content += `**Última Modificación:** ${pageWithBlocks.lastEditedTime || 'N/A'}\n`;
      content += `**Bloques Totales:** ${pageWithBlocks.blocksStats.totalBlocks}\n`;
      content += `**Profundidad Máxima:** ${pageWithBlocks.blocksStats.maxDepthReached}\n`;
      content += `**Llamadas API:** ${pageWithBlocks.blocksStats.totalApiCalls}\n`;
      content += `---\n\n`;

      // Agregar contenido de bloques
      if (pageWithBlocks.blocks.length > 0) {
        content += `## Contenido\n\n`;
        content += convertBlocksToMarkdown(pageWithBlocks.blocks);
      } else {
        content += `*Esta página no tiene contenido de bloques.*\n\n`;
      }

      // Agregar información de error si existe
      if (pageWithBlocks.blocksError) {
        content += `\n---\n**Error en bloques:** ${pageWithBlocks.blocksError}\n`;
      }

      markdownFiles.push({ filename, content });
    }

    // Crear archivo índice mejorado
    const indexContent = `# Índice de Páginas (Contenido Recursivo)\n\n`;
    let indexBody = `**Resumen:**\n`;
    indexBody += `- Total de páginas: ${pagesWithBlocks.length}\n`;
    indexBody += `- Total de bloques: ${totalBlocks}\n`;
    indexBody += `- Total de llamadas API: ${totalApiCalls}\n`;
    indexBody += `- Promedio de bloques por página: ${Math.round(totalBlocks / pagesWithBlocks.length * 100) / 100}\n\n`;

    indexBody += `## Páginas\n\n`;

    for (const pageWithBlocks of pagesWithBlocks) {
      const title = getPageTitle(pageWithBlocks);
      const filename = `${createSafeFilename(title)}.md`;
      indexBody += `- [${title}](${filename}) `;
      indexBody += `*(${pageWithBlocks.blocksStats.totalBlocks} bloques, profundidad ${pageWithBlocks.blocksStats.maxDepthReached})*\n`;
    }

    if (errors.length > 0) {
      indexBody += `\n## Errores\n\n`;
      errors.forEach(error => {
        indexBody += `- ${error}\n`;
      });
    }

    const indexFile = { filename: 'index.md', content: indexContent + indexBody };

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
    console.log('\n🎉 ¡Conversión recursiva completada!');
    console.log(`📁 Ubicación: ${markdownDir}`);
    console.log(`📄 Archivos creados: ${markdownFiles.length + 1} (${markdownFiles.length} páginas + índice)`);
    console.log(`✅ Páginas procesadas: ${pagesWithBlocks.length}/${databasePages.length}`);
    console.log(`📊 Bloques totales procesados: ${totalBlocks}`);
    console.log(`🔄 Llamadas API realizadas: ${totalApiCalls}`);

    if (errors.length > 0) {
      console.log(`⚠️  Errores: ${errors.length}`);
      errors.forEach(error => console.log(`   - ${error}`));
    }

    console.log('\n📝 Archivos Markdown con contenido recursivo guardados en output/markdown/');
  } catch (error) {
    console.error('❌ Error en conversión recursiva:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

// Ejecutar si se llama directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  recursiveMarkdownDownload();
}

export { recursiveMarkdownDownload }; 