-- Migration to add branding fields to user_profiles
-- Address, Phone, Website, and Color Scheme

ALTER TABLE public.user_profiles
ADD COLUMN IF NOT EXISTS company_address TEXT,
ADD COLUMN IF NOT EXISTS company_phone TEXT,
ADD COLUMN IF NOT EXISTS company_website TEXT,
ADD COLUMN IF NOT EXISTS primary_color TEXT DEFAULT '#2563eb',
ADD COLUMN IF NOT EXISTS accent_color TEXT DEFAULT '#1e40af';
