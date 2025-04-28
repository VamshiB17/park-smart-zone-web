
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageLayout } from '@/components/layout/PageLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useParkingContext } from '@/contexts/ParkingContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BookingList } from '@/components/booking/BookingList';

export default function Bookings() {
  const { currentUser } = useAuth();
  const { userBookings, cancelBooking } = useParkingContext();
  const navigate = useNavigate();
  
  // Redirect if not logged in
  if (!currentUser) {
    navigate('/auth');
    return null;
  }
  
  // Filter bookings by status
  const activeBookings = userBookings.filter(booking => booking.status === 'active');
  const completedBookings = userBookings.filter(booking => booking.status === 'completed');
  const cancelledBookings = userBookings.filter(booking => booking.status === 'cancelled');
  
  return (
    <PageLayout>
      <div className="space-y-8 py-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">My Bookings</h1>
          <Button onClick={() => navigate('/slots')}>Book New Slot</Button>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Booking History</CardTitle>
            <CardDescription>
              View and manage your parking reservations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="active">
              <TabsList className="mb-6">
                <TabsTrigger value="active">
                  Active ({activeBookings.length})
                </TabsTrigger>
                <TabsTrigger value="completed">
                  Completed ({completedBookings.length})
                </TabsTrigger>
                <TabsTrigger value="cancelled">
                  Cancelled ({cancelledBookings.length})
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="active">
                <BookingList 
                  bookings={activeBookings} 
                  onCancel={cancelBooking}
                />
              </TabsContent>
              
              <TabsContent value="completed">
                <BookingList bookings={completedBookings} />
              </TabsContent>
              
              <TabsContent value="cancelled">
                <BookingList bookings={cancelledBookings} />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
}
