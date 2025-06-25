# Configuración de Supabase para M2N

Esta guía te ayudará a configurar y usar Supabase para almacenar las páginas de Notion convertidas a Markdown.

## 🚀 Configuración inicial

### 1. Configurar variables de entorno

Crea un archivo `.env` en la raíz del proyecto con las siguientes variables:

```bash
# Supabase Configuration
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-clave-anonima-aqui

# Para uso en Node.js (scripts)
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_ANON_KEY=tu-clave-anonima-aqui
```

### 2. Ejecutar migraciones

Para crear las tablas necesarias en tu base de datos de Supabase:

```bash
# Iniciar Supabase localmente (opcional para desarrollo)
npx supabase start

# Aplicar migraciones
npx supabase db push
```

## 📊 Estructura de la base de datos

### Tabla `markdown_pages`

```sql
CREATE TABLE markdown_pages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  notion_page_id TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  notion_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  notion_created_time TIMESTAMP WITH TIME ZONE,
  notion_last_edited_time TIMESTAMP WITH TIME ZONE,
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  metadata JSONB DEFAULT '{}'::JSONB
);
```

**Campos:**

- `id`: UUID único de la página en Supabase
- `notion_page_id`: ID de la página original en Notion
- `title`: Título extraído de la página
- `content`: Contenido convertido a Markdown
- `notion_url`: URL de la página en Notion
- `created_at/updated_at`: Timestamps de Supabase
- `notion_created_time/notion_last_edited_time`: Timestamps de Notion
- `tags`: Array de tags extraídos de las propiedades
- `metadata`: JSON con metadatos adicionales

## 🛠️ Uso de la infraestructura

### Importar servicios

```typescript
import { container } from "../infrastructure/di/container";

const { supabaseMarkdownService, supabaseMarkdownRepository } = container;
```

### Convertir y guardar una página

```typescript
import { Page } from "../domain/entities/Page";

// Obtener página de Notion
const page: Page = await getPageUseCase.execute("notion-page-id");

// Convertir y guardar en Supabase
const savedPage = await supabaseMarkdownService.convertAndSavePage(page, true);

console.log("Página guardada:", savedPage.title);
```

### Convertir y guardar múltiples páginas

```typescript
const pages: Page[] = [
  /* array de páginas */
];

// Procesar todas las páginas
const results = await supabaseMarkdownService.convertAndSavePages(pages, true);

console.log(`Procesadas ${results.length} páginas`);
```

### Consultar páginas guardadas

```typescript
// Obtener todas las páginas
const allPages = await supabaseMarkdownService.getAllStoredPages({
  limit: 10,
  orderBy: "created_at",
  orderDirection: "desc",
});

// Buscar por ID de Notion
const page = await supabaseMarkdownService.getStoredPage("notion-page-id");

// Buscar por texto
const searchResults = await supabaseMarkdownService.searchStoredPages(
  "mi búsqueda",
  {
    limit: 5,
  }
);
```

### Usar el repositorio directamente

```typescript
import { MarkdownPageInsert } from "../adapters/output/infrastructure/supabase";

// Crear página manualmente
const newPage: MarkdownPageInsert = {
  notion_page_id: "unique-id",
  title: "Mi página",
  content: "# Contenido en Markdown",
  tags: ["tag1", "tag2"],
  metadata: { custom: "data" },
};

const savedPage = await supabaseMarkdownRepository.save(newPage);

// Actualizar página existente
await supabaseMarkdownRepository.update(savedPage.id, {
  title: "Título actualizado",
});

// Hacer upsert (insertar o actualizar)
await supabaseMarkdownRepository.upsert(newPage);
```

## 🎯 Ejemplos de uso

### Ejecutar ejemplo básico

```bash
npx tsx src/examples/supabaseExample.ts
```

### Script personalizado

```typescript
import { container } from "./src/infrastructure/di/container";

async function syncNotionToSupabase() {
  const { supabaseMarkdownService, getDatabaseUseCase } = container;

  // Obtener páginas de una base de datos
  const pages = await getDatabaseUseCase.execute("database-id");

  // Convertir y guardar todas
  const results = await supabaseMarkdownService.convertAndSavePages(
    pages,
    true
  );

  console.log(`✅ Sincronizadas ${results.length} páginas`);
}
```

## 🔧 Configuración avanzada

### Políticas de seguridad (RLS)

Las tablas tienen Row Level Security habilitado. Para producción, ajusta las políticas según tus necesidades:

```sql
-- Ejemplo: Solo lectores autenticados
CREATE POLICY "Authenticated users can read" ON markdown_pages
  FOR SELECT USING (auth.role() = 'authenticated');
```

### Índices personalizados

Para mejorar el rendimiento en búsquedas específicas:

```sql
-- Índice para búsqueda por tags
CREATE INDEX idx_markdown_pages_tags_gin ON markdown_pages USING gin(tags);

-- Índice para búsqueda full-text en español
CREATE INDEX idx_markdown_pages_search ON markdown_pages
  USING gin(to_tsvector('spanish', title || ' ' || content));
```

### Backup y restauración

```bash
# Hacer backup
npx supabase db dump -f backup.sql

# Restaurar backup
npx supabase db reset --db-url "postgresql://..."
```

## 🚨 Troubleshooting

### Error: Variables de entorno no configuradas

- Verifica que `SUPABASE_URL` y `SUPABASE_ANON_KEY` estén configuradas
- En desarrollo usa `VITE_` prefix para variables del navegador

### Error: Tabla no existe

- Ejecuta las migraciones: `npx supabase db push`
- Verifica la conexión a la base de datos

### Error: Permisos insuficientes

- Revisa las políticas RLS en Supabase Dashboard
- Asegúrate de usar la clave correcta (anon vs service_role)

### Error de conversión de tipos

- Verifica que los tipos TypeScript coincidan con el schema de la base de datos
- Regenera los tipos: `npx supabase gen types typescript`

## 📚 Recursos adicionales

- [Documentación de Supabase](https://supabase.com/docs)
- [Guía de migraciones](https://supabase.com/docs/guides/database/migrations)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
