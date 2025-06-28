import { useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import styles from './Navigation.module.css';

export const Navigation: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isExpanded, setIsExpanded] = useState(false);

  // Actualizar variable CSS global cuando cambia el estado
  useEffect(() => {
    document.documentElement.style.setProperty(
      '--nav-expanded',
      isExpanded ? '1' : '0'
    );
    document.documentElement.style.setProperty(
      '--nav-width',
      isExpanded ? '200px' : '60px'
    );
  }, [isExpanded]);

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
    },
    {
      path: '/connect',
      icon: '🔌',
      label: 'Connect',
      description: 'Sincronizar base de datos'
    }
  ];

  return (
    <nav
      className={`${styles.globalNavigation} ${isExpanded ? styles.expanded : ''}`}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
    >
      <div className={styles.navContainer}>
        {navigationItems.map((item) => (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className={`${styles.navItem} ${location.pathname === item.path ? styles.active : ''}`}
            title={isExpanded ? item.description : `${item.label} - ${item.description}`}
          >
            <span className={styles.navIcon}>{item.icon}</span>
            {isExpanded && <span className={styles.navLabel}>{item.label}</span>}
          </button>
        ))}
      </div>
    </nav>
  );
}; 