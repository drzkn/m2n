import { useNavigate, useLocation } from 'react-router-dom';
import { useState } from 'react';
import './Navigation.css';

export const Navigation: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isExpanded, setIsExpanded] = useState(false);

  const navigationItems = [
    {
      path: '/',
      icon: '🏠',
      label: 'Inicio',
      description: 'Página principal'
    },
    {
      path: '/visualizer',
      icon: '📚',
      label: 'Visualizador',
      description: 'Ver archivos markdown'
    },
    {
      path: '/test',
      icon: '🧪',
      label: 'Tester',
      description: 'Probar repositorio'
    }
  ];

  return (
    <nav
      className={`global-navigation ${isExpanded ? 'expanded' : 'collapsed'}`}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
    >
      <div className="nav-container">
        {navigationItems.map((item) => (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
            title={isExpanded ? item.description : `${item.label} - ${item.description}`}
          >
            <span className="nav-icon">{item.icon}</span>
            {isExpanded && <span className="nav-label">{item.label}</span>}
          </button>
        ))}
      </div>
    </nav>
  );
}; 