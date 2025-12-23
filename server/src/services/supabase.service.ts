import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { config } from '../config/env.js';

export class SupabaseService {
  private static instance: SupabaseService;
  public client: SupabaseClient;
  public adminClient: SupabaseClient;

  private constructor() {
    this.client = createClient(config.supabase.url, config.supabase.anonKey);
    this.adminClient = createClient(config.supabase.url, config.supabase.serviceRoleKey);
  }

  public static getInstance(): SupabaseService {
    if (!SupabaseService.instance) {
      SupabaseService.instance = new SupabaseService();
    }
    return SupabaseService.instance;
  }

  public getClientForUser(accessToken: string): SupabaseClient {
    return createClient(config.supabase.url, config.supabase.anonKey, {
      global: {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    });
  }
}

export const supabase = SupabaseService.getInstance();
