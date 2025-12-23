import { Router } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth.middleware.js';

const router = Router();

// GET /contacts - Get Google Contacts
router.get('/', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;
    
    // Get user's Google access token from Supabase session
    // Note: This requires the provider_token to be available in the session
    // Supabase stores this when OAuth is completed with proper scopes
    
    // For now, return instructions to use client-side fetching
    // The client will use the provider_token directly from Supabase session
    res.json({ 
      message: 'Use client-side Google Contacts service',
      note: 'Contacts should be fetched client-side using the provider_token from Supabase session'
    });
  } catch (error) {
    console.error('Get contacts error:', error);
    res.status(500).json({ error: 'Failed to fetch contacts' });
  }
});

export default router;

