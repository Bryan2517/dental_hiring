import { InputHTMLAttributes } from 'react';
interface CheckboxProps extends InputHTMLAttributes<HTMLInputElement> {
    label: string;
    description?: string;
}
export declare function Checkbox({ label, description, className, ...props }: CheckboxProps): import("react/jsx-runtime").JSX.Element;
export {};
