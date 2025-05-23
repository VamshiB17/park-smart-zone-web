
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageLayout } from '@/components/layout/PageLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useParkingContext } from '@/contexts/ParkingContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Car, Zap, User, Clock, Activity, WifiOff } from 'lucide-react';
import { BookingList } from '@/components/booking/BookingList';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

export default function AdminDashboard() {
  const { currentUser, isAdmin } = useAuth();
  const { slots, bookings, refreshData, isOnline, metrics } = useParkingContext();
  const navigate = useNavigate();
  
  // Setup periodic refresh for real-time updates with same interval as user dashboard
  useEffect(() => {
    // Initial refresh
    refreshData();
    
    // Set up interval for periodic refresh (matching user dashboard refresh rate)
    const intervalId = setInterval(() => {
      refreshData();
    }, 3000); // Refresh every 3 seconds for more responsive updates
    
    return () => clearInterval(intervalId);
  }, [refreshData]);
  
  // Redirect if not logged in or not an admin
  if (!currentUser) {
    navigate('/auth');
    return null;
  }
  
  // Redirect regular users to their dashboard
  if (!isAdmin) {
    navigate('/dashboard');
    return null;
  }
  
  // Count slots (using the same calculation methods as user dashboard)
  const totalSlots = slots.length;
  const availableNormalSlots = slots.filter(slot => slot.type === 'normal' && slot.status === 'available').length;
  const availableElectricSlots = slots.filter(slot => slot.type === 'electric' && slot.status === 'available').length;
  const normalSlots = slots.filter(slot => slot.type === 'normal').length;
  const electricSlots = slots.filter(slot => slot.type === 'electric').length;
  const occupiedSlots = slots.filter(slot => slot.status === 'occupied').length;
  const availableSlots = slots.filter(slot => slot.status === 'available').length;
  
  // Count bookings
  const activeBookings = bookings.filter(booking => booking.status === 'active');
  const todayBookings = bookings.filter(booking => {
    const bookingDate = new Date(booking.startTime).toDateString();
    return bookingDate === new Date().toDateString();
  });
  
  // Generate hourly booking data for the chart
  const getBookingsByHour = () => {
    const hours = Array.from({ length: 24 }, (_, i) => i);
    return hours.map(hour => {
      // Count bookings for this hour
      const hourBookings = bookings.filter(booking => {
        const bookingHour = new Date(booking.startTime).getHours();
        return bookingHour === hour;
      });
      
      return {
        hour: `${hour}:00`,
        bookings: hourBookings.length
      };
    });
  };
  
  // Calculate system performance metrics
  const systemUptime = "99.8%"; // This would come from a real monitoring system
  const averageBookingTime = "2.8 minutes"; // This would be calculated from actual user timing
  
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
        
        {/* Offline Alert */}
        {!isOnline && (
          <Alert variant="destructive">
            <WifiOff className="h-4 w-4 mr-2" />
            <AlertTitle>System is offline</AlertTitle>
            <AlertDescription>
              The parking management system is currently operating in offline mode. 
              Some features may be limited until connectivity is restored.
            </AlertDescription>
          </Alert>
        )}
        
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
                {availableSlots} available, {occupiedSlots} occupied
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
              <CardTitle className="text-lg">Slot Types</CardTitle>
              <CardDescription>Distribution of slot types</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div>
                  <span className="text-sm text-muted-foreground">Normal:</span>
                  <span className="float-right font-medium">{normalSlots} ({availableNormalSlots} available)</span>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Electric:</span>
                  <span className="float-right font-medium">{electricSlots} ({availableElectricSlots} available)</span>
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
        
        {/* System Metrics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              System Metrics
            </CardTitle>
            <CardDescription>
              Real-time performance monitoring
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-sm font-medium text-gray-500">System Uptime</div>
                <div className="text-2xl font-bold">{systemUptime}</div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-sm font-medium text-gray-500">Avg. Booking Time</div>
                <div className="text-2xl font-bold">{averageBookingTime}</div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-sm font-medium text-gray-500">Total Bookings</div>
                <div className="text-2xl font-bold">{metrics.totalBookings}</div>
              </div>
            </div>
            
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={getBookingsByHour()}
                  margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hour" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="bookings" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
          <CardFooter className="text-xs text-gray-500">
            Last updated: {metrics.lastRefreshTime ? metrics.lastRefreshTime.toLocaleTimeString() : 'Never'}
          </CardFooter>
        </Card>
        
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
