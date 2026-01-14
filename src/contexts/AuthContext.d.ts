import { ReactNode } from 'react';
import { User, Session, AuthError } from '@supabase/supabase-js';
import type { Database } from '../lib/database.types';
type UserRole = Database['public']['Enums']['user_role'];
type AuthModalMode = 'login' | 'register';
interface AuthContextType {
    user: User | null;
    session: Session | null;
    loading: boolean;
    userRole: UserRole | null;
    signUp: (email: string, password: string, fullName: string, role: UserRole, metadata?: Record<string, any>) => Promise<{
        error: AuthError | null;
        role: UserRole;
    }>;
    signIn: (email: string, password: string) => Promise<{
        error: AuthError | null;
        role: UserRole | null;
    }>;
    signOut: () => Promise<void>;
    updateProfile: (updates: {
        full_name?: string;
        phone?: string;
        avatar_url?: string;
    }) => Promise<{
        error: Error | null;
    }>;
    authModalOpen: boolean;
    authModalMode: AuthModalMode;
    authModalRedirectPath: string | null;
    openAuthModal: (mode?: AuthModalMode, redirectTo?: string | null) => void;
    closeAuthModal: () => void;
}
export declare function AuthProvider({ children }: {
    children: ReactNode;
}): import("react/jsx-runtime").JSX.Element;
export declare function useAuth(): AuthContextType;
export {};
