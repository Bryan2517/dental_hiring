import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { AppShell } from './AppShell';
import { Sidebar } from '../components/Sidebar';
export function DashboardShell({ children, sidebarLinks, title, subtitle, actions, hideNavigation }) {
    return (_jsx(AppShell, { padded: true, background: "muted", showFooter: false, children: _jsxs("div", { className: "flex flex-col gap-6", children: [!hideNavigation && (_jsx(Sidebar, { title: "Navigation", links: sidebarLinks, orientation: "horizontal" })), _jsxs("div", { className: "flex flex-wrap items-start justify-between gap-3", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-2xl font-bold text-gray-900", children: title }), subtitle && _jsx("p", { className: "text-gray-600", children: subtitle })] }), actions] }), children] }) }));
}
