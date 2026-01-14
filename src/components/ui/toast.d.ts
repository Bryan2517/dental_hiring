import { ReactNode } from 'react';
interface ToastProps {
    open: boolean;
    onClose: () => void;
    title: string;
    description?: ReactNode;
    variant?: 'success' | 'info' | 'warning' | 'error';
    duration?: number;
}
export declare function Toast({ open, onClose, title, description, variant, duration }: ToastProps): import("react").ReactPortal;
export {};
