import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { DashboardShell } from '../../layouts/DashboardShell';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Link } from 'react-router-dom';
import { TagPill } from '../../components/TagPill';
import { Breadcrumbs } from '../../components/Breadcrumbs';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
const sidebarLinks = [
    { to: '/employer/dashboard', label: 'Overview' },
    { to: '/employer/post-job', label: 'Post job' },
    { to: '/employer/applicants', label: 'Applicants' },
    { to: '/employer/profile', label: 'Organization Profile' },
    { to: '/jobs', label: 'Job board' }
];
const pipelineStages = ['Applied', 'Shortlisted', 'Interview', 'Offer', 'Hired', 'Rejected'];
export default function EmployerDashboard() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [activeJobs, setActiveJobs] = useState([]); // TODO: type properly with DB types
    const [applications, setApplications] = useState([]);
    const [org, setOrg] = useState(null);
    useEffect(() => {
        if (!user)
            return;
        async function fetchEmployerData() {
            setLoading(true);
            try {
                // 1. Get Organization
                const { data: orgData, error: orgError } = await supabase
                    .from('organizations')
                    .select('*')
                    .eq('owner_user_id', user.id)
                    .single();
                if (orgError) {
                    console.error('Error fetching org:', orgError);
                    setLoading(false);
                    return;
                }
                setOrg(orgData);
                if (orgData) {
                    // 2. Get Active Jobs
                    const { data: jobsData, error: jobsError } = await supabase
                        .from('jobs')
                        .select('*')
                        .eq('org_id', orgData.id)
                        .eq('org_id', orgData.id)
                        .eq('status', 'published')
                        .order('created_at', { ascending: false })
                        .limit(5);
                    if (jobsError)
                        console.error('Error fetching jobs:', jobsError);
                    else
                        setActiveJobs(jobsData || []);
                    // 3. Get Applications (for pipeline stats & recent highlights)
                    // We need candidate details: join profiles (name) and seeker_profiles (school)
                    // Note: Supabase join syntax: `..., profiles:seeker_user_id(full_name), ...`?
                    // Foreign key on applications.seeker_user_id -> profiles.id
                    // Foreign key on applications.seeker_user_id -> seeker_profiles.user_id
                    const { data: appsData, error: appsError } = await supabase
                        .from('applications')
                        .select(`
              id, status, created_at,
              seeker:profiles!seeker_user_id(full_name, seeker_profiles(school_name)),
              job:jobs(title)
            `)
                        .eq('org_id', orgData.id)
                        .order('created_at', { ascending: false });
                    if (appsError)
                        console.error('Error fetching apps:', appsError);
                    else {
                        // Transform for easier consumption
                        const formattedApps = (appsData || []).map((app) => ({
                            id: app.id,
                            status: app.status,
                            name: app.seeker?.full_name || 'Unknown',
                            school: app.seeker?.seeker_profiles?.school_name || 'Unknown School',
                            jobTitle: app.job?.title || 'Unknown Job',
                            created_at: app.created_at
                        }));
                        setApplications(formattedApps);
                    }
                }
            }
            catch (err) {
                console.error('Unexpected error:', err);
            }
            finally {
                setLoading(false);
            }
        }
        fetchEmployerData();
    }, [user]);
    const stageCounts = pipelineStages.map((stage) => ({
        stage,
        count: applications.filter((c) => c.status === stage).length
    }));
    const highlightCandidates = applications.slice(0, 3); // Top 3 recent
    if (loading) {
        return (_jsx(DashboardShell, { sidebarLinks: sidebarLinks, title: "Employer Dashboard", subtitle: "Loading...", hideNavigation: true, children: _jsx("div", { className: "flex h-64 items-center justify-center", children: "Loading data..." }) }));
    }
    // If no org found, prompt to create one (simple fallback)
    if (!org) {
        return (_jsx(DashboardShell, { sidebarLinks: sidebarLinks, title: "Employer Dashboard", subtitle: "Welcome", hideNavigation: true, children: _jsx("div", { className: "p-6 text-center", children: _jsx("p", { children: "No organization profile found. Please complete your setup." }) }) }));
    }
    return (_jsxs(DashboardShell, { sidebarLinks: sidebarLinks, title: "Employer Dashboard", subtitle: "Manage postings and review applicants.", hideNavigation: true, actions: _jsx(Button, { variant: "primary", asChild: true, children: _jsx(Link, { to: "/employer/post-job", children: "Post a job" }) }), children: [_jsx(Breadcrumbs, { items: [{ label: 'Employer Home', to: '/employers' }, { label: 'Dashboard' }] }), _jsxs("div", { className: "grid gap-4 xl:grid-cols-[1fr,320px]", children: [_jsxs("div", { className: "space-y-4", children: [_jsx("div", { className: "rounded-2xl border border-gray-100 bg-white p-5 shadow-sm", children: _jsxs("div", { className: "flex flex-wrap items-center justify-between gap-3", children: [_jsxs("div", { children: [_jsx("h3", { className: "text-lg font-semibold text-gray-900", children: "Applicants summary" }), _jsxs("p", { className: "text-sm text-gray-600", children: [applications.filter((c) => c.status === 'Applied').length, " applied -", ' ', applications.filter((c) => c.status === 'Interview').length, " interviews scheduled"] })] }), _jsx(Button, { variant: "outline", size: "sm", asChild: true, children: _jsx(Link, { to: "/employer/applicants", children: "View applicants" }) })] }) }), _jsxs("div", { className: "rounded-2xl border border-gray-100 bg-white p-5 shadow-sm", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("h3", { className: "text-lg font-semibold text-gray-900", children: "Active jobs" }), _jsxs(Badge, { variant: "info", children: [activeJobs.length, " live"] })] }), _jsx("div", { className: "mt-3 space-y-3", children: activeJobs.length === 0 ? (_jsx("p", { className: "text-sm text-gray-500 text-center py-4", children: "No active jobs found. Post one now!" })) : (activeJobs.map((job) => (_jsxs("div", { className: "flex flex-wrap items-center justify-between gap-3 rounded-xl border border-gray-100 bg-gray-50 p-4", children: [_jsxs("div", { children: [_jsx("p", { className: "font-semibold text-gray-900", children: job.title }), _jsxs("p", { className: "text-xs text-gray-600", children: [org.org_name, " - ", org.city || 'Malaysia'] }), _jsxs("div", { className: "mt-2 flex flex-wrap gap-2 text-xs text-gray-600", children: [_jsx(TagPill, { label: job.employment_type }), _jsx(TagPill, { label: job.experience_level })] })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Button, { variant: "outline", size: "sm", asChild: true, children: _jsx(Link, { to: `/jobs/${job.id}`, children: "Preview" }) }), _jsx(Button, { variant: "primary", size: "sm", asChild: true, children: _jsx(Link, { to: "/employer/applicants", children: "Applicants" }) })] })] }, job.id)))) })] })] }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "rounded-2xl border border-gray-100 bg-white p-5 shadow-sm", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("h3", { className: "text-lg font-semibold text-gray-900", children: "Pipeline snapshot" }), _jsx(Link, { to: "/employer/applicants", className: "text-xs font-semibold text-brand hover:text-brand-hover", children: "View pipeline" })] }), _jsx("div", { className: "mt-3 grid gap-2", children: stageCounts.map((item) => (_jsxs("div", { className: "flex items-center justify-between rounded-xl bg-gray-50 px-3 py-2 text-sm text-gray-700", children: [_jsx("span", { children: item.stage }), _jsx("span", { className: "font-semibold text-gray-900", children: item.count })] }, item.stage))) })] }), _jsxs("div", { className: "rounded-2xl border border-gray-100 bg-white p-5 shadow-sm", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("h3", { className: "text-lg font-semibold text-gray-900", children: "Candidate highlights" }), _jsxs(Badge, { variant: "outline", children: [applications.length, " total"] })] }), _jsx("div", { className: "mt-3 space-y-2", children: highlightCandidates.length === 0 ? (_jsx("p", { className: "text-sm text-gray-500 text-center", children: "No applicants yet." })) : (highlightCandidates.map((candidate) => (_jsxs("div", { className: "flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50 px-3 py-2 text-sm text-gray-700", children: [_jsxs("div", { children: [_jsx("p", { className: "font-semibold text-gray-900", children: candidate.name }), _jsx("p", { className: "text-xs text-gray-500", children: candidate.school }), _jsxs("p", { className: "text-[10px] text-gray-400", children: ["For: ", candidate.jobTitle] })] }), _jsx(Badge, { variant: "outline", children: candidate.status })] }, candidate.id)))) }), _jsxs("div", { className: "mt-3 text-xs text-gray-500", children: ["Updated as of ", new Date().toLocaleDateString()] })] })] })] })] }));
}
// Helper to avoid variable collision rename from 'applications.length' in render
const candidatesLen = 0; // Fixed below: replace with {applications.length} inside render
