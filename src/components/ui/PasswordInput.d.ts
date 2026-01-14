import { InputHTMLAttributes } from 'react';
export interface PasswordInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
    label?: string;
    hint?: string;
}
export declare function PasswordInput({ className, label, hint, ...props }: PasswordInputProps): import("react/jsx-runtime").JSX.Element;
