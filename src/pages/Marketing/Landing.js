import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Link, useNavigate } from 'react-router-dom';
import { AppShell } from '../../layouts/AppShell';
import { Button } from '../../components/ui/button';
import { jobs } from '../../lib/mockData';
import { JobCard } from '../../components/JobCard';
import { Card } from '../../components/ui/card';
import { TagPill } from '../../components/TagPill';
import { ShieldCheck, Sparkles, Star, Users } from 'lucide-react';
const reasons = [
    {
        title: 'Built for dental teams',
        desc: 'Roles, tags, and filters tuned for chairside support, sterilization, and digital workflows.',
        icon: _jsx(ShieldCheck, { className: "h-6 w-6 text-brand" })
    },
    {
        title: 'Faster shortlisting',
        desc: 'Pre-screening questions and resume highlights for new grads and experienced assistants.',
        icon: _jsx(Sparkles, { className: "h-6 w-6 text-brand" })
    },
    {
        title: 'Transparent plans',
        desc: 'Flat fees cover posts, boosts, and featured slots so clinics can budget with confidence.',
        icon: _jsx(Star, { className: "h-6 w-6 text-brand" })
    }
];
const planHighlights = [
    { title: 'Post a job', desc: 'Reach dental assistants, nurses, interns, and coordinators with one template.' },
    { title: 'Boost visibility', desc: 'Pin your role to the top for faster views and responses.' },
    { title: 'Unlock insights', desc: 'Preview candidates and notes instantly to refine shortlists.' }
];
const testimonials = [
    { name: 'Dr. Sarah Lim', role: 'Clinical Director, Align Studio', text: 'We found two ortho assistants in under a week. The dental-specific tags filter exactly what we need.' },
    { name: 'Arif Rahman', role: 'Dental Student, KL', text: 'Quick Apply + screening questions helped me land interviews without endless emails.' },
    { name: 'Hui Min', role: 'Clinic Manager, Bluewave Dental', text: 'Operational dashboards keep spend predictable. Love the applicants pipeline view.' }
];
export default function Landing() {
    const featured = jobs.slice(0, 3);
    const navigate = useNavigate();
    return (_jsxs(AppShell, { background: "muted", children: [_jsxs("div", { className: "grid items-center gap-10 rounded-3xl bg-gradient-to-br from-brand/5 via-white to-brand/10 px-6 py-10 shadow-sm md:grid-cols-2 md:px-10", children: [_jsxs("div", { className: "space-y-4", children: [_jsx("p", { className: "inline-flex items-center gap-2 rounded-full bg-brand/10 px-3 py-1 text-xs font-semibold text-brand", children: "Dental-only hiring platform" }), _jsx("h1", { className: "text-4xl font-extrabold leading-tight text-gray-900", children: "Hire trusted dental assistants, students, and coordinators faster." }), _jsx("p", { className: "text-lg text-gray-700", children: "MR.BUR Dental Jobs is a clean, medical-grade hiring experience for clinics and students across Malaysia & Singapore. No generic noise-just dental talent." }), _jsxs("div", { className: "flex flex-wrap gap-3", children: [_jsx(Button, { variant: "primary", size: "lg", onClick: () => navigate('/jobs'), children: "Find dental jobs" }), _jsx(Button, { variant: "outline", size: "lg", onClick: () => navigate('/employer/post-job'), children: "Post a job" })] }), _jsxs("div", { className: "flex flex-wrap gap-4 text-sm text-gray-700", children: [_jsx(TagPill, { label: "4-hand dentistry", highlighted: true }), _jsx(TagPill, { label: "Sterilization" }), _jsx(TagPill, { label: "Intraoral scanning" }), _jsx(TagPill, { label: "Implant assisting" })] })] }), _jsxs("div", { className: "grid gap-3", children: [_jsxs("div", { className: "rounded-2xl bg-white p-5 shadow-card", children: [_jsx("p", { className: "text-sm font-semibold text-gray-800", children: "Featured jobs" }), _jsx("div", { className: "mt-3 space-y-3", children: featured.map((job) => (_jsxs("div", { className: "flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50 p-3", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm font-semibold text-gray-900", children: job.roleType }), _jsxs("p", { className: "text-xs text-gray-600", children: [job.clinicName, " - ", job.city] })] }), _jsx("span", { className: "rounded-full bg-brand/10 px-3 py-1 text-xs font-semibold text-brand", children: job.salaryRange })] }, job.id))) })] }), _jsxs("div", { className: "grid grid-cols-2 gap-3", children: [_jsx(MiniStat, { label: "Active jobs", value: "200+" }), _jsx(MiniStat, { label: "Dental resumes", value: "5,100" }), _jsx(MiniStat, { label: "Avg. time to shortlist", value: "48h" }), _jsx(MiniStat, { label: "Interviews scheduled weekly", value: "320+" })] })] })] }), _jsx("section", { className: "mt-10 grid gap-6 md:grid-cols-3", children: reasons.map((reason) => (_jsxs(Card, { className: "p-5", children: [_jsx("div", { className: "mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-brand/10 text-brand", children: reason.icon }), _jsx("h3", { className: "text-lg font-semibold text-gray-900", children: reason.title }), _jsx("p", { className: "mt-2 text-sm text-gray-600", children: reason.desc })] }, reason.title))) }), _jsxs("section", { className: "mt-12 space-y-4", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm font-semibold text-brand", children: "Featured roles" }), _jsx("h2", { className: "text-2xl font-bold text-gray-900", children: "Dental jobs trending this week" })] }), _jsx(Link, { to: "/jobs", className: "text-sm font-semibold text-brand hover:text-brand-hover", children: "View all jobs" })] }), _jsx("div", { className: "grid gap-4", children: featured.map((job) => (_jsx(JobCard, { job: job, onApply: () => navigate(`/jobs/${job.id}`) }, job.id))) })] }), _jsxs("section", { className: "mt-12 rounded-3xl bg-white p-6 shadow-card", children: [_jsxs("div", { className: "flex flex-wrap items-center justify-between gap-3", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm font-semibold text-brand", children: "Pricing" }), _jsx("h3", { className: "text-xl font-bold text-gray-900", children: "Transparent plans for busy clinics" }), _jsx("p", { className: "text-sm text-gray-600", children: "Flat-rate packages cover posts, boosts, and featured roles with predictable billing." })] }), _jsx(Button, { variant: "primary", onClick: () => navigate('/employer/dashboard'), children: "Explore employer tools" })] }), _jsx("div", { className: "mt-4 grid gap-4 md:grid-cols-3", children: planHighlights.map((card) => (_jsxs(Card, { className: "p-4", children: [_jsx("h4", { className: "text-sm font-semibold text-gray-900", children: card.title }), _jsx("p", { className: "text-sm text-gray-600", children: card.desc })] }, card.title))) })] }), _jsxs("section", { className: "mt-12 space-y-4", children: [_jsxs("div", { className: "flex items-center gap-2 text-sm font-semibold text-brand", children: [_jsx(Users, { className: "h-4 w-4" }), "Testimonials"] }), _jsx("div", { className: "grid gap-4 md:grid-cols-3", children: testimonials.map((t) => (_jsxs(Card, { className: "p-5", children: [_jsxs("p", { className: "text-sm text-gray-700", children: ["\"", t.text, "\""] }), _jsx("p", { className: "mt-3 text-sm font-semibold text-gray-900", children: t.name }), _jsx("p", { className: "text-xs text-gray-600", children: t.role })] }, t.name))) })] })] }));
}
function MiniStat({ label, value }) {
    return (_jsxs("div", { className: "rounded-2xl border border-gray-100 bg-white p-4 text-center shadow-sm", children: [_jsx("p", { className: "text-xs font-semibold uppercase tracking-wide text-gray-500", children: label }), _jsx("p", { className: "mt-1 text-xl font-bold text-gray-900", children: value })] }));
}
