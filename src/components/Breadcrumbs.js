import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Link } from 'react-router-dom';
export function Breadcrumbs({ items }) {
    return (_jsx("nav", { className: "flex flex-wrap items-center gap-2 text-xs font-semibold text-gray-500", children: items.map((item, index) => (_jsxs("span", { className: "flex items-center gap-2", children: [item.to ? (_jsx(Link, { to: item.to, className: "text-brand hover:text-brand-hover", children: item.label })) : (_jsx("span", { children: item.label })), index < items.length - 1 && _jsx("span", { children: "/" })] }, item.label))) }));
}
