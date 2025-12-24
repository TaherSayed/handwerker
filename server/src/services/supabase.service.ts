import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { config } from '../config/env.js';

export class SupabaseService {
  private static instance: SupabaseService;
  public client: SupabaseClient;
  public adminClient: SupabaseClient | null;

  private constructor() {
    this.client = createClient(config.supabase.url, config.supabase.anonKey);

    // Only create admin client if service role key is provided
    if (config.supabase.serviceRoleKey) {
      this.adminClient = createClient(config.supabase.url, config.supabase.serviceRoleKey);
    } else {
      this.adminClient = null;
      console.warn('⚠️ SUPABASE_SERVICE_ROLE_KEY not provided - admin operations will be disabled');
    }
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
  public async ensureStorageBuckets() {
    if (!this.adminClient) {
      console.warn('⚠️ Cannot ensure storage buckets: Admin client not available');
      return;
    }

    const buckets = ['company-logos', 'submission-pdfs', 'submission-photos', 'visit-pdfs'];
    console.log('📦 Verifying storage buckets...');

    try {
      const { data: existingBuckets, error } = await this.adminClient.storage.listBuckets();

      if (error) {
        console.error('❌ Failed to list buckets:', error);
        return;
      }

      const existingNames = existingBuckets?.map(b => b.name) || [];

      for (const bucket of buckets) {
        if (!existingNames.includes(bucket)) {
          console.log(`   → Creating missing bucket: ${bucket}`);
          const { error: createError } = await this.adminClient.storage.createBucket(bucket, {
            public: true, // Make them public by default for simpler access
            fileSizeLimit: 5242880, // 5MB limit
            allowedMimeTypes: bucket.includes('pdf') ? ['application/pdf'] : ['image/png', 'image/jpeg', 'image/jpg', 'image/webp']
          });

          if (createError) {
            console.error(`   ❌ Failed to create bucket ${bucket}:`, createError);
          } else {
            console.log(`   ✅ Created bucket: ${bucket}`);
          }
        } else {
          // Ensure public setting is true if possible, though updateBucket is limited
          // For now, just log presence
          console.log(`   ✓ Bucket exists: ${bucket}`);
        }
      }
    } catch (err) {
      console.error('❌ Error in bucket verification:', err);
    }
  }
}

export const supabase = SupabaseService.getInstance();
