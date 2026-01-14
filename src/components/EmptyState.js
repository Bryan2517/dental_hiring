import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { cn } from '../lib/utils';
export function EmptyState({ title, description, icon, action, className }) {
    return (_jsxs("div", { className: cn('flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-gray-200 bg-white p-8 text-center', className), children: [icon && _jsx("div", { className: "text-brand", children: icon }), _jsx("p", { className: "text-lg font-semibold text-gray-900", children: title }), _jsx("p", { className: "text-sm text-gray-600 max-w-md", children: description }), action] }));
}
