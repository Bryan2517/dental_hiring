import { ReactNode } from 'react';
interface ModalProps {
    open: boolean;
    onClose: () => void;
    title?: string;
    children: ReactNode;
    maxWidth?: string;
}
export declare function Modal({ open, onClose, title, children, maxWidth }: ModalProps): import("react").ReactPortal;
export {};
