import { createClient } from '@supabase/supabase-js';
import { env } from '../config/env.js';

export const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY);

export const isConfigured = true; // Always configured if we reach here (env validation happens in env.ts)

