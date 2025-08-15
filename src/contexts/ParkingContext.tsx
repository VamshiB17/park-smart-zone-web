
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { ParkingSlot, Booking, SlotType, SlotStatus } from '@/types';
import { AuthContext } from './AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ParkingContextType {
  slots: ParkingSlot[];
  bookings: Booking[];
  userBookings: Booking[];
  addSlot: (name: string, type: SlotType, floor: number) => void;
  updateSlot: (id: string, updates: Partial<ParkingSlot>) => void;
  deleteSlot: (id: string) => void;
  bookSlot: (slotId: string, startTime: Date, endTime: Date) => Promise<Booking | undefined>;
  cancelBooking: (bookingId: string) => void;
  getSlotById: (slotId: string) => ParkingSlot | undefined;
  getAvailableSlots: (date: Date) => ParkingSlot[];
  refreshData: () => void;
  isOnline: boolean;
  metrics: {
    totalBookings: number;
    activeBookings: number;
    completedBookings: number;
    cancelledBookings: number;
    lastRefreshTime: Date | null;
  };
}

const ParkingContext = createContext<ParkingContextType | null>(null);

export function useParkingContext() {
  const context = useContext(ParkingContext);
  if (!context) {
    throw new Error('useParkingContext must be used within a ParkingProvider');
  }
  return context;
}

// Convert database types to our interface
const convertDbSlotToSlot = (dbSlot: any): ParkingSlot => ({
  id: dbSlot.id,
  name: dbSlot.name,
  type: dbSlot.type as SlotType,
  status: dbSlot.status as SlotStatus,
  floor: dbSlot.floor,
});

const convertDbBookingToBooking = (dbBooking: any, userProfiles: any[]): Booking => {
  const userProfile = userProfiles.find(p => p.id === dbBooking.user_id);
  return {
    id: dbBooking.id,
    userId: dbBooking.user_id,
    userName: userProfile?.name || 'Unknown User',
    slotId: dbBooking.slot_id,
    slotName: '', // Will be filled from slot data
    slotType: 'normal', // Will be filled from slot data
    startTime: new Date(dbBooking.start_time),
    endTime: new Date(dbBooking.end_time),
    createdAt: new Date(dbBooking.created_at),
    status: dbBooking.status as 'active' | 'completed' | 'cancelled',
  };
};

export function ParkingProvider({ children }: { children: React.ReactNode }) {
  // Safely access auth context with proper error handling
  const authContext = useContext(AuthContext);
  if (!authContext) {
    // Return a minimal provider during auth initialization
    console.warn('ParkingProvider: AuthContext not available yet, waiting...');
    return <>{children}</>;
  }
  const currentUser = authContext.currentUser;
  
  const [slots, setSlots] = useState<ParkingSlot[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [userBookings, setUserBookings] = useState<Booking[]>([]);
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [metrics, setMetrics] = useState({
    totalBookings: 0,
    activeBookings: 0,
    completedBookings: 0,
    cancelledBookings: 0,
    lastRefreshTime: null as Date | null,
  });

  // Set up real-time subscriptions
  useEffect(() => {
    const slotsChannel = supabase
      .channel('parking_slots_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'parking_slots' }, () => {
        console.log('Slots data changed');
        refreshData();
      })
      .subscribe();

    const bookingsChannel = supabase
      .channel('bookings_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bookings' }, () => {
        console.log('Bookings data changed');
        refreshData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(slotsChannel);
      supabase.removeChannel(bookingsChannel);
    };
  }, []);
  
  // Handle online/offline events
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      toast.success("You're back online");
      
      // Sync any offline bookings
      const offlineBookings = JSON.parse(localStorage.getItem('offlineBookings') || '[]');
      if (offlineBookings.length > 0) {
        toast.info(`Syncing ${offlineBookings.length} offline bookings...`);
        // In a real app, this would send the offline bookings to the server
      }
      
      // Refresh data
      refreshData();
    };
    
    const handleOffline = () => {
      setIsOnline(false);
      toast.error("You're offline. Limited functionality available.");
    };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Fetch data from Supabase
  const refreshData = useCallback(async () => {
    try {
      // Fetch slots
      const { data: slotsData, error: slotsError } = await supabase
        .from('parking_slots')
        .select('*')
        .order('floor', { ascending: true })
        .order('name', { ascending: true });

      if (slotsError) throw slotsError;

      // Fetch bookings with user profiles
      const { data: bookingsData, error: bookingsError } = await supabase
        .from('bookings')
        .select(`
          *,
          user_profiles!inner(name),
          parking_slots!bookings_slot_id_fkey(name, type)
        `)
        .order('created_at', { ascending: false });

      if (bookingsError) throw bookingsError;

      // Convert data
      const convertedSlots = slotsData?.map(convertDbSlotToSlot) || [];
      
      const convertedBookings = bookingsData?.map((dbBooking: any): Booking => ({
        id: dbBooking.id,
        userId: dbBooking.user_id,
        userName: dbBooking.user_profiles.name || 'Unknown User',
        slotId: dbBooking.slot_id,
        slotName: dbBooking.parking_slots.name,
        slotType: dbBooking.parking_slots.type as SlotType,
        startTime: new Date(dbBooking.start_time),
        endTime: new Date(dbBooking.end_time),
        createdAt: new Date(dbBooking.created_at),
        status: dbBooking.status as 'active' | 'completed' | 'cancelled',
      })) || [];

      setSlots(convertedSlots);
      setBookings(convertedBookings);
      
      if (currentUser) {
        setUserBookings(convertedBookings.filter(booking => booking.userId === currentUser.id));
      }
      
      // Update metrics
      setMetrics({
        totalBookings: convertedBookings.length,
        activeBookings: convertedBookings.filter(b => b.status === 'active').length,
        completedBookings: convertedBookings.filter(b => b.status === 'completed').length,
        cancelledBookings: convertedBookings.filter(b => b.status === 'cancelled').length,
        lastRefreshTime: new Date(),
      });
    } catch (error) {
      console.error('Error refreshing data:', error);
      toast.error('Failed to load data: ' + (error as Error).message);
    }
  }, [currentUser]);

  // Initialize data
  useEffect(() => {
    if (currentUser) {
      refreshData();
    }
  }, [currentUser, refreshData]);

  // Filter user bookings when currentUser changes
  useEffect(() => {
    if (currentUser) {
      setUserBookings(bookings.filter(booking => booking.userId === currentUser.id));
    } else {
      setUserBookings([]);
    }
  }, [currentUser, bookings]);

  const addSlot = useCallback(async (name: string, type: SlotType, floor: number) => {
    try {
      const { error } = await supabase
        .from('parking_slots')
        .insert({
          name,
          type,
          status: 'available',
          floor,
        });

      if (error) throw error;

      toast.success(`Added new ${type} parking slot: ${name}`);
      refreshData();
    } catch (error) {
      console.error('Error adding slot:', error);
      toast.error('Failed to add slot: ' + (error as Error).message);
    }
  }, [refreshData]);

  const updateSlot = useCallback(async (id: string, updates: Partial<ParkingSlot>) => {
    try {
      const { error } = await supabase
        .from('parking_slots')
        .update({
          name: updates.name,
          type: updates.type,
          status: updates.status,
          floor: updates.floor,
        })
        .eq('id', id);

      if (error) throw error;

      toast.success(`Updated slot ${updates.name || id}`);
      refreshData();
    } catch (error) {
      console.error('Error updating slot:', error);
      toast.error('Failed to update slot: ' + (error as Error).message);
    }
  }, [refreshData]);

  const deleteSlot = useCallback(async (id: string) => {
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

    try {
      const { error } = await supabase
        .from('parking_slots')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success(`Deleted slot ${slotToDelete.name}`);
      refreshData();
    } catch (error) {
      console.error('Error deleting slot:', error);
      toast.error('Failed to delete slot: ' + (error as Error).message);
    }
  }, [slots, bookings, refreshData]);

  const bookSlot = useCallback(async (slotId: string, startTime: Date, endTime: Date): Promise<Booking | undefined> => {
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
    const { data: conflictingBookings, error: conflictError } = await supabase
      .from('bookings')
      .select('*')
      .eq('slot_id', slotId)
      .eq('status', 'active')
      .or(`and(start_time.lte.${startTime.toISOString()},end_time.gt.${startTime.toISOString()}),and(start_time.lt.${endTime.toISOString()},end_time.gte.${endTime.toISOString()}),and(start_time.gte.${startTime.toISOString()},end_time.lte.${endTime.toISOString()})`);
    
    if (conflictError) {
      console.error('Error checking conflicts:', conflictError);
      toast.error('Error checking slot availability');
      return;
    }
    
    if (conflictingBookings && conflictingBookings.length > 0) {
      toast.error("This slot is already booked for the selected time");
      return;
    }

    try {
      // Create booking
      const { data: bookingData, error: bookingError } = await supabase
        .from('bookings')
        .insert({
          user_id: currentUser.id,
          slot_id: slotId,
          start_time: startTime.toISOString(),
          end_time: endTime.toISOString(),
          status: 'active'
        })
        .select()
        .single();

      if (bookingError) throw bookingError;

      // Update slot status to occupied
      const { error: updateError } = await supabase
        .from('parking_slots')
        .update({ status: 'occupied' })
        .eq('id', slotId);

      if (updateError) {
        console.error('Error updating slot status:', updateError);
      }

      const newBooking: Booking = {
        id: bookingData.id,
        userId: currentUser.id,
        userName: currentUser.name,
        slotId,
        slotName: slot.name,
        slotType: slot.type,
        startTime,
        endTime,
        createdAt: new Date(bookingData.created_at),
        status: 'active',
      };

      toast.success(`Successfully booked slot ${slot.name}`);
      refreshData();

      return newBooking;
    } catch (error) {
      console.error('Error booking slot:', error);
      toast.error('Failed to book slot: ' + (error as Error).message);
      return undefined;
    }
  }, [currentUser, slots, refreshData]);

  const cancelBooking = useCallback(async (bookingId: string) => {
    const booking = bookings.find(b => b.id === bookingId);
    if (!booking) {
      toast.error("Booking not found");
      return;
    }
    
    if (booking.status !== 'active') {
      toast.error("Only active bookings can be cancelled");
      return;
    }

    try {
      // Update booking status
      const { error: bookingError } = await supabase
        .from('bookings')
        .update({ status: 'cancelled' })
        .eq('id', bookingId);

      if (bookingError) throw bookingError;

      // Update slot status back to available
      const { error: slotError } = await supabase
        .from('parking_slots')
        .update({ status: 'available' })
        .eq('id', booking.slotId);

      if (slotError) {
        console.error('Error updating slot status:', slotError);
      }

      toast.success("Booking cancelled successfully");
      refreshData();
    } catch (error) {
      console.error('Error cancelling booking:', error);
      toast.error('Failed to cancel booking: ' + (error as Error).message);
    }
  }, [bookings, refreshData]);

  const getSlotById = useCallback((slotId: string) => {
    return slots.find(slot => slot.id === slotId);
  }, [slots]);

  const getAvailableSlots = useCallback((date: Date) => {
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
  }, [slots, bookings]);

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
    refreshData,
    isOnline,
    metrics,
  };

  return <ParkingContext.Provider value={value}>{children}</ParkingContext.Provider>;
}
