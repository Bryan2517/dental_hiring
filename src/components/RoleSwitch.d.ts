export type Role = 'seeker' | 'employer' | 'admin';
interface RoleSwitchProps {
    value: Role;
    onChange: (role: Role) => void;
    className?: string;
}
export declare function RoleSwitch({ value, onChange, className }: RoleSwitchProps): import("react/jsx-runtime").JSX.Element;
export {};
