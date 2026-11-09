import { defineConfig, Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { processDopamineDump } from './server/services/dopamineService';

function dopamineDumpMiddlewarePlugin(): Plugin {
  return {
    name: 'vite-plugin-dopamine-dump',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (req.url === '/api/dopamine-dump' && req.method === 'POST') {
          let body = '';
          req.on('data', chunk => {
            body += chunk;
          });

          req.on('end', async () => {
            try {
              const parsed = JSON.parse(body || '{}');
              const message = parsed.message || parsed.idea || parsed.text;

              if (!message || typeof message !== 'string' || !message.trim()) {
                res.statusCode = 400;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({
                  success: false,
                  error: 'Mensagem da ideia é obrigatória.'
                }));
                return;
              }

              const result = await processDopamineDump(message);
              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify(result));
            } catch (err: any) {
              console.error('[Vite Dopamine API Error]:', err);
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({
                success: false,
                error: err.message || 'Erro interno ao processar a ideia.'
              }));
            }
          });
          return;
        }

        if (req.url === '/api/health' && req.method === 'GET') {
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({
            status: 'ok',
            service: 'TDAH Focus OS - Dopamine Parking Engine',
            port: 3000
          }));
          return;
        }

        next();
      });
    }
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    dopamineDumpMiddlewarePlugin(),
  ],
  server: {
    port: 3000,
    open: true,
  },
});
