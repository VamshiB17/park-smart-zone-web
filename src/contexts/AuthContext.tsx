
import React, { createContext, useContext, useState, useEffect } from 'react';

// Define user types
export type UserRole = 'user' | 'admin';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

// Mock users for demo purposes
const MOCK_USERS = [
  {
    id: '1',
    email: 'user@example.com',
    password: 'password123',
    name: 'John Doe',
    role: 'user' as UserRole,
  },
  {
    id: '2',
    email: 'admin@example.com',
    password: 'admin123',
    name: 'Admin User',
    role: 'admin' as UserRole,
  },
];

interface AuthContextType {
  currentUser: User | null;
  login: (email: string, password: string) => Promise<User>;
  logout: () => void;
  signup: (email: string, password: string, name: string) => Promise<User>;
  isAdmin: boolean;
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
  const [isAdmin, setIsAdmin] = useState<boolean>(false);

  // Check for saved user in localStorage on initial load
  useEffect(() => {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      const user = JSON.parse(savedUser);
      setCurrentUser(user);
      setIsAdmin(user.role === 'admin');
    }
  }, []);

  const login = async (email: string, password: string): Promise<User> => {
    // In a real app, this would be an API call to your backend
    const user = MOCK_USERS.find(
      (u) => u.email === email && u.password === password
    );

    if (!user) {
      throw new Error('Invalid email or password');
    }

    const { password: _, ...userWithoutPassword } = user;
    setCurrentUser(userWithoutPassword);
    setIsAdmin(userWithoutPassword.role === 'admin');
    
    // Save user to localStorage
    localStorage.setItem('currentUser', JSON.stringify(userWithoutPassword));
    
    return userWithoutPassword;
  };

  const logout = () => {
    setCurrentUser(null);
    setIsAdmin(false);
    localStorage.removeItem('currentUser');
  };

  const signup = async (email: string, password: string, name: string): Promise<User> => {
    // Check if user already exists
    const existingUser = MOCK_USERS.find((u) => u.email === email);
    if (existingUser) {
      throw new Error('User already exists with this email');
    }

    // Create a new user (in a real app, this would be an API call)
    const newUser = {
      id: `user-${Date.now()}`,
      email,
      password,
      name,
      role: 'user' as UserRole,
    };

    // In a real app, we would save this user to a database
    MOCK_USERS.push(newUser);

    const { password: _, ...userWithoutPassword } = newUser;
    setCurrentUser(userWithoutPassword);
    
    // Save user to localStorage
    localStorage.setItem('currentUser', JSON.stringify(userWithoutPassword));
    
    return userWithoutPassword;
  };

  const value = {
    currentUser,
    login,
    logout,
    signup,
    isAdmin,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
