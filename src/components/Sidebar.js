import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { NavLink } from 'react-router-dom';
import { cn } from '../lib/utils';
export function Sidebar({ title, links, orientation = 'vertical' }) {
    return (_jsxs("div", { className: "rounded-2xl border border-gray-100 bg-white p-4 shadow-sm", children: [_jsx("p", { className: "px-2 text-xs font-semibold uppercase tracking-wide text-gray-500", children: title }), _jsx("div", { className: cn('mt-3 gap-1', orientation === 'horizontal' ? 'flex flex-wrap' : 'flex flex-col'), children: links.map((link) => (_jsxs(NavLink, { to: link.to, className: ({ isActive }) => cn('flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold transition hover:bg-brand/10 hover:text-brand', isActive ? 'bg-brand/10 text-brand' : 'text-gray-700'), children: [link.icon && _jsx("span", { className: "text-lg text-brand", children: link.icon }), _jsx("span", { children: link.label })] }, link.to))) })] }));
}
