import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import ReactDOM from 'react-dom';
import { X } from 'lucide-react';
import { TagPill } from './TagPill';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
const actions = ['Shortlisted', 'Interview', 'Offer', 'Rejected'];
export function CandidateDrawer({ candidate, open, onClose, onMove }) {
    if (!open || !candidate)
        return null;
    return ReactDOM.createPortal(_jsx("div", { className: "fixed inset-0 z-50 flex justify-end bg-black/40", children: _jsxs("div", { className: "h-full w-full max-w-xl overflow-y-auto bg-white shadow-2xl", children: [_jsxs("div", { className: "flex items-center justify-between border-b border-gray-100 px-5 py-4", children: [_jsxs("div", { children: [_jsx("p", { className: "text-lg font-semibold text-gray-900", children: candidate.name }), _jsxs("p", { className: "text-sm text-gray-600", children: [candidate.school, " - Grad ", candidate.gradDate] })] }), _jsx("button", { onClick: onClose, className: "rounded-full p-2 text-gray-500 transition hover:bg-gray-100", "aria-label": "Close candidate drawer", children: _jsx(X, { className: "h-5 w-5" }) })] }), _jsxs("div", { className: "space-y-5 p-5", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm font-semibold text-gray-800", children: "Skills" }), _jsx("div", { className: "mt-2 flex flex-wrap gap-2", children: candidate.skills.map((skill) => (_jsx(TagPill, { label: skill }, skill))) })] }), _jsxs("div", { className: "rounded-xl border border-gray-200 bg-gray-50 p-4", children: [_jsx("p", { className: "text-sm font-semibold text-gray-800", children: "Resume preview (mock)" }), _jsx("p", { className: "mt-2 text-xs text-gray-600", children: "Placeholder for embedded resume. In this demo, uploads live only in memory." }), _jsx("div", { className: "mt-3 h-32 rounded-lg border border-dashed border-gray-300 bg-white" })] }), _jsx(Textarea, { label: "Internal notes", placeholder: "Add a quick note...", rows: 4 }), _jsx("div", { className: "flex flex-wrap gap-2", children: actions.map((action) => (_jsxs(Button, { variant: action === 'Rejected' ? 'outline' : 'primary', size: "sm", onClick: () => onMove(candidate.id, action), children: ["Move to ", action] }, action))) })] })] }) }), document.body);
}
