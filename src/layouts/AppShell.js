import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { TopNav } from '../components/TopNav';
import { Footer } from '../components/Footer';
import { cn } from '../lib/utils';
export function AppShell({ children, sidebar, padded = true, maxWidth = true, showFooter = true, background = 'light' }) {
    return (_jsxs("div", { className: cn('min-h-screen', background === 'muted' ? 'bg-gray-50' : 'bg-white'), children: [_jsx(TopNav, {}), _jsx("main", { className: cn(padded ? 'py-6 md:py-10' : '', sidebar ? 'container-wide' : maxWidth ? 'container-wide' : 'w-full'), children: sidebar ? (_jsxs("div", { className: "grid gap-6 lg:grid-cols-[240px,1fr]", children: [_jsx("aside", { className: "hidden lg:block", children: sidebar }), _jsx("section", { children: children })] })) : (children) }), showFooter && _jsx(Footer, {})] }));
}
