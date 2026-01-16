import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardShell } from '../../layouts/DashboardShell';
import { Stepper } from '../../components/Stepper';
import { Input } from '../../components/ui/input';
import { Select } from '../../components/ui/select';
import { Checkbox } from '../../components/ui/checkbox';
import { Textarea } from '../../components/ui/textarea';
import { Button } from '../../components/ui/button';
import { Toast } from '../../components/ui/toast';
import { Breadcrumbs } from '../../components/Breadcrumbs';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { getUsersOrganizations } from '../../lib/api/organizations';

const sidebarLinks = [
  { to: '/employer/dashboard', label: 'Overview' },
  { to: '/employer/post-job', label: 'Post job' },
  { to: '/employer/applicants', label: 'Applicants' },
  { to: '/employer/organization', label: 'Organization Profile' }
];

const steps = [
  { id: 'basics', title: 'Job Basics', description: 'Role, location, employment' },
  { id: 'dental', title: 'Dental Requirements', description: 'Specialties & exposures' },
  { id: 'comp', title: 'Compensation & Schedule', description: 'Salary & shifts' },
  { id: 'review', title: 'Review & Publish', description: 'Confirm details' }
];

export default function PostJob() {
  const { user } = useAuth();
  const [activeStep, setActiveStep] = useState(0);
  const [showToast, setShowToast] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const [orgId, setOrgId] = useState<string | null>(null);

  const [form, setForm] = useState({
    roleType: 'Dental Assistant',
    clinicName: '',
    city: '',
    country: 'Malaysia',
    specialtyTags: '4-hand dentistry, Sterilization',
    experienceLevel: 'Junior',
    newGradWelcome: true,
    trainingProvided: true,
    salaryMin: '2800',
    salaryMax: '3500',
    schedule: '5-day week, rotating weekends',
    benefits: 'Medical coverage, CPD allowance, Annual bonus',
    requirements: '',
    preferredExperience: ''
  });

  useEffect(() => {
    if (!user) return;
    async function fetchOrg() {
      const orgs = await getUsersOrganizations(user!.id);

      if (!orgs || orgs.length === 0) {
        // No organization found, redirect to dashboard which handles onboarding
        navigate('/employer/dashboard');
        return;
      }

      // Try to find active org from local storage, otherwise use first one
      const storedOrgId = localStorage.getItem('activeOrgId');
      const activeOrg = orgs.find(o => o.id === storedOrgId) || orgs[0];

      if (activeOrg) {
        setOrgId(activeOrg.id);
        setForm(f => ({
          ...f,
          clinicName: activeOrg.org_name,
          city: activeOrg.city || '',
          country: activeOrg.country || 'Malaysia'
        }));
      }
    }
    fetchOrg();
  }, [user, navigate]);

  const next = () => setActiveStep((s) => Math.min(s + 1, steps.length - 1));
  const prev = () => setActiveStep((s) => Math.max(s - 1, 0));

  const insertJob = async (status: 'published' | 'draft') => {
    if (!orgId) {
      alert("Organization profile missing. Please contact support.");
      return;
    }
    setIsSubmitting(true);

    try {
      // Parse salary range roughly
      // Parse salary strings to numbers
      const minSal = parseInt(form.salaryMin.replace(/\D/g, ''), 10) || 0;
      const maxSal = parseInt(form.salaryMax.replace(/\D/g, ''), 10) || 0;

      // Map role type to closest enum or 'other'. 
      // For simplicity, we downcast to any or 'other' if needed, but DB likely strictly checks.
      // Provide a best-effort map or simplistic lower case match.
      const roleTypeMap: Record<string, string> = {
        'Dental Assistant': 'dental_assistant',
        'Dentist (GP)': 'dentist_gp',
        'Dentist (Specialist)': 'dentist_specialist',
        'Dental Nurse': 'dental_nurse',
        'Dental Hygienist': 'dental_hygienist',
        'Receptionist': 'receptionist',
        'Clinic Manager': 'clinic_manager',
        'Lab Technician': 'lab_technician'
      };
      // Default to 'other' if not found.
      const dbRoleType = roleTypeMap[form.roleType] || 'other';

      const { error } = await supabase.from('jobs').insert({
        org_id: orgId,
        title: form.roleType, // Using role as title for now
        role_type: dbRoleType as any,
        employment_type: 'full_time', // TODO: map from form employment type
        experience_level: form.experienceLevel.toLowerCase() as any,
        // special tags split by comma
        specialty_tags: form.specialtyTags.split(',').map(s => s.trim()).filter(Boolean),
        description: `Requirements:\n${form.requirements}\n\nPreferred Experience:\n${form.preferredExperience}\n\nSchedule:\n${form.schedule}`,
        salary_min: minSal,
        salary_max: maxSal,
        currency: 'MYR', // Default
        benefits: { list: form.benefits.split(',').map(s => s.trim()) },
        dental_requirements: {}, // Default empty
        new_grad_welcome: form.newGradWelcome,
        training_provided: form.trainingProvided,
        status: status,
        city: form.city,
        country: form.country
      });

      if (error) {
        console.error(error);
        alert(`Error ${status === 'published' ? 'publishing' : 'saving'}: ` + error.message);
      } else {
        setShowToast(true);
        setTimeout(() => navigate('/employer/dashboard'), 1500);
      }

    } catch (err) {
      console.error(err);
      alert("Unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardShell
      sidebarLinks={sidebarLinks}
      title="Post a Job"
      subtitle="Fill in the details to find your next great hire."
      hideNavigation
    >
      <Breadcrumbs items={[{ label: 'Employer Home', to: '/employers' }, { label: 'Post Job' }]} />
      <Stepper steps={steps} activeStep={activeStep} />

      <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
        {activeStep === 0 && (
          <div className="grid gap-4 md:grid-cols-2">
            <Select
              label="Role title"
              value={form.roleType}
              onChange={(e) => setForm({ ...form, roleType: e.target.value })}
            >
              <option>Dental Assistant</option>
              <option>Dentist (GP)</option>
              <option>Dentist (Specialist)</option>
              <option>Dental Nurse</option>
              <option>Dental Hygienist</option>
              <option>Receptionist</option>
              <option>Clinic Manager</option>
              <option>Lab Technician</option>
            </Select>
            <Input
              label="Clinic name"
              value={form.clinicName}
              onChange={(e) => setForm({ ...form, clinicName: e.target.value })}
            />
            <Input label="City" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
            <Select
              label="Country"
              value={form.country}
              onChange={(e) => setForm({ ...form, country: e.target.value })}
            >
              <option>Malaysia</option>
              <option>Singapore</option>
            </Select>
            <Select
              label="Experience level"
              value={form.experienceLevel}
              onChange={(e) => setForm({ ...form, experienceLevel: e.target.value })}
            >
              <option>Entry</option>
              <option>Junior</option>
              <option>Mid</option>
              <option>Senior</option>
            </Select>
            <Select label="Employment type" defaultValue="Full-time">
              <option>Full-time</option>
              <option>Part-time</option>
              <option>Locum</option>
              <option>Contract</option>
            </Select>
            <Checkbox
              label="New grad welcome"
              checked={form.newGradWelcome}
              onChange={(e) => setForm({ ...form, newGradWelcome: e.target.checked })}
            />
            <Checkbox
              label="Training provided"
              checked={form.trainingProvided}
              onChange={(e) => setForm({ ...form, trainingProvided: e.target.checked })}
            />
          </div>
        )}

        {activeStep === 1 && (
          <div className="grid gap-4">
            <Textarea
              label="Specialty tags"
              value={form.specialtyTags}
              onChange={(e) => setForm({ ...form, specialtyTags: e.target.value })}
              hint="Comma-separated tags e.g. Intraoral scanning, Sterilization, Implants"
            />
            <Textarea
              label="Key requirements"
              placeholder="Rubber dam, sterilization, chairside charting..."
              value={form.requirements}
              onChange={(e) => setForm({ ...form, requirements: e.target.value })}
            />
            <Textarea
              label="Preferred experience"
              placeholder="1+ year in chairside support..."
              value={form.preferredExperience}
              onChange={(e) => setForm({ ...form, preferredExperience: e.target.value })}
            />
          </div>
        )}

        {activeStep === 2 && (
          <div className="grid gap-4 md:grid-cols-2">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Salary Min (MYR)"
                value={form.salaryMin}
                onChange={(e) => setForm({ ...form, salaryMin: e.target.value })}
              />
              <Input
                label="Salary Max (MYR)"
                value={form.salaryMax}
                onChange={(e) => setForm({ ...form, salaryMax: e.target.value })}
              />
            </div>
            <Input
              label="Schedule"
              value={form.schedule}
              onChange={(e) => setForm({ ...form, schedule: e.target.value })}
            />
            <Textarea
              className="md:col-span-2"
              label="Benefits"
              value={form.benefits}
              onChange={(e) => setForm({ ...form, benefits: e.target.value })}
            />
          </div>
        )}

        {activeStep === 3 && (
          <div className="space-y-3 text-sm text-gray-700">
            <p className="text-lg font-semibold text-gray-900">Review</p>
            <p>
              <strong>Role:</strong> {form.roleType}
            </p>
            <p>
              <strong>Clinic:</strong> {form.clinicName} - {form.city}, {form.country}
            </p>
            <p>
              <strong>Specialties:</strong> {form.specialtyTags}
            </p>
            <p>
              <strong>Salary:</strong> RM {form.salaryMin} - RM {form.salaryMax}
            </p>
            <p>
              <strong>Benefits:</strong> {form.benefits}
            </p>
          </div>
        )}

        <div className="mt-6 flex flex-wrap items-center justify-between gap-2">
          <div className="flex gap-2">
            <Button variant="outline" onClick={prev} disabled={activeStep === 0}>
              Back
            </Button>
            {activeStep < steps.length - 1 && (
              <Button variant="primary" onClick={next}>
                Next
              </Button>
            )}
            {activeStep === steps.length - 1 && (
              <Button variant="primary" onClick={() => insertJob('published')} disabled={isSubmitting}>
                {isSubmitting ? 'Publishing...' : 'Publish'}
              </Button>
            )}
          </div>
          <Button variant="ghost" onClick={() => insertJob('draft')} disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Save draft'}
          </Button>
        </div>
      </div>

      <Toast
        open={showToast}
        onClose={() => setShowToast(false)}
        title="Job published"
        description="Redirecting to dashboard..."
      />
    </DashboardShell>
  );
}
