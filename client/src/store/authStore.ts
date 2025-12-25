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
      // 1. Immediate Hydration from Cache (Performance & Multi-platform persistence)
      const cachedProfile = localStorage.getItem(CACHE_KEY);
      if (cachedProfile) {
        try {
          set({ profile: JSON.parse(cachedProfile) });
        } catch (e) {
          console.error('Failed to parse cached profile');
        }
      }

      const { data: { session } } = await supabase.auth.getSession();

      if (session?.user) {
        set({ user: session.user });
        // Background refresh to ensure fresh data
        get().refreshProfile();
      }

      set({ loading: false, initialized: true });

      // Listen for auth changes
      supabase.auth.onAuthStateChange(async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          set({ user: session.user });
          await get().refreshProfile();
        } else if (event === 'SIGNED_OUT') {
          set({ user: null, profile: null });
          localStorage.removeItem(CACHE_KEY);
        }
      });
    } catch (error) {
      console.error('Initialize error:', error);
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
