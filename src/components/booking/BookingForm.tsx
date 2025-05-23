import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format, addHours } from 'date-fns';
import { CalendarIcon, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
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
import { Booking, ParkingSlot, SlotType } from '@/types';
import { useParkingContext } from '@/contexts/ParkingContext';
import { useAuth } from '@/contexts/AuthContext';
import { BookingSuccessDialog } from './BookingSuccessDialog';

// Define the form schema with Zod
const formSchema = z.object({
  date: z.date({
    required_error: "Please select a date",
  }),
  startTime: z.string({
    required_error: "Please select a start time",
  }),
  duration: z.string({
    required_error: "Please select a duration",
  }),
  slotType: z.enum(['normal', 'electric'] as const),
  slotId: z.string({
    required_error: "Please select a parking slot",
  }),
});

type BookingFormValues = z.infer<typeof formSchema>;

interface BookingFormProps {
  onSuccess?: () => void;
}

export function BookingForm({ onSuccess }: BookingFormProps) {
  const { slots, bookSlot } = useParkingContext();
  const { currentUser } = useAuth();
  const [showSuccess, setShowSuccess] = useState(false);
  const [newBooking, setNewBooking] = useState<Booking | null>(null);
  
  // Get today's date and set min/max dates
  const today = new Date();
  const maxDate = new Date();
  maxDate.setDate(today.getDate() + 14); // Allow booking up to 2 weeks in advance
  
  // Create form
  const form = useForm<BookingFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      date: today,
      startTime: '09:00',
      duration: '1',
      slotType: 'normal',
    },
  });
  
  // Watch form values to filter available slots
  const watchedDate = form.watch('date');
  const watchedStartTime = form.watch('startTime');
  const watchedDuration = form.watch('duration');
  const watchedSlotType = form.watch('slotType') as SlotType;
  
  // Generate available time slots (9 AM to 8 PM)
  const timeSlots = [];
  for (let hour = 9; hour <= 20; hour++) {
    const formattedHour = hour.toString().padStart(2, '0');
    timeSlots.push(`${formattedHour}:00`);
  }
  
  // Duration options (1-4 hours)
  const durationOptions = ['1', '2', '3', '4'];
  
  // Calculate end time based on start time and duration
  const calculateEndTime = (startTime: string, duration: string): string => {
    const [hours, minutes] = startTime.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    
    const endDate = addHours(date, parseInt(duration));
    return format(endDate, 'HH:mm');
  };
  
  // Filter available slots based on form values
  const availableSlots = slots.filter(slot => {
    // Filter by slot type
    if (slot.type !== watchedSlotType) return false;
    
    // Filter by availability
    if (slot.status !== 'available') return false;
    
    // In a real app, we would check if the slot is available for the selected time period
    // by querying the bookings database
    
    return true;
  });
  
  // Handle form submission
  const onSubmit = (values: BookingFormValues) => {
    if (!currentUser) return;
    
    // Parse the start time
    const [startHour, startMinute] = values.startTime.split(':').map(Number);
    const startDate = new Date(values.date);
    startDate.setHours(startHour, startMinute, 0, 0);
    
    // Calculate end time
    const endDate = addHours(startDate, parseInt(values.duration));
    
    // Find the selected slot
    const selectedSlot = slots.find(slot => slot.id === values.slotId);
    if (!selectedSlot) return;
    
    // Create booking
    const bookingData = {
      userId: currentUser.id,
      userName: currentUser.displayName || 'User',
      slotId: selectedSlot.id,
      slotName: selectedSlot.name,
      slotType: selectedSlot.type,
      startTime: startDate,
      endTime: endDate,
      status: 'active' as const,
    };
    
    // Submit booking
    const booking = bookSlot(bookingData);
    
    // Show success dialog
    setNewBooking(booking);
    setShowSuccess(true);
    
    // Call onSuccess callback if provided
    if (onSuccess) {
      onSuccess();
    }
  };
  
  return (
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Date Picker */}
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
                            "pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) => 
                          date < today || date > maxDate
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Start Time */}
            <FormField
              control={form.control}
              name="startTime"
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
                      {timeSlots.map((time) => (
                        <SelectItem key={time} value={time}>
                          {time}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Duration */}
            <FormField
              control={form.control}
              name="duration"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Duration</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select duration" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {durationOptions.map((duration) => (
                        <SelectItem key={duration} value={duration}>
                          {duration} {parseInt(duration) === 1 ? 'hour' : 'hours'}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* End Time (calculated, read-only) */}
            <FormItem>
              <FormLabel>End Time</FormLabel>
              <div className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background">
                <Clock className="mr-2 h-4 w-4 opacity-50" />
                <span className="text-muted-foreground">
                  {calculateEndTime(watchedStartTime, watchedDuration)}
                </span>
              </div>
            </FormItem>
            
            {/* Slot Type */}
            <FormField
              control={form.control}
              name="slotType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Slot Type</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select slot type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="electric">Electric Charging</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Slot Selection */}
            <FormField
              control={form.control}
              name="slotId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Parking Slot</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a parking slot" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {availableSlots.length === 0 ? (
                        <SelectItem value="none" disabled>
                          No slots available
                        </SelectItem>
                      ) : (
                        availableSlots.map((slot) => (
                          <SelectItem key={slot.id} value={slot.id}>
                            {slot.name} (Floor {slot.floor})
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
            disabled={availableSlots.length === 0}
          >
            Book Slot
          </Button>
        </form>
      </Form>
      
      {/* Success Dialog */}
      <BookingSuccessDialog
        open={showSuccess}
        onClose={() => setShowSuccess(false)}
        booking={newBooking}
      />
    </div>
  );
}
