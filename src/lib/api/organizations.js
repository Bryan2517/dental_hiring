import { supabase } from '../supabase';
export async function getOrganization(userId) {
    const { data, error } = await supabase
        .from('organizations')
        .select('*')
        .eq('owner_user_id', userId)
        .single();
    if (error) {
        if (error.code === 'PGRST116')
            return null; // Not found
        console.error('Error fetching organization:', error);
        throw error;
    }
    return data;
}
export async function updateOrganization(orgId, updates) {
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
export async function createOrganization(organizationData) {
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
