import { Router } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth.middleware.js';
import { supabase } from '../services/supabase.service.js';
import { userService } from '../services/user.service.js';

const router = Router();

// GET /me - Get current user profile (auto-create if missing)
router.get('/me', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;
    const userEmail = req.user!.email;
    const accessToken = req.accessToken!;

    const userClient = supabase.getClientForUser(accessToken);

    // Get Google profile information from user metadata
    const userMetadata = req.user!.metadata || {};
    const googleName = userMetadata.full_name || userMetadata.name;
    const googleAvatar = userMetadata.avatar_url || userMetadata.picture;

    // Ensure user is provisioned safely - pass Google info to sync it
    const { profile, workspace } = await userService.getOrCreateWorkspace(
      userId,
      userEmail!,
      userClient,
      {
        full_name: googleName,
        avatar_url: googleAvatar,
      }
    );

    // Sync Google information to database if available and profile doesn't have it
    if ((googleName && !profile.full_name) || (googleAvatar && !profile.avatar_url)) {
      const updates: any = {};
      if (googleName && !profile.full_name) {
        updates.full_name = googleName;
      }
      if (googleAvatar && !profile.avatar_url) {
        updates.avatar_url = googleAvatar;
      }

      if (Object.keys(updates).length > 0) {
        try {
          await userClient
            .from('user_profiles')
            .update(updates)
            .eq('id', userId);

          // Update local profile object
          Object.assign(profile, updates);
        } catch (updateError) {
          console.warn('Failed to sync Google info to profile:', updateError);
        }
      }
    }

    const authMetadata = {
      ...userMetadata,
      avatar_url: googleAvatar,
      full_name: googleName,
      email: req.user!.email,
    };

    const fullProfile = {
      ...profile,
      email: profile.email || req.user!.email, // Ensure email is included
      avatar_url: profile.avatar_url || googleAvatar, // Include avatar_url from profile or Google
      workspaces: workspace ? [workspace] : [],
      auth_metadata: authMetadata,
    };

    res.json(fullProfile);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// PATCH /me - Update user profile
router.patch('/me', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;
    const accessToken = req.accessToken!;
    const { full_name, company_name, company_logo_url, company_address, company_city, company_zip, company_country, company_phone, company_website, primary_color, accent_color } = req.body;

    const userClient = supabase.getClientForUser(accessToken);
    const adminClient = supabase.adminClient || userClient;

    // 1. Fetch actual columns from information_schema to prevent schema cache errors
    let availableColumns: string[] = ['id', 'email', 'full_name', 'created_at', 'updated_at'];
    try {
      // Use a direct query instead of RPC if it's not defined
      const { data: cols, error: colError } = await adminClient
        .from('user_profiles')
        .select('*')
        .limit(1)
        .maybeSingle();

      if (cols) {
        availableColumns = Object.keys(cols);
      }
    } catch (e) {
      console.warn('[UserRoutes] Could not fetch columns, using minimal defaults');
    }

    const updates: any = {};
    const inputFields: any = {
      full_name, company_name, company_logo_url, company_address,
      company_city, company_zip, company_country, company_phone,
      company_website, primary_color, accent_color
    };

    const missingColumns: string[] = [];

    // Only add fields that exist in the DB
    Object.entries(inputFields).forEach(([key, value]) => {
      if (value !== undefined) {
        if (availableColumns.includes(key)) {
          updates[key] = value;
        } else {
          missingColumns.push(key);
        }
      }
    });

    // 2. Perform the update with only valid columns
    const { data: updatedData, error: updateError } = await userClient
      .from('user_profiles')
      .update(updates)
      .eq('id', userId)
      .select(availableColumns.join(','))
      .single();

    if (updateError) {
      console.error(`[UserRoutes] PATCH /me failed:`, updateError.message);
      return res.status(400).json({ error: updateError.message });
    }

    // 3. Return full requested data (including simulated success for missing columns)
    // but add a warning so the UI can notify the user
    res.json({
      ...(updatedData || {}),
      ...inputFields, // Ensure returned object has what user sent
      _missing_columns: missingColumns.length > 0 ? missingColumns : undefined,
      _needs_repair: missingColumns.length > 0
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// GET /debug-schema - Check database schema for troubleshooting
router.get('/debug-schema', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;
    const adminAvailable = !!supabase.adminClient;
    const testClient = supabase.adminClient || supabase.getClientForUser(req.accessToken!);

    const results: any = {
      admin_available: adminAvailable,
      userId,
      checks: {}
    };

    // 1. Check user_profiles table columns
    try {
      const { data, error } = await testClient
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .limit(1)
        .single();

      if (error) {
        results.checks.user_profiles = { error: error.message, code: error.code };
      } else {
        results.checks.user_profiles = {
          status: 'ok',
          columns: Object.keys(data || {}),
          has_logo_col: 'company_logo_url' in (data || {}),
          has_address_col: 'company_address' in (data || {}),
          has_colors_col: 'primary_color' in (data || {})
        };
      }
    } catch (e: any) {
      results.checks.user_profiles = { error: e.message };
    }

    // 2. Check submissions table
    try {
      const { data, error } = await testClient
        .from('submissions')
        .select('*')
        .limit(1);

      if (error && error.code !== 'PGRST116') { // Ignore "no rows" error
        results.checks.submissions = { error: error.message };
      } else {
        const sample = data?.[0] || {};
        results.checks.submissions = {
          status: 'ok',
          columns: Object.keys(sample),
          has_company_col: 'customer_company' in sample,
          has_notes_col: 'customer_notes' in sample
        };
      }
    } catch (e: any) {
      results.checks.submissions = { error: e.message };
    }

    // 3. Recommended SQL Fix
    results.sql_fix = `
-- Run this in Supabase SQL Editor:
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS company_logo_url TEXT;
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS company_address TEXT;
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS primary_color TEXT DEFAULT '#2563eb';
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS accent_color TEXT DEFAULT '#1e40af';
ALTER TABLE public.submissions ADD COLUMN IF NOT EXISTS customer_company TEXT;
ALTER TABLE public.submissions ADD COLUMN IF NOT EXISTS customer_notes TEXT;
    `.trim();

    res.json(results);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
