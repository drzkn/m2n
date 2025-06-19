import { queryDatabaseUseCase, getPageUseCase } from "../../infrastructure/di/container"
import notionLogo from '../../assets/notion.svg'
import markdownLogo from '../../assets/markdown.svg';
import './MainPage.css'
import { useState } from 'react';
import { Page } from "../../domain/entities/Page";
import { MarkdownConverterService } from "../../services/markdownConverter";
import { downloadMarkdownFilesAsBundle } from "../../utils/fileUtils";

interface ProcessedResult {
  databasePages: Page[];
  fullPages: Page[];
  summary: {
    totalPages: number;
    processedPages: number;
    errors: string[];
  };
}

// Función helper para extraer el título de una página
const getPageTitle = (page: Page): string => {
  try {
    // Buscar propiedades que puedan contener el título
    const properties = page.properties;

    // Buscar por nombres comunes de título
    const titleKeys = ['title', 'Title', 'Name', 'name', 'Título'];

    for (const key of titleKeys) {
      if (properties[key]) {
        const prop = properties[key] as {
          title?: { plain_text?: string; text?: { content?: string } }[];
          rich_text?: { plain_text?: string; text?: { content?: string } }[];
        };

        if (prop?.title && Array.isArray(prop.title) && prop.title.length > 0) {
          return prop.title[0]?.plain_text || prop.title[0]?.text?.content || '';
        }
        if (prop?.rich_text && Array.isArray(prop.rich_text) && prop.rich_text.length > 0) {
          return prop.rich_text[0]?.plain_text || prop.rich_text[0]?.text?.content || '';
        }
      }
    }

    // Si no encontramos título, usar el ID truncado
    return `Página ${page.id.substring(0, 8)}...`;
  } catch {
    return `Página ${page.id.substring(0, 8)}...`;
  }
};

export const MainPage: React.FC = () => {
  const [result, setResult] = useState<ProcessedResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [progress, setProgress] = useState<string>('')

  const saveToFile = async (data: ProcessedResult) => {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

      // 1. Guardar archivo JSON (como antes)
      const jsonFilename = `notion-export-${timestamp}.json`;
      const exportData = {
        timestamp: new Date().toISOString(),
        summary: data.summary,
        databasePages: data.databasePages.map(page => page.toJSON()),
        fullPages: data.fullPages.map(page => page.toJSON())
      };

      // Crear un blob con los datos JSON
      const jsonBlob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: 'application/json'
      });

      // Crear un enlace de descarga para JSON
      const jsonUrl = URL.createObjectURL(jsonBlob);
      const jsonLink = document.createElement('a');
      jsonLink.href = jsonUrl;
      jsonLink.download = jsonFilename;

      // Simular clic para descargar JSON
      document.body.appendChild(jsonLink);
      jsonLink.click();
      document.body.removeChild(jsonLink);
      URL.revokeObjectURL(jsonUrl);

      // 2. Convertir y guardar archivos Markdown
      const markdownConverter = new MarkdownConverterService();

      // Convertir páginas completas a Markdown
      const markdownFiles = markdownConverter.convertPagesToMarkdown(data.fullPages);

      // Crear archivo índice
      const indexFile = markdownConverter.generateIndexFile(data.fullPages);

      // Agregar el índice al principio de la lista
      const allMarkdownFiles = [indexFile, ...markdownFiles];

      // Descargar como bundle (un solo archivo)
      downloadMarkdownFilesAsBundle(allMarkdownFiles, `notion-export-${timestamp}`);

      console.log(`Archivos guardados: ${jsonFilename} y ${allMarkdownFiles.length} archivos Markdown`);
    } catch (err) {
      console.error('Error al guardar archivo:', err);
    }
  };

  const handleProcessDatabase = async () => {
    setLoading(true)
    setError(null)
    setResult(null)
    setProgress('')

    try {
      const databaseId = import.meta.env.VITE_NOTION_DATABASE_ID

      if (!databaseId) {
        throw new Error('NOTION_DATABASE_ID no está configurado en las variables de entorno')
      }

      // Paso 1: Obtener páginas de la base de datos
      setProgress('🔍 Consultando base de datos...')
      const databasePages = await queryDatabaseUseCase.execute(databaseId)

      if (!databasePages || databasePages.length === 0) {
        throw new Error('No se encontraron páginas en la base de datos')
      }

      setProgress(`✅ Encontradas ${databasePages.length} páginas. Obteniendo contenido completo...`)

      // Paso 2: Obtener contenido completo de cada página
      const fullPages: Page[] = []
      const errors: string[] = []
      let processedCount = 0

      for (const dbPage of databasePages) {
        try {
          const pageTitle = getPageTitle(dbPage);
          setProgress(`📄 Procesando página ${processedCount + 1}/${databasePages.length}: ${pageTitle}`)

          const fullPage = await getPageUseCase.execute(dbPage.id)
          fullPages.push(fullPage)
          processedCount++

          // Pequeña pausa para no sobrecargar la API
          await new Promise(resolve => setTimeout(resolve, 200))
        } catch (pageError) {
          const errorMsg = `Error en página ${dbPage.id}: ${pageError instanceof Error ? pageError.message : 'Error desconocido'}`
          errors.push(errorMsg)
          console.error(errorMsg, pageError)
        }
      }

      // Paso 3: Preparar resultado
      const processedResult: ProcessedResult = {
        databasePages,
        fullPages,
        summary: {
          totalPages: databasePages.length,
          processedPages: fullPages.length,
          errors
        }
      }

      setResult(processedResult)
      setProgress(`🎉 Procesamiento completo: ${fullPages.length}/${databasePages.length} páginas`)

      // Paso 4: Guardar archivo
      await saveToFile(processedResult)

    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Error al procesar la base de datos'
      setError(errorMessage)
      console.error('Error:', err)
    } finally {
      setLoading(false)
      setProgress('')
    }
  }

  return (
    <>
      <div>
        <a href="https://notion.so" target="_blank">
          <img src={notionLogo} className="logo notion" alt="Notion Logo" />
        </a>
        <a href="https://docs.github.com/es/get-started/writing-on-github/getting-started-with-writing-and-formatting-on-github/basic-writing-and-formatting-syntax" target="_blank">
          <img src={markdownLogo} className="logo markdown" alt="Markdown Logo" />
        </a>
      </div>
      <h1>Notion 2 Markdown</h1>
      <div className="card">
        <button
          onClick={handleProcessDatabase}
          disabled={loading}
          style={{
            backgroundColor: loading ? '#ccc' : '#646cff',
            color: 'white',
            padding: '12px 24px',
            fontSize: '16px',
            border: 'none',
            borderRadius: '8px',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? 'Procesando...' : 'Procesar Base de Datos'}
        </button>

        {progress && (
          <div style={{
            marginTop: '15px',
            padding: '10px',
            backgroundColor: '#646cff',
            borderRadius: '5px',
            fontSize: '14px'
          }}>
            {progress}
          </div>
        )}

        {error && (
          <div style={{
            color: 'red',
            marginTop: '10px',
            padding: '10px',
            backgroundColor: 'red',
            borderRadius: '5px'
          }}>
            <strong>Error:</strong> {error}
          </div>
        )}

        {result && (
          <div style={{ marginTop: '20px', textAlign: 'left' }}>
            <h3>📊 Resumen del Procesamiento</h3>
            <div style={{
              backgroundColor: '#646cff',
              padding: '15px',
              borderRadius: '8px',
              marginBottom: '15px'
            }}>
              <p><strong>📄 Total de páginas:</strong> {result.summary.totalPages}</p>
              <p><strong>✅ Páginas procesadas:</strong> {result.summary.processedPages}</p>
              <p><strong>❌ Errores:</strong> {result.summary.errors.length}</p>
              {result.summary.errors.length > 0 && (
                <details style={{ marginTop: '10px' }}>
                  <summary style={{ cursor: 'pointer', color: '#d73a49' }}>
                    Ver errores ({result.summary.errors.length})
                  </summary>
                  <ul style={{ marginTop: '5px', fontSize: '12px' }}>
                    {result.summary.errors.map((error, index) => (
                      <li key={index} style={{ color: '#d73a49', marginBottom: '2px' }}>
                        {error}
                      </li>
                    ))}
                  </ul>
                </details>
              )}
            </div>

            <h4>🗃️ Páginas de la Base de Datos</h4>
            <details style={{ marginBottom: '15px' }}>
              <summary style={{ cursor: 'pointer', marginBottom: '10px' }}>
                Ver páginas encontradas ({result.databasePages.length})
              </summary>
              <pre style={{
                fontSize: '11px',
                overflow: 'auto',
                backgroundColor: '#d411d811',
                padding: '10px',
                borderRadius: '5px',
                maxHeight: '200px'
              }}>
                {JSON.stringify(result.databasePages.map(page => ({
                  id: page.id,
                  title: getPageTitle(page),
                  createdTime: page.createdTime,
                  lastEditedTime: page.lastEditedTime
                })), null, 2)}
              </pre>
            </details>

            <h4>📖 Páginas Completas</h4>
            <details>
              <summary style={{ cursor: 'pointer', marginBottom: '10px' }}>
                Ver contenido completo ({result.fullPages.length})
              </summary>
              <pre style={{
                fontSize: '11px',
                overflow: 'auto',
                backgroundColor: '#d411d811',
                padding: '10px',
                borderRadius: '5px',
                maxHeight: '300px'
              }}>
                {JSON.stringify(result.fullPages.map(page => page.toJSON()), null, 2)}
              </pre>
            </details>

            <div style={{
              marginTop: '15px',
              padding: '10px',
              backgroundColor: '#646cff',
              borderRadius: '5px',
              fontSize: '14px'
            }}>
              💾 <strong>Archivos guardados automáticamente</strong> - Se han descargado:
              <ul style={{ marginTop: '8px', marginBottom: '0' }}>
                <li>📄 Archivo JSON con datos completos</li>
                <li>📝 Archivo Markdown con todas las páginas convertidas</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </>
  )
}