-- Fix Storage Buckets and Policies

-- 1. Ensure Buckets Exist and are configured correctly
-- We make company-logos PUBLIC so that getPublicUrl works in the frontend
INSERT INTO storage.buckets (id, name, public) 
VALUES ('company-logos', 'company-logos', true)
ON CONFLICT (id) DO UPDATE SET public = true;

INSERT INTO storage.buckets (id, name, public) 
VALUES ('submission-photos', 'submission-photos', false)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public) 
VALUES ('submission-pdfs', 'submission-pdfs', false)
ON CONFLICT (id) DO NOTHING;

-- 2. Drop existing restrictive policies for company-logos to clean up
DROP POLICY IF EXISTS "Users can upload company logos" ON storage.objects;
DROP POLICY IF EXISTS "Users can view own logos" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own logos" ON storage.objects;
DROP POLICY IF EXISTS "Give users access to own folder 1ok1r4u_0" ON storage.objects;
DROP POLICY IF EXISTS "Give users access to own folder 1ok1r4u_1" ON storage.objects;
DROP POLICY IF EXISTS "Give users access to own folder 1ok1r4u_2" ON storage.objects;
DROP POLICY IF EXISTS "Give users access to own folder 1ok1r4u_3" ON storage.objects;


-- 3. Create simplified policies for company-logos
-- Allow any authenticated user to upload files to the company-logos bucket
CREATE POLICY "Authenticated users can upload company logos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'company-logos');

-- Allow any authenticated user to update their uploaded files
CREATE POLICY "Authenticated users can update company logos"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'company-logos');

-- Allow everyone to view company logos (since it's a public bucket)
-- Note: Public buckets handle GET requests automatically, but SELECT policy is still good practice
CREATE POLICY "Everyone can view company logos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'company-logos');

-- 4. Ensure other buckets have basic policies if missing
-- Submission Photos (Private)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'Users can upload own submission photos'
    ) THEN
        CREATE POLICY "Users can upload own submission photos" ON storage.objects
        FOR INSERT WITH CHECK (
            bucket_id = 'submission-photos' AND
            auth.uid()::text = (storage.foldername(name))[1]
        );
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'Users can view own submission photos'
    ) THEN
        CREATE POLICY "Users can view own submission photos" ON storage.objects
        FOR SELECT USING (
            bucket_id = 'submission-photos' AND
            auth.uid()::text = (storage.foldername(name))[1]
        );
    END IF;
END $$;
