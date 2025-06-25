import React from 'react';
import { TestResult } from './NotionTestPage.types';
import { NotionTestPageRepository } from '../../domain/repositories/NotionTestPageRepository';

export const NotionTestButtons: React.FC<{ loading: string | null; testIds: Record<string, string>; setLoading: (loading: string | null) => void; setResults: React.Dispatch<React.SetStateAction<TestResult[]>>; }> = ({
  testIds, setLoading, setResults, loading
}) => {
  const notionTestingRepository = new NotionTestPageRepository(testIds, setLoading, setResults);

  return (
    <div className="test-buttons">
      <h2>🚀 Métodos de Prueba</h2>

      <div className="button-group">
        <h4>👤 Usuario</h4>
        <button
          onClick={async () => { await notionTestingRepository.testGetUser(); }}
          disabled={loading === 'getUser'}
          className="test-btn user-btn"
        >
          {loading === 'getUser' ? '⏳ Cargando...' : '👤 getUser()'}
        </button>
      </div>

      <div className="button-group">
        <h4>🗄️ Base de Datos</h4>
        <button
          onClick={async () => { await notionTestingRepository.testGetDatabase(); }}
          disabled={loading === 'getDatabase' || !testIds.databaseId}
          className="test-btn database-btn"
        >
          {loading === 'getDatabase' ? '⏳ Cargando...' : '🗄️ getDatabase()'}
        </button>

        <button
          onClick={async () => { await notionTestingRepository.testQueryDatabase(); }}
          disabled={loading === 'queryDatabase' || !testIds.databaseId}
          className="test-btn database-btn"
        >
          {loading === 'queryDatabase' ? '⏳ Cargando...' : '🔍 queryDatabase()'}
        </button>

        <button
          onClick={async () => { await notionTestingRepository.testQueryDatabaseWithBlocks(); }}
          disabled={loading === 'queryDatabaseWithBlocks' || !testIds.databaseId}
          className="test-btn database-btn"
        >
          {loading === 'queryDatabaseWithBlocks' ? '⏳ Cargando...' : '🌳 queryDatabase() + bloques recursivos'}
        </button>
      </div>

      <div className="button-group">
        <h4>📄 Páginas</h4>
        <button
          onClick={async () => { await notionTestingRepository.testGetPage(); }}
          disabled={loading === 'getPage' || !testIds.pageId}
          className="test-btn page-btn"
        >
          {loading === 'getPage' ? '⏳ Cargando...' : '📄 getPage()'}
        </button>
      </div>

      <div className="button-group">
        <h4>🧱 Bloques</h4>
        <button
          onClick={async () => { await notionTestingRepository.testGetBlockChildren(); }}
          disabled={loading === 'getBlockChildren' || !testIds.blockId}
          className="test-btn block-btn"
        >
          {loading === 'getBlockChildren' ? '⏳ Cargando...' : '🧱 getBlockChildren()'}
        </button>

        <button
          onClick={async () => { await notionTestingRepository.testGetBlockChildrenRecursive(); }}
          disabled={loading === 'getBlockChildren (recursivo)' || !testIds.blockId}
          className="test-btn block-btn"
        >
          {loading === 'getBlockChildren (recursivo)' ? '⏳ Cargando...' : '🌳 getBlockChildren() recursivo'}
        </button>
      </div>
    </div>
  );
};
