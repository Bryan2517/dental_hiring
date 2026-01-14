import { ReactNode } from 'react';
import type { Database } from '../lib/database.types';
type UserRole = Database['public']['Enums']['user_role'];
interface ProtectedRouteProps {
    children: ReactNode;
    requiredRole?: UserRole;
}
export declare function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps): import("react/jsx-runtime").JSX.Element;
export {};
