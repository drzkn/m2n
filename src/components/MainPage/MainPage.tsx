import notionLogo from '../../assets/notion.svg'
import supabaseLogo from '../../assets/supabase.svg';
import './MainPage.css'
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { MainPageRepository } from './MainPage.repository';

export const MainPage: React.FC = () => {
  const databaseId = import.meta.env.VITE_NOTION_DATABASE_ID || '';
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState<{ current: number; total: number; currentPageTitle: string } | null>(null);

  const mainPageRepository = new MainPageRepository(databaseId, setIsProcessing, setProgress);

  return (
    <div className="main-page">
      <div>
        <a href="https://notion.so" target="_blank">
          <img src={notionLogo} className="logo notion" alt="Notion Logo" />
        </a>
        <a href="https://supabase.com/" target="_blank">
          <img src={supabaseLogo} className="logo supabase" alt="Markdown Logo" />
        </a>
      </div>
      <h1>Notion 2 Markdown</h1>

      <div className="card">
        <h2>📚 Visualizador de Archivos Markdown</h2>
        <p>
          Visualiza los archivos Markdown convertidos desde Notion en una interfaz interactiva
        </p>
        <button
          onClick={() => navigate('/visualizer')}
          className="primary-button"
        >
          🔍 Abrir Visualizador
        </button>
      </div>

      <div className="card">
        <h2>🧪 Notion Repository Tester</h2>
        <p>
          Prueba todos los métodos del repositorio de Notion con botones interactivos y ve los resultados JSON
        </p>
        <button
          onClick={() => navigate('/test')}
          className="primary-button"
        >
          🧪 Abrir Tester
        </button>
      </div>

      <div className='card'>
        <h2>🔌 Sincronizar markdown y supabase</h2>
        <p>
          Obtención de los bloques de notion de manera recursiva para actualizarlos en supabase
        </p>

        <div style={{ display: 'flex', gap: '1rem', flexDirection: 'column' }}>
          {/* <button
            className={`primary-button ${isProcessing ? 'processing' : ''}`}
            onClick={async () => { await mainPageRepository.handleSyncToMarkdown() }}
            disabled={isProcessing || !databaseId.trim()}
          >
            {isProcessing ? (
              progress ? (
                `⏳ Procesando... (${progress.current}/${progress.total})`
              ) : (
                '⏳ Iniciando...'
              )
            ) : (
              '🔬 Convertir a Markdown (Consola)'
            )}
          </button> */}

          <button
            className={`primary-button test-button ${isProcessing ? 'processing' : ''}`}
            onClick={async () => { await mainPageRepository.handleSyncToSupabase() }}
            disabled={isProcessing || !databaseId.trim()}
          >
            {isProcessing ? (
              progress ? (
                `⏳ Guardando... (${progress.current}/${progress.total})`
              ) : (
                '⏳ Iniciando...'
              )
            ) : (
              '💾 Sincronizar con Supabase'
            )}
          </button>
        </div>

        {isProcessing && progress && (
          <div className="progress-container">
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{
                  width: `${(progress.current / progress.total) * 100}%`
                }}
              />
            </div>
            <div className="progress-text">
              📄 {progress.currentPageTitle.length > 50
                ? progress.currentPageTitle.substring(0, 50) + '...'
                : progress.currentPageTitle}
            </div>
          </div>
        )}
      </div>

      <p className="read-the-docs">
        Convierte páginas de Notion a Markdown y visualízalas de forma interactiva
      </p>
    </div>
  )
}