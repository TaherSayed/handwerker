import { create } from 'zustand';
import { createClient } from '@supabase/supabase-js';
import type { User, Session } from '@supabase/supabase-js';
import axios from 'axios';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Validate environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY');
  console.error('💡 These must be set as environment variables during build time in Coolify');
  console.error('💡 Add them in Coolify dashboard: Environment Variables → Build Variables');
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  importingContacts: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  initialize: () => Promise<void>;
  importGoogleContacts: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  session: null,
  loading: true,
  importingContacts: false,

  initialize: async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      set({ user: session?.user ?? null, session, loading: false });

      // Check if this is a Google OAuth callback and import contacts
      if (session?.provider_token && session?.provider_refresh_token) {
        // User just signed in with Google, import contacts
        setTimeout(() => {
          get().importGoogleContacts();
        }, 1000); // Small delay to ensure session is fully set
      }

      supabase.auth.onAuthStateChange(async (_event, session) => {
        set({ user: session?.user ?? null, session });
        
        // If user signed in with Google and we have provider token, import contacts
        if (session?.provider_token && _event === 'SIGNED_IN') {
          setTimeout(() => {
            get().importGoogleContacts();
          }, 1000);
        }
      });
    } catch (error) {
      console.error('Auth initialization error:', error);
      set({ loading: false });
    }
  },

  importGoogleContacts: async () => {
    const { user, session } = get();
    if (!user || !session?.provider_token) {
      console.log('No Google access token available');
      return;
    }

    try {
      set({ importingContacts: true });
      const response = await axios.post('/api/google/contacts/import', {
        accessToken: session.provider_token,
        userId: user.id,
      });
      
      console.log(`✅ Imported ${response.data?.length || 0} contacts from Google`);
      return response.data;
    } catch (error: any) {
      console.error('Failed to import Google contacts:', error);
      // Don't show error to user, just log it
    } finally {
      set({ importingContacts: false });
    }
  },

  signInWithGoogle: async () => {
    const redirectUrl = `${window.location.origin}/`;
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUrl,
        scopes: 'email profile https://www.googleapis.com/auth/contacts.readonly',
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    });

    if (error) throw error;
    if (data.url) {
      window.location.href = data.url;
    }
  },

  signInWithEmail: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    set({ user: data.user, session: data.session });
  },

  signUpWithEmail: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) throw error;
    set({ user: data.user, session: data.session });
  },

  signOut: async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    set({ user: null, session: null });
  },
}));

// Initialize on load
useAuthStore.getState().initialize();

