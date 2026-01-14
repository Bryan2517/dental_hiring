import { SelectHTMLAttributes } from 'react';
interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
    label?: string;
    hint?: string;
}
export declare function Select({ className, label, hint, children, ...props }: SelectProps): import("react/jsx-runtime").JSX.Element;
export {};
