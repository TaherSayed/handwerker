import express from 'express';
import { databaseService } from '../services/database.service.js';

const router = express.Router();

// Get all visits
router.get('/', async (req, res) => {
  try {
    const userId = req.query.userId as string;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
    const visits = await databaseService.getVisits(userId, limit);
    res.json(visits);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Create visit
router.post('/', async (req, res) => {
  try {
    const userId = req.body.userId;
    const visit = await databaseService.createVisit(userId, req.body);
    res.json(visit);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Update visit
router.put('/:id', async (req, res) => {
  try {
    const visit = await databaseService.updateVisit(req.params.id, req.body);
    res.json(visit);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Delete visit
router.delete('/:id', async (req, res) => {
  try {
    await databaseService.deleteVisit(req.params.id);
    res.json({ success: true });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

export default router;

