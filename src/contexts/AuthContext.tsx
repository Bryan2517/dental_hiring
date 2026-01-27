import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import type { Database } from '../lib/database.types';

type UserRole = Database['public']['Enums']['user_role'];
type AuthModalMode = 'login' | 'register';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  userRole: UserRole | null;
  signUp: (
    email: string,
    password: string,
    fullName: string,
    role: UserRole,
    metadata?: Record<string, any>
  ) => Promise<{ error: AuthError | null; role: UserRole }>;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null; role: UserRole | null }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: { full_name?: string; phone?: string; avatar_url?: string }) => Promise<{ error: Error | null }>;
  authModalOpen: boolean;
  authModalMode: AuthModalMode;
  authModalRedirectPath: string | null;
  openAuthModal: (mode?: AuthModalMode, redirectTo?: string | null) => void;
  closeAuthModal: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<AuthModalMode>('login');
  const [authModalRedirectPath, setAuthModalRedirectPath] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const handleSessionUpdate = async (sessionData: Session | null) => {
      if (!isMounted) return;

      setSession(sessionData);
      setUser(sessionData?.user ?? null);

      try {
        if (sessionData?.user) {
          // Hardcoded Admin Access
          if (sessionData.user.email === 'admin@mrbur.com') {
            setUserRole('admin');
          } else {
            const metadataRole = sessionData.user.user_metadata?.role as UserRole | undefined;
            if (metadataRole) {
              // Prevent others from being admin via metadata
              setUserRole(metadataRole === 'admin' ? 'employer' : metadataRole);
            } else {
              const loadedRole = await loadUserRole(sessionData.user.id);
              if (isMounted) {
                // loadUserRole internal logic should also handle it, but double check
                setUserRole(loadedRole === 'admin' ? 'employer' : loadedRole);
              }
            }
          }
        } else {
          setUserRole(null);
        }
      } catch (error) {
        console.error('Error handling auth state change:', error);
        if (isMounted) {
          setUserRole(null);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    async function initializeSession() {
      try {
        const {
          data: { session: initialSession },
        } = await supabase.auth.getSession();
        await handleSessionUpdate(initialSession);
      } catch (error) {
        console.error('Error initializing auth session:', error);
        // Force sign out to clear invalid tokens/state
        await supabase.auth.signOut();
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    initializeSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, sessionData) => {
      await handleSessionUpdate(sessionData);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  async function loadUserRole(userId: string): Promise<UserRole | null> {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .maybeSingle();

      const { data: userData } = await supabase.auth.getUser();
      if (userData.user?.id === userId && userData.user?.email === 'admin@mrbur.com') {
        return 'admin';
      }

      if (error) {
        console.error('Error loading user role:', error);
        return null;
      }

      const role = data?.role ?? null;
      // Double auth check: if DB says admin but not the right email, return null/employer
      if (role === 'admin') {
        // We can't easily check email again here without fetching user if not fetched above
        // But we did fetch user above for the happy path. 
        // If we are here, it means email is NOT admin@mrbur.com
        return 'employer';
      }

      return role;
    } catch (error) {
      console.error('Error loading user role:', error);
      return null;
    }
  }

  async function signUp(
    email: string,
    password: string,
    fullName: string,
    role: UserRole,
    metadata?: Record<string, any>
  ) {
    try {
      // 1. Block Admin Registration via public form
      if (role === 'admin' || email === 'admin@mrbur.com') {
        // Security: Refuse to create admin via this path
        return { error: { message: 'Admin account creation is restricted.' } as AuthError, role };
      }

      const authMetadata = {
        ...(metadata ?? {}),
        role,
      };

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            ...authMetadata,
          },
        },
      });

      if (authError) {
        return { error: authError, role };
      }

      if (authData.user) {
        const phone = metadata?.phone || null;
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert(
            {
              id: authData.user.id,
              full_name: fullName,
              phone: phone,
            },
            {
              onConflict: 'id',
            }
          );

        if (profileError) {
          console.error('Error creating profile:', profileError);
          return { error: profileError as any, role };
        }

        const { error: roleError } = await supabase.from('user_roles').insert({
          user_id: authData.user.id,
          role,
        });

        if (roleError) {
          console.error('Error creating user role:', roleError);
          return { error: roleError as any, role };
        }

        if (role === 'seeker' && metadata?.seekerData) {
          const { error: seekerError } = await supabase.from('seeker_profiles').insert({
            user_id: authData.user.id,
            school_name: metadata.seekerData.school,
            expected_graduation_date: metadata.seekerData.graduationDate,
            seeker_type: metadata.seekerData.seekerType || 'student',
            primary_role: 'other',
          });

          if (seekerError) {
            console.error('Error creating seeker profile:', seekerError);
          }
        }

        if (role === 'employer') {
          // Organization creation is now decoupled from signup.
          // The user will create or join an organization from the dashboard.
        }
      }

      setUserRole(role);
      return { error: null, role };
    } catch (error) {
      console.error('Error signing up:', error);
      return { error: error as AuthError, role };
    }
  }

  async function signIn(email: string, password: string) {
    // 1. Hardcoded Admin Credential Check & Auto-provisioning
    if (email === 'admin@mrbur.com' && password === '123456') {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        // If login fails (likely doesn't exist), try to create it
        console.log("Admin account not found/login failed, attempting auto-provisioning...");
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: 'System Admin',
              role: 'admin'
            }
          }
        });

        if (signUpError) {
          // If error is because user already exists, it means password was wrong earlier
          if (signUpError.message && (signUpError.message.includes('registered') || signUpError.message.includes('exists'))) {
            return {
              error: { ...signUpError, message: 'Invalid Admin Credentials (account exists)' } as AuthError,
              role: null
            };
          }
          return { error: signUpError, role: null };
        }

        // If signup success, we might need to wait or it might be auto-confirmed (depending on Supabase settings).
        // If 'Email Confirmations' are on, this might stall. Assuming they are off or we can't bypass.
        // However, local dev usually has confirmations off or we handle it. 
        // Let's try to sign in again or use the session from signup if returned.

        if (signUpData.session) {
          // Determine role
          setUserRole('admin');
          return { error: null, role: 'admin' as UserRole };
        } else {
          // Started signup but no session (maybe verify email?)
          return { error: null, role: 'admin' as UserRole }; // Optimistic, or handle email verify
        }
      }

      // Login success
      setUserRole('admin');
      return { error: null, role: 'admin' as UserRole };
    }

    // Normal User Login
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    let role: UserRole | null = null;
    if (data.user) {
      if (data.user.email === 'admin@mrbur.com') {
        role = 'admin';
      } else {
        role = await loadUserRole(data.user.id);
        // Safety downgrade
        if (role === 'admin') role = 'employer';
      }
      setUserRole(role);
    }

    return { error, role };
  }

  async function signOut() {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    } finally {
      setUser(null);
      setSession(null);
      setUserRole(null);
      setLoading(false);
    }
  }

  async function updateProfile(updates: { full_name?: string; phone?: string; avatar_url?: string }) {
    if (!user) {
      return { error: new Error('No user logged in') };
    }

    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id);

    return { error };
  }

  const openAuthModal = (mode: AuthModalMode = 'login', redirectTo?: string | null) => {
    setAuthModalMode(mode);
    setAuthModalRedirectPath(redirectTo ?? null);
    setAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setAuthModalOpen(false);
    setAuthModalRedirectPath(null);
  };

  const value = {
    user,
    session,
    loading,
    userRole,
    signUp,
    signIn,
    signOut,
    updateProfile,
    authModalOpen,
    authModalMode,
    authModalRedirectPath,
    openAuthModal,
    closeAuthModal,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
