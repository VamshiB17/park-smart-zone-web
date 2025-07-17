
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { ParkingSlot, Booking, BookingWithDetails, SlotType, SlotStatus, BookingStatus } from '@/types';
import { useAuth } from './AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ParkingContextType {
  slots: ParkingSlot[];
  bookings: BookingWithDetails[];
  userBookings: BookingWithDetails[];
  addSlot: (name: string, type: SlotType, floor: number) => void;
  updateSlot: (id: string, updates: Partial<ParkingSlot>) => void;
  deleteSlot: (id: string) => void;
  bookSlot: (slotId: string, startTime: Date, endTime: Date) => Promise<BookingWithDetails | undefined>;
  cancelBooking: (bookingId: string) => void;
  getSlotById: (slotId: string) => ParkingSlot | undefined;
  getAvailableSlots: (date: Date) => ParkingSlot[];
  refreshData: () => void;
  loading: boolean;
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

export function ParkingProvider({ children }: { children: React.ReactNode }) {
  const { currentUser, loading: authLoading } = useAuth();
  const [slots, setSlots] = useState<ParkingSlot[]>([]);
  const [bookings, setBookings] = useState<BookingWithDetails[]>([]);
  const [userBookings, setUserBookings] = useState<BookingWithDetails[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [metrics, setMetrics] = useState({
    totalBookings: 0,
    activeBookings: 0,
    completedBookings: 0,
    cancelledBookings: 0,
    lastRefreshTime: null as Date | null,
  });

  // Helper function to convert booking to BookingWithDetails
  const enrichBooking = useCallback((booking: Booking, slot?: ParkingSlot, userProfile?: any): BookingWithDetails => {
    return {
      ...booking,
      userName: userProfile?.name || 'Unknown User',
      slotName: slot?.name || 'Unknown Slot',
      slotType: slot?.type || 'normal',
      startTime: new Date(booking.start_time),
      endTime: new Date(booking.end_time),
      createdAt: new Date(booking.created_at),
    };
  }, []);

  // Fetch all data from Supabase
  const refreshData = useCallback(async () => {
    if (authLoading) return;

    try {
      setLoading(true);

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
          user_profiles!inner(name, email)
        `)
        .order('created_at', { ascending: false });

      if (bookingsError) throw bookingsError;

      setSlots((slotsData || []) as ParkingSlot[]);

      // Enrich bookings with slot and user data
      const enrichedBookings = (bookingsData || []).map((booking: any) => {
        const slot = (slotsData || []).find(s => s.id === booking.slot_id);
        return enrichBooking(booking as Booking, slot as ParkingSlot, booking.user_profiles);
      });

      setBookings(enrichedBookings);

      // Filter user bookings
      if (currentUser) {
        setUserBookings(enrichedBookings.filter(booking => booking.user_id === currentUser.id));
      } else {
        setUserBookings([]);
      }

      // Update metrics
      setMetrics({
        totalBookings: enrichedBookings.length,
        activeBookings: enrichedBookings.filter(b => b.status === 'active').length,
        completedBookings: enrichedBookings.filter(b => b.status === 'completed').length,
        cancelledBookings: enrichedBookings.filter(b => b.status === 'cancelled').length,
        lastRefreshTime: new Date(),
      });

    } catch (error: any) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load data: ' + error.message);
    } finally {
      setLoading(false);
    }
  }, [currentUser, authLoading, enrichBooking]);

  // Set up real-time subscriptions
  useEffect(() => {
    if (authLoading) return;

    // Initial data fetch
    refreshData();

    // Set up real-time subscriptions
    const slotsChannel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'parking_slots'
        },
        () => refreshData()
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bookings'
        },
        () => refreshData()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(slotsChannel);
    };
  }, [refreshData, authLoading]);

  const addSlot = useCallback(async (name: string, type: SlotType, floor: number) => {
    if (!currentUser?.role || currentUser.role !== 'admin') {
      toast.error("Only admins can add parking slots");
      return;
    }

    try {
      const { data, error } = await supabase
        .from('parking_slots')
        .insert([{
          name,
          type,
          status: 'available',
          floor
        }])
        .select()
        .single();

      if (error) throw error;

      toast.success(`Added new ${type} parking slot: ${name}`);
      // Data will be updated via real-time subscription
    } catch (error: any) {
      console.error('Error adding slot:', error);
      toast.error('Failed to add slot: ' + error.message);
    }
  }, [currentUser]);

  const updateSlot = useCallback(async (id: string, updates: Partial<ParkingSlot>) => {
    if (!currentUser?.role || currentUser.role !== 'admin') {
      toast.error("Only admins can update parking slots");
      return;
    }

    try {
      const { error } = await supabase
        .from('parking_slots')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      toast.success(`Updated slot ${updates.name || id}`);
      // Data will be updated via real-time subscription
    } catch (error: any) {
      console.error('Error updating slot:', error);
      toast.error('Failed to update slot: ' + error.message);
    }
  }, [currentUser]);

  const deleteSlot = useCallback(async (id: string) => {
    if (!currentUser?.role || currentUser.role !== 'admin') {
      toast.error("Only admins can delete parking slots");
      return;
    }

    const slotToDelete = slots.find(slot => slot.id === id);
    if (!slotToDelete) return;
    
    // Check if there are active bookings for this slot
    const activeBookings = bookings.filter(
      booking => booking.slot_id === id && booking.status === 'active'
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
      // Data will be updated via real-time subscription
    } catch (error: any) {
      console.error('Error deleting slot:', error);
      toast.error('Failed to delete slot: ' + error.message);
    }
  }, [slots, bookings, currentUser]);

  const bookSlot = useCallback(async (slotId: string, startTime: Date, endTime: Date): Promise<BookingWithDetails | undefined> => {
    if (!currentUser) {
      toast.error("You must be logged in to book a slot");
      return;
    }
    
    const slot = slots.find(s => s.id === slotId);
    if (!slot) {
      toast.error("Slot not found");
      return;
    }
    
    // Check for time conflicts
    const hasConflict = bookings.some(booking => {
      if (booking.slot_id !== slotId) return false;
      if (booking.status !== 'active') return false;
      
      const bookingStart = new Date(booking.start_time);
      const bookingEnd = new Date(booking.end_time);
      
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

    try {
      const { data, error } = await supabase
        .from('bookings')
        .insert([{
          user_id: currentUser.id,
          slot_id: slotId,
          start_time: startTime.toISOString(),
          end_time: endTime.toISOString(),
          status: 'active'
        }])
        .select()
        .single();

      if (error) throw error;

      // Update slot status to occupied
      await supabase
        .from('parking_slots')
        .update({ status: 'occupied' })
        .eq('id', slotId);

      const enrichedBooking = enrichBooking(data as Booking, slot, { name: currentUser.name });
      
      toast.success(`Successfully booked slot ${slot.name}`);
      // Data will be updated via real-time subscription
      
      return enrichedBooking;
    } catch (error: any) {
      console.error('Error booking slot:', error);
      toast.error('Failed to book slot: ' + error.message);
    }
  }, [currentUser, slots, bookings, enrichBooking]);

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

    if (booking.user_id !== currentUser?.id && currentUser?.role !== 'admin') {
      toast.error("You can only cancel your own bookings");
      return;
    }

    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status: 'cancelled' })
        .eq('id', bookingId);

      if (error) throw error;

      // Update slot status back to available
      await supabase
        .from('parking_slots')
        .update({ status: 'available' })
        .eq('id', booking.slot_id);

      toast.success("Booking cancelled successfully");
      // Data will be updated via real-time subscription
    } catch (error: any) {
      console.error('Error cancelling booking:', error);
      toast.error('Failed to cancel booking: ' + error.message);
    }
  }, [bookings, currentUser]);

  const getSlotById = useCallback((slotId: string) => {
    return slots.find(slot => slot.id === slotId);
  }, [slots]);

  const getAvailableSlots = useCallback((date: Date) => {
    return slots.filter(slot => {
      // Check if there's an active booking that overlaps with the requested date
      const slotBookings = bookings.filter(
        b => b.slot_id === slot.id && b.status === 'active'
      );
      
      // If there are no active bookings, the slot is available
      if (slotBookings.length === 0) return true;
      
      // Check if any booking overlaps with the requested date
      return !slotBookings.some(booking => {
        const bookingStart = new Date(booking.start_time);
        const bookingEnd = new Date(booking.end_time);
        
        // The simple case: if the requested date falls within the booking time
        return date >= bookingStart && date <= bookingEnd;
      });
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
    loading,
    metrics,
  };

  return <ParkingContext.Provider value={value}>{children}</ParkingContext.Provider>;
}
