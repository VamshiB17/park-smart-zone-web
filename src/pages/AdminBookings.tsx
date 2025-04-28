
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageLayout } from '@/components/layout/PageLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useParkingContext } from '@/contexts/ParkingContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BookingList } from '@/components/booking/BookingList';

export default function AdminBookings() {
  const { currentUser, isAdmin } = useAuth();
  const { bookings, cancelBooking } = useParkingContext();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  
  // Redirect if not logged in or not an admin
  if (!currentUser || !isAdmin) {
    navigate('/auth');
    return null;
  }
  
  // Filter bookings by status
  const activeBookings = bookings.filter(booking => booking.status === 'active');
  const completedBookings = bookings.filter(booking => booking.status === 'completed');
  const cancelledBookings = bookings.filter(booking => booking.status === 'cancelled');
  
  // Filter bookings by search query
  const filterBookings = (bookingsList: typeof bookings) => {
    if (!searchQuery) return bookingsList;
    
    const query = searchQuery.toLowerCase();
    return bookingsList.filter(booking => 
      booking.userName.toLowerCase().includes(query) ||
      booking.slotName.toLowerCase().includes(query)
    );
  };
  
  return (
    <PageLayout>
      <div className="space-y-8 py-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">All Bookings</h1>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Booking Management</CardTitle>
            <CardDescription>
              View and manage all parking reservations
            </CardDescription>
            <div className="mt-4">
              <Input
                placeholder="Search by user or slot name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="max-w-md"
              />
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="active">
              <TabsList className="mb-6">
                <TabsTrigger value="active">
                  Active ({filterBookings(activeBookings).length})
                </TabsTrigger>
                <TabsTrigger value="completed">
                  Completed ({filterBookings(completedBookings).length})
                </TabsTrigger>
                <TabsTrigger value="cancelled">
                  Cancelled ({filterBookings(cancelledBookings).length})
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="active">
                <BookingList 
                  bookings={filterBookings(activeBookings)} 
                  onCancel={cancelBooking}
                  isAdmin
                />
              </TabsContent>
              
              <TabsContent value="completed">
                <BookingList 
                  bookings={filterBookings(completedBookings)}
                  isAdmin
                />
              </TabsContent>
              
              <TabsContent value="cancelled">
                <BookingList 
                  bookings={filterBookings(cancelledBookings)}
                  isAdmin
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
}
