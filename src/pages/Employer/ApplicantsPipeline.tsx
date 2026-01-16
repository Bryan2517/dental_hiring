import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { DashboardShell } from '../../layouts/DashboardShell';
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
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { getCandidatesForOrg, updateApplicationStatus, toggleCandidateFavorite } from '../../lib/api/applications';

const sidebarLinks = [
  { to: '/employer/dashboard', label: 'Overview' },
  { to: '/employer/applicants', label: 'Applicants' },
  { to: '/employer/post-job', label: 'Post job' },
  { to: '/employer/organization', label: 'Organization Profile' }
];

export default function ApplicantsPipeline() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [jobs, setJobs] = useState<{ id: string, title: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | undefined>();
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [toastMessage, setToastMessage] = useState<string>('');
  const [toastOpen, setToastOpen] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState<string>(searchParams.get('jobId') || '');

  // Update URL when filter changes
  useEffect(() => {
    if (selectedJobId) {
      setSearchParams({ jobId: selectedJobId });
    }
  }, [selectedJobId, setSearchParams]);

  useEffect(() => {
    async function fetchData() {
      if (!user) return;
      setLoading(true);
      try {
        // Get Org ID
        const { data: org, error: orgError } = await supabase
          .from('organizations')
          .select('id')
          .eq('owner_user_id', user.id)
          .single();

        if (orgError) throw orgError;
        if (org) {
          // Fetch candidates and jobs in parallel
          const [candidatesData, jobsData] = await Promise.all([
            getCandidatesForOrg(org.id),
            supabase.from('jobs').select('id, title').eq('org_id', org.id).eq('status', 'published').order('created_at', { ascending: false })
          ]);

          setCandidates(candidatesData);
          // Initialize favorites from data
          setFavoriteIds(candidatesData.filter(c => c.isFavorite).map(c => c.id));

          if (jobsData.data && jobsData.data.length > 0) {
            setJobs(jobsData.data);

            // Determine initial job selection
            const urlJobId = searchParams.get('jobId');
            const isValidJob = urlJobId && jobsData.data.some(j => j.id === urlJobId);

            if (isValidJob) {
              setSelectedJobId(urlJobId!);
            } else {
              // Default to first job (most recent due to order) if no valid ID in URL
              setSelectedJobId(jobsData.data[0].id);
            }
          } else {
            setJobs([]);
          }
        }
      } catch (error) {
        console.error('Error fetching candidates:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [user]);

  const handleMove = async (id: string, status: JobStage) => {
    // Optimistic update
    const previousCandidates = [...candidates];
    setCandidates((prev) =>
      prev.map((c) => {
        if (c.id !== id) return c;
        if (c.status === status) return c;
        setToastMessage(`${c.name} has moved to ${status}`);
        setToastOpen(true);
        return { ...c, status };
      })
    );

    try {
      await updateApplicationStatus(id, status.toLowerCase() as any, user!.id);
    } catch (error) {
      console.error('Error updating status:', error);
      setCandidates(previousCandidates); // Revert
      setToastMessage('Failed to update status');
      setToastOpen(true);
    }
  };

  const toggleFavorite = async (id: string) => {
    const candidate = candidates.find((c) => c.id === id);
    if (!candidate) return;

    // Determine new state
    const isNowFavorite = !favoriteIds.includes(id);

    // Optimistic Update
    setFavoriteIds((prev) => {
      const next = isNowFavorite ? [...prev, id] : prev.filter((fav) => fav !== id);
      setToastMessage(
        `${candidate.name} ${isNowFavorite ? 'added to' : 'removed from'} favorites`
      );
      setToastOpen(true);
      return next;
    });

    // API Call
    try {
      await toggleCandidateFavorite(id, isNowFavorite);
    } catch (error) {
      console.error('Error toggling favorite', error);
      // Revert on error
      setFavoriteIds((prev) => {
        return isNowFavorite ? prev.filter(fid => fid !== id) : [...prev, id];
      });
    }
  };

  // Filter candidates based on selected job - strict filter
  const filteredCandidates = candidates.filter(c => {
    const matchJob = c.jobId === selectedJobId;
    const matchFav = showFavoritesOnly ? favoriteIds.includes(c.id) : true;
    return matchJob && matchFav;
  });

  const appliedCount = filteredCandidates.filter((c) => c.status === 'Applied').length;
  const interviewCount = filteredCandidates.filter((c) => c.status === 'Interview').length;
  const shortlistedCount = filteredCandidates.filter((c) => c.status === 'Shortlisted').length;
  const offerCount = filteredCandidates.filter((c) => c.status === 'Offer').length;
  const recent = filteredCandidates.slice(0, 5);

  if (loading) {
    return (
      <DashboardShell sidebarLinks={sidebarLinks} title="Applicants pipeline" subtitle="Loading..." hideNavigation>
        <p className="p-8 text-center text-gray-500">Loading pipeline...</p>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell
      sidebarLinks={sidebarLinks}
      title="Applicants pipeline"
      subtitle="Move candidates between stages or open profile details."
      actions={<Badge variant="info">{filteredCandidates.length} candidates</Badge>}
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
          <div className="flex flex-wrap gap-2 items-center">
            <Input placeholder="Search candidates..." className="min-w-[220px]" />

            <Select
              className="min-w-[200px]"
              value={selectedJobId}
              onChange={(e) => setSelectedJobId(e.target.value)}
              disabled={jobs.length === 0}
            >
              {jobs.map(job => (
                <option key={job.id} value={job.id}>{job.title}</option>
              ))}
              {jobs.length === 0 && <option value="">No active jobs</option>}
            </Select>

            <label className="flex items-center gap-2 cursor-pointer rounded-lg border border-gray-200 px-3 py-2 hover:bg-gray-50 bg-white">
              <input
                type="checkbox"
                checked={showFavoritesOnly}
                onChange={() => setShowFavoritesOnly(!showFavoritesOnly)}
                className="rounded border-gray-300 text-brand focus:ring-brand"
              />
              <span className="text-sm font-medium text-gray-700">Favourites only</span>
            </label>
          </div>
          <div className="text-xs text-gray-500">
            Updated just now - {filteredCandidates.length} total
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
              candidates={filteredCandidates}
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
              {recent.length === 0 ? <p className="text-sm text-gray-500">No recent candidates for this job.</p> : recent.map((candidate) => (
                <button
                  key={candidate.id}
                  onClick={() => setSelectedCandidate(candidate)}
                  className="flex w-full items-center justify-between rounded-xl border border-gray-100 bg-white px-3 py-2 text-left text-sm transition hover:border-brand"
                >
                  <div>
                    <p className="font-semibold text-gray-900">{candidate.name}</p>
                    <p className="text-xs text-gray-500">{candidate.school}</p>
                    <p className="text-[10px] text-gray-400">For: {candidate.jobTitle}</p>
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
