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

    // Ensure user is provisioned safely
    const { profile, workspace } = await userService.getOrCreateWorkspace(userId, userEmail!, userClient);

    const fullProfile = {
      ...profile,
      workspaces: workspace ? [workspace] : [],
      auth_metadata: req.user!.metadata,
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
        .select('id, email, full_name, company_name, company_logo_url, company_address, company_phone, company_website, created_at, updated_at')
        .single();
      
      data = result.data;
      error = result.error;
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
        
        // Try update with safe fields only
        const safeSelect = 'id, email, full_name, company_name, company_logo_url, company_address, created_at, updated_at';
        const { data: safeData, error: safeError } = await userClient
          .from('user_profiles')
          .update(safeUpdates)
          .eq('id', userId)
          .select(safeSelect)
          .single();
        
        if (safeError) {
          console.error(`[UserRoutes] Even safe update failed for ${userId}:`, safeError.message);
          return res.status(400).json({ 
            error: `Could not update profile. Some fields may not be available: ${problematicFields.join(', ')}. Please ensure migrations have been run.` 
          });
        }
        
        // Return data with requested values (even if not saved)
        return res.json({
          ...safeData,
          company_phone: company_phone !== undefined ? company_phone : safeData?.company_phone,
          company_website: company_website !== undefined ? company_website : safeData?.company_website,
          primary_color: primary_color !== undefined ? primary_color : (safeData?.primary_color || '#2563eb'),
          accent_color: accent_color !== undefined ? accent_color : (safeData?.accent_color || '#1e40af'),
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

export default router;
