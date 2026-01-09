import { useState } from 'react';
import { DashboardShell } from '../../layouts/DashboardShell';
import { candidates as initialCandidates } from '../../lib/mockData';
import { Candidate, JobStage } from '../../lib/types';
import { KanbanBoard } from '../../components/KanbanBoard';
import { CandidateDrawer } from '../../components/CandidateDrawer';
import { Badge } from '../../components/ui/badge';
import { Breadcrumbs } from '../../components/Breadcrumbs';
import { Card } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Select } from '../../components/ui/select';
import { Button } from '../../components/ui/button';
import { Toast } from '../../components/ui/toast';

const sidebarLinks = [
  { to: '/employer/dashboard', label: 'Overview' },
  { to: '/employer/applicants', label: 'Applicants' },
  { to: '/employer/post-job', label: 'Post job' }
];

export default function ApplicantsPipeline() {
  const [candidates, setCandidates] = useState<Candidate[]>(initialCandidates);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | undefined>();
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [toastMessage, setToastMessage] = useState<string>('');
  const [toastOpen, setToastOpen] = useState(false);

  const handleMove = (id: string, status: JobStage) => {
    setCandidates((prev) =>
      prev.map((c) => {
        if (c.id !== id) return c;
        if (c.status === status) return c;
        setToastMessage(`${c.name} has moved to ${status}`);
        setToastOpen(true);
        return { ...c, status };
      })
    );
  };

  const toggleFavorite = (id: string) => {
    const candidate = candidates.find((c) => c.id === id);
    if (!candidate) return;
    setFavoriteIds((prev) => {
      const next = prev.includes(id) ? prev.filter((fav) => fav !== id) : [...prev, id];
      setToastMessage(
        `${candidate.name} ${prev.includes(id) ? 'removed from' : 'added to'} favorites`
      );
      setToastOpen(true);
      return next;
    });
  };

  const appliedCount = candidates.filter((c) => c.status === 'Applied').length;
  const interviewCount = candidates.filter((c) => c.status === 'Interview').length;
  const shortlistedCount = candidates.filter((c) => c.status === 'Shortlisted').length;
  const offerCount = candidates.filter((c) => c.status === 'Offer').length;
  const recent = candidates.slice(0, 5);

  return (
    <DashboardShell
      sidebarLinks={sidebarLinks}
      title="Applicants pipeline"
      subtitle="Move candidates between stages or open profile details."
      actions={<Badge variant="info">{candidates.length} candidates</Badge>}
      hideNavigation
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <Breadcrumbs items={[{ label: 'Employer Home', to: '/employers' }, { label: 'Applicants' }]} />
        <div className="flex gap-2">
          <Button variant="secondary" size="sm">
            Invite candidate
          </Button>
          <Button variant="outline" size="sm">
            Export list
          </Button>
        </div>
      </div>

      <Card className="p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            <Input placeholder="Search candidates..." className="min-w-[220px]" />
            <Select className="min-w-[160px]" defaultValue="">
              <option value="">All stages</option>
              <option>Applied</option>
              <option>Shortlisted</option>
              <option>Interview</option>
              <option>Offer</option>
              <option>Hired</option>
              <option>Rejected</option>
            </Select>
          </div>
          <div className="text-xs text-gray-500">
            Updated just now - {candidates.length} total
          </div>
        </div>
      </Card>

      <div className="grid gap-3 md:grid-cols-4">
        <Card className="p-4">
          <p className="text-xs text-gray-500">Applied</p>
          <p className="text-2xl font-semibold text-gray-900">{appliedCount}</p>
          <p className="text-xs text-gray-500">Awaiting screening</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-gray-500">Shortlisted</p>
          <p className="text-2xl font-semibold text-gray-900">{shortlistedCount}</p>
          <p className="text-xs text-gray-500">Ready for outreach</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-gray-500">Interview</p>
          <p className="text-2xl font-semibold text-gray-900">{interviewCount}</p>
          <p className="text-xs text-gray-500">Next 7 days</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-gray-500">Offers</p>
          <p className="text-2xl font-semibold text-gray-900">{offerCount}</p>
          <p className="text-xs text-gray-500">Pending acceptance</p>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1fr,300px]">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-900">Pipeline board</p>
              <p className="text-xs text-gray-500">Drag and drop candidates to update their status.</p>
            </div>
            <Badge variant="info">Live view</Badge>
          </div>
          <div className="mt-4">
            <KanbanBoard
              candidates={candidates}
              onMove={handleMove}
              onView={setSelectedCandidate}
              favorites={favoriteIds}
              onToggleFavorite={toggleFavorite}
            />
          </div>
        </Card>

        <div className="grid gap-4">
          <Card className="p-4">
            <p className="text-sm font-semibold text-gray-900">Recent candidates</p>
            <div className="mt-3 space-y-3">
              {recent.map((candidate) => (
                <button
                  key={candidate.id}
                  onClick={() => setSelectedCandidate(candidate)}
                  className="flex w-full items-center justify-between rounded-xl border border-gray-100 bg-white px-3 py-2 text-left text-sm transition hover:border-brand"
                >
                  <div>
                    <p className="font-semibold text-gray-900">{candidate.name}</p>
                    <p className="text-xs text-gray-500">{candidate.school}</p>
                  </div>
                  <Badge variant="outline">{candidate.status}</Badge>
                </button>
              ))}
            </div>
          </Card>
          <Card className="p-4">
            <p className="text-sm font-semibold text-gray-900">Hiring tips</p>
            <ul className="mt-3 space-y-2 text-xs text-gray-600">
              <li>Send interview invites within 48 hours of application.</li>
              <li>Use dental-specific screening questions to reduce churn.</li>
              <li>Highlight training provided for new grads.</li>
            </ul>
          </Card>
        </div>
      </div>

      <CandidateDrawer
        candidate={selectedCandidate}
        open={!!selectedCandidate}
        onClose={() => setSelectedCandidate(undefined)}
        onMove={(id, status) => {
          handleMove(id, status);
          setSelectedCandidate(undefined);
        }}
      />

      <Toast
        open={toastOpen}
        onClose={() => setToastOpen(false)}
        title="Status updated"
        description={toastMessage}
        variant="info"
      />
    </DashboardShell>
  );
}
