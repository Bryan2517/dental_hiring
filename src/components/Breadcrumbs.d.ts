interface Crumb {
    label: string;
    to?: string;
}
interface BreadcrumbsProps {
    items: Crumb[];
}
export declare function Breadcrumbs({ items }: BreadcrumbsProps): import("react/jsx-runtime").JSX.Element;
export {};
