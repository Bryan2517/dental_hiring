import { useEffect, useMemo, useState } from 'react';
import { AppShell } from '../../layouts/AppShell';
import { Job, Resume } from '../../lib/types';
import { JobCard } from '../../components/JobCard';
import { JobFilters, JobFilterState } from '../../components/JobFilters';
import { Pagination } from '../../components/Pagination';
import { ApplyModal } from '../../components/ApplyModal';
import { Breadcrumbs } from '../../components/Breadcrumbs';
import { getJobs, saveJob, unsaveJob, getSavedJobs } from '../../lib/api/jobs';
import { getUserDocuments } from '../../lib/api/profiles';
import { useAuth } from '../../contexts/AuthContext';
import { Toast } from '../../components/ui/toast';

const defaultFilters: JobFilterState = {
  keyword: '',
  location: '',
  specialty: '',
  employmentType: '',
  shiftType: '',
  newGrad: false,
  training: false,
  internship: false,
  experienceLevel: '',
  salaryMin: 0
};

export default function JobsList() {
  const { user, userRole, openAuthModal } = useAuth();
  const [filters, setFilters] = useState<JobFilterState>(defaultFilters);
  const [sortBy, setSortBy] = useState('relevance');
  const [page, setPage] = useState(1);
  const [selectedJob, setSelectedJob] = useState<Job | undefined>();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [resumes, setResumes] = useState<Resume[]>([]);
  const pageSize = 6;

  const [savedJobIds, setSavedJobIds] = useState<Set<string>>(new Set());
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const handleApplyClick = (job: Job) => {
    if (!user || userRole !== 'seeker') {
      openAuthModal('login', `/jobs`);
    } else {
      setSelectedJob(job);
    }
  };

  const handleToggleSave = async (job: Job) => {
    if (!user || userRole !== 'seeker') {
      openAuthModal('login', `/jobs`);
      return;
    }

    const isSaved = savedJobIds.has(job.id);
    // Optimistic update
    setSavedJobIds(prev => {
      const next = new Set(prev);
      if (isSaved) next.delete(job.id);
      else next.add(job.id);
      return next;
    });

    try {
      if (isSaved) {
        await unsaveJob(user.id, job.id);
        setToastMessage('Job removed from saved');
        setToastOpen(true);
      } else {
        await saveJob(user.id, job.id);
        setToastMessage('Job saved successfully');
        setToastOpen(true);
      }
    } catch (error) {
      console.error('Error toggling save:', error);
      // Revert on error
      setSavedJobIds(prev => {
        const next = new Set(prev);
        if (isSaved) next.add(job.id);
        else next.delete(job.id);
        return next;
      });
      setToastMessage('Failed to update saved status');
      setToastOpen(true);
    }
  };

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [jobsData, savedJobsData] = await Promise.all([
          getJobs({ status: 'published' }),
          user && userRole === 'seeker' ? getSavedJobs(user.id) : Promise.resolve([])
        ]);
        setJobs(jobsData);
        setSavedJobIds(new Set(savedJobsData.map(j => j.id)));
      } catch (error) {
        console.error('Error loading jobs:', error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [user, userRole]);

  useEffect(() => {
    async function loadResumes() {
      try {
        if (user && userRole === 'seeker') {
          const docs = await getUserDocuments(user.id);
          // Map to Resume type if needed, but getUserDocuments should return compatible types or we map here
          // Assuming docs are compatible or we just use them.
          // Let's verify type compatibility briefly. getUserDocuments returns 'any[]' in some contexts or typed.
          // Based on previous code, we might need mapping.
          // Checking previous JobsList content, it just used setResumes(docs).
          setResumes(docs as unknown as Resume[]);
        }
      } catch (error) {
        console.error('Error loading resumes:', error);
      }
    }
    loadResumes();
  }, [user, userRole]);

  const filteredJobs = useMemo(() => {
    let result = jobs.filter((job) => {
      const matchesKeyword =
        filters.keyword === '' ||
        job.roleType.toLowerCase().includes(filters.keyword.toLowerCase()) ||
        job.clinicName.toLowerCase().includes(filters.keyword.toLowerCase()) ||
        job.specialtyTags.some((tag) => tag.toLowerCase().includes(filters.keyword.toLowerCase()));
      const matchesLocation =
        filters.location === '' ||
        job.city.toLowerCase().includes(filters.location.toLowerCase()) ||
        job.country.toLowerCase().includes(filters.location.toLowerCase());
      const matchesSpecialty =
        filters.specialty === '' || job.specialtyTags.includes(filters.specialty);
      const matchesType = filters.employmentType === '' || job.employmentType === filters.employmentType;
      const matchesShift = filters.shiftType === '' || job.shiftType === filters.shiftType;
      const matchesExperience =
        filters.experienceLevel === '' || job.experienceLevel === filters.experienceLevel;
      const matchesNewGrad = !filters.newGrad || job.newGradWelcome;
      const matchesTraining = !filters.training || job.trainingProvided;
      const matchesInternship = !filters.internship || job.internshipAvailable;

      const salaryMatches = (() => {
        if (filters.salaryMin === 0) return true;

        // Determine effective min and max salaries
        let effectiveMin = 0;
        let effectiveMax = 0;

        if (job.salaryMin !== undefined || job.salaryMax !== undefined) {
          effectiveMin = job.salaryMin || 0;
          effectiveMax = job.salaryMax || effectiveMin;
        } else {
          // Fallback to parsing string (legacy support)
          const numbers = job.salaryRange.match(/\d[\d,]*/g) ?? [];
          effectiveMin = numbers[0] ? parseInt(numbers[0].replace(/,/g, ''), 10) : 0;
          effectiveMax = numbers[1] ? parseInt(numbers[1].replace(/,/g, ''), 10) : effectiveMin;
        }

        // Check against max salary as per previous logic
        return effectiveMax >= filters.salaryMin;
      })();

      return (
        matchesKeyword &&
        matchesLocation &&
        matchesSpecialty &&
        matchesType &&
        matchesShift &&
        matchesExperience &&
        matchesNewGrad &&
        matchesTraining &&
        matchesInternship &&
        salaryMatches
      );
    });

    if (sortBy === 'newest') {
      result = [...result].sort(
        (a, b) => new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime()
      );
    } else if (sortBy === 'salary') {
      const parseSalary = (salaryRange: string) => parseInt(salaryRange.replace(/[^0-9]/g, '').slice(0, 4), 10);
      result = [...result].sort((a, b) => parseSalary(b.salaryRange) - parseSalary(a.salaryRange));
    }

    return result;
  }, [jobs, filters, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filteredJobs.length / pageSize));
  const pageJobs = filteredJobs.slice((page - 1) * pageSize, page * pageSize);

  const handleFilterChange = (val: JobFilterState) => {
    setFilters(val);
    setPage(1);
  };

  const resetFilters = () => setFilters(defaultFilters);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0 });
  }, [page]);

  return (
    <AppShell padded background="muted">
      <div className="flex flex-col gap-4">
        <Breadcrumbs items={[{ label: 'Home', to: '/seekers' }, { label: 'Jobs' }]} />
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-brand">Job Board</p>
            <h1 className="text-2xl font-bold text-gray-900">Find your next dental role</h1>
            <p className="text-sm text-gray-600">
              {loading ? 'Loading jobs...' : `${filteredJobs.length} jobs - filters update instantly`}
            </p>
          </div>
        </div>

        <JobFilters
          values={filters}
          onChange={handleFilterChange}
          onReset={resetFilters}
          sortBy={sortBy}
          onSortChange={setSortBy}
        />

        <div className="grid gap-4">
          {loading ? (
            <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-6 text-center text-sm text-gray-600">
              Loading jobs...
            </div>
          ) : (
            <>
              {pageJobs.map((job) => (
                <JobCard
                  key={job.id}
                  job={job}
                  onApply={handleApplyClick}
                  isSaved={savedJobIds.has(job.id)}
                  onToggleSave={handleToggleSave}
                />
              ))}
              {pageJobs.length === 0 && (
                <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-6 text-center text-sm text-gray-600">
                  No jobs match these filters. Try clearing some options.
                </div>
              )}
            </>
          )}
        </div>

        <Pagination page={page} totalPages={totalPages} onChange={setPage} />
      </div>

      <ApplyModal open={!!selectedJob} job={selectedJob} onClose={() => setSelectedJob(undefined)} resumes={resumes as any[]} />

      <Toast
        open={toastOpen}
        onClose={() => setToastOpen(false)}
        title={toastMessage.includes('successfully') ? 'Success' : toastMessage.includes('removed') ? 'Success' : 'Error'}
        description={toastMessage}
        variant={toastMessage.includes('successfully') || toastMessage.includes('removed') ? 'success' : 'error'}
      />
    </AppShell>
  );
}
