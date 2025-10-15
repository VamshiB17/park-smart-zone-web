
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageLayout } from '@/components/layout/PageLayout';
import { LoginForm } from '@/components/auth/LoginForm';
import { SignupForm } from '@/components/auth/SignupForm';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

export default function Auth() {
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');
  const { currentUser, loading } = useAuth();
  const navigate = useNavigate();
  
  // Redirect if already logged in
  React.useEffect(() => {
    if (!loading && currentUser) {
      if (currentUser.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/dashboard');
      }
    }
  }, [currentUser, loading, navigate]);

  if (loading) {
    return (
      <PageLayout>
        <div className="max-w-md mx-auto py-12 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </PageLayout>
    );
  }

  if (currentUser) {
    return null; // Will redirect via useEffect
  }
  
  return (
    <PageLayout>
      <div className="max-w-md mx-auto py-12">
        <h1 className="text-3xl font-bold text-center mb-8">Welcome to ParkSmart</h1>
        
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="flex border-b">
            <button
              className={`flex-1 py-4 font-medium ${
                activeTab === 'login' 
                  ? 'text-primary border-b-2 border-primary' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('login')}
            >
              Login
            </button>
            <button
              className={`flex-1 py-4 font-medium ${
                activeTab === 'signup' 
                  ? 'text-primary border-b-2 border-primary' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('signup')}
            >
              Sign Up
            </button>
          </div>
          
          <div className="p-6">
            {activeTab === 'login' ? <LoginForm /> : <SignupForm />}
            
            <div className="mt-6 text-center text-sm text-gray-500">
              <p>
                {activeTab === 'login' ? (
                  <>
                    Don't have an account?{' '}
                    <button 
                      className="text-primary hover:underline"
                      onClick={() => setActiveTab('signup')}
                    >
                      Sign Up
                    </button>
                  </>
                ) : (
                  <>
                    Already have an account?{' '}
                    <button 
                      className="text-primary hover:underline"
                      onClick={() => setActiveTab('login')}
                    >
                      Login
                    </button>
                  </>
                )}
              </p>
              
              <div className="mt-4">
                <p className="mb-2">Create a new account to get started</p>
                <p className="text-xs text-muted-foreground">
                  Your account will be created and you'll receive an email confirmation.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
