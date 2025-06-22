#!/usr/bin/env tsx

import { config } from 'dotenv';
import { AxiosHttpClient } from '../adapters/output/infrastructure/http/AxiosHttpClient';
import { NotionRepository } from '../adapters/output/infrastructure/notion/NotionRepository/NotionRepository';
import { GetBlockChildrenUseCase } from '../domain/usecases/GetBlockChildrenUseCase';
import { QueryDatabaseUseCase } from '../domain/usecases/QueryDatabaseUseCase';
import { Block } from '../domain/entities/Block';

// Cargar variables de entorno
config();

async function demonstrateGetBlockChildren() {
  try {
    console.log('🚀 Demostración de GetBlockChildrenUseCase\n');

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
    const getBlockChildrenUseCase = new GetBlockChildrenUseCase(notionRepository);

    // Paso 1: Obtener una página de la base de datos
    console.log('🔍 Obteniendo páginas de la base de datos...');
    const pages = await queryDatabaseUseCase.execute(databaseId);

    if (pages.length === 0) {
      console.log('❌ No se encontraron páginas en la base de datos');
      return;
    }

    const firstPage = pages[0];
    console.log(`📄 Usando página: ${firstPage.id}`);

    // Paso 2: Obtener los bloques hijos de la página (las páginas son bloques también)
    console.log('\n🔄 Obteniendo bloques hijos de la página...');
    const pageChildren = await getBlockChildrenUseCase.execute(firstPage.id);

    console.log(`📊 Encontrados ${pageChildren.length} bloques hijos en la página`);

    if (pageChildren.length === 0) {
      console.log('ℹ️  Esta página no tiene bloques de contenido');
      return;
    }

    // Paso 3: Mostrar información de los bloques hijos
    console.log('\n📋 Información de los bloques hijos:');
    console.log('='.repeat(50));

    pageChildren.forEach((block, index) => {
      console.log(`\n${index + 1}. Bloque ID: ${block.id}`);
      console.log(`   Tipo: ${block.type}`);
      console.log(`   Tiene hijos: ${block.hasChildren ? 'Sí' : 'No'}`);
      console.log(`   Creado: ${block.createdTime || 'N/A'}`);
      console.log(`   Modificado: ${block.lastEditedTime || 'N/A'}`);

      // Mostrar algunos datos específicos del bloque según su tipo
      if (block.type === 'paragraph' && block.data.paragraph) {
        const paragraphData = block.data.paragraph as { rich_text?: Array<{ plain_text?: string }> };
        const text = paragraphData.rich_text?.map(rt => rt.plain_text).join('') || '';
        console.log(`   Contenido: "${text.substring(0, 100)}${text.length > 100 ? '...' : ''}"`);
      } else if (block.type.startsWith('heading_') && block.data[block.type]) {
        const headingData = block.data[block.type] as { rich_text?: Array<{ plain_text?: string }> };
        const text = headingData.rich_text?.map(rt => rt.plain_text).join('') || '';
        console.log(`   Título: "${text}"`);
      } else if (block.type === 'numbered_list_item' && block.data.numbered_list_item) {
        const listData = block.data.numbered_list_item as { rich_text?: Array<{ plain_text?: string }> };
        const text = listData.rich_text?.map(rt => rt.plain_text).join('') || '';
        console.log(`   Elemento: "${text.substring(0, 80)}${text.length > 80 ? '...' : ''}"`);
      }
    });

    // Paso 4: Explorar bloques que tienen hijos
    const blocksWithChildren = pageChildren.filter(block => block.hasChildren);

    if (blocksWithChildren.length > 0) {
      console.log(`\n🌳 Explorando bloques con hijos (${blocksWithChildren.length} encontrados):`);
      console.log('='.repeat(50));

      for (let i = 0; i < Math.min(blocksWithChildren.length, 3); i++) {
        const parentBlock = blocksWithChildren[i];
        console.log(`\n📂 Bloque padre: ${parentBlock.type} (${parentBlock.id})`);

        try {
          const children = await getBlockChildrenUseCase.execute(parentBlock.id);
          console.log(`   └── Hijos encontrados: ${children.length}`);

          children.forEach((child, childIndex) => {
            console.log(`   ${childIndex + 1}. ${child.type} (${child.id})`);
            if (child.hasChildren) {
              console.log(`      └── Tiene más hijos: Sí`);
            }
          });

          // Pausa para no sobrecargar la API
          await new Promise(resolve => setTimeout(resolve, 300));
        } catch (error) {
          console.log(`   ❌ Error al obtener hijos: ${error instanceof Error ? error.message : 'Error desconocido'}`);
        }
      }
    } else {
      console.log('\nℹ️  No se encontraron bloques con hijos en esta página');
    }

    // Paso 5: Estadísticas finales
    console.log('\n📈 Estadísticas finales:');
    console.log('='.repeat(30));

    const blockTypeCount: Record<string, number> = {};
    let totalWithChildren = 0;

    pageChildren.forEach(block => {
      blockTypeCount[block.type] = (blockTypeCount[block.type] || 0) + 1;
      if (block.hasChildren) totalWithChildren++;
    });

    console.log(`Total de bloques: ${pageChildren.length}`);
    console.log(`Bloques con hijos: ${totalWithChildren}`);
    console.log('Tipos de bloques encontrados:');
    Object.entries(blockTypeCount).forEach(([type, count]) => {
      console.log(`  - ${type}: ${count}`);
    });

    console.log('\n✅ Demostración completada exitosamente!');

  } catch (error) {
    console.error('❌ Error en la demostración:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

// Función helper para formatear la información de un bloque
function formatBlockInfo(block: Block): string {
  const info = [
    `ID: ${block.id}`,
    `Tipo: ${block.type}`,
    `Hijos: ${block.hasChildren ? 'Sí' : 'No'}`
  ];

  if (block.createdTime) {
    info.push(`Creado: ${new Date(block.createdTime).toLocaleString('es-ES')}`);
  }

  return info.join(' | ');
}

// Ejecutar si se llama directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  demonstrateGetBlockChildren();
}

export { demonstrateGetBlockChildren, formatBlockInfo }; 