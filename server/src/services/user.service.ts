import { SupabaseClient } from '@supabase/supabase-js';
import { supabase } from './supabase.service.js';

// Type for user profile with all optional fields
type UserProfile = {
    id: string;
    email: string;
    full_name: string;
    created_at?: string;
    updated_at?: string;
    company_name?: string;
    company_logo_url?: string;
    company_address?: string;
    company_city?: string;
    company_zip?: string;
    company_country?: string;
    company_phone?: string;
    company_website?: string;
    primary_color?: string;
    accent_color?: string;
    [key: string]: any; // Allow additional properties
};

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
        
        // Type assertion to allow adding optional fields
        let typedProfile: UserProfile | null = profile as UserProfile | null;

        // If profile exists, try to get extended fields (may not exist yet)
        // Fetch them in smaller groups to avoid schema cache issues
        if (typedProfile && !profileError) {
            try {
                // Try to get company fields first
                const { data: companyFields } = await adminClient
                    .from('user_profiles')
                    .select('id, company_name, company_logo_url, company_address, company_city, company_zip, company_country, company_phone, company_website')
                    .eq('id', userId)
                    .single();
                
                if (companyFields) {
                    typedProfile = { ...typedProfile, ...(companyFields as any) };
                }
            } catch (companyError: any) {
                // Company fields might not exist - that's OK
                if (!companyError.message?.includes('column') && !companyError.message?.includes('schema cache')) {
                    console.warn(`[UserService] Company fields fetch failed for ${userId}:`, companyError.message);
                }
            }

            // Try to get branding fields separately (most likely to be missing)
            try {
                const { data: brandingFields } = await adminClient
                    .from('user_profiles')
                    .select('id, primary_color, accent_color')
                    .eq('id', userId)
                    .single();
                
                if (brandingFields) {
                    typedProfile = { ...typedProfile, ...(brandingFields as any) };
                }
            } catch (brandingError: any) {
                // Branding fields might not exist - that's OK, use defaults
                if (!brandingError.message?.includes('column') && !brandingError.message?.includes('schema cache')) {
                    console.warn(`[UserService] Branding fields fetch failed for ${userId}:`, brandingError.message);
                }
                // Set defaults if fields don't exist
                typedProfile = {
                    ...typedProfile,
                    primary_color: typedProfile.primary_color || '#2563eb',
                    accent_color: typedProfile.accent_color || '#1e40af',
                };
            }
        }

        if (profileError || !typedProfile) {
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
                typedProfile = existingBasic as UserProfile;
            } else if (newProfile) {
                typedProfile = newProfile as UserProfile;
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
                
                // Try to get extended fields in smaller groups, but don't fail if they don't exist
                typedProfile = existingBasic as UserProfile;
                
                // Try company fields
                try {
                    const { data: companyFields } = await adminClient
                        .from('user_profiles')
                        .select('id, company_name, company_logo_url, company_address, company_city, company_zip, company_country, company_phone, company_website')
                        .eq('id', userId)
                        .single();
                    
                    if (companyFields) {
                        typedProfile = { ...typedProfile, ...(companyFields as any) };
                    }
                } catch (companyError: any) {
                    // Company fields might not exist - that's OK
                    if (!companyError.message?.includes('column') && !companyError.message?.includes('schema cache')) {
                        console.warn(`[UserService] Company fields not available for ${userId}`);
                    }
                }

                // Try branding fields separately
                try {
                    const { data: brandingFields } = await adminClient
                        .from('user_profiles')
                        .select('id, primary_color, accent_color')
                        .eq('id', userId)
                        .single();
                    
                    if (brandingFields) {
                        typedProfile = { ...typedProfile, ...(brandingFields as any) };
                    } else {
                        // Set defaults if fields don't exist
                        typedProfile = {
                            ...typedProfile,
                            primary_color: '#2563eb',
                            accent_color: '#1e40af',
                        };
                    }
                } catch (brandingError: any) {
                    // Branding fields might not exist - that's OK, use defaults
                    if (!brandingError.message?.includes('column') && !brandingError.message?.includes('schema cache')) {
                        console.warn(`[UserService] Branding fields not available for ${userId}`);
                    }
                    // Set defaults
                    typedProfile = {
                        ...typedProfile,
                        primary_color: typedProfile?.primary_color || '#2563eb',
                        accent_color: typedProfile?.accent_color || '#1e40af',
                    };
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
                    name: typedProfile?.company_name || typedProfile?.full_name || 'My Workspace',
                })
                .select()
                .single();

            if (createWorkspaceError) {
                throw new Error(`Failed to create workspace: ${createWorkspaceError.message}`);
            }
            workspace = newWorkspace;
        }

        return { profile: typedProfile, workspace };
    }
}

export const userService = new UserService();
