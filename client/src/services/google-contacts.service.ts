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
  private syncInterval: any = null;

  async fetchContacts(forceRefresh = false): Promise<GoogleContact[]> {
    try {
      if (!forceRefresh) {
        const localContacts = await db.contacts.toArray();
        if (localContacts.length > 0) {
          // Check if cache is fresh (e.g., < 1 hour for passive use)
          const firstContact = localContacts[0] as LocalContact;
          if (Date.now() - (firstContact as any).synced_at < 3600000) {
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

      // If error is 401/403, we should probably stop sync
      if (error.message?.includes('401') || error.message?.includes('403')) {
        this.stopAutoSync();
      }

      if (localContacts.length > 0) return localContacts;
      throw new Error(error.message || 'Failed to load Google Contacts');
    }
  }

  startAutoSync(intervalMs = 30000) {
    if (this.syncInterval) return;

    console.log('[ContactsSync] Starting background sync every', intervalMs / 1000, 'seconds');

    // Perform initial sync immediately (don't wait for interval)
    if (document.visibilityState === 'visible' && navigator.onLine) {
      this.fetchContacts(true).catch(err => console.warn('[ContactsSync] Initial sync failed:', err.message));
    }

    this.syncInterval = setInterval(() => {
      // Small optimization: only sync if window is active and user is online
      if (document.visibilityState === 'visible' && navigator.onLine) {
        this.fetchContacts(true).catch(err => {
          console.warn('[ContactsSync] Background sync failed:', err.message);
        });
      }
    }, intervalMs);
  }

  stopAutoSync() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
      console.log('[ContactsSync] Background sync stopped');
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
