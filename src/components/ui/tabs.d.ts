export interface TabItem {
    id: string;
    label: string;
}
interface TabsProps {
    tabs: TabItem[];
    active: string;
    onChange: (id: string) => void;
    className?: string;
}
export declare function Tabs({ tabs, active, onChange, className }: TabsProps): import("react/jsx-runtime").JSX.Element;
export {};
