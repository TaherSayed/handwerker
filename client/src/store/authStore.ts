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
    try {
      // 1. Immediate Hydration from Cache (Super Fast - Unlock UI immediately)
      const cachedProfile = localStorage.getItem(CACHE_KEY);
      if (cachedProfile) {
        try {
          const profile = JSON.parse(cachedProfile);
          set({ profile, loading: false, initialized: true }); // Unlock UI immediately
        } catch (e) {
          console.error('Failed to parse cached profile');
          localStorage.removeItem(CACHE_KEY);
        }
      } else {
        // If no cache, unblock UI immediately (user can sign in)
        set({ loading: false, initialized: true });
      }

      // 2. Race Session Check (Don't block - run in background)
      const sessionPromise = supabase.auth.getSession();
      const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('Auth timeout')), 1500));

      Promise.race([sessionPromise, timeoutPromise])
        .then((result: any) => {
          const { data: { session } } = result || { data: { session: null } };
          if (session?.user) {
            set({ user: session.user });
            // Background refresh ensures data consistency without blocking
            get().refreshProfile().catch(() => {});
          }
        })
        .catch((error) => {
          console.warn('Auth check slow/failed, using cache if available:', error);
        });

      // 3. Setup Listeners (non-blocking)
      supabase.auth.onAuthStateChange(async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          set({ user: session.user });
          get().refreshProfile().catch(() => {});
        } else if (event === 'SIGNED_OUT') {
          set({ user: null, profile: null });
          localStorage.removeItem(CACHE_KEY);
        }
      });
    } catch (error) {
      console.error('Initialize critical failure:', error);
      set({ loading: false, initialized: true });
    }
  },

  signIn: async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
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
    await supabase.auth.signOut();
    localStorage.removeItem(CACHE_KEY);
    set({ user: null, profile: null });
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
