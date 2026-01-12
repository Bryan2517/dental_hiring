import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppShell } from '../../layouts/AppShell';
import { Job } from '../../lib/types';
import { JobCard } from '../../components/JobCard';
import { JobFilters, JobFilterState } from '../../components/JobFilters';
import { Pagination } from '../../components/Pagination';
import { ApplyModal } from '../../components/ApplyModal';
import { Breadcrumbs } from '../../components/Breadcrumbs';
import { getJobs } from '../../lib/api/jobs';
import { getUserDocuments } from '../../lib/api/profiles';
import { useAuth } from '../../contexts/AuthContext';

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
  const { user, userRole } = useAuth();
  const navigate = useNavigate();
  const [filters, setFilters] = useState<JobFilterState>(defaultFilters);
  const [sortBy, setSortBy] = useState('relevance');
  const [page, setPage] = useState(1);
  const [selectedJob, setSelectedJob] = useState<Job | undefined>();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [resumes, setResumes] = useState<any[]>([]);
  const pageSize = 6;

  const handleApplyClick = (job: Job) => {
    if (!user || userRole !== 'seeker') {
      navigate(`/login?redirect=/jobs/${job.id}`);
    } else {
      setSelectedJob(job);
    }
  };

  useEffect(() => {
    async function loadJobs() {
      try {
        setLoading(true);
        const jobsData = await getJobs({ status: 'published' });
        setJobs(jobsData);
      } catch (error) {
        console.error('Error loading jobs:', error);
      } finally {
        setLoading(false);
      }
    }
    loadJobs();
  }, []);

  useEffect(() => {
    async function loadResumes() {
      try {
        // TODO: Get current user ID from auth context
        // For now, we'll use empty array
        // const userId = 'current-user-id';
        // const docs = await getUserDocuments(userId);
        // setResumes(docs);
      } catch (error) {
        console.error('Error loading resumes:', error);
      }
    }
    loadResumes();
  }, []);

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
        const numbers = job.salaryRange.match(/\d[\d,]*/g) ?? [];
        const salaryMin = numbers[0] ? parseInt(numbers[0].replace(/,/g, ''), 10) : 0;
        const salaryMax = numbers[1] ? parseInt(numbers[1].replace(/,/g, ''), 10) : salaryMin;
        return salaryMax >= filters.salaryMin;
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
                <JobCard key={job.id} job={job} onApply={handleApplyClick} />
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

      <ApplyModal open={!!selectedJob} job={selectedJob} onClose={() => setSelectedJob(undefined)} resumes={resumes} />
    </AppShell>
  );
}
