import { apiService } from './api.service';
import { db, LocalContact } from './db.service';

interface GoogleContact {
  id: string;
  name: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  address?: string;
  street?: string;
  city?: string;
  zip?: string;
  company?: string;
  notes?: string;
}

class GoogleContactsService {
  async fetchContacts(forceRefresh = false): Promise<GoogleContact[]> {
    try {
      if (!forceRefresh) {
        const localContacts = await db.contacts.toArray();
        if (localContacts.length > 0) {
          // Check if cache is fresh (e.g., < 1 hour)
          const firstContact = localContacts[0] as LocalContact;
          if (Date.now() - firstContact.synced_at < 3600000) {
            return localContacts;
          }
        }
      }

      const contacts = await apiService.getContacts() as GoogleContact[];
      if (contacts && Array.isArray(contacts)) {
        // Update local cache
        const localData: LocalContact[] = contacts.map(c => ({
          ...c,
          synced_at: Date.now()
        }));

        await db.contacts.clear();
        await db.contacts.bulkAdd(localData);
      }

      return contacts || [];
    } catch (error: any) {
      console.error('Fetch contacts error:', error);
      // Fallback to local data on error
      const localContacts = await db.contacts.toArray();
      if (localContacts.length > 0) return localContacts;
      throw new Error(error.message || 'Failed to load Google Contacts');
    }
  }

  async searchContacts(query: string): Promise<GoogleContact[]> {
    const lowerQuery = query.toLowerCase();

    // Search in local DB first for instant results
    const localMatches = await db.contacts
      .filter((c: any) =>
        c.name.toLowerCase().includes(lowerQuery) ||
        (c.email?.toLowerCase().includes(lowerQuery) || false) ||
        (c.phone?.includes(query) || false)
      )
      .toArray();

    if (localMatches.length > 0) return localMatches;

    // If not found locally, fetch fresh
    const contacts = await this.fetchContacts();
    return contacts.filter(
      (contact) =>
        contact.name?.toLowerCase().includes(lowerQuery) ||
        contact.email?.toLowerCase().includes(lowerQuery) ||
        contact.phone?.includes(query)
    );
  }
}

export const googleContactsService = new GoogleContactsService();
export type { GoogleContact };

