import { useState } from 'react';
import { DashboardShell } from '../../layouts/DashboardShell';
import { applications, jobs, resumes as resumeData } from '../../lib/mockData';
import { Tabs } from '../../components/ui/tabs';
import { Input } from '../../components/ui/input';
import { Checkbox } from '../../components/ui/checkbox';
import { ResumeUpload } from '../../components/ResumeUpload';
import { Badge } from '../../components/ui/badge';
import { TagPill } from '../../components/TagPill';
import { Button } from '../../components/ui/button';
import { Resume } from '../../lib/types';
import { formatDate } from '../../lib/utils';
import { Breadcrumbs } from '../../components/Breadcrumbs';

const sidebarLinks = [
  { to: '/student/profile', label: 'Profile' },
  { to: '/jobs', label: 'Browse jobs' },
  { to: '/jobs/job-1', label: 'Saved jobs' }
];

const exposures = ['4-hand dentistry', 'Sterilization', 'Intraoral scanning', 'Implant chairside', 'Pediatric'];

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
  const [resumes, setResumes] = useState<Resume[]>(resumeData);
  const [latestResume, setLatestResume] = useState<Resume | null>(resumeData[0] ?? null);
  const [profileFields, setProfileFields] = useState(defaultProfileFields);
  const [selectedExposures, setSelectedExposures] = useState<string[]>(exposures.slice(0, 3));

  const handleFieldChange = (field: keyof typeof defaultProfileFields, value: string) => {
    setProfileFields((prev) => ({ ...prev, [field]: value }));
  };

  const handleResumeAdd = (resume: Resume) => {
    setResumes((prev) => [resume, ...prev]);
    setLatestResume(resume);
  };

  const toggleExposure = (item: string) => {
    setSelectedExposures((prev) =>
      prev.includes(item) ? prev.filter((entry) => entry !== item) : [...prev, item]
    );
  };

  const handleAutofill = () => {
    const scan = mockScanResume(latestResume);
    setProfileFields({
      fullName: scan.fullName,
      email: scan.email,
      school: scan.school,
      graduation: scan.graduation
    });
    setSelectedExposures(scan.exposures);
  };

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
          { id: 'resumes', label: 'Resumes' },
          { id: 'applications', label: 'Applications' },
          { id: 'saved', label: 'Saved jobs' }
        ]}
        active={activeTab}
        onChange={setActiveTab}
      />

      {activeTab === 'profile' && (
        <div className="grid gap-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm md:grid-cols-2">
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
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-gray-800">Clinical exposure</p>
                <p className="text-xs text-gray-500">
                  Latest resume:{' '}
                  {latestResume ? (
                    <span className="font-semibold text-gray-700">{latestResume.name}</span>
                  ) : (
                    'none yet'
                  )}
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleAutofill}
                disabled={!latestResume}
              >
                Autofill from resume
              </Button>
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
      )}

      {activeTab === 'resumes' && (
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <ResumeUpload resumes={resumes} onAdd={handleResumeAdd} />
        </div>
      )}

      {activeTab === 'applications' && (
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900">Applications</h3>
          <div className="mt-3 grid gap-3">
            {applications.map((app) => {
              const job = jobs.find((j) => j.id === app.jobId);
              return (
                <div
                  key={app.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-gray-100 bg-gray-50 p-4"
                >
                  <div>
                    <p className="font-semibold text-gray-900">{job?.roleType}</p>
                    <p className="text-sm text-gray-600">{job?.clinicName}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{app.status}</Badge>
                    <p className="text-xs text-gray-600">Applied {formatDate(app.appliedAt)}</p>
                  </div>
                </div>
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
              <div key={job.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-gray-100 bg-gray-50 p-4">
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
                <Button variant="outline" size="sm">
                  View
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </DashboardShell>
  );
}
