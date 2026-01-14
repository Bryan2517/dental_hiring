import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { Navigate, useLocation } from 'react-router-dom';
import { Button } from './ui/button';
import { useAuth } from '../contexts/AuthContext';
export function ProtectedRoute({ children, requiredRole }) {
    const { user, loading, userRole, session, openAuthModal } = useAuth();
    const location = useLocation();
    if (loading) {
        return (_jsx("div", { className: "flex min-h-screen items-center justify-center", children: _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "text-lg font-semibold text-gray-900", children: "Loading..." }), _jsx("div", { className: "text-sm text-gray-600 mt-1", children: "Please wait" })] }) }));
    }
    if (session === null && !user) {
        return (_jsx("div", { className: "flex min-h-screen items-center justify-center px-4", children: _jsxs("div", { className: "max-w-md rounded-2xl border border-gray-100 bg-white p-6 text-center shadow-sm", children: [_jsx("p", { className: "text-lg font-semibold text-gray-900", children: "Authentication required" }), _jsx("p", { className: "mt-2 text-sm text-gray-600", children: "Sign in or create an account to continue to this section." }), _jsx(Button, { variant: "primary", className: "mt-4", onClick: () => openAuthModal('login', location.pathname), children: "Sign in / create account" })] }) }));
    }
    if (requiredRole && userRole !== requiredRole) {
        if (userRole === 'employer') {
            return _jsx(Navigate, { to: "/employer/dashboard", replace: true });
        }
        if (userRole === 'seeker') {
            return _jsx(Navigate, { to: "/student/profile", replace: true });
        }
        return _jsx(Navigate, { to: "/jobs", replace: true });
    }
    return _jsx(_Fragment, { children: children });
}
