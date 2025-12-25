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

        // First, try to get profile with basic fields only (always exist)
        let { data: profile, error: profileError } = await adminClient
            .from('user_profiles')
            .select('id, email, full_name, created_at, updated_at')
            .eq('id', userId)
            .single();

        // If profile exists, try to get extended fields (may not exist yet)
        if (profile && !profileError) {
            try {
                const { data: extendedProfile } = await adminClient
                    .from('user_profiles')
                    .select('id, full_name, company_name, company_logo_url, company_address, company_city, company_zip, company_country, company_phone, company_website, primary_color, accent_color')
                    .eq('id', userId)
                    .single();
                
                if (extendedProfile) {
                    profile = { ...profile, ...extendedProfile };
                }
            } catch (extendedError) {
                // If extended fields don't exist yet, that's OK - use basic profile
                console.warn(`[UserService] Extended profile fields not available yet for ${userId}, using basic profile`);
            }
        }

        if (profileError || !profile) {
            console.log(`[UserService] Creating missing profile for ${userId}`);
            // Use upsert with ignoreDuplicates to avoid race conditions (duplicate key errors)
            // Only set fields that definitely exist
            const { data: newProfile, error: createProfileError } = await adminClient
                .from('user_profiles')
                .upsert({
                    id: userId,
                    email: email,
                    full_name: email.split('@')[0] || 'User',
                    updated_at: new Date().toISOString(),
                }, { onConflict: 'id', ignoreDuplicates: true })
                .select('id, email, full_name, created_at, updated_at')
                .maybeSingle();

            if (createProfileError) {
                // If creation fails, try to fetch existing profile with basic fields
                const { data: existingBasic, error: basicError } = await adminClient
                    .from('user_profiles')
                    .select('id, email, full_name, created_at, updated_at')
                    .eq('id', userId)
                    .single();

                if (basicError || !existingBasic) {
                    throw new Error(`Failed to create user profile: ${createProfileError.message}`);
                }
                profile = existingBasic;
            } else if (newProfile) {
                profile = newProfile;
            } else {
                // If upsert ignored the duplicate, fetch existing one with basic fields first
                const { data: existingBasic, error: basicError } = await adminClient
                    .from('user_profiles')
                    .select('id, email, full_name, created_at, updated_at')
                    .eq('id', userId)
                    .single();

                if (basicError || !existingBasic) {
                    throw new Error(`Failed to ensure user profile exists: ${basicError?.message || 'Profile not found'}`);
                }
                
                // Try to get extended fields, but don't fail if they don't exist
                try {
                    const { data: extendedProfile } = await adminClient
                        .from('user_profiles')
                        .select('id, full_name, company_name, company_logo_url, company_address, company_city, company_zip, company_country, company_phone, company_website, primary_color, accent_color')
                        .eq('id', userId)
                        .single();
                    
                    if (extendedProfile) {
                        profile = { ...existingBasic, ...extendedProfile };
                    } else {
                        profile = existingBasic;
                    }
                } catch (extendedError) {
                    // Extended fields don't exist yet - that's OK, use basic profile
                    console.warn(`[UserService] Extended profile fields not available for ${userId}, using basic profile`);
                    profile = existingBasic;
                }
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
