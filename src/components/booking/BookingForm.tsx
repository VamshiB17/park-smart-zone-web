
import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { CalendarIcon, Clock, WifiOff } from 'lucide-react';

import { cn } from '@/lib/utils';
import { useParkingContext } from '@/contexts/ParkingContext';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { BookingSuccessDialog } from './BookingSuccessDialog';

const formSchema = z.object({
  date: z.date({
    required_error: 'Please select a date',
  }),
  startHour: z.string().min(1, { message: 'Please select a start time' }),
  endHour: z.string().min(1, { message: 'Please select an end time' }),
  slotId: z.string().min(1, { message: 'Please select a parking slot' }),
});

interface BookingFormProps {
  onSuccess?: () => void;
}

export function BookingForm({ onSuccess }: BookingFormProps) {
  const { slots, bookSlot } = useParkingContext();
  const [selectedSlotType, setSelectedSlotType] = useState<'all' | 'normal' | 'electric'>('all');
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [showSuccessDialog, setShowSuccessDialog] = useState<boolean>(false);
  const [newBooking, setNewBooking] = useState<any>(null);
  
  // Mock WebSocket connection for demo
  const [wsConnected, setWsConnected] = useState<boolean>(true);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      startHour: '',
      endHour: '',
      slotId: '',
    },
  });
  
  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // Simulate WebSocket connection for the demo
    const wsInterval = setInterval(() => {
      // Randomly simulate connection issues (5% chance)
      if (Math.random() > 0.95) {
        setWsConnected(false);
        // Reconnect after 3 seconds
        setTimeout(() => setWsConnected(true), 3000);
      }
    }, 30000);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(wsInterval);
    };
  }, []);
  
  const watchDate = form.watch('date');
  const watchStartHour = form.watch('startHour');
  const watchEndHour = form.watch('endHour');
  
  // Generate time options (24-hour format)
  const timeOptions = Array.from({ length: 24 }, (_, i) => {
    const hour = i.toString().padStart(2, '0');
    return { value: hour, label: `${hour}:00` };
  });
  
  // Filter slots based on selected type and availability
  const availableSlots = slots.filter(slot => {
    if (selectedSlotType !== 'all' && slot.type !== selectedSlotType) {
      return false;
    }
    return slot.status === 'available';
  });

  const handleSubmit = async (data: z.infer<typeof formSchema>) => {
    if (!watchDate || !watchStartHour || !watchEndHour || !data.slotId) {
      return;
    }
    
    const startDate = new Date(watchDate);
    startDate.setHours(parseInt(watchStartHour, 10), 0, 0, 0);
    
    const endDate = new Date(watchDate);
    endDate.setHours(parseInt(watchEndHour, 10), 0, 0, 0);
    
    // Validate end time is after start time
    if (endDate <= startDate) {
      form.setError('endHour', {
        type: 'manual',
        message: 'End time must be after start time',
      });
      return;
    }
    
    try {
      // Book the slot
      const booking = await bookSlot(data.slotId, startDate, endDate);
      
      // Store booking in local storage for offline access
      if (booking) {
        const offlineBookings = JSON.parse(localStorage.getItem('offlineBookings') || '[]');
        offlineBookings.push(booking);
        localStorage.setItem('offlineBookings', JSON.stringify(offlineBookings));
        
        // Track metrics
        if (window.performance && window.performance.mark) {
          window.performance.mark('booking-complete');
          window.performance.measure('booking-process', 'booking-start', 'booking-complete');
        }
        
        // Set booking for success dialog
        setNewBooking(booking);
        setShowSuccessDialog(true);
      }
      
      // Reset form
      form.reset();
    } catch (error) {
      console.error('Error during booking:', error);
    }
  };
  
  const handleCloseSuccessDialog = () => {
    setShowSuccessDialog(false);
    if (onSuccess) {
      onSuccess();
    }
  };
  
  // Mark performance for metrics tracking
  useEffect(() => {
    if (window.performance && window.performance.mark) {
      window.performance.mark('booking-start');
    }
  }, []);
  
  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Book a Parking Slot</CardTitle>
          {!isOnline && (
            <Alert variant="destructive" className="mt-2">
              <WifiOff className="h-4 w-4" />
              <AlertTitle>You're offline</AlertTitle>
              <AlertDescription>
                Your booking will be saved locally and synced when you're back online.
              </AlertDescription>
            </Alert>
          )}
          {!wsConnected && isOnline && (
            <Alert variant="warning" className="mt-2 bg-yellow-50 text-yellow-800 border-yellow-300">
              <AlertTitle>Reconnecting...</AlertTitle>
              <AlertDescription>
                Live updates temporarily unavailable. Your bookings will still be processed.
              </AlertDescription>
            </Alert>
          )}
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
              <div className="space-y-4">
                <div className="flex flex-wrap gap-4 mb-4">
                  <Button
                    type="button"
                    variant={selectedSlotType === 'all' ? 'default' : 'outline'}
                    onClick={() => setSelectedSlotType('all')}
                  >
                    All Slots
                  </Button>
                  <Button
                    type="button"
                    variant={selectedSlotType === 'normal' ? 'default' : 'outline'}
                    onClick={() => setSelectedSlotType('normal')}
                  >
                    Normal Slots
                  </Button>
                  <Button
                    type="button"
                    variant={selectedSlotType === 'electric' ? 'default' : 'outline'}
                    onClick={() => setSelectedSlotType('electric')}
                  >
                    Electric Charging Slots
                  </Button>
                </div>
                
                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full pl-3 text-left font-normal flex items-center",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Select date</span>
                              )}
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0 pointer-events-auto" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) => {
                              return date < new Date(new Date().setHours(0, 0, 0, 0));
                            }}
                            initialFocus
                            className="p-3"
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="startHour"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Start Time</FormLabel>
                        <Select 
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select start time" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {timeOptions.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="endHour"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>End Time</FormLabel>
                        <Select 
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          disabled={!watchStartHour}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select end time" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {timeOptions
                              .filter(option => {
                                // Filter out times before the start time
                                if (!watchStartHour) return true;
                                return parseInt(option.value, 10) > parseInt(watchStartHour, 10);
                              })
                              .map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                  {option.label}
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="slotId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Select Parking Slot</FormLabel>
                      <Select 
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        disabled={!watchDate || !watchStartHour || !watchEndHour}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a parking slot" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {availableSlots.length === 0 ? (
                            <SelectItem value="none" disabled>
                              No available slots
                            </SelectItem>
                          ) : (
                            availableSlots.map((slot) => (
                              <SelectItem key={slot.id} value={slot.id}>
                                {slot.name} - {slot.type === 'electric' ? 'Electric' : 'Normal'}
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <Button 
                type="submit" 
                className="w-full"
                disabled={!form.formState.isValid || availableSlots.length === 0}
              >
                Book Slot
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex justify-between text-xs text-gray-500">
          <span>
            {isOnline ? "Connected" : "Offline Mode"}
          </span>
          <span>
            {availableSlots.length} slots available
          </span>
        </CardFooter>
      </Card>
      
      <BookingSuccessDialog 
        open={showSuccessDialog}
        onClose={handleCloseSuccessDialog}
        booking={newBooking}
      />
    </>
  );
}
