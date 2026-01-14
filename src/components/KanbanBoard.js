import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { CandidateCard } from './CandidateCard';
const columns = [
    { id: 'Applied', label: 'Applied' },
    { id: 'Shortlisted', label: 'Shortlisted' },
    { id: 'Interview', label: 'Interview' },
    { id: 'Offer', label: 'Offer' },
    { id: 'Hired', label: 'Hired' },
    { id: 'Rejected', label: 'Rejected' }
];
export function KanbanBoard({ candidates, onMove, onView, favorites = [], onToggleFavorite }) {
    return (_jsx("div", { className: "overflow-x-auto pb-2", children: _jsx("div", { className: "grid min-w-[960px] grid-cols-6 gap-4", children: columns.map((col) => (_jsxs("div", { className: "flex flex-col gap-3 rounded-2xl border border-gray-100 bg-gray-50 p-3", onDragOver: (event) => event.preventDefault(), onDrop: (event) => {
                    const id = event.dataTransfer.getData('text/plain');
                    if (id)
                        onMove(id, col.id);
                }, children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("p", { className: "text-sm font-semibold text-gray-800", children: col.label }), _jsx("span", { className: "text-xs font-semibold text-gray-500", children: candidates.filter((c) => c.status === col.id).length })] }), _jsxs("div", { className: "flex flex-col gap-3", children: [candidates
                                .filter((c) => c.status === col.id)
                                .map((candidate) => (_jsx(CandidateCard, { candidate: candidate, onView: onView, isFavorite: favorites.includes(candidate.id), onToggleFavorite: onToggleFavorite, draggable: true }, candidate.id))), candidates.filter((c) => c.status === col.id).length === 0 && (_jsx("div", { className: "rounded-xl border border-dashed border-gray-300 bg-white p-3 text-xs text-gray-500", children: "No candidates here" }))] })] }, col.id))) }) }));
}
