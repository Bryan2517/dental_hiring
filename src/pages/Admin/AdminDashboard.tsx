import { useState } from 'react';
import { DashboardShell } from '../../layouts/DashboardShell';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Card } from '../../components/ui/card';
import { Breadcrumbs } from '../../components/Breadcrumbs';

const sidebarLinks = [
  { to: '/admin', label: 'Overview' },
  { to: '/jobs', label: 'Job board' },
  { to: '/employer/dashboard', label: 'Employers' }
];

const moderationQueue = [
  { id: 'mod-1', type: 'Job', title: 'Dental Assistant - Surgical', reason: 'Check salary info' },
  { id: 'mod-2', type: 'Resume', title: 'Clinical_Scans_Portfolio.pdf', reason: 'Verify credentials' },
  { id: 'mod-3', type: 'Job', title: 'Treatment Coordinator', reason: 'Clinic address missing' }
];

const analytics = [
  { label: 'Jobs this week', value: 28 },
  { label: 'New students', value: 64 },
  { label: 'Resume views', value: 120 },
  { label: 'Reports filed', value: 3 }
];

export default function AdminDashboard() {
  const [platformNotes, setPlatformNotes] = useState('Align templates and pricing across markets.');

  return (
    <DashboardShell
      sidebarLinks={sidebarLinks}
      title="Admin Console"
    subtitle="Moderation queue, reports, and analytics (mock)."
      actions={<Badge variant="info">UI only</Badge>}
    >
      <Breadcrumbs items={[{ label: 'Admin', to: '/admin' }, { label: 'Overview' }]} />
      <div className="grid gap-4 lg:grid-cols-[1.1fr,0.9fr]">
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Moderation Queue</h3>
            <Badge variant="warning">{moderationQueue.length} pending</Badge>
          </div>
          <div className="mt-3 divide-y divide-gray-100">
            {moderationQueue.map((item) => (
              <div key={item.id} className="flex items-center justify-between py-3">
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    {item.type}: {item.title}
                  </p>
                  <p className="text-xs text-gray-600">{item.reason}</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    Approve
                  </Button>
                  <Button variant="ghost" size="sm">
                    Reject
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-5">
          <h3 className="text-lg font-semibold text-gray-900">Platform notes</h3>
          <p className="text-sm text-gray-600">Document moderation cues and policy reminders for the admin team.</p>
          <Textarea
            className="mt-3"
            label="Notes"
            value={platformNotes}
            onChange={(e) => setPlatformNotes(e.target.value)}
          />
          <div className="mt-3">
            <Button variant="primary">Save notes (mock)</Button>
          </div>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        {analytics.map((item) => (
          <Card key={item.label} className="p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">{item.label}</p>
            <p className="mt-2 text-2xl font-bold text-gray-900">{item.value}</p>
            <div className="mt-3 h-2 rounded-full bg-gray-100">
              <div
                className="h-full rounded-full bg-brand"
                style={{ width: `${Math.min(item.value, 120) / 1.2}%` }}
              />
            </div>
          </Card>
        ))}
      </div>

      <Card className="p-5">
        <h3 className="text-lg font-semibold text-gray-900">Reports</h3>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          <Textarea label="Escalations" placeholder="Notes on flagged jobs or resumes" />
          <Textarea label="Follow-ups" placeholder="Reminders for the admin team" />
        </div>
        <div className="mt-3">
          <Button variant="primary">Save notes (mock)</Button>
        </div>
      </Card>
    </DashboardShell>
  );
}
