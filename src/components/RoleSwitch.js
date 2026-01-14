import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { cn } from '../lib/utils';
const routes = {
    seeker: '/seekers',
    employer: '/employers',
    admin: '/admin'
};
export function RoleSwitch({ value, onChange, className }) {
    const navigate = useNavigate();
    const location = useLocation();
    useEffect(() => {
        if (location.pathname.startsWith('/admin'))
            onChange('admin');
        if (location.pathname.startsWith('/employer'))
            onChange('employer');
        if (location.pathname.startsWith('/seekers'))
            onChange('seeker');
        if (location.pathname.startsWith('/jobs') || location.pathname.startsWith('/student')) {
            onChange('seeker');
        }
    }, [location.pathname, onChange]);
    return (_jsxs("label", { className: cn('flex items-center gap-2 text-xs font-semibold text-gray-500', className), children: ["Role", _jsxs("select", { value: value, onChange: (e) => {
                    const next = e.target.value;
                    onChange(next);
                    navigate(routes[next]);
                }, className: "rounded-full border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-700 shadow-sm focus:border-brand focus:ring-2 focus:ring-brand/20", children: [_jsx("option", { value: "seeker", children: "Job Seeker" }), _jsx("option", { value: "employer", children: "Employer" }), _jsx("option", { value: "admin", children: "Admin" })] })] }));
}
