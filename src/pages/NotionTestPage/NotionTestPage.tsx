import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  const navigate = useNavigate();
  const [results, setResults] = useState<TestResult[]>([]);
  const [loading, setLoading] = useState<string | null>(null);
  const [successStates, setSuccessStates] = useState<{ [key: string]: boolean }>({});
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

  const showSuccess = (buttonKey: string) => {
    setSuccessStates(prev => ({ ...prev, [buttonKey]: true }));
    setTimeout(() => {
      setSuccessStates(prev => ({ ...prev, [buttonKey]: false }));
    }, 3000);
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

  const testQueryDatabaseWithBlocks = async () => {
    if (!testIds.databaseId) {
      alert('Por favor, ingresa un Database ID');
      return;
    }

    const startTime = Date.now();
    setLoading('queryDatabaseWithBlocks');

    try {
      // Paso 1: Obtener páginas de la base de datos
      const pages = await container.queryDatabaseUseCase.execute(testIds.databaseId);

      // Paso 2: Obtener bloques recursivos para cada página
      const pagesWithBlocks = await Promise.all(
        pages.map(async (page) => {
          try {
            const blocks = await container.getBlockChildrenRecursiveUseCase.execute(page.id, {
              maxDepth: 5,
              includeEmptyBlocks: false,
              delayBetweenRequests: 150
            });

            return {
              ...page,
              blocks: blocks.blocks,
              blocksStats: {
                totalBlocks: blocks.totalBlocks,
                maxDepthReached: blocks.maxDepthReached,
                totalApiCalls: blocks.apiCallsCount
              }
            };
          } catch (error) {
            console.warn(`Error obteniendo bloques para página ${page.id}:`, error);
            return {
              ...page,
              blocks: [],
              blocksStats: { totalBlocks: 0, maxDepthReached: 0, totalApiCalls: 0 },
              blocksError: error instanceof Error ? error.message : 'Error desconocido'
            };
          }
        })
      );

      const duration = Date.now() - startTime;

      // Estadísticas generales
      const totalBlocks = pagesWithBlocks.reduce((sum, page) => sum + page.blocksStats.totalBlocks, 0);
      const totalApiCalls = pagesWithBlocks.reduce((sum, page) => sum + page.blocksStats.totalApiCalls, 0);

      const result = {
        pages: pagesWithBlocks,
        summary: {
          totalPages: pages.length,
          totalBlocks,
          totalApiCalls,
          averageBlocksPerPage: Math.round(totalBlocks / pages.length * 100) / 100,
          processingTimeMs: duration
        }
      };

      addResult({
        method: 'queryDatabase con bloques recursivos',
        success: true,
        data: result,
        timestamp: new Date().toLocaleString('es-ES'),
        duration
      });
    } catch (error) {
      const duration = Date.now() - startTime;

      addResult({
        method: 'queryDatabase con bloques recursivos',
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido',
        timestamp: new Date().toLocaleString('es-ES'),
        duration
      });
    } finally {
      setLoading(null);
    }
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
        showSuccess('autoFillPageId');
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
        showSuccess('autoFillBlockId');
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
      <div className='home-btn-container'>
        <button
          onClick={() => navigate('/')}
          className="home-btn"
          title="Volver a la página inicial"
        >
          🏠 Inicio
        </button>
      </div>
      <div className="test-header">
        <div className="header-top">
          <div className="header-title">
            <h1>🧪 Notion Repository Tester</h1>
            <p>Prueba todos los métodos del repositorio de Notion con valores preestablecidos</p>
          </div>
        </div>

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
        <h2>🔧 Configuración de IDs</h2>
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
              className={`auto-fill-btn ${successStates.autoFillPageId ? 'success' : ''}`}
              disabled={loading === 'autoFillPageId'}
            >
              {loading === 'autoFillPageId' ? '⏳' : successStates.autoFillPageId ? '✅' : '🔄'}
              {loading === 'autoFillPageId' ? ' Cargando...' : successStates.autoFillPageId ? ' ¡Completado!' : ' Auto-rellenar'}
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
              className={`auto-fill-btn ${successStates.autoFillBlockId ? 'success' : ''}`}
              disabled={loading === 'autoFillBlockId'}
            >
              {loading === 'autoFillBlockId' ? '⏳' : successStates.autoFillBlockId ? '✅' : '🔄'}
              {loading === 'autoFillBlockId' ? ' Cargando...' : successStates.autoFillBlockId ? ' ¡Completado!' : ' Auto-rellenar'}
            </button>
          </label>
        </div>
      </div>

      <div className="test-buttons">
        <h2>🚀 Métodos de Prueba</h2>

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

          <button
            onClick={testQueryDatabaseWithBlocks}
            disabled={loading === 'queryDatabaseWithBlocks' || !testIds.databaseId}
            className="test-btn database-btn"
          >
            {loading === 'queryDatabaseWithBlocks' ? '⏳ Cargando...' : '🌳 queryDatabase() + bloques recursivos'}
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
        <h2>📊 Resultados de las Pruebas</h2>

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