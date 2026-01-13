import { supabase } from '../supabase';
import type { Database } from '../database.types';
import type { Job } from '../types';

type JobRow = Database['public']['Tables']['jobs']['Row'];
type OrganizationRow = Database['public']['Tables']['organizations']['Row'];

// Helper to map database job + org to frontend Job type
function mapJobToFrontend(job: JobRow, org: OrganizationRow | null): Job {
  // Handle benefits: supports legacy string[] or new { list: string[] } format
  const rawBenefits = job.benefits as any;
  const benefits = Array.isArray(rawBenefits)
    ? rawBenefits
    : (rawBenefits?.list && Array.isArray(rawBenefits.list) ? rawBenefits.list : []);
  const requirements = job.requirements ? job.requirements.split('\n').filter(Boolean) : [];

  // Map employment_type enum to frontend format
  const employmentTypeMap: Record<string, string> = {
    full_time: 'Full-time',
    part_time: 'Part-time',
    internship: 'Internship',
    contract: 'Contract',
    temporary: 'Temporary',
  };

  // Map experience_level enum to frontend format
  const experienceLevelMap: Record<string, string> = {
    entry: 'New Grad',
    junior: 'Junior',
    mid: 'Mid',
    senior: 'Senior',
  };

  // Format salary range
  const salaryRange =
    job.salary_min && job.salary_max
      ? `${job.currency || 'MYR'} ${job.salary_min.toLocaleString()} - ${job.salary_max.toLocaleString()}`
      : 'Salary not disclosed';

  return {
    id: job.id,
    roleType: job.title,
    clinicName: org?.org_name || 'Unknown Organization',
    city: job.city || '',
    country: job.country || '',
    specialtyTags: job.specialty_tags || [],
    employmentType: (employmentTypeMap[job.employment_type] || job.employment_type) as Job['employmentType'],
    shiftType: (job.shift_type as 'Day' | 'Night' | 'Rotating') || 'Day',
    salaryRange,
    benefits,
    requirements,
    postedAt: job.published_at || job.created_at,
    experienceLevel: (experienceLevelMap[job.experience_level] || job.experience_level) as Job['experienceLevel'],
    newGradWelcome: job.new_grad_welcome,
    trainingProvided: job.training_provided,
    internshipAvailable: job.internship_available || false,
    description: job.description,
  };
}

export async function getJobs(filters?: {
  status?: 'published';
  keyword?: string;
  location?: string;
  specialty?: string;
  employmentType?: string;
  experienceLevel?: string;
}): Promise<Job[]> {
  let query = supabase
    .from('jobs')
    .select(`
      *,
      organizations (
        id,
        org_name,
        city,
        country
      )
    `);

  if (filters?.status) {
    query = query.eq('status', filters.status);
  }

  if (filters?.keyword) {
    query = query.or(`title.ilike.%${filters.keyword}%,description.ilike.%${filters.keyword}%`);
  }

  if (filters?.location) {
    query = query.or(`city.ilike.%${filters.location}%,country.ilike.%${filters.location}%`);
  }

  if (filters?.employmentType) {
    const empTypeMap: Record<string, string> = {
      'Full-time': 'full_time',
      'Part-time': 'part_time',
      'Internship': 'internship',
      'Contract': 'contract',
      'Temporary': 'temporary',
    };
    query = query.eq('employment_type', (empTypeMap[filters.employmentType] || filters.employmentType) as Database['public']['Enums']['employment_type']);
  }

  if (filters?.experienceLevel) {
    const expLevelMap: Record<string, string> = {
      'New Grad': 'entry',
      'Junior': 'junior',
      'Mid': 'mid',
      'Senior': 'senior',
    };
    query = query.eq('experience_level', (expLevelMap[filters.experienceLevel] || filters.experienceLevel) as Database['public']['Enums']['experience_level']);
  }

  const { data, error } = await query.order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching jobs:', error);
    throw error;
  }

  return (data || []).map((item: any) => {
    const org = Array.isArray(item.organizations) ? item.organizations[0] : item.organizations;
    return mapJobToFrontend(item, org);
  });
}

export async function getJobById(id: string): Promise<Job | null> {
  const { data, error } = await supabase
    .from('jobs')
    .select(`
      *,
      organizations (
        id,
        org_name,
        city,
        country
      )
    `)
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching job:', error);
    return null;
  }

  const org = Array.isArray((data as any).organizations) ? (data as any).organizations[0] : (data as any).organizations;
  return mapJobToFrontend(data, org);
}

export async function createJob(jobData: {
  org_id: string;
  title: string;
  role_type: Database['public']['Enums']['role_type'];
  employment_type: Database['public']['Enums']['employment_type'];
  experience_level: Database['public']['Enums']['experience_level'];
  description: string;
  specialty_tags?: string[];
  requirements?: string;
  responsibilities?: string;
  salary_min?: number;
  salary_max?: number;
  currency?: string;
  city?: string;
  country?: string;
  shift_type?: string;
  benefits?: any;
  new_grad_welcome?: boolean;
  training_provided?: boolean;
  internship_available?: boolean;
  status?: Database['public']['Enums']['job_status'];
}): Promise<Job> {
  const { data, error } = await supabase
    .from('jobs')
    .insert({
      ...jobData,
      status: jobData.status || 'draft',
      specialty_tags: jobData.specialty_tags || [],
      benefits: jobData.benefits || {},
    })
    .select(`
      *,
      organizations (
        id,
        org_name,
        city,
        country
      )
    `)
    .single();

  if (error) {
    console.error('Error creating job:', error);
    throw error;
  }

  const org = Array.isArray((data as any).organizations) ? (data as any).organizations[0] : (data as any).organizations;
  return mapJobToFrontend(data, org);
}

export async function updateJobStatus(id: string, status: Database['public']['Enums']['job_status']): Promise<void> {
  const updateData: any = { status, updated_at: new Date().toISOString() };

  if (status === 'published' && !updateData.published_at) {
    updateData.published_at = new Date().toISOString();
  }

  if (status === 'closed') {
    updateData.closed_at = new Date().toISOString();
  }

  const { error } = await supabase
    .from('jobs')
    .update(updateData)
    .eq('id', id);

  if (error) {
    console.error('Error updating job status:', error);
    throw error;
  }
}
