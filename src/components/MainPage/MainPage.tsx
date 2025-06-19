import { getDatabaseUseCase } from "../../infrastructure/di/container"
import notionLogo from '../../assets/notion.svg'
import markdownLogo from '../../assets/markdown.svg';
import './MainPage.css'
import { useState } from 'react';
import { Database } from '../../domain/entities/Database'

export const MainPage: React.FC = () => {
  const [databaseInfo, setDatabaseInfo] = useState<Database | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleGetDatabase = async () => {
    setLoading(true)
    setError(null)

    try {
      const databaseId = import.meta.env.VITE_NOTION_DATABASE_ID

      if (!databaseId) {
        throw new Error('NOTION_DATABASE_ID no está configurado en las variables de entorno')
      }

      const result = await getDatabaseUseCase.execute(databaseId)
      setDatabaseInfo(result)
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Error al obtener la base de datos'
      setError(errorMessage)
      console.error('Error:', err)
    } finally {
      setLoading(false)
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
          onClick={handleGetDatabase}
          disabled={loading}
        >
          {loading ? 'Obteniendo...' : 'Get database'}
        </button>

        {error && (
          <div style={{ color: 'red', marginTop: '10px' }}>
            Error: {error}
          </div>
        )}

        {databaseInfo && (
          <div style={{ marginTop: '10px', textAlign: 'left' }}>
            <h3>Información de la base de datos:</h3>
            <pre style={{ fontSize: '12px', overflow: 'auto' }}>
              {JSON.stringify(databaseInfo.toJSON(), null, 2)}
            </pre>
          </div>
        )}
      </div>
    </>
  )
}