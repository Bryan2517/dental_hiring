export interface JobFilterState {
    keyword: string;
    location: string;
    specialty: string;
    employmentType: string;
    shiftType: string;
    newGrad: boolean;
    training: boolean;
    internship: boolean;
    experienceLevel: string;
    salaryMin: number;
}
interface JobFiltersProps {
    values: JobFilterState;
    onChange: (values: JobFilterState) => void;
    onReset: () => void;
    sortBy?: string;
    onSortChange?: (value: string) => void;
    compact?: boolean;
}
export declare function JobFilters({ values, onChange, onReset, sortBy, onSortChange, compact }: JobFiltersProps): import("react/jsx-runtime").JSX.Element;
export {};
