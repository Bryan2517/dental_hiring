import { useState } from 'react';
import { AppShell } from '../../layouts/AppShell';
import { Card } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Select } from '../../components/ui/select';
import { Button } from '../../components/ui/button';
import { Tabs } from '../../components/ui/tabs';

export default function Register() {
  const [role, setRole] = useState('student');

  return (
    <AppShell background="muted">
      <div className="mx-auto max-w-3xl">
        <Card className="p-6">
          <h1 className="text-2xl font-bold text-gray-900">Create your account</h1>
          <p className="text-sm text-gray-600">UI only - no authentication calls.</p>
          <div className="mt-4">
            <Tabs
              tabs={[
                { id: 'student', label: 'Student' },
                { id: 'employer', label: 'Employer' }
              ]}
              active={role}
              onChange={setRole}
            />
          </div>

          <div className="mt-5 grid gap-4">
            <Input label="Full name" placeholder="Alex Dental" />
            <Input label="Email" type="email" placeholder="you@example.com" />
            <Input label="Phone" placeholder="+60" />
            <Input label="Password" type="password" />
            {role === 'student' ? (
              <>
                <Input label="School" placeholder="Mahsa University" />
                <Select label="Graduation year" defaultValue="">
                  <option value="">Select</option>
                  <option>2024</option>
                  <option>2025</option>
                  <option>2026</option>
                </Select>
              </>
            ) : (
              <>
                <Input label="Clinic name" placeholder="Bright Dental" />
                <Input label="City" placeholder="Kuala Lumpur" />
                <Select label="Clinic size" defaultValue="">
                  <option value="">Select</option>
                  <option>1-3 chairs</option>
                  <option>4-7 chairs</option>
                  <option>8+ chairs</option>
                </Select>
              </>
            )}
            <Button variant="primary" className="w-full">
              Sign up (mock)
            </Button>
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
