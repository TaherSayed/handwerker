import { Router } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth.middleware.js';
import { supabase } from '../services/supabase.service.js';

const router = Router();

// GET /templates - List all templates
router.get('/', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;
    const { is_archived } = req.query;

    let query = supabase.client
      .from('form_templates')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (is_archived !== undefined) {
      query = query.eq('is_archived', is_archived === 'true');
    }

    const { data, error } = await query;

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json(data);
  } catch (error) {
    console.error('List templates error:', error);
    res.status(500).json({ error: 'Failed to fetch templates' });
  }
});

// GET /templates/:id - Get single template
router.get('/:id', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    const { data, error } = await supabase.client
      .from('form_templates')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (error) {
      return res.status(404).json({ error: 'Template not found' });
    }

    res.json(data);
  } catch (error) {
    console.error('Get template error:', error);
    res.status(500).json({ error: 'Failed to fetch template' });
  }
});

// POST /templates - Create new template
router.post('/', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;
    const { name, description, category, tags, fields } = req.body;

    // Get user's workspace
    const { data: workspaces } = await supabase.client
      .from('workspaces')
      .select('id')
      .eq('owner_id', userId)
      .limit(1)
      .single();

    if (!workspaces) {
      return res.status(400).json({ error: 'No workspace found' });
    }

    const { data, error } = await supabase.client
      .from('form_templates')
      .insert({
        workspace_id: workspaces.id,
        user_id: userId,
        name,
        description,
        category,
        tags: tags || [],
        fields: fields || [],
      })
      .select()
      .single();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.status(201).json(data);
  } catch (error) {
    console.error('Create template error:', error);
    res.status(500).json({ error: 'Failed to create template' });
  }
});

// PUT /templates/:id - Update template
router.put('/:id', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;
    const { name, description, category, tags, fields, is_archived } = req.body;

    const updates: any = {};
    if (name !== undefined) updates.name = name;
    if (description !== undefined) updates.description = description;
    if (category !== undefined) updates.category = category;
    if (tags !== undefined) updates.tags = tags;
    if (fields !== undefined) updates.fields = fields;
    if (is_archived !== undefined) updates.is_archived = is_archived;

    const { data, error } = await supabase.client
      .from('form_templates')
      .update(updates)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json(data);
  } catch (error) {
    console.error('Update template error:', error);
    res.status(500).json({ error: 'Failed to update template' });
  }
});

// DELETE /templates/:id - Delete template
router.delete('/:id', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    const { error } = await supabase.client
      .from('form_templates')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.status(204).send();
  } catch (error) {
    console.error('Delete template error:', error);
    res.status(500).json({ error: 'Failed to delete template' });
  }
});

// POST /templates/:id/duplicate - Duplicate template
router.post('/:id/duplicate', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    // Get original template
    const { data: original, error: fetchError } = await supabase.client
      .from('form_templates')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (fetchError) {
      return res.status(404).json({ error: 'Template not found' });
    }

    // Create duplicate
    const { data, error } = await supabase.client
      .from('form_templates')
      .insert({
        workspace_id: original.workspace_id,
        user_id: userId,
        name: `${original.name} (Copy)`,
        description: original.description,
        category: original.category,
        tags: original.tags,
        fields: original.fields,
      })
      .select()
      .single();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.status(201).json(data);
  } catch (error) {
    console.error('Duplicate template error:', error);
    res.status(500).json({ error: 'Failed to duplicate template' });
  }
});

export default router;

