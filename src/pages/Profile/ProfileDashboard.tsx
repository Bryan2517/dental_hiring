import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { DashboardShell } from '../../layouts/DashboardShell';
import { Tabs } from '../../components/ui/tabs';
import { Input } from '../../components/ui/input';
import { Select } from '../../components/ui/select';
import { Checkbox } from '../../components/ui/checkbox';
import { Badge } from '../../components/ui/badge';
import { TagPill } from '../../components/TagPill';
import { Button } from '../../components/ui/button';
import { JobCard } from '../../components/JobCard';
import { JobStage, Resume } from '../../lib/types';
import { formatDate } from '../../lib/utils';
import { getSavedJobs, unsaveJob } from '../../lib/api/jobs';
import { Breadcrumbs } from '../../components/Breadcrumbs';
import { UploadCloud } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Database } from '../../lib/database.types';
import { getApplications } from '../../lib/api/applications';

const sidebarLinks = [
  { to: '/student/profile', label: 'Profile' },
  { to: '/jobs', label: 'Browse jobs' },
  { to: '/jobs/job-1', label: 'Saved jobs' }
];

const exposures = ['4-hand dentistry', 'Sterilization', 'Intraoral scanning', 'Implant chairside', 'Pediatric'];
const applicationStatuses: (JobStage | 'All')[] = ['All', 'Applied', 'Shortlisted', 'Interview', 'Offer', 'Hired', 'Rejected'];

const defaultProfileFields = {
  fullName: '',
  email: '',
  school: '',
  graduation: '',
  seekerType: 'student',
};

export default function ProfileDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');

  // Real Data State
  const [loading, setLoading] = useState(true);
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [latestResume, setLatestResume] = useState<Resume | null>(null);
  const [profileFields, setProfileFields] = useState(defaultProfileFields);
  const [selectedExposures, setSelectedExposures] = useState<string[]>([]);

  // Modals & Upload
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadFileName, setUploadFileName] = useState('');
  const [uploading, setUploading] = useState(false);

  // Applications & Saved Jobs (We'll keep these mostly empty/basic for now unless we have real data populated)
  const [applications, setApplications] = useState<any[]>([]);
  const [savedJobs, setSavedJobs] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;

    async function fetchData() {
      setLoading(true);
      try {
        // 1. Fetch Profile Data (profiles + seeker_profiles)
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('full_name, seeker_profiles(school_name, expected_graduation_date, clinical_exposures, seeker_type)')
          .eq('id', user!.id)
          .single();

        if (profileError) {
          console.error('Error fetching profile:', profileError);
        } else if (profileData) {
          // Cast to any to safely handle the joined data structure
          const data = profileData as any;
          const seeker = data.seeker_profiles?.[0] || data.seeker_profiles || {};

          // Safe check for array vs object
          const seekerDetails = Array.isArray(seeker) ? seeker[0] : seeker;

          setProfileFields({
            fullName: data.full_name || '',
            email: user!.email || '', // auth email is reliable source
            school: seekerDetails?.school_name || '',
            graduation: seekerDetails?.expected_graduation_date ? seekerDetails.expected_graduation_date.substring(0, 7) : '',
            seekerType: seekerDetails?.seeker_type || 'student',
          });
          setSelectedExposures(seekerDetails?.clinical_exposures || []);
        }

        // 2. Fetch Resumes (seeker_documents)
        // Order by created_at DESC to get latest
        const { data: docs, error: docsError } = await supabase
          .from('seeker_documents')
          .select('id, title, created_at, storage_path')
          .eq('user_id', user!.id)
          .eq('doc_type', 'resume')
          .order('created_at', { ascending: false });

        if (docsError) {
          console.error('Error fetching documents:', docsError);
        } else if (docs) {
          // Map to Resume type
          const mappedResumes: Resume[] = docs.map(d => ({
            id: d.id,
            name: d.title,
            uploadedAt: d.created_at,
            category: 'Resume',
            url: d.storage_path // Or construct full URL if needed
          }));
          setResumes(mappedResumes);
          setResumes(mappedResumes);
          setLatestResume(mappedResumes[0] || null);
        }

        // 3. Fetch Applications
        const apps = await getApplications({ seeker_user_id: user!.id });
        setApplications(apps);

        // 4. Fetch Saved Jobs
        const saved = await getSavedJobs(user!.id);
        setSavedJobs(saved);

      } catch (err) {
        console.error('Unexpected error fetching dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [user]);

  const handleFieldChange = (field: keyof typeof defaultProfileFields, value: string) => {
    setProfileFields((prev) => ({ ...prev, [field]: value }));
  };

  const toggleExposure = (item: string) => {
    setSelectedExposures((prev) =>
      prev.includes(item) ? prev.filter((entry) => entry !== item) : [...prev, item]
    );
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    setLoading(true);
    try {
      // Update 'profiles' table (full_name)
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ full_name: profileFields.fullName })
        .eq('id', user.id);

      if (profileError) throw profileError;

      // Update 'seeker_profiles' table
      // Use upsert to create the row if it doesn't exist
      const { error: seekerError } = await supabase
        .from('seeker_profiles')
        .upsert({
          user_id: user.id,
          school_name: profileFields.school,
          expected_graduation_date: profileFields.graduation ? `${profileFields.graduation}-01` : null, // Convert YYYY-MM to YYYY-MM-DD
          clinical_exposures: selectedExposures,
          seeker_type: profileFields.seekerType as Database['public']['Enums']['seeker_type']
        });

      // Note: upsert requires the primary key (user_id) to be present to determine update vs insert.
      // We included user_id above.

      if (seekerError) throw seekerError;

      alert('Profile saved successfully!');
    } catch (err) {
      console.error('Error saving profile:', err);
      alert('Failed to save profile.');
    } finally {
      setLoading(false);
    }
  };

  const handleResumeUpload = async () => {
    if (!uploadFile || !user) return;

    setUploading(true);
    try {
      const fileExt = uploadFile.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      // 1. Upload to Storage
      const { error: uploadError } = await supabase.storage
        .from('resumes')
        .upload(filePath, uploadFile);

      if (uploadError) throw uploadError;

      // 2. Create DB Record
      const { error: dbError } = await supabase
        .from('seeker_documents')
        .insert({
          user_id: user.id,
          title: uploadFileName || uploadFile.name,
          doc_type: 'resume',
          storage_path: filePath,
          is_default: true // Mark as default/latest
        });

      if (dbError) throw dbError;

      // 3. Refresh List
      const newResume: Resume = {
        id: 'temp-id', // will be refreshed on reload/fetch
        name: uploadFileName || uploadFile.name,
        uploadedAt: new Date().toISOString(),
        category: 'Resume',
        url: filePath
      };

      setResumes([newResume, ...resumes]); // Add to top
      setLatestResume(newResume);

      setShowUploadModal(false);
      setUploadFile(null);
      setUploadFileName('');

    } catch (err) {
      console.error('Error uploading resume:', err);
      alert('Failed to upload resume.');
    } finally {
      setUploading(false);
    }
  };

  const [applicationFilter, setApplicationFilter] = useState<JobStage | 'All'>('All');

  const filteredApplications = useMemo(() => {
    if (applicationFilter === 'All') return applications;
    return applications.filter((application) => application.status === applicationFilter);
  }, [applicationFilter, applications]);

  if (loading && !profileFields.email) {
    return (
      <DashboardShell sidebarLinks={sidebarLinks} title="Student Dashboard" subtitle="Loading..." hideNavigation>
        <div className="flex h-64 items-center justify-center">
          <p className="text-gray-500">Loading profile data...</p>
        </div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell
      sidebarLinks={sidebarLinks}
      title="Student Dashboard"
      subtitle="Manage your dental profile, resumes, and saved jobs."
      hideNavigation
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
              <p className="text-lg font-semibold text-gray-900">Upload a resume</p>
              <p className="text-sm text-gray-500">Upload your latest resume to be visible to employers.</p>
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
              disabled // Email usually can't be changed easily
              className="bg-gray-50"
              onChange={(event) => handleFieldChange('email', event.target.value)}
            />
            <Select
              label="I am a..."
              value={profileFields.seekerType}
              onChange={(event) => handleFieldChange('seekerType', event.target.value)}
            >
              <option value="student">Student</option>
              <option value="fresh_grad">Fresh Graduate</option>
              <option value="professional">Professional</option>
            </Select>
            <Input
              label="School"
              value={profileFields.school}
              placeholder="e.g. Mahsa University"
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
                  Select the skills you have experience with.
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
              <Button variant="primary" onClick={handleSaveProfile} disabled={loading}>
                {loading ? 'Saving...' : 'Save Profile'}
              </Button>
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
            {filteredApplications.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">No applications found.</p>
            ) : (
              filteredApplications.map((app) => (
                <div key={app.id} className="rounded-xl border border-gray-100 bg-white p-4 transition hover:border-brand/40 hover:shadow-sm">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h4 className="font-semibold text-gray-900">{app.jobTitle}</h4>
                      <div className="mt-1 flex flex-col gap-0.5 text-sm text-gray-500">
                        <span className="font-medium text-gray-700">{app.clinicName}</span>
                        <span>{app.location}</span>
                      </div>
                      <div className="mt-3 flex items-center gap-2 text-xs text-gray-400">
                        <span>Applied {formatDate(app.appliedAt)}</span>
                      </div>
                    </div>
                    <div>
                      <Badge variant={
                        app.status === 'Applied' ? 'default' :
                          app.status === 'Shortlisted' ? 'info' :
                            app.status === 'Interview' ? 'warning' :
                              app.status === 'Offer' ? 'success' :
                                'default'
                      }>
                        {app.status}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}


      {activeTab === 'saved' && (
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900">Saved jobs</h3>
          <div className="mt-3 grid gap-3">
            {savedJobs.length === 0 ? (
              <p className="text-sm text-gray-500">No saved jobs yet.</p>
            ) : (
              savedJobs.map((job) => (
                <JobCard
                  key={job.id}
                  job={job}
                  onApply={() => { }}
                  isSaved={true}
                  onToggleSave={async (j) => {
                    if (window.confirm('Remove from saved jobs?')) {
                      await unsaveJob(user!.id, j.id);
                      setSavedJobs(prev => prev.filter(p => p.id !== j.id));
                    }
                  }}
                />
              ))
            )}
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
                  setUploadFile(null);
                }}
              >
                Close
              </button>
            </div>
            <p className="mt-2 text-sm text-gray-600">
              Upload your resume (.pdf, .docx). The new file will replace your current latest resume.
            </p>
            <label className="mt-4 flex cursor-pointer items-center justify-between gap-2 rounded-xl border border-dashed border-gray-300 bg-gray-50 px-4 py-3 text-sm font-semibold text-gray-700 transition hover:border-brand">
              <span className="flex items-center gap-2">
                <UploadCloud className="h-4 w-4 text-brand" />
                <span>{uploadFileName || 'Choose resume file'}</span>
              </span>
              <input
                type="file"
                className="hidden"
                accept=".pdf,.docx,.doc"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) {
                    setUploadFile(file);
                    setUploadFileName(file.name);
                  }
                }}
              />
            </label>
            <div className="mt-4 flex justify-end gap-2">
              <Button variant="ghost" size="sm" onClick={() => {
                setShowUploadModal(false);
                setUploadFileName('');
                setUploadFile(null);
              }}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" onClick={handleResumeUpload} disabled={!uploadFile || uploading}>
                {uploading ? 'Uploading...' : 'Upload'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </DashboardShell>
  );
}
