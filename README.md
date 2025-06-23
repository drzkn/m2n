# M2N - Notion to Markdown Converter

Un conversor de páginas de Notion a archivos Markdown utilizando arquitectura hexagonal con **visualizador integrado**.

## Características

- 🏗️ **Arquitectura Hexagonal**: Separación clara de responsabilidades
- 🔄 **Conversión automática**: De Notion a Markdown
- 📖 **Visualizador integrado**: Ver archivos Markdown directamente en la web
- 📁 **Descarga directa**: Archivos guardados automáticamente en carpeta local
- 🎯 **Sin confirmación**: Descarga automática sin popups del navegador
- 🔍 **Búsqueda**: Filtrar archivos por nombre o título
- 🎨 **Syntax Highlighting**: Código resaltado en el visualizador
- 📊 **Interfaz React**: UI moderna y responsive
- ⚡ **TypeScript**: Tipado fuerte y mejor experiencia de desarrollo

## Estructura del Proyecto

```
src/
├── domain/           # Entidades y lógica de negocio
├── ports/           # Interfaces (contratos)
├── adapters/        # Implementaciones concretas
├── services/        # Servicios de aplicación
├── infrastructure/ # Configuración e inyección de dependencias
├── components/     # Componentes React
│   ├── MainPage/   # Página principal
│   └── MarkdownViewer/ # Visualizador de Markdown
└── utils/          # Utilidades
```

## Configuración

1. Copia el archivo de ejemplo de configuración:

```bash
cp src/examples/config.examples.ts src/config/config.ts
```

2. Configura tus variables de entorno en `.env`:

```env
VITE_NOTION_API_KEY=tu_notion_api_key
VITE_NOTION_DATABASE_ID=tu_database_id
```

## Uso

### Interfaz Web con Visualizador

1. Ejecuta la aplicación:

```bash
npm run dev
```

2. Abre tu navegador en `http://localhost:5173`

3. Haz clic en "Procesar Base de Datos"

4. Una vez procesado, haz clic en "📖 Ver Archivos Markdown"

5. **¡Nuevo!** El visualizador te permite:
   - 📋 Ver el índice con enlaces a todas las páginas
   - 🔍 Buscar archivos por nombre o título
   - 📄 Navegar entre páginas con un clic
   - 🎨 Ver código con syntax highlighting
   - 🔗 Seguir enlaces internos entre páginas

### Scripts de Terminal

#### Descarga Básica

Para descarga directa a la carpeta `output/markdown/`:

```bash
npm run download-markdown
```

#### Descarga Recursiva (Recomendado)

Para descarga con **obtención recursiva de bloques** a la carpeta `output/markdown/`:

```bash
npm run download-markdown:recursive
```

**¡Nuevo!** Esta versión incluye:

- 🌳 **Obtención recursiva**: Obtiene todos los bloques hijos de cada página
- 📊 **Estadísticas detalladas**: Información sobre bloques, profundidad, y llamadas API
- 📝 **Contenido completo**: Convierte bloques a Markdown (párrafos, títulos, listas, código, etc.)
- 🔍 **Metadatos enriquecidos**: Incluye estadísticas de procesamiento
- ⚡ **Optimizado**: Control de velocidad para evitar rate limits

#### Archivos Generados

Ambos scripts generan archivos en `output/markdown/`:

**Descarga básica:**

- `index.md` - Índice con enlaces a todas las páginas
- `[titulo-pagina].md` - Metadatos de cada página

**Descarga recursiva:**

- `index.md` - Índice con estadísticas completas
- `[titulo-pagina].md` - Contenido completo con todos los bloques convertidos a Markdown

> 💡 **Nota:** El script recursivo sobrescribirá los archivos de la descarga básica, proporcionando archivos más completos.

### Abrir Índice en Navegador

```bash
npm run open-index
```

## Comandos Disponibles

- `npm run dev` - Ejecutar en modo desarrollo
- `npm run build` - Construir para producción
- `npm run preview` - Vista previa de la build
- `npm run download-markdown` - Descargar archivos Markdown (básico)
- `npm run download-markdown:recursive` - Descargar con contenido recursivo (recomendado)
- `npm run open-index` - Abrir index.md en navegador
- `npm test` - Ejecutar tests

## Tecnologías

- **React** + **TypeScript** - Frontend
- **Vite** - Build tool
- **Tailwind CSS** - Estilos
- **React Markdown** - Renderizado de Markdown
- **Highlight.js** - Syntax highlighting
- **Jest** - Testing
- **Notion API** - Integración con Notion

## Visualizador de Markdown

El nuevo visualizador incluye:

### Características del Visualizador

- **📋 Sidebar navegable**: Lista todos los archivos con búsqueda
- **🔍 Búsqueda en tiempo real**: Filtra por nombre de archivo o título
- **📄 Vista previa completa**: Renderiza Markdown con estilos
- **🎨 Syntax highlighting**: Código resaltado automáticamente
- **🔗 Enlaces internos**: Navega entre páginas sin salir del visualizador
- **📱 Responsive**: Funciona en dispositivos móviles
- **⚡ Carga rápida**: Archivos en memoria, sin necesidad de descargar

### Navegación

- Haz clic en cualquier archivo del sidebar para verlo
- Usa la búsqueda para filtrar archivos
- Los enlaces internos (a otros archivos .md) abren la página correspondiente
- Los enlaces externos se abren en nueva pestaña

## Arquitectura

El proyecto sigue los principios de **Arquitectura Hexagonal** (Ports & Adapters):

- **Domain**: Entidades de negocio (`Page`, `Database`, `User`)
- **Ports**: Interfaces que definen contratos
- **Adapters**: Implementaciones concretas (Notion API, HTTP, File System)
- **Use Cases**: Lógica de aplicación
- **Infrastructure**: Configuración e inyección de dependencias

## Flujo de Conversión

1. **Consulta**: Se obtienen las páginas de la base de datos de Notion
2. **Procesamiento**: Se obtiene el contenido completo de cada página
3. **Conversión**: Se convierten las páginas a formato Markdown
4. **Generación**: Se crea un archivo índice con enlaces
5. **Visualización**: Se muestran en el visualizador web integrado
6. **Descarga**: Se guardan los archivos automáticamente (opcional)

## Formato de Salida

Cada archivo Markdown incluye:

- **Frontmatter** con metadatos (título, ID, fechas, URL)
- **Título principal** extraído de las propiedades
- **Sección de metadatos** con información de Notion
- **Propiedades** procesadas y formateadas
- **Contenido** (en futuras versiones incluirá bloques)

## Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para más detalles.
