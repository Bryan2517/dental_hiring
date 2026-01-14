import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { PasswordInput } from './ui/PasswordInput';
import { Modal } from './ui/modal';
import { Toast } from './ui/toast';
import { useAuth } from '../contexts/AuthContext';
export function AuthModal() {
    const { authModalOpen, authModalMode, authModalRedirectPath, closeAuthModal, openAuthModal, signIn, signUp, } = useAuth();
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [role, setRole] = useState('seeker');
    // Employer specific fields
    const [clinicName, setClinicName] = useState('');
    const [city, setCity] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showSuccessToast, setShowSuccessToast] = useState(false);
    useEffect(() => {
        if (!authModalOpen) {
            setEmail('');
            setPassword('');
            setFullName('');
            setRole('seeker');
            setClinicName('');
            setCity('');
            setError(null);
            setLoading(false);
            setShowSuccessToast(false);
        }
    }, [authModalOpen]);
    const handleClose = () => {
        closeAuthModal();
    };
    const goToDefault = (userRole) => {
        const fallback = userRole === 'employer' ? '/employers' : '/seekers';
        const redirectPath = authModalRedirectPath ?? fallback;
        navigate(redirectPath);
        closeAuthModal();
    };
    const handleLogin = async (event) => {
        event.preventDefault();
        setLoading(true);
        setError(null);
        const { error: authError, role: loggedRole } = await signIn(email, password);
        if (authError) {
            setError(authError.message);
            setLoading(false);
            return;
        }
        setShowSuccessToast(true);
        // Delay navigation slightly to let user see toast
        setTimeout(() => {
            goToDefault(loggedRole ?? 'seeker');
            setLoading(false);
        }, 1500);
    };
    const handleRegister = async (event) => {
        event.preventDefault();
        setLoading(true);
        setError(null);
        const metadata = {};
        if (role === 'employer') {
            metadata.employerData = {
                clinicName,
                city
            };
        }
        const { error: authError } = await signUp(email, password, fullName, role, metadata);
        if (authError) {
            setError(authError.message);
            setLoading(false);
            return;
        }
        goToDefault(role);
        setLoading(false);
    };
    return (_jsxs(_Fragment, { children: [_jsx(Modal, { open: authModalOpen, onClose: handleClose, title: authModalMode === 'login' ? 'Sign in' : 'Create account', children: _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex gap-2", children: [_jsx("button", { type: "button", className: `flex-1 rounded-full px-4 py-2 text-sm font-semibold transition ${authModalMode === 'login'
                                        ? 'bg-brand text-white'
                                        : 'border border-gray-200 bg-white text-gray-700 hover:border-brand hover:text-brand'}`, onClick: () => openAuthModal('login', authModalRedirectPath), children: "Sign in" }), _jsx("button", { type: "button", className: `flex-1 rounded-full px-4 py-2 text-sm font-semibold transition ${authModalMode === 'register'
                                        ? 'bg-brand text-white'
                                        : 'border border-gray-200 bg-white text-gray-700 hover:border-brand hover:text-brand'}`, onClick: () => openAuthModal('register', authModalRedirectPath), children: "Sign up" })] }), _jsxs("form", { onSubmit: authModalMode === 'login' ? handleLogin : handleRegister, className: "space-y-4", children: [authModalMode === 'register' && (_jsx(Input, { label: "Full name", placeholder: "Your name", value: fullName, onChange: (event) => setFullName(event.target.value), required: true })), _jsx(Input, { label: "Email", type: "email", placeholder: "you@example.com", value: email, onChange: (event) => setEmail(event.target.value), required: true }), _jsx(PasswordInput, { label: "Password", placeholder: "Enter a secure password", value: password, onChange: (event) => setPassword(event.target.value), required: true }), authModalMode === 'register' && role === 'employer' && (_jsxs(_Fragment, { children: [_jsx(Input, { label: "Clinic Name", placeholder: "e.g. Bright Smile Dental", value: clinicName, onChange: (event) => setClinicName(event.target.value), required: true }), _jsx(Input, { label: "City", placeholder: "e.g. Kuala Lumpur", value: city, onChange: (event) => setCity(event.target.value), required: true })] })), authModalMode === 'register' && (_jsxs("div", { children: [_jsx("label", { className: "text-sm font-semibold text-gray-700", children: "Role" }), _jsxs("div", { className: "mt-2 flex gap-2", children: [_jsx("button", { type: "button", className: `flex-1 rounded-full px-4 py-2 text-sm font-semibold transition ${role === 'seeker'
                                                        ? 'bg-brand text-white'
                                                        : 'border border-gray-200 bg-white text-gray-700 hover:border-brand hover:text-brand'}`, onClick: () => setRole('seeker'), children: "Seeker" }), _jsx("button", { type: "button", className: `flex-1 rounded-full px-4 py-2 text-sm font-semibold transition ${role === 'employer'
                                                        ? 'bg-brand text-white'
                                                        : 'border border-gray-200 bg-white text-gray-700 hover:border-brand hover:text-brand'}`, onClick: () => setRole('employer'), children: "Employer" })] })] })), error && _jsx("p", { className: "text-sm text-red-600", children: error }), _jsx(Button, { variant: "primary", type: "submit", className: "w-full", disabled: loading, children: loading ? 'Working...' : authModalMode === 'login' ? 'Sign in' : 'Create account' })] }), _jsxs("p", { className: "text-xs text-center text-gray-500", children: ["By continuing you agree to the platform's ", _jsx("span", { className: "text-brand font-semibold", children: "terms" }), " and", ' ', _jsx("span", { className: "text-brand font-semibold", children: "privacy policy" }), "."] })] }) }), _jsx(Toast, { open: showSuccessToast, onClose: () => setShowSuccessToast(false), title: "Welcome back!", description: "You have successfully signed in.", variant: "success" })] }));
}
