import React from 'react';
import { container } from '../../infrastructure/di/container';

export const TestInputs: React.FC<{
  testIds: Record<string, string>;
  setTestIds: React.Dispatch<React.SetStateAction<{
    databaseId: string;
    pageId: string;
    blockId: string;
  }>>;
  loading: string | null;
  successStates: {
    [key: string]: boolean;
  };
  setLoading: (loading: string | null) => void;
  setSuccessStates: React.Dispatch<React.SetStateAction<{
    [key: string]: boolean;
  }>>;
}> = ({ testIds, setTestIds, setLoading, loading, setSuccessStates, successStates }) => {

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

  const showSuccess = (buttonKey: string) => {
    setSuccessStates(prev => ({ ...prev, [buttonKey]: true }));
    setTimeout(() => {
      setSuccessStates(prev => ({ ...prev, [buttonKey]: false }));
    }, 3000);
  };

  return (
    <div className="test-inputs">
      <h2>🔧 Configuración de IDs</h2>
      <div className="input-group">
        <label>
          Database ID:
          <input
            type="text"
            value={testIds.databaseId}
            onChange={(e) => setTestIds(prev => ({ ...prev, databaseId: e.target.value }))}
            placeholder="Ingresa el ID de la base de datos" />
        </label>
      </div>

      <div className="input-group">
        <label>
          Page ID:
          <input
            type="text"
            value={testIds.pageId}
            onChange={(e) => setTestIds(prev => ({ ...prev, pageId: e.target.value }))}
            placeholder="Ingresa el ID de la página" />
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
            placeholder="Ingresa el ID del bloque" />
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
  );
};
