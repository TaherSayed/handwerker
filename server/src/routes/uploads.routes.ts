import { Router } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth.middleware.js';
import { supabase } from '../services/supabase.service.js';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// POST /uploads/signed-url - Get signed URL for upload
router.post('/signed-url', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;
    const { bucket, file_name, content_type } = req.body;

    if (!bucket || !file_name) {
      return res.status(400).json({ error: 'bucket and file_name are required' });
    }

    // Validate bucket
    const allowedBuckets = ['submission-photos', 'company-logos', 'submission-pdfs'];
    if (!allowedBuckets.includes(bucket)) {
      return res.status(400).json({ error: 'Invalid bucket' });
    }

    // Generate unique file path
    const fileExt = file_name.split('.').pop();
    const uniqueFileName = `${userId}/${uuidv4()}.${fileExt}`;

    // Create signed URL (use adminClient if available, otherwise regular client)
    const storageClient = supabase.adminClient || supabase.client;
    const { data, error } = await storageClient.storage
      .from(bucket)
      .createSignedUploadUrl(uniqueFileName);

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({
      signed_url: data.signedUrl,
      path: data.path,
      token: data.token,
    });
  } catch (error) {
    console.error('Generate signed URL error:', error);
    res.status(500).json({ error: 'Failed to generate signed URL' });
  }
});

// POST /uploads/submission-photo - Upload submission photo
router.post('/submission-photo', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;
    const { submission_id, field_name, storage_path, photo_url } = req.body;

    if (!submission_id || !field_name || !storage_path || !photo_url) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Verify submission belongs to user
    const { data: submission } = await supabase.client
      .from('submissions')
      .select('id')
      .eq('id', submission_id)
      .eq('user_id', userId)
      .single();

    if (!submission) {
      return res.status(404).json({ error: 'Submission not found' });
    }

    // Create photo record
    const { data, error } = await supabase.client
      .from('submission_photos')
      .insert({
        submission_id,
        field_name,
        photo_url,
        storage_path,
      })
      .select()
      .single();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.status(201).json(data);
  } catch (error) {
    console.error('Upload submission photo error:', error);
    res.status(500).json({ error: 'Failed to upload photo' });
  }
});

export default router;

