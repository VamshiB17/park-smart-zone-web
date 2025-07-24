import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageLayout } from '@/components/layout/PageLayout';
import { LoginForm } from '@/components/auth/LoginForm';
import { SignupForm } from '@/components/auth/SignupForm';
import { useAuth } from '@/contexts/AuthContext';

export default function Auth() {
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  
  // Redirect if already logged in
  useEffect(() => {
    if (currentUser) {
      if (currentUser.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/dashboard');
      }
    }
  }, [currentUser, navigate]);
  
  if (currentUser) {
    return null; // Prevent flash while redirecting
  }
  
  return (
    <PageLayout>
      <div className="max-w-md mx-auto py-12">
        <h1 className="text-3xl font-bold text-center mb-8">Welcome to ParkSmart</h1>
        
        <div className="bg-card rounded-lg shadow-md overflow-hidden border">
          <div className="flex border-b">
            <button
              className={`flex-1 py-4 font-medium transition-colors ${
                activeTab === 'login' 
                  ? 'text-primary border-b-2 border-primary bg-primary/5' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              onClick={() => setActiveTab('login')}
            >
              Login
            </button>
            <button
              className={`flex-1 py-4 font-medium transition-colors ${
                activeTab === 'signup' 
                  ? 'text-primary border-b-2 border-primary bg-primary/5' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              onClick={() => setActiveTab('signup')}
            >
              Sign Up
            </button>
          </div>
          
          <div className="p-6">
            {activeTab === 'login' ? <LoginForm /> : <SignupForm />}
            
            <div className="mt-6 text-center text-sm text-muted-foreground">
              <p>
                {activeTab === 'login' ? (
                  <>
                    Don't have an account?{' '}
                    <button 
                      className="text-primary hover:underline font-medium"
                      onClick={() => setActiveTab('signup')}
                    >
                      Sign Up
                    </button>
                  </>
                ) : (
                  <>
                    Already have an account?{' '}
                    <button 
                      className="text-primary hover:underline font-medium"
                      onClick={() => setActiveTab('login')}
                    >
                      Login
                    </button>
                  </>
                )}
              </p>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}