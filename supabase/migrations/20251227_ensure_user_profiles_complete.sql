-- Comprehensive migration to ensure user_profiles table has all required columns
-- This migration is backward-safe and idempotent - can be run multiple times safely
-- Fixes: "column user_profiles.company_address does not exist" error

DO $$
BEGIN
    -- Ensure user_profiles table exists (should already exist, but safe check)
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'user_profiles') THEN
        CREATE TABLE public.user_profiles (
            id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
            email TEXT NOT NULL UNIQUE,
            full_name TEXT NOT NULL,
            created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
        );
    END IF;

    -- Note: Core required fields (id, email, full_name) should already exist from initial schema
    -- We only add missing optional fields here

    -- Company fields (all nullable - optional)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'company_name') THEN
        ALTER TABLE user_profiles ADD COLUMN company_name TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'company_address') THEN
        ALTER TABLE user_profiles ADD COLUMN company_address TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'company_city') THEN
        ALTER TABLE user_profiles ADD COLUMN company_city TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'company_zip') THEN
        ALTER TABLE user_profiles ADD COLUMN company_zip TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'company_country') THEN
        ALTER TABLE user_profiles ADD COLUMN company_country TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'company_phone') THEN
        ALTER TABLE user_profiles ADD COLUMN company_phone TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'company_website') THEN
        ALTER TABLE user_profiles ADD COLUMN company_website TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'company_logo_url') THEN
        ALTER TABLE user_profiles ADD COLUMN company_logo_url TEXT;
    END IF;

    -- Branding fields
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'primary_color') THEN
        ALTER TABLE user_profiles ADD COLUMN primary_color TEXT DEFAULT '#2563eb';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'accent_color') THEN
        ALTER TABLE user_profiles ADD COLUMN accent_color TEXT DEFAULT '#1e40af';
    END IF;

    -- Additional optional fields
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'avatar_url') THEN
        ALTER TABLE user_profiles ADD COLUMN avatar_url TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'phone') THEN
        ALTER TABLE user_profiles ADD COLUMN phone TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'role') THEN
        -- Check if enum type exists first
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
            CREATE TYPE public.user_role AS ENUM ('admin', 'manager', 'craftsman');
        END IF;
        ALTER TABLE user_profiles ADD COLUMN role public.user_role DEFAULT 'craftsman'::public.user_role;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'is_active') THEN
        ALTER TABLE user_profiles ADD COLUMN is_active BOOLEAN DEFAULT true;
    END IF;

    -- Timestamps
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'created_at') THEN
        ALTER TABLE user_profiles ADD COLUMN created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'updated_at') THEN
        ALTER TABLE user_profiles ADD COLUMN updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP;
    END IF;

    -- Create index on email if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE tablename = 'user_profiles' AND indexname = 'user_profiles_email_idx') THEN
        CREATE INDEX user_profiles_email_idx ON user_profiles(email);
    END IF;

    RAISE NOTICE 'Migration completed: user_profiles table is now complete with all required columns';
END $$;

