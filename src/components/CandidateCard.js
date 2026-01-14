import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { GraduationCap, Star } from 'lucide-react';
import { TagPill } from './TagPill';
export function CandidateCard({ candidate, onView, isFavorite, onToggleFavorite, draggable }) {
    return (_jsxs("div", { role: "button", tabIndex: 0, onClick: () => onView(candidate), draggable: draggable, onDragStart: (event) => {
            event.dataTransfer.setData('text/plain', candidate.id);
            event.dataTransfer.effectAllowed = 'move';
        }, onKeyDown: (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                onView(candidate);
            }
        }, className: "relative flex w-full flex-col gap-3 rounded-2xl border border-gray-100 bg-white p-4 text-left shadow-sm transition hover:border-brand/40 hover:shadow-md overflow-hidden cursor-grab active:cursor-grabbing", children: [_jsx("button", { type: "button", onClick: (event) => {
                    event.stopPropagation();
                    onToggleFavorite?.(candidate.id);
                }, className: "absolute right-3 top-3 rounded-full p-1.5 text-gray-300 transition hover:text-amber-500", "aria-pressed": isFavorite, "aria-label": "Toggle favorite", children: _jsx(Star, { className: `h-4 w-4 ${isFavorite ? 'text-amber-400 fill-amber-400' : 'text-gray-300'}` }) }), _jsxs("div", { className: "pr-7", children: [_jsx("p", { className: "text-sm font-semibold text-gray-900", children: candidate.name }), _jsxs("div", { className: "mt-1 flex items-center gap-2 text-xs text-gray-600 flex-wrap", children: [_jsxs("span", { className: "inline-flex items-center gap-1", children: [_jsx(GraduationCap, { className: "h-4 w-4 text-brand" }), _jsx("span", { className: "truncate max-w-[160px]", children: candidate.school })] }), _jsx("span", { className: "text-gray-300", children: "-" }), _jsxs("span", { className: "whitespace-nowrap", children: ["Grad ", candidate.gradDate.slice(0, 4)] })] })] }), _jsxs("div", { className: "flex flex-wrap gap-2", children: [candidate.skills.slice(0, 2).map((skill) => (_jsx(TagPill, { label: skill }, skill))), candidate.skills.length > 2 && _jsx(TagPill, { label: `+${candidate.skills.length - 2} more` })] })] }));
}
