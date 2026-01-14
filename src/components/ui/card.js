import { jsx as _jsx } from "react/jsx-runtime";
import { cn } from '../../lib/utils';
export function Card({ className, ...props }) {
    return (_jsx("div", { className: cn('rounded-3xl border border-gray-100 bg-white/95 shadow-sm backdrop-blur', className), ...props }));
}
export function CardHeader({ className, ...props }) {
    return _jsx("div", { className: cn('flex items-center justify-between p-5', className), ...props });
}
export function CardTitle({ className, ...props }) {
    return (_jsx("h3", { className: cn('text-lg font-semibold text-gray-900 leading-tight', className), ...props }));
}
export function CardContent({ className, ...props }) {
    return _jsx("div", { className: cn('p-5 pt-0 text-sm text-gray-700', className), ...props });
}
export function CardFooter({ className, ...props }) {
    return _jsx("div", { className: cn('p-5 pt-0', className), ...props });
}
