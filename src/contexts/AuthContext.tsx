import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import type { Database } from '../lib/database.types';

type UserRole = Database['public']['Enums']['user_role'];

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  userRole: UserRole | null;
  signUp: (email: string, password: string, fullName: string, role: UserRole, metadata?: Record<string, any>) => Promise<{ error: AuthError | null }>;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: { full_name?: string; phone?: string; avatar_url?: string }) => Promise<{ error: Error | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<UserRole | null>(null);

  useEffect(() => {
    let isMounted = true;

    const handleSessionUpdate = async (sessionData: Session | null) => {
      if (!isMounted) return;

      setSession(sessionData);
      setUser(sessionData?.user ?? null);

      try {
        if (sessionData?.user) {
          const metadataRole = sessionData.user.user_metadata?.role as UserRole | undefined;
          if (metadataRole) {
            setUserRole(metadataRole);
          } else {
            const loadedRole = await loadUserRole(sessionData.user.id);
            if (isMounted) {
              setUserRole(loadedRole);
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

      if (error) {
        console.error('Error loading user role:', error);
        return null;
      }

      return data?.role ?? null;
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
        return { error: authError };
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
          return { error: profileError as any };
        }

        const { error: roleError } = await supabase.from('user_roles').insert({
          user_id: authData.user.id,
          role,
        });

        if (roleError) {
          console.error('Error creating user role:', roleError);
          return { error: roleError as any };
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

        if (role === 'employer' && metadata?.employerData) {
          const { error: orgError } = await supabase.from('organizations').insert({
            owner_user_id: authData.user.id,
            org_name: metadata.employerData.clinicName,
            city: metadata.employerData.city,
            country: metadata.employerData.country || 'Malaysia',
            org_type: 'clinic',
          });

          if (orgError) {
            console.error('Error creating organization:', orgError);
          }
        }
      }

      return { error: null };
    } catch (error) {
      console.error('Error signing up:', error);
      return { error: error as AuthError };
    }
  }

  async function signIn(email: string, password: string) {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    return { error };
  }

  async function signOut() {
    await supabase.auth.signOut();
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

  const value = {
    user,
    session,
    loading,
    userRole,
    signUp,
    signIn,
    signOut,
    updateProfile,
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
