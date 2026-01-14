interface Step {
    id: string;
    title: string;
    description?: string;
}
interface StepperProps {
    steps: Step[];
    activeStep: number;
}
export declare function Stepper({ steps, activeStep }: StepperProps): import("react/jsx-runtime").JSX.Element;
export {};
