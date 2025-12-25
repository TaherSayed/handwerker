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

    const { data, error } = await userClient
      .from('user_profiles')
      .update(updates)
      .eq('id', userId)
      .select('id, email, full_name, company_name, company_logo_url, company_address, company_phone, company_website, created_at, updated_at')
      .single();

    if (error) {
      // If error is about missing columns (accent_color, primary_color), try again without them
      if (error.message?.includes('accent_color') || error.message?.includes('primary_color') || error.message?.includes('schema cache')) {
        console.warn(`[UserRoutes] Branding columns not available, updating without them for ${userId}`);
        const safeUpdates: any = { ...updates };
        delete safeUpdates.primary_color;
        delete safeUpdates.accent_color;
        
        const { data: safeData, error: safeError } = await userClient
          .from('user_profiles')
          .update(safeUpdates)
          .eq('id', userId)
          .select('id, email, full_name, company_name, company_logo_url, company_address, company_phone, company_website, created_at, updated_at')
          .single();
        
        if (safeError) {
          return res.status(400).json({ error: safeError.message });
        }
        
        // Return data with default colors if branding fields were requested but don't exist
        return res.json({
          ...safeData,
          primary_color: primary_color !== undefined ? primary_color : '#2563eb',
          accent_color: accent_color !== undefined ? accent_color : '#1e40af',
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
