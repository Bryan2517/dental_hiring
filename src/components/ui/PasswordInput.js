import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { cn } from '../../lib/utils';
export function PasswordInput({ className, label, hint, ...props }) {
    const [showPassword, setShowPassword] = useState(false);
    return (_jsxs("label", { className: "flex w-full flex-col gap-1 text-sm", children: [label && _jsx("span", { className: "font-medium text-gray-800", children: label }), _jsxs("div", { className: "relative", children: [_jsx("input", { type: showPassword ? 'text' : 'password', className: cn('w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 pr-10 text-sm text-gray-900 shadow-sm transition focus:border-brand focus:ring-2 focus:ring-brand/20', className), ...props }), _jsx("button", { type: "button", onClick: () => setShowPassword(!showPassword), className: "absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none", tabIndex: -1, children: showPassword ? _jsx(EyeOff, { className: "h-4 w-4" }) : _jsx(Eye, { className: "h-4 w-4" }) })] }), hint && _jsx("span", { className: "text-xs text-gray-500", children: hint })] }));
}
