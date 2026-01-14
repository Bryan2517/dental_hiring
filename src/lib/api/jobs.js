import { supabase } from '../supabase';
// Helper to map database job + org to frontend Job type
function mapJobToFrontend(job, org) {
    // Handle benefits: supports legacy string[] or new { list: string[] } format
    const rawBenefits = job.benefits;
    const benefits = Array.isArray(rawBenefits)
        ? rawBenefits
        : (rawBenefits?.list && Array.isArray(rawBenefits.list) ? rawBenefits.list : []);
    const requirements = job.requirements ? job.requirements.split('\n').filter(Boolean) : [];
    // Map employment_type enum to frontend format
    const employmentTypeMap = {
        full_time: 'Full-time',
        part_time: 'Part-time',
        internship: 'Internship',
        contract: 'Contract',
        temporary: 'Temporary',
    };
    // Map experience_level enum to frontend format
    const experienceLevelMap = {
        entry: 'New Grad',
        junior: 'Junior',
        mid: 'Mid',
        senior: 'Senior',
    };
    // Format salary range
    const salaryRange = job.salary_min && job.salary_max
        ? `${job.currency || 'MYR'} ${job.salary_min.toLocaleString()} - ${job.salary_max.toLocaleString()}`
        : 'Salary not disclosed';
    return {
        id: job.id,
        roleType: job.title,
        clinicName: org?.org_name || 'Unknown Organization',
        city: job.city || '',
        country: job.country || '',
        specialtyTags: job.specialty_tags || [],
        employmentType: (employmentTypeMap[job.employment_type] || job.employment_type),
        shiftType: job.shift_type || 'Day',
        salaryRange,
        benefits,
        requirements,
        postedAt: job.published_at || job.created_at,
        experienceLevel: (experienceLevelMap[job.experience_level] || job.experience_level),
        newGradWelcome: job.new_grad_welcome,
        trainingProvided: job.training_provided,
        internshipAvailable: job.internship_available || false,
        description: job.description,
        salaryMin: job.salary_min || undefined,
        salaryMax: job.salary_max || undefined,
        orgId: job.org_id,
    };
}
export async function getJobs(filters) {
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
        const empTypeMap = {
            'Full-time': 'full_time',
            'Part-time': 'part_time',
            'Internship': 'internship',
            'Contract': 'contract',
            'Temporary': 'temporary',
        };
        query = query.eq('employment_type', (empTypeMap[filters.employmentType] || filters.employmentType));
    }
    if (filters?.experienceLevel) {
        const expLevelMap = {
            'New Grad': 'entry',
            'Junior': 'junior',
            'Mid': 'mid',
            'Senior': 'senior',
        };
        query = query.eq('experience_level', (expLevelMap[filters.experienceLevel] || filters.experienceLevel));
    }
    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) {
        console.error('Error fetching jobs:', error);
        throw error;
    }
    return (data || []).map((item) => {
        const org = Array.isArray(item.organizations) ? item.organizations[0] : item.organizations;
        return mapJobToFrontend(item, org);
    });
}
export async function getJobById(id) {
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
    const org = Array.isArray(data.organizations) ? data.organizations[0] : data.organizations;
    return mapJobToFrontend(data, org);
}
export async function createJob(jobData) {
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
    const org = Array.isArray(data.organizations) ? data.organizations[0] : data.organizations;
    return mapJobToFrontend(data, org);
}
export async function updateJobStatus(id, status) {
    const updateData = { status, updated_at: new Date().toISOString() };
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
export async function saveJob(userId, jobId) {
    const { error } = await supabase
        .from('job_saves')
        .insert({ user_id: userId, job_id: jobId });
    if (error) {
        // Ignore duplicate key error (already saved)
        if (error.code === '23505')
            return;
        console.error('Error saving job:', error);
        throw error;
    }
}
export async function unsaveJob(userId, jobId) {
    const { error } = await supabase
        .from('job_saves')
        .delete()
        .eq('user_id', userId)
        .eq('job_id', jobId);
    if (error) {
        console.error('Error unsaving job:', error);
        throw error;
    }
}
export async function getSavedJobs(userId) {
    const { data, error } = await supabase
        .from('job_saves')
        .select(`
      job_id,
      jobs (
        *,
        organizations (
          id,
          org_name,
          city,
          country
        )
      )
    `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
    if (error) {
        console.error('Error fetching saved jobs:', error);
        throw error;
    }
    return (data || []).map((item) => {
        const job = item.jobs;
        // Handle nested arrays if necessary (though single relation)
        const jobData = Array.isArray(job) ? job[0] : job;
        const org = Array.isArray(jobData.organizations) ? jobData.organizations[0] : jobData.organizations;
        return mapJobToFrontend(jobData, org);
    });
}
