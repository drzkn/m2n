import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Cargar variables de entorno según el modo
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [
      react(),
      // Plugin personalizado para servir archivos Markdown
      {
        name: 'markdown-files',
        configureServer(server) {
          server.middlewares.use((req, res, next) => {
            console.log('Middleware ejecutado para:', req.url);
            if (req.url === '/api/markdown/list') {
              console.log('Procesando solicitud de archivos Markdown');
              // Listar archivos Markdown
              try {
                // Configurar headers CORS
                res.setHeader('Access-Control-Allow-Origin', '*');
                res.setHeader('Access-Control-Allow-Methods', 'GET');
                res.setHeader('Content-Type', 'application/json');

                const markdownDir = path.join(process.cwd(), 'output', 'markdown');
                console.log('Buscando archivos en:', markdownDir);

                if (!fs.existsSync(markdownDir)) {
                  console.error('Carpeta no encontrada:', markdownDir);
                  res.statusCode = 404;
                  res.end(JSON.stringify({ error: 'Carpeta output/markdown no encontrada' }));
                  return;
                }

                const files = fs.readdirSync(markdownDir)
                  .filter(file => file.endsWith('.md'))
                  .map(filename => {
                    console.log('Procesando archivo:', filename);
                    const filePath = path.join(markdownDir, filename);
                    const content = fs.readFileSync(filePath, 'utf-8');

                    // Extraer metadatos del frontmatter
                    const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
                    const metadata: {
                      id: string;
                      title: string;
                      createdTime?: string;
                      lastEditedTime?: string;
                      url?: string;
                    } = { id: filename.replace('.md', ''), title: filename.replace('.md', '') };

                    if (frontmatterMatch) {
                      const frontmatter = frontmatterMatch[1];
                      const titleMatch = frontmatter.match(/title:\s*"([^"]+)"/);
                      const idMatch = frontmatter.match(/notion_id:\s*"([^"]+)"/);
                      const createdMatch = frontmatter.match(/created:\s*"([^"]+)"/);
                      const updatedMatch = frontmatter.match(/updated:\s*"([^"]+)"/);
                      const urlMatch = frontmatter.match(/notion_url:\s*"([^"]+)"/);

                      if (titleMatch) metadata.title = titleMatch[1];
                      if (idMatch) metadata.id = idMatch[1];
                      if (createdMatch) metadata.createdTime = createdMatch[1];
                      if (updatedMatch) metadata.lastEditedTime = updatedMatch[1];
                      if (urlMatch) metadata.url = urlMatch[1];
                    }

                    return {
                      filename,
                      content,
                      metadata
                    };
                  });

                console.log(`Enviando ${files.length} archivos`);
                res.end(JSON.stringify(files));
              } catch (error) {
                console.error('Error al procesar archivos:', error);
                res.statusCode = 500;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ error: 'Error al leer archivos: ' + (error as Error).message }));
              }
            } else {
              next();
            }
          });
        }
      }
    ],
    server: {
      proxy: {
        '/api/notion': {
          target: 'https://api.notion.com',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/notion/, ''),
          configure: (proxy) => {
            proxy.on('proxyReq', (proxyReq) => {
              // Agregar headers de autenticación de Notion
              const notionApiKey = env.VITE_NOTION_API_KEY;
              if (notionApiKey) {
                proxyReq.setHeader('Authorization', `Bearer ${notionApiKey}`);
                proxyReq.setHeader('Notion-Version', '2022-06-28');
                proxyReq.setHeader('Content-Type', 'application/json');
              }
            });
          }
        }
      }
    }
  }
})
