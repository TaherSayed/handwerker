import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { existsSync } from 'fs';
import { config } from './config/env.js';
import userRoutes from './routes/user.routes.js';
import templatesRoutes from './routes/templates.routes.js';
import submissionsRoutes from './routes/submissions.routes.js';
import uploadsRoutes from './routes/uploads.routes.js';
import contactsRoutes from './routes/contacts.routes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middleware
const corsOptions = {
  origin: config.corsOrigin === '*' ? true : config.corsOrigin,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};
console.log(`🔒 CORS configured with origin: ${config.corsOrigin === '*' ? '*' : config.corsOrigin}`);
app.use(cors(corsOptions));
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
app.use('/api/contacts', contactsRoutes);

// Serve static files from React build
// In Nixpacks, the structure is /app/server/dist and /app/client/dist
// __dirname will be /app/server/dist, so we go up to /app/server, then up to /app, then into client/dist
let clientBuildPath = path.join(__dirname, '../../client/dist');

// Alternative: check if we're in a production Nixpacks environment
if (process.cwd().includes('/app/server')) {
  // In Nixpacks: /app/server -> /app/client/dist
  clientBuildPath = path.join(process.cwd(), '../client/dist');
}

console.log(`📁 Current working directory: ${process.cwd()}`);
console.log(`📁 __dirname: ${__dirname}`);
console.log(`📁 Looking for client build at: ${clientBuildPath}`);

// Check if client build exists
if (existsSync(clientBuildPath)) {
  console.log('✅ Client build directory found');
  app.use(express.static(clientBuildPath));
  
  // Handle client-side routing - serve index.html for all non-API routes
  app.get('*', (req, res) => {
    res.sendFile(path.join(clientBuildPath, 'index.html'));
  });
} else {
  console.warn('⚠️ Client build directory not found, serving API only');
  app.get('*', (req, res) => {
    res.json({ 
      error: 'Client build not found',
      message: 'API is running but web interface is unavailable',
      apiEndpoints: ['/api/user', '/api/templates', '/api/submissions', '/api/uploads']
    });
  });
}

// 404 handler for API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({ 
    error: 'API endpoint not found',
    path: req.path 
  });
});

// Error handler - MUST return JSON
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  
  // Ensure we always return JSON
  if (!res.headersSent) {
    res.status(500).json({ 
      error: err.message || 'Internal server error',
      success: false 
    });
  }
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
