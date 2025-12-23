import { supabase } from './supabase';

interface GoogleContact {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
}

class GoogleContactsService {
  private async getAccessToken(): Promise<string> {
    const { data: { session } } = await supabase.auth.getSession();
    
    // Try provider_token first (available after OAuth)
    if (session?.provider_token) {
      return session.provider_token;
    }
    
    // Fallback: try to refresh session to get provider_token
    if (session) {
      const { data: refreshedSession } = await supabase.auth.refreshSession();
      if (refreshedSession?.session?.provider_token) {
        return refreshedSession.session.provider_token;
      }
    }
    
    throw new Error('No Google access token available. Please sign in again and grant contacts permission.');
  }

  async fetchContacts(): Promise<GoogleContact[]> {
    try {
      const accessToken = await this.getAccessToken();
      
      const response = await fetch(
        'https://people.googleapis.com/v1/people/me/connections?personFields=names,emailAddresses,phoneNumbers,addresses&pageSize=1000',
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Google authentication expired. Please sign in again.');
        }
        if (response.status === 403) {
          throw new Error('Contacts access denied. Please grant contacts permission.');
        }
        throw new Error(`Failed to fetch contacts: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (!data.connections) {
        return [];
      }

      return data.connections
        .map((contact: any) => {
          const name = contact.names?.[0]?.displayName || 'Unnamed Contact';
          const email = contact.emailAddresses?.[0]?.value;
          const phone = contact.phoneNumbers?.[0]?.value;
          const address = contact.addresses?.[0]?.formattedValue;

          // Only return contacts with at least a name or email
          if (!name && !email) {
            return null;
          }

          return {
            id: contact.resourceName?.replace('people/', '') || contact.id || `contact_${Date.now()}`,
            name,
            email,
            phone,
            address,
          };
        })
        .filter((contact: GoogleContact | null) => contact !== null);
    } catch (error: any) {
      console.error('Fetch contacts error:', error);
      throw new Error(error.message || 'Failed to load Google Contacts');
    }
  }

  async searchContacts(query: string): Promise<GoogleContact[]> {
    const contacts = await this.fetchContacts();
    const lowerQuery = query.toLowerCase();
    
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

