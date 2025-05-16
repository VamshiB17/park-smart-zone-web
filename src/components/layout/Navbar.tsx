
import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger, navigationMenuTriggerStyle } from '@/components/ui/navigation-menu';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/contexts/AuthContext';
import { useMobile } from '@/hooks/use-mobile';
import { useParkingContext } from '@/contexts/ParkingContext';
import { AlertTriangle, Car, HelpCircle, Menu, User, X } from 'lucide-react';

export function Navbar() {
  const { currentUser, isAdmin, logout } = useAuth();
  const { isOnline } = useParkingContext();
  const isMobile = useMobile();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };
  
  const handleLogout = () => {
    logout();
    navigate('/');
  };
  
  return (
    <header className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="flex items-center">
                <Car className="h-8 w-8 text-blue-600 mr-2" />
                <span className="text-xl font-bold">ParkSmart</span>
              </Link>
            </div>
            
            {/* Desktop Navigation */}
            {!isMobile && currentUser && (
              <nav className="ml-6 flex items-center space-x-4">
                <NavigationMenu>
                  <NavigationMenuList>
                    <NavigationMenuItem>
                      <Link 
                        to="/dashboard"
                        className={cn(
                          navigationMenuTriggerStyle(),
                          isActive('/dashboard') && 'bg-accent text-accent-foreground'
                        )}
                      >
                        Dashboard
                      </Link>
                    </NavigationMenuItem>
                    
                    <NavigationMenuItem>
                      <Link 
                        to="/slots"
                        className={cn(
                          navigationMenuTriggerStyle(),
                          isActive('/slots') && 'bg-accent text-accent-foreground'
                        )}
                      >
                        Parking Slots
                      </Link>
                    </NavigationMenuItem>
                    
                    <NavigationMenuItem>
                      <Link 
                        to="/bookings"
                        className={cn(
                          navigationMenuTriggerStyle(),
                          isActive('/bookings') && 'bg-accent text-accent-foreground'
                        )}
                      >
                        My Bookings
                      </Link>
                    </NavigationMenuItem>
                    
                    <NavigationMenuItem>
                      <Link 
                        to="/help"
                        className={cn(
                          navigationMenuTriggerStyle(),
                          isActive('/help') && 'bg-accent text-accent-foreground'
                        )}
                      >
                        <HelpCircle className="h-4 w-4 mr-1" />
                        Help
                      </Link>
                    </NavigationMenuItem>
                    
                    {isAdmin && (
                      <NavigationMenuItem>
                        <NavigationMenuTrigger>Admin</NavigationMenuTrigger>
                        <NavigationMenuContent>
                          <ul className="grid w-[200px] gap-2 p-2">
                            <li>
                              <NavigationMenuLink asChild>
                                <Link 
                                  to="/admin/dashboard" 
                                  className={cn(
                                    "block p-2 rounded hover:bg-accent",
                                    isActive('/admin/dashboard') && 'bg-accent'
                                  )}
                                >
                                  Dashboard
                                </Link>
                              </NavigationMenuLink>
                            </li>
                            <li>
                              <NavigationMenuLink asChild>
                                <Link 
                                  to="/admin/slots" 
                                  className={cn(
                                    "block p-2 rounded hover:bg-accent",
                                    isActive('/admin/slots') && 'bg-accent'
                                  )}
                                >
                                  Manage Slots
                                </Link>
                              </NavigationMenuLink>
                            </li>
                            <li>
                              <NavigationMenuLink asChild>
                                <Link 
                                  to="/admin/bookings" 
                                  className={cn(
                                    "block p-2 rounded hover:bg-accent",
                                    isActive('/admin/bookings') && 'bg-accent'
                                  )}
                                >
                                  All Bookings
                                </Link>
                              </NavigationMenuLink>
                            </li>
                          </ul>
                        </NavigationMenuContent>
                      </NavigationMenuItem>
                    )}
                  </NavigationMenuList>
                </NavigationMenu>
              </nav>
            )}
          </div>
          
          <div className="flex items-center">
            {!isOnline && (
              <div className="mr-4 flex items-center">
                <AlertTriangle className="h-4 w-4 text-red-500 mr-1" />
                <span className="text-sm text-red-500">Offline</span>
              </div>
            )}
            
            {currentUser ? (
              <div className="flex items-center gap-4">
                {/* Mobile menu button */}
                {isMobile && (
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  >
                    {mobileMenuOpen ? (
                      <X className="h-6 w-6" />
                    ) : (
                      <Menu className="h-6 w-6" />
                    )}
                  </Button>
                )}
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="ghost" 
                      className="relative h-10 w-10 rounded-full"
                      size="icon"
                    >
                      <User className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel>
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium">
                          {currentUser.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {currentUser.email}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => navigate('/dashboard')}>
                      Dashboard
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/bookings')}>
                      My Bookings
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/help')}>
                      Help Center
                    </DropdownMenuItem>
                    {isAdmin && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuLabel>Admin</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => navigate('/admin/dashboard')}>
                          Admin Dashboard
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigate('/admin/slots')}>
                          Manage Slots
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigate('/admin/bookings')}>
                          All Bookings
                        </DropdownMenuItem>
                      </>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout}>
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <Button onClick={() => navigate('/auth')}>Login</Button>
            )}
          </div>
        </div>
      </div>
      
      {/* Mobile Navigation Drawer */}
      {isMobile && mobileMenuOpen && currentUser && (
        <div className="bg-white border-t border-gray-200 py-2">
          <nav className="px-4 py-2 flex flex-col space-y-2">
            <Link 
              to="/dashboard" 
              className={cn(
                "px-3 py-2 rounded-md text-sm font-medium",
                isActive('/dashboard') ? "bg-blue-100 text-blue-800" : "text-gray-700 hover:bg-gray-100"
              )}
              onClick={() => setMobileMenuOpen(false)}
            >
              Dashboard
            </Link>
            <Link 
              to="/slots" 
              className={cn(
                "px-3 py-2 rounded-md text-sm font-medium",
                isActive('/slots') ? "bg-blue-100 text-blue-800" : "text-gray-700 hover:bg-gray-100"
              )}
              onClick={() => setMobileMenuOpen(false)}
            >
              Parking Slots
            </Link>
            <Link 
              to="/bookings" 
              className={cn(
                "px-3 py-2 rounded-md text-sm font-medium",
                isActive('/bookings') ? "bg-blue-100 text-blue-800" : "text-gray-700 hover:bg-gray-100"
              )}
              onClick={() => setMobileMenuOpen(false)}
            >
              My Bookings
            </Link>
            <Link 
              to="/help" 
              className={cn(
                "px-3 py-2 rounded-md text-sm font-medium flex items-center",
                isActive('/help') ? "bg-blue-100 text-blue-800" : "text-gray-700 hover:bg-gray-100"
              )}
              onClick={() => setMobileMenuOpen(false)}
            >
              <HelpCircle className="h-4 w-4 mr-2" />
              Help Center
            </Link>
            
            {isAdmin && (
              <>
                <div className="pt-2 pb-1 px-3 text-xs font-semibold text-gray-500">
                  Admin
                </div>
                <Link 
                  to="/admin/dashboard" 
                  className={cn(
                    "px-3 py-2 rounded-md text-sm font-medium",
                    isActive('/admin/dashboard') ? "bg-blue-100 text-blue-800" : "text-gray-700 hover:bg-gray-100"
                  )}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Admin Dashboard
                </Link>
                <Link 
                  to="/admin/slots" 
                  className={cn(
                    "px-3 py-2 rounded-md text-sm font-medium",
                    isActive('/admin/slots') ? "bg-blue-100 text-blue-800" : "text-gray-700 hover:bg-gray-100"
                  )}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Manage Slots
                </Link>
                <Link 
                  to="/admin/bookings" 
                  className={cn(
                    "px-3 py-2 rounded-md text-sm font-medium",
                    isActive('/admin/bookings') ? "bg-blue-100 text-blue-800" : "text-gray-700 hover:bg-gray-100"
                  )}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  All Bookings
                </Link>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
