import notionLogo from '../../assets/notion.svg'
import supabaseLogo from '../../assets/supabase.svg';
import './ConnectionPage.css'
import { useState } from 'react';
import { ConnectionPageRepository } from './ConnectionPage.repository';

export const ConnectionPage: React.FC = () => {
  const databaseId = import.meta.env.VITE_NOTION_DATABASE_ID || '';
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState<{ current: number; total: number; currentPageTitle: string } | null>(null);

  const connectionPageRepository = new ConnectionPageRepository(databaseId, setIsProcessing, setProgress);

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
      <h1>Notion 2 Supabase</h1>

      <div className='card'>
        <h2>🔌 Sincronizar markdown y supabase</h2>
        <p>
          Obtención de los bloques de notion de manera recursiva para actualizarlos en supabase
        </p>

        <button
          className={`primary-button test-button ${isProcessing ? 'processing' : ''}`}
          onClick={async () => { await connectionPageRepository.handleSyncToSupabase() }}
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