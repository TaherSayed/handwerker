// Import env config FIRST to ensure environment variables are loaded
import './config/env.js';

import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.routes.js';
import contactsRoutes from './routes/contacts.routes.js';
import formsRoutes from './routes/forms.routes.js';
import visitsRoutes from './routes/visits.routes.js';
import googleRoutes from './routes/google.routes.js';
import userRoutes from './routes/user.routes.js';
import { env } from './config/env.js';

const app = express();
const PORT = parseInt(env.PORT, 10);

// Middleware
app.use(cors({
  origin: env.CLIENT_URL,
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/contacts', contactsRoutes);
app.use('/api/forms', formsRoutes);
app.use('/api/visits', visitsRoutes);
app.use('/api/google', googleRoutes);
app.use('/api/user', userRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

