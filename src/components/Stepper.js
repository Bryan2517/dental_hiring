import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export function Stepper({ steps, activeStep }) {
    return (_jsxs("div", { className: "flex flex-col gap-3", children: [_jsx("div", { className: "grid gap-4 md:grid-cols-4", children: steps.map((step, index) => {
                    const isActive = index === activeStep;
                    const isCompleted = index < activeStep;
                    return (_jsx("div", { className: `rounded-xl border p-4 transition ${isActive
                            ? 'border-brand bg-brand/10'
                            : isCompleted
                                ? 'border-emerald-200 bg-emerald-50'
                                : 'border-gray-100 bg-white'}`, children: _jsxs("div", { className: "flex items-center gap-2 text-sm font-semibold text-gray-800", children: [_jsx("span", { className: `flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${isCompleted
                                        ? 'bg-emerald-500 text-white'
                                        : isActive
                                            ? 'bg-brand text-white'
                                            : 'bg-gray-100 text-gray-700'}`, children: index + 1 }), _jsxs("div", { children: [_jsx("p", { children: step.title }), step.description && _jsx("p", { className: "text-xs text-gray-600", children: step.description })] })] }) }, step.id));
                }) }), _jsx("div", { className: "h-1.5 w-full rounded-full bg-gray-100", children: _jsx("div", { className: "h-full rounded-full bg-brand transition-all", style: { width: `${((activeStep + 1) / steps.length) * 100}%` } }) })] }));
}
