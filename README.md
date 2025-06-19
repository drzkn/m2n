# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default tseslint.config({
  extends: [
    // Remove ...tseslint.configs.recommended and replace with this
    ...tseslint.configs.recommendedTypeChecked,
    // Alternatively, use this for stricter rules
    ...tseslint.configs.strictTypeChecked,
    // Optionally, add this for stylistic rules
    ...tseslint.configs.stylisticTypeChecked,
  ],
  languageOptions: {
    // other options...
    parserOptions: {
      project: ["./tsconfig.node.json", "./tsconfig.app.json"],
      tsconfigRootDir: import.meta.dirname,
    },
  },
});
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from "eslint-plugin-react-x";
import reactDom from "eslint-plugin-react-dom";

export default tseslint.config({
  plugins: {
    // Add the react-x and react-dom plugins
    "react-x": reactX,
    "react-dom": reactDom,
  },
  rules: {
    // other rules...
    // Enable its recommended typescript rules
    ...reactX.configs["recommended-typescript"].rules,
    ...reactDom.configs.recommended.rules,
  },
});
```

# M2N - Notion to Markdown

Aplicación para convertir contenido de Notion a Markdown utilizando una arquitectura hexagonal.

## 🚀 Funcionalidades

### ✅ Implementadas

- **🏗️ Arquitectura Hexagonal Completa**: Separación clara entre dominio, adaptadores e infraestructura
- **📊 Consulta de Bases de Datos**: Obtener páginas de una base de datos de Notion
- **📄 Obtención de Páginas**: Recuperar contenido completo de páginas individuales
- **👤 Información de Usuario**: Obtener datos del usuario actual de Notion
- **🔧 Inyección de Dependencias**: Contenedor DI automático multi-entorno
- **🧪 Tests Unitarios**: Cobertura completa de casos de uso y repositorios
- **📱 Interfaz Web**: UI React para interactuar con la aplicación
- **💾 Exportación de Datos**: Procesamiento completo y descarga automática de resultados
- **📝 Conversión a Markdown**: Transformación automática de páginas de Notion a formato Markdown
- **📁 Descarga Automática**: Guardado directo en carpeta local sin confirmación del navegador

### 🆕 Nueva Funcionalidad: Conversión Automática a Markdown

La aplicación ahora incluye un **sistema completo de conversión a Markdown** que permite:

#### 🎯 Descarga Automática a Carpeta Local

**¡Sin confirmación del navegador!** Ejecuta el comando y los archivos se guardan automáticamente:

```bash
npm run download-markdown
```

Este comando:

1. **🔍 Consulta** todas las páginas de tu base de datos de Notion
2. **📄 Procesa** cada página obteniendo su contenido completo
3. **📝 Convierte** cada página a formato Markdown con metadatos
4. **💾 Guarda automáticamente** todos los archivos en `output/markdown/`
5. **📋 Genera un índice** con enlaces a todas las páginas

#### 📁 Archivos Generados

- **`INDEX.md`**: Índice principal con enlaces a todas las páginas
- **`pagina-titulo.md`**: Una página Markdown por cada página de Notion

#### 📝 Formato de Archivos Markdown

Cada archivo incluye:

```markdown
---
title: "Título de la Página"
notion_id: "abc123..."
created: "2024-01-15T10:30:00.000Z"
updated: "2024-01-15T14:45:00.000Z"
notion_url: "https://www.notion.so/..."
exported: "2024-01-15T15:00:00.000Z"
---

# Título de la Página

## Metadatos

- **ID de Notion:** `abc123...`
- **Fecha de creación:** 15/1/2024, 11:30:00
- **URL en Notion:** [Ver página](https://...)

## Propiedades

### Estado

✅ Sí

### Prioridad

Alta

## Contenido

_Contenido de la página..._
```

### 🆕 Funcionalidad: Procesamiento Completo de Base de Datos

La aplicación ahora incluye una funcionalidad avanzada que:

1. **📋 Consulta la base de datos** para obtener todas las páginas
2. **🔄 Procesa cada página individualmente** obteniendo su contenido completo
3. **📊 Muestra progreso en tiempo real** durante el procesamiento
4. **💾 Guarda automáticamente** los resultados en un archivo JSON
5. **🎯 Maneja errores** de forma robusta, continuando con las páginas restantes

#### Características del Procesamiento:

- **⏱️ Indicador de Progreso**: Muestra el estado actual del procesamiento
- **📈 Resumen Detallado**: Estadísticas de páginas procesadas y errores
- **🗂️ Vista Organizada**: Separación entre datos de base de datos y páginas completas
- **💿 Descarga Automática**: El archivo JSON se descarga automáticamente al finalizar
- **🛡️ Manejo de Errores**: Si una página falla, continúa con las demás
- **⏳ Control de Rate Limiting**: Pausa de 200ms entre peticiones para no sobrecargar la API

#### Formato del Archivo Exportado:

```json
{
  "timestamp": "2024-01-15T10:30:00.000Z",
  "summary": {
    "totalPages": 10,
    "processedPages": 9,
    "errors": ["Error en página abc123: API timeout"]
  },
  "databasePages": [
    /* páginas de la consulta inicial */
  ],
  "fullPages": [
    /* páginas con contenido completo */
  ]
}
```

## 🏛️ Arquitectura

### Capas Implementadas

- **🎯 Dominio**: Entidades (`Database`, `Page`, `User`) y Casos de Uso
- **🔌 Puertos**: Interfaces (`INotionRepository`, `IHttpClient`)
- **🔧 Adaptadores**: Implementaciones (`NotionRepository`, `AxiosHttpClient`)
- **🏗️ Infraestructura**: Configuración y contenedor DI

### Casos de Uso Disponibles

- `GetDatabaseUseCase`: Obtener información de una base de datos
- `GetPageUseCase`: Obtener contenido completo de una página
- `GetUserUseCase`: Obtener información del usuario actual
- `QueryDatabaseUseCase`: Consultar páginas de una base de datos

## 🛠️ Configuración

### Variables de Entorno

Crea un archivo `.env` con:

```env
VITE_NOTION_API_KEY=tu_api_key_de_notion
VITE_NOTION_DATABASE_ID=id_de_tu_base_de_datos
```

### Configuración Multi-Entorno

La aplicación detecta automáticamente el entorno:

- **Node.js** (tests): URL directa a Notion API
- **Browser Development**: Proxy de Vite (`/api/notion/v1`)
- **Browser Production**: URL directa a Notion API

## 🚀 Comandos Disponibles

```bash
# Desarrollo
npm run dev

# Conversión a Markdown (¡NUEVO!)
npm run download-markdown        # Descarga automática a output/markdown/
npm run download-markdown:simple # Script simple de ejemplo

# Tests
npm test
npm run test:connection

# Construcción
npm run build
npm run preview

# Linting
npm run lint

# Visualizar diagramas de arquitectura
npm run diagrams
```

## 🧪 Testing

El proyecto incluye tests unitarios completos:

- ✅ **9 suites de tests**
- ✅ **47 tests** en total
- ✅ Cobertura de casos de uso
- ✅ Cobertura de repositorios
- ✅ Tests de integración

```bash
npm test                 # Ejecutar todos los tests
npm run test:connection  # Test de conexión con Notion
```

## 📁 Estructura del Proyecto

```
src/
├── domain/                    # 🎯 DOMINIO
│   ├── entities/             # Database, Page, User
│   └── usecases/             # Casos de uso principales
├── ports/                    # 🔌 PUERTOS
│   └── output/               # Interfaces de repositorios y servicios
├── adapters/                 # 🔧 ADAPTADORES
│   ├── input/web/           # Componentes React
│   └── output/infrastructure/ # Implementaciones
├── infrastructure/          # 🏗️ INFRAESTRUCTURA
│   └── di/                  # Contenedor de dependencias
└── shared/                  # 🔄 COMPARTIDO
    └── types/               # Tipos de Notion
```

## 🔧 Resolución de Problemas

### CORS en Desarrollo

El proyecto incluye configuración de proxy en `vite.config.ts` que resuelve automáticamente los problemas de CORS redirigiendo `/api/notion` a `https://api.notion.com`.

### Rate Limiting

La aplicación incluye control automático de rate limiting con pausas entre peticiones para evitar sobrecargar la API de Notion.

## 📚 Documentación Adicional

- [Diagramas de Arquitectura](diagrams.html) - Visualización de la arquitectura hexagonal
- [Casos de Uso](src/domain/usecases/) - Lógica de negocio
- [Tests](src/**/__tests__/) - Ejemplos de uso y casos de prueba

## 🤝 Contribución

El proyecto sigue principios de Clean Architecture y SOLID. Para contribuir:

1. Mantén la separación de capas
2. Escribe tests para nuevas funcionalidades
3. Sigue las convenciones de TypeScript
4. Actualiza la documentación
