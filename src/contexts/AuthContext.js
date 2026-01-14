import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
const AuthContext = createContext(undefined);
export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [session, setSession] = useState(null);
    const [loading, setLoading] = useState(true);
    const [userRole, setUserRole] = useState(null);
    const [authModalOpen, setAuthModalOpen] = useState(false);
    const [authModalMode, setAuthModalMode] = useState('login');
    const [authModalRedirectPath, setAuthModalRedirectPath] = useState(null);
    useEffect(() => {
        let isMounted = true;
        const handleSessionUpdate = async (sessionData) => {
            if (!isMounted)
                return;
            setSession(sessionData);
            setUser(sessionData?.user ?? null);
            try {
                if (sessionData?.user) {
                    const metadataRole = sessionData.user.user_metadata?.role;
                    if (metadataRole) {
                        setUserRole(metadataRole);
                    }
                    else {
                        const loadedRole = await loadUserRole(sessionData.user.id);
                        if (isMounted) {
                            setUserRole(loadedRole);
                        }
                    }
                }
                else {
                    setUserRole(null);
                }
            }
            catch (error) {
                console.error('Error handling auth state change:', error);
                if (isMounted) {
                    setUserRole(null);
                }
            }
            finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };
        async function initializeSession() {
            try {
                const { data: { session: initialSession }, } = await supabase.auth.getSession();
                await handleSessionUpdate(initialSession);
            }
            catch (error) {
                console.error('Error initializing auth session:', error);
                if (isMounted) {
                    setLoading(false);
                }
            }
        }
        initializeSession();
        const { data: { subscription }, } = supabase.auth.onAuthStateChange(async (_event, sessionData) => {
            await handleSessionUpdate(sessionData);
        });
        return () => {
            isMounted = false;
            subscription.unsubscribe();
        };
    }, []);
    async function loadUserRole(userId) {
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
        }
        catch (error) {
            console.error('Error loading user role:', error);
            return null;
        }
    }
    async function signUp(email, password, fullName, role, metadata) {
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
                return { error: authError, role };
            }
            if (authData.user) {
                const phone = metadata?.phone || null;
                const { error: profileError } = await supabase
                    .from('profiles')
                    .upsert({
                    id: authData.user.id,
                    full_name: fullName,
                    phone: phone,
                }, {
                    onConflict: 'id',
                });
                if (profileError) {
                    console.error('Error creating profile:', profileError);
                    return { error: profileError, role };
                }
                const { error: roleError } = await supabase.from('user_roles').insert({
                    user_id: authData.user.id,
                    role,
                });
                if (roleError) {
                    console.error('Error creating user role:', roleError);
                    return { error: roleError, role };
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
            setUserRole(role);
            return { error: null, role };
        }
        catch (error) {
            console.error('Error signing up:', error);
            return { error: error, role };
        }
    }
    async function signIn(email, password) {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });
        let role = null;
        if (data.user) {
            role = await loadUserRole(data.user.id);
            setUserRole(role);
        }
        return { error, role };
    }
    async function signOut() {
        try {
            await supabase.auth.signOut();
        }
        catch (error) {
            console.error('Error signing out:', error);
        }
        finally {
            setUser(null);
            setSession(null);
            setUserRole(null);
            setLoading(false);
        }
    }
    async function updateProfile(updates) {
        if (!user) {
            return { error: new Error('No user logged in') };
        }
        const { error } = await supabase
            .from('profiles')
            .update(updates)
            .eq('id', user.id);
        return { error };
    }
    const openAuthModal = (mode = 'login', redirectTo) => {
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
    return _jsx(AuthContext.Provider, { value: value, children: children });
}
export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
