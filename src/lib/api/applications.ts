import { supabase } from '../supabase';
import type { Database } from '../database.types';
import type { Application, Candidate, JobStage } from '../types';

type ApplicationRow = Database['public']['Tables']['applications']['Row'];
type ProfileRow = Database['public']['Tables']['profiles']['Row'];
type SeekerProfileRow = Database['public']['Tables']['seeker_profiles']['Row'];

// Helper to map database application to frontend Application type
// Helper to map database application to frontend Application type
function mapApplicationToFrontend(
  app: ApplicationRow,
  profile: ProfileRow | null,
  job?: any
): Application {
  const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
  return {
    id: app.id,
    jobId: app.job_id,
    status: capitalize(app.status) as JobStage,
    appliedAt: app.created_at,
    candidateName: profile?.full_name || 'Unknown',
    jobTitle: job?.title || 'Unknown Job',
    clinicName: job?.organizations?.org_name || 'Unknown Clinic',
    location: job?.city || job?.organizations?.city || '',
    orgId: job?.org_id || job?.organizations?.id || '',
  };
}

// Helper to map database application + profile to Candidate type
function mapApplicationToCandidate(
  app: ApplicationRow & { is_favorite?: boolean },
  profile: ProfileRow | null,
  seekerProfile: SeekerProfileRow | null,
  job: { title: string } | null,
  resume: { storage_path: string } | null
): Candidate {
  const skills: string[] = [];
  const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

  return {
    id: app.id,
    name: profile?.full_name || 'Unknown',
    school: seekerProfile?.school_name || 'Unknown',
    gradDate: seekerProfile?.expected_graduation_date ? seekerProfile.expected_graduation_date.substring(0, 7) : '',
    skills,
    status: capitalize(app.status) as JobStage,
    rating: 4.0, // Default rating, can be calculated later
    city: profile?.city || '',
    notes: app.employer_notes || undefined,
    jobId: app.job_id,
    jobTitle: job?.title || 'Unknown Role',
    isFavorite: app.is_favorite,
    resumePath: resume?.storage_path,
    seekerId: profile?.id
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
      ),
      jobs!applications_job_id_fkey (
        title,
        city,
        org_id,
        organizations (
          id,
          org_name,
          city,
          state
        )
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
    const job = Array.isArray(item.jobs) ? item.jobs[0] : item.jobs;
    return mapApplicationToFrontend(item, profile, job);
  });
}

export async function getCandidatesForOrg(orgId: string): Promise<Candidate[]> {
  const { data, error } = await supabase
    .from('applications')
    .select(`
      *,
      is_favorite,
      profiles!applications_seeker_user_id_fkey (
        id,
        full_name,
        city,
        seeker_profiles (
          school_name,
          expected_graduation_date
        )
      ),
      jobs!applications_job_id_fkey (
        title
      ),
      seeker_documents!applications_resume_doc_id_fkey (
        storage_path
      )
    `)
    .eq('org_id', orgId);

  if (error) {
    console.error('Error fetching candidates:', error);
    throw error;
  }

  return (data || []).map((item) => {
    const profile = Array.isArray(item.profiles) ? item.profiles[0] : item.profiles;
    // seeker_profiles is now nested inside profile
    const seekerProfile = profile && 'seeker_profiles' in profile
      ? (Array.isArray(profile.seeker_profiles) ? profile.seeker_profiles[0] : profile.seeker_profiles)
      : null;
    const job = Array.isArray(item.jobs) ? item.jobs[0] : item.jobs;
    const resume = Array.isArray(item.seeker_documents) ? item.seeker_documents[0] : item.seeker_documents;

    return mapApplicationToCandidate(item as any, profile, seekerProfile as SeekerProfileRow | null, job, resume as any);
  });
}

export async function toggleCandidateFavorite(applicationId: string, isFavorite: boolean): Promise<void> {
  const { error } = await supabase
    .from('applications')
    .update({ is_favorite: isFavorite })
    .eq('id', applicationId);

  if (error) {
    console.error('Error toggling favorite:', error);
    throw error;
  }
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

  // Create application event
  await supabase
    .from('application_events')
    .insert({
      application_id: data.id,
      actor_user_id: applicationData.seeker_user_id,
      event_type: 'status_change',
      payload: { status: data.status },
    });

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

export async function updateApplicationNotes(
  id: string,
  notes: string
): Promise<void> {
  const { error } = await supabase
    .from('applications')
    .update({
      employer_notes: notes,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id);

  if (error) {
    console.error('Error updating notes:', error);
    throw error;
  }
}
