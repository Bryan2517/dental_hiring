import { supabase } from '../supabase';
import type { Database } from '../database.types';
import type { Application, Candidate, JobStage } from '../types';

type ApplicationRow = Database['public']['Tables']['applications']['Row'];
type ProfileRow = Database['public']['Tables']['profiles']['Row'];
type SeekerProfileRow = Database['public']['Tables']['seeker_profiles']['Row'];

// Helper to map database application to frontend Application type
function mapApplicationToFrontend(app: ApplicationRow, profile: ProfileRow | null): Application {
  return {
    id: app.id,
    jobId: app.job_id,
    status: app.status as JobStage,
    appliedAt: app.created_at,
    candidateName: profile?.full_name || 'Unknown',
  };
}

// Helper to map database application + profile to Candidate type
function mapApplicationToCandidate(
  app: ApplicationRow,
  profile: ProfileRow | null,
  seekerProfile: SeekerProfileRow | null
): Candidate {
  const skills: string[] = [];
  
  return {
    id: app.id,
    name: profile?.full_name || 'Unknown',
    school: seekerProfile?.school_name || 'Unknown',
    gradDate: seekerProfile?.expected_graduation_date || '',
    skills,
    status: app.status as JobStage,
    rating: 4.0, // Default rating, can be calculated later
    city: profile?.city || '',
    notes: app.employer_notes || undefined,
  };
}

export async function getApplications(filters?: {
  job_id?: string;
  org_id?: string;
  seeker_user_id?: string;
  status?: Database['public']['Enums']['application_status'];
}): Promise<Application[]> {
  let query = supabase
    .from('applications')
    .select(`
      *,
      profiles!applications_seeker_user_id_fkey (
        id,
        full_name,
        city
      )
    `);
  
  if (filters?.job_id) {
    query = query.eq('job_id', filters.job_id);
  }
  
  if (filters?.org_id) {
    query = query.eq('org_id', filters.org_id);
  }
  
  if (filters?.seeker_user_id) {
    query = query.eq('seeker_user_id', filters.seeker_user_id);
  }
  
  if (filters?.status) {
    query = query.eq('status', filters.status);
  }
  
  const { data, error } = await query.order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching applications:', error);
    throw error;
  }
  
  return (data || []).map((item) => {
    const profile = Array.isArray(item.profiles) ? item.profiles[0] : item.profiles;
    return mapApplicationToFrontend(item, profile);
  });
}

export async function getCandidatesForOrg(orgId: string): Promise<Candidate[]> {
  const { data, error } = await supabase
    .from('applications')
    .select(`
      *,
      profiles!applications_seeker_user_id_fkey (
        id,
        full_name,
        city
      ),
      seeker_profiles!applications_seeker_user_id_fkey (
        school_name,
        expected_graduation_date
      )
    `)
    .eq('org_id', orgId);
  
  if (error) {
    console.error('Error fetching candidates:', error);
    throw error;
  }
  
  return (data || []).map((item) => {
    const profile = Array.isArray(item.profiles) ? item.profiles[0] : item.profiles;
    const seekerProfile = Array.isArray(item.seeker_profiles) ? item.seeker_profiles[0] : item.seeker_profiles;
    return mapApplicationToCandidate(item, profile, seekerProfile);
  });
}

export async function createApplication(applicationData: {
  job_id: string;
  org_id: string;
  seeker_user_id: string;
  resume_doc_id?: string;
  cover_letter?: string;
  screening_answers?: any;
  status?: Database['public']['Enums']['application_status'];
}): Promise<Application> {
  const { data, error } = await supabase
    .from('applications')
    .insert({
      ...applicationData,
      status: applicationData.status || 'applied',
      screening_answers: applicationData.screening_answers || {},
    })
    .select(`
      *,
      profiles!applications_seeker_user_id_fkey (
        id,
        full_name,
        city
      )
    `)
    .single();
  
  if (error) {
    console.error('Error creating application:', error);
    throw error;
  }
  
  const profile = Array.isArray(data.profiles) ? data.profiles[0] : data.profiles;
  return mapApplicationToFrontend(data, profile);
}

export async function updateApplicationStatus(
  id: string,
  status: Database['public']['Enums']['application_status'],
  actorUserId: string
): Promise<void> {
  const { error: updateError } = await supabase
    .from('applications')
    .update({
      status,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id);
  
  if (updateError) {
    console.error('Error updating application:', updateError);
    throw updateError;
  }
  
  // Create application event
  await supabase
    .from('application_events')
    .insert({
      application_id: id,
      actor_user_id: actorUserId,
      event_type: 'status_change',
      payload: { status },
    });
}
