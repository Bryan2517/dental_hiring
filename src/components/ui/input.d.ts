import { InputHTMLAttributes, ReactNode } from 'react';
export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    hint?: string;
    icon?: ReactNode;
}
export declare function Input({ className, label, hint, icon, ...props }: InputProps): import("react/jsx-runtime").JSX.Element;
