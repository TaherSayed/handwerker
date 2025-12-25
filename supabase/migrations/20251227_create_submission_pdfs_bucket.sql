-- Create storage bucket for submission PDFs
-- This bucket stores PDF reports generated from form submissions
-- Backward-safe and idempotent - can be run multiple times safely

-- 1. Ensure submission-pdfs bucket exists (public for getPublicUrl to work)
INSERT INTO storage.buckets (id, name, public)
VALUES ('submission-pdfs', 'submission-pdfs', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 2. Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Users can upload own submission PDFs" ON storage.objects;
DROP POLICY IF EXISTS "Users can view own submission PDFs" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own submission PDFs" ON storage.objects;
DROP POLICY IF EXISTS "Public can view submission PDFs" ON storage.objects;

-- 3. Create RLS policies for submission-pdfs bucket
-- Allow authenticated users to upload their own PDFs (files in their user_id folder)
CREATE POLICY "Users can upload own submission PDFs"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'submission-pdfs' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow authenticated users to read their own PDFs
CREATE POLICY "Users can view own submission PDFs"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'submission-pdfs' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow public read access (since bucket is public and we use getPublicUrl)
CREATE POLICY "Public can view submission PDFs"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'submission-pdfs');

-- Allow authenticated users to update their own PDFs (for upsert functionality)
CREATE POLICY "Users can update own submission PDFs"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'submission-pdfs' 
  AND (storage.foldername(name))[1] = auth.uid()::text
)
WITH CHECK (
  bucket_id = 'submission-pdfs' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow authenticated users to delete their own PDFs
CREATE POLICY "Users can delete own submission PDFs"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'submission-pdfs' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

