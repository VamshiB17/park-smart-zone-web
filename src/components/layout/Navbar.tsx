
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

export function Navbar() {
  const { currentUser, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <span className="text-primary font-bold text-xl">ParkSmart</span>
            </Link>
          </div>
          
          <nav className="hidden sm:ml-6 sm:flex sm:space-x-4">
            <Link to="/" className="px-3 py-2 text-sm font-medium rounded-md text-gray-600 hover:text-primary">
              Home
            </Link>
            
            {currentUser ? (
              <>
                {isAdmin ? (
                  <>
                    <Link to="/admin/dashboard" className="px-3 py-2 text-sm font-medium rounded-md text-gray-600 hover:text-primary">
                      Dashboard
                    </Link>
                    <Link to="/admin/slots" className="px-3 py-2 text-sm font-medium rounded-md text-gray-600 hover:text-primary">
                      Manage Slots
                    </Link>
                    <Link to="/admin/bookings" className="px-3 py-2 text-sm font-medium rounded-md text-gray-600 hover:text-primary">
                      All Bookings
                    </Link>
                  </>
                ) : (
                  <>
                    <Link to="/dashboard" className="px-3 py-2 text-sm font-medium rounded-md text-gray-600 hover:text-primary">
                      Dashboard
                    </Link>
                    <Link to="/slots" className="px-3 py-2 text-sm font-medium rounded-md text-gray-600 hover:text-primary">
                      Book a Slot
                    </Link>
                    <Link to="/bookings" className="px-3 py-2 text-sm font-medium rounded-md text-gray-600 hover:text-primary">
                      My Bookings
                    </Link>
                  </>
                )}
              </>
            ) : (
              <Link to="/auth" className="px-3 py-2 text-sm font-medium rounded-md text-gray-600 hover:text-primary">
                Login / Sign Up
              </Link>
            )}
          </nav>

          <div className="flex items-center">
            {currentUser ? (
              <div className="flex items-center space-x-3">
                <span className="text-sm font-medium text-gray-700">
                  {currentUser.name} {isAdmin && <span className="text-primary ml-1">(Admin)</span>}
                </span>
                <Button variant="outline" onClick={handleLogout}>
                  Logout
                </Button>
              </div>
            ) : (
              <Button onClick={() => navigate('/auth')}>Sign In</Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
