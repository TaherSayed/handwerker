// Import env config FIRST to ensure environment variables are loaded
import './config/env.js';

import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import authRoutes from './routes/auth.routes.js';
import contactsRoutes from './routes/contacts.routes.js';
import formsRoutes from './routes/forms.routes.js';
import visitsRoutes from './routes/visits.routes.js';
import pdfRoutes from './routes/pdf.routes.js';
import googleRoutes from './routes/google.routes.js';
import userRoutes from './routes/user.routes.js';
import { env } from './config/env.js';

// Get __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = parseInt(env.PORT, 10);

// Middleware
app.use(cors({
  origin: env.CLIENT_URL,
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes (must come before static files)
app.use('/api/auth', authRoutes);
app.use('/api/contacts', contactsRoutes);
app.use('/api/forms', formsRoutes);
app.use('/api/visits', visitsRoutes);
app.use('/api/pdf', pdfRoutes);
app.use('/api/google', googleRoutes);
app.use('/api/user', userRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Serve static files from React app
// Path: /app/client/dist (in container) or ../../client/dist (relative from server/dist)
const clientDistPath = path.resolve(__dirname, '../../client/dist');
app.use(express.static(clientDistPath));

// Serve React app for all non-API routes (SPA routing)
app.get('*', (req, res) => {
  // Don't serve index.html for API routes
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ error: 'API route not found' });
  }
  res.sendFile(path.join(clientDistPath, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📦 Serving React app from: ${clientDistPath}`);
});

