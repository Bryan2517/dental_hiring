import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Link } from 'react-router-dom';
import { AppShell } from '../../layouts/AppShell';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { TagPill } from '../../components/TagPill';
import { Stepper } from '../../components/Stepper';
import { candidates } from '../../lib/mockData';
import { ClipboardList, Clock, FileCheck, Sparkles, Wallet } from 'lucide-react';
const quickActions = [
    {
        title: 'Post a Job',
        desc: 'Launch a dental role with templates and chairside skill checkboxes.',
        to: '/employer/post-job'
    },
    {
        title: 'Browse Candidates',
        desc: 'Preview dental student and assistant profiles in one dashboard.',
        to: '/employer/applicants'
    },
    {
        title: 'Track Applicants',
        desc: 'Move candidates through Applied -> Hired in a visual pipeline.',
        to: '/employer/applicants'
    }
];
const advantages = [
    'Dental role templates',
    'Chairside skill checkboxes',
    'Internship intake mode',
    'Shift-based hiring',
    'Clinic profile credibility'
];
const faq = [
    {
        q: 'How does pricing work?',
        a: 'Flat-fee plans cover job posts, boosts, and featured listings so clinics can budget confidently.'
    },
    { q: 'Can I reuse templates?', a: 'Yes, save job templates and reuse requirements for similar roles.' },
    { q: 'Do you support internships?', a: 'Internship and attachment filters help clinics find student talent quickly.' }
];
const hiringStats = [
    { label: 'Avg. time to shortlist', value: '48 hrs' },
    { label: 'Active clinics', value: '180+' },
    { label: 'Qualified matches', value: '1,920' }
];
const processHighlights = [
    {
        title: 'Launch your role',
        desc: 'Dental templates and clinical checklists get jobs live in minutes.'
    },
    {
        title: 'Boost visibility',
        desc: 'Feature listings and share across channels to draw the right candidates.'
    },
    {
        title: 'Close faster',
        desc: 'Pipeline clarity keeps candidates flowing from Applied to Hired with ease.'
    }
];
export default function EmployersLanding() {
    return (_jsxs(AppShell, { background: "muted", children: [_jsxs("section", { className: "section relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-50 via-white to-brand/10 p-6 shadow-sm md:p-10", children: [_jsx("div", { className: "absolute -right-10 -top-10 h-40 w-40 rounded-full bg-amber-200/50 blur-3xl" }), _jsx("div", { className: "absolute bottom-0 left-0 h-52 w-52 rounded-full bg-brand/10 blur-3xl" }), _jsxs("div", { className: "relative grid items-center gap-8 md:grid-cols-[1.1fr,0.9fr]", children: [_jsxs("div", { className: "space-y-5", children: [_jsx("p", { className: "inline-flex items-center gap-2 rounded-full bg-brand/10 px-3 py-1 text-xs font-semibold text-brand", children: "Employer Studio" }), _jsx("h1", { className: "text-4xl font-bold text-gray-900 md:text-5xl", children: "Hire trusted dental talent faster." }), _jsx("p", { className: "text-lg text-gray-600", children: "Dental-first hiring with role templates, clinical skill checklists, and transparent pricing that keeps every posting predictable." }), _jsxs("div", { className: "flex flex-wrap gap-3", children: [_jsx(Button, { variant: "primary", size: "lg", asChild: true, children: _jsx(Link, { to: "/employer/post-job", children: "Post a Job" }) }), _jsx(Button, { variant: "secondary", size: "lg", asChild: true, children: _jsx(Link, { to: "/employer/applicants", children: "Browse Candidates" }) })] }), _jsxs("div", { className: "flex flex-wrap gap-2", children: [_jsx(TagPill, { label: "Dental-specific matching" }), _jsx(TagPill, { label: "Transparent billing" }), _jsx(TagPill, { label: "Applicants pipeline" })] })] }), _jsxs("div", { className: "grid gap-4", children: [_jsxs(Card, { className: "p-6", children: [_jsxs("div", { className: "flex items-center gap-2 text-sm font-semibold text-gray-900", children: [_jsx(Wallet, { className: "h-4 w-4 text-brand" }), "Hiring velocity"] }), _jsx("div", { className: "mt-4 grid gap-3", children: hiringStats.map((stat) => (_jsxs("div", { className: "rounded-2xl bg-gray-50 p-4", children: [_jsx("p", { className: "text-xs text-gray-500", children: stat.label }), _jsx("p", { className: "text-2xl font-semibold text-gray-900", children: stat.value })] }, stat.label))) })] }), _jsxs(Card, { className: "p-6", children: [_jsx("p", { className: "text-sm font-semibold text-gray-900", children: "Premium hiring perks" }), _jsx("p", { className: "mt-2 text-sm text-gray-600", children: "Boost listings and feature roles to surface your clinic first in seeker searches." }), _jsxs("div", { className: "mt-4 flex items-center gap-2 text-xs font-semibold text-brand", children: [_jsx(Sparkles, { className: "h-4 w-4" }), "Token boosts included"] })] })] })] })] }), _jsx("section", { className: "section mt-10 grid gap-4 md:grid-cols-3 md:auto-rows-fr items-stretch", children: quickActions.map((item) => (_jsxs(Card, { className: "flex h-full flex-col p-6", children: [_jsxs("div", { children: [_jsx("p", { className: "text-lg font-semibold text-gray-900", children: item.title }), _jsx("p", { className: "mt-2 text-sm text-gray-600", children: item.desc })] }), _jsx("div", { className: "mt-auto pt-4", children: _jsx(Link, { to: item.to, className: "inline-flex text-sm font-semibold text-brand", children: "Go now >" }) })] }, item.title))) }), _jsxs("section", { className: "section mt-12 rounded-3xl bg-white/90 p-6 shadow-sm md:p-10", children: [_jsx("div", { className: "flex items-center justify-between", children: _jsxs("div", { children: [_jsx("p", { className: "text-sm font-semibold text-brand", children: "How it works" }), _jsx("h2", { className: "text-2xl font-bold text-gray-900", children: "Predictable hiring in three steps" })] }) }), _jsx("div", { className: "mt-5 grid gap-4 md:grid-cols-3", children: processHighlights.map((item) => (_jsxs(Card, { className: "p-5", children: [_jsx("p", { className: "text-sm font-semibold text-gray-900", children: item.title }), _jsx("p", { className: "text-sm text-gray-600", children: item.desc })] }, item.title))) })] }), _jsxs("section", { className: "section mt-12 grid gap-4 md:grid-cols-2", children: [_jsxs(Card, { className: "p-6", children: [_jsx("p", { className: "text-lg font-semibold text-gray-900", children: "Dental-specific job posting advantages" }), _jsx("div", { className: "mt-4 grid gap-2", children: advantages.map((adv) => (_jsxs("div", { className: "flex items-center gap-2 text-sm text-gray-700", children: [_jsx(FileCheck, { className: "h-4 w-4 text-brand" }), adv] }, adv))) })] }), _jsxs(Card, { className: "p-6", children: [_jsx("p", { className: "text-lg font-semibold text-gray-900", children: "Post in 2 minutes" }), _jsx(Stepper, { steps: [
                                    { id: '1', title: 'Job basics' },
                                    { id: '2', title: 'Dental requirements' },
                                    { id: '3', title: 'Schedule & salary' },
                                    { id: '4', title: 'Publish' }
                                ], activeStep: 1 })] })] }), _jsxs("section", { className: "section mt-12", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm font-semibold text-brand", children: "Applicants pipeline preview" }), _jsx("h2", { className: "text-2xl font-bold text-gray-900", children: "Keep hiring stages visible" })] }), _jsx(Button, { variant: "outline", size: "sm", asChild: true, children: _jsx(Link, { to: "/employer/applicants", children: "Open pipeline" }) })] }), _jsx("div", { className: "mt-4 grid gap-3 lg:grid-cols-3", children: ['Applied', 'Interview', 'Offer'].map((stage) => (_jsxs(Card, { className: "p-4", children: [_jsx("p", { className: "text-sm font-semibold text-gray-900", children: stage }), _jsx("div", { className: "mt-3 space-y-2", children: candidates
                                        .filter((c) => c.status === stage)
                                        .slice(0, 2)
                                        .map((cand) => (_jsx("div", { className: "rounded-xl bg-gray-50 px-3 py-2 text-sm text-gray-700", children: cand.name }, cand.id))) })] }, stage))) })] }), _jsxs("section", { className: "section mt-12", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm font-semibold text-brand", children: "Candidate previews" }), _jsx("h2", { className: "text-2xl font-bold text-gray-900", children: "Top matches ready today" })] }), _jsx(Button, { variant: "primary", size: "sm", asChild: true, children: _jsx(Link, { to: "/employer/applicants", children: "View all" }) })] }), _jsx("div", { className: "mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3", children: candidates.slice(0, 6).map((cand) => (_jsxs(Card, { className: "p-5", children: [_jsx("p", { className: "text-sm font-semibold text-gray-900", children: cand.name }), _jsxs("p", { className: "text-xs text-gray-500", children: [cand.school, " - Grad ", cand.gradDate.slice(0, 4)] }), _jsx("div", { className: "mt-3 flex flex-wrap gap-2", children: cand.skills.slice(0, 3).map((skill) => (_jsx(TagPill, { label: skill }, skill))) }), _jsxs("div", { className: "mt-4 flex items-center justify-between text-xs text-gray-500", children: [_jsxs("span", { children: ["Rating ", cand.rating.toFixed(1)] }), _jsx(Link, { to: "/employer/applicants", className: "font-semibold text-brand", children: "View >" })] })] }, cand.id))) })] }), _jsxs("section", { className: "section mt-12 grid gap-4 md:grid-cols-2", children: [_jsxs(Card, { className: "p-6", children: [_jsx("p", { className: "text-sm font-semibold text-brand", children: "Testimonials" }), _jsx("p", { className: "mt-2 text-lg font-semibold text-gray-900", children: "\"We hired two assistants in a week.\"" }), _jsx("p", { className: "text-sm text-gray-600", children: "- Dr. Sarah Lim, Align Studio" })] }), _jsxs(Card, { className: "p-6", children: [_jsx("p", { className: "text-sm font-semibold text-brand", children: "Why clinics trust MR.BUR" }), _jsxs("div", { className: "mt-3 space-y-2 text-sm text-gray-700", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Clock, { className: "h-4 w-4 text-brand" }), "Faster turnaround on shortlisting"] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(ClipboardList, { className: "h-4 w-4 text-brand" }), "Structured dental requirements"] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Sparkles, { className: "h-4 w-4 text-brand" }), "Premium hiring insights"] })] })] })] }), _jsxs("section", { className: "section mt-12 rounded-3xl bg-white/90 p-6 shadow-sm md:p-10", children: [_jsx("h3", { className: "text-xl font-semibold text-gray-900", children: "Employer FAQ" }), _jsx("div", { className: "mt-4 grid gap-3 md:grid-cols-3", children: faq.map((item) => (_jsxs(Card, { className: "p-4", children: [_jsx("p", { className: "text-sm font-semibold text-gray-900", children: item.q }), _jsx("p", { className: "text-sm text-gray-600", children: item.a })] }, item.q))) })] })] }));
}
