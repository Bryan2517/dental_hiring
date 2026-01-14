import { TextareaHTMLAttributes } from 'react';
interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
    label?: string;
    hint?: string;
}
export declare function Textarea({ className, label, hint, ...props }: TextareaProps): import("react/jsx-runtime").JSX.Element;
export {};
