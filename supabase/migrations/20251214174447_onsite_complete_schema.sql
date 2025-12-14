-- Location: supabase/migrations/20251214174447_onsite_complete_schema.sql
-- Schema Analysis: Fresh project - no existing schema
-- Integration Type: Complete OnSite craftsman app with authentication
-- Module: Authentication, Contacts, Forms, Visits, PDF Reports

-- ========================================
-- 1. CUSTOM TYPES
-- ========================================

CREATE TYPE public.user_role AS ENUM ('admin', 'manager', 'craftsman');
CREATE TYPE public.visit_status AS ENUM ('draft', 'completed', 'synced');
CREATE TYPE public.field_type AS ENUM ('text', 'number', 'date', 'dropdown', 'checkbox', 'toggle', 'notes');
CREATE TYPE public.contact_source AS ENUM ('manual', 'device_sync', 'imported');

-- ========================================
-- 2. CORE TABLES
-- ========================================

-- User Profiles (intermediary for auth.users)
CREATE TABLE public.user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    company_name TEXT NOT NULL,
    role public.user_role DEFAULT 'craftsman'::public.user_role,
    avatar_url TEXT,
    phone TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Contacts (customers for visits)
CREATE TABLE public.contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    company TEXT,
    address TEXT,
    notes TEXT,
    is_favorite BOOLEAN DEFAULT false,
    source public.contact_source DEFAULT 'manual'::public.contact_source,
    device_contact_id TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Form Templates (reusable form structures)
CREATE TABLE public.form_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    is_system_template BOOLEAN DEFAULT false,
    fields JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Visits (customer visits with form data)
CREATE TABLE public.visits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    contact_id UUID NOT NULL REFERENCES public.contacts(id) ON DELETE CASCADE,
    form_template_id UUID NOT NULL REFERENCES public.form_templates(id) ON DELETE RESTRICT,
    visit_code TEXT NOT NULL UNIQUE,
    status public.visit_status DEFAULT 'draft'::public.visit_status,
    form_data JSONB NOT NULL DEFAULT '{}'::jsonb,
    signature_data TEXT,
    visit_date TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMPTZ,
    synced_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Visit Photos (attachments for visits)
CREATE TABLE public.visit_photos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    visit_id UUID NOT NULL REFERENCES public.visits(id) ON DELETE CASCADE,
    photo_url TEXT NOT NULL,
    caption TEXT,
    sequence_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- PDF Reports (generated visit reports)
CREATE TABLE public.pdf_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    visit_id UUID NOT NULL REFERENCES public.visits(id) ON DELETE CASCADE,
    file_url TEXT NOT NULL,
    file_size_bytes BIGINT,
    generated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ========================================
-- 3. INDEXES
-- ========================================

CREATE INDEX idx_user_profiles_email ON public.user_profiles(email);
CREATE INDEX idx_contacts_user_id ON public.contacts(user_id);
CREATE INDEX idx_contacts_full_name ON public.contacts(full_name);
CREATE INDEX idx_form_templates_user_id ON public.form_templates(user_id);
CREATE INDEX idx_visits_user_id ON public.visits(user_id);
CREATE INDEX idx_visits_contact_id ON public.visits(contact_id);
CREATE INDEX idx_visits_status ON public.visits(status);
CREATE INDEX idx_visits_visit_date ON public.visits(visit_date DESC);
CREATE INDEX idx_visit_photos_visit_id ON public.visit_photos(visit_id);
CREATE INDEX idx_pdf_reports_visit_id ON public.pdf_reports(visit_id);

-- ========================================
-- 4. ROW LEVEL SECURITY
-- ========================================

ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.form_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.visit_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pdf_reports ENABLE ROW LEVEL SECURITY;

-- ========================================
-- 5. RLS POLICIES
-- ========================================

-- User Profiles: Pattern 1 (Core user table)
CREATE POLICY "users_manage_own_user_profiles"
ON public.user_profiles
FOR ALL
TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

-- Contacts: Pattern 2 (Simple user ownership)
CREATE POLICY "users_manage_own_contacts"
ON public.contacts
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Form Templates: Pattern 2 (Simple user ownership)
CREATE POLICY "users_manage_own_form_templates"
ON public.form_templates
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Visits: Pattern 2 (Simple user ownership)
CREATE POLICY "users_manage_own_visits"
ON public.visits
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Visit Photos: Access through visit ownership
CREATE POLICY "users_manage_visit_photos"
ON public.visit_photos
FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.visits v
        WHERE v.id = visit_photos.visit_id
        AND v.user_id = auth.uid()
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.visits v
        WHERE v.id = visit_photos.visit_id
        AND v.user_id = auth.uid()
    )
);

-- PDF Reports: Access through visit ownership
CREATE POLICY "users_manage_pdf_reports"
ON public.pdf_reports
FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.visits v
        WHERE v.id = pdf_reports.visit_id
        AND v.user_id = auth.uid()
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.visits v
        WHERE v.id = pdf_reports.visit_id
        AND v.user_id = auth.uid()
    )
);

-- ========================================
-- 6. FUNCTIONS
-- ========================================

-- Auto-create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
LANGUAGE plpgsql
AS $$
BEGIN
    INSERT INTO public.user_profiles (id, email, full_name, company_name, role, avatar_url, phone)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
        COALESCE(NEW.raw_user_meta_data->>'company_name', 'Meine Firma'),
        COALESCE((NEW.raw_user_meta_data->>'role')::public.user_role, 'craftsman'::public.user_role),
        COALESCE(NEW.raw_user_meta_data->>'avatar_url', ''),
        COALESCE(NEW.raw_user_meta_data->>'phone', '')
    );
    RETURN NEW;
END;
$$;

-- Generate unique visit code
CREATE OR REPLACE FUNCTION public.generate_visit_code()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
    new_code TEXT;
    code_exists BOOLEAN;
BEGIN
    LOOP
        new_code := 'B-' || TO_CHAR(CURRENT_TIMESTAMP, 'YYYY') || '-' || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
        
        SELECT EXISTS (
            SELECT 1 FROM public.visits WHERE visit_code = new_code
        ) INTO code_exists;
        
        EXIT WHEN NOT code_exists;
    END LOOP;
    
    RETURN new_code;
END;
$$;

-- Auto-update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;

-- ========================================
-- 7. TRIGGERS
-- ========================================

-- Trigger for new user profile creation
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user();

-- Update timestamps triggers
CREATE TRIGGER update_user_profiles_updated_at
BEFORE UPDATE ON public.user_profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_contacts_updated_at
BEFORE UPDATE ON public.contacts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_form_templates_updated_at
BEFORE UPDATE ON public.form_templates
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_visits_updated_at
BEFORE UPDATE ON public.visits
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at();

-- ========================================
-- 8. MOCK DATA
-- ========================================

DO $$
DECLARE
    craftsman_id UUID := gen_random_uuid();
    manager_id UUID := gen_random_uuid();
    contact1_id UUID := gen_random_uuid();
    contact2_id UUID := gen_random_uuid();
    contact3_id UUID := gen_random_uuid();
    template1_id UUID := gen_random_uuid();
    template2_id UUID := gen_random_uuid();
    visit1_id UUID := gen_random_uuid();
    visit2_id UUID := gen_random_uuid();
BEGIN
    -- Create auth users
    INSERT INTO auth.users (
        id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
        created_at, updated_at, raw_user_meta_data, raw_app_meta_data,
        is_sso_user, is_anonymous, confirmation_token, confirmation_sent_at,
        recovery_token, recovery_sent_at, email_change_token_new, email_change,
        email_change_sent_at, email_change_token_current, email_change_confirm_status,
        reauthentication_token, reauthentication_sent_at, phone, phone_change,
        phone_change_token, phone_change_sent_at
    ) VALUES
        (craftsman_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
         'max@mustermann.de', crypt('handwerk123', gen_salt('bf', 10)), now(), now(), now(),
         '{"full_name": "Max Mustermann", "company_name": "Mustermann Bau GmbH", "phone": "+49 176 12345678"}'::jsonb,
         '{"provider": "email", "providers": ["email"]}'::jsonb,
         false, false, '', null, '', null, '', '', null, '', 0, '', null, null, '', '', null),
        (manager_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
         'lisa@schmidt.de', crypt('manager123', gen_salt('bf', 10)), now(), now(), now(),
         '{"full_name": "Lisa Schmidt", "company_name": "Schmidt Elektro GmbH", "role": "manager", "phone": "+49 176 98765432"}'::jsonb,
         '{"provider": "email", "providers": ["email"]}'::jsonb,
         false, false, '', null, '', null, '', '', null, '', 0, '', null, null, '', '', null);

    -- Create contacts
    INSERT INTO public.contacts (id, user_id, full_name, email, phone, company, address, is_favorite, source) VALUES
        (contact1_id, craftsman_id, 'Michael Rodriguez', 'michael.r@email.com', '+49 176 11111111', 'Rodriguez Immobilien', 'Hauptstraße 45, 10115 Berlin', true, 'manual'::public.contact_source),
        (contact2_id, craftsman_id, 'Sarah Johnson', 'sarah.j@email.com', '+49 176 22222222', 'Johnson Properties', 'Berliner Straße 78, 10117 Berlin', false, 'device_sync'::public.contact_source),
        (contact3_id, craftsman_id, 'David Chen', 'david.c@email.com', '+49 176 33333333', 'Chen Facility Management', 'Alexanderplatz 12, 10178 Berlin', true, 'manual'::public.contact_source);

    -- Create form templates
    INSERT INTO public.form_templates (id, user_id, name, description, is_system_template, fields) VALUES
        (template1_id, craftsman_id, 'Elektrische Inspektion', 'Standardformular für elektrische Inspektionen', false, 
         '[
           {"id": "inspection_date", "type": "date", "label": "Inspektionsdatum", "required": true},
           {"id": "location", "type": "text", "label": "Standort", "required": true},
           {"id": "inspector", "type": "text", "label": "Inspektor", "required": true},
           {"id": "safety_check", "type": "checkbox", "label": "Sicherheitsprüfung durchgeführt", "required": true},
           {"id": "voltage_test", "type": "number", "label": "Spannungstest (V)", "required": false},
           {"id": "findings", "type": "notes", "label": "Feststellungen", "required": true, "maxLength": 500},
           {"id": "status", "type": "dropdown", "label": "Status", "required": true, "options": ["Bestanden", "Nicht bestanden", "Nachbesserung erforderlich"]}
         ]'::jsonb),
        (template2_id, craftsman_id, 'Sanitärbeurteilung', 'Standardformular für Sanitärarbeiten', false,
         '[
           {"id": "assessment_date", "type": "date", "label": "Bewertungsdatum", "required": true},
           {"id": "property_address", "type": "text", "label": "Objektadresse", "required": true},
           {"id": "water_pressure", "type": "number", "label": "Wasserdruck (bar)", "required": false},
           {"id": "leak_detected", "type": "checkbox", "label": "Leck erkannt", "required": false},
           {"id": "pipe_condition", "type": "dropdown", "label": "Rohrzustand", "required": true, "options": ["Gut", "Befriedigend", "Schlecht", "Kritisch"]},
           {"id": "recommendations", "type": "notes", "label": "Empfehlungen", "required": true, "maxLength": 500}
         ]'::jsonb);

    -- Create visits
    INSERT INTO public.visits (id, user_id, contact_id, form_template_id, visit_code, status, form_data, visit_date, completed_at) VALUES
        (visit1_id, craftsman_id, contact1_id, template1_id, 'B-2025-001', 'completed'::public.visit_status,
         '{"inspection_date": "2025-12-14", "location": "Hauptstraße 45", "inspector": "Max Mustermann", "safety_check": true, "voltage_test": "230", "findings": "Alle elektrischen Systeme in gutem Zustand. Kleinere Anpassungen an der Verkabelung vorgenommen.", "status": "Bestanden"}'::jsonb,
         now() - interval '2 hours', now() - interval '1 hour'),
        (visit2_id, craftsman_id, contact2_id, template2_id, 'B-2025-002', 'draft'::public.visit_status,
         '{"assessment_date": "2025-12-14", "property_address": "Berliner Straße 78", "water_pressure": "3.5", "leak_detected": false}'::jsonb,
         now() - interval '1 day', null);

END $$;

-- ========================================
-- 9. CLEANUP FUNCTION
-- ========================================

CREATE OR REPLACE FUNCTION public.cleanup_test_data()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    auth_user_ids_to_delete UUID[];
BEGIN
    SELECT ARRAY_AGG(id) INTO auth_user_ids_to_delete
    FROM auth.users
    WHERE email IN ('max@mustermann.de', 'lisa@schmidt.de');

    IF auth_user_ids_to_delete IS NOT NULL THEN
        DELETE FROM public.pdf_reports WHERE visit_id IN (SELECT id FROM public.visits WHERE user_id = ANY(auth_user_ids_to_delete));
        DELETE FROM public.visit_photos WHERE visit_id IN (SELECT id FROM public.visits WHERE user_id = ANY(auth_user_ids_to_delete));
        DELETE FROM public.visits WHERE user_id = ANY(auth_user_ids_to_delete);
        DELETE FROM public.form_templates WHERE user_id = ANY(auth_user_ids_to_delete);
        DELETE FROM public.contacts WHERE user_id = ANY(auth_user_ids_to_delete);
        DELETE FROM public.user_profiles WHERE id = ANY(auth_user_ids_to_delete);
        DELETE FROM auth.users WHERE id = ANY(auth_user_ids_to_delete);
    END IF;
EXCEPTION
    WHEN foreign_key_violation THEN
        RAISE NOTICE 'Foreign key constraint prevents deletion: %', SQLERRM;
    WHEN OTHERS THEN
        RAISE NOTICE 'Cleanup failed: %', SQLERRM;
END;
$$;

COMMENT ON FUNCTION public.cleanup_test_data() IS 'Removes all test/mock data created during development';