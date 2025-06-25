import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import { MarkdownFile } from '../../services/markdownConverter';
import './MarkdownViewer.css';
import 'highlight.js/styles/vs2015.css'; // Tema oscuro para código

interface MarkdownViewerProps {
  markdownFiles: MarkdownFile[];
  onClose?: () => void;
}

export const MarkdownViewer: React.FC<MarkdownViewerProps> = ({ markdownFiles, onClose }) => {
  const [selectedFile, setSelectedFile] = useState<MarkdownFile | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // Seleccionar el index.md por defecto si existe
    const indexFile = markdownFiles.find(file => file.filename === 'index.md');
    if (indexFile) {
      setSelectedFile(indexFile);
    } else if (markdownFiles.length > 0) {
      setSelectedFile(markdownFiles[0]);
    }
  }, [markdownFiles]);

  const filteredFiles = markdownFiles.filter(file =>
    file.filename.toLowerCase().includes(searchTerm.toLowerCase()) ||
    file.metadata.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleFileSelect = (file: MarkdownFile) => {
    setSelectedFile(file);
  };

  return (
    <div className="markdown-viewer">
      <div className="markdown-viewer-header">
        <h2>📖 Visualizador de Markdown</h2>
        {onClose && (
          <button onClick={onClose} className="close-button">
            ✕ Cerrar
          </button>
        )}
      </div>

      <div className="markdown-viewer-content">
        {/* Sidebar con lista de archivos */}
        <div className="markdown-sidebar">
          <div className="search-container">
            <input
              type="text"
              placeholder="🔍 Buscar archivos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>

          <div className="file-list">
            <h3>📁 Archivos ({filteredFiles.length})</h3>
            {filteredFiles.map((file, index) => (
              <div
                key={index}
                className={`file-item ${selectedFile?.filename === file.filename ? 'selected' : ''}`}
                onClick={() => handleFileSelect(file)}
              >
                <div className="file-icon">
                  {file.filename === 'index.md' ? '📋' : '📄'}
                </div>
                <div className="file-info">
                  <div className="file-name">{file.metadata.title}</div>
                  <div className="file-filename">{file.filename}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Área principal de visualización */}
        <div className="markdown-main">
          {selectedFile ? (
            <div className="markdown-content">
              <div className="markdown-header">
                <h3>
                  {selectedFile.filename === 'index.md' ? '📋' : '📄'} {selectedFile.metadata.title}
                </h3>
                <div className="markdown-meta">
                  <span className="filename">📁 {selectedFile.filename}</span>
                  {selectedFile.metadata.createdTime && (
                    <span className="date">
                      📅 {new Date(selectedFile.metadata.createdTime).toLocaleDateString('es-ES')}
                    </span>
                  )}
                </div>
              </div>

              <div className="markdown-body">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[rehypeHighlight]}
                  components={{
                    // Personalizar enlaces para que funcionen dentro del visualizador
                    a: ({ href, children }) => {
                      // Si es un enlace a otro archivo .md, abrir en el visualizador
                      if (href?.endsWith('.md')) {
                        const targetFile = markdownFiles.find(f => f.filename === href.replace('./', ''));
                        if (targetFile) {
                          return (
                            <button
                              className="internal-link"
                              onClick={() => handleFileSelect(targetFile)}
                            >
                              {children}
                            </button>
                          );
                        }
                      }
                      // Enlaces externos normales
                      return (
                        <a href={href} target="_blank" rel="noopener noreferrer">
                          {children}
                        </a>
                      );
                    },
                  }}
                >
                  {selectedFile.content}
                </ReactMarkdown>
              </div>
            </div>
          ) : (
            <div className="no-file-selected">
              <h3>📄 Selecciona un archivo para visualizar</h3>
              <p>Elige un archivo de la lista de la izquierda para ver su contenido.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}; 