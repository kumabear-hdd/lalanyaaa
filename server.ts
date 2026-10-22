import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import memoriesHandler from './api/memories.js';
import uploadHandler from './api/upload.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;
  const isProd = process.env.NODE_ENV === 'production';

  // Increase payload limit for photo uploads
  app.use(express.json({ limit: '20mb' }));
  app.use(express.urlencoded({ extended: true, limit: '20mb' }));

  // Serve uploaded files statically in dev
  const uploadsDir = path.resolve(__dirname, 'data', 'uploads');
  app.use('/uploads', express.static(uploadsDir));

  // Mount API endpoints
  app.all('/api/memories', (req, res) => memoriesHandler(req, res));
  app.all('/api/upload', (req, res) => uploadHandler(req, res));

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      hasBlobToken: Boolean(process.env.BLOB_READ_WRITE_TOKEN),
      environment: process.env.NODE_ENV || 'development'
    });
  });

  if (!isProd) {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR !== 'true',
        watch: process.env.DISABLE_HMR === 'true' ? null : {}
      },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(__dirname, 'dist');
    app.use(express.static(distDir));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(distDir, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
