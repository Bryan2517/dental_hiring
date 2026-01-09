import { ReactNode } from 'react';
import { AppShell } from './AppShell';
import { Sidebar, SidebarLink } from '../components/Sidebar';

interface DashboardShellProps {
  children: ReactNode;
  sidebarLinks: SidebarLink[];
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  hideNavigation?: boolean;
}

export function DashboardShell({
  children,
  sidebarLinks,
  title,
  subtitle,
  actions,
  hideNavigation
}: DashboardShellProps) {
  return (
    <AppShell padded background="muted" showFooter={false}>
      <div className="flex flex-col gap-6">
        {!hideNavigation && (
          <Sidebar title="Navigation" links={sidebarLinks} orientation="horizontal" />
        )}
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
            {subtitle && <p className="text-gray-600">{subtitle}</p>}
          </div>
          {actions}
        </div>
        {children}
      </div>
    </AppShell>
  );
}
