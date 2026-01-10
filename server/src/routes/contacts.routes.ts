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
      personFields: 'names,emailAddresses,phoneNumbers,addresses,metadata,organizations,biographies,userDefined',
    });

    const connections = response.data.connections || [];

    // Map to simple structure
    const contacts = connections.map((person: any) => {
      const name = person.names?.[0]?.displayName || 'Unknown';
      const firstName = person.names?.[0]?.givenName || '';
      const lastName = person.names?.[0]?.familyName || '';
      const email = person.emailAddresses?.find((e: any) => e.metadata?.primary)?.value || person.emailAddresses?.[0]?.value || '';
      const phone = person.phoneNumbers?.find((p: any) => p.metadata?.primary)?.value || person.phoneNumbers?.[0]?.value || '';

      // Advanced Address Mapping
      const biographies = person.biographies?.[0]?.value || '';
      const organizations = person.organizations?.[0] || {};

      let address = '';
      let street = '';
      let city = '';
      let zip = '';

      // 1. Try to find a primary address or just the first one
      const primaryAddr = person.addresses?.find((a: any) => a.metadata?.primary) || person.addresses?.[0];

      if (primaryAddr) {
        street = primaryAddr.streetAddress || '';
        city = primaryAddr.city || '';
        zip = primaryAddr.postalCode || '';

        // Construct address from parts if formattedValue is not ideal
        const parts = [street, [zip, city].filter(Boolean).join(' ')].filter(Boolean);
        address = primaryAddr.formattedValue || parts.join(', ');

        if (!address && parts.length > 0) {
          address = parts.join(', ');
        }
      }

      // 2. Fallback: If no address but we have a biography that looks like an address (heuristic)
      // Or if the user explicitly mentioned it's in the "wrong field", they might mean notes.
      if (!address && biographies) {
        // Simple check: if biography contains a newline and numbers (common for addresses)
        if (biographies.includes('\n') || /\d{5}/.test(biographies)) {
          address = biographies;
        }
      }

      // 3. Fallback: Check organization location
      if (!address && organizations.location) {
        address = organizations.location;
      }

      // 4. Fallback: Check userDefined fields for address-like labels
      if (!address && person.userDefined) {
        const addrField = person.userDefined.find((ud: any) => {
          const key = (ud.key || '').toLowerCase();
          return key.includes('addr') || key.includes('strasse') || key.includes('platz') || key.includes('anschrift');
        });
        if (addrField) {
          address = addrField.value || '';
        }
      }

      const organizationName = organizations.name || '';
      const googleId = person.metadata?.sources?.find((s: any) => s.type === 'CONTACT')?.id || person.metadata?.sources?.[0]?.id || '';

      return {
        id: googleId,
        google_contact_id: googleId,
        name,
        firstName,
        lastName,
        email,
        phone,
        address: address.trim(),
        street: street.trim(),
        city: city.trim(),
        zip: zip.trim(),
        company: organizationName,
        notes: biographies,
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

