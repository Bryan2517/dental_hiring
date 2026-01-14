import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Link, useNavigate } from 'react-router-dom';
import { AppShell } from '../../layouts/AppShell';
import { resumes } from '../../lib/mockData';
import { JobCard } from '../../components/JobCard';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { TagPill } from '../../components/TagPill';
import { ArrowRight, CheckCircle2, Sparkles } from 'lucide-react';
import { ApplyModal } from '../../components/ApplyModal';
import { useState, useEffect } from 'react';
import { getJobs } from '../../lib/api/jobs';
import { supabase } from '../../lib/supabase';
const steps = [
    { title: 'Create your profile', desc: 'Highlight clinical exposure, rotations, and preferred specialties.' },
    { title: 'Quick apply', desc: 'Reuse your resume and answer dental-specific screening prompts.' },
    { title: 'Track updates', desc: 'See every step, from applied to interview scheduling.' }
];
const highlights = [
    'Internships & attachments',
    'New grad welcome tags',
    'Clinical exposure checklist',
    'Mock resume vault'
];
const categories = ['Ortho', 'Endo', 'Perio', 'Implant', 'GP', 'Reception'];
const testimonials = [
    { name: 'Amira Rahman', role: 'Dental Student', quote: 'Quick apply saved me so much time. Clinics replied faster.' },
    { name: 'Darren Lim', role: 'Dental Assistant', quote: 'Filters are built for dental roles, no generic noise.' }
];
const heroStats = [
    { label: 'Live roles', value: '84' },
    { label: 'Avg. reply time', value: '36 hrs' },
    { label: 'Clinics hiring now', value: '120+' }
];
export default function SeekersLanding() {
    const [hotJobs, setHotJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    useEffect(() => {
        async function fetchHotRoles() {
            try {
                setLoading(true);
                // 1. Get app counts
                const { data: apps } = await supabase.from('applications').select('job_id');
                const counts = {};
                apps?.forEach((a) => {
                    counts[a.job_id] = (counts[a.job_id] || 0) + 1;
                });
                // 2. Get all published jobs
                const allJobs = await getJobs({ status: 'published' });
                // 3. Sort by popularity (app count)
                const sorted = allJobs.sort((a, b) => {
                    const countA = counts[a.id] || 0;
                    const countB = counts[b.id] || 0;
                    return countB - countA;
                });
                // 4. Take top 3
                setHotJobs(sorted.slice(0, 3));
            }
            catch (err) {
                console.error('Error loading hot roles', err);
            }
            finally {
                setLoading(false);
            }
        }
        fetchHotRoles();
    }, []);
    const [selectedJob, setSelectedJob] = useState();
    const [showApply, setShowApply] = useState(false);
    return (_jsxs(AppShell, { background: "muted", children: [_jsxs("section", { className: "section relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand/10 via-white to-sky-50 p-6 shadow-sm md:p-10", children: [_jsx("div", { className: "absolute -left-10 -top-12 h-40 w-40 rounded-full bg-brand/20 blur-3xl" }), _jsx("div", { className: "absolute bottom-0 right-0 h-56 w-56 rounded-full bg-sky-200/40 blur-3xl" }), _jsxs("div", { className: "relative grid items-center gap-8 md:grid-cols-[1.2fr,0.8fr]", children: [_jsxs("div", { className: "space-y-5", children: [_jsx("p", { className: "inline-flex items-center gap-2 rounded-full bg-brand/10 px-3 py-1 text-xs font-semibold text-brand", children: "Job Seeker Hub" }), _jsx("h1", { className: "text-4xl font-bold text-gray-900 md:text-5xl", children: "Find dental roles with a clearer, faster path to offers." }), _jsx("p", { className: "text-lg text-gray-600", children: "Built for dental students, assistants, and coordinators. Discover roles, apply quickly, and stay in control of every application." }), _jsxs("div", { className: "flex flex-wrap gap-3", children: [_jsx(Button, { variant: "primary", size: "lg", onClick: () => navigate('/jobs'), children: "Browse Jobs" }), _jsx(Button, { variant: "secondary", size: "lg", onClick: () => navigate('/student/profile'), children: "Create Profile" })] }), _jsx("div", { className: "flex flex-wrap gap-2", children: highlights.map((item) => (_jsx(TagPill, { label: item }, item))) }), _jsx("div", { className: "grid gap-3 sm:grid-cols-3", children: heroStats.map((stat) => (_jsxs("div", { className: "rounded-2xl bg-white/80 p-4 shadow-sm", children: [_jsx("p", { className: "text-lg font-semibold text-gray-900", children: stat.value }), _jsx("p", { className: "text-xs text-gray-500", children: stat.label })] }, stat.label))) })] }), _jsxs("div", { className: "grid gap-4", children: [_jsxs(Card, { className: "p-6", children: [_jsx("p", { className: "text-sm font-semibold text-gray-900", children: "Featured openings" }), _jsx("div", { className: "mt-4 space-y-3", children: loading ? (_jsx("p", { className: "text-xs text-gray-500", children: "Loading..." })) : hotJobs.length === 0 ? (_jsx("p", { className: "text-xs text-gray-500", children: "No active jobs yet." })) : (hotJobs.map((job) => (_jsxs("div", { className: "flex items-center justify-between rounded-xl bg-gray-50 px-4 py-3 cursor-pointer hover:bg-gray-100 transition", onClick: () => navigate(`/jobs/${job.id}`), children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm font-semibold text-gray-900", children: job.roleType }), _jsx("p", { className: "text-xs text-gray-500", children: job.clinicName })] }), _jsx("span", { className: "text-xs font-semibold text-brand", children: job.city })] }, job.id)))) })] }), _jsxs(Card, { className: "p-6", children: [_jsx("p", { className: "text-sm font-semibold text-gray-900", children: "Resume vault" }), _jsx("p", { className: "mt-2 text-sm text-gray-600", children: "Store multiple versions and reuse them for chairside, admin, or internship roles." }), _jsxs("div", { className: "mt-4 flex items-center gap-2 text-xs font-semibold text-brand", children: [_jsx(Sparkles, { className: "h-4 w-4" }), "Smart match recommendations"] })] })] })] })] }), _jsxs("section", { className: "section mt-10", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm font-semibold text-brand", children: "Featured Jobs" }), _jsx("h2", { className: "text-2xl font-bold text-gray-900", children: "Hot roles this week" })] }), _jsxs(Link, { to: "/jobs", className: "text-sm font-semibold text-brand", children: ["View all ", _jsx(ArrowRight, { className: "inline h-4 w-4" })] })] }), _jsx("div", { className: "grid gap-4", children: loading ? (_jsx("div", { className: "py-10 text-center text-gray-500", children: "Loading hot roles..." })) : hotJobs.length === 0 ? (_jsx("div", { className: "py-10 text-center text-gray-500", children: "No jobs found. Be the first to apply!" })) : (hotJobs.map((job) => (_jsx(JobCard, { job: job, onApply: setSelectedJob }, job.id)))) }), _jsx("div", { className: "flex justify-center", children: _jsx(Button, { variant: "outline", asChild: true, children: _jsx(Link, { to: "/jobs", children: "View more" }) }) })] }), _jsx("section", { className: "section grid gap-4 md:grid-cols-3", children: steps.map((step, index) => (_jsxs(Card, { className: "mt-8 p-6", children: [_jsxs("p", { className: "text-sm font-semibold text-brand", children: ["Step ", index + 1] }), _jsx("p", { className: "mt-2 text-lg font-semibold text-gray-900", children: step.title }), _jsx("p", { className: "text-sm text-gray-600", children: step.desc })] }, step.title))) }), _jsx("section", { className: "section mt-10 rounded-3xl bg-white/90 p-6 shadow-sm md:p-10", children: _jsxs("div", { className: "grid gap-6 md:grid-cols-[1.1fr,0.9fr]", children: [_jsxs("div", { children: [_jsx("h3", { className: "text-2xl font-semibold text-gray-900", children: "Student-friendly features" }), _jsx("p", { className: "mt-2 text-sm text-gray-600", children: "Built for dental hiring workflows, so you only see roles that match your rotations and availability." }), _jsx("div", { className: "mt-4 grid gap-3 md:grid-cols-2", children: highlights.map((item) => (_jsxs("div", { className: "flex items-center gap-2 text-sm text-gray-700", children: [_jsx(CheckCircle2, { className: "h-4 w-4 text-brand" }), item] }, item))) })] }), _jsxs(Card, { className: "p-6", children: [_jsx("p", { className: "text-sm font-semibold text-brand", children: "Quick Apply" }), _jsx("p", { className: "mt-2 text-lg font-semibold text-gray-900", children: "Apply in minutes, not hours." }), _jsx("p", { className: "text-sm text-gray-600", children: "Upload a resume, answer screening questions, and track updates in a single feed." }), _jsx(Button, { variant: "primary", className: "mt-4", rightIcon: _jsx(Sparkles, { className: "h-4 w-4" }), onClick: () => setShowApply(true), children: "Try Quick Apply" })] })] }) }), _jsxs("section", { className: "section mt-10", children: [_jsx("h3", { className: "text-xl font-semibold text-gray-900", children: "Popular categories" }), _jsx("div", { className: "mt-3 flex flex-wrap gap-2", children: categories.map((cat) => (_jsx(TagPill, { label: cat, highlighted: true }, cat))) })] }), _jsxs("section", { className: "section grid gap-4 md:grid-cols-2", children: [testimonials.map((t) => (_jsxs(Card, { className: "mt-8 p-6", children: [_jsxs("p", { className: "text-sm text-gray-700", children: ["\"", t.quote, "\""] }), _jsx("p", { className: "mt-3 text-sm font-semibold text-gray-900", children: t.name }), _jsx("p", { className: "text-xs text-gray-500", children: t.role })] }, t.name))), _jsxs(Card, { className: "p-6", children: [_jsx("p", { className: "text-sm font-semibold text-brand", children: "Ready this week" }), _jsx("p", { className: "mt-2 text-lg font-semibold text-gray-900", children: "Fresh roles added daily." }), _jsx("p", { className: "text-sm text-gray-600", children: "New clinics and internship placements are updated every morning." }), _jsx("div", { className: "mt-4", children: _jsx(Button, { variant: "outline", asChild: true, children: _jsx(Link, { to: "/jobs", children: "Explore new roles" }) }) })] })] }), _jsx(ApplyModal, { open: !!selectedJob || showApply, job: selectedJob, onClose: () => {
                    setSelectedJob(undefined);
                    setShowApply(false);
                }, resumes: resumes })] }));
}
