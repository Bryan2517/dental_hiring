import { ReactNode } from 'react';
export interface SidebarLink {
    label: string;
    to: string;
    icon?: ReactNode;
}
interface SidebarProps {
    title: string;
    links: SidebarLink[];
    orientation?: 'vertical' | 'horizontal';
}
export declare function Sidebar({ title, links, orientation }: SidebarProps): import("react/jsx-runtime").JSX.Element;
export {};
