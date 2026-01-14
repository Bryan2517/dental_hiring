import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { DashboardShell } from '../../layouts/DashboardShell';
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
import { getCandidatesForOrg, updateApplicationStatus } from '../../lib/api/applications';
const sidebarLinks = [
    { to: '/employer/dashboard', label: 'Overview' },
    { to: '/employer/applicants', label: 'Applicants' },
    { to: '/employer/post-job', label: 'Post job' },
    { to: '/employer/profile', label: 'Organization Profile' }
];
export default function ApplicantsPipeline() {
    const { user } = useAuth();
    const [searchParams, setSearchParams] = useSearchParams();
    const [candidates, setCandidates] = useState([]);
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCandidate, setSelectedCandidate] = useState();
    const [favoriteIds, setFavoriteIds] = useState([]);
    const [toastMessage, setToastMessage] = useState('');
    const [toastOpen, setToastOpen] = useState(false);
    const [selectedJobId, setSelectedJobId] = useState(searchParams.get('jobId') || '');
    // Update URL when filter changes
    useEffect(() => {
        if (selectedJobId) {
            setSearchParams({ jobId: selectedJobId });
        }
    }, [selectedJobId, setSearchParams]);
    useEffect(() => {
        async function fetchData() {
            if (!user)
                return;
            setLoading(true);
            try {
                // Get Org ID
                const { data: org, error: orgError } = await supabase
                    .from('organizations')
                    .select('id')
                    .eq('owner_user_id', user.id)
                    .single();
                if (orgError)
                    throw orgError;
                if (org) {
                    // Fetch candidates and jobs in parallel
                    const [candidatesData, jobsData] = await Promise.all([
                        getCandidatesForOrg(org.id),
                        supabase.from('jobs').select('id, title').eq('org_id', org.id).eq('status', 'published').order('created_at', { ascending: false })
                    ]);
                    setCandidates(candidatesData);
                    if (jobsData.data && jobsData.data.length > 0) {
                        setJobs(jobsData.data);
                        // Determine initial job selection
                        const urlJobId = searchParams.get('jobId');
                        const isValidJob = urlJobId && jobsData.data.some(j => j.id === urlJobId);
                        if (isValidJob) {
                            setSelectedJobId(urlJobId);
                        }
                        else {
                            // Default to first job (most recent due to order) if no valid ID in URL
                            setSelectedJobId(jobsData.data[0].id);
                        }
                    }
                    else {
                        setJobs([]);
                    }
                }
            }
            catch (error) {
                console.error('Error fetching candidates:', error);
            }
            finally {
                setLoading(false);
            }
        }
        fetchData();
    }, [user]);
    const handleMove = async (id, status) => {
        // Optimistic update
        const previousCandidates = [...candidates];
        setCandidates((prev) => prev.map((c) => {
            if (c.id !== id)
                return c;
            if (c.status === status)
                return c;
            setToastMessage(`${c.name} has moved to ${status}`);
            setToastOpen(true);
            return { ...c, status };
        }));
        try {
            await updateApplicationStatus(id, status.toLowerCase(), user.id);
        }
        catch (error) {
            console.error('Error updating status:', error);
            setCandidates(previousCandidates); // Revert
            setToastMessage('Failed to update status');
            setToastOpen(true);
        }
    };
    const toggleFavorite = (id) => {
        const candidate = candidates.find((c) => c.id === id);
        if (!candidate)
            return;
        setFavoriteIds((prev) => {
            const next = prev.includes(id) ? prev.filter((fav) => fav !== id) : [...prev, id];
            setToastMessage(`${candidate.name} ${prev.includes(id) ? 'removed from' : 'added to'} favorites`);
            setToastOpen(true);
            return next;
        });
    };
    // Filter candidates based on selected job - strict filter
    const filteredCandidates = candidates.filter(c => c.jobId === selectedJobId);
    const appliedCount = filteredCandidates.filter((c) => c.status === 'Applied').length;
    const interviewCount = filteredCandidates.filter((c) => c.status === 'Interview').length;
    const shortlistedCount = filteredCandidates.filter((c) => c.status === 'Shortlisted').length;
    const offerCount = filteredCandidates.filter((c) => c.status === 'Offer').length;
    const recent = filteredCandidates.slice(0, 5);
    if (loading) {
        return (_jsx(DashboardShell, { sidebarLinks: sidebarLinks, title: "Applicants pipeline", subtitle: "Loading...", hideNavigation: true, children: _jsx("p", { className: "p-8 text-center text-gray-500", children: "Loading pipeline..." }) }));
    }
    return (_jsxs(DashboardShell, { sidebarLinks: sidebarLinks, title: "Applicants pipeline", subtitle: "Move candidates between stages or open profile details.", actions: _jsxs(Badge, { variant: "info", children: [filteredCandidates.length, " candidates"] }), hideNavigation: true, children: [_jsxs("div", { className: "flex flex-wrap items-start justify-between gap-3", children: [_jsx(Breadcrumbs, { items: [{ label: 'Employer Home', to: '/employers' }, { label: 'Applicants' }] }), _jsxs("div", { className: "flex gap-2", children: [_jsx(Button, { variant: "secondary", size: "sm", children: "Invite candidate" }), _jsx(Button, { variant: "outline", size: "sm", children: "Export list" })] })] }), _jsx(Card, { className: "p-4", children: _jsxs("div", { className: "flex flex-wrap items-center justify-between gap-3", children: [_jsxs("div", { className: "flex flex-wrap gap-2", children: [_jsx(Input, { placeholder: "Search candidates...", className: "min-w-[220px]" }), _jsxs(Select, { className: "min-w-[200px]", value: selectedJobId, onChange: (e) => setSelectedJobId(e.target.value), disabled: jobs.length === 0, children: [jobs.map(job => (_jsx("option", { value: job.id, children: job.title }, job.id))), jobs.length === 0 && _jsx("option", { value: "", children: "No active jobs" })] }), _jsxs(Select, { className: "min-w-[160px]", defaultValue: "", children: [_jsx("option", { value: "", children: "All stages" }), _jsx("option", { children: "Applied" }), _jsx("option", { children: "Shortlisted" }), _jsx("option", { children: "Interview" }), _jsx("option", { children: "Offer" }), _jsx("option", { children: "Hired" }), _jsx("option", { children: "Rejected" })] })] }), _jsxs("div", { className: "text-xs text-gray-500", children: ["Updated just now - ", filteredCandidates.length, " total"] })] }) }), _jsxs("div", { className: "grid gap-3 md:grid-cols-4", children: [_jsxs(Card, { className: "p-4", children: [_jsx("p", { className: "text-xs text-gray-500", children: "Applied" }), _jsx("p", { className: "text-2xl font-semibold text-gray-900", children: appliedCount }), _jsx("p", { className: "text-xs text-gray-500", children: "Awaiting screening" })] }), _jsxs(Card, { className: "p-4", children: [_jsx("p", { className: "text-xs text-gray-500", children: "Shortlisted" }), _jsx("p", { className: "text-2xl font-semibold text-gray-900", children: shortlistedCount }), _jsx("p", { className: "text-xs text-gray-500", children: "Ready for outreach" })] }), _jsxs(Card, { className: "p-4", children: [_jsx("p", { className: "text-xs text-gray-500", children: "Interview" }), _jsx("p", { className: "text-2xl font-semibold text-gray-900", children: interviewCount }), _jsx("p", { className: "text-xs text-gray-500", children: "Next 7 days" })] }), _jsxs(Card, { className: "p-4", children: [_jsx("p", { className: "text-xs text-gray-500", children: "Offers" }), _jsx("p", { className: "text-2xl font-semibold text-gray-900", children: offerCount }), _jsx("p", { className: "text-xs text-gray-500", children: "Pending acceptance" })] })] }), _jsxs("div", { className: "grid gap-4 xl:grid-cols-[1fr,300px]", children: [_jsxs(Card, { className: "p-4", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm font-semibold text-gray-900", children: "Pipeline board" }), _jsx("p", { className: "text-xs text-gray-500", children: "Drag and drop candidates to update their status." })] }), _jsx(Badge, { variant: "info", children: "Live view" })] }), _jsx("div", { className: "mt-4", children: _jsx(KanbanBoard, { candidates: filteredCandidates, onMove: handleMove, onView: setSelectedCandidate, favorites: favoriteIds, onToggleFavorite: toggleFavorite }) })] }), _jsxs("div", { className: "grid gap-4", children: [_jsxs(Card, { className: "p-4", children: [_jsx("p", { className: "text-sm font-semibold text-gray-900", children: "Recent candidates" }), _jsx("div", { className: "mt-3 space-y-3", children: recent.length === 0 ? _jsx("p", { className: "text-sm text-gray-500", children: "No recent candidates for this job." }) : recent.map((candidate) => (_jsxs("button", { onClick: () => setSelectedCandidate(candidate), className: "flex w-full items-center justify-between rounded-xl border border-gray-100 bg-white px-3 py-2 text-left text-sm transition hover:border-brand", children: [_jsxs("div", { children: [_jsx("p", { className: "font-semibold text-gray-900", children: candidate.name }), _jsx("p", { className: "text-xs text-gray-500", children: candidate.school }), _jsxs("p", { className: "text-[10px] text-gray-400", children: ["For: ", candidate.jobTitle] })] }), _jsx(Badge, { variant: "outline", children: candidate.status })] }, candidate.id))) })] }), _jsxs(Card, { className: "p-4", children: [_jsx("p", { className: "text-sm font-semibold text-gray-900", children: "Hiring tips" }), _jsxs("ul", { className: "mt-3 space-y-2 text-xs text-gray-600", children: [_jsx("li", { children: "Send interview invites within 48 hours of application." }), _jsx("li", { children: "Use dental-specific screening questions to reduce churn." }), _jsx("li", { children: "Highlight training provided for new grads." })] })] })] })] }), _jsx(CandidateDrawer, { candidate: selectedCandidate, open: !!selectedCandidate, onClose: () => setSelectedCandidate(undefined), onMove: (id, status) => {
                    handleMove(id, status);
                    setSelectedCandidate(undefined);
                } }), _jsx(Toast, { open: toastOpen, onClose: () => setToastOpen(false), title: "Status updated", description: toastMessage, variant: "info" })] }));
}
