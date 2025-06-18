import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api/notion': {
        target: 'https://api.notion.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/notion/, ''),
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq) => {
            // Agregar headers de autenticación de Notion
            const notionApiKey = process.env.VITE_NOTION_API_KEY;
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
})
