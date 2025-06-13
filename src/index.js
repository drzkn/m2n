require("dotenv").config();
const NotionService = require("./services/notionService");
const MarkdownUtils = require("./utils/markdownUtils");
const path = require("path");

class MarkdownNotionSync {
  constructor() {
    this.notionService = new NotionService(process.env.NOTION_TOKEN);
    this.markdownDir = process.env.MARKDOWN_DIR || "./markdown";
  }

  // Sincronizar desde Markdown a Notion
  async syncToNotion(markdownFile) {
    try {
      const content = await MarkdownUtils.readMarkdownFile(markdownFile);
      const title = path.basename(markdownFile, ".md");

      const response = await this.notionService.createPageFromMarkdown(
        process.env.NOTION_DATABASE_ID,
        title,
        content
      );

      console.log(`✅ Página creada en Notion: ${response.url}`);
      return response;
    } catch (error) {
      console.error("❌ Error al sincronizar con Notion:", error.message);
      throw error;
    }
  }

  // Sincronizar desde Notion a Markdown
  async syncToMarkdown(pageId) {
    try {
      const markdown = await this.notionService.blocksToMarkdown(pageId);
      const fileName = `${pageId}.md`;
      const filePath = path.join(this.markdownDir, fileName);

      await MarkdownUtils.writeMarkdownFile(filePath, markdown);
      console.log(`✅ Archivo Markdown creado: ${filePath}`);
      return filePath;
    } catch (error) {
      console.error("❌ Error al sincronizar con Markdown:", error.message);
      throw error;
    }
  }

  // Sincronizar todos los archivos Markdown
  async syncAllMarkdownToNotion() {
    try {
      const files = await MarkdownUtils.listMarkdownFiles(this.markdownDir);
      console.log(
        `📝 Encontrados ${files.length} archivos Markdown para sincronizar`
      );

      for (const file of files) {
        const filePath = path.join(this.markdownDir, file);
        await this.syncToNotion(filePath);
      }

      console.log("✅ Sincronización completada");
    } catch (error) {
      console.error("❌ Error en la sincronización:", error.message);
      throw error;
    }
  }
}

// Ejemplo de uso
async function main() {
  const sync = new MarkdownNotionSync();

  // Sincronizar un archivo específico a Notion
  // await sync.syncToNotion('./markdown/ejemplo.md');

  // Sincronizar una página de Notion a Markdown
  // await sync.syncToMarkdown('page_id_here');

  // Sincronizar todos los archivos Markdown
  // await sync.syncAllMarkdownToNotion();
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = MarkdownNotionSync;
