import { useState, useEffect } from 'react';
import { MarkdownFile } from "../../services/markdownConverter";
import { MarkdownViewer } from '../../components/MarkdownViewer';
import notionLogo from '../../assets/notion.svg'
import markdownLogo from '../../assets/markdown.svg';

export const VisualizerPage: React.FC = () => {
  const [markdownFiles, setMarkdownFiles] = useState<MarkdownFile[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadMarkdownFiles = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/markdown/list')

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error al cargar archivos')
      }

      const files: MarkdownFile[] = await response.json()
      setMarkdownFiles(files)
    } catch (err) {
      setError('Error al cargar los archivos Markdown: ' + (err instanceof Error ? err.message : 'Error desconocido'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadMarkdownFiles()
  }, [])

  if (error) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '80vh',
        flexDirection: 'column',
        gap: '1rem',
        padding: '2rem'
      }}>
        <div>
          <a href="https://notion.so" target="_blank">
            <img src={notionLogo} className="logo notion" alt="Notion Logo" />
          </a>
          <a href="https://docs.github.com/es/get-started/writing-on-github/getting-started-with-writing-and-formatting-on-github/basic-writing-and-formatting-syntax" target="_blank">
            <img src={markdownLogo} className="logo markdown" alt="Markdown Logo" />
          </a>
        </div>
        <h1>Notion 2 Markdown</h1>
        <div style={{
          padding: '1rem',
          backgroundColor: '#ff4757',
          borderRadius: '8px',
          color: 'white',
          textAlign: 'center'
        }}>
          <strong>❌ Error:</strong> {error}
          <br />
          <button
            onClick={loadMarkdownFiles}
            style={{
              marginTop: '1rem',
              padding: '0.5rem 1rem',
              backgroundColor: 'white',
              color: '#ff4757',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            🔄 Reintentar
          </button>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '80vh',
        flexDirection: 'column',
        gap: '1rem',
        padding: '2rem'
      }}>
        <div>
          <a href="https://notion.so" target="_blank">
            <img src={notionLogo} className="logo notion" alt="Notion Logo" />
          </a>
          <a href="https://docs.github.com/es/get-started/writing-on-github/getting-started-with-writing-and-formatting-on-github/basic-writing-and-formatting-syntax" target="_blank">
            <img src={markdownLogo} className="logo markdown" alt="Markdown Logo" />
          </a>
        </div>
        <h1>Notion 2 Markdown</h1>
        <div style={{
          padding: '1rem',
          backgroundColor: '#646cff',
          borderRadius: '8px',
          color: 'white'
        }}>
          🔄 Cargando archivos Markdown...
        </div>
      </div>
    )
  }

  return (
    <MarkdownViewer
      markdownFiles={markdownFiles}
    />
  )
} 