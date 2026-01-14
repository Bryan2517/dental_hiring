import { ReactNode } from 'react';
interface AppShellProps {
    children: ReactNode;
    sidebar?: ReactNode;
    padded?: boolean;
    maxWidth?: boolean;
    showFooter?: boolean;
    background?: 'light' | 'muted';
}
export declare function AppShell({ children, sidebar, padded, maxWidth, showFooter, background }: AppShellProps): import("react/jsx-runtime").JSX.Element;
export {};
