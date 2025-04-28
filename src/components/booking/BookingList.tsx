import React from 'react';
import { format } from 'date-fns';
import { Booking } from '@/types';
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

interface BookingListProps {
  bookings: Booking[];
  onCancel?: (bookingId: string) => void;
  isAdmin?: boolean;
}

export function BookingList({ bookings, onCancel, isAdmin = false }: BookingListProps) {
  const formatDate = (date: Date | string) => {
    return format(new Date(date), 'PPP');
  };
  
  const formatTime = (date: Date | string) => {
    return format(new Date(date), 'HH:mm');
  };
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-parking-available">Active</Badge>;
      case 'completed':
        return <Badge variant="outline" className="text-gray-500 border-gray-300">Completed</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">Cancelled</Badge>;
      default:
        return null;
    }
  };
  
  const generateQRData = (booking: Booking) => {
    return JSON.stringify({
      id: booking.id,
      slot: booking.slotName,
      type: booking.slotType,
      date: format(new Date(booking.startTime), 'PPP'),
      time: `${formatTime(booking.startTime)} - ${formatTime(booking.endTime)}`,
      status: booking.status
    });
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
          className="bg-white rounded-lg shadow p-4 border-l-4 border-primary"
        >
          <div className="flex flex-wrap justify-between items-start gap-2">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold">Slot {booking.slotName}</h3>
                {booking.slotType === 'normal' ? (
                  <Car className="h-4 w-4 text-gray-600" />
                ) : (
                  <Zap className="h-4 w-4 text-parking-electric" />
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
                    <img 
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(generateQRData(booking))}`}
                      alt="Booking QR Code"
                      className="w-48 h-48"
                    />
                    <p className="text-sm text-gray-500 mt-4 text-center">
                      Scan this QR code to view booking details
                    </p>
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
      
      {sortedBookings.length === 0 && (
        <div className="text-center py-10">
          <p className="text-lg text-gray-500">No bookings found.</p>
        </div>
      )}
    </div>
  );
}
