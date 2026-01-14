import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Link, useNavigate } from 'react-router-dom';
import { Building2, MapPin, Sparkles, Star, Bookmark } from 'lucide-react';
import { Badge } from './ui/badge';
import { TagPill } from './TagPill';
import { Button } from './ui/button';
import { timeAgo } from '../lib/utils';
import { cn } from '../lib/utils';
export function JobCard({ job, onApply, isSaved, onToggleSave }) {
    const navigate = useNavigate();
    const goToDetails = () => navigate(`/jobs/${job.id}`);
    const handleKeyDown = (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            goToDetails();
        }
    };
    return (_jsxs("div", { className: "relative flex flex-col gap-4 rounded-3xl border border-gray-100 bg-white/90 p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg focus-within:ring-2 focus-within:ring-brand/30 cursor-pointer group", onClick: goToDetails, onKeyDown: handleKeyDown, role: "button", tabIndex: 0, children: [_jsx("div", { className: "absolute top-6 right-6 z-10", children: _jsx("button", { onClick: (e) => {
                        e.stopPropagation();
                        onToggleSave?.(job);
                    }, className: cn("rounded-full p-2 transition-colors hover:bg-gray-100", isSaved ? "text-brand" : "text-gray-400 hover:text-gray-600"), children: _jsx(Bookmark, { className: cn("h-5 w-5", isSaved && "fill-current") }) }) }), _jsxs("div", { className: "flex items-start justify-between gap-3 pr-12", children: [_jsxs("div", { className: "space-y-1", children: [_jsxs("p", { className: "inline-flex items-center gap-2 rounded-full bg-brand/10 px-3 py-1 text-xs font-semibold text-brand", children: [job.roleType, _jsxs("span", { className: "text-gray-500", children: ["- ", timeAgo(job.postedAt)] })] }), _jsx("h3", { className: "text-xl font-semibold text-gray-900", children: job.clinicName }), _jsxs("div", { className: "flex flex-wrap items-center gap-3 text-sm text-gray-600", children: [_jsxs("span", { className: "inline-flex items-center gap-1", children: [_jsx(Building2, { className: "h-4 w-4 text-brand" }), job.employmentType] }), _jsxs("span", { className: "inline-flex items-center gap-1", children: [_jsx(MapPin, { className: "h-4 w-4 text-brand" }), job.city, ", ", job.country] }), _jsxs("span", { className: "inline-flex items-center gap-1 text-amber-700", children: [_jsx(Star, { className: "h-4 w-4" }), job.experienceLevel] })] })] }), _jsxs("div", { className: "flex flex-col items-end gap-2 text-right", children: [_jsx(Badge, { variant: "default", className: "text-sm", children: job.salaryRange }), _jsxs("div", { className: "flex gap-2", children: [job.newGradWelcome && _jsx(Badge, { variant: "info", children: "New grad friendly" }), job.trainingProvided && _jsx(Badge, { variant: "success", children: "Training provided" })] })] })] }), _jsx("p", { className: "text-sm text-gray-700 leading-relaxed", children: job.description }), _jsx("div", { className: "flex flex-wrap gap-2", children: job.specialtyTags.slice(0, 4).map((tag) => (_jsx(TagPill, { label: tag }, tag))) }), _jsxs("div", { className: "flex items-center justify-between gap-3 pt-2", children: [_jsx("div", { className: "flex flex-wrap gap-2 text-xs text-gray-600", children: job.requirements.slice(0, 2).map((req) => (_jsx("span", { className: "rounded-full bg-gray-100 px-3 py-1", children: req }, req))) }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Button, { variant: "outline", size: "sm", asChild: true, children: _jsx(Link, { to: `/jobs/${job.id}`, onClick: (event) => event.stopPropagation(), children: "Details" }) }), _jsx(Button, { variant: "primary", size: "sm", rightIcon: _jsx(Sparkles, { className: "h-4 w-4" }), onClick: (event) => {
                                    event.stopPropagation();
                                    onApply?.(job);
                                }, children: "Quick apply" })] })] })] }));
}
