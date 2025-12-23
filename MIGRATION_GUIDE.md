# Database Migration Guide

## Problem
If you see the error: **"Could not find the table 'public.workspaces' in the schema cache"**

This means the database schema hasn't been created yet in your Supabase project.

## Solution: Run the Migration

### Option 1: Using Supabase Dashboard (Recommended)

1. **Open Supabase Dashboard**
   - Go to https://app.supabase.com
   - Select your project

2. **Navigate to SQL Editor**
   - Click on "SQL Editor" in the left sidebar
   - Click "New query"

3. **Run the Migration**
   - Open the file: `supabase/migrations/20251223_onsite_complete_schema.sql`
   - Copy the entire contents
   - Paste into the SQL Editor
   - Click "Run" (or press Ctrl+Enter)

4. **Verify Tables Created**
   - Go to "Table Editor" in the left sidebar
   - You should see these tables:
     - `user_profiles`
     - `workspaces`
     - `form_templates`
     - `submissions`
     - `submission_photos`

### Option 2: Using Supabase CLI

If you have Supabase CLI installed:

```bash
# Link to your project (if not already linked)
supabase link --project-ref your-project-ref

# Run migrations
supabase db push
```

### Option 3: Manual SQL Execution

1. Copy the contents of `supabase/migrations/20251223_onsite_complete_schema.sql`
2. Execute it in your Supabase SQL Editor
3. Verify all tables are created

## What the Migration Creates

- **user_profiles**: User profile information
- **workspaces**: Workspace/tenant isolation (one per user in v1)
- **form_templates**: Form template definitions
- **submissions**: Form submissions/visits
- **submission_photos**: Photo attachments
- **Storage buckets**: submission-photos, submission-pdfs, company-logos
- **RLS Policies**: Row-level security for all tables
- **Triggers**: Auto-create workspace on user signup

## After Migration

1. **Test the Application**
   - Try logging in with Google
   - Create a form template
   - The workspace should be auto-created for new users

2. **Verify RLS Policies**
   - All tables should have RLS enabled
   - Users can only access their own data

## Troubleshooting

### Error: "relation already exists"
- The migration uses `DROP TABLE IF EXISTS`, so this shouldn't happen
- If it does, manually drop the tables and re-run the migration

### Error: "permission denied"
- Make sure you're running the migration as a database admin
- In Supabase Dashboard, you should have admin privileges by default

### Error: "function does not exist"
- The migration creates functions (`handle_new_user`, `update_updated_at`)
- Make sure you run the entire migration file, not just parts of it

## Need Help?

If you continue to see errors after running the migration:
1. Check the Supabase logs in the Dashboard
2. Verify all tables exist in the Table Editor
3. Check RLS policies are enabled
4. Ensure storage buckets are created

