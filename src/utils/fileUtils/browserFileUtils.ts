import { MarkdownFile } from '../../services/markdownConverter';

/**
 * Descarga un archivo de texto en el navegador
 */
export function downloadTextFile(filename: string, content: string, mimeType: string = 'text/plain'): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.style.display = 'none';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  // Limpiar la URL del objeto
  URL.revokeObjectURL(url);
}

/**
 * Descarga un archivo Markdown
 */
export function downloadMarkdownFile(markdownFile: MarkdownFile): void {
  downloadTextFile(markdownFile.filename, markdownFile.content, 'text/markdown');
}

/**
 * Descarga múltiples archivos Markdown como un ZIP (simulado con múltiples descargas)
 */
export function downloadMarkdownFiles(markdownFiles: MarkdownFile[]): void {
  markdownFiles.forEach((file, index) => {
    // Añadir un pequeño delay entre descargas para evitar problemas del navegador
    setTimeout(() => {
      downloadMarkdownFile(file);
    }, index * 500); // 500ms entre cada descarga
  });
}

/**
 * Crea un archivo ZIP simulado concatenando todos los archivos
 * (Para una implementación real de ZIP, se necesitaría una librería como JSZip)
 */
export function downloadMarkdownFilesAsBundle(markdownFiles: MarkdownFile[], bundleName: string = 'notion-export'): void {
  const timestamp = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  const filename = `${bundleName}-${timestamp}.txt`;

  let bundleContent = `# Exportación de Notion a Markdown\n`;
  bundleContent += `Generado el: ${new Date().toLocaleString('es-ES')}\n`;
  bundleContent += `Total de archivos: ${markdownFiles.length}\n\n`;
  bundleContent += `${'='.repeat(80)}\n\n`;

  markdownFiles.forEach((file, index) => {
    bundleContent += `# ARCHIVO ${index + 1}: ${file.filename}\n`;
    bundleContent += `${'='.repeat(50)}\n\n`;
    bundleContent += file.content;
    bundleContent += `\n\n${'='.repeat(80)}\n\n`;
  });

  downloadTextFile(filename, bundleContent, 'text/plain');
} 