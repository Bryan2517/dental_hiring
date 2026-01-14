import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect } from 'react';
import ReactDOM from 'react-dom';
import { CheckCircle2, X } from 'lucide-react';
import { cn } from '../../lib/utils';
export function Toast({ open, onClose, title, description, variant = 'success', duration = 2500 }) {
    useEffect(() => {
        if (!open)
            return;
        const timer = setTimeout(onClose, duration);
        return () => clearTimeout(timer);
    }, [open, duration, onClose]);
    if (!open)
        return null;
    const colors = {
        success: 'bg-emerald-50 text-emerald-900 border border-emerald-100',
        info: 'bg-blue-50 text-blue-900 border border-blue-100',
        warning: 'bg-amber-50 text-amber-900 border border-amber-100',
        error: 'bg-red-50 text-red-900 border border-red-100'
    };
    return ReactDOM.createPortal(_jsx("div", { className: "pointer-events-none fixed inset-0 z-50 flex items-start justify-end px-4 py-6", children: _jsxs("div", { className: cn('pointer-events-auto flex min-w-[260px] max-w-sm items-start gap-3 rounded-2xl p-4 shadow-lg', colors[variant]), children: [_jsx(CheckCircle2, { className: "mt-0.5 h-5 w-5 shrink-0" }), _jsxs("div", { className: "flex-1", children: [_jsx("p", { className: "font-semibold", children: title }), description && _jsx("p", { className: "text-sm text-gray-700", children: description })] }), _jsx("button", { onClick: onClose, className: "rounded-full p-1 text-gray-500 transition hover:bg-white/60", "aria-label": "Close toast", children: _jsx(X, { className: "h-4 w-4" }) })] }) }), document.body);
}
