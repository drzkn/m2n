#!/usr/bin/env node

const fs = require("fs").promises;
const path = require("path");

// Importar los módulos necesarios (necesitamos compilar TypeScript primero)
async function downloadToMarkdown() {
  try {
    console.log("🚀 Iniciando descarga automática a carpeta markdown...");

    // Verificar que existe la carpeta output/markdown
    const markdownDir = path.join(process.cwd(), "output", "markdown");
    await fs.mkdir(markdownDir, { recursive: true });

    console.log("📁 Carpeta markdown lista:", markdownDir);

    // Aquí importaríamos y ejecutaríamos los casos de uso
    // Por ahora, creamos un ejemplo
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const exampleContent = `# Descarga Automática - ${new Date().toLocaleString(
      "es-ES"
    )}

Este archivo fue generado automáticamente por el script de descarga.

## Instrucciones

Para usar la descarga automática:

1. Ejecuta: \`npm run download-markdown\`
2. Los archivos se guardarán automáticamente en \`output/markdown/\`
3. No se necesita confirmación del navegador

## Próximos pasos

- Integrar con los casos de uso existentes
- Convertir páginas de Notion a Markdown
- Guardar archivos individuales por página
`;

    const filename = `descarga-automatica-${timestamp}.md`;
    const filepath = path.join(markdownDir, filename);

    await fs.writeFile(filepath, exampleContent, "utf8");

    console.log("✅ Archivo creado:", filename);
    console.log("📍 Ubicación:", filepath);
  } catch (error) {
    console.error("❌ Error en descarga automática:", error);
    process.exit(1);
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  downloadToMarkdown();
}

module.exports = { downloadToMarkdown };
