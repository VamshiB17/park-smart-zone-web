import React, { useEffect } from 'react';
import { format } from 'date-fns';
import { BookingWithDetails } from '@/types';
import { Button } from '@/components/ui/button';
import { Car, Zap, QrCode } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useParkingContext } from '@/contexts/ParkingContext';
import { toast } from 'sonner';
import { QRCodeDisplay } from './QRCodeDisplay';

interface BookingListProps {
  bookings: BookingWithDetails[];
  onCancel?: (bookingId: string) => void;
  isAdmin?: boolean;
}

export function BookingList({ bookings, onCancel, isAdmin = false }: BookingListProps) {
  const { bookSlot, refreshData } = useParkingContext();
  
  // Add auto-refresh for real-time updates
  useEffect(() => {
    // Refresh data every 10 seconds to keep bookings updated
    const intervalId = setInterval(() => {
      refreshData();
    }, 5000);
    
    return () => clearInterval(intervalId);
  }, [refreshData]);
  
  const formatDate = (date: Date | string) => {
    return format(new Date(date), 'PPP');
  };
  
  const formatTime = (date: Date | string) => {
    return format(new Date(date), 'HH:mm');
  };
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case 'completed':
        return <Badge variant="outline" className="text-gray-500 border-gray-300">Completed</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">Cancelled</Badge>;
      default:
        return null;
    }
  };

  const handleBookFromQR = async (qrData: string) => {
    try {
      const bookingData = JSON.parse(qrData);
      if (bookingData.action === 'book') {
        await bookSlot(
          bookingData.slotId,
          new Date(bookingData.startTime),
          new Date(bookingData.endTime)
        );
        toast.success("Successfully booked slot from QR code");
      }
    } catch (error) {
      console.error('Error booking from QR:', error);
      toast.error("Failed to book from QR code");
    }
  };
  
  // Sort bookings by date (newest first)
  const sortedBookings = [...bookings].sort((a, b) => 
    new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
  );
  
  if (sortedBookings.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-lg text-gray-500">No bookings found.</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      {sortedBookings.map((booking) => (
        <div 
          key={booking.id} 
          className={`bg-white rounded-lg shadow p-4 border-l-4 ${
            booking.status === 'active'
              ? 'border-l-green-500'
              : booking.status === 'cancelled'
              ? 'border-l-red-500'
              : 'border-l-gray-300'
          }`}
        >
          <div className="flex flex-wrap justify-between items-start gap-2">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold">Slot {booking.slotName}</h3>
                {booking.slotType === 'normal' ? (
                  <Car className="h-4 w-4 text-gray-600" />
                ) : (
                  <Zap className="h-4 w-4 text-blue-500" />
                )}
                {getStatusBadge(booking.status)}
              </div>
              <p className="text-sm text-gray-600">
                {formatDate(booking.startTime)} · {formatTime(booking.startTime)} - {formatTime(booking.endTime)}
              </p>
              {isAdmin && (
                <p className="text-sm text-gray-600 mt-1">
                  User: {booking.userName}
                </p>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" size="icon">
                    <QrCode className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Booking QR Code</DialogTitle>
                  </DialogHeader>
                  <div className="flex flex-col items-center justify-center p-4">
                    <QRCodeDisplay booking={booking} showFlashlightToggle={true} />
                    
                    <div className="mt-4 text-center space-y-2">
                      <p className="text-sm">
                        <span className="font-semibold">Slot:</span> {booking.slotName} ({booking.slotType})
                      </p>
                      <p className="text-sm">
                        <span className="font-semibold">Date:</span> {formatDate(booking.startTime)}
                      </p>
                      <p className="text-sm">
                        <span className="font-semibold">Time:</span> {formatTime(booking.startTime)} - {formatTime(booking.endTime)}
                      </p>
                      <p className="text-sm text-gray-500 mt-4">
                        Scan this QR code to quickly book this slot
                      </p>
                      <Button 
                        className="mt-2"
                        onClick={() => handleBookFromQR(JSON.stringify({
                          action: 'book',
                          slotId: booking.slot_id,
                          startTime: booking.startTime,
                          endTime: booking.endTime,
                        }))}
                      >
                        Book Now
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
              
              {booking.status === 'active' && onCancel && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => onCancel(booking.id)}
                >
                  Cancel Booking
                </Button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
