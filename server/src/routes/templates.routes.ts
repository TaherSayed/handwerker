import { Router } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth.middleware.js';
import { supabase } from '../services/supabase.service.js';

const router = Router();

// GET /templates - List all templates
router.get('/', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;
    const accessToken = req.accessToken!;
    const { is_archived } = req.query;

    const userClient = supabase.getClientForUser(accessToken);

    let query = userClient
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
    const accessToken = req.accessToken!;

    const userClient = supabase.getClientForUser(accessToken);

    const { data, error } = await userClient
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
    const accessToken = req.accessToken!;
    const { name, description, category, tags, fields } = req.body;

    // Validate required fields
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return res.status(400).json({ 
        error: 'Template name is required',
        success: false 
      });
    }

    // Validate fields array
    if (!Array.isArray(fields)) {
      return res.status(400).json({ 
        error: 'Fields must be an array',
        success: false 
      });
    }

    // Get Supabase client with user's token for RLS
    const userClient = supabase.getClientForUser(accessToken);

    // Get or create user's workspace
    let { data: workspace, error: workspaceError } = await userClient
      .from('workspaces')
      .select('id')
      .eq('owner_id', userId)
      .limit(1)
      .single();

    // Handle case where workspaces table doesn't exist
    if (workspaceError) {
      const errorMessage = workspaceError.message || '';
      if (errorMessage.includes('does not exist') || errorMessage.includes('schema cache')) {
        console.error('❌ Database schema error: workspaces table not found');
        console.error('📋 Please run the migration: supabase/migrations/20251223_onsite_complete_schema.sql');
        return res.status(500).json({ 
          error: 'Database schema not initialized. Please run the migration file in Supabase SQL Editor.',
          success: false,
          details: 'The workspaces table does not exist. See MIGRATION_GUIDE.md for instructions.'
        });
      }
    }

    if (!workspace || workspaceError) {
      // Auto-create workspace if it doesn't exist
      const { data: profile } = await userClient
        .from('user_profiles')
        .select('full_name, company_name')
        .eq('id', userId)
        .single();

      const workspaceName = profile?.company_name || profile?.full_name || 'My Workspace';
      
      const { data: newWorkspace, error: createError } = await userClient
        .from('workspaces')
        .insert({
          owner_id: userId,
          name: workspaceName,
        })
        .select()
        .single();

      if (createError || !newWorkspace) {
        console.error('Workspace creation error:', createError);
        return res.status(500).json({ 
          error: createError?.message || 'Failed to create workspace',
          success: false 
        });
      }
      workspace = newWorkspace;
    }

    if (!workspace || !workspace.id) {
      return res.status(500).json({ 
        error: 'No workspace available',
        success: false 
      });
    }

    const { data, error } = await userClient
      .from('form_templates')
      .insert({
        workspace_id: workspace.id,
        user_id: userId,
        name: name.trim(),
        description: description || null,
        category: category || null,
        tags: tags || [],
        fields: fields || [],
      })
      .select()
      .single();

    if (error) {
      console.error('Template creation error:', error);
      return res.status(500).json({ 
        error: error.message || 'Failed to save template',
        success: false 
      });
    }

    if (!data) {
      return res.status(500).json({ 
        error: 'Template was not created',
        success: false 
      });
    }

    res.status(201).json(data);
  } catch (error: any) {
    console.error('Create template error:', error);
    res.status(500).json({ 
      error: error.message || 'Failed to create template',
      success: false 
    });
  }
});

// PUT /templates/:id - Update template
router.put('/:id', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;
    const accessToken = req.accessToken!;
    const { name, description, category, tags, fields, is_archived } = req.body;

    const userClient = supabase.getClientForUser(accessToken);

    // Validate template name if provided
    if (name !== undefined && (!name || typeof name !== 'string' || name.trim().length === 0)) {
      return res.status(400).json({ 
        error: 'Template name cannot be empty',
        success: false 
      });
    }

    // Validate fields array if provided
    if (fields !== undefined && !Array.isArray(fields)) {
      return res.status(400).json({ 
        error: 'Fields must be an array',
        success: false 
      });
    }

    const updates: any = {};
    if (name !== undefined) updates.name = name.trim();
    if (description !== undefined) updates.description = description || null;
    if (category !== undefined) updates.category = category || null;
    if (tags !== undefined) updates.tags = tags || [];
    if (fields !== undefined) updates.fields = fields || [];
    if (is_archived !== undefined) updates.is_archived = is_archived;

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ 
        error: 'No fields to update',
        success: false 
      });
    }

    const { data, error } = await userClient
      .from('form_templates')
      .update(updates)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      console.error('Template update error:', error);
      return res.status(500).json({ 
        error: error.message || 'Failed to update template',
        success: false 
      });
    }

    if (!data) {
      return res.status(404).json({ 
        error: 'Template not found',
        success: false 
      });
    }

    res.json(data);
  } catch (error: any) {
    console.error('Update template error:', error);
    res.status(500).json({ 
      error: error.message || 'Failed to update template',
      success: false 
    });
  }
});

// DELETE /templates/:id - Delete template
router.delete('/:id', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;
    const accessToken = req.accessToken!;

    const userClient = supabase.getClientForUser(accessToken);

    const { error } = await userClient
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
    const accessToken = req.accessToken!;

    const userClient = supabase.getClientForUser(accessToken);

    // Get original template
    const { data: original, error: fetchError } = await userClient
      .from('form_templates')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (fetchError) {
      return res.status(404).json({ error: 'Template not found' });
    }

    // Create duplicate
    const { data, error } = await userClient
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

