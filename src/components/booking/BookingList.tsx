import React, { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { Booking } from '@/types';
import { Button } from '@/components/ui/button';
import { Car, Zap, QrCode, Clock, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useParkingContext } from '@/contexts/ParkingContext';
import { toast } from 'sonner';
import { QRCodeDisplay } from './QRCodeDisplay';
import { Label } from '@/components/ui/label';

interface BookingListProps {
  bookings: Booking[];
  onCancel?: (bookingId: string) => void;
  isAdmin?: boolean;
}

export function BookingList({ bookings, onCancel, isAdmin = false }: BookingListProps) {
  const { bookSlot, refreshData, extendBooking } = useParkingContext();
  const [extendDialogOpen, setExtendDialogOpen] = useState<string | null>(null);
  const [selectedEndHour, setSelectedEndHour] = useState<string>('');
  const [extending, setExtending] = useState(false);
  
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
        return <Badge className="bg-primary/20 text-primary">Active</Badge>;
      case 'completed':
        return <Badge variant="outline" className="text-muted-foreground border-muted">Completed</Badge>;
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

  const getExtendTimeOptions = (booking: Booking) => {
    const currentEndHour = new Date(booking.endTime).getHours();
    const options = [];
    
    // Allow extending up to midnight (24:00) or up to 6 more hours
    const maxHour = Math.min(24, currentEndHour + 6);
    
    for (let hour = currentEndHour + 1; hour <= maxHour; hour++) {
      const displayHour = hour === 24 ? '00' : hour.toString().padStart(2, '0');
      options.push({
        value: hour.toString(),
        label: `${displayHour}:00${hour === 24 ? ' (next day)' : ''}`
      });
    }
    
    return options;
  };

  const handleExtendBooking = async (booking: Booking) => {
    if (!selectedEndHour) {
      toast.error('Please select a new end time');
      return;
    }

    setExtending(true);
    try {
      const newEndTime = new Date(booking.endTime);
      const newHour = parseInt(selectedEndHour, 10);
      
      if (newHour === 24) {
        // Next day midnight
        newEndTime.setDate(newEndTime.getDate() + 1);
        newEndTime.setHours(0, 0, 0, 0);
      } else {
        newEndTime.setHours(newHour, 0, 0, 0);
      }

      const success = await extendBooking(booking.id, newEndTime);
      if (success) {
        setExtendDialogOpen(null);
        setSelectedEndHour('');
      }
    } catch (error) {
      console.error('Error extending booking:', error);
      toast.error('Failed to extend booking');
    } finally {
      setExtending(false);
    }
  };
  
  // Sort bookings by date (newest first)
  const sortedBookings = [...bookings].sort((a, b) => 
    new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
  );
  
  if (sortedBookings.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-lg text-muted-foreground">No bookings found.</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      {sortedBookings.map((booking) => (
        <div 
          key={booking.id} 
          className={`bg-card rounded-lg shadow p-4 border-l-4 ${
            booking.status === 'active'
              ? 'border-l-primary'
              : booking.status === 'cancelled'
              ? 'border-l-destructive'
              : 'border-l-muted'
          }`}
        >
          <div className="flex flex-wrap justify-between items-start gap-2">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold">Slot {booking.slotName}</h3>
                {booking.slotType === 'normal' ? (
                  <Car className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Zap className="h-4 w-4 text-primary" />
                )}
                {getStatusBadge(booking.status)}
              </div>
              <p className="text-sm text-muted-foreground">
                {formatDate(booking.startTime)} · {formatTime(booking.startTime)} - {formatTime(booking.endTime)}
              </p>
              {isAdmin && (
                <p className="text-sm text-muted-foreground mt-1">
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
                      <p className="text-sm text-muted-foreground mt-4">
                        Scan this QR code to quickly book this slot
                      </p>
                      <Button 
                        className="mt-2"
                        onClick={() => handleBookFromQR(JSON.stringify({
                          action: 'book',
                          slotId: booking.slotId,
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

              {/* Extend Booking Button */}
              {booking.status === 'active' && !isAdmin && (
                <Dialog 
                  open={extendDialogOpen === booking.id} 
                  onOpenChange={(open) => {
                    setExtendDialogOpen(open ? booking.id : null);
                    if (!open) setSelectedEndHour('');
                  }}
                >
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Clock className="h-4 w-4 mr-1" />
                      Extend
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Extend Booking</DialogTitle>
                      <DialogDescription>
                        Extend your parking time for slot {booking.slotName}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label>Current End Time</Label>
                        <div className="p-3 bg-muted rounded-md">
                          {formatDate(booking.endTime)} at {formatTime(booking.endTime)}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="newEndTime">New End Time</Label>
                        <Select 
                          value={selectedEndHour} 
                          onValueChange={setSelectedEndHour}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select new end time" />
                          </SelectTrigger>
                          <SelectContent>
                            {getExtendTimeOptions(booking).map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button 
                        variant="outline" 
                        onClick={() => {
                          setExtendDialogOpen(null);
                          setSelectedEndHour('');
                        }}
                      >
                        Cancel
                      </Button>
                      <Button 
                        onClick={() => handleExtendBooking(booking)}
                        disabled={!selectedEndHour || extending}
                      >
                        {extending ? 'Extending...' : 'Extend Booking'}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )}
              
              {booking.status === 'active' && onCancel && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      Cancel Booking
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-destructive" />
                        Cancel Booking?
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to cancel your booking for <strong>Slot {booking.slotName}</strong> on{' '}
                        <strong>{formatDate(booking.startTime)}</strong> from{' '}
                        <strong>{formatTime(booking.startTime)} - {formatTime(booking.endTime)}</strong>?
                        <br /><br />
                        This action cannot be undone. The slot will be released and made available for others to book.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Keep Booking</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => onCancel(booking.id)}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Yes, Cancel Booking
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
