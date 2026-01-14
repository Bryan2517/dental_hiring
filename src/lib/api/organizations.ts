import { supabase } from '../supabase';
import type { Database } from '../database.types';

type OrganizationRow = Database['public']['Tables']['organizations']['Row'];

export async function getOrganization(userId: string): Promise<OrganizationRow | null> {
    const { data, error } = await supabase
        .from('organizations')
        .select('*')
        .eq('owner_user_id', userId)
        .single();

    if (error) {
        if (error.code === 'PGRST116') return null; // Not found
        console.error('Error fetching organization:', error);
        throw error;
    }

    return data;
}

export async function updateOrganization(
    orgId: string,
    updates: Partial<OrganizationRow>
): Promise<OrganizationRow> {
    const { data, error } = await supabase
        .from('organizations')
        .update({
            ...updates,
            updated_at: new Date().toISOString(),
        })
        .eq('id', orgId)
        .select()
        .single();

    if (error) {
        console.error('Error updating organization:', error);
        throw error;
    }

    return data;
}

export async function createOrganization(
    organizationData: {
        owner_user_id: string;
        org_name: string;
        org_type: Database['public']['Enums']['org_type'];
        description?: string;
        website_url?: string;
        address_line1?: string;
        address_line2?: string;
        city?: string;
        state?: string;
        postcode?: string;
        country?: string;
    }
): Promise<OrganizationRow> {
    const { data, error } = await supabase
        .from('organizations')
        .insert({
            ...organizationData,
            verified_status: 'pending', // Default
        })
        .select()
        .single();

    if (error) {
        console.error('Error creating organization:', error);
        throw error;
    }

    return data;
}
