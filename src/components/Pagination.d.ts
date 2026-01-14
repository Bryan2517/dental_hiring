interface PaginationProps {
    page: number;
    totalPages: number;
    onChange: (page: number) => void;
}
export declare function Pagination({ page, totalPages, onChange }: PaginationProps): import("react/jsx-runtime").JSX.Element;
export {};
