import express from 'express';
import { databaseService } from '../services/database.service.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = express.Router();

// Apply auth middleware to all routes
router.use(authMiddleware);

// Create visit
router.post('/', async (req, res) => {
  try {
    const visit = await databaseService.createVisit(req.userId!, req.body);
    res.json(visit);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Get visit by ID
router.get('/:id', async (req, res) => {
  try {
    const visit = await databaseService.getVisitById(req.params.id, req.userId!);
    if (!visit) {
      return res.status(404).json({ error: 'Visit not found' });
    }
    res.json(visit);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Update visit
router.put('/:id', async (req, res) => {
  try {
    const visit = await databaseService.updateVisit(req.params.id, req.body, req.userId!);
    res.json(visit);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

export default router;

