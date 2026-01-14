import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { DashboardShell } from '../../layouts/DashboardShell';
import { Textarea } from '../../components/ui/textarea';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Card } from '../../components/ui/card';
import { Breadcrumbs } from '../../components/Breadcrumbs';
const sidebarLinks = [
    { to: '/admin', label: 'Overview' },
    { to: '/jobs', label: 'Job board' },
    { to: '/employer/dashboard', label: 'Employers' }
];
const moderationQueue = [
    { id: 'mod-1', type: 'Job', title: 'Dental Assistant - Surgical', reason: 'Check salary info' },
    { id: 'mod-2', type: 'Resume', title: 'Clinical_Scans_Portfolio.pdf', reason: 'Verify credentials' },
    { id: 'mod-3', type: 'Job', title: 'Treatment Coordinator', reason: 'Clinic address missing' }
];
const analytics = [
    { label: 'Jobs this week', value: 28 },
    { label: 'New students', value: 64 },
    { label: 'Resume views', value: 120 },
    { label: 'Reports filed', value: 3 }
];
export default function AdminDashboard() {
    const [platformNotes, setPlatformNotes] = useState('Align templates and pricing across markets.');
    return (_jsxs(DashboardShell, { sidebarLinks: sidebarLinks, title: "Admin Console", subtitle: "Moderation queue, reports, and analytics (mock).", actions: _jsx(Badge, { variant: "info", children: "UI only" }), children: [_jsx(Breadcrumbs, { items: [{ label: 'Admin', to: '/admin' }, { label: 'Overview' }] }), _jsxs("div", { className: "grid gap-4 lg:grid-cols-[1.1fr,0.9fr]", children: [_jsxs(Card, { className: "p-5", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("h3", { className: "text-lg font-semibold text-gray-900", children: "Moderation Queue" }), _jsxs(Badge, { variant: "warning", children: [moderationQueue.length, " pending"] })] }), _jsx("div", { className: "mt-3 divide-y divide-gray-100", children: moderationQueue.map((item) => (_jsxs("div", { className: "flex items-center justify-between py-3", children: [_jsxs("div", { children: [_jsxs("p", { className: "text-sm font-semibold text-gray-900", children: [item.type, ": ", item.title] }), _jsx("p", { className: "text-xs text-gray-600", children: item.reason })] }), _jsxs("div", { className: "flex gap-2", children: [_jsx(Button, { variant: "outline", size: "sm", children: "Approve" }), _jsx(Button, { variant: "ghost", size: "sm", children: "Reject" })] })] }, item.id))) })] }), _jsxs(Card, { className: "p-5", children: [_jsx("h3", { className: "text-lg font-semibold text-gray-900", children: "Platform notes" }), _jsx("p", { className: "text-sm text-gray-600", children: "Document moderation cues and policy reminders for the admin team." }), _jsx(Textarea, { className: "mt-3", label: "Notes", value: platformNotes, onChange: (e) => setPlatformNotes(e.target.value) }), _jsx("div", { className: "mt-3", children: _jsx(Button, { variant: "primary", children: "Save notes (mock)" }) })] })] }), _jsx("div", { className: "grid gap-4 md:grid-cols-4", children: analytics.map((item) => (_jsxs(Card, { className: "p-4", children: [_jsx("p", { className: "text-xs font-semibold uppercase tracking-wide text-gray-500", children: item.label }), _jsx("p", { className: "mt-2 text-2xl font-bold text-gray-900", children: item.value }), _jsx("div", { className: "mt-3 h-2 rounded-full bg-gray-100", children: _jsx("div", { className: "h-full rounded-full bg-brand", style: { width: `${Math.min(item.value, 120) / 1.2}%` } }) })] }, item.label))) }), _jsxs(Card, { className: "p-5", children: [_jsx("h3", { className: "text-lg font-semibold text-gray-900", children: "Reports" }), _jsxs("div", { className: "mt-3 grid gap-3 md:grid-cols-2", children: [_jsx(Textarea, { label: "Escalations", placeholder: "Notes on flagged jobs or resumes" }), _jsx(Textarea, { label: "Follow-ups", placeholder: "Reminders for the admin team" })] }), _jsx("div", { className: "mt-3", children: _jsx(Button, { variant: "primary", children: "Save notes (mock)" }) })] })] }));
}
