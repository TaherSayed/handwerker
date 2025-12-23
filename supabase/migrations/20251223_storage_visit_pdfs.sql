-- Create storage bucket for visit PDFs
INSERT INTO storage.buckets (id, name, public)
VALUES ('visit-pdfs', 'visit-pdfs', true)
ON CONFLICT (id) DO NOTHING;

-- Set up RLS policies for the visit-pdfs bucket
-- Allow authenticated users to upload their own PDFs
CREATE POLICY "Users can upload their own visit PDFs"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'visit-pdfs' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow authenticated users to read their own PDFs
CREATE POLICY "Users can read their own visit PDFs"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'visit-pdfs' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow authenticated users to delete their own PDFs
CREATE POLICY "Users can delete their own visit PDFs"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'visit-pdfs' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Add pdf_url and pdf_generated_at columns to visits table if they don't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'visits' AND column_name = 'pdf_url'
  ) THEN
    ALTER TABLE visits ADD COLUMN pdf_url TEXT;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'visits' AND column_name = 'pdf_generated_at'
  ) THEN
    ALTER TABLE visits ADD COLUMN pdf_generated_at TIMESTAMPTZ;
  END IF;
END $$;

-- Add index for faster PDF lookups
CREATE INDEX IF NOT EXISTS idx_visits_pdf_url ON visits(pdf_url) WHERE pdf_url IS NOT NULL;

