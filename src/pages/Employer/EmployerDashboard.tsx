import { useEffect, useState } from 'react';
import { DashboardShell } from '../../layouts/DashboardShell';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Link } from 'react-router-dom';
import { TagPill } from '../../components/TagPill';
import { Breadcrumbs } from '../../components/Breadcrumbs';
import { JobStage } from '../../lib/types';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

const sidebarLinks = [
  { to: '/employer/dashboard', label: 'Overview' },
  { to: '/employer/post-job', label: 'Post job' },
  { to: '/employer/applicants', label: 'Applicants' },
  { to: '/employer/profile', label: 'Organization Profile' },
  { to: '/jobs', label: 'Job board' }
];

const pipelineStages: JobStage[] = ['Applied', 'Shortlisted', 'Interview', 'Offer', 'Hired', 'Rejected'];

export default function EmployerDashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);

  const [activeJobs, setActiveJobs] = useState<any[]>([]); // TODO: type properly with DB types
  const [applications, setApplications] = useState<any[]>([]);
  const [org, setOrg] = useState<any>(null);

  useEffect(() => {
    if (!user) return;

    async function fetchEmployerData() {
      setLoading(true);
      try {
        // 1. Get Organization
        const { data: orgData, error: orgError } = await supabase
          .from('organizations')
          .select('*')
          .eq('owner_user_id', user!.id)
          .single();

        if (orgError) {
          console.error('Error fetching org:', orgError);
          setLoading(false);
          return;
        }
        setOrg(orgData);

        if (orgData) {
          // 2. Get Active Jobs
          const { data: jobsData, error: jobsError } = await supabase
            .from('jobs')
            .select('*')
            .eq('org_id', orgData.id)
            .eq('org_id', orgData.id)
            .eq('status', 'published')
            .order('created_at', { ascending: false })
            .limit(5);

          if (jobsError) console.error('Error fetching jobs:', jobsError);
          else setActiveJobs(jobsData || []);

          // 3. Get Applications (for pipeline stats & recent highlights)
          // We need candidate details: join profiles (name) and seeker_profiles (school)
          // Note: Supabase join syntax: `..., profiles:seeker_user_id(full_name), ...`?
          // Foreign key on applications.seeker_user_id -> profiles.id
          // Foreign key on applications.seeker_user_id -> seeker_profiles.user_id
          const { data: appsData, error: appsError } = await supabase
            .from('applications')
            .select(`
              id, status, created_at,
              seeker:profiles!seeker_user_id(full_name, seeker_profiles(school_name)),
              job:jobs(title)
            `)
            .eq('org_id', orgData.id)
            .order('created_at', { ascending: false });

          if (appsError) console.error('Error fetching apps:', appsError);
          else {
            // Transform for easier consumption
            const formattedApps = (appsData || []).map((app: any) => ({
              id: app.id,
              status: app.status,
              name: app.seeker?.full_name || 'Unknown',
              school: app.seeker?.seeker_profiles?.school_name || 'Unknown School',
              jobTitle: app.job?.title || 'Unknown Job',
              created_at: app.created_at
            }));
            setApplications(formattedApps);
          }
        }

      } catch (err) {
        console.error('Unexpected error:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchEmployerData();
  }, [user]);


  const stageCounts = pipelineStages.map((stage) => ({
    stage,
    count: applications.filter((c) => c.status === stage).length
  }));

  const highlightCandidates = applications.slice(0, 3); // Top 3 recent

  if (loading) {
    return (
      <DashboardShell sidebarLinks={sidebarLinks} title="Employer Dashboard" subtitle="Loading..." hideNavigation>
        <div className="flex h-64 items-center justify-center">Loading data...</div>
      </DashboardShell>
    );
  }

  // If no org found, prompt to create one (simple fallback)
  if (!org) {
    return (
      <DashboardShell sidebarLinks={sidebarLinks} title="Employer Dashboard" subtitle="Welcome" hideNavigation>
        <div className="p-6 text-center">
          <p>No organization profile found. Please complete your setup.</p>
          {/* Could add a button to navigate to org setup if it existed */}
        </div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell
      sidebarLinks={sidebarLinks}
      title="Employer Dashboard"
      subtitle="Manage postings and review applicants."
      hideNavigation
      actions={
        <Button variant="primary" asChild>
          <Link to="/employer/post-job">Post a job</Link>
        </Button>
      }
    >
      <Breadcrumbs items={[{ label: 'Employer Home', to: '/employers' }, { label: 'Dashboard' }]} />
      <div className="grid gap-4 xl:grid-cols-[1fr,320px]">
        <div className="space-y-4">
          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Applicants summary</h3>
                <p className="text-sm text-gray-600">
                  {applications.filter((c) => c.status === 'Applied').length} applied -{' '}
                  {applications.filter((c) => c.status === 'Interview').length} interviews scheduled
                </p>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link to="/employer/applicants">View applicants</Link>
              </Button>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Active jobs</h3>
              <Badge variant="info">{activeJobs.length} live</Badge>
            </div>
            <div className="mt-3 space-y-3">
              {activeJobs.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">No active jobs found. Post one now!</p>
              ) : (
                activeJobs.map((job) => (
                  <div
                    key={job.id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-gray-100 bg-gray-50 p-4"
                  >
                    <div>
                      <p className="font-semibold text-gray-900">{job.title}</p>
                      <p className="text-xs text-gray-600">
                        {org.org_name} - {org.city || 'Malaysia'}
                      </p>
                      <div className="mt-2 flex flex-wrap gap-2 text-xs text-gray-600">
                        <TagPill label={job.employment_type} />
                        <TagPill label={job.experience_level} />
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" asChild>
                        <Link to={`/jobs/${job.id}`}>Preview</Link>
                      </Button>
                      <Button variant="primary" size="sm" asChild>
                        <Link to="/employer/applicants">Applicants</Link>
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Pipeline snapshot</h3>
              <Link to="/employer/applicants" className="text-xs font-semibold text-brand hover:text-brand-hover">
                View pipeline
              </Link>
            </div>
            <div className="mt-3 grid gap-2">
              {stageCounts.map((item) => (
                <div key={item.stage} className="flex items-center justify-between rounded-xl bg-gray-50 px-3 py-2 text-sm text-gray-700">
                  <span>{item.stage}</span>
                  <span className="font-semibold text-gray-900">{item.count}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Candidate highlights</h3>
              <Badge variant="outline">{applications.length} total</Badge>
            </div>
            <div className="mt-3 space-y-2">
              {highlightCandidates.length === 0 ? (
                <p className="text-sm text-gray-500 text-center">No applicants yet.</p>
              ) : (
                highlightCandidates.map((candidate) => (
                  <div
                    key={candidate.id}
                    className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50 px-3 py-2 text-sm text-gray-700"
                  >
                    <div>
                      <p className="font-semibold text-gray-900">{candidate.name}</p>
                      <p className="text-xs text-gray-500">{candidate.school}</p>
                      <p className="text-[10px] text-gray-400">For: {candidate.jobTitle}</p>
                    </div>
                    <Badge variant="outline">{candidate.status}</Badge>
                  </div>
                ))
              )}
            </div>
            <div className="mt-3 text-xs text-gray-500">
              Updated as of {new Date().toLocaleDateString()}
            </div>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}

// Helper to avoid variable collision rename from 'applications.length' in render
const candidatesLen = 0; // Fixed below: replace with {applications.length} inside render
