import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
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

  if (session === null) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="text-lg font-semibold text-gray-900">Please Sign In...</div>
          <div className="text-sm text-gray-600 mt-1">or Sign UP</div>
        </div>
      </div>
    );
  }

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

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="max-w-md rounded-2xl border border-gray-100 bg-white p-6 text-center shadow-sm">
          <p className="text-lg font-semibold text-gray-900">Authentication required</p>
          <p className="mt-2 text-sm text-gray-600">
            Sign in or create an account to continue to this section.
          </p>
          <Button
            variant="primary"
            className="mt-4"
            onClick={() => openAuthModal('login', location.pathname)}
          >
            Sign in / create account
          </Button>
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
