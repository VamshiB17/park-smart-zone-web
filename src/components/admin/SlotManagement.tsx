import React, { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useParkingContext } from '@/contexts/ParkingContext';
import { ParkingSlot } from '@/types';
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

const slotFormSchema = z.object({
  name: z.string().min(1, { message: 'Slot name is required' }),
  type: z.enum(['normal', 'electric']),
  floor: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
    message: 'Floor must be a positive number',
  }),
});

export function SlotManagement() {
  const { slots, addSlot, updateSlot, deleteSlot } = useParkingContext();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSlot, setEditingSlot] = useState<ParkingSlot | null>(null);
  
  const form = useForm<z.infer<typeof slotFormSchema>>({
    resolver: zodResolver(slotFormSchema),
    defaultValues: {
      name: '',
      type: 'normal',
      floor: 1
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
        data.type,
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
      floor: slot.floor.toString(),
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
  
  return (
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
        <SlotGrid 
          slots={slots}
          onSlotClick={(slotId) => {
            const slot = slots.find(s => s.id === slotId);
            if (slot) handleEditSlot(slot);
          }}
        />
      </CardContent>
    </Card>
  );
}
