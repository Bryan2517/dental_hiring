import { ReactNode } from 'react';
import { AppShell } from './AppShell';
import { Sidebar, SidebarLink } from '../components/Sidebar';
import { cn } from '../lib/utils';

interface DashboardShellProps {
  children: ReactNode;
  sidebarLinks: SidebarLink[];
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  hideNavigation?: boolean;
  padded?: boolean;
}

export function DashboardShell({
  children,
  sidebarLinks,
  title,
  subtitle,
  actions,
  hideNavigation,
  padded = true
}: DashboardShellProps) {
  return (
    <AppShell padded={padded} background="muted" showFooter={false}>
      <div className={cn("flex flex-col", padded && "gap-6")}>
        {!hideNavigation && (
          <Sidebar title="Navigation" links={sidebarLinks} orientation="horizontal" />
        )}
        {(title || actions) && (
          <div className={cn("flex flex-wrap items-start justify-between gap-3", !padded && "px-4 pt-4")}>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
              {subtitle && <p className="text-gray-600">{subtitle}</p>}
            </div>
            {actions}
          </div>
        )}
        {children}
      </div>
    </AppShell>
  );
}
