# Casos de Uso para Obtención de Bloques Hijos

Esta documentación describe los casos de uso implementados para obtener bloques hijos de páginas y bloques en Notion.

## Tabla de Contenidos

- [Casos de Uso Implementados](#casos-de-uso-implementados)
- [GetBlockChildrenUseCase](#getblockchildrenusecase)
- [GetBlockChildrenRecursiveUseCase](#getblockchildrenrecursiveusecase)
- [Ejemplos de Uso](#ejemplos-de-uso)
- [API Reference](#api-reference)

## Casos de Uso Implementados

### 1. GetBlockChildrenUseCase ✅

Obtiene los bloques hijos directos de un bloque específico.

**Características:**

- ✅ Obtención de hijos directos (un nivel)
- ✅ Manejo de errores robusto
- ✅ Validación de parámetros
- ✅ Integración con repositorio Notion

### 2. GetBlockChildrenRecursiveUseCase ✅

Obtiene bloques hijos de manera recursiva, incluyendo toda la jerarquía anidada.

**Características:**

- ✅ Obtención recursiva con control de profundidad
- ✅ Filtrado de bloques vacíos opcional
- ✅ Control de velocidad con pausas configurables
- ✅ Estadísticas detalladas de la operación
- ✅ Versión plana y jerárquica de los resultados
- ✅ Manejo inteligente de errores por bloque

## GetBlockChildrenUseCase

### Descripción

Caso de uso básico para obtener los bloques hijos directos de un bloque específico. Ideal para navegación simple o cuando solo necesitas el primer nivel de contenido.

### Uso Básico

```typescript
import { GetBlockChildrenUseCase } from "../domain/usecases/GetBlockChildrenUseCase";

const getBlockChildrenUseCase = new GetBlockChildrenUseCase(notionRepository);

// Obtener hijos de un bloque
const children = await getBlockChildrenUseCase.execute("block-id-123");

console.log(`Encontrados ${children.length} bloques hijos`);
children.forEach((child) => {
  console.log(`- ${child.type}: ${child.id}`);
});
```

### Casos de Uso Típicos

1. **Navegación de contenido**: Mostrar el contenido inmediato de una página
2. **Listado de secciones**: Obtener encabezados principales de un documento
3. **Validación rápida**: Verificar si un bloque tiene contenido
4. **Procesamiento incremental**: Cargar contenido bajo demanda

### Manejo de Errores

```typescript
try {
  const children = await getBlockChildrenUseCase.execute(blockId);
  // Procesar children...
} catch (error) {
  if (error.message === "Block ID es requerido") {
    console.error("ID de bloque inválido");
  } else {
    console.error("Error de API:", error.message);
  }
}
```

## GetBlockChildrenRecursiveUseCase

### Descripción

Caso de uso avanzado que obtiene toda la jerarquía de bloques de manera recursiva. Perfecto para exportación completa, análisis de contenido o construcción de índices.

### Configuración

```typescript
interface RecursiveBlockOptions {
  maxDepth?: number; // Profundidad máxima (default: 10)
  includeEmptyBlocks?: boolean; // Incluir bloques vacíos (default: true)
  delayBetweenRequests?: number; // Pausa entre requests en ms (default: 200)
}
```

### Uso Básico

```typescript
import { GetBlockChildrenRecursiveUseCase } from "../domain/usecases/GetBlockChildrenRecursiveUseCase";

const recursiveUseCase = new GetBlockChildrenRecursiveUseCase(notionRepository);

// Configuración básica
const result = await recursiveUseCase.execute("page-id-123");

console.log(`Total de bloques: ${result.totalBlocks}`);
console.log(`Profundidad alcanzada: ${result.maxDepthReached}`);
console.log(`Llamadas a la API: ${result.apiCallsCount}`);
```

### Configuración Avanzada

```typescript
// Configuración para exportación rápida
const fastOptions = {
  maxDepth: 5,
  includeEmptyBlocks: false,
  delayBetweenRequests: 0,
};

const result = await recursiveUseCase.execute(pageId, fastOptions);

// Configuración para análisis completo
const completeOptions = {
  maxDepth: 15,
  includeEmptyBlocks: true,
  delayBetweenRequests: 300,
};

const completeResult = await recursiveUseCase.execute(pageId, completeOptions);
```

### Resultado Jerárquico vs Plano

```typescript
// Obtener estructura jerárquica (preserva anidamiento)
const hierarchical = await recursiveUseCase.execute(pageId);
console.log("Bloques principales:", hierarchical.blocks.length);

// Obtener lista plana (todos los bloques en un array)
const flat = await recursiveUseCase.executeFlat(pageId);
console.log("Total de bloques:", flat.length);
```

### Casos de Uso Típicos

1. **Exportación completa**: Obtener todo el contenido de una página
2. **Análisis de estructura**: Entender la organización del contenido
3. **Construcción de índices**: Crear tabla de contenidos automática
4. **Migración de datos**: Transferir contenido completo entre sistemas
5. **Búsqueda profunda**: Encontrar contenido en cualquier nivel de anidamiento

### Optimización de Rendimiento

```typescript
// Para páginas grandes con mucho contenido anidado
const optimizedOptions = {
  maxDepth: 8, // Limitar profundidad
  includeEmptyBlocks: false, // Excluir bloques vacíos
  delayBetweenRequests: 100, // Reducir pausa entre requests
};

// Para análisis completo sin prisa
const thoroughOptions = {
  maxDepth: 20, // Profundidad máxima
  includeEmptyBlocks: true, // Incluir todo
  delayBetweenRequests: 500, // Ser gentil con la API
};
```

## Ejemplos de Uso

### Ejemplo 1: Navegación Simple

```typescript
// Mostrar el contenido principal de una página
const pageChildren = await getBlockChildrenUseCase.execute(pageId);

pageChildren.forEach((block) => {
  if (block.type.startsWith("heading_")) {
    console.log(`📝 ${extractHeadingText(block)}`);
  } else if (block.hasChildren) {
    console.log(
      `📁 ${block.type} (tiene ${block.children?.length || 0} hijos)`
    );
  }
});
```

### Ejemplo 2: Exportación Completa

```typescript
// Exportar toda la estructura de una página
const result = await recursiveUseCase.execute(pageId, {
  maxDepth: 10,
  includeEmptyBlocks: false,
  delayBetweenRequests: 200,
});

console.log(`📊 Exportación completada:`);
console.log(`   - Bloques procesados: ${result.totalBlocks}`);
console.log(`   - Profundidad máxima: ${result.maxDepthReached}`);
console.log(`   - Tiempo estimado: ${result.apiCallsCount * 200}ms`);

// Procesar todos los bloques
const allBlocks = await recursiveUseCase.executeFlat(pageId);
const blockTypes = countBlockTypes(allBlocks);
console.log("Tipos de bloques encontrados:", blockTypes);
```

### Ejemplo 3: Construcción de Índice

```typescript
// Crear tabla de contenidos automática
const result = await recursiveUseCase.execute(pageId);

function buildTableOfContents(blocks: Block[], level = 0): string {
  let toc = "";

  blocks.forEach((block) => {
    if (block.type.startsWith("heading_")) {
      const indent = "  ".repeat(level);
      const text = extractHeadingText(block);
      toc += `${indent}- ${text}\n`;
    }

    if (block.children) {
      toc += buildTableOfContents(block.children, level + 1);
    }
  });

  return toc;
}

const tableOfContents = buildTableOfContents(result.blocks);
console.log("📋 Tabla de Contenidos:\n", tableOfContents);
```

## API Reference

### GetBlockChildrenUseCase

#### Constructor

```typescript
constructor(notionRepository: INotionRepository)
```

#### Métodos

##### execute(blockId: string): Promise<Block[]>

Obtiene los bloques hijos directos de un bloque.

**Parámetros:**

- `blockId` (string): ID del bloque padre

**Retorna:**

- `Promise<Block[]>`: Array de bloques hijos

**Errores:**

- `Error`: Si blockId está vacío o es inválido
- `Error`: Si hay problemas de conectividad con la API

### GetBlockChildrenRecursiveUseCase

#### Constructor

```typescript
constructor(notionRepository: INotionRepository)
```

#### Métodos

##### execute(blockId: string, options?: RecursiveBlockOptions): Promise<RecursiveBlockResult>

Obtiene bloques hijos de manera recursiva.

**Parámetros:**

- `blockId` (string): ID del bloque padre
- `options` (RecursiveBlockOptions, opcional): Configuración de la operación

**Retorna:**

- `Promise<RecursiveBlockResult>`: Resultado con bloques y estadísticas

##### executeFlat(blockId: string, options?: RecursiveBlockOptions): Promise<Block[]>

Obtiene todos los bloques en una lista plana.

**Parámetros:**

- `blockId` (string): ID del bloque padre
- `options` (RecursiveBlockOptions, opcional): Configuración de la operación

**Retorna:**

- `Promise<Block[]>`: Array plano con todos los bloques

### Tipos

#### RecursiveBlockOptions

```typescript
interface RecursiveBlockOptions {
  maxDepth?: number; // Default: 10
  includeEmptyBlocks?: boolean; // Default: true
  delayBetweenRequests?: number; // Default: 200
}
```

#### RecursiveBlockResult

```typescript
interface RecursiveBlockResult {
  blocks: Block[]; // Bloques en estructura jerárquica
  totalBlocks: number; // Total de bloques incluyendo anidados
  maxDepthReached: number; // Profundidad máxima alcanzada
  apiCallsCount: number; // Número de llamadas a la API realizadas
}
```

## Scripts Disponibles

```bash
# Ejemplo básico de obtención de hijos
npm run example:get-block-children

# Ejemplo avanzado recursivo
npm run example:get-block-children:recursive

# Ejecutar tests
npm test -- GetBlockChildrenUseCase.test.ts
```

## Consideraciones de Rendimiento

### Límites de la API de Notion

- **Rate Limiting**: Notion limita a ~3 requests por segundo
- **Timeout**: Requests pueden tardar hasta 30 segundos
- **Paginación**: Máximo 100 bloques por request

### Recomendaciones

1. **Usar pausas**: Configure `delayBetweenRequests` para evitar rate limiting
2. **Limitar profundidad**: Use `maxDepth` para contenido muy anidado
3. **Filtrar contenido**: Use `includeEmptyBlocks: false` para reducir volumen
4. **Monitorear estadísticas**: Use `apiCallsCount` para estimar tiempos

### Ejemplo de Configuración Óptima

```typescript
// Para contenido pequeño a mediano (< 100 bloques)
const smallContentOptions = {
  maxDepth: 5,
  includeEmptyBlocks: false,
  delayBetweenRequests: 100,
};

// Para contenido grande (> 500 bloques)
const largeContentOptions = {
  maxDepth: 8,
  includeEmptyBlocks: false,
  delayBetweenRequests: 300,
};

// Para análisis completo sin límites de tiempo
const completeAnalysisOptions = {
  maxDepth: 15,
  includeEmptyBlocks: true,
  delayBetweenRequests: 500,
};
```
