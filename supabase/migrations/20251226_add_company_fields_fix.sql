-- Add missing company fields to user_profiles table if they don't exist
-- This fixes the "column user_profiles.company_address does not exist" error

DO $$
BEGIN
    -- Add company_name if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'company_name') THEN
        ALTER TABLE user_profiles ADD COLUMN company_name text;
    END IF;

    -- Add company_address if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'company_address') THEN
        ALTER TABLE user_profiles ADD COLUMN company_address text;
    END IF;

    -- Add company_city if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'company_city') THEN
        ALTER TABLE user_profiles ADD COLUMN company_city text;
    END IF;

    -- Add company_zip if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'company_zip') THEN
        ALTER TABLE user_profiles ADD COLUMN company_zip text;
    END IF;

    -- Add company_country if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'company_country') THEN
        ALTER TABLE user_profiles ADD COLUMN company_country text;
    END IF;
    
    -- Add updated_at if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'updated_at') THEN
        ALTER TABLE user_profiles ADD COLUMN updated_at timestamptz DEFAULT now();
    END IF;
END $$;
