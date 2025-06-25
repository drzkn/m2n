import notionLogo from '../../assets/notion.svg'
import supabaseLogo from '../../assets/supabase.svg';
import './MainPage.css'
import { useNavigate } from 'react-router-dom';

export const MainPage: React.FC = () => {
  const navigate = useNavigate();

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
        <button
          className="primary-button"
          onClick={() => { console.log('Vamos a sincronizar en supabase') }}
        >
          🔬 Sincronizar
        </button>
      </div>

      <p className="read-the-docs">
        Convierte páginas de Notion a Markdown y visualízalas de forma interactiva
      </p>
    </div>
  )
}