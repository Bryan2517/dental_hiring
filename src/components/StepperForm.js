import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Stepper } from './Stepper';
export function StepperForm({ steps, activeStep, children }) {
    return (_jsxs("div", { className: "space-y-5", children: [_jsx(Stepper, { steps: steps, activeStep: activeStep }), _jsx("div", { className: "rounded-3xl border border-gray-100 bg-white/90 p-6 shadow-sm", children: children })] }));
}
