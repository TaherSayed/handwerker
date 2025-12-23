import { Router } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth.middleware.js';
import { google } from 'googleapis';

const router = Router();

// GET /contacts - Get Google Contacts
router.get('/', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const providerToken = req.headers['x-provider-token'] as string;

    if (!providerToken) {
      return res.status(400).json({
        error: 'Missing Google provider token. Please sign in again or ensure permissions are granted.',
        success: false
      });
    }

    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({ access_token: providerToken });

    const people = google.people({ version: 'v1', auth: oauth2Client });

    const response = await people.people.connections.list({
      resourceName: 'people/me',
      pageSize: 1000,
      personFields: 'names,emailAddresses,phoneNumbers,addresses,metadata',
    });

    const connections = response.data.connections || [];

    // Map to simple structure
    const contacts = connections.map((person: any) => {
      const name = person.names?.[0]?.displayName || 'Unknown';
      const email = person.emailAddresses?.[0]?.value || '';
      const phone = person.phoneNumbers?.[0]?.value || '';
      const address = person.addresses?.[0]?.formattedValue || '';
      const googleId = person.metadata?.sources?.[0]?.id || '';

      return {
        id: googleId, // Use Google ID as local ID for now
        google_contact_id: googleId,
        name,
        email,
        phone,
        address
      };
    });

    res.json(contacts);
  } catch (error: any) {
    console.error('Get contacts error:', error);

    // Handle specific Google API errors
    if (error.code === 401 || error.code === 403) {
      return res.status(error.code).json({
        error: 'Google authentication failed. Please re-sign in.',
        details: error.message,
        success: false
      });
    }

    res.status(500).json({
      error: 'Failed to fetch contacts from Google',
      details: error.message,
      success: false
    });
  }
});

export default router;

