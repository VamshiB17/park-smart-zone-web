import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export default function AuthCallback() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // The auth state change will be handled by AuthContext
        // Just wait for the user to be set and redirect accordingly
        if (currentUser) {
          if (currentUser.role === 'admin') {
            navigate('/admin/dashboard', { replace: true });
          } else {
            navigate('/dashboard', { replace: true });
          }
        } else {
          // If no user after a short delay, redirect to auth page
          setTimeout(() => {
            if (!currentUser) {
              toast.error('Authentication failed. Please try again.');
              navigate('/auth', { replace: true });
            }
          }, 3000);
        }
      } catch (error) {
        console.error('Auth callback error:', error);
        toast.error('Authentication failed. Please try again.');
        navigate('/auth', { replace: true });
      }
    };

    handleAuthCallback();
  }, [currentUser, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
        <p className="mt-4 text-lg">Completing authentication...</p>
      </div>
    </div>
  );
}