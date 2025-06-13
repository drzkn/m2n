# Markdown to Notion Sync

Una herramienta para sincronizar contenido entre archivos Markdown y Notion, permitiendo mantener actualizado tu conocimiento en ambas plataformas.

## Características

- Convertir archivos Markdown a páginas de Notion
- Exportar páginas de Notion a archivos Markdown
- Sincronización bidireccional
- Soporte para:
  - Encabezados (H1, H2, H3)
  - Párrafos
  - Listas (ordenadas y no ordenadas)
  - Bloques de código

## Instalación

1. Clona el repositorio:

```bash
git clone https://github.com/tu-usuario/markdown-to-notion.git
cd markdown-to-notion
```

2. Instala las dependencias:

```bash
npm install
```

3. Crea un archivo `.env` basado en `.env.example`:

```bash
cp .env.example .env
```

4. Configura las variables de entorno en el archivo `.env`:

- `NOTION_TOKEN`: Tu token de API de Notion
- `NOTION_DATABASE_ID`: ID de la base de datos de Notion donde se crearán las páginas
- `MARKDOWN_DIR`: Directorio donde se almacenarán los archivos Markdown

## Uso

### Sincronizar un archivo Markdown a Notion

```bash
npm run sync-to-notion -- ./markdown/ejemplo.md
```

### Exportar una página de Notion a Markdown

```bash
npm run sync-to-markdown -- page_id_here
```

### Sincronizar todos los archivos Markdown

```bash
npm run sync-all
```

## Estructura del Proyecto

```
markdown-to-notion/
├── src/
│   ├── services/
│   │   └── notionService.js
│   ├── utils/
│   │   └── markdownUtils.js
│   └── index.js
├── markdown/
├── .env
├── .env.example
├── package.json
└── README.md
```

## Contribuir

Las contribuciones son bienvenidas. Por favor, abre un issue para discutir los cambios propuestos o envía un pull request.

## Licencia

ISC
