-- Migration to add missing tables required by Backend Code
-- This aligns Schema with server/src/routes/submissions.routes.ts and services/user.service.ts

-- 1. Create Workspaces Table
CREATE TABLE IF NOT EXISTS public.workspaces (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Enable RLS for Workspaces
ALTER TABLE public.workspaces ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own workspaces" ON public.workspaces
    FOR SELECT USING (owner_id = auth.uid());

CREATE POLICY "Users can create own workspaces" ON public.workspaces
    FOR INSERT WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Users can update own workspaces" ON public.workspaces
    FOR UPDATE USING (owner_id = auth.uid());

-- 2. Create Submissions Table (replaces 'visits' for backend compatibility)
-- Note: We keep 'visits' if it exists to avoid data loss, but this table is what the API uses.
CREATE TABLE IF NOT EXISTS public.submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    workspace_id UUID REFERENCES public.workspaces(id) ON DELETE SET NULL,
    template_id UUID REFERENCES public.form_templates(id) ON DELETE SET NULL,
    
    customer_name TEXT,
    customer_email TEXT,
    customer_phone TEXT,
    customer_address TEXT,
    customer_contact_id UUID REFERENCES public.contacts(id) ON DELETE SET NULL,
    
    field_values JSONB DEFAULT '{}'::jsonb,
    signature_url TEXT,
    
    status TEXT DEFAULT 'draft', -- 'draft', 'submitted'
    submitted_at TIMESTAMPTZ,
    
    pdf_url TEXT,
    
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Enable RLS for Submissions
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own submissions" ON public.submissions
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create own submissions" ON public.submissions
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own submissions" ON public.submissions
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete own submissions" ON public.submissions
    FOR DELETE USING (user_id = auth.uid());

-- 3. Ensure Storage Buckets are Public (Redundant check but good for migration)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('submission-pdfs', 'submission-pdfs', true)
ON CONFLICT (id) DO UPDATE SET public = true;

INSERT INTO storage.buckets (id, name, public) 
VALUES ('submission-photos', 'submission-photos', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 4. Storage Policies for PDFs
CREATE POLICY "Authenticated users can upload submission pdfs"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'submission-pdfs' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view own submission pdfs"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'submission-pdfs' AND auth.uid()::text = (storage.foldername(name))[1]);
