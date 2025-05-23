import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageLayout } from '@/components/layout/PageLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useParkingContext } from '@/contexts/ParkingContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BookingList } from '@/components/booking/BookingList';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar } from '@/components/ui/calendar';
import { DateRange } from 'react-day-picker';
import { format } from 'date-fns';
import { CalendarIcon, FilterIcon } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Booking } from '@/types';

export default function Bookings() {
  const { currentUser } = useAuth();
  const { userBookings = [], cancelBooking, refreshData } = useParkingContext();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('active');
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
  
  // Redirect if not logged in
  useEffect(() => {
    if (!currentUser) {
      navigate('/auth');
    }
  }, [currentUser, navigate]);
  
  // Refresh data on mount
  useEffect(() => {
    refreshData();
  }, [refreshData]);
  
  // Filter bookings based on tab and date range
  useEffect(() => {
    if (!userBookings) return;
    
    let filtered = [...userBookings];
    
    // Filter by status
    if (activeTab === 'active') {
      filtered = filtered.filter(booking => booking.status === 'active');
    } else if (activeTab === 'completed') {
      filtered = filtered.filter(booking => booking.status === 'completed');
    } else if (activeTab === 'cancelled') {
      filtered = filtered.filter(booking => booking.status === 'cancelled');
    }
    
    // Filter by date range
    if (dateRange?.from) {
      const fromDate = new Date(dateRange.from);
      fromDate.setHours(0, 0, 0, 0);
      
      filtered = filtered.filter(booking => {
        const bookingDate = new Date(booking.startTime);
        return bookingDate >= fromDate;
      });
    }
    
    if (dateRange?.to) {
      const toDate = new Date(dateRange.to);
      toDate.setHours(23, 59, 59, 999);
      
      filtered = filtered.filter(booking => {
        const bookingDate = new Date(booking.startTime);
        return bookingDate <= toDate;
      });
    }
    
    setFilteredBookings(filtered);
  }, [userBookings, activeTab, dateRange]);
  
  if (!currentUser) {
    return null;
  }
  
  return (
    <PageLayout>
      <div className="space-y-6 py-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Your Bookings</h1>
          <Button onClick={() => navigate('/slots')}>Book a Slot</Button>
        </div>
        
        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <CardTitle>Booking History</CardTitle>
                <CardDescription>
                  View and manage all your parking reservations
                </CardDescription>
              </div>
              
              <div className="flex items-center gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="flex items-center gap-2">
                      <CalendarIcon className="h-4 w-4" />
                      {dateRange?.from ? (
                        dateRange.to ? (
                          <>
                            {format(dateRange.from, "LLL dd, y")} -{" "}
                            {format(dateRange.to, "LLL dd, y")}
                          </>
                        ) : (
                          format(dateRange.from, "LLL dd, y")
                        )
                      ) : (
                        "Date Range"
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="end">
                    <Calendar
                      initialFocus
                      mode="range"
                      defaultMonth={dateRange?.from}
                      selected={dateRange}
                      onSelect={setDateRange}
                      numberOfMonths={2}
                    />
                    <div className="flex items-center justify-between p-3 border-t border-border">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => setDateRange(undefined)}
                      >
                        Clear
                      </Button>
                      <Button 
                        size="sm"
                        onClick={() => document.body.click()}
                      >
                        Apply
                      </Button>
                    </div>
                  </PopoverContent>
                </Popover>
                
                <Button variant="outline" size="icon">
                  <FilterIcon className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="active" value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-4">
                <TabsTrigger value="active">Active</TabsTrigger>
                <TabsTrigger value="completed">Completed</TabsTrigger>
                <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
                <TabsTrigger value="all">All</TabsTrigger>
              </TabsList>
              
              <TabsContent value={activeTab} className="mt-0">
                <BookingList 
                  bookings={filteredBookings} 
                  onCancel={cancelBooking}
                  showStatus={activeTab === 'all'}
                />
                
                {filteredBookings.length === 0 && (
                  <div className="text-center py-12">
                    <p className="text-gray-500">No bookings found.</p>
                    {activeTab === 'active' && (
                      <Button 
                        variant="outline" 
                        className="mt-4"
                        onClick={() => navigate('/slots')}
                      >
                        Book a Slot
                      </Button>
                    )}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
}
