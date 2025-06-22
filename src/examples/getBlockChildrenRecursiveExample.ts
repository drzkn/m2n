#!/usr/bin/env tsx

import { config } from 'dotenv';
import { AxiosHttpClient } from '../adapters/output/infrastructure/http/AxiosHttpClient';
import { NotionRepository } from '../adapters/output/infrastructure/notion/NotionRepository/NotionRepository';
import { GetBlockChildrenRecursiveUseCase, RecursiveBlockOptions } from '../domain/usecases/GetBlockChildrenRecursiveUseCase';
import { QueryDatabaseUseCase } from '../domain/usecases/QueryDatabaseUseCase';
import { Block } from '../domain/entities/Block';

// Cargar variables de entorno
config();

async function demonstrateRecursiveBlockChildren() {
  try {
    console.log('🚀 Demostración de GetBlockChildrenRecursiveUseCase\n');

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
    const getBlockChildrenRecursiveUseCase = new GetBlockChildrenRecursiveUseCase(notionRepository);

    // Paso 1: Obtener una página de la base de datos
    console.log('🔍 Obteniendo páginas de la base de datos...');
    const pages = await queryDatabaseUseCase.execute(databaseId);

    if (pages.length === 0) {
      console.log('❌ No se encontraron páginas en la base de datos');
      return;
    }

    const targetPage = pages[0]; // Usar la primera página
    console.log(`📄 Usando página: ${targetPage.id}`);

    // Paso 2: Obtener bloques de manera recursiva
    console.log('\n🔄 Obteniendo bloques de manera recursiva...');
    const options: RecursiveBlockOptions = {
      maxDepth: 5,
      includeEmptyBlocks: true,
      delayBetweenRequests: 200
    };

    const startTime = Date.now();
    const result = await getBlockChildrenRecursiveUseCase.execute(targetPage.id, options);
    const endTime = Date.now();
    const duration = endTime - startTime;

    console.log(`📊 Resultados:`);
    console.log(`   - Bloques obtenidos: ${result.blocks.length}`);
    console.log(`   - Total de bloques (incluyendo anidados): ${result.totalBlocks}`);
    console.log(`   - Profundidad máxima alcanzada: ${result.maxDepthReached}`);
    console.log(`   - Llamadas a la API: ${result.apiCallsCount}`);
    console.log(`   - Tiempo de ejecución: ${duration}ms`);

    // Mostrar estructura jerárquica
    if (result.blocks.length > 0) {
      console.log(`\n🌳 Estructura jerárquica:`);
      result.blocks.forEach((block, index) => {
        printBlockHierarchy(block, `${index + 1}.`, 0);
      });
    }

    // Obtener versión plana
    console.log(`\n📋 Obteniendo versión plana...`);
    const flatBlocks = await getBlockChildrenRecursiveUseCase.executeFlat(targetPage.id, options);
    console.log(`   - Bloques en lista plana: ${flatBlocks.length}`);

    // Mostrar tipos de bloques encontrados
    const blockTypes = getBlockTypeStatistics(flatBlocks);
    console.log(`\n📈 Tipos de bloques encontrados:`);
    Object.entries(blockTypes)
      .sort(([, a], [, b]) => b - a)
      .forEach(([type, count]) => {
        console.log(`   - ${type}: ${count}`);
      });

    console.log('\n✅ Demostración completada exitosamente!');

  } catch (error) {
    console.error('❌ Error en la demostración:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

// Función para imprimir la jerarquía de bloques
function printBlockHierarchy(block: Block, prefix: string, depth: number): void {
  const indent = '  '.repeat(depth);
  const blockInfo = getBlockContent(block);

  console.log(`${indent}${prefix} ${block.type} - ${blockInfo}`);

  if (block.children && block.children.length > 0) {
    block.children.forEach((child, index) => {
      printBlockHierarchy(child, `${index + 1}.`, depth + 1);
    });
  }
}

// Función para obtener contenido resumido de un bloque
function getBlockContent(block: Block): string {
  try {
    switch (block.type) {
      case 'paragraph': {
        const data = block.data.paragraph as { rich_text?: Array<{ plain_text?: string }> };
        const text = data?.rich_text?.map(rt => rt.plain_text).join('') || '';
        return text.length > 0 ? `"${text.substring(0, 50)}${text.length > 50 ? '...' : ''}"` : '(vacío)';
      }
      case 'heading_1':
      case 'heading_2':
      case 'heading_3': {
        const data = block.data[block.type] as { rich_text?: Array<{ plain_text?: string }> };
        const text = data?.rich_text?.map(rt => rt.plain_text).join('') || '';
        return text.length > 0 ? `"${text}"` : '(sin título)';
      }
      case 'bulleted_list_item':
      case 'numbered_list_item': {
        const data = block.data[block.type] as { rich_text?: Array<{ plain_text?: string }> };
        const text = data?.rich_text?.map(rt => rt.plain_text).join('') || '';
        return text.length > 0 ? `"${text.substring(0, 40)}${text.length > 40 ? '...' : ''}"` : '(elemento vacío)';
      }
      default:
        return `(${block.type})`;
    }
  } catch {
    return '(error al obtener contenido)';
  }
}

// Función para obtener estadísticas de tipos de bloques
function getBlockTypeStatistics(blocks: Block[]): Record<string, number> {
  const stats: Record<string, number> = {};

  blocks.forEach(block => {
    stats[block.type] = (stats[block.type] || 0) + 1;
  });

  return stats;
}

// Ejecutar si se llama directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  demonstrateRecursiveBlockChildren();
}

export { demonstrateRecursiveBlockChildren }; 