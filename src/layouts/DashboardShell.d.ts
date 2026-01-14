import { ReactNode } from 'react';
import { SidebarLink } from '../components/Sidebar';
interface DashboardShellProps {
    children: ReactNode;
    sidebarLinks: SidebarLink[];
    title: string;
    subtitle?: string;
    actions?: ReactNode;
    hideNavigation?: boolean;
}
export declare function DashboardShell({ children, sidebarLinks, title, subtitle, actions, hideNavigation }: DashboardShellProps): import("react/jsx-runtime").JSX.Element;
export {};
