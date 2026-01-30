import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardShell } from '../../layouts/DashboardShell';
import { Breadcrumbs } from '../../components/Breadcrumbs';
import { Input } from '../../components/ui/input';
import { Select } from '../../components/ui/select';
import { Checkbox } from '../../components/ui/checkbox';
import { Button } from '../../components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { Camera, UploadCloud, ScanText, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Database } from '../../lib/database.types';
import { extractTextFromPDF } from '../../lib/utils/pdf';
import { parseResumeWithGemini } from '../../lib/services/resume';
import EducationSection from '../../components/profile/EducationSection';
import WorkExperienceSection from '../../components/profile/WorkExperienceSection';
import { Education, WorkExperience, Resume } from '../../lib/types';
import { addEducation } from '../../lib/api/education';
import { addWorkExperience } from '../../lib/api/work_experience';
import { Modal } from '../../components/ui/modal';
import { Toast } from '../../components/ui/toast';
import { formatDate } from '../../lib/utils';

const sidebarLinks = [
    { to: '/seekers/dashboard', label: 'Dashboard' },
    { to: '/seekers/dashboard/edit', label: 'Edit Profile' },
];

const defaultProfileFields = {
    fullName: '',
    email: '',
    school: '',
    graduation: '',
    seekerType: 'student',
    avatarUrl: '',
};

const exposures = [
    'Scaling & Polishing',
    'Extraction',
    'Filling (Amalgam)',
    'Filling (Composite)',
    'Root Canal',
    'Crown & Bridge',
    'Dentures',
    'Orthodontics',
    'Implants',
    'Pediatric Dentistry',
    'Oral Surgery',
    'Endodontics',
];

export default function EditProfilePage() {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [profileFields, setProfileFields] = useState(defaultProfileFields);
    const [selectedExposures, setSelectedExposures] = useState<string[]>([]);
    const [dataVersion, setDataVersion] = useState(0);

    // Avatar upload
    const avatarInputRef = useRef<HTMLInputElement>(null);
    const [avatarUploading, setAvatarUploading] = useState(false);
    const [avatarFile, setAvatarFile] = useState<File | null>(null);

    // Resume upload & analysis
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [resumes, setResumes] = useState<Resume[]>([]);
    const [latestResume, setLatestResume] = useState<Resume | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [uploadFile, setUploadFile] = useState<File | null>(null);
    const [uploadFileName, setUploadFileName] = useState('');
    const [uploading, setUploading] = useState(false);

    // API Key Modal for resume analysis
    const [showApiKeyModal, setShowApiKeyModal] = useState(false);
    const [apiKey, setApiKey] = useState('');
    const [tempAnalyzeFile, setTempAnalyzeFile] = useState<File | null>(null);

    // Toast
    const [showToast, setShowToast] = useState(false);
    const [toastContent, setToastContent] = useState({ title: '', description: '' });

    // Fetch profile data
    useEffect(() => {
        async function fetchData() {
            if (!user) return;
            setLoading(true);
            try {
                // Fetch profile
                const { data: profileData } = await supabase
                    .from('profiles')
                    .select('full_name, avatar_url')
                    .eq('id', user.id)
                    .single();

                // Fetch seeker profile
                const { data: seekerData } = await supabase
                    .from('seeker_profiles')
                    .select('school_name, expected_graduation_date, clinical_exposures, seeker_type')
                    .eq('user_id', user.id)
                    .single();

                // Fetch resumes/documents
                const { data: resumeData } = await supabase
                    .from('seeker_documents')
                    .select('*')
                    .eq('user_id', user.id)
                    .order('created_at', { ascending: false });

                if (profileData) {
                    setProfileFields(prev => ({
                        ...prev,
                        fullName: profileData.full_name || '',
                        email: user.email || '',
                        avatarUrl: profileData.avatar_url || '',
                    }));
                }

                if (seekerData) {
                    setProfileFields(prev => ({
                        ...prev,
                        school: seekerData.school_name || '',
                        graduation: seekerData.expected_graduation_date?.substring(0, 7) || '',
                        seekerType: seekerData.seeker_type || 'student',
                    }));
                    setSelectedExposures(
                        Array.isArray(seekerData.clinical_exposures)
                            ? (seekerData.clinical_exposures as string[])
                            : []
                    );
                }

                if (resumeData && resumeData.length > 0) {
                    const mappedResumes = resumeData.map(r => ({
                        id: r.id,
                        name: r.title,
                        url: r.storage_path,
                        uploadedAt: r.created_at,
                    }));
                    setResumes(mappedResumes);
                    setLatestResume(mappedResumes[0]);
                }
            } catch (err) {
                console.error('Error fetching profile:', err);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, [user]);

    const handleFieldChange = (field: keyof typeof defaultProfileFields, value: string) => {
        setProfileFields(prev => ({ ...prev, [field]: value }));
    };

    const toggleExposure = (item: string) => {
        setSelectedExposures(prev =>
            prev.includes(item) ? prev.filter(entry => entry !== item) : [...prev, item]
        );
    };

    const handleAvatarUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setAvatarFile(file);
        const previewUrl = URL.createObjectURL(file);
        setProfileFields(prev => ({ ...prev, avatarUrl: previewUrl }));
    };

    const handleSaveProfile = async () => {
        if (!user) return;
        setSaving(true);
        try {
            let currentAvatarUrl = profileFields.avatarUrl;

            // Handle pending avatar upload
            if (avatarFile) {
                const fileExt = avatarFile.name.split('.').pop();
                const filePath = `${user.id}/avatar.${fileExt}`;

                const { error: uploadError } = await supabase.storage
                    .from('avatars')
                    .upload(filePath, avatarFile, { upsert: true });

                if (uploadError) throw uploadError;

                const { data: { publicUrl } } = supabase.storage
                    .from('avatars')
                    .getPublicUrl(filePath);

                currentAvatarUrl = `${publicUrl}?t=${Date.now()}`;
            }

            const { error: profileError } = await supabase
                .from('profiles')
                .update({
                    full_name: profileFields.fullName,
                    avatar_url: currentAvatarUrl
                })
                .eq('id', user.id);

            if (profileError) throw profileError;

            const { error: seekerError } = await supabase
                .from('seeker_profiles')
                .upsert({
                    user_id: user.id,
                    school_name: profileFields.school,
                    expected_graduation_date: profileFields.graduation ? `${profileFields.graduation}-01` : null,
                    clinical_exposures: selectedExposures,
                    seeker_type: profileFields.seekerType as Database['public']['Enums']['seeker_type']
                });

            if (seekerError) throw seekerError;

            setToastContent({ title: 'Success', description: 'Profile saved successfully!' });
            setShowToast(true);

            // Navigate back after short delay
            setTimeout(() => navigate('/seekers/dashboard'), 1500);
        } catch (err) {
            console.error('Error saving profile:', JSON.stringify(err, null, 2));
            alert('Failed to save profile.');
        } finally {
            setSaving(false);
        }
    };

    const handleResumeUpload = async () => {
        if (!uploadFile || !user) return;
        setUploading(true);
        try {
            const fileExt = uploadFile.name.split('.').pop();
            const filePath = `${user.id}/${Date.now()}.${fileExt}`;

            const { error: uploadError } = await supabase.storage
                .from('resumes')
                .upload(filePath, uploadFile);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('resumes')
                .getPublicUrl(filePath);

            await supabase.from('seeker_documents').insert({
                user_id: user.id,
                title: uploadFile.name,
                storage_path: publicUrl,
                doc_type: 'resume' as const,
            });

            setShowUploadModal(false);
            setUploadFileName('');
            setUploadFile(null);

            // Refresh resumes
            const { data: resumeData } = await supabase
                .from('seeker_documents')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (resumeData && resumeData.length > 0) {
                const mappedResumes = resumeData.map(r => ({
                    id: r.id,
                    name: r.title,
                    url: r.storage_path,
                    uploadedAt: r.created_at,
                }));
                setResumes(mappedResumes);
                setLatestResume(mappedResumes[0]);
            }
        } catch (err) {
            console.error('Resume upload error:', err);
            alert('Failed to upload resume.');
        } finally {
            setUploading(false);
        }
    };

    const initiateAnalysis = async (file: File) => {
        const storedKey = localStorage.getItem('gemini_api_key');
        if (storedKey) {
            handleResumeAnalysis(storedKey, file);
        } else {
            setTempAnalyzeFile(file);
            setShowApiKeyModal(true);
        }
    };

    const handleResumeAnalysis = async (key: string, file: File) => {
        setIsAnalyzing(true);
        setShowApiKeyModal(false);
        try {
            localStorage.setItem('gemini_api_key', key);
            const text = await extractTextFromPDF(file);
            const parsed = await parseResumeWithGemini(text, key);

            if (parsed.fullName) {
                setProfileFields(prev => ({ ...prev, fullName: parsed.fullName || prev.fullName }));
            }
            if (parsed.education && parsed.education.length > 0) {
                for (const edu of parsed.education) {
                    await addEducation(user!.id, edu);
                }
            }
            if (parsed.workExperience && parsed.workExperience.length > 0) {
                for (const exp of parsed.workExperience) {
                    await addWorkExperience(user!.id, exp);
                }
            }

            setDataVersion(v => v + 1);
            setToastContent({ title: 'Resume Analyzed', description: 'Profile fields updated from resume.' });
            setShowToast(true);
        } catch (err) {
            console.error('Resume analysis error:', err);
            alert('Failed to analyze resume.');
        } finally {
            setIsAnalyzing(false);
            setTempAnalyzeFile(null);
        }
    };

    if (loading) {
        return (
            <DashboardShell sidebarLinks={sidebarLinks} title="Edit Profile">
                <div className="flex h-64 items-center justify-center">
                    <p className="text-gray-500">Loading...</p>
                </div>
            </DashboardShell>
        );
    }

    return (
        <DashboardShell
            sidebarLinks={sidebarLinks}
            title="Edit Profile"
            subtitle="Update your personal information and preferences."
            hideNavigation
        >
            <div className="space-y-6">
                {/* Save/Cancel Actions */}
                <div className="flex justify-between items-center">
                    <Button
                        variant="ghost"
                        onClick={() => navigate('/seekers/dashboard')}
                        icon={<ArrowLeft className="h-4 w-4" />}
                    >
                        Back to Dashboard
                    </Button>
                    <div className="flex gap-3">
                        <Button variant="ghost" onClick={() => navigate('/seekers/dashboard')}>
                            Cancel
                        </Button>
                        <Button variant="primary" onClick={handleSaveProfile} disabled={saving}>
                            {saving ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </div>
                </div>

                {/* Header Card - Matching public profile */}
                <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
                    <div className="h-24 bg-gradient-to-r from-indigo-50 to-blue-50"></div>
                    <div className="px-6 pb-6">
                        <div className="relative -mt-10 mb-4">
                            <div className="relative group w-fit">
                                <Avatar className="h-20 w-20 border-4 border-white shadow-md">
                                    <AvatarImage
                                        src={profileFields.avatarUrl || ''}
                                        alt="Profile"
                                        className="object-cover"
                                    />
                                    <AvatarFallback className="text-lg bg-gray-100 text-gray-600 font-bold">
                                        {profileFields.fullName ? profileFields.fullName.charAt(0).toUpperCase() : '?'}
                                    </AvatarFallback>
                                </Avatar>
                                <div
                                    className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-white"
                                    onClick={() => avatarInputRef.current?.click()}
                                >
                                    <Camera className="h-6 w-6" />
                                </div>
                                <input
                                    type="file"
                                    ref={avatarInputRef}
                                    className="hidden"
                                    accept="image/*"
                                    onChange={handleAvatarUpload}
                                    disabled={avatarUploading}
                                />
                            </div>

                        </div>

                        {/* Basic Info Fields */}
                        <div className="grid gap-4 md:grid-cols-2">
                            <Input
                                label="Full name"
                                value={profileFields.fullName}
                                onChange={(e) => handleFieldChange('fullName', e.target.value)}
                                containerClassName="text-base"
                                className="text-base px-4 py-3"
                            />
                            <Input
                                label="Email"
                                type="email"
                                value={profileFields.email}
                                disabled
                                className="bg-gray-50 text-base px-4 py-3"
                                containerClassName="text-base"
                            />
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Content - 2/3 */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Resume Upload Section */}
                        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                            <h3 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
                                <UploadCloud className="h-5 w-5 text-gray-400" />
                                Resume
                            </h3>
                            <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-4">
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                    <div>
                                        <p className="text-base text-gray-500">Upload your latest resume to auto-fill profile fields.</p>
                                        {latestResume && (
                                            <p className="text-sm text-gray-500 mt-1">
                                                Current: <span className="font-medium text-gray-700">{latestResume.name}</span>
                                            </p>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="file"
                                            ref={fileInputRef}
                                            className="hidden"
                                            accept=".pdf"
                                            onChange={(e) => {
                                                const file = e.target.files?.[0];
                                                if (file) {
                                                    setToastContent({ title: 'Analyzing...', description: `Processing ${file.name}` });
                                                    setShowToast(true);
                                                    initiateAnalysis(file);
                                                    e.target.value = '';
                                                }
                                            }}
                                        />
                                        <Button
                                            variant="secondary"
                                            size="sm"
                                            className="gap-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100"
                                            disabled={isAnalyzing}
                                            onClick={() => fileInputRef.current?.click()}
                                            icon={!isAnalyzing ? <ScanText className="h-4 w-4" /> : undefined}
                                        >
                                            {isAnalyzing ? 'Analyzing...' : 'Auto-fill'}
                                        </Button>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setShowUploadModal(true)}
                                    className="mt-3 flex w-full items-center justify-between rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-brand shadow-sm transition hover:border-brand"
                                >
                                    <span className="flex items-center gap-2">
                                        <UploadCloud className="h-4 w-4" />
                                        <span>{latestResume ? 'Upload new resume' : 'Upload resume'}</span>
                                    </span>
                                    <span className="text-xs text-gray-500">.pdf .docx</span>
                                </button>
                            </div>
                        </div>

                        {/* Work Experience Section */}
                        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                            <WorkExperienceSection key={`exp-${dataVersion}`} userId={user!.id} />
                        </div>

                        {/* Education Section */}
                        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                            <EducationSection key={`edu-${dataVersion}`} userId={user!.id} />
                        </div>
                    </div>

                    {/* Sidebar - 1/3 */}
                    <div className="space-y-6">
                        {/* Profile Details Card */}
                        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                            <h3 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wider">Profile Details</h3>
                            <div className="space-y-4">
                                <Select
                                    label="I am a..."
                                    value={profileFields.seekerType}
                                    onChange={(e) => handleFieldChange('seekerType', e.target.value)}
                                    containerClassName="text-base"
                                    className="text-base px-4 py-3"
                                >
                                    <option value="student">Student</option>
                                    <option value="fresh_grad">Fresh Graduate</option>
                                    <option value="professional">Professional</option>
                                </Select>
                                <Input
                                    label="School"
                                    value={profileFields.school}
                                    placeholder="e.g. Mahsa University"
                                    onChange={(e) => handleFieldChange('school', e.target.value)}
                                    containerClassName="text-base"
                                    className="text-base px-4 py-3"
                                />
                                <Input
                                    label="Graduation date"
                                    type="month"
                                    value={profileFields.graduation}
                                    onChange={(e) => handleFieldChange('graduation', e.target.value)}
                                    containerClassName="text-base"
                                    className="text-base px-4 py-3"
                                />
                            </div>
                        </div>

                        {/* Clinical Exposure Card */}
                        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                            <h3 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wider">Clinical Exposure</h3>
                            <p className="text-sm text-gray-500 mb-3">Select the skills you have experience with.</p>
                            <div className="space-y-2">
                                {exposures.map((item) => (
                                    <Checkbox
                                        key={item}
                                        label={item}
                                        checked={selectedExposures.includes(item)}
                                        onChange={() => toggleExposure(item)}
                                        textClassName="text-base"
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Resume Upload Modal */}
            <Modal open={showUploadModal} onClose={() => setShowUploadModal(false)}>
                <div className="w-full max-w-md bg-white rounded-2xl p-6 shadow-xl">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Upload Resume</h3>
                    <label className="flex cursor-pointer items-center justify-between gap-2 rounded-xl border border-dashed border-gray-300 bg-gray-50 px-4 py-3 text-sm font-semibold text-gray-700 transition hover:border-brand">
                        <span className="flex items-center gap-2">
                            <UploadCloud className="h-4 w-4 text-brand" />
                            <span>{uploadFileName || 'Choose file'}</span>
                        </span>
                        <input
                            type="file"
                            className="hidden"
                            accept=".pdf,.docx,.doc"
                            onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                    setUploadFile(file);
                                    setUploadFileName(file.name);
                                }
                            }}
                        />
                    </label>
                    <div className="flex justify-end gap-2 mt-4">
                        <Button variant="ghost" onClick={() => { setShowUploadModal(false); setUploadFileName(''); setUploadFile(null); }}>
                            Cancel
                        </Button>
                        <Button variant="primary" onClick={handleResumeUpload} disabled={!uploadFile || uploading}>
                            {uploading ? 'Uploading...' : 'Upload'}
                        </Button>
                    </div>
                </div>
            </Modal>

            {/* API Key Modal */}
            <Modal open={showApiKeyModal} onClose={() => setShowApiKeyModal(false)}>
                <div className="w-full max-w-md bg-white rounded-2xl p-6 shadow-xl">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Gemini API Key Required</h3>
                    <p className="text-sm text-gray-500 mb-4">Enter your Gemini API key to analyze resumes.</p>
                    <Input
                        label="API Key"
                        type="password"
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                        placeholder="AIza..."
                    />
                    <div className="flex justify-end gap-2 mt-4">
                        <Button variant="ghost" onClick={() => setShowApiKeyModal(false)}>
                            Cancel
                        </Button>
                        <Button
                            variant="primary"
                            disabled={!apiKey || !tempAnalyzeFile}
                            onClick={() => tempAnalyzeFile && handleResumeAnalysis(apiKey, tempAnalyzeFile)}
                        >
                            Continue
                        </Button>
                    </div>
                </div>
            </Modal>

            <Toast
                open={showToast}
                onClose={() => setShowToast(false)}
                title={toastContent.title}
                description={toastContent.description}
                variant="success"
            />
        </DashboardShell>
    );
}
