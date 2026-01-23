import { ReactNode, useMemo, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Briefcase, Building2Icon, LayoutDashboard, User2, UserRoundSearch, Wallet, LogIn, LogOut } from 'lucide-react';
import { cn } from '../lib/utils';
import { Role } from './RoleSwitch';
import { Button } from './ui/button';
import { Modal } from './ui/modal';
import { Toast } from './ui/toast';
import { useAuth } from '../contexts/AuthContext';

export function TopNav() {
  const { userRole, signOut, user, openAuthModal } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [showSignOutConfirm, setShowSignOutConfirm] = useState(false);
  const [showSignOutToast, setShowSignOutToast] = useState(false);

  const activeRole = useMemo<Role>(() => {
    const path = location.pathname;
    if (path.startsWith('/admin')) return 'admin';
    if (path.startsWith('/employer') || path.startsWith('/employers')) return 'employer';
    // If on a shared route like /messages, fallback to the user's actual role
    if (path.startsWith('/messages') && userRole) return userRole as Role;
    return 'seeker';
  }, [location.pathname, userRole]);

  const navLinks = useMemo(() => {
    if (activeRole === 'employer') {
      return [
        { to: '/employers', label: 'Employers Home', icon: <UserRoundSearch className="h-4 w-4" /> },
        { to: '/employer/dashboard', label: 'Dashboard', icon: <LayoutDashboard className="h-4 w-4" /> },
        { to: '/employer/post-job', label: 'Post Job', icon: <Briefcase className="h-4 w-4" /> },
        { to: '/employer/applicants', label: 'Applicants', icon: <User2 className="h-4 w-4" /> },
        { to: '/employer/organization', label: 'Organization', icon: <Building2Icon className="h-4 w-4" /> },
        // { to: '/employer/dashboard#wallet', label: 'Wallet', icon: <Wallet className="h-4 w-4" /> }
      ];
    }
    if (activeRole === 'admin') {
      return [{ to: '/admin', label: 'Admin Console' }];
    }
    return [
      { to: '/seekers', label: 'Seekers Home', icon: <User2 className="h-4 w-4" />, end: true },
      { to: '/jobs', label: 'Jobs', icon: <Briefcase className="h-4 w-4" /> },
      { to: '/seekers/dashboard', label: 'Seekers Dashboard', icon: <LayoutDashboard className="h-4 w-4" /> }
    ];
  }, [activeRole]);

  const handleSignOutClick = () => {
    setShowSignOutConfirm(true);
  };

  const handleConfirmSignOut = async () => {
    await signOut();
    setShowSignOutConfirm(false);
    setShowSignOutToast(true);
    navigate('/seekers', { replace: true });
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-white/40 shadow-sm">
        <div className="container-wide flex items-center justify-between py-4">
          <Link to="/" className="flex items-center gap-3">
            <img
              src="/Mr_Bur_Logo.png"
              alt="MR.BUR Dental Jobs logo"
              className="h-10 w-auto object-contain"
              loading="lazy"
            />
          </Link>

          <nav className="hidden items-center gap-2 text-sm font-medium text-gray-700 lg:flex">
            {navLinks.map((link) => (
              <NavItem key={link.to} to={link.to} label={link.label} icon={link.icon} end={(link as any).end} />
            ))}
          </nav>

          <div className="flex items-center gap-3">
            {activeRole !== 'admin' && (
              <Link
                to={activeRole === 'employer' ? '/seekers' : '/employers'}
                className="inline-flex items-center gap-2 rounded-full border border-brand/20 bg-white px-4 py-2 text-sm font-semibold text-brand shadow-sm transition hover:-translate-y-0.5 hover:bg-brand/10"
              >
                {activeRole === 'employer' ? "I'm a seeker" : "I'm an employer"}
              </Link>
            )}
            {activeRole === 'employer' ? (
              <Link
                to="/employer/post-job"
                className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-brand to-brand-hover px-4 py-2.5 text-sm font-semibold text-white shadow-md transition hover:-translate-y-0.5"
              >
                Post a Job
              </Link>
            ) : (
              <Link
                to="/jobs"
                className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-brand to-brand-hover px-4 py-2.5 text-sm font-semibold text-white shadow-md transition hover:-translate-y-0.5"
              >
                <Briefcase className="h-4 w-4" />
                Browse Jobs
              </Link>
            )}
            {user && (
              <button
                className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 bg-gray-100 text-sm font-bold text-gray-600 shadow-sm transition-opacity hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-brand/20"
                onClick={() => {
                  if (activeRole === 'employer') {
                    navigate('/employer/profile');
                  } else if (activeRole === 'seeker') {
                    navigate('/seekers/dashboard');
                  }
                }}
                title="Your Profile"
              >
                {/* Simplistic initial - could use user.email or user metadata if available */}
                {user.email?.charAt(0).toUpperCase() || 'U'}
              </button>
            )}
            {user ? (
              <button
                className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 bg-gray-100 text-sm font-bold text-gray-600 shadow-sm transition-opacity hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-brand/20"
                onClick={handleSignOutClick}
                title="Sign out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            ) : (
              <button
                className="flex h-9 items-center justify-center gap-2 rounded-full border border-gray-200 bg-gray-100 px-4 text-sm font-bold text-gray-600 shadow-sm transition-opacity hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-brand/20"
                onClick={() => openAuthModal('login')}
                title="Sign in"
              >
                <LogIn className="h-4 w-4" />
                <span>Sign In</span>
              </button>
            )}
          </div>
        </div>
      </header>

      <Modal
        open={showSignOutConfirm}
        onClose={() => setShowSignOutConfirm(false)}
        title="Sign Out Assessment"
        maxWidth="max-w-sm"
      >
        <div className="flex flex-col gap-4">
          <p className="text-gray-600">Are you sure you want to sign out of your account?</p>
          <div className="flex justify-end gap-3">
            <Button variant="ghost" onClick={() => setShowSignOutConfirm(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleConfirmSignOut}
              className="bg-red-600 hover:bg-red-700 border-red-600 from-red-600 to-red-700"
            >
              Sign Out
            </Button>
          </div>
        </div>
      </Modal>

      <Toast
        open={showSignOutToast}
        onClose={() => setShowSignOutToast(false)}
        title="Signed out"
        description="You have been signed out successfully."
        variant="success"
      />
    </>
  );
}

function NavItem({ to, label, icon, end }: { to: string; label: string; icon?: ReactNode; end?: boolean }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        cn(
          'flex items-center gap-2 rounded-full px-4 py-2 transition hover:bg-brand/10 hover:text-brand',
          isActive && 'bg-brand/10 text-brand font-semibold'
        )
      }
    >
      {icon}
      {label}
    </NavLink>
  );
}
