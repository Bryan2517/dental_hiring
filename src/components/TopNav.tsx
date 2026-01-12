import { ReactNode, useMemo } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Briefcase, LayoutDashboard, User2, Wallet } from 'lucide-react';
import { cn } from '../lib/utils';
import { Role } from './RoleSwitch';
import { Button } from './ui/button';
import { useAuth } from '../contexts/AuthContext';

export function TopNav() {
  const location = useLocation();
  const activeRole = useMemo<Role>(() => {
    const path = location.pathname;
    if (path.startsWith('/admin')) return 'admin';
    if (path.startsWith('/employer') || path.startsWith('/employers')) return 'employer';
    return 'seeker';
  }, [location.pathname]);

  const navLinks = useMemo(() => {
    if (activeRole === 'employer') {
      return [
        { to: '/employers', label: 'Employers Home', icon: <Briefcase className="h-4 w-4" /> },
        { to: '/employer/dashboard', label: 'Dashboard', icon: <LayoutDashboard className="h-4 w-4" /> },
        { to: '/employer/post-job', label: 'Post Job' },
        { to: '/employer/applicants', label: 'Applicants' },
        { to: '/employer/dashboard#wallet', label: 'Wallet', icon: <Wallet className="h-4 w-4" /> }
      ];
    }
    if (activeRole === 'admin') {
      return [{ to: '/admin', label: 'Admin Console' }];
    }
    return [
      { to: '/seekers', label: 'Seekers Home', icon: <User2 className="h-4 w-4" /> },
      { to: '/jobs', label: 'Jobs', icon: <Briefcase className="h-4 w-4" /> },
      { to: '/student/profile', label: 'Student Dashboard', icon: <LayoutDashboard className="h-4 w-4" /> }
    ];
  }, [activeRole]);

  const { signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/login', { replace: true });
  };

  return (
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
            <NavItem key={link.to} to={link.to} label={link.label} icon={link.icon} />
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
            <>
              <Button variant="ghost" size="sm" onClick={handleSignOut}>
                Sign out
              </Button>
              <Link
                to="/employer/post-job"
                className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-brand to-brand-hover px-4 py-2.5 text-sm font-semibold text-white shadow-md transition hover:-translate-y-0.5"
              >
                Post a Job
              </Link>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" onClick={handleSignOut}>
                Sign out
              </Button>
              <Link
                to="/jobs"
                className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-brand to-brand-hover px-4 py-2.5 text-sm font-semibold text-white shadow-md transition hover:-translate-y-0.5"
              >
                <Briefcase className="h-4 w-4" />
                Browse Jobs
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

function NavItem({ to, label, icon }: { to: string; label: string; icon?: ReactNode }) {
  return (
    <NavLink
      to={to}
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
