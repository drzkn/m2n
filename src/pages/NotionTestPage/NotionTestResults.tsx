import { TestResult } from "./NotionTestPage.types"

export const NotionTestResults: React.FC<{ results: TestResult[] }> = ({ results }) => {
  return (
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
  )
}