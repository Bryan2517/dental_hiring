import { DashboardShell } from '../../layouts/DashboardShell';
import { candidates, jobs, tokenTransactions, walletStats } from '../../lib/mockData';
import { TransactionList } from '../../components/TransactionList';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Link } from 'react-router-dom';
import { TagPill } from '../../components/TagPill';
import { TokenWalletPanel } from '../../components/TokenWalletPanel';
import { Breadcrumbs } from '../../components/Breadcrumbs';

const sidebarLinks = [
  { to: '/employer/dashboard', label: 'Overview' },
  { to: '/employer/post-job', label: 'Post job' },
  { to: '/employer/applicants', label: 'Applicants' },
  { to: '/jobs', label: 'Job board' }
];

export default function EmployerDashboard() {
  const activeJobs = jobs.slice(0, 5);

  return (
    <DashboardShell
      sidebarLinks={sidebarLinks}
      title="Employer Dashboard"
      subtitle="Track tokens, manage postings, and review applicants."
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
          <TokenWalletPanel wallet={walletStats} />

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

        <TransactionList transactions={tokenTransactions} />
      </div>
    </DashboardShell>
  );
}
