import { ButtonHTMLAttributes, ReactNode } from 'react';
type Variant = 'primary' | 'secondary' | 'outline' | 'ghost';
type Size = 'sm' | 'md' | 'lg';
interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: Variant;
    size?: Size;
    icon?: ReactNode;
    rightIcon?: ReactNode;
    loading?: boolean;
    asChild?: boolean;
}
export declare function Button({ children, variant, size, className, icon, rightIcon, loading, disabled, asChild, ...props }: ButtonProps): import("react/jsx-runtime").JSX.Element;
export {};
