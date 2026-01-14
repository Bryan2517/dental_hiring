import { jsx as _jsx } from "react/jsx-runtime";
import { cn } from '../../lib/utils';
export function Badge({ children, variant = 'default', className }) {
    const styles = {
        default: 'bg-brand/10 text-brand',
        outline: 'border border-gray-300 text-gray-700 bg-white',
        success: 'bg-emerald-100 text-emerald-700',
        warning: 'bg-amber-100 text-amber-700',
        danger: 'bg-red-100 text-red-700',
        info: 'bg-blue-100 text-blue-700'
    };
    return (_jsx("span", { className: cn('inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold', styles[variant], className), children: children }));
}
