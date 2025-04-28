
import React, { createContext, useContext, useState, useEffect } from 'react';
import { ParkingSlot, Booking, SlotType, SlotStatus, generateMockSlots, generateMockBookings } from '@/types';
import { useAuth } from './AuthContext';
import { toast } from 'sonner';

interface ParkingContextType {
  slots: ParkingSlot[];
  bookings: Booking[];
  userBookings: Booking[];
  addSlot: (name: string, type: SlotType, floor: number) => void;
  updateSlot: (id: string, updates: Partial<ParkingSlot>) => void;
  deleteSlot: (id: string) => void;
  bookSlot: (slotId: string, startTime: Date, endTime: Date) => void;
  cancelBooking: (bookingId: string) => void;
  getSlotById: (slotId: string) => ParkingSlot | undefined;
  getAvailableSlots: (date: Date) => ParkingSlot[];
}

const ParkingContext = createContext<ParkingContextType | null>(null);

export function useParkingContext() {
  const context = useContext(ParkingContext);
  if (!context) {
    throw new Error('useParkingContext must be used within a ParkingProvider');
  }
  return context;
}

export function ParkingProvider({ children }: { children: React.ReactNode }) {
  const { currentUser } = useAuth();
  const [slots, setSlots] = useState<ParkingSlot[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [userBookings, setUserBookings] = useState<Booking[]>([]);

  // Initialize with mock data
  useEffect(() => {
    const mockSlots = generateMockSlots();
    setSlots(mockSlots);
    
    if (currentUser) {
      const mockBookings = generateMockBookings(currentUser.id);
      setBookings(mockBookings);
      setUserBookings(mockBookings.filter(booking => booking.userId === currentUser.id));
    }
  }, [currentUser]);

  // Filter user bookings when currentUser changes
  useEffect(() => {
    if (currentUser) {
      setUserBookings(bookings.filter(booking => booking.userId === currentUser.id));
    } else {
      setUserBookings([]);
    }
  }, [currentUser, bookings]);

  const addSlot = (name: string, type: SlotType, floor: number) => {
    const newSlot: ParkingSlot = {
      id: `slot-${Date.now()}`,
      name,
      type,
      status: 'available',
      floor,
    };
    
    setSlots(prev => [...prev, newSlot]);
    toast.success(`Added new ${type} parking slot: ${name}`);
  };

  const updateSlot = (id: string, updates: Partial<ParkingSlot>) => {
    setSlots(prev => 
      prev.map(slot => 
        slot.id === id ? { ...slot, ...updates } : slot
      )
    );
    toast.success(`Updated slot ${updates.name || id}`);
  };

  const deleteSlot = (id: string) => {
    const slotToDelete = slots.find(slot => slot.id === id);
    if (!slotToDelete) return;
    
    // Check if there are active bookings for this slot
    const activeBookings = bookings.filter(
      booking => booking.slotId === id && booking.status === 'active'
    );
    
    if (activeBookings.length > 0) {
      toast.error("Cannot delete slot with active bookings");
      return;
    }
    
    setSlots(prev => prev.filter(slot => slot.id !== id));
    toast.success(`Deleted slot ${slotToDelete.name}`);
  };

  const bookSlot = (slotId: string, startTime: Date, endTime: Date) => {
    if (!currentUser) {
      toast.error("You must be logged in to book a slot");
      return;
    }
    
    const slot = slots.find(s => s.id === slotId);
    if (!slot) {
      toast.error("Slot not found");
      return;
    }
    
    if (slot.status === 'occupied') {
      toast.error("This slot is already occupied");
      return;
    }
    
    // Check for time conflicts
    const hasConflict = bookings.some(booking => {
      if (booking.slotId !== slotId) return false;
      if (booking.status !== 'active') return false;
      
      const bookingStart = new Date(booking.startTime);
      const bookingEnd = new Date(booking.endTime);
      
      return (
        (startTime >= bookingStart && startTime < bookingEnd) ||
        (endTime > bookingStart && endTime <= bookingEnd) ||
        (startTime <= bookingStart && endTime >= bookingEnd)
      );
    });
    
    if (hasConflict) {
      toast.error("This slot is already booked for the selected time");
      return;
    }
    
    // Create new booking
    const newBooking: Booking = {
      id: `booking-${Date.now()}`,
      userId: currentUser.id,
      userName: currentUser.name,
      slotId,
      slotName: slot.name,
      slotType: slot.type,
      startTime,
      endTime,
      createdAt: new Date(),
      status: 'active',
    };
    
    setBookings(prev => [...prev, newBooking]);
    
    // Update slot status to occupied if the booking is for the current time
    const now = new Date();
    if (startTime <= now && endTime >= now) {
      updateSlot(slotId, { status: 'occupied' });
    }
    
    toast.success(`Successfully booked slot ${slot.name}`);
  };

  const cancelBooking = (bookingId: string) => {
    const booking = bookings.find(b => b.id === bookingId);
    if (!booking) {
      toast.error("Booking not found");
      return;
    }
    
    if (booking.status !== 'active') {
      toast.error("Only active bookings can be cancelled");
      return;
    }
    
    // Update booking status
    setBookings(prev => 
      prev.map(b => 
        b.id === bookingId ? { ...b, status: 'cancelled' } : b
      )
    );
    
    // Update slot status if it was occupied by this booking
    const now = new Date();
    if (booking.startTime <= now && booking.endTime >= now) {
      updateSlot(booking.slotId, { status: 'available' });
    }
    
    toast.success("Booking cancelled successfully");
  };

  const getSlotById = (slotId: string) => {
    return slots.find(slot => slot.id === slotId);
  };

  const getAvailableSlots = (date: Date) => {
    return slots.filter(slot => {
      // If slot is occupied, check if there's a booking that overlaps with the requested date
      if (slot.status === 'occupied') {
        const slotBookings = bookings.filter(
          b => b.slotId === slot.id && b.status === 'active'
        );
        
        // If there are no active bookings, the slot should be available
        if (slotBookings.length === 0) return true;
        
        // Check if any booking overlaps with the requested date
        return !slotBookings.some(booking => {
          const bookingStart = new Date(booking.startTime);
          const bookingEnd = new Date(booking.endTime);
          
          // The simple case: if the requested date falls within the booking time
          return date >= bookingStart && date <= bookingEnd;
        });
      }
      
      // If slot is available, it's available
      return true;
    });
  };

  const value = {
    slots,
    bookings,
    userBookings,
    addSlot,
    updateSlot,
    deleteSlot,
    bookSlot,
    cancelBooking,
    getSlotById,
    getAvailableSlots,
  };

  return <ParkingContext.Provider value={value}>{children}</ParkingContext.Provider>;
}
