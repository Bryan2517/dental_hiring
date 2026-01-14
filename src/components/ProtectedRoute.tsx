import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Lock } from 'lucide-react';
import { Button } from './ui/button';
import { useAuth } from '../contexts/AuthContext';
import type { Database } from '../lib/database.types';

type UserRole = Database['public']['Enums']['user_role'];

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: UserRole;
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { user, loading, userRole, session, openAuthModal } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="text-lg font-semibold text-gray-900">Loading...</div>
          <div className="text-sm text-gray-600 mt-1">Please wait</div>
        </div>
      </div>
    );
  }

  if (session === null && !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50/50 px-4">
        <div className="w-full max-w-md space-y-6 rounded-2xl border border-gray-100 bg-white p-8 text-center shadow-xl shadow-brand/5 transition-all">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-brand/10 ring-8 ring-brand/5">
            <Lock className="h-8 w-8 text-brand" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-bold tracking-tight text-gray-900">
              Authentication Required
            </h2>
            <p className="text-gray-500">
              Please sign in or create an account to access this section of the platform.
            </p>
          </div>

          <div className="pt-2">
            <Button
              variant="primary"
              className="w-full justify-center py-6 text-base"
              onClick={() => openAuthModal('login', location.pathname)}
            >
              Sign in / Create Account
            </Button>
            <p className="mt-4 text-xs text-gray-400">
              MR.BUR Dental Jobs • Secure Access
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (requiredRole && userRole !== requiredRole) {
    if (userRole === 'employer') {
      return <Navigate to="/employer/dashboard" replace />;
    }
    if (userRole === 'seeker') {
      return <Navigate to="/student/profile" replace />;
    }
    return <Navigate to="/jobs" replace />;
  }

  return <>{children}</>;
}
