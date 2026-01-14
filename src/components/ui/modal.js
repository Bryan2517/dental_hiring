import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect } from 'react';
import ReactDOM from 'react-dom';
import { X } from 'lucide-react';
import { cn } from '../../lib/utils';
export function Modal({ open, onClose, title, children, maxWidth = 'max-w-2xl' }) {
    useEffect(() => {
        if (open) {
            document.body.style.overflow = 'hidden';
        }
        return () => {
            document.body.style.overflow = 'auto';
        };
    }, [open]);
    if (!open)
        return null;
    return ReactDOM.createPortal(_jsx("div", { className: "fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 p-4", children: _jsxs("div", { className: cn('mt-10 w-full rounded-2xl bg-white shadow-2xl', maxWidth), children: [_jsxs("div", { className: "flex items-center justify-between border-b border-gray-100 px-6 py-4", children: [_jsx("div", { children: title && _jsx("h3", { className: "text-lg font-semibold text-gray-900", children: title }) }), _jsx("button", { onClick: onClose, className: "rounded-full p-2 text-gray-500 transition hover:bg-gray-100", "aria-label": "Close modal", children: _jsx(X, { className: "h-5 w-5" }) })] }), _jsx("div", { className: "px-6 py-4", children: children })] }) }), document.body);
}
