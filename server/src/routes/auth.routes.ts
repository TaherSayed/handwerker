import express from 'express';
import { authService } from '../services/auth.service.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = express.Router();

// Verify Supabase access token
router.post('/verify', authMiddleware, async (req, res) => {
  try {
    // If we reach here, token is valid (middleware passed)
    res.json({ 
      valid: true, 
      userId: req.userId,
      user: req.user 
    });
  } catch (error: any) {
    res.status(401).json({ error: error.message });
  }
});

// Google OAuth sign in
router.post('/google', async (req, res) => {
  try {
    const { redirectUrl } = req.body;
    const result = await authService.signInWithGoogle(redirectUrl);
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Email sign in
router.post('/signin', async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await authService.signInWithEmail(email, password);
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Email sign up
router.post('/signup', async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await authService.signUpWithEmail(email, password);
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Sign out
router.post('/signout', async (req, res) => {
  try {
    await authService.signOut();
    res.json({ success: true });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Get current user
router.get('/user', async (req, res) => {
  try {
    const user = await authService.getCurrentUser();
    res.json({ user });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Get session
router.get('/session', async (req, res) => {
  try {
    const session = await authService.getSession();
    res.json({ session });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

export default router;

