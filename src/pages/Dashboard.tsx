
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageLayout } from '@/components/layout/PageLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useParkingContext } from '@/contexts/ParkingContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BookingList } from '@/components/booking/BookingList';
import { SlotGrid } from '@/components/parking/SlotGrid';
import { Car, Zap } from 'lucide-react';

export default function Dashboard() {
  const { currentUser } = useAuth();
  const { slots, userBookings, cancelBooking, refreshData } = useParkingContext();
  const navigate = useNavigate();
  
  // Setup periodic refresh for real-time updates with shorter interval
  useEffect(() => {
    // Initial refresh
    refreshData();
    
    // Set up interval for periodic refresh
    const intervalId = setInterval(() => {
      refreshData();
    }, 3000); // Refresh every 3 seconds for more responsive updates
    
    return () => clearInterval(intervalId);
  }, [refreshData]);
  
  // Redirect if not logged in
  if (!currentUser) {
    navigate('/auth');
    return null;
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
          <Button onClick={() => navigate('/slots')}>Book a Slot</Button>
        </div>
        
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
              onCancel={cancelBooking} 
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
