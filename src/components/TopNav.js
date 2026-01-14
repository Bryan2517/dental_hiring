import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useMemo, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Briefcase, Building2Icon, LayoutDashboard, User2, UserRoundSearch } from 'lucide-react';
import { cn } from '../lib/utils';
import { Button } from './ui/button';
import { Modal } from './ui/modal';
import { useAuth } from '../contexts/AuthContext';
export function TopNav() {
    const location = useLocation();
    const activeRole = useMemo(() => {
        const path = location.pathname;
        if (path.startsWith('/admin'))
            return 'admin';
        if (path.startsWith('/employer') || path.startsWith('/employers'))
            return 'employer';
        return 'seeker';
    }, [location.pathname]);
    const navLinks = useMemo(() => {
        if (activeRole === 'employer') {
            return [
                { to: '/employers', label: 'Employers Home', icon: _jsx(UserRoundSearch, { className: "h-4 w-4" }) },
                { to: '/employer/dashboard', label: 'Dashboard', icon: _jsx(LayoutDashboard, { className: "h-4 w-4" }) },
                { to: '/employer/post-job', label: 'Post Job', icon: _jsx(Briefcase, { className: "h-4 w-4" }) },
                { to: '/employer/applicants', label: 'Applicants', icon: _jsx(User2, { className: "h-4 w-4" }) },
                { to: '/employer/profile', label: 'Organization', icon: _jsx(Building2Icon, { className: "h-4 w-4" }) },
                // { to: '/employer/dashboard#wallet', label: 'Wallet', icon: <Wallet className="h-4 w-4" /> }
            ];
        }
        if (activeRole === 'admin') {
            return [{ to: '/admin', label: 'Admin Console' }];
        }
        return [
            { to: '/seekers', label: 'Seekers Home', icon: _jsx(User2, { className: "h-4 w-4" }) },
            { to: '/jobs', label: 'Jobs', icon: _jsx(Briefcase, { className: "h-4 w-4" }) },
            { to: '/student/profile', label: 'Student Dashboard', icon: _jsx(LayoutDashboard, { className: "h-4 w-4" }) }
        ];
    }, [activeRole]);
    const { signOut, user, openAuthModal } = useAuth();
    const navigate = useNavigate();
    const [showSignOutConfirm, setShowSignOutConfirm] = useState(false);
    const handleSignOutClick = () => {
        setShowSignOutConfirm(true);
    };
    const handleConfirmSignOut = async () => {
        await signOut();
        setShowSignOutConfirm(false);
        navigate('/seekers', { replace: true });
    };
    return (_jsxs(_Fragment, { children: [_jsx("header", { className: "sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-white/40 shadow-sm", children: _jsxs("div", { className: "container-wide flex items-center justify-between py-4", children: [_jsx(Link, { to: "/", className: "flex items-center gap-3", children: _jsx("img", { src: "/Mr_Bur_Logo.png", alt: "MR.BUR Dental Jobs logo", className: "h-10 w-auto object-contain", loading: "lazy" }) }), _jsx("nav", { className: "hidden items-center gap-2 text-sm font-medium text-gray-700 lg:flex", children: navLinks.map((link) => (_jsx(NavItem, { to: link.to, label: link.label, icon: link.icon }, link.to))) }), _jsxs("div", { className: "flex items-center gap-3", children: [activeRole !== 'admin' && (_jsx(Link, { to: activeRole === 'employer' ? '/seekers' : '/employers', className: "inline-flex items-center gap-2 rounded-full border border-brand/20 bg-white px-4 py-2 text-sm font-semibold text-brand shadow-sm transition hover:-translate-y-0.5 hover:bg-brand/10", children: activeRole === 'employer' ? "I'm a seeker" : "I'm an employer" })), activeRole === 'employer' ? (_jsx(Link, { to: "/employer/post-job", className: "inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-brand to-brand-hover px-4 py-2.5 text-sm font-semibold text-white shadow-md transition hover:-translate-y-0.5", children: "Post a Job" })) : (_jsxs(Link, { to: "/jobs", className: "inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-brand to-brand-hover px-4 py-2.5 text-sm font-semibold text-white shadow-md transition hover:-translate-y-0.5", children: [_jsx(Briefcase, { className: "h-4 w-4" }), "Browse Jobs"] })), _jsx(Button, { variant: "ghost", size: "sm", onClick: user ? handleSignOutClick : () => openAuthModal('login'), children: user ? 'Sign out' : 'Sign in' })] })] }) }), _jsx(Modal, { open: showSignOutConfirm, onClose: () => setShowSignOutConfirm(false), title: "Sign Out Assessment", maxWidth: "max-w-sm", children: _jsxs("div", { className: "flex flex-col gap-4", children: [_jsx("p", { className: "text-gray-600", children: "Are you sure you want to sign out of your account?" }), _jsxs("div", { className: "flex justify-end gap-3", children: [_jsx(Button, { variant: "ghost", onClick: () => setShowSignOutConfirm(false), children: "Cancel" }), _jsx(Button, { variant: "primary", onClick: handleConfirmSignOut, className: "bg-red-600 hover:bg-red-700 border-red-600 from-red-600 to-red-700", children: "Sign Out" })] })] }) })] }));
}
function NavItem({ to, label, icon }) {
    return (_jsxs(NavLink, { to: to, className: ({ isActive }) => cn('flex items-center gap-2 rounded-full px-4 py-2 transition hover:bg-brand/10 hover:text-brand', isActive && 'bg-brand/10 text-brand font-semibold'), children: [icon, label] }));
}
