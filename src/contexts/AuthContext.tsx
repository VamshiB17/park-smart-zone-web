
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User as SupabaseUser, Session } from '@supabase/supabase-js';
import { toast } from 'sonner';

// Define user types
export type UserRole = 'user' | 'admin';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

export interface AuthContextType {
  currentUser: User | null;
  login: (email: string, password: string, selectedRole?: UserRole) => Promise<User>;
  loginWithGoogle: () => Promise<void>;
  logout: () => void;
  signup: (email: string, password: string, name: string) => Promise<User>;
  isAdmin: boolean;
  session: Session | null;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);

  const fetchUserProfile = async (userId: string, session: Session): Promise<User | null> => {
    try {
      const { data: profile, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) {
        console.error('Profile fetch error:', error);
        toast.error('Failed to load user profile. Please try again.');
        return null;
      }
      
      if (profile) {
        const user: User = {
          id: profile.id,
          email: profile.email || session.user.email || '',
          name: profile.name || 'User',
          role: (profile.role || (profile.is_admin ? 'admin' : 'user')) as UserRole
        };
        return user;
      }
      
      return null;
    } catch (error) {
      console.error('Profile fetch error:', error);
      toast.error('Failed to load user profile. Please try again.');
      return null;
    }
  };

  useEffect(() => {
    let isMounted = true;

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!isMounted) return;
        
        setSession(session);
        
        if (session?.user) {
          const user = await fetchUserProfile(session.user.id, session);
          if (user && isMounted) {
            setCurrentUser(user);
            setIsAdmin(user.role === 'admin');

            // Handle role-based redirection for OAuth (Google) login
            if (event === 'SIGNED_IN' && window.location.pathname === '/auth') {
              if (user.role === 'admin') {
                window.location.href = '/admin/dashboard';
              } else {
                window.location.href = '/dashboard';
              }
            }
          }
        } else {
          if (isMounted) {
            setCurrentUser(null);
            setIsAdmin(false);
          }
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!isMounted) return;
      
      if (session?.user) {
        const user = await fetchUserProfile(session.user.id, session);
        if (user && isMounted) {
          setCurrentUser(user);
          setIsAdmin(user.role === 'admin');
          setSession(session);
        }
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string, selectedRole?: UserRole): Promise<User> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw new Error(error.message);
      }

      if (!data.user) {
        throw new Error('Login failed');
      }

      // Fetch user profile to validate role
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();

      if (profileError || !profile) {
        throw new Error('User profile not found. Please contact support.');
      }

      const userRole = (profile.role || (profile.is_admin ? 'admin' : 'user')) as UserRole;

      // Validate selected role against database role
      if (selectedRole && selectedRole !== userRole) {
        // Sign out the user before throwing error
        await supabase.auth.signOut();
        throw new Error(`You are not authorized to log in as ${selectedRole === 'admin' ? 'Admin' : 'User'}.`);
      }

      const user: User = {
        id: profile.id,
        email: profile.email || data.user.email || '',
        name: profile.name || 'User',
        role: userRole
      };

      return user;
    } catch (error) {
      // Ensure user is signed out on any error
      await supabase.auth.signOut();
      throw error;
    }
  };

  const loginWithGoogle = async (): Promise<void> => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    });

    if (error) {
      throw new Error(error.message);
    }
  };

  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error('Error signing out');
    } else {
      setCurrentUser(null);
      setSession(null);
      setIsAdmin(false);
    }
  };

  const signup = async (email: string, password: string, name: string): Promise<User> => {
    const redirectUrl = `${window.location.origin}/auth/callback`;
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          name: name
        }
      }
    });

    if (error) {
      throw new Error(error.message);
    }

    if (!data.user) {
      throw new Error('Signup failed');
    }

    // Poll for profile creation instead of using fixed delay
    let retries = 0;
    const maxRetries = 10;
    let profile = null;
    
    while (retries < maxRetries && !profile) {
      try {
        const { data: profileData } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();
        
        if (profileData) {
          profile = profileData;
          break;
        }
      } catch (error) {
        // Profile not ready yet, wait and retry
      }
      
      await new Promise(resolve => setTimeout(resolve, 200));
      retries++;
    }

    if (!profile) {
      throw new Error('Account created but profile setup failed. Please try logging in.');
    }

    const user: User = {
      id: profile.id,
      email: profile.email || email,
      name: profile.name || name,
      role: profile.role || 'user'
    };

    return user;
  };

  const value = {
    currentUser,
    login,
    loginWithGoogle,
    logout,
    signup,
    isAdmin,
    session,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
