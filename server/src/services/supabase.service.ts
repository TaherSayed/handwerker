import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️ WARNING: Supabase credentials not configured!');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const isConfigured = supabaseUrl && supabaseAnonKey;

