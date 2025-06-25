import { useNavigate, useLocation } from 'react-router-dom';
import './Navigation.css';

export const Navigation: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const navigationItems = [
    {
      path: '/',
      label: '🏠 Inicio',
      description: 'Página principal'
    },
    {
      path: '/visualizer',
      label: '📚 Visualizador',
      description: 'Ver archivos markdown'
    },
    {
      path: '/test',
      label: '🧪 Tester',
      description: 'Probar repositorio'
    }
  ];

  return (
    <nav className="global-navigation">
      <div className="nav-container">
        {navigationItems.map((item) => (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
            title={item.description}
          >
            {item.label}
          </button>
        ))}
      </div>
    </nav>
  );
}; 