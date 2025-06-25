import React, { useState } from 'react';
import './NotionTestPage.css';
import { TestResult } from './NotionTestPage.types';
import { NotionTestResults } from './NotionTestResults';
import { TestInputs } from './TestInputs';
import { NotionTestButtons } from './NotionTestButtons';

const NotionTestPage: React.FC = () => {
  const [results, setResults] = useState<TestResult[]>([]);
  const [loading, setLoading] = useState<string | null>(null);
  const [successStates, setSuccessStates] = useState<{ [key: string]: boolean }>({});
  const [testIds, setTestIds] = useState({
    databaseId: import.meta.env.VITE_NOTION_DATABASE_ID || '' as string,
    pageId: '',
    blockId: ''
  });

  const clearResults = () => {
    setResults([]);
  };

  return (
    <div className="notion-test-page">
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

      <TestInputs
        testIds={testIds}
        setTestIds={setTestIds}
        setLoading={setLoading}
        loading={loading}
        setSuccessStates={setSuccessStates}
        successStates={successStates}
      />

      <NotionTestButtons loading={loading} testIds={testIds} setLoading={setLoading} setResults={setResults} />

      <NotionTestResults results={results} />
    </div>
  );
};

export default NotionTestPage;

