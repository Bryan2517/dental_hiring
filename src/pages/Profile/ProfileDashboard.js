import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardShell } from '../../layouts/DashboardShell';
import { Tabs } from '../../components/ui/tabs';
import { Input } from '../../components/ui/input';
import { Select } from '../../components/ui/select';
import { Checkbox } from '../../components/ui/checkbox';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { JobCard } from '../../components/JobCard';
import { formatDate } from '../../lib/utils';
import { getSavedJobs, unsaveJob } from '../../lib/api/jobs';
import { Breadcrumbs } from '../../components/Breadcrumbs';
import { UploadCloud, ScanText } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { getApplications } from '../../lib/api/applications';
import { extractTextFromPDF } from '../../lib/utils/pdf';
import { parseResumeWithGemini } from '../../lib/services/resume';
const sidebarLinks = [
    { to: '/student/profile', label: 'Profile' },
    { to: '/jobs', label: 'Browse jobs' },
    { to: '/jobs/job-1', label: 'Saved jobs' }
];
const exposures = ['4-hand dentistry', 'Sterilization', 'Intraoral scanning', 'Implant chairside', 'Pediatric'];
const applicationStatuses = ['All', 'Applied', 'Shortlisted', 'Interview', 'Offer', 'Hired', 'Rejected'];
const defaultProfileFields = {
    fullName: '',
    email: '',
    school: '',
    graduation: '',
    seekerType: 'student',
};
import { Modal } from '../../components/ui/modal';
import { Toast } from '../../components/ui/toast';
export default function ProfileDashboard() {
    const { user, signOut } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('profile');
    const [showSignOutConfirm, setShowSignOutConfirm] = useState(false);
    const handleConfirmSignOut = async () => {
        await signOut();
        navigate('/');
    };
    // Real Data State
    const [loading, setLoading] = useState(true);
    const [resumes, setResumes] = useState([]);
    const [latestResume, setLatestResume] = useState(null);
    const [profileFields, setProfileFields] = useState(defaultProfileFields);
    const [selectedExposures, setSelectedExposures] = useState([]);
    // Modals & Upload
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [uploadFile, setUploadFile] = useState(null);
    const [uploadFileName, setUploadFileName] = useState('');
    const [uploading, setUploading] = useState(false);
    // Resume Scanner State
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [showApiKeyModal, setShowApiKeyModal] = useState(false);
    const [apiKey, setApiKey] = useState('');
    const [tempAnalyzeFile, setTempAnalyzeFile] = useState(null);
    // Toast State
    const [showToast, setShowToast] = useState(false);
    const [toastContent, setToastContent] = useState({ title: '', description: '' });
    // Applications & Saved Jobs (We'll keep these mostly empty/basic for now unless we have real data populated)
    const [applications, setApplications] = useState([]);
    const [savedJobs, setSavedJobs] = useState([]);
    useEffect(() => {
        if (!user)
            return;
        async function fetchData() {
            setLoading(true);
            try {
                // 1. Fetch Profile Data (profiles + seeker_profiles)
                const { data: profileData, error: profileError } = await supabase
                    .from('profiles')
                    .select('full_name, seeker_profiles(school_name, expected_graduation_date, clinical_exposures, seeker_type)')
                    .eq('id', user.id)
                    .single();
                if (profileError) {
                    console.error('Error fetching profile:', profileError);
                }
                else if (profileData) {
                    // Cast to any to safely handle the joined data structure
                    const data = profileData;
                    const seeker = data.seeker_profiles?.[0] || data.seeker_profiles || {};
                    // Safe check for array vs object
                    const seekerDetails = Array.isArray(seeker) ? seeker[0] : seeker;
                    setProfileFields({
                        fullName: data.full_name || '',
                        email: user.email || '', // auth email is reliable source
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
                    .eq('user_id', user.id)
                    .eq('doc_type', 'resume')
                    .order('created_at', { ascending: false });
                if (docsError) {
                    console.error('Error fetching documents:', docsError);
                }
                else if (docs) {
                    // Map to Resume type
                    const mappedResumes = docs.map(d => ({
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
                const apps = await getApplications({ seeker_user_id: user.id });
                setApplications(apps);
                // 4. Fetch Saved Jobs
                const saved = await getSavedJobs(user.id);
                setSavedJobs(saved);
            }
            catch (err) {
                console.error('Unexpected error fetching dashboard data:', err);
            }
            finally {
                setLoading(false);
            }
        }
        fetchData();
    }, [user]);
    const handleFieldChange = (field, value) => {
        setProfileFields((prev) => ({ ...prev, [field]: value }));
    };
    const toggleExposure = (item) => {
        setSelectedExposures((prev) => prev.includes(item) ? prev.filter((entry) => entry !== item) : [...prev, item]);
    };
    const handleSaveProfile = async () => {
        if (!user)
            return;
        setLoading(true);
        try {
            // Update 'profiles' table (full_name)
            const { error: profileError } = await supabase
                .from('profiles')
                .update({ full_name: profileFields.fullName })
                .eq('id', user.id);
            if (profileError)
                throw profileError;
            // Update 'seeker_profiles' table
            // Use upsert to create the row if it doesn't exist
            const { error: seekerError } = await supabase
                .from('seeker_profiles')
                .upsert({
                user_id: user.id,
                school_name: profileFields.school,
                expected_graduation_date: profileFields.graduation ? `${profileFields.graduation}-01` : null, // Convert YYYY-MM to YYYY-MM-DD
                clinical_exposures: selectedExposures,
                seeker_type: profileFields.seekerType
            });
            // Note: upsert requires the primary key (user_id) to be present to determine update vs insert.
            // We included user_id above.
            if (seekerError)
                throw seekerError;
            alert('Profile saved successfully!');
        }
        catch (err) {
            console.error('Error saving profile:', err);
            alert('Failed to save profile.');
        }
        finally {
            setLoading(false);
        }
    };
    const handleResumeUpload = async () => {
        if (!uploadFile || !user)
            return;
        setUploading(true);
        try {
            const fileExt = uploadFile.name.split('.').pop();
            const fileName = `${user.id} -${Date.now()}.${fileExt} `;
            const filePath = `${fileName} `;
            // 1. Upload to Storage
            const { error: uploadError } = await supabase.storage
                .from('resumes')
                .upload(filePath, uploadFile);
            if (uploadError)
                throw uploadError;
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
            if (dbError)
                throw dbError;
            // 3. Refresh List
            const newResume = {
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
        }
        catch (err) {
            console.error('Error uploading resume:', err);
            alert('Failed to upload resume.');
        }
        finally {
            setUploading(false);
        }
    };
    const handleResumeAnalysis = async (key, file) => {
        if (!file)
            return;
        setIsAnalyzing(true);
        try {
            // 1. Extract Text
            console.log('Starting PDF extraction...');
            const text = await extractTextFromPDF(file);
            console.log('PDF extraction complete, length:', text.length);
            if (!text.trim()) {
                throw new Error('Could not extract any text from this PDF. Please try a different file.');
            }
            // 2. Parse with LLM
            const start = Date.now();
            const extractedData = await parseResumeWithGemini(text, key);
            const duration = Date.now() - start;
            // 3. Auto-fill fields
            setProfileFields(prev => ({
                ...prev,
                fullName: extractedData.fullName || prev.fullName,
                email: extractedData.email || prev.email,
                // Map other fields as best as possible
                school: extractedData.school || prev.school,
                seekerType: (extractedData.experienceYears || 0) > 2 ? 'professional' : 'student',
            }));
            // Add skills to clinical exposures if they match
            if (extractedData.skills && extractedData.skills.length > 0) {
                // Simple fuzzy match or direct match against our fixed list "exposures"
                const newExposures = [...selectedExposures];
                extractedData.skills.forEach(skill => {
                    const key = skill.toLowerCase();
                    // Check if this skill roughly matches one of our exposure options
                    const match = exposures.find(e => e.toLowerCase().includes(key) || key.includes(e.toLowerCase()));
                    if (match && !newExposures.includes(match)) {
                        newExposures.push(match);
                    }
                });
                setSelectedExposures(newExposures);
            }
            setToastContent({
                title: 'Resume analyzed successfully!',
                description: `Found: ${extractedData.fullName || 'Name'}, ${extractedData.school || 'School'}. Mapped ${extractedData.skills?.length || 0} skills.`
            });
            setShowToast(true);
            setShowApiKeyModal(false);
            setTempAnalyzeFile(null);
        }
        catch (err) {
            console.error('Analysis failed:', err);
            const msg = err instanceof Error ? err.message : String(err);
            setToastContent({
                title: 'Analysis Failed',
                description: msg.includes('400')
                    ? 'Invalid API Key or Resume format.'
                    : msg
            });
            setShowToast(true);
            // alert('Failed to analyze resume. Please try again.'); // Using toast instead
        }
        finally {
            setIsAnalyzing(false);
        }
    };
    const initiateAnalysis = (file) => {
        setTempAnalyzeFile(file);
        const envApiKey = import.meta.env.VITE_GEMINI_API_KEY;
        if (envApiKey) {
            handleResumeAnalysis(envApiKey, file);
        }
        else if (apiKey) {
            handleResumeAnalysis(apiKey, file);
        }
        else {
            setShowApiKeyModal(true);
        }
    };
    const [applicationFilter, setApplicationFilter] = useState('All');
    const filteredApplications = useMemo(() => {
        if (applicationFilter === 'All')
            return applications;
        return applications.filter((application) => application.status === applicationFilter);
    }, [applicationFilter, applications]);
    if (loading && !profileFields.email) {
        return (_jsxs(DashboardShell, { sidebarLinks: sidebarLinks, title: "Student Dashboard", subtitle: "Loading...", hideNavigation: true, children: [_jsx("div", { className: "flex h-64 items-center justify-center", children: _jsx("p", { className: "text-gray-500", children: "Loading profile data..." }) }), _jsx(Modal, { open: showApiKeyModal, onClose: () => setShowApiKeyModal(false), title: "Enter Google Gemini API Key", maxWidth: "max-w-md", children: _jsxs("div", { className: "space-y-4", children: [_jsxs("p", { className: "text-sm text-gray-600", children: ["To use the Resume Scanner, please provide a free Google Gemini API Key. You can get one from ", _jsx("a", { href: "https://aistudio.google.com/app/apikey", target: "_blank", rel: "noreferrer", className: "text-brand underline", children: "Google AI Studio" }), "."] }), _jsx(Input, { placeholder: "AIzaSy...", value: apiKey, onChange: (e) => setApiKey(e.target.value), type: "password" }), _jsxs("div", { className: "flex justify-end gap-2", children: [_jsx(Button, { variant: "ghost", onClick: () => setShowApiKeyModal(false), children: "Cancel" }), _jsx(Button, { variant: "primary", disabled: !apiKey || !tempAnalyzeFile, onClick: () => tempAnalyzeFile && handleResumeAnalysis(apiKey, tempAnalyzeFile), children: "Analyze Resume" })] })] }) })] }));
    }
    return (_jsxs(DashboardShell, { sidebarLinks: sidebarLinks, title: "Student Dashboard", subtitle: "Manage your dental profile, resumes, and saved jobs.", hideNavigation: true, children: [_jsx(Breadcrumbs, { items: [{ label: 'Seeker Home', to: '/seekers' }, { label: 'Student Dashboard' }] }), _jsx(Tabs, { tabs: [
                    { id: 'profile', label: 'Profile' },
                    { id: 'applications', label: 'Applications' },
                    { id: 'saved', label: 'Saved jobs' }
                ], active: activeTab, onChange: setActiveTab }), activeTab === 'profile' && (_jsxs("div", { className: "rounded-2xl border border-gray-100 bg-white p-5 shadow-sm space-y-6", children: [_jsxs("div", { className: "rounded-2xl border border-dashed border-black bg-white p-4 shadow-sm", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-lg font-semibold text-gray-900", children: "Upload a resume" }), _jsx("p", { className: "text-sm text-gray-500", children: "Upload your latest resume to be visible to employers." })] }), _jsx("label", { className: "flex cursor-pointer items-center gap-2 rounded-lg bg-indigo-50 px-3 py-2 text-sm font-medium text-indigo-700 hover:bg-indigo-100 transition", children: isAnalyzing ? (_jsx("span", { children: "Analyzing..." })) : (_jsxs(_Fragment, { children: [_jsx(ScanText, { className: "h-4 w-4" }), _jsx("span", { children: "Auto-fill from Resume" }), _jsx("input", { type: "file", className: "hidden", accept: ".pdf", onChange: (e) => {
                                                        const file = e.target.files?.[0];
                                                        if (file)
                                                            initiateAnalysis(file);
                                                    } })] })) })] }), _jsxs("p", { className: "text-xs text-gray-400", children: ["Latest resume:", ' ', latestResume ? (_jsx("span", { className: "font-semibold text-gray-700", children: latestResume.name })) : ('none yet')] }), _jsx("div", { className: "mt-4", children: _jsxs("button", { type: "button", onClick: () => setShowUploadModal(true), className: "flex w-full items-center justify-between rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-brand shadow-sm transition hover:border-brand", children: [_jsxs("span", { className: "flex items-center gap-2", children: [_jsx(UploadCloud, { className: "h-4 w-4" }), _jsx("span", { children: latestResume ? 'Upload new resume' : 'Upload resume' })] }), _jsx("span", { className: "text-xs text-gray-500", children: ".pdf .docx" })] }) }), resumes.length > 0 && (_jsxs("div", { className: "mt-4 rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 text-sm text-gray-600", children: [_jsx("p", { className: "text-xs font-semibold text-gray-800", children: "Stored resume" }), _jsx("p", { className: "text-sm font-semibold text-gray-900", children: resumes[0].name }), _jsxs("p", { className: "text-xs text-gray-500", children: ["Uploaded ", formatDate(resumes[0].uploadedAt)] })] }))] }), _jsxs("div", { className: "grid gap-4 md:grid-cols-2", children: [_jsx(Input, { label: "Full name", value: profileFields.fullName, onChange: (event) => handleFieldChange('fullName', event.target.value) }), _jsx(Input, { label: "Email", type: "email", value: profileFields.email, disabled // Email usually can't be changed easily
                                : true, className: "bg-gray-50", onChange: (event) => handleFieldChange('email', event.target.value) }), _jsxs(Select, { label: "I am a...", value: profileFields.seekerType, onChange: (event) => handleFieldChange('seekerType', event.target.value), children: [_jsx("option", { value: "student", children: "Student" }), _jsx("option", { value: "fresh_grad", children: "Fresh Graduate" }), _jsx("option", { value: "professional", children: "Professional" })] }), _jsx(Input, { label: "School", value: profileFields.school, placeholder: "e.g. Mahsa University", onChange: (event) => handleFieldChange('school', event.target.value) }), _jsx(Input, { label: "Graduation date", type: "month", value: profileFields.graduation, onChange: (event) => handleFieldChange('graduation', event.target.value) }), _jsxs("div", { className: "md:col-span-2", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm font-semibold text-gray-800", children: "Clinical exposure" }), _jsx("p", { className: "text-xs text-gray-500", children: "Select the skills you have experience with." })] }), _jsx("div", { className: "mt-2 grid gap-2 sm:grid-cols-2", children: exposures.map((item) => (_jsx(Checkbox, { label: item, checked: selectedExposures.includes(item), onChange: () => toggleExposure(item) }, item))) })] }), _jsxs("div", { className: "md:col-span-2 flex justify-end items-center gap-2", children: [_jsx(Button, { variant: "primary", onClick: handleSaveProfile, disabled: loading, children: loading ? 'Saving...' : 'Save Profile' }), _jsx(Button, { variant: "ghost", className: "text-red-600 hover:text-red-700 hover:bg-red-50", onClick: () => setShowSignOutConfirm(true), children: "Sign Out" })] })] })] })), activeTab === 'applications' && (_jsxs("div", { className: "rounded-2xl border border-gray-100 bg-white p-5 shadow-sm space-y-3", children: [_jsxs("div", { className: "flex flex-wrap items-center justify-between gap-3", children: [_jsx("h3", { className: "text-lg font-semibold text-gray-900", children: "Applications" }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("label", { htmlFor: "application-filter", className: "text-xs font-semibold text-gray-500", children: "Status" }), _jsx("select", { id: "application-filter", value: applicationFilter, onChange: (event) => setApplicationFilter(event.target.value), className: "rounded-full border border-gray-200 bg-white px-3 py-1 text-xs text-gray-700", children: applicationStatuses.map((status) => (_jsx("option", { value: status, children: status }, status))) })] })] }), _jsx("div", { className: "grid gap-3", children: filteredApplications.length === 0 ? (_jsx("p", { className: "text-sm text-gray-500 text-center py-4", children: "No applications found." })) : (filteredApplications.map((app) => (_jsx("div", { className: "rounded-xl border border-gray-100 bg-white p-4 transition hover:border-brand/40 hover:shadow-sm", children: _jsxs("div", { className: "flex items-start justify-between gap-4", children: [_jsxs("div", { children: [_jsx("h4", { className: "font-semibold text-gray-900", children: app.jobTitle }), _jsxs("div", { className: "mt-1 flex flex-col gap-0.5 text-sm text-gray-500", children: [_jsx("span", { className: "font-medium text-gray-700", children: app.clinicName }), _jsx("span", { children: app.location })] }), _jsx("div", { className: "mt-3 flex items-center gap-2 text-xs text-gray-400", children: _jsxs("span", { children: ["Applied ", formatDate(app.appliedAt)] }) })] }), _jsx("div", { children: _jsx(Badge, { variant: app.status === 'Applied' ? 'default' :
                                                app.status === 'Shortlisted' ? 'info' :
                                                    app.status === 'Interview' ? 'warning' :
                                                        app.status === 'Offer' ? 'success' :
                                                            'default', children: app.status }) })] }) }, app.id)))) })] })), activeTab === 'saved' && (_jsxs("div", { className: "rounded-2xl border border-gray-100 bg-white p-5 shadow-sm", children: [_jsx("h3", { className: "text-lg font-semibold text-gray-900", children: "Saved jobs" }), _jsx("div", { className: "mt-3 grid gap-3", children: savedJobs.length === 0 ? (_jsx("p", { className: "text-sm text-gray-500", children: "No saved jobs yet." })) : (savedJobs.map((job) => (_jsx(JobCard, { job: job, onApply: () => { }, isSaved: true, onToggleSave: async (j) => {
                                if (window.confirm('Remove from saved jobs?')) {
                                    await unsaveJob(user.id, j.id);
                                    setSavedJobs(prev => prev.filter(p => p.id !== j.id));
                                }
                            } }, job.id)))) })] })), showUploadModal && (_jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-6", children: _jsxs("div", { className: "w-full max-w-md overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 shadow-xl", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("h3", { className: "text-lg font-semibold text-gray-900", children: "Upload resume" }), _jsx("button", { className: "text-xs font-semibold uppercase tracking-wide text-gray-500", onClick: () => {
                                        setShowUploadModal(false);
                                        setUploadFileName('');
                                        setUploadFile(null);
                                    }, children: "Close" })] }), _jsx("p", { className: "mt-2 text-sm text-gray-600", children: "Upload your resume (.pdf, .docx). The new file will replace your current latest resume." }), _jsxs("label", { className: "mt-4 flex cursor-pointer items-center justify-between gap-2 rounded-xl border border-dashed border-gray-300 bg-gray-50 px-4 py-3 text-sm font-semibold text-gray-700 transition hover:border-brand", children: [_jsxs("span", { className: "flex items-center gap-2", children: [_jsx(UploadCloud, { className: "h-4 w-4 text-brand" }), _jsx("span", { children: uploadFileName || 'Choose resume file' })] }), _jsx("input", { type: "file", className: "hidden", accept: ".pdf,.docx,.doc", onChange: (event) => {
                                        const file = event.target.files?.[0];
                                        if (file) {
                                            setUploadFile(file);
                                            setUploadFileName(file.name);
                                        }
                                    } })] }), _jsxs("div", { className: "mt-4 flex justify-end gap-2", children: [_jsx(Button, { variant: "ghost", size: "sm", onClick: () => {
                                        setShowUploadModal(false);
                                        setUploadFileName('');
                                        setUploadFile(null);
                                    }, children: "Cancel" }), _jsx(Button, { variant: "primary", size: "sm", onClick: handleResumeUpload, disabled: !uploadFile || uploading, children: uploading ? 'Uploading...' : 'Upload' })] })] }) })), _jsx(Modal, { open: showSignOutConfirm, onClose: () => setShowSignOutConfirm(false), title: "Sign Out Assessment", maxWidth: "max-w-sm", children: _jsxs("div", { className: "flex flex-col gap-4", children: [_jsx("p", { className: "text-gray-600", children: "Are you sure you want to sign out of your account?" }), _jsxs("div", { className: "flex justify-end gap-3", children: [_jsx(Button, { variant: "ghost", onClick: () => setShowSignOutConfirm(false), children: "Cancel" }), _jsx(Button, { variant: "primary", onClick: handleConfirmSignOut, className: "bg-red-600 hover:bg-red-700 border-red-600 from-red-600 to-red-700", children: "Sign Out" })] })] }) }), _jsx(Toast, { open: showToast, onClose: () => setShowToast(false), title: toastContent.title, description: toastContent.description, variant: "success" })] }));
}
