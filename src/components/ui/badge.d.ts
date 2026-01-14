import { ReactNode } from 'react';
type Variant = 'default' | 'outline' | 'success' | 'warning' | 'danger' | 'info';
interface BadgeProps {
    children: ReactNode;
    variant?: Variant;
    className?: string;
}
export declare function Badge({ children, variant, className }: BadgeProps): import("react/jsx-runtime").JSX.Element;
export {};
