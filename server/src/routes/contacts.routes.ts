import express from 'express';
import { databaseService } from '../services/database.service.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = express.Router();

// Apply auth middleware to all routes
router.use(authMiddleware);

// Get all contacts (fetches from Google Contacts + cached)
router.get('/', async (req, res) => {
  try {
    const searchQuery = req.query.search as string | undefined;
    const contacts = await databaseService.getContacts(req.userId!, searchQuery);
    res.json(contacts);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

export default router;

