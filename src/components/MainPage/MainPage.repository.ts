import { Page } from "../../domain/entities/Page";
import { container } from "../../infrastructure/di/container";

export class MainPageRepository {
  private databaseId: string;
  private handleProcessing: React.Dispatch<React.SetStateAction<boolean>>;
  private handleProgress: React.Dispatch<React.SetStateAction<{
    current: number;
    total: number;
    currentPageTitle: string;
  } | null>>;

  constructor(databaseId: string, handleProcessing: React.Dispatch<React.SetStateAction<boolean>>, handleProgress: React.Dispatch<React.SetStateAction<{
    current: number;
    total: number;
    currentPageTitle: string;
  } | null>>,) {
    this.databaseId = databaseId;
    this.handleProgress = handleProgress
    this.handleProcessing = handleProcessing;
  }

  private log(level: 'info' | 'success' | 'warn' | 'error', message: string, data?: unknown) {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] [MARKDOWN-${level.toUpperCase()}] ${message}`;

    switch (level) {
      case 'info':
        console.log(`ℹ️ ${logMessage}`, data || '');
        break;
      case 'success':
        console.log(`✅ ${logMessage}`, data || '');
        break;
      case 'warn':
        console.warn(`⚠️ ${logMessage}`, data || '');
        break;
      case 'error':
        console.error(`❌ ${logMessage}`, data || '');
        break;
    }
  };

  private extractPageTitle(page: unknown): string {
    try {
      const pageObj = page as { properties?: Record<string, unknown>; id?: string };
      const properties = pageObj.properties;

      if (properties?.title && typeof properties.title === 'object' && properties.title !== null) {
        const titleProp = properties.title as { title?: Array<{ plain_text?: string }> };
        if (titleProp.title) {
          return titleProp.title
            .map((item) => item.plain_text || '')
            .join('')
            .trim() || 'Sin título';
        }
      }

      if (properties) {
        for (const [, value] of Object.entries(properties)) {
          if (typeof value === 'object' && value !== null) {
            const prop = value as { title?: Array<{ plain_text?: string }> };
            if (prop.title && Array.isArray(prop.title)) {
              return prop.title
                .map((item) => item.plain_text || '')
                .join('')
                .trim() || 'Sin título';
            }
          }
        }
      }

      return `Página ${pageObj.id?.slice(0, 8) || 'unknown'}...`;
    } catch {
      const pageObj = page as { id?: string };
      return `Página ${pageObj.id?.slice(0, 8) || 'unknown'}...`;
    }
  };

  async handleSyncToMarkdown() {
    this.handleProcessing(true);
    this.handleProgress(null);
    this.log('info', `🚀 Iniciando conversión a markdown para base de datos: ${this.databaseId}`);

    try {
      this.log('info', '📊 Obteniendo páginas de la base de datos...');
      const pages = await container.queryDatabaseUseCase.execute(this.databaseId);
      this.log('success', `📄 Encontradas ${pages.length} páginas en la base de datos`);

      if (pages.length === 0) {
        this.log('warn', 'No se encontraron páginas en la base de datos');
        return;
      }

      const markdownFiles: Array<{
        pageId: string;
        title: string;
        markdown: string;
        blocksCount: number;
        stats: { totalBlocks: number; maxDepth: number; apiCalls: number }
      }> = [];

      this.log('info', `🚀 Procesando ${pages.length} páginas en paralelo...`);

      let completedPages = 0;
      const processPage = async (page: unknown, index: number) => {
        const pageTitle = this.extractPageTitle(page);
        this.log('info', `📃 [${index + 1}/${pages.length}] Iniciando procesamiento de: ${pageTitle}`);

        try {
          this.log('info', `🌳 Obteniendo bloques recursivos para: ${(page as { id: string }).id}`);
          const blocksResult = await container.getBlockChildrenRecursiveUseCase.execute((page as { id: string }).id, {
            maxDepth: 5,
            includeEmptyBlocks: false,
            delayBetweenRequests: 150
          });

          this.log('success', `🧱 [${pageTitle}] Obtenidos ${blocksResult.totalBlocks} bloques (profundidad máxima: ${blocksResult.maxDepthReached}, ${blocksResult.apiCallsCount} llamadas API)`);

          this.log('info', `📝 [${pageTitle}] Convirtiendo a markdown...`);
          const markdownContent = container.markdownConverterService.convertPageWithBlocksToMarkdown(page as Page, blocksResult.blocks);

          const markdownFile = {
            pageId: (page as { id: string }).id,
            title: pageTitle,
            markdown: typeof markdownContent === 'string' ? markdownContent : markdownContent.content,
            blocksCount: blocksResult.totalBlocks,
            stats: {
              totalBlocks: blocksResult.totalBlocks,
              maxDepth: blocksResult.maxDepthReached,
              apiCalls: blocksResult.apiCallsCount
            }
          };

          completedPages++;
          this.handleProgress({
            current: completedPages,
            total: pages.length,
            currentPageTitle: `Completadas: ${completedPages}/${pages.length}`
          });

          this.log('success', `✅ [${completedPages}/${pages.length}] Página "${pageTitle}" convertida a markdown (${blocksResult.totalBlocks} bloques)`);
          return markdownFile;

        } catch (error) {
          completedPages++;
          this.handleProgress({
            current: completedPages,
            total: pages.length,
            currentPageTitle: `Completadas: ${completedPages}/${pages.length} (con errores)`
          });

          this.log('error', `❌ Error procesando página ${pageTitle}: ${error instanceof Error ? error.message : 'Error desconocido'}`, error);
          return null;
        }
      };

      const results = await Promise.all(
        pages.map((page, index) => processPage(page, index))
      );

      const successfulResults = results.filter((result): result is NonNullable<typeof result> => result !== null);
      markdownFiles.push(...successfulResults);

      this.log('info', '📋 Mostrando archivos markdown generados:');
      console.log('\n🎉 ===== ARCHIVOS MARKDOWN GENERADOS ===== 🎉\n');

      markdownFiles.forEach((file, index) => {
        console.log(`\n📄 =============== ARCHIVO ${index + 1}/${markdownFiles.length} ===============`);
        console.log(`📝 Título: ${file.title}`);
        console.log(`🆔 Page ID: ${file.pageId}`);
        console.log(`🧱 Bloques: ${file.blocksCount}`);
        console.log(`📊 Estadísticas:`, file.stats);
        console.log(`\n📋 CONTENIDO MARKDOWN:\n`);
        console.log(file.markdown);
        console.log(`\n📄 =============== FIN ARCHIVO ${index + 1} ===============\n`);
      });

      const totalBlocks = markdownFiles.reduce((sum, file) => sum + file.blocksCount, 0);
      const totalApiCalls = markdownFiles.reduce((sum, file) => sum + file.stats.apiCalls, 0);

      this.log('success', `🎉 Conversión completada: ${markdownFiles.length} archivos, ${totalBlocks} bloques totales, ${totalApiCalls} llamadas API`);

      console.log(`🎉 ¡Conversión completada!\n\n` +
        `📄 ${markdownFiles.length} páginas procesadas\n` +
        `🧱 ${totalBlocks} bloques convertidos\n` +
        `⚡ ${totalApiCalls} llamadas a la API\n\n` +
        `📋 Revisa la consola (F12) para ver todos los archivos markdown generados.`);

    } catch (error) {
      this.log('error', `💥 Error crítico: ${error instanceof Error ? error.message : 'Error desconocido'}`, error);
      alert(`❌ Error en la conversión: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    } finally {
      this.handleProcessing(false);
      this.handleProgress(null);
    }
  };
}