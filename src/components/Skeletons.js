import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export function Skeleton({ className }) {
    return _jsx("div", { className: `animate-pulse rounded-lg bg-gray-200 ${className}` });
}
export function JobCardSkeleton() {
    return (_jsxs("div", { className: "flex flex-col gap-3 rounded-2xl border border-gray-100 bg-white p-5 shadow-card", children: [_jsx(Skeleton, { className: "h-4 w-24" }), _jsx(Skeleton, { className: "h-6 w-48" }), _jsx(Skeleton, { className: "h-3 w-full" }), _jsx(Skeleton, { className: "h-3 w-2/3" }), _jsxs("div", { className: "flex gap-2", children: [_jsx(Skeleton, { className: "h-6 w-16" }), _jsx(Skeleton, { className: "h-6 w-20" })] })] }));
}
