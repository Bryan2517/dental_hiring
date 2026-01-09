import { useState } from 'react';
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

const sidebarLinks = [
  { to: '/employer/dashboard', label: 'Overview' },
  { to: '/employer/post-job', label: 'Post job' },
  { to: '/employer/applicants', label: 'Applicants' }
];

const steps = [
  { id: 'basics', title: 'Job Basics', description: 'Role, location, employment' },
  { id: 'dental', title: 'Dental Requirements', description: 'Specialties & exposures' },
  { id: 'comp', title: 'Compensation & Schedule', description: 'Salary & shifts' },
  { id: 'review', title: 'Review & Publish', description: 'Confirm details' }
];

export default function PostJob() {
  const [activeStep, setActiveStep] = useState(0);
  const [showToast, setShowToast] = useState(false);
  const navigate = useNavigate();
  const [form, setForm] = useState({
    roleType: 'Dental Assistant',
    clinicName: '',
    city: '',
    country: 'Malaysia',
    specialtyTags: '4-hand dentistry, Sterilization',
    experienceLevel: 'Junior',
    newGradWelcome: true,
    trainingProvided: true,
    salaryRange: '$2,800 - $3,500',
    schedule: '5-day week, rotating weekends',
    benefits: 'Medical, CPD tokens, Annual bonus'
  });

  const next = () => setActiveStep((s) => Math.min(s + 1, steps.length - 1));
  const prev = () => setActiveStep((s) => Math.max(s - 1, 0));

  const publish = () => {
    setShowToast(true);
    setTimeout(() => navigate('/employer/dashboard'), 1500);
  };

  return (
    <DashboardShell
      sidebarLinks={sidebarLinks}
      title="Post a Job"
      subtitle="Multi-step UI only. Save/publish actions are mocked."
      hideNavigation
    >
      <Breadcrumbs items={[{ label: 'Employer Home', to: '/employers' }, { label: 'Post Job' }]} />
      <Stepper steps={steps} activeStep={activeStep} />

      <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
        {activeStep === 0 && (
          <div className="grid gap-4 md:grid-cols-2">
            <Input
              label="Role title"
              value={form.roleType}
              onChange={(e) => setForm({ ...form, roleType: e.target.value })}
            />
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
              <option>Student</option>
              <option>New Grad</option>
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
            <Textarea label="Key requirements" placeholder="Rubber dam, sterilization, chairside charting..." />
            <Textarea label="Preferred experience" placeholder="1+ year in chairside support..." />
          </div>
        )}

        {activeStep === 2 && (
          <div className="grid gap-4 md:grid-cols-2">
            <Input
              label="Salary range"
              value={form.salaryRange}
              onChange={(e) => setForm({ ...form, salaryRange: e.target.value })}
            />
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
            <p className="text-lg font-semibold text-gray-900">Review (mock)</p>
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
              <strong>Salary:</strong> {form.salaryRange}
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
              <Button variant="primary" onClick={publish}>
                Publish (mock)
              </Button>
            )}
          </div>
          <Button variant="ghost">Save draft</Button>
        </div>
      </div>

      <Toast
        open={showToast}
        onClose={() => setShowToast(false)}
        title="Job published (mock)"
        description="Redirecting to dashboard..."
      />
    </DashboardShell>
  );
}
