import { create } from 'zustand';
import { supabase } from '../services/supabase';
import { apiService } from '../services/api.service';
import { User } from '@supabase/supabase-js';

interface AuthState {
  user: User | null;
  profile: any | null;
  loading: boolean;
  initialized: boolean;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  initialize: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const CACHE_KEY = 'onsite_auth_profile_cache';

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  profile: null,
  loading: true,
  initialized: false,

  initialize: async () => {
    // Prevent double initialization
    if (get().initialized) return;

    try {
      // 1. Initial Session Check (Blocking to prevent loop)
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      if (sessionError) {
        console.error('Initial session check error:', sessionError);
      }

      if (session?.user) {
        set({ user: session.user });
        // Fetch profile but don't strictly block UI if we have a cache
        const cachedProfile = localStorage.getItem(CACHE_KEY);
        if (cachedProfile) {
          set({ profile: JSON.parse(cachedProfile) });
        }
        // Refresh in background
        get().refreshProfile().catch(() => { });
      } else {
        // No session found, clear cache to be safe
        localStorage.removeItem(CACHE_KEY);
        set({ user: null, profile: null });
      }

      // 2. Setup Real-time Listener
      supabase.auth.onAuthStateChange(async (event, session) => {
        console.log('Auth state change:', event, session?.user?.email);

        if ((event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') && session?.user) {
          set({ user: session.user });
          get().refreshProfile().catch(() => { });
        } else if (event === 'SIGNED_OUT') {
          set({ user: null, profile: null });
          localStorage.removeItem(CACHE_KEY);
        }
      });

    } catch (error) {
      console.error('Initialize critical failure:', error);
    } finally {
      // Always mark as initialized and stop loading
      set({ initialized: true, loading: false });
    }
  },

  signIn: async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          // Use absolute URL for callback if possible, or reliable origin
          redirectTo: `${window.location.origin}/auth/callback`,
          scopes: 'email profile https://www.googleapis.com/auth/contacts.readonly',
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
          skipBrowserRedirect: false,
        },
      });
      if (error) {
        console.error('Google sign in error:', error);
        throw new Error(error.message || 'Failed to sign in with Google');
      }
    } catch (error: any) {
      console.error('Sign in error:', error);
      throw error;
    }
  },

  signOut: async () => {
    try {
      await supabase.auth.signOut();
      localStorage.removeItem(CACHE_KEY);
      set({ user: null, profile: null });
    } catch (error) {
      console.error('Sign out error:', error);
    }
  },

  refreshProfile: async () => {
    try {
      const profile = await apiService.getMe();
      if (profile) {
        set({ profile });
        localStorage.setItem(CACHE_KEY, JSON.stringify(profile));
      }
    } catch (error) {
      console.error('Refresh profile error:', error);
    }
  },
}));
