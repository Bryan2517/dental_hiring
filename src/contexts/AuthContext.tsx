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
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        loadUserRole(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        await loadUserRole(session.user.id);
      } else {
        setUserRole(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  async function loadUserRole(userId: string) {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .single();

      if (!error && data) {
        setUserRole(data.role);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error loading user role:', error);
      setLoading(false);
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
      // Sign up the user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            ...metadata,
          },
        },
      });

      if (authError) {
        return { error: authError };
      }

      if (authData.user) {
        // Use upsert to create or update profile (handles case where trigger creates it)
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

        // Create user role
        const { error: roleError } = await supabase.from('user_roles').insert({
          user_id: authData.user.id,
          role,
        });

        if (roleError) {
          console.error('Error creating user role:', roleError);
          return { error: roleError as any };
        }

        // If seeker, create seeker profile
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

        // If employer, create organization
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
