import { useState, useEffect } from 'react';
import { DashboardShell } from '../../layouts/DashboardShell';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Select } from '../../components/ui/select';
import { Toast } from '../../components/ui/toast';
import { useAuth } from '../../contexts/AuthContext';
import { getOrganization, updateOrganization, createOrganization } from '../../lib/api/organizations';
import { Database } from '../../lib/database.types';
import { Tabs } from '../../components/ui/tabs';
import { Breadcrumbs } from '../../components/Breadcrumbs';

const sidebarLinks = [
    { to: '/employer/dashboard', label: 'Overview' },
    { to: '/employer/applicants', label: 'Applicants' },
    { to: '/employer/post-job', label: 'Post job' },
    { to: '/employer/profile', label: 'Organization Profile' }
];

type OrgType = Database['public']['Enums']['org_type'];

export default function OrganizationProfile() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [orgId, setOrgId] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState('profile');

    // Form State
    const [orgName, setOrgName] = useState('');
    const [orgType, setOrgType] = useState<OrgType>('clinic');
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
            if (!user) return;
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
            } catch (error) {
                console.error('Error loading organization:', error);
            } finally {
                setLoading(false);
            }
        }
        loadData();
    }, [user]);

    const handleSubmit = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!user) return;
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
            } else {
                const newOrg = await createOrganization({
                    owner_user_id: user.id,
                    ...orgData
                });
                setOrgId(newOrg.id);
            }

            setToastMessage('Organization profile saved successfully');
            setToastOpen(true);
        } catch (error) {
            console.error('Error saving profile:', error);
            setToastMessage('Failed to save profile');
            setToastOpen(true);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <DashboardShell sidebarLinks={sidebarLinks} title="Organization Profile" subtitle="Loading..." hideNavigation>
                <div className="flex h-64 items-center justify-center">Loading...</div>
            </DashboardShell>
        );
    }

    return (
        <DashboardShell
            sidebarLinks={sidebarLinks}
            title="Organization Profile"
            subtitle="Manage your clinic or organization details."
            hideNavigation
        >
            <Breadcrumbs items={[{ label: 'Employer Home', to: '/employers' }, { label: 'Organization Profile' }]} />

            {/* <Tabs
                tabs={[
                    { id: 'profile', label: 'Organization Details' }
                ]}
                active={activeTab}
                onChange={setActiveTab}
            /> */}

            {activeTab === 'profile' && (
                <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm space-y-6">
                    <div className="grid gap-4 md:grid-cols-2">
                        <Input
                            label="Organization Name"
                            value={orgName}
                            onChange={(e) => setOrgName(e.target.value)}
                            required
                            placeholder="e.g. Happy Teeth Dental"
                        />
                        <Select
                            label="Organization Type"
                            value={orgType}
                            onChange={(e) => setOrgType(e.target.value as OrgType)}
                        >
                            <option value="clinic">Dental Clinic</option>
                            <option value="lab">Dental Lab</option>
                            <option value="dental_group">Dental Group</option>
                            <option value="supplier">Supplier</option>
                            <option value="other">Other</option>
                        </Select>

                        <Input
                            label="Website URL"
                            value={websiteUrl}
                            onChange={(e) => setWebsiteUrl(e.target.value)}
                            placeholder="https://example.com"
                        />
                        <div className="md:col-span-2">
                            <Textarea
                                label="About the Organization"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Tell candidates about your practice, culture, and values..."
                                rows={4}
                            />
                        </div>

                        <div className="md:col-span-2 pt-2 border-t border-gray-100 mt-2">
                            <h3 className="text-sm font-semibold text-gray-800 mb-4">Location</h3>
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="md:col-span-2">
                                    <Input
                                        label="Address Line 1"
                                        value={address1}
                                        onChange={(e) => setAddress1(e.target.value)}
                                        placeholder="Street address"
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <Input
                                        label="Address Line 2"
                                        value={address2}
                                        onChange={(e) => setAddress2(e.target.value)}
                                        placeholder="Suite, unit, building, etc. (optional)"
                                    />
                                </div>
                                <Input
                                    label="City"
                                    value={city}
                                    onChange={(e) => setCity(e.target.value)}
                                    placeholder="e.g. Kuala Lumpur"
                                />
                                <Input
                                    label="State"
                                    value={state}
                                    onChange={(e) => setState(e.target.value)}
                                    placeholder="e.g. Selangor"
                                />
                                <Input
                                    label="Postcode"
                                    value={postcode}
                                    onChange={(e) => setPostcode(e.target.value)}
                                    placeholder="e.g. 50000"
                                />
                                <Select
                                    label="Country"
                                    value={country}
                                    onChange={(e) => setCountry(e.target.value)}
                                >
                                    <option value="Malaysia">Malaysia</option>
                                    <option value="Singapore">Singapore</option>
                                </Select>
                            </div>
                        </div>

                        <div className="md:col-span-2 flex justify-end gap-2 mt-4">
                            <Button variant="primary" onClick={() => handleSubmit()} disabled={saving}>
                                {saving ? 'Saving...' : 'Save Profile'}
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'settings' && (
                <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm min-h-[200px] flex items-center justify-center">
                    <p className="text-gray-500">Account settings coming soon.</p>
                </div>
            )}

            <Toast
                open={toastOpen}
                onClose={() => setToastOpen(false)}
                title={toastMessage.includes('success') ? 'Success' : 'Error'}
                description={toastMessage}
                variant={toastMessage.includes('success') ? 'success' : 'error'}
            />
        </DashboardShell>
    );
}
