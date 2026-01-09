import { DashboardShell } from '../../layouts/DashboardShell';
import { candidates, jobs } from '../../lib/mockData';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Link } from 'react-router-dom';
import { TagPill } from '../../components/TagPill';
import { Breadcrumbs } from '../../components/Breadcrumbs';
import { JobStage } from '../../lib/types';

const sidebarLinks = [
  { to: '/employer/dashboard', label: 'Overview' },
  { to: '/employer/post-job', label: 'Post job' },
  { to: '/employer/applicants', label: 'Applicants' },
  { to: '/jobs', label: 'Job board' }
];

const pipelineStages: JobStage[] = ['Applied', 'Shortlisted', 'Interview', 'Offer', 'Hired', 'Rejected'];

export default function EmployerDashboard() {
  const activeJobs = jobs.slice(0, 5);
  const stageCounts = pipelineStages.map((stage) => ({
    stage,
    count: candidates.filter((c) => c.status === stage).length
  }));
  const highlightCandidates = candidates.slice(0, 3);

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
                  {candidates.filter((c) => c.status === 'Applied').length} applied -{' '}
                  {candidates.filter((c) => c.status === 'Interview').length} interviews scheduled
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
              {activeJobs.map((job) => (
                <div
                  key={job.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-gray-100 bg-gray-50 p-4"
                >
                  <div>
                    <p className="font-semibold text-gray-900">{job.roleType}</p>
                    <p className="text-xs text-gray-600">
                      {job.clinicName} - {job.city}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2 text-xs text-gray-600">
                      <TagPill label={job.employmentType} />
                      <TagPill label={job.experienceLevel} />
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
              ))}
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
              <Badge variant="outline">{candidates.length} total</Badge>
            </div>
            <div className="mt-3 space-y-2">
              {highlightCandidates.map((candidate) => (
                <div
                  key={candidate.id}
                  className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50 px-3 py-2 text-sm text-gray-700"
                >
                  <div>
                    <p className="font-semibold text-gray-900">{candidate.name}</p>
                    <p className="text-xs text-gray-500">{candidate.school}</p>
                  </div>
                  <Badge variant="outline">{candidate.status}</Badge>
                </div>
              ))}
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
