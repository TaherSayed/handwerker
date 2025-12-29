-- Migration to add missing columns to submissions table
-- Ensures customer_company and customer_notes exist for stable operation

DO $$
BEGIN
    -- 1. Add missing columns to 'submissions' table
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'submissions' AND column_name = 'customer_company') THEN
        ALTER TABLE public.submissions ADD COLUMN customer_company TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'submissions' AND column_name = 'customer_notes') THEN
        ALTER TABLE public.submissions ADD COLUMN customer_notes TEXT;
    END IF;

    -- 2. Ensure indices for performance
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE tablename = 'submissions' AND indexname = 'idx_submissions_customer_name') THEN
        CREATE INDEX idx_submissions_customer_name ON public.submissions(customer_name);
    END IF;

    -- 3. Check for any other missing columns in user_profiles (redundancy check)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'company_address') THEN
        ALTER TABLE public.user_profiles ADD COLUMN company_address TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'company_logo_url') THEN
        ALTER TABLE public.user_profiles ADD COLUMN company_logo_url TEXT;
    END IF;
    
    -- Ensure primary and accent colors have defaults
    ALTER TABLE public.user_profiles ALTER COLUMN primary_color SET DEFAULT '#2563eb';
    ALTER TABLE public.user_profiles ALTER COLUMN accent_color SET DEFAULT '#1e40af';

END $$;
