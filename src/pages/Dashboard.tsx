import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageLayout } from '@/components/layout/PageLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useParkingContext } from '@/contexts/ParkingContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { BookingList } from '@/components/booking/BookingList';
import { SlotGrid } from '@/components/parking/SlotGrid';
import { Car, Zap, HelpCircle, AlertCircle, WifiOff } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { cancelBookingUtil } from '@/types';

export default function Dashboard() {
  const { currentUser, isAdmin } = useAuth();
  const { slots = [], userBookings = [], cancelBooking, refreshData, isOnline, metrics } = useParkingContext();
  const navigate = useNavigate();
  const [firstVisit, setFirstVisit] = React.useState(false);
  
  // Setup periodic refresh for real-time updates with shorter interval
  useEffect(() => {
    // Initial refresh
    refreshData();
    
    // Check if this is the user's first visit
    const hasVisitedBefore = localStorage.getItem('hasVisitedDashboard');
    if (!hasVisitedBefore) {
      setFirstVisit(true);
      localStorage.setItem('hasVisitedDashboard', 'true');
    }
    
    // Set up interval for periodic refresh
    const intervalId = setInterval(() => {
      refreshData();
    }, 3000); // Refresh every 3 seconds for more responsive updates
    
    return () => clearInterval(intervalId);
  }, [refreshData]);
  
  // Redirect if not logged in
  useEffect(() => {
    if (!currentUser) {
      navigate('/auth');
    } else if (isAdmin) {
      navigate('/admin/dashboard');
    }
  }, [currentUser, isAdmin, navigate]);
  
  if (!currentUser) {
    return null; // Don't render anything if not logged in
  }
  
  // Count available slots
  const availableNormalSlots = slots.filter(
    slot => slot.type === 'normal' && slot.status === 'available'
  ).length;
  
  const availableElectricSlots = slots.filter(
    slot => slot.type === 'electric' && slot.status === 'available'
  ).length;
  
  // Get active bookings
  const activeBookings = userBookings.filter(booking => booking.status === 'active');
  
  return (
    <PageLayout>
      <div className="space-y-8 py-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">User Dashboard</h1>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate('/help')}>
              <HelpCircle className="h-4 w-4 mr-2" />
              Help Center
            </Button>
            <Button onClick={() => navigate('/slots')}>Book a Slot</Button>
          </div>
        </div>
        
        {/* First Visit Tutorial */}
        {firstVisit && (
          <Alert className="bg-blue-50 text-blue-800 border-blue-300">
            <AlertTitle className="flex items-center">
              <HelpCircle className="h-4 w-4 mr-2" />
              Welcome to ParkSmart!
            </AlertTitle>
            <AlertDescription className="space-y-2">
              <p>This is your dashboard where you can see available spots and manage your bookings.</p>
              <p>To get started, click "Book a Slot" or check out our <Button variant="link" className="p-0 h-auto text-blue-600" onClick={() => navigate('/help')}>help center</Button> for a complete tutorial.</p>
              <Button variant="outline" size="sm" className="mt-2" onClick={() => setFirstVisit(false)}>
                Got it
              </Button>
            </AlertDescription>
          </Alert>
        )}
        
        {/* Offline Alert */}
        {!isOnline && (
          <Alert variant="destructive">
            <WifiOff className="h-4 w-4 mr-2" />
            <AlertTitle>You're currently offline</AlertTitle>
            <AlertDescription>
              Limited functionality is available. Your active bookings are saved locally and will sync when you reconnect.
            </AlertDescription>
          </Alert>
        )}
        
        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Available Slots</CardTitle>
              <CardDescription>Total parking slots available now</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {availableNormalSlots + availableElectricSlots}
              </div>
            </CardContent>
            {metrics.lastRefreshTime && (
              <CardFooter className="text-xs text-gray-500 pt-0">
                Last updated: {metrics.lastRefreshTime.toLocaleTimeString()}
              </CardFooter>
            )}
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Car className="h-4 w-4" />
                Normal Slots
              </CardTitle>
              <CardDescription>Regular parking slots</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{availableNormalSlots}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Zap className="h-4 w-4" />
                Electric Charging Slots
              </CardTitle>
              <CardDescription>Slots with EV charging</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{availableElectricSlots}</div>
            </CardContent>
          </Card>
        </div>
        
        {/* Active Bookings */}
        <Card>
          <CardHeader>
            <CardTitle>Your Active Bookings</CardTitle>
            <CardDescription>
              Currently active reservations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <BookingList 
              bookings={activeBookings} 
              onCancel={(id) => cancelBooking(id)} 
            />
            
            {activeBookings.length === 0 && (
              <div className="text-center py-6">
                <p className="text-gray-500">No active bookings.</p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => navigate('/slots')}
                >
                  Book a Slot
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Quick Slot Overview */}
        <Card>
          <CardHeader>
            <CardTitle>Slot Overview</CardTitle>
            <CardDescription>
              See which slots are available right now
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="max-h-[400px] overflow-y-auto pr-2">
              <SlotGrid 
                slots={slots.slice(0, 12)} 
                onSlotClick={() => navigate('/slots')}
              />
              
              {slots.length > 12 && (
                <div className="text-center mt-4">
                  <Button 
                    variant="outline" 
                    onClick={() => navigate('/slots')}
                  >
                    View All Slots
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
}
