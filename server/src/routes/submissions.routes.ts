import { Router } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth.middleware.js';
import { supabase } from '../services/supabase.service.js';
import { userService } from '../services/user.service.js';
import { pdfService } from '../services/pdf.service.js';

const router = Router();

// GET /submissions - List all submissions
router.get('/', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;
    const accessToken = req.accessToken!;
    const { status, template_id } = req.query;

    const userClient = supabase.getClientForUser(accessToken);

    let query = userClient
      .from('submissions')
      .select('*, form_templates(name)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (status) {
      query = query.eq('status', status as string);
    }
    if (template_id) {
      query = query.eq('template_id', template_id as string);
    }

    const { data, error } = await query;

    if (error) {
      console.error('[Submissions] Index error:', error);
      return res.status(400).json({ error: error.message, success: false });
    }

    res.json(data);
  } catch (error: any) {
    console.error('List submissions error:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch submissions', success: false });
  }
});

// GET /submissions/:id - Get single submission
router.get('/:id', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;
    const accessToken = req.accessToken!;

    const userClient = supabase.getClientForUser(accessToken);

    const { data, error } = await userClient
      .from('submissions')
      .select('*, form_templates(*), submission_photos(*)')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (error) {
      return res.status(404).json({ error: 'Submission not found' });
    }

    res.json(data);
  } catch (error) {
    console.error('Get submission error:', error);
    res.status(500).json({ error: 'Failed to fetch submission' });
  }
});

// POST /submissions - Create new submission
router.post('/', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;
    const accessToken = req.accessToken!;
    const {
      template_id,
      customer_name,
      customer_email,
      customer_phone,
      customer_address,
      customer_company,
      customer_notes,
      customer_contact_id,
      field_values,
      signature_url,
      status,
    } = req.body;

    // Basic validation
    if (!template_id) {
      return res.status(400).json({ error: 'Vorlagen-ID (template_id) ist erforderlich', success: false });
    }

    if (!customer_name && status === 'submitted') {
      return res.status(400).json({ error: 'Kundenname ist für Einreichungen erforderlich', success: false });
    }

    const userClient = supabase.getClientForUser(accessToken);

    // Get or create user's workspace safely
    // If this fails, we'll try to proceed without workspace (for backward compatibility)
    let workspace: any = null;
    try {
      const result = await userService.getOrCreateWorkspace(userId, req.user!.email!, userClient);
      workspace = result.workspace;
    } catch (workspaceError: any) {
      console.warn(`[Submissions] Workspace creation failed for ${userId}, attempting to proceed:`, workspaceError.message);
      // Try to get existing workspace as fallback
      try {
        const { data: existingWorkspace } = await userClient
          .from('workspaces')
          .select('id, name')
          .eq('owner_id', userId)
          .limit(1)
          .single();
        workspace = existingWorkspace;
      } catch (fallbackError) {
        console.error(`[Submissions] Could not get workspace for ${userId}:`, fallbackError);
        // Continue without workspace - some deployments may not require it
      }
    }

    // Workspace is optional - only fail if it's explicitly required by schema
    // For now, we'll allow submissions without workspace_id if it's nullable
    const workspaceId = workspace?.id || null;

    // Build insert data - workspace_id is optional
    const insertData: any = {
      template_id,
      user_id: userId,
      customer_name,
      customer_email,
      customer_phone,
      customer_address,
      customer_company,
      customer_notes,
      customer_contact_id,
      field_values: field_values || {},
      signature_url,
      status: status || 'draft',
      submitted_at: status === 'submitted' ? new Date().toISOString() : null,
    };

    // Only include workspace_id if we have one (may be nullable in schema)
    if (workspaceId) {
      insertData.workspace_id = workspaceId;
    }

    const { data, error } = await userClient
      .from('submissions')
      .insert(insertData)
      .select()
      .single();

    if (error) {
      console.error('[Submissions] Create error:', error);
      return res.status(400).json({ error: error.message, success: false });
    }

    res.status(201).json(data);
  } catch (error) {
    console.error('Create submission error:', error);
    res.status(500).json({ error: `Failed to create submission: ${error instanceof Error ? error.message : 'Unknown error'}` });
  }
});

// PUT /submissions/:id - Update submission
router.put('/:id', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;
    const accessToken = req.accessToken!;
    const {
      customer_name,
      customer_email,
      customer_phone,
      customer_address,
      customer_company,
      customer_notes,
      customer_contact_id,
      field_values,
      signature_url,
      status,
    } = req.body;

    const userClient = supabase.getClientForUser(accessToken);

    const updates: any = {};
    if (customer_name !== undefined) updates.customer_name = customer_name;
    if (customer_email !== undefined) updates.customer_email = customer_email;
    if (customer_phone !== undefined) updates.customer_phone = customer_phone;
    if (customer_address !== undefined) updates.customer_address = customer_address;
    if (customer_company !== undefined) updates.customer_company = customer_company;
    if (customer_notes !== undefined) updates.customer_notes = customer_notes;
    if (customer_contact_id !== undefined) updates.customer_contact_id = customer_contact_id;
    if (field_values !== undefined) updates.field_values = field_values;
    if (signature_url !== undefined) updates.signature_url = signature_url;
    if (status !== undefined) {
      updates.status = status;
      if (status === 'submitted' && !updates.submitted_at) {
        updates.submitted_at = new Date().toISOString();
      }
    }

    const { data, error } = await userClient
      .from('submissions')
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
    console.error('Update submission error:', error);
    res.status(500).json({ error: 'Failed to update submission' });
  }
});

// DELETE /submissions/:id - Delete submission
router.delete('/:id', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;
    const accessToken = req.accessToken!;

    const userClient = supabase.getClientForUser(accessToken);

    const { error } = await userClient
      .from('submissions')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.status(204).send();
  } catch (error) {
    console.error('Delete submission error:', error);
    res.status(500).json({ error: 'Failed to delete submission' });
  }
});

// POST /submissions/:id/pdf - Generate PDF
router.post('/:id/pdf', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;
    const accessToken = req.accessToken!;

    const userClient = supabase.getClientForUser(accessToken);

    // Fetch submission with template and user data
    // Use a safer select that won't fail if company fields don't exist
    const { data: submission, error: fetchError } = await userClient
      .from('submissions')
      .select(`
        *,
        form_templates:template_id (*),
        user_profiles:user_id (id, full_name, email)
      `)
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (fetchError || !submission) {
      return res.status(404).json({ error: 'Submission not found' });
    }

    // Try to get company fields separately (may not exist)
    let companyData: any = {};
    try {
      const { data: profileData } = await userClient
        .from('user_profiles')
        .select('company_name, company_logo_url, company_address, company_city, company_zip, company_country, company_phone, company_website, primary_color, accent_color')
        .eq('id', userId)
        .single();
      if (profileData) {
        companyData = profileData;
      }
    } catch (profileError) {
      // Company fields don't exist yet - that's OK, use empty values
      console.warn(`[Submissions] Company fields not available for user ${userId}, using defaults`);
    }

    const submissionData = {
      id: submission.id,
      customer_name: submission.customer_name,
      customer_email: submission.customer_email,
      customer_phone: submission.customer_phone,
      customer_address: submission.customer_address,
      customer_company: submission.customer_company,
      customer_notes: submission.customer_notes,
      field_values: submission.field_values || {},
      signature_url: submission.signature_url,
      created_at: submission.created_at,
      submitted_at: submission.submitted_at,
      template: {
        name: submission.form_templates.name,
        fields: submission.form_templates.fields,
      },
      user: {
        company_name: companyData.company_name || null,
        company_logo_url: companyData.company_logo_url || null,
        company_address: companyData.company_address || null,
        company_city: companyData.company_city || null,
        company_zip: companyData.company_zip || null,
        company_country: companyData.company_country || null,
        company_phone: companyData.company_phone || null,
        company_website: companyData.company_website || null,
        primary_color: companyData.primary_color || null,
        accent_color: companyData.accent_color || null,
      },
    };

    // Generate PDF
    let pdfUrl: string;
    try {
      pdfUrl = await pdfService.generateSubmissionPDF(userId, submissionData, userClient);
    } catch (pdfError: any) {
      console.error('[Submissions] PDF generation error:', pdfError);
      return res.status(500).json({ error: pdfError.message });
    }

    // Update submission with PDF URL (only if it's a storage URL, not data URL)
    if (pdfUrl && !pdfUrl.startsWith('data:')) {
      try {
        await userClient
          .from('submissions')
          .update({ pdf_url: pdfUrl })
          .eq('id', id)
          .eq('user_id', userId);
      } catch (updateError) {
        console.warn('[Submissions] Failed to update PDF URL:', updateError);
        // Don't fail the request if update fails
      }
    }

    res.json({ success: true, pdf_url: pdfUrl, submission: submission });
  } catch (error: any) {
    console.error('[Submissions] Generate PDF error:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /submissions/:id/pdf - Get PDF directly as download (fallback if storage fails)
router.get('/:id/pdf', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;
    const accessToken = req.accessToken!;

    const userClient = supabase.getClientForUser(accessToken);

    const { data: submission, error: fetchError } = await userClient
      .from('submissions')
      .select(`
        *,
        form_templates:template_id (*),
        user_profiles:user_id (id, full_name, email)
      `)
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (fetchError || !submission) {
      return res.status(404).json({ error: 'Submission not found' });
    }

    // Get company data
    let companyData: any = {};
    try {
      const { data: profileData } = await userClient
        .from('user_profiles')
        .select('company_name, company_logo_url, company_address, company_city, company_zip, company_country, company_phone, company_website, primary_color, accent_color')
        .eq('id', userId)
        .single();
      if (profileData) companyData = profileData;
    } catch (profileError) {
      // Ignore
    }

    // Generate PDF buffer
    const pdfBuffer = await pdfService.generateSubmissionPDFBuffer({
      id: submission.id,
      customer_name: submission.customer_name,
      customer_email: submission.customer_email,
      customer_phone: submission.customer_phone,
      customer_address: submission.customer_address,
      customer_company: submission.customer_company,
      customer_notes: submission.customer_notes,
      field_values: submission.field_values || {},
      signature_url: submission.signature_url,
      created_at: submission.created_at,
      submitted_at: submission.submitted_at,
      template: {
        name: submission.form_templates.name,
        fields: submission.form_templates.fields,
      },
      user: {
        company_name: companyData.company_name || null,
        company_logo_url: companyData.company_logo_url || null,
        company_address: companyData.company_address || null,
        company_city: companyData.company_city || null,
        company_zip: companyData.company_zip || null,
        company_country: companyData.company_country || null,
        company_phone: companyData.company_phone || null,
        company_website: companyData.company_website || null,
        primary_color: companyData.primary_color || null,
        accent_color: companyData.accent_color || null,
      },
    });

    // Return PDF directly
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="Einsatzbericht_${submission.id}.pdf"`);
    res.send(pdfBuffer);
  } catch (error: any) {
    console.error('[Submissions] Direct PDF download error:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /submissions/:id/download-pdf - Get signed URL for PDF download
router.get('/:id/download-pdf', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;
    const accessToken = req.accessToken!;

    const userClient = supabase.getClientForUser(accessToken);

    const { data: submission, error: fetchError } = await userClient
      .from('submissions')
      .select('id')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (fetchError || !submission) {
      return res.status(404).json({ error: 'Submission not found' });
    }

    const storageClient = supabase.adminClient || userClient; // Use admin client if available, else user client
    const fileName = `${userId}/${id}.pdf`;

    const { data, error } = await storageClient.storage
      .from('submission-pdfs')
      .createSignedUrl(fileName, 3600); // Valid for 1 hour

    if (error) {
      console.error('Signed URL error:', error);
      return res.status(500).json({ error: 'Failed to generate download link' });
    }

    res.json({ url: data.signedUrl });
  } catch (error: any) {
    console.error('Download PDF error:', error);
    res.status(500).json({ error: 'Failed to generate download link' });
  }
});

export default router;
