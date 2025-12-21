import express from 'express';
import { databaseService } from '../services/database.service.js';

const router = express.Router();

// Get all contacts
router.get('/', async (req, res) => {
  try {
    const userId = req.query.userId as string;
    const searchQuery = req.query.search as string | undefined;
    const contacts = await databaseService.getContacts(userId, searchQuery);
    res.json(contacts);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Create contact
router.post('/', async (req, res) => {
  try {
    const userId = req.body.userId;
    const contact = await databaseService.createContact(userId, req.body);
    res.json(contact);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Update contact
router.put('/:id', async (req, res) => {
  try {
    const contact = await databaseService.updateContact(req.params.id, req.body);
    res.json(contact);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Delete contact
router.delete('/:id', async (req, res) => {
  try {
    await databaseService.deleteContact(req.params.id);
    res.json({ success: true });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

export default router;

