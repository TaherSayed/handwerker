import express from 'express';
import { googleContactsService } from '../services/google-contacts.service.js';

const router = express.Router();

// Get list of Google contacts (without importing)
router.get('/contacts/list', async (req, res) => {
  try {
    const { accessToken } = req.query;
    if (!accessToken || typeof accessToken !== 'string') {
      return res.status(400).json({ error: 'Access token is required' });
    }
    const contacts = await googleContactsService.getContactsList(accessToken);
    res.json(contacts);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Import selected Google contacts
router.post('/contacts/import-selected', async (req, res) => {
  try {
    const { accessToken, userId, resourceNames } = req.body;
    if (!accessToken || !userId || !resourceNames || !Array.isArray(resourceNames)) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    const contacts = await googleContactsService.importSelectedContacts(accessToken, userId, resourceNames);
    res.json(contacts);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Import all Google Contacts (legacy)
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

