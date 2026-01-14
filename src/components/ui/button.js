import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { cloneElement, isValidElement } from 'react';
import { cn } from '../../lib/utils';
export function Button({ children, variant = 'primary', size = 'md', className, icon, rightIcon, loading, disabled, asChild, ...props }) {
    const variantClasses = {
        primary: 'bg-gradient-to-r from-brand to-brand-hover text-white hover:shadow-md hover:-translate-y-0.5',
        secondary: 'bg-white text-brand border border-brand/20 hover:border-brand/40 hover:shadow-md hover:-translate-y-0.5',
        outline: 'border border-gray-200 text-gray-800 bg-white hover:border-brand hover:text-brand hover:shadow-md hover:-translate-y-0.5',
        ghost: 'text-gray-700 hover:bg-gray-100'
    };
    const sizeClasses = {
        sm: 'text-sm px-4 py-2.5',
        md: 'text-sm px-5 py-3',
        lg: 'text-base px-6 py-3.5'
    };
    const classes = cn('inline-flex items-center gap-2 rounded-full font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm', variantClasses[variant], sizeClasses[size], className);
    if (asChild && isValidElement(children)) {
        return cloneElement(children, {
            className: cn(children.props.className, classes),
            children: (_jsxs(_Fragment, { children: [icon && _jsx("span", { className: "text-lg", children: icon }), loading && (_jsx("span", { className: "h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" })), _jsx("span", { children: children.props.children }), rightIcon && _jsx("span", { className: "text-lg", children: rightIcon })] }))
        });
    }
    return (_jsxs("button", { className: classes, disabled: disabled || loading, ...props, children: [icon && _jsx("span", { className: "text-lg", children: icon }), loading && (_jsx("span", { className: "h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" })), _jsx("span", { children: children }), rightIcon && _jsx("span", { className: "text-lg", children: rightIcon })] }));
}
