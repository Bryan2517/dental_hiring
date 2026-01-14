import { jsx as _jsx } from "react/jsx-runtime";
import { cn } from '../lib/utils';
export function TagPill({ label, highlighted, className }) {
    return (_jsx("span", { className: cn('inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold transition', highlighted
            ? 'border-brand bg-brand/10 text-brand'
            : 'border-gray-200 bg-white text-gray-700', className), children: label }));
}
