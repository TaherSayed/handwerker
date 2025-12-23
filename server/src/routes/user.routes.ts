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
      workspaces: workspace ? [workspace] : []
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
    const { full_name, company_name, company_logo_url } = req.body;

    const userClient = supabase.getClientForUser(accessToken);

    const updates: any = {};
    if (full_name !== undefined) updates.full_name = full_name;
    if (company_name !== undefined) updates.company_name = company_name;
    if (company_logo_url !== undefined) updates.company_logo_url = company_logo_url;

    const { data, error } = await userClient
      .from('user_profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json(data);
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

export default router;
