import express from 'express';
import { databaseService } from '../services/database.service.js';

const router = express.Router();

// Get user profile
router.get('/profile', async (req, res) => {
  try {
    const userId = req.query.userId as string;
    const profile = await databaseService.getUserProfile(userId);
    res.json(profile);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Update user profile
router.put('/profile', async (req, res) => {
  try {
    const userId = req.body.userId;
    const profile = await databaseService.updateUserProfile(userId, req.body);
    res.json(profile);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

export default router;

