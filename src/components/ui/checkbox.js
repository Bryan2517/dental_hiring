import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { cn } from '../../lib/utils';
export function Checkbox({ label, description, className, ...props }) {
    return (_jsxs("label", { className: cn('flex items-start gap-3 rounded-xl border border-gray-200 bg-white p-3', className), children: [_jsx("input", { type: "checkbox", className: "mt-1 h-4 w-4 rounded border-gray-300 text-brand focus:ring-brand", ...props }), _jsxs("div", { className: "text-sm", children: [_jsx("p", { className: "font-medium text-gray-800", children: label }), description && _jsx("p", { className: "text-gray-500", children: description })] })] }));
}
