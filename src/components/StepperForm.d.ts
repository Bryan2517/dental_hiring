import { ReactNode } from 'react';
interface StepperFormProps {
    steps: Array<{
        id: string;
        title: string;
        description?: string;
    }>;
    activeStep: number;
    children: ReactNode;
}
export declare function StepperForm({ steps, activeStep, children }: StepperFormProps): import("react/jsx-runtime").JSX.Element;
export {};
