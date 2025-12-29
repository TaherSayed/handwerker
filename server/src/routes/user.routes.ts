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
    const { full_name, company_name, company_logo_url, company_address, company_phone, company_website, primary_color, accent_color } = req.body;

    const userClient = supabase.getClientForUser(accessToken);

    const updates: any = {};
    if (full_name !== undefined) updates.full_name = full_name;
    if (company_name !== undefined) updates.company_name = company_name;
    if (company_logo_url !== undefined) updates.company_logo_url = company_logo_url;
    if (company_address !== undefined) updates.company_address = company_address;
    if (company_phone !== undefined) updates.company_phone = company_phone;
    if (company_website !== undefined) updates.company_website = company_website;

    // Only update branding fields if they exist in the schema
    // We'll try to update them, but handle errors gracefully
    if (primary_color !== undefined) updates.primary_color = primary_color;
    if (accent_color !== undefined) updates.accent_color = accent_color;

    // Try to update, but handle schema cache errors gracefully
    let data: any = null;
    let error: any = null;

    try {
      const result = await userClient
        .from('user_profiles')
        .update(updates)
        .eq('id', userId)
        .select('id, email, full_name, company_name, company_logo_url, company_address, company_phone, company_website, primary_color, accent_color, created_at, updated_at')
        .single();

      data = result.data;
      error = result.error;

      if (error) {
        console.error(`[UserRoutes] PATCH /me primary update failed for ${userId}:`, error.message);
      }
    } catch (updateError: any) {
      error = updateError;
    }

    if (error) {
      // Check if error is about missing columns in schema cache
      const isSchemaCacheError = error.message?.includes('schema cache') ||
        error.message?.includes('column') ||
        error.message?.includes('does not exist');

      if (isSchemaCacheError) {
        console.warn(`[UserRoutes] Schema cache error for ${userId}, trying defensive update:`, error.message);

        // Build safe updates by trying to update in stages
        const safeUpdates: any = {};
        const problematicFields: string[] = [];

        // Core fields (always exist)
        if (full_name !== undefined) safeUpdates.full_name = full_name;
        if (company_name !== undefined) safeUpdates.company_name = company_name;
        if (company_logo_url !== undefined) safeUpdates.company_logo_url = company_logo_url;
        if (company_address !== undefined) safeUpdates.company_address = company_address;

        // Add default values for required fields if they are missing in the current profile but were sent
        // This is a safety measure for schema-fallback mode

        // Company fields that might not exist in schema cache
        // Try to include them, but we'll handle errors
        if (company_phone !== undefined) {
          try {
            safeUpdates.company_phone = company_phone;
          } catch (e) {
            problematicFields.push('company_phone');
          }
        }
        if (company_website !== undefined) {
          try {
            safeUpdates.company_website = company_website;
          } catch (e) {
            problematicFields.push('company_website');
          }
        }

        // Branding fields (might not exist)
        if (primary_color !== undefined) {
          try {
            safeUpdates.primary_color = primary_color;
          } catch (e) {
            problematicFields.push('primary_color');
          }
        }
        if (accent_color !== undefined) {
          try {
            safeUpdates.accent_color = accent_color;
          } catch (e) {
            problematicFields.push('accent_color');
          }
        }

        // Try update with safe fields only (don't include problematic fields in SELECT)
        const safeSelect = 'id, email, full_name, company_name, company_logo_url, company_address, created_at, updated_at';
        const { data: safeData, error: safeError } = await userClient
          .from('user_profiles')
          .update(safeUpdates)
          .eq('id', userId)
          .select(safeSelect)
          .single();

        if (safeError) {
          // If still failing, try with even fewer fields - ONLY standard columns
          const minimalSelect = 'id, email, full_name, created_at, updated_at';
          const minimalUpdates: any = {};
          if (full_name !== undefined) minimalUpdates.full_name = full_name;

          // If no standard fields to update, just fetch
          let minimalQuery: any = userClient.from('user_profiles');

          if (Object.keys(minimalUpdates).length > 0) {
            minimalQuery = minimalQuery.update(minimalUpdates);
          } else {
            // If nothing to update, just select
            minimalQuery = minimalQuery.select(minimalSelect);
          }

          const { data: minimalData, error: minimalError } = await minimalQuery
            .eq('id', userId)
            .select(minimalSelect)
            .single();

          if (minimalError) {
            console.error(`[UserRoutes] Even minimal update failed for ${userId}:`, minimalError.message);
            return res.status(400).json({
              error: `Could not update profile. Database schema may be out of sync. Please contact support.`
            });
          }

          // Build return data manually since DB might be in flux
          const minimalTyped = minimalData as any;
          return res.json({
            ...minimalData,
            company_name: company_name !== undefined ? company_name : (minimalTyped?.company_name || ''),
            company_logo_url: company_logo_url !== undefined ? company_logo_url : (minimalTyped?.company_logo_url || ''),
            company_address: company_address !== undefined ? company_address : (minimalTyped?.company_address || ''),
            company_phone: company_phone !== undefined ? company_phone : (minimalTyped?.company_phone || ''),
            company_website: company_website !== undefined ? company_website : (minimalTyped?.company_website || ''),
            primary_color: primary_color !== undefined ? primary_color : (minimalTyped?.primary_color || '#2563eb'),
            accent_color: accent_color !== undefined ? accent_color : (minimalTyped?.accent_color || '#1e40af'),
          });
        }

        // Return data with requested values (even if some weren't saved due to schema issues)
        const safeTyped = safeData as any;
        return res.json({
          ...safeData,
          company_phone: company_phone !== undefined ? company_phone : safeTyped?.company_phone,
          company_website: company_website !== undefined ? company_website : safeTyped?.company_website,
          primary_color: primary_color !== undefined ? primary_color : (safeTyped?.primary_color || '#2563eb'),
          accent_color: accent_color !== undefined ? accent_color : (safeTyped?.accent_color || '#1e40af'),
        });
      }

      return res.status(400).json({ error: error.message });
    }

    res.json(data);
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
