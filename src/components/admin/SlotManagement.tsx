import React, { useState, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useParkingContext } from '@/contexts/ParkingContext';
import { ParkingSlot, SlotStatus, SlotType } from '@/types';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SlotGrid } from '@/components/parking/SlotGrid';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format } from 'date-fns';

const slotFormSchema = z.object({
  name: z.string().min(1, { message: 'Slot name is required' }),
  type: z.enum(['normal', 'electric']),
  floor: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
    message: 'Floor must be a positive number',
  }),
});

export function SlotManagement() {
  const { slots, bookings, addSlot, updateSlot, deleteSlot, refreshData } = useParkingContext();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSlot, setEditingSlot] = useState<ParkingSlot | null>(null);
  const [filterType, setFilterType] = useState<'all' | 'normal' | 'electric'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'available' | 'occupied'>('all');
  
  // Add a refresh effect for real-time updates
  useEffect(() => {
    // Initial refresh
    refreshData();
    
    // Refresh data every 5 seconds to keep admin panel updated in real-time
    const intervalId = setInterval(() => {
      refreshData();
    }, 5000);
    
    return () => clearInterval(intervalId);
  }, [refreshData]);
  
  const form = useForm<z.infer<typeof slotFormSchema>>({
    resolver: zodResolver(slotFormSchema),
    defaultValues: {
      name: '',
      type: 'normal',
      floor: '1'
    }
  });
  
  const onSubmit = (data: z.infer<typeof slotFormSchema>) => {
    if (editingSlot) {
      updateSlot(editingSlot.id, {
        ...data,
        floor: Number(data.floor)
      });
    } else {
      addSlot(
        data.name,
        data.type as SlotType,
        Number(data.floor)
      );
    }
    
    form.reset();
    setEditingSlot(null);
    setIsDialogOpen(false);
  };
  
  const handleEditSlot = (slot: ParkingSlot) => {
    setEditingSlot(slot);
    form.reset({
      name: slot.name,
      type: slot.type,
      floor: String(slot.floor),  // Convert number to string for the form
    });
    setIsDialogOpen(true);
  };
  
  const handleDeleteSlot = (slotId: string) => {
    if (window.confirm('Are you sure you want to delete this slot?')) {
      deleteSlot(slotId);
    }
  };
  
  const handleAddNew = () => {
    setEditingSlot(null);
    form.reset({
      name: '',
      type: 'normal',
      floor: '1',
    });
    setIsDialogOpen(true);
  };

  // Filter slots based on selected filters
  const filteredSlots = slots.filter(slot => {
    // Filter by type
    if (filterType !== 'all' && slot.type !== filterType) {
      return false;
    }
    
    // Filter by status
    if (filterStatus !== 'all' && slot.status !== filterStatus) {
      return false;
    }
    
    return true;
  });

  // Get booking details for occupied slots
  const getSlotBookingDetails = (slotId: string) => {
    const activeBooking = bookings.find(
      booking => booking.slot_id === slotId && booking.status === 'active'
    );
    
    return activeBooking;
  };
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Manage Parking Slots</CardTitle>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={handleAddNew}>Add New Slot</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingSlot ? 'Edit Parking Slot' : 'Add New Parking Slot'}
                </DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Slot Name</FormLabel>
                        <FormControl>
                          <Input placeholder="A-1" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="type"
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
                            <SelectItem value="electric">Electric</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="floor"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Floor</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            min="1" 
                            placeholder="1" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="flex justify-end gap-2">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setIsDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button type="submit">
                      {editingSlot ? 'Update' : 'Add'} Slot
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </CardHeader>
        
        <CardContent>
          <div className="mb-6">
            <div className="flex flex-wrap gap-2">
              <div className="space-y-2">
                <p className="text-sm font-medium">Filter by Type:</p>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant={filterType === 'all' ? 'default' : 'outline'}
                    onClick={() => setFilterType('all')}
                  >
                    All
                  </Button>
                  <Button
                    size="sm"
                    variant={filterType === 'normal' ? 'default' : 'outline'}
                    onClick={() => setFilterType('normal')}
                  >
                    Normal
                  </Button>
                  <Button
                    size="sm"
                    variant={filterType === 'electric' ? 'default' : 'outline'}
                    onClick={() => setFilterType('electric')}
                  >
                    Electric
                  </Button>
                </div>
              </div>
              
              <div className="space-y-2 ml-6">
                <p className="text-sm font-medium">Filter by Status:</p>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant={filterStatus === 'all' ? 'default' : 'outline'}
                    onClick={() => setFilterStatus('all')}
                  >
                    All
                  </Button>
                  <Button
                    size="sm"
                    variant={filterStatus === 'available' ? 'default' : 'outline'}
                    onClick={() => setFilterStatus('available')}
                  >
                    Available
                  </Button>
                  <Button
                    size="sm"
                    variant={filterStatus === 'occupied' ? 'default' : 'outline'}
                    onClick={() => setFilterStatus('occupied')}
                  >
                    Occupied
                  </Button>
                </div>
              </div>
            </div>
          </div>
          
          <SlotGrid 
            slots={filteredSlots}
            onSlotClick={(slotId) => {
              const slot = slots.find(s => s.id === slotId);
              if (slot) handleEditSlot(slot);
            }}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Detailed Slot Information</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Slot</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Floor</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Booked By</TableHead>
                <TableHead>Booking Time</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSlots.map((slot) => {
                const bookingDetails = getSlotBookingDetails(slot.id);
                return (
                  <TableRow key={slot.id}>
                    <TableCell className="font-medium">{slot.name}</TableCell>
                    <TableCell>
                      <Badge variant={slot.type === 'normal' ? 'outline' : 'secondary'}>
                        {slot.type === 'normal' ? 'Normal' : 'Electric'}
                      </Badge>
                    </TableCell>
                    <TableCell>{slot.floor}</TableCell>
                    <TableCell>
                      <Badge variant={slot.status === 'available' ? 'success' : 'destructive'}>
                        {slot.status === 'available' ? 'Available' : 'Occupied'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {bookingDetails ? bookingDetails.userName : '-'}
                    </TableCell>
                    <TableCell>
                      {bookingDetails ? 
                        format(new Date(bookingDetails.startTime), 'MMM dd, yyyy HH:mm') : 
                        '-'}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleEditSlot(slot)}
                        >
                          Edit
                        </Button>
                        <Button 
                          variant="destructive" 
                          size="sm" 
                          onClick={() => handleDeleteSlot(slot.id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
              
              {filteredSlots.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-4">
                    No slots match the selected filters
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
