import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { DashboardShell } from '../../layouts/DashboardShell';
import { applications, jobs, resumes as resumeData } from '../../lib/mockData';
import { Tabs } from '../../components/ui/tabs';
import { Input } from '../../components/ui/input';
import { Checkbox } from '../../components/ui/checkbox';
import { Badge } from '../../components/ui/badge';
import { TagPill } from '../../components/TagPill';
import { Button } from '../../components/ui/button';
import { JobStage, Resume } from '../../lib/types';
import { formatDate } from '../../lib/utils';
import { Breadcrumbs } from '../../components/Breadcrumbs';
import { UploadCloud } from 'lucide-react';

const sidebarLinks = [
  { to: '/student/profile', label: 'Profile' },
  { to: '/jobs', label: 'Browse jobs' },
  { to: '/jobs/job-1', label: 'Saved jobs' }
];

const exposures = ['4-hand dentistry', 'Sterilization', 'Intraoral scanning', 'Implant chairside', 'Pediatric'];
const applicationStatuses: (JobStage | 'All')[] = ['All', 'Applied', 'Shortlisted', 'Interview', 'Offer', 'Hired', 'Rejected'];

const defaultProfileFields = {
  fullName: 'Amira Rahman',
  email: 'amira@uni.edu',
  school: 'Mahsa University',
  graduation: '2025-05'
};

function mockScanResume(resume?: Resume | null) {
  const name = resume?.name?.toLowerCase() ?? '';
  if (name.includes('amira')) {
    return {
      ...defaultProfileFields,
      email: 'amira.s.dental@uni.edu',
      graduation: '2025-05',
      exposures: exposures.slice(0, 3)
    };
  }
  if (name.includes('arai')) {
    return {
      fullName: 'Arai Gomez',
      email: 'arai@mentordental.com',
      school: 'Universiti Malaya',
      graduation: '2024-11',
      exposures: exposures.slice(2)
    };
  }
  return {
    fullName: 'Zara Ong',
    email: 'zaraong@dentalcare.id',
    school: "Taylor's University",
    graduation: '2026-02',
    exposures: exposures.slice(1, 4)
  };
}

export default function ProfileDashboard() {
  const [activeTab, setActiveTab] = useState('profile');
  const [resumes, setResumes] = useState<Resume[]>(resumeData.slice(0, 1));
  const [latestResume, setLatestResume] = useState<Resume | null>(resumeData[0] ?? null);
  const [profileFields, setProfileFields] = useState(defaultProfileFields);
  const [selectedExposures, setSelectedExposures] = useState<string[]>(exposures.slice(0, 3));
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadFileName, setUploadFileName] = useState('');

  const handleFieldChange = (field: keyof typeof defaultProfileFields, value: string) => {
    setProfileFields((prev) => ({ ...prev, [field]: value }));
  };

  const handleResumeAdd = (resume: Resume) => {
    setResumes([resume]);
    setLatestResume(resume);
  };

  const toggleExposure = (item: string) => {
    setSelectedExposures((prev) =>
      prev.includes(item) ? prev.filter((entry) => entry !== item) : [...prev, item]
    );
  };

  const applyResumeScan = (resume: Resume | null) => {
    const scan = mockScanResume(resume);
    setProfileFields({
      fullName: scan.fullName,
      email: scan.email,
      school: scan.school,
      graduation: scan.graduation
    });
    setSelectedExposures(scan.exposures);
  };

  const handleResumeUpload = (resume: Resume) => {
    handleResumeAdd(resume);
    applyResumeScan(resume);
  };

  const handleModalSave = () => {
    if (!uploadFileName) return;
    const resume: Resume = {
      id: `res-${Date.now()}`,
      name: uploadFileName,
      uploadedAt: new Date().toISOString().slice(0, 10),
      category: 'Resume'
    };
    handleResumeUpload(resume);
    setShowUploadModal(false);
    setUploadFileName('');
  };

  const [applicationFilter, setApplicationFilter] = useState<JobStage | 'All'>('All');

  const filteredApplications = useMemo(() => {
    if (applicationFilter === 'All') return applications;
    return applications.filter((application) => application.status === applicationFilter);
  }, [applicationFilter]);

  return (
    <DashboardShell
      sidebarLinks={sidebarLinks}
      title="Student Dashboard"
      subtitle="Manage your dental profile, resumes, and saved jobs."
    >
      <Breadcrumbs items={[{ label: 'Seeker Home', to: '/seekers' }, { label: 'Student Dashboard' }]} />
      <Tabs
        tabs={[
          { id: 'profile', label: 'Profile' },
          { id: 'applications', label: 'Applications' },
          { id: 'saved', label: 'Saved jobs' }
        ]}
        active={activeTab}
        onChange={setActiveTab}
      />

      {activeTab === 'profile' && (
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm space-y-6">
          <div className="rounded-2xl border border-dashed border-black bg-white p-4 shadow-sm">
            <div>
              <p className="text-lg font-semibold text-gray-900">Upload a resume (mock)</p>
              <p className="text-sm text-gray-500">Simulated upload; file stored in local state only.</p>
              <p className="text-xs text-gray-400">
                Latest resume:{' '}
                {latestResume ? (
                  <span className="font-semibold text-gray-700">{latestResume.name}</span>
                ) : (
                  'none yet'
                )}
              </p>
            </div>
            <div className="mt-4">
              <button
                type="button"
                onClick={() => setShowUploadModal(true)}
                className="flex w-full items-center justify-between rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-brand shadow-sm transition hover:border-brand"
              >
                <span className="flex items-center gap-2">
                  <UploadCloud className="h-4 w-4" />
                  <span>{latestResume ? 'Upload new resume' : 'Upload resume'}</span>
                </span>
                <span className="text-xs text-gray-500">.pdf .docx</span>
              </button>
            </div>
            {resumes.length > 0 && (
              <div className="mt-4 rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 text-sm text-gray-600">
                <p className="text-xs font-semibold text-gray-800">Stored resume</p>
                <p className="text-sm font-semibold text-gray-900">{resumes[0].name}</p>
                <p className="text-xs text-gray-500">Uploaded {formatDate(resumes[0].uploadedAt)}</p>
              </div>
            )}
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <Input
              label="Full name"
              value={profileFields.fullName}
              onChange={(event) => handleFieldChange('fullName', event.target.value)}
            />
            <Input
              label="Email"
              type="email"
              value={profileFields.email}
              onChange={(event) => handleFieldChange('email', event.target.value)}
            />
            <Input
              label="School"
              value={profileFields.school}
              onChange={(event) => handleFieldChange('school', event.target.value)}
            />
            <Input
              label="Graduation date"
              type="month"
              value={profileFields.graduation}
              onChange={(event) => handleFieldChange('graduation', event.target.value)}
            />
            <div className="md:col-span-2">
              <div>
                <p className="text-sm font-semibold text-gray-800">Clinical exposure</p>
                <p className="text-xs text-gray-500">
                  Toggle the skills that best describe your resume.
                </p>
              </div>
              <div className="mt-2 grid gap-2 sm:grid-cols-2">
                {exposures.map((item) => (
                  <Checkbox
                    key={item}
                    label={item}
                    checked={selectedExposures.includes(item)}
                    onChange={() => toggleExposure(item)}
                  />
                ))}
              </div>
            </div>
            <div className="md:col-span-2 flex items-center gap-2">
              <Button variant="primary">Save profile (mock)</Button>
              <Badge variant="info">UI only</Badge>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'applications' && (
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 className="text-lg font-semibold text-gray-900">Applications</h3>
            <div className="flex items-center gap-2">
              <label htmlFor="application-filter" className="text-xs font-semibold text-gray-500">
                Status
              </label>
              <select
                id="application-filter"
                value={applicationFilter}
                onChange={(event) => setApplicationFilter(event.target.value as JobStage | 'All')}
                className="rounded-full border border-gray-200 bg-white px-3 py-1 text-xs text-gray-700"
              >
                {applicationStatuses.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid gap-3">
            {filteredApplications.map((app) => {
              const job = jobs.find((j) => j.id === app.jobId);
              if (!job) {
                return null;
              }
              return (
                <Link
                  key={app.id}
                  to={`/jobs/${job.id}`}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-gray-100 bg-gray-50 p-4 transition hover:border-brand"
                >
                  <div>
                    <p className="font-semibold text-gray-900">{job.roleType}</p>
                    <p className="text-sm text-gray-600">{job.clinicName}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{app.status}</Badge>
                    <p className="text-xs text-gray-600">Applied {formatDate(app.appliedAt)}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {activeTab === 'saved' && (
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900">Saved jobs</h3>
          <div className="mt-3 grid gap-3">
            {jobs.slice(0, 3).map((job) => (
              <Link
                key={job.id}
                to={`/jobs/${job.id}`}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-gray-100 bg-gray-50 p-4 transition hover:border-brand"
              >
                <div>
                  <p className="font-semibold text-gray-900">{job.roleType}</p>
                  <p className="text-xs text-gray-600">
                    {job.clinicName} - {job.city}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {job.specialtyTags.slice(0, 3).map((tag) => (
                      <TagPill key={tag} label={tag} />
                    ))}
                  </div>
                </div>
                <span className="text-sm font-semibold text-brand">View job</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-6">
          <div className="w-full max-w-md overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Upload resume</h3>
              <button
                className="text-xs font-semibold uppercase tracking-wide text-gray-500"
                onClick={() => {
                  setShowUploadModal(false);
                  setUploadFileName('');
                }}
              >
                Close
              </button>
            </div>
            <p className="mt-2 text-sm text-gray-600">
              Upload your resume and the system will scan it to populate your profile details automatically.
            </p>
            <label className="mt-4 flex cursor-pointer items-center justify-between gap-2 rounded-xl border border-dashed border-gray-300 bg-gray-50 px-4 py-3 text-sm font-semibold text-gray-700 transition hover:border-brand">
              <span className="flex items-center gap-2">
                <UploadCloud className="h-4 w-4 text-brand" />
                <span>{uploadFileName || 'Choose resume file'}</span>
              </span>
              <input
                type="file"
                className="hidden"
                onChange={(event) => {
                  const name = event.target.files?.[0]?.name;
                  if (name) setUploadFileName(name);
                }}
              />
            </label>
            <div className="mt-4 flex justify-end gap-2">
              <Button variant="ghost" size="sm" onClick={() => {
                setShowUploadModal(false);
                setUploadFileName('');
              }}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" onClick={handleModalSave} disabled={!uploadFileName}>
                Upload & autofill
              </Button>
            </div>
          </div>
        </div>
      )}
    </DashboardShell>
  );
}
