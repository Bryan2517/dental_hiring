import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { DashboardShell } from '../../layouts/DashboardShell';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Select } from '../../components/ui/select';
import { Toast } from '../../components/ui/toast';
import { useAuth } from '../../contexts/AuthContext';
import { getOrganization, updateOrganization, createOrganization } from '../../lib/api/organizations';
import { Breadcrumbs } from '../../components/Breadcrumbs';
const sidebarLinks = [
    { to: '/employer/dashboard', label: 'Overview' },
    { to: '/employer/applicants', label: 'Applicants' },
    { to: '/employer/post-job', label: 'Post job' },
    { to: '/employer/profile', label: 'Organization Profile' }
];
export default function OrganizationProfile() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [orgId, setOrgId] = useState(null);
    const [activeTab, setActiveTab] = useState('profile');
    // Form State
    const [orgName, setOrgName] = useState('');
    const [orgType, setOrgType] = useState('clinic');
    const [description, setDescription] = useState('');
    const [websiteUrl, setWebsiteUrl] = useState('');
    // Address State
    const [address1, setAddress1] = useState('');
    const [address2, setAddress2] = useState('');
    const [city, setCity] = useState('');
    const [state, setState] = useState('');
    const [postcode, setPostcode] = useState('');
    const [country, setCountry] = useState('Malaysia');
    const [toastOpen, setToastOpen] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    useEffect(() => {
        async function loadData() {
            if (!user)
                return;
            try {
                const org = await getOrganization(user.id);
                if (org) {
                    setOrgId(org.id);
                    setOrgName(org.org_name);
                    setOrgType(org.org_type);
                    setDescription(org.description || '');
                    setWebsiteUrl(org.website_url || '');
                    setAddress1(org.address_line1 || '');
                    setAddress2(org.address_line2 || '');
                    setCity(org.city || '');
                    setState(org.state || '');
                    setPostcode(org.postcode || '');
                    setCountry(org.country || 'Malaysia');
                }
            }
            catch (error) {
                console.error('Error loading organization:', error);
            }
            finally {
                setLoading(false);
            }
        }
        loadData();
    }, [user]);
    const handleSubmit = async (e) => {
        if (e)
            e.preventDefault();
        if (!user)
            return;
        setSaving(true);
        try {
            const orgData = {
                org_name: orgName,
                org_type: orgType,
                description,
                website_url: websiteUrl,
                address_line1: address1,
                address_line2: address2,
                city,
                state,
                postcode,
                country
            };
            if (orgId) {
                await updateOrganization(orgId, orgData);
            }
            else {
                const newOrg = await createOrganization({
                    owner_user_id: user.id,
                    ...orgData
                });
                setOrgId(newOrg.id);
            }
            setToastMessage('Organization profile saved successfully');
            setToastOpen(true);
        }
        catch (error) {
            console.error('Error saving profile:', error);
            setToastMessage('Failed to save profile');
            setToastOpen(true);
        }
        finally {
            setSaving(false);
        }
    };
    if (loading) {
        return (_jsx(DashboardShell, { sidebarLinks: sidebarLinks, title: "Organization Profile", subtitle: "Loading...", hideNavigation: true, children: _jsx("div", { className: "flex h-64 items-center justify-center", children: "Loading..." }) }));
    }
    return (_jsxs(DashboardShell, { sidebarLinks: sidebarLinks, title: "Organization Profile", subtitle: "Manage your clinic or organization details.", hideNavigation: true, children: [_jsx(Breadcrumbs, { items: [{ label: 'Employer Home', to: '/employers' }, { label: 'Organization Profile' }] }), activeTab === 'profile' && (_jsx("div", { className: "rounded-2xl border border-gray-100 bg-white p-5 shadow-sm space-y-6", children: _jsxs("div", { className: "grid gap-4 md:grid-cols-2", children: [_jsx(Input, { label: "Organization Name", value: orgName, onChange: (e) => setOrgName(e.target.value), required: true, placeholder: "e.g. Happy Teeth Dental" }), _jsxs(Select, { label: "Organization Type", value: orgType, onChange: (e) => setOrgType(e.target.value), children: [_jsx("option", { value: "clinic", children: "Dental Clinic" }), _jsx("option", { value: "lab", children: "Dental Lab" }), _jsx("option", { value: "dental_group", children: "Dental Group" }), _jsx("option", { value: "supplier", children: "Supplier" }), _jsx("option", { value: "other", children: "Other" })] }), _jsx(Input, { label: "Website URL", value: websiteUrl, onChange: (e) => setWebsiteUrl(e.target.value), placeholder: "https://example.com" }), _jsx("div", { className: "md:col-span-2", children: _jsx(Textarea, { label: "About the Organization", value: description, onChange: (e) => setDescription(e.target.value), placeholder: "Tell candidates about your practice, culture, and values...", rows: 4 }) }), _jsxs("div", { className: "md:col-span-2 pt-2 border-t border-gray-100 mt-2", children: [_jsx("h3", { className: "text-sm font-semibold text-gray-800 mb-4", children: "Location" }), _jsxs("div", { className: "grid gap-4 md:grid-cols-2", children: [_jsx("div", { className: "md:col-span-2", children: _jsx(Input, { label: "Address Line 1", value: address1, onChange: (e) => setAddress1(e.target.value), placeholder: "Street address" }) }), _jsx("div", { className: "md:col-span-2", children: _jsx(Input, { label: "Address Line 2", value: address2, onChange: (e) => setAddress2(e.target.value), placeholder: "Suite, unit, building, etc. (optional)" }) }), _jsx(Input, { label: "City", value: city, onChange: (e) => setCity(e.target.value), placeholder: "e.g. Kuala Lumpur" }), _jsx(Input, { label: "State", value: state, onChange: (e) => setState(e.target.value), placeholder: "e.g. Selangor" }), _jsx(Input, { label: "Postcode", value: postcode, onChange: (e) => setPostcode(e.target.value), placeholder: "e.g. 50000" }), _jsxs(Select, { label: "Country", value: country, onChange: (e) => setCountry(e.target.value), children: [_jsx("option", { value: "Malaysia", children: "Malaysia" }), _jsx("option", { value: "Singapore", children: "Singapore" })] })] })] }), _jsx("div", { className: "md:col-span-2 flex justify-end gap-2 mt-4", children: _jsx(Button, { variant: "primary", onClick: () => handleSubmit(), disabled: saving, children: saving ? 'Saving...' : 'Save Profile' }) })] }) })), activeTab === 'settings' && (_jsx("div", { className: "rounded-2xl border border-gray-100 bg-white p-5 shadow-sm min-h-[200px] flex items-center justify-center", children: _jsx("p", { className: "text-gray-500", children: "Account settings coming soon." }) })), _jsx(Toast, { open: toastOpen, onClose: () => setToastOpen(false), title: toastMessage.includes('success') ? 'Success' : 'Error', description: toastMessage, variant: toastMessage.includes('success') ? 'success' : 'error' })] }));
}
