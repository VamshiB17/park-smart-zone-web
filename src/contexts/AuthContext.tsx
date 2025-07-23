
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

interface AuthContextType {
  currentUser: User | null;
  login: (email: string, password: string) => Promise<User>;
  logout: () => void;
  signup: (email: string, password: string, name: string) => Promise<User>;
  isAdmin: boolean;
  session: Session | null;
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
              role: profile.is_admin ? 'admin' : 'user'
            };
            setCurrentUser(user);
            setIsAdmin(profile.is_admin);
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
                role: profile.is_admin ? 'admin' : 'user'
              };
              setCurrentUser(user);
              setIsAdmin(profile.is_admin);
            }
          });
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string): Promise<User> => {
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

    // The user will be set by the auth state change listener
    // Return a temporary user object
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', data.user.id)
      .single();

    if (!profile) {
      throw new Error('User profile not found');
    }

    const user: User = {
      id: profile.id,
      email: profile.email || data.user.email || '',
      name: profile.name || 'User',
      role: profile.is_admin ? 'admin' : 'user'
    };

    return user;
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

    // Create user profile
    const { error: profileError } = await supabase
      .from('user_profiles')
      .insert({
        id: data.user.id,
        name: name,
        email: email,
        is_admin: false
      });

    if (profileError) {
      console.error('Error creating profile:', profileError);
    }

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
    logout,
    signup,
    isAdmin,
    session,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
