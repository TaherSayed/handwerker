import { SupabaseClient } from '@supabase/supabase-js';
import { supabase } from './supabase.service.js';

export class UserService {
    /**
     * Ensures a user profile exists and returns the user's default workspace.
     * If either is missing, they are created safely.
     */
    async getOrCreateWorkspace(userId: string, email: string, userClient: SupabaseClient) {
        // 1. Ensure profile exists (Use admin client to bypass RLS if needed for initial creation)
        const adminClient = supabase.adminClient || userClient;

        let { data: profile, error: profileError } = await adminClient
            .from('user_profiles')
            .select('id, full_name, company_name, company_logo_url, company_address, company_phone, company_website, primary_color, accent_color')
            .eq('id', userId)
            .single();

        if (profileError || !profile) {
            console.log(`[UserService] Creating missing profile for ${userId}`);
            // Use upsert with ignoreDuplicates to avoid race conditions (duplicate key errors)
            const { data: newProfile, error: createProfileError } = await adminClient
                .from('user_profiles')
                .upsert({
                    id: userId,
                    email: email,
                    full_name: email.split('@')[0] || 'User',
                }, { onConflict: 'id', ignoreDuplicates: true })
                .select()
                .maybeSingle();

            if (createProfileError) {
                throw new Error(`Failed to create user profile: ${createProfileError.message}`);
            }

            // If upsert ignored the duplicate, newProfile might be null. Fetch existing one.
            if (!newProfile) {
                const { data: existingProfile, error: refetchError } = await adminClient
                    .from('user_profiles')
                    .select('id, full_name, company_name, company_logo_url, company_address, company_phone, company_website, primary_color, accent_color')
                    .eq('id', userId)
                    .single();

                if (refetchError || !existingProfile) {
                    throw new Error(`Failed to ensure user profile exists: ${refetchError?.message}`);
                }
                profile = existingProfile;
            } else {
                profile = newProfile;
            }
        }

        // 2. Ensure workspace exists
        let { data: workspace, error: workspaceError } = await userClient
            .from('workspaces')
            .select('id, name')
            .eq('owner_id', userId)
            .limit(1)
            .single();

        if (workspaceError || !workspace) {
            console.log(`[UserService] Creating missing workspace for ${userId}`);
            const { data: newWorkspace, error: createWorkspaceError } = await userClient
                .from('workspaces')
                .insert({
                    owner_id: userId,
                    name: profile?.company_name || profile?.full_name || 'My Workspace',
                })
                .select()
                .single();

            if (createWorkspaceError) {
                throw new Error(`Failed to create workspace: ${createWorkspaceError.message}`);
            }
            workspace = newWorkspace;
        }

        return { profile, workspace };
    }
}

export const userService = new UserService();
