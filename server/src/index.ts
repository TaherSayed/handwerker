import express from 'express';
import cors from 'cors';
import { config } from './config/env.js';
import userRoutes from './routes/user.routes.js';
import templatesRoutes from './routes/templates.routes.js';
import submissionsRoutes from './routes/submissions.routes.js';
import uploadsRoutes from './routes/uploads.routes.js';

const app = express();

// Middleware
app.use(cors({ origin: config.corsOrigin }));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/user', userRoutes);
app.use('/api/templates', templatesRoutes);
app.use('/api/submissions', submissionsRoutes);
app.use('/api/uploads', uploadsRoutes);

// Error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(config.port, () => {
  console.log(`🚀 OnSite Forms API running on port ${config.port}`);
  console.log(`📝 Environment: ${config.nodeEnv}`);
});
