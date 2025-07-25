
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

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        
        if (session?.user) {
          // Fetch user profile
          const { data: profile } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
          
          if (profile) {
            const user: User = {
              id: profile.id,
              email: profile.email || session.user.email || '',
              name: profile.name || 'User',
              role: (profile.role || (profile.is_admin ? 'admin' : 'user')) as UserRole
            };
            setCurrentUser(user);
            setIsAdmin(profile.role === 'admin' || profile.is_admin);
          }
        } else {
          setCurrentUser(null);
          setIsAdmin(false);
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        supabase
          .from('user_profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()
          .then(({ data: profile }) => {
            if (profile) {
              const user: User = {
                id: profile.id,
                email: profile.email || session.user.email || '',
                name: profile.name || 'User',
                role: (profile.role || (profile.is_admin ? 'admin' : 'user')) as UserRole
              };
              setCurrentUser(user);
              setIsAdmin(profile.role === 'admin' || profile.is_admin);
            }
          });
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string, selectedRole?: UserRole): Promise<User> => {
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
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', data.user.id)
      .single();

    if (!profile) {
      throw new Error('User profile not found');
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
  };

  const loginWithGoogle = async (): Promise<void> => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/`
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

    if (error) {
      throw new Error(error.message);
    }

    if (!data.user) {
      throw new Error('Signup failed');
    }

    // The trigger will automatically create the user profile
    // Wait a moment for the trigger to execute
    await new Promise(resolve => setTimeout(resolve, 100));

    const user: User = {
      id: data.user.id,
      email: email,
      name: name,
      role: 'user'
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
