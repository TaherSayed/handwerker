import express from 'express';
import { databaseService } from '../services/database.service.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = express.Router();

// Apply auth middleware to all routes
router.use(authMiddleware);

// Create form template
router.post('/', async (req, res) => {
  try {
    const template = await databaseService.createFormTemplate(req.userId!, req.body);
    res.json(template);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Get all form templates
router.get('/', async (req, res) => {
  try {
    const templates = await databaseService.getFormTemplates(req.userId!);
    res.json(templates);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Update form template
router.put('/:id', async (req, res) => {
  try {
    const template = await databaseService.updateFormTemplate(req.params.id, req.body, req.userId!);
    res.json(template);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Delete form template
router.delete('/:id', async (req, res) => {
  try {
    await databaseService.deleteFormTemplate(req.params.id, req.userId!);
    res.json({ success: true });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

export default router;

