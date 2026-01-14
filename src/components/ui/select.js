import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { cn } from '../../lib/utils';
export function Select({ className, label, hint, children, ...props }) {
    return (_jsxs("label", { className: "flex w-full flex-col gap-1 text-sm", children: [label && _jsx("span", { className: "font-medium text-gray-800", children: label }), _jsx("select", { className: cn('w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 shadow-sm transition focus:border-brand focus:ring-2 focus:ring-brand/20', className), ...props, children: children }), hint && _jsx("span", { className: "text-xs text-gray-500", children: hint })] }));
}
