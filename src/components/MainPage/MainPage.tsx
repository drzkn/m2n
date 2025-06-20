import notionLogo from '../../assets/notion.svg'
import markdownLogo from '../../assets/markdown.svg';
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
        <a href="https://docs.github.com/es/get-started/writing-on-github/getting-started-with-writing-and-formatting-on-github/basic-writing-and-formatting-syntax" target="_blank">
          <img src={markdownLogo} className="logo markdown" alt="Markdown Logo" />
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

      <p className="read-the-docs">
        Convierte páginas de Notion a Markdown y visualízalas de forma interactiva
      </p>
    </div>
  )
}