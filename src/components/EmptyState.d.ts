import { ReactNode } from 'react';
interface EmptyStateProps {
    title: string;
    description: string;
    icon?: ReactNode;
    action?: ReactNode;
    className?: string;
}
export declare function EmptyState({ title, description, icon, action, className }: EmptyStateProps): import("react/jsx-runtime").JSX.Element;
export {};
