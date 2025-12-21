import express from 'express';
import { databaseService } from '../services/database.service.js';

const router = express.Router();

// Get all form templates
router.get('/', async (req, res) => {
  try {
    const userId = req.query.userId as string;
    const templates = await databaseService.getFormTemplates(userId);
    res.json(templates);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Create form template
router.post('/', async (req, res) => {
  try {
    const userId = req.body.userId;
    const template = await databaseService.createFormTemplate(userId, req.body);
    res.json(template);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Update form template
router.put('/:id', async (req, res) => {
  try {
    const template = await databaseService.updateFormTemplate(req.params.id, req.body);
    res.json(template);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Delete form template
router.delete('/:id', async (req, res) => {
  try {
    await databaseService.deleteFormTemplate(req.params.id);
    res.json({ success: true });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

export default router;

