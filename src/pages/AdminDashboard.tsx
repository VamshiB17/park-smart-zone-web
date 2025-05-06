
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageLayout } from '@/components/layout/PageLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useParkingContext } from '@/contexts/ParkingContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Car, Zap, User, Clock } from 'lucide-react';
import { BookingList } from '@/components/booking/BookingList';

export default function AdminDashboard() {
  const { currentUser, isAdmin } = useAuth();
  const { slots, bookings, refreshData } = useParkingContext();
  const navigate = useNavigate();
  
  // Setup periodic refresh for real-time updates
  useEffect(() => {
    // Initial refresh
    refreshData();
    
    // Set up interval for periodic refresh
    const intervalId = setInterval(() => {
      refreshData();
    }, 3000); // Refresh every 3 seconds for more responsive updates
    
    return () => clearInterval(intervalId);
  }, [refreshData]);
  
  // Redirect if not logged in or not an admin
  if (!currentUser || !isAdmin) {
    navigate('/auth');
    return null;
  }
  
  // Count slots
  const totalSlots = slots.length;
  const normalSlots = slots.filter(slot => slot.type === 'normal').length;
  const electricSlots = slots.filter(slot => slot.type === 'electric').length;
  const occupiedSlots = slots.filter(slot => slot.status === 'occupied').length;
  
  // Count bookings
  const activeBookings = bookings.filter(booking => booking.status === 'active');
  const todayBookings = bookings.filter(booking => {
    const bookingDate = new Date(booking.startTime).toDateString();
    return bookingDate === new Date().toDateString();
  });
  
  return (
    <PageLayout>
      <div className="space-y-8 py-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <div className="flex gap-4">
            <Button 
              variant="outline" 
              onClick={() => navigate('/admin/slots')}
            >
              Manage Slots
            </Button>
            <Button
              onClick={() => navigate('/admin/bookings')}
            >
              View All Bookings
            </Button>
          </div>
        </div>
        
        {/* Overview Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Car className="h-4 w-4" />
                Total Slots
              </CardTitle>
              <CardDescription>All parking spaces</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{totalSlots}</div>
              <div className="text-sm text-muted-foreground mt-1">
                {occupiedSlots} currently occupied
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Slot Types</CardTitle>
              <CardDescription>Distribution of slot types</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div>
                  <span className="text-sm text-muted-foreground">Normal:</span>
                  <span className="float-right font-medium">{normalSlots}</span>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Electric:</span>
                  <span className="float-right font-medium">{electricSlots}</span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-lg">
                <User className="h-4 w-4" />
                Active Bookings
              </CardTitle>
              <CardDescription>Current reservations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{activeBookings.length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Clock className="h-4 w-4" />
                Today's Bookings
              </CardTitle>
              <CardDescription>Bookings for today</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{todayBookings.length}</div>
            </CardContent>
          </Card>
        </div>
        
        {/* Recent Bookings */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Bookings</CardTitle>
            <CardDescription>
              Most recent parking reservations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <BookingList 
              bookings={bookings.slice(0, 5)} 
              isAdmin
            />
            
            {bookings.length > 5 && (
              <div className="text-center mt-6">
                <Button 
                  variant="outline" 
                  onClick={() => navigate('/admin/bookings')}
                >
                  View All Bookings
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
}
