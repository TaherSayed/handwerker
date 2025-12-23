import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from './config/env.js';
import userRoutes from './routes/user.routes.js';
import templatesRoutes from './routes/templates.routes.js';
import submissionsRoutes from './routes/submissions.routes.js';
import uploadsRoutes from './routes/uploads.routes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middleware
app.use(cors({ origin: config.corsOrigin }));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/user', userRoutes);
app.use('/api/templates', templatesRoutes);
app.use('/api/submissions', submissionsRoutes);
app.use('/api/uploads', uploadsRoutes);

// Serve static files from React build
const clientBuildPath = path.join(__dirname, '../../client/dist');
app.use(express.static(clientBuildPath));

// Handle client-side routing - serve index.html for all non-API routes
app.get('*', (req, res) => {
  res.sendFile(path.join(clientBuildPath, 'index.html'));
});

// Error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(config.port, config.host, () => {
  console.log('🚀 OnSite Forms API Server Started!');
  console.log(`   → URL: http://${config.host}:${config.port}`);
  console.log(`   → Environment: ${config.nodeEnv}`);
  console.log(`   → Health Check: http://${config.host}:${config.port}/health`);
  console.log(`   → Supabase URL: ${config.supabase.url}`);
}).on('error', (err: NodeJS.ErrnoException) => {
  console.error('❌ Failed to start server:', err.message);
  if (err.code === 'EADDRINUSE') {
    console.error(`   Port ${config.port} is already in use`);
  }
  process.exit(1);
});
