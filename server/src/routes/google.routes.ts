import express from 'express';
import { googleContactsService } from '../services/google-contacts.service.js';

const router = express.Router();

// Import Google Contacts
router.post('/contacts/import', async (req, res) => {
  try {
    const { accessToken, userId } = req.body;
    const contacts = await googleContactsService.importContacts(accessToken, userId);
    res.json(contacts);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

export default router;

