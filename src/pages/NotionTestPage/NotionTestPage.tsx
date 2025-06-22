import React, { useState } from 'react';
import { container } from '../../infrastructure/di/container';
import './NotionTestPage.css';

interface TestResult {
  method: string;
  success: boolean;
  data?: unknown;
  error?: string;
  timestamp: string;
  duration: number;
}

const NotionTestPage: React.FC = () => {
  const [results, setResults] = useState<TestResult[]>([]);
  const [loading, setLoading] = useState<string | null>(null);
  const [testIds, setTestIds] = useState({
    databaseId: import.meta.env.VITE_NOTION_DATABASE_ID || '',
    pageId: '',
    blockId: ''
  });

  const addResult = (result: TestResult) => {
    setResults(prev => [result, ...prev]);
  };

  const clearResults = () => {
    setResults([]);
  };

  const executeTest = async (method: string, testFunction: () => Promise<unknown>) => {
    setLoading(method);
    const startTime = Date.now();

    try {
      const data = await testFunction();
      const duration = Date.now() - startTime;

      addResult({
        method,
        success: true,
        data,
        timestamp: new Date().toLocaleString('es-ES'),
        duration
      });
    } catch (error) {
      const duration = Date.now() - startTime;

      addResult({
        method,
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido',
        timestamp: new Date().toLocaleString('es-ES'),
        duration
      });
    } finally {
      setLoading(null);
    }
  };

  const testGetUser = () => {
    executeTest('getUser', () => container.getUserUseCase.execute());
  };

  const testGetDatabase = () => {
    if (!testIds.databaseId) {
      alert('Por favor, ingresa un Database ID');
      return;
    }
    executeTest('getDatabase', () => container.getDatabaseUseCase.execute(testIds.databaseId));
  };

  const testQueryDatabase = () => {
    if (!testIds.databaseId) {
      alert('Por favor, ingresa un Database ID');
      return;
    }
    executeTest('queryDatabase', () => container.queryDatabaseUseCase.execute(testIds.databaseId));
  };

  const testGetPage = () => {
    if (!testIds.pageId) {
      alert('Por favor, ingresa un Page ID');
      return;
    }
    executeTest('getPage', () => container.getPageUseCase.execute(testIds.pageId));
  };

  const testGetBlockChildren = () => {
    if (!testIds.blockId) {
      alert('Por favor, ingresa un Block ID');
      return;
    }
    executeTest('getBlockChildren', () => container.getBlockChildrenUseCase.execute(testIds.blockId));
  };

  const testGetBlockChildrenRecursive = () => {
    if (!testIds.blockId) {
      alert('Por favor, ingresa un Block ID');
      return;
    }
    executeTest('getBlockChildren (recursivo)', () =>
      container.getBlockChildrenRecursiveUseCase.execute(testIds.blockId, {
        maxDepth: 3,
        includeEmptyBlocks: false,
        delayBetweenRequests: 100
      })
    );
  };

  const autoFillPageId = async () => {
    if (!testIds.databaseId) {
      alert('Primero ejecuta queryDatabase para obtener páginas');
      return;
    }

    setLoading('autoFillPageId');
    try {
      const pages = await container.queryDatabaseUseCase.execute(testIds.databaseId);
      if (pages.length > 0) {
        setTestIds(prev => ({ ...prev, pageId: pages[0].id }));
        alert('Page ID rellenado con la primera página encontrada');
      } else {
        alert('No se encontraron páginas en la base de datos');
      }
    } catch (error) {
      alert('Error al obtener páginas: ' + (error instanceof Error ? error.message : 'Error desconocido'));
    } finally {
      setLoading(null);
    }
  };

  const autoFillBlockId = async () => {
    if (!testIds.pageId) {
      alert('Primero rellena el Page ID');
      return;
    }

    setLoading('autoFillBlockId');
    try {
      const blocks = await container.getBlockChildrenUseCase.execute(testIds.pageId);
      if (blocks.length > 0) {
        setTestIds(prev => ({ ...prev, blockId: blocks[0].id }));
        alert('Block ID rellenado con el primer bloque encontrado');
      } else {
        alert('No se encontraron bloques en la página');
      }
    } catch (error) {
      alert('Error al obtener bloques: ' + (error instanceof Error ? error.message : 'Error desconocido'));
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="notion-test-page">
      <div className="test-header">
        <h1>🧪 Notion Repository Tester</h1>
        <p>Prueba todos los métodos del repositorio de Notion con valores preestablecidos</p>

        <div className="test-controls">
          <button onClick={clearResults} className="clear-btn">
            🗑️ Limpiar Resultados
          </button>
          <span className="results-count">
            {results.length} resultado{results.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      <div className="test-inputs">
        <h3>🔧 Configuración de IDs</h3>
        <div className="input-group">
          <label>
            Database ID:
            <input
              type="text"
              value={testIds.databaseId}
              onChange={(e) => setTestIds(prev => ({ ...prev, databaseId: e.target.value }))}
              placeholder="Ingresa el ID de la base de datos"
            />
          </label>
        </div>

        <div className="input-group">
          <label>
            Page ID:
            <input
              type="text"
              value={testIds.pageId}
              onChange={(e) => setTestIds(prev => ({ ...prev, pageId: e.target.value }))}
              placeholder="Ingresa el ID de la página"
            />
            <button
              onClick={autoFillPageId}
              className="auto-fill-btn"
              disabled={loading === 'autoFillPageId'}
            >
              {loading === 'autoFillPageId' ? '⏳' : '🔄'} Auto-rellenar
            </button>
          </label>
        </div>

        <div className="input-group">
          <label>
            Block ID:
            <input
              type="text"
              value={testIds.blockId}
              onChange={(e) => setTestIds(prev => ({ ...prev, blockId: e.target.value }))}
              placeholder="Ingresa el ID del bloque"
            />
            <button
              onClick={autoFillBlockId}
              className="auto-fill-btn"
              disabled={loading === 'autoFillBlockId'}
            >
              {loading === 'autoFillBlockId' ? '⏳' : '🔄'} Auto-rellenar
            </button>
          </label>
        </div>
      </div>

      <div className="test-buttons">
        <h3>🚀 Métodos de Prueba</h3>

        <div className="button-group">
          <h4>👤 Usuario</h4>
          <button
            onClick={testGetUser}
            disabled={loading === 'getUser'}
            className="test-btn user-btn"
          >
            {loading === 'getUser' ? '⏳ Cargando...' : '👤 getUser()'}
          </button>
        </div>

        <div className="button-group">
          <h4>🗄️ Base de Datos</h4>
          <button
            onClick={testGetDatabase}
            disabled={loading === 'getDatabase' || !testIds.databaseId}
            className="test-btn database-btn"
          >
            {loading === 'getDatabase' ? '⏳ Cargando...' : '🗄️ getDatabase()'}
          </button>

          <button
            onClick={testQueryDatabase}
            disabled={loading === 'queryDatabase' || !testIds.databaseId}
            className="test-btn database-btn"
          >
            {loading === 'queryDatabase' ? '⏳ Cargando...' : '🔍 queryDatabase()'}
          </button>
        </div>

        <div className="button-group">
          <h4>📄 Páginas</h4>
          <button
            onClick={testGetPage}
            disabled={loading === 'getPage' || !testIds.pageId}
            className="test-btn page-btn"
          >
            {loading === 'getPage' ? '⏳ Cargando...' : '📄 getPage()'}
          </button>
        </div>

        <div className="button-group">
          <h4>🧱 Bloques</h4>
          <button
            onClick={testGetBlockChildren}
            disabled={loading === 'getBlockChildren' || !testIds.blockId}
            className="test-btn block-btn"
          >
            {loading === 'getBlockChildren' ? '⏳ Cargando...' : '🧱 getBlockChildren()'}
          </button>

          <button
            onClick={testGetBlockChildrenRecursive}
            disabled={loading === 'getBlockChildren (recursivo)' || !testIds.blockId}
            className="test-btn block-btn"
          >
            {loading === 'getBlockChildren (recursivo)' ? '⏳ Cargando...' : '🌳 getBlockChildren() recursivo'}
          </button>
        </div>
      </div>

      <div className="test-results">
        <h3>📊 Resultados de las Pruebas</h3>

        {results.length === 0 ? (
          <div className="no-results">
            <p>No hay resultados aún. Ejecuta alguna prueba para ver los resultados aquí.</p>
          </div>
        ) : (
          <div className="results-list">
            {results.map((result, index) => (
              <div key={index} className={`result-item ${result.success ? 'success' : 'error'}`}>
                <div className="result-header">
                  <span className="result-method">
                    {result.success ? '✅' : '❌'} {result.method}
                  </span>
                  <span className="result-meta">
                    {result.timestamp} • {result.duration}ms
                  </span>
                </div>

                <div className="result-content">
                  {result.success ? (
                    <pre className="result-json">
                      {JSON.stringify(result.data, null, 2)}
                    </pre>
                  ) : (
                    <div className="result-error">
                      <strong>Error:</strong> {result.error}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotionTestPage; 