import { google } from 'googleapis';
import { databaseService } from './database.service.js';

export class GoogleContactsService {
  async importContacts(accessToken: string, userId: string) {
    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({ access_token: accessToken });

    const people = google.people({ version: 'v1', auth: oauth2Client });

    const response = await people.people.connections.list({
      resourceName: 'people/me',
      personFields: 'names,emailAddresses,phoneNumbers,organizations,photos',
      pageSize: 2000,
    });

    const connections = response.data.connections || [];
    const contacts = [];

    for (const connection of connections) {
      const names = connection.names || [];
      const emails = connection.emailAddresses || [];
      const phones = connection.phoneNumbers || [];
      const orgs = connection.organizations || [];
      const photos = connection.photos || [];

      const primaryName = names.find(n => n.metadata?.primary) || names[0];
      if (!primaryName) continue;

      const fullName = primaryName.displayName || 
        `${primaryName.givenName || ''} ${primaryName.familyName || ''}`.trim();

      if (!fullName) continue;

      const primaryEmail = emails.find(e => e.metadata?.primary) || emails[0];
      const primaryPhone = phones.find(p => p.metadata?.primary) || phones[0];
      const primaryOrg = orgs.find(o => o.metadata?.primary) || orgs[0];
      const primaryPhoto = photos.find(p => p.metadata?.primary) || photos[0];

      const contact = {
        full_name: fullName,
        email: primaryEmail?.value || '',
        phone: primaryPhone?.value || '',
        company: primaryOrg?.name || '',
        avatar_url: primaryPhoto?.url || '',
        is_favorite: false,
      };

      try {
        await databaseService.createContact(userId, contact);
        contacts.push(contact);
      } catch (error) {
        // Contact might already exist, skip
        console.log(`Skipping duplicate contact: ${fullName}`);
      }
    }

    return contacts;
  }
}

export const googleContactsService = new GoogleContactsService();

