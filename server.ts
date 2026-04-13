import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Proxy requests to Gemini API
  app.use('/api/gemini', createProxyMiddleware({
    target: 'https://generativelanguage.googleapis.com',
    changeOrigin: true,
    pathRewrite: {
      '^/api/gemini': '', // remove base path
    },
    on: {
      proxyReq: (proxyReq, req, res) => {
        // Inject API key here
        const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY;
        if (apiKey) {
          proxyReq.setHeader('x-goog-api-key', apiKey);
        }
        
        // Remove dummy key from query string if the SDK appended it
        try {
          const url = new URL(proxyReq.path, 'http://localhost');
          if (url.searchParams.has('key')) {
            url.searchParams.delete('key');
            proxyReq.path = url.pathname + url.search;
          }
        } catch (e) {
          // Ignore URL parsing errors
        }
      }
    }
  }));

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
