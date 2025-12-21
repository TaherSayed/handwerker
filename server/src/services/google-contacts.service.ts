import { google } from 'googleapis';
import { databaseService } from './database.service.js';

interface GoogleContact {
  resourceName: string;
  full_name: string;
  email: string;
  phone: string;
  company: string;
  avatar_url: string;
}

export class GoogleContactsService {
  /**
   * Get list of Google contacts without importing them
   */
  async getContactsList(accessToken: string): Promise<GoogleContact[]> {
    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({ access_token: accessToken });

    const people = google.people({ version: 'v1', auth: oauth2Client });

    const response = await people.people.connections.list({
      resourceName: 'people/me',
      personFields: 'names,emailAddresses,phoneNumbers,organizations,photos',
      pageSize: 2000,
    });

    const connections = response.data.connections || [];
    const contacts: GoogleContact[] = [];

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

      contacts.push({
        resourceName: connection.resourceName || '',
        full_name: fullName,
        email: primaryEmail?.value || '',
        phone: primaryPhone?.value || '',
        company: primaryOrg?.name || '',
        avatar_url: primaryPhoto?.url || '',
      });
    }

    return contacts;
  }

  /**
   * Import selected Google contacts
   */
  async importSelectedContacts(accessToken: string, userId: string, resourceNames: string[]) {
    const allContacts = await this.getContactsList(accessToken);
    const selectedContacts = allContacts.filter(c => resourceNames.includes(c.resourceName));
    const imported = [];

    for (const contact of selectedContacts) {
      try {
        await databaseService.createContact(userId, {
          full_name: contact.full_name,
          email: contact.email,
          phone: contact.phone,
          company: contact.company,
          avatar_url: contact.avatar_url,
          is_favorite: false,
        });
        imported.push(contact);
      } catch (error) {
        // Contact might already exist, skip
        console.log(`Skipping duplicate contact: ${contact.full_name}`);
      }
    }

    return imported;
  }

  /**
   * Import all Google contacts (legacy method)
   */
  async importContacts(accessToken: string, userId: string) {
    const contacts = await this.getContactsList(accessToken);
    const imported = [];

    for (const contact of contacts) {
      try {
        await databaseService.createContact(userId, {
          full_name: contact.full_name,
          email: contact.email,
          phone: contact.phone,
          company: contact.company,
          avatar_url: contact.avatar_url,
          is_favorite: false,
        });
        imported.push(contact);
      } catch (error) {
        // Contact might already exist, skip
        console.log(`Skipping duplicate contact: ${contact.full_name}`);
      }
    }

    return imported;
  }
}

export const googleContactsService = new GoogleContactsService();

