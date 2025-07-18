
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { UserProfile } from '@/types';
import { toast } from 'sonner';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'admin';
}

interface AuthContextType {
  currentUser: AuthUser | null;
  session: Session | null;
  login: (email: string, password: string) => Promise<AuthUser>;
  logout: () => void;
  signup: (email: string, password: string, name: string) => Promise<AuthUser>;
  resetPassword: (email: string) => Promise<void>;
  isAdmin: boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);

  // Initialize auth state
  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        
        if (session?.user) {
          // Fetch user profile to get additional data
          const { data: profile, error } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

          if (!error && profile) {
            const authUser: AuthUser = {
              id: profile.id,
              email: profile.email || session.user.email || '',
              name: profile.name || 'User',
              role: profile.is_admin ? 'admin' : 'user'
            };
            setCurrentUser(authUser);
            setIsAdmin(profile.is_admin);
          } else {
            setCurrentUser(null);
            setIsAdmin(false);
          }
        } else {
          setCurrentUser(null);
          setIsAdmin(false);
        }
        setLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string): Promise<AuthUser> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (!data.user) {
        throw new Error('Login failed');
      }

      // Fetch user profile
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();

      if (profileError) {
        throw new Error('Failed to fetch user profile');
      }

      const authUser: AuthUser = {
        id: profile.id,
        email: profile.email || data.user.email || '',
        name: profile.name || 'User',
        role: profile.is_admin ? 'admin' : 'user'
      };

      return authUser;
    } catch (error: any) {
      throw new Error(error.message || 'Login failed');
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error: any) {
      toast.error('Logout failed');
    }
  };

  const signup = async (email: string, password: string, name: string): Promise<AuthUser> => {
    try {
      const redirectUrl = `${window.location.origin}/`;
      
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

      if (error) throw error;

      if (!data.user) {
        throw new Error('Signup failed');
      }

      // The user profile will be created automatically by the trigger
      // But we need to wait for it to be available
      let profile = null;
      let attempts = 0;
      while (!profile && attempts < 10) {
        const { data: profileData } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();
        
        if (profileData) {
          profile = profileData;
          break;
        }
        
        attempts++;
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      if (!profile) {
        throw new Error('Failed to create user profile');
      }

      const authUser: AuthUser = {
        id: profile.id,
        email: profile.email || data.user.email || '',
        name: profile.name || name,
        role: profile.is_admin ? 'admin' : 'user'
      };

      return authUser;
    } catch (error: any) {
      throw new Error(error.message || 'Signup failed');
    }
  };

  const resetPassword = async (email: string): Promise<void> => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth?mode=reset-password`,
      });
      
      if (error) {
        throw new Error(error.message);
      }
    } catch (error) {
      console.error('Password reset error:', error);
      throw error;
    }
  };

  const value = {
    currentUser,
    session,
    login,
    logout,
    signup,
    resetPassword,
    isAdmin,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
