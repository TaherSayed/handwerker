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
      .select('*, form_templates(name), submission_photos(count)')
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
      return res.status(400).json({ error: error.message });
    }

    res.json(data);
  } catch (error) {
    console.error('List submissions error:', error);
    res.status(500).json({ error: 'Failed to fetch submissions' });
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
      customer_contact_id,
      field_values,
      signature_url,
      status,
    } = req.body;

    const userClient = supabase.getClientForUser(accessToken);

    // Get or create user's workspace safely
    const { workspace } = await userService.getOrCreateWorkspace(userId, req.user!.email!, userClient);

    if (!workspace || !workspace.id) {
      return res.status(400).json({ error: 'No workspace available' });
    }

    const { data, error } = await userClient
      .from('submissions')
      .insert({
        template_id,
        user_id: userId,
        workspace_id: workspace.id,
        customer_name,
        customer_email,
        customer_phone,
        customer_address,
        customer_contact_id,
        field_values: field_values || {},
        signature_url,
        status: status || 'draft',
        submitted_at: status === 'submitted' ? new Date().toISOString() : null,
      })
      .select()
      .single();

    if (error) {
      return res.status(400).json({ error: error.message });
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
    const { data: submission, error: fetchError } = await userClient
      .from('submissions')
      .select(`
        *,
        form_templates:template_id (*),
        user_profiles:user_id (company_name, company_logo_url)
      `)
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (fetchError || !submission) {
      return res.status(404).json({ error: 'Submission not found' });
    }

    // Generate PDF
    let pdfUrl: string;
    try {
      pdfUrl = await pdfService.generateSubmissionPDF(
        userId,
        {
          id: submission.id,
          customer_name: submission.customer_name,
          customer_email: submission.customer_email,
          customer_phone: submission.customer_phone,
          customer_address: submission.customer_address,
          field_values: submission.field_values || {},
          signature_url: submission.signature_url,
          created_at: submission.created_at,
          submitted_at: submission.submitted_at,
          template: {
            name: submission.form_templates.name,
            fields: submission.form_templates.fields,
          },
          user: {
            company_name: submission.user_profiles?.company_name,
            company_logo_url: submission.user_profiles?.company_logo_url,
          },
        },
        userClient
      );
    } catch (pdfError: any) {
      console.error(' PDF generation error:', pdfError);
      return res.status(500).json({ error: pdfError.message });
    }

    // Update submission with PDF URL
    const { data: updated, error: updateError } = await userClient
      .from('submissions')
      .update({ pdf_url: pdfUrl })
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    res.json({ success: true, pdf_url: pdfUrl, submission: updated || submission });
  } catch (error: any) {
    console.error('Generate PDF error:', error);
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
