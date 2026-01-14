import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { cn } from '../../lib/utils';
export function Input({ className, label, hint, icon, ...props }) {
    return (_jsxs("label", { className: "flex w-full flex-col gap-1 text-sm", children: [label && _jsx("span", { className: "font-medium text-gray-800", children: label }), _jsxs("div", { className: "relative", children: [icon && (_jsx("div", { className: "pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400", children: icon })), _jsx("input", { className: cn('w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 shadow-sm transition focus:border-brand focus:ring-2 focus:ring-brand/20', icon && 'pl-10', className), ...props })] }), hint && _jsx("span", { className: "text-xs text-gray-500", children: hint })] }));
}
