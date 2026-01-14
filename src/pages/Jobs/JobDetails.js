import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { AppShell } from '../../layouts/AppShell';
import { Badge } from '../../components/ui/badge';
import { TagPill } from '../../components/TagPill';
import { Button } from '../../components/ui/button';
import { ApplyModal } from '../../components/ApplyModal';
import { Building2, MapPin, Share2, ShieldCheck, Sparkles, Star, Wallet } from 'lucide-react';
import { timeAgo } from '../../lib/utils';
import { Breadcrumbs } from '../../components/Breadcrumbs';
import { getJobById, getJobs, saveJob, unsaveJob, getSavedJobs } from '../../lib/api/jobs';
import { getUserDocuments } from '../../lib/api/profiles';
import { useAuth } from '../../contexts/AuthContext';
export default function JobDetails() {
    const { id } = useParams();
    const { user, userRole, openAuthModal } = useAuth();
    const navigate = useNavigate();
    const [job, setJob] = useState(null);
    const [similarJobs, setSimilarJobs] = useState([]);
    const [resumes, setResumes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showApply, setShowApply] = useState(false);
    const [isSaved, setIsSaved] = useState(false);
    useEffect(() => {
        async function loadJob() {
            if (!id)
                return;
            try {
                setLoading(true);
                // Fetch job and saved status in parallel
                const [jobData, savedJobs] = await Promise.all([
                    getJobById(id),
                    user && userRole === 'seeker' ? getSavedJobs(user.id) : Promise.resolve([])
                ]);
                setJob(jobData);
                if (jobData) {
                    // Check if saved
                    if (savedJobs.some(s => s.id === id)) {
                        setIsSaved(true);
                    }
                    else {
                        setIsSaved(false);
                    }
                    // Load similar jobs (same specialty tags)
                    const allJobs = await getJobs({ status: 'published' });
                    const similar = allJobs
                        .filter((j) => j.id !== jobData.id && j.specialtyTags.some((tag) => jobData.specialtyTags.includes(tag)))
                        .slice(0, 3);
                    setSimilarJobs(similar);
                }
            }
            catch (error) {
                console.error('Error loading job:', error);
            }
            finally {
                setLoading(false);
            }
        }
        loadJob();
    }, [id, user, userRole]);
    useEffect(() => {
        async function loadResumes() {
            try {
                if (user && userRole === 'seeker') {
                    const docs = await getUserDocuments(user.id);
                    setResumes(docs);
                }
            }
            catch (error) {
                console.error('Error loading resumes:', error);
            }
        }
        loadResumes();
    }, [user, userRole]);
    useEffect(() => {
        window.scrollTo({ top: 0, left: 0 });
    }, [id]);
    const handleToggleSave = async () => {
        if (!job)
            return;
        if (!user || userRole !== 'seeker') {
            openAuthModal('login', window.location.pathname);
            return;
        }
        const newSavedState = !isSaved;
        setIsSaved(newSavedState); // Optimistic
        try {
            if (newSavedState) {
                await saveJob(user.id, job.id);
            }
            else {
                await unsaveJob(user.id, job.id);
            }
        }
        catch (error) {
            console.error('Error toggling save:', error);
            setIsSaved(!newSavedState); // Revert
        }
    };
    if (loading) {
        return (_jsx(AppShell, { children: _jsx("div", { className: "rounded-2xl border border-dashed border-gray-200 bg-white p-6 text-center", children: _jsx("p", { className: "text-lg font-semibold text-gray-900", children: "Loading job..." }) }) }));
    }
    if (!job) {
        return (_jsx(AppShell, { children: _jsxs("div", { className: "rounded-2xl border border-dashed border-gray-200 bg-white p-6 text-center", children: [_jsx("p", { className: "text-lg font-semibold text-gray-900", children: "Job not found" }), _jsx("p", { className: "text-sm text-gray-600", children: "This posting is unavailable. Browse other roles instead." }), _jsx(Button, { variant: "primary", className: "mt-4", onClick: () => navigate('/jobs'), children: "Back to jobs" })] }) }));
    }
    return (_jsxs(AppShell, { padded: true, background: "muted", children: [_jsxs("div", { className: "mb-3 flex items-center justify-between", children: [_jsx(Breadcrumbs, { items: [{ label: 'Home', to: '/seekers' }, { label: 'Jobs', to: '/jobs' }, { label: job.roleType }] }), _jsx(Link, { to: "/jobs", className: "text-xs font-semibold text-brand hover:text-brand-hover", children: "Back to jobs" })] }), _jsxs("div", { className: "grid gap-6 lg:grid-cols-[1fr,300px]", children: [_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "rounded-2xl border border-gray-100 bg-white p-5 shadow-card", children: [_jsxs("div", { className: "flex flex-wrap items-start justify-between gap-3", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm font-semibold text-brand", children: job.roleType }), _jsx("h1", { className: "text-3xl font-bold text-gray-900", children: job.clinicName }), _jsxs("div", { className: "mt-2 flex flex-wrap items-center gap-3 text-sm text-gray-700", children: [_jsxs("span", { className: "inline-flex items-center gap-1", children: [_jsx(Building2, { className: "h-4 w-4 text-brand" }), job.employmentType] }), _jsxs("span", { className: "inline-flex items-center gap-1", children: [_jsx(MapPin, { className: "h-4 w-4 text-brand" }), job.city, ", ", job.country] }), _jsxs("span", { className: "inline-flex items-center gap-1 text-amber-700", children: [_jsx(Star, { className: "h-4 w-4" }), job.experienceLevel] }), _jsxs("span", { className: "text-xs text-gray-500", children: ["Posted ", timeAgo(job.postedAt)] })] })] }), _jsxs("div", { className: "flex flex-col items-end gap-2", children: [_jsx(Badge, { variant: "default", children: job.salaryRange }), _jsxs("div", { className: "flex gap-2", children: [job.newGradWelcome && _jsx(Badge, { variant: "info", children: "New grad welcome" }), job.trainingProvided && _jsx(Badge, { variant: "success", children: "Training provided" })] })] })] }), _jsx("p", { className: "mt-4 text-sm text-gray-700", children: job.description }), _jsx("div", { className: "mt-4 flex flex-wrap gap-2", children: job.specialtyTags.map((tag) => (_jsx(TagPill, { label: tag }, tag))) }), _jsxs("div", { className: "mt-5 grid gap-4 rounded-xl bg-gray-50 p-4 sm:grid-cols-2", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm font-semibold text-gray-900", children: "Requirements" }), _jsx("ul", { className: "mt-2 space-y-2 text-sm text-gray-700", children: job.requirements.map((req) => (_jsxs("li", { className: "flex items-start gap-2", children: [_jsx(ShieldCheck, { className: "mt-0.5 h-4 w-4 text-brand" }), req] }, req))) })] }), _jsxs("div", { children: [_jsx("p", { className: "text-sm font-semibold text-gray-900", children: "Benefits" }), _jsx("ul", { className: "mt-2 space-y-2 text-sm text-gray-700", children: job.benefits.map((b) => (_jsxs("li", { className: "flex items-center gap-2", children: [_jsx(Wallet, { className: "h-4 w-4 text-brand" }), b] }, b))) })] })] })] }), _jsxs("div", { className: "space-y-3", children: [_jsx("h3", { className: "text-lg font-semibold text-gray-900", children: "Similar jobs" }), _jsx("div", { className: "grid gap-3", children: similarJobs.map((similar) => (_jsxs(Link, { to: `/jobs/${similar.id}`, className: "rounded-xl border border-gray-100 bg-white p-4 shadow-sm transition hover:border-brand", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm font-semibold text-gray-900", children: similar.roleType }), _jsxs("p", { className: "text-xs text-gray-600", children: [similar.clinicName, " - ", similar.city] })] }), _jsx(Badge, { variant: "outline", children: similar.salaryRange })] }), _jsx("div", { className: "mt-2 flex flex-wrap gap-2", children: similar.specialtyTags.slice(0, 3).map((tag) => (_jsx(TagPill, { label: tag }, tag))) })] }, similar.id))) })] })] }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "sticky top-24 rounded-2xl border border-gray-100 bg-white p-5 shadow-card", children: [_jsx("p", { className: "text-sm font-semibold text-gray-900", children: "Ready to apply?" }), _jsx("p", { className: "text-sm text-gray-600", children: "Submit your resume with screening answers." }), _jsxs("div", { className: "mt-4 flex flex-col gap-2", children: [_jsx(Button, { variant: "primary", rightIcon: _jsx(Sparkles, { className: "h-4 w-4" }), onClick: () => {
                                                    if (!user || userRole !== 'seeker') {
                                                        if (id) {
                                                            openAuthModal('login', `/jobs/${id}`);
                                                        }
                                                        else {
                                                            openAuthModal('login', '/jobs');
                                                        }
                                                        return;
                                                    }
                                                    setShowApply(true);
                                                }, children: "Quick apply" }), _jsx(Button, { variant: isSaved ? "primary" : "outline", onClick: handleToggleSave, children: isSaved ? 'Saved' : 'Save job' }), _jsx(Button, { variant: "ghost", icon: _jsx(Share2, { className: "h-4 w-4" }), children: "Share" })] })] }), _jsxs("div", { className: "rounded-2xl border border-gray-100 bg-white p-5 shadow-sm", children: [_jsx("p", { className: "text-sm font-semibold text-gray-900", children: "About the clinic" }), _jsxs("p", { className: "mt-2 text-sm text-gray-700", children: [job.clinicName, " is a multi-chair practice focused on digital workflows and patient experience. They value calm, organized chairside support and offer structured onboarding for new hires."] })] })] })] }), _jsx(ApplyModal, { open: showApply, job: job, onClose: () => setShowApply(false), resumes: resumes })] }));
}
