
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { ParkingSlot, Booking, SlotType, SlotStatus, generateMockSlots, generateMockBookings } from '@/types';
import { useAuth } from './AuthContext';
import { toast } from 'sonner';

// Shared database simulation
const sharedDatabase = {
  slots: generateMockSlots(),
  bookings: [] as Booking[],
};

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

// Create a mock WebSocket for real-time updates simulation
class MockWebSocket {
  onmessage: ((event: { data: string }) => void) | null = null;
  onopen: (() => void) | null = null;
  onclose: (() => void) | null = null;
  onerror: ((error: any) => void) | null = null;
  
  constructor(url: string) {
    // Simulate connection established
    setTimeout(() => {
      if (this.onopen) this.onopen();
    }, 500);
    
    // Set up periodic updates
    setInterval(() => {
      if (this.onmessage && Math.random() > 0.7) {
        // Simulate receiving data
        this.onmessage({
          data: JSON.stringify({
            type: 'update',
            timestamp: new Date().toISOString()
          })
        });
      }
    }, 5000);
  }
  
  send(data: string) {
    // Simulate sending data
    console.log('WebSocket sent:', data);
  }
  
  close() {
    if (this.onclose) this.onclose();
  }
}

export function ParkingProvider({ children }: { children: React.ReactNode }) {
  const { currentUser } = useAuth();
  const [slots, setSlots] = useState<ParkingSlot[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [userBookings, setUserBookings] = useState<Booking[]>([]);
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [ws, setWs] = useState<MockWebSocket | null>(null);
  const [metrics, setMetrics] = useState({
    totalBookings: 0,
    activeBookings: 0,
    completedBookings: 0,
    cancelledBookings: 0,
    lastRefreshTime: null as Date | null,
  });

  // Initialize WebSocket connection
  useEffect(() => {
    const mockWs = new MockWebSocket('wss://parksmart.example/realtime');
    
    mockWs.onopen = () => {
      console.log('WebSocket connection established');
    };
    
    mockWs.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'update') {
          refreshData();
        }
      } catch (e) {
        console.error('Error parsing WebSocket message', e);
      }
    };
    
    mockWs.onclose = () => {
      console.log('WebSocket connection closed');
    };
    
    setWs(mockWs);
    
    return () => {
      mockWs.close();
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

  // Initialize with shared database data
  const refreshData = useCallback(() => {
    setSlots([...sharedDatabase.slots]);
    setBookings([...sharedDatabase.bookings]);
    
    if (currentUser) {
      setUserBookings(sharedDatabase.bookings.filter(booking => booking.userId === currentUser.id));
    }
    
    // Update metrics
    setMetrics({
      totalBookings: sharedDatabase.bookings.length,
      activeBookings: sharedDatabase.bookings.filter(b => b.status === 'active').length,
      completedBookings: sharedDatabase.bookings.filter(b => b.status === 'completed').length,
      cancelledBookings: sharedDatabase.bookings.filter(b => b.status === 'cancelled').length,
      lastRefreshTime: new Date(),
    });
  }, [currentUser]);

  // Initialize with mock data
  useEffect(() => {
    // Initialize shared database with mock bookings if empty
    if (sharedDatabase.bookings.length === 0 && currentUser) {
      sharedDatabase.bookings = generateMockBookings(currentUser.id);
    }
    
    refreshData();
    
    // Setup periodic refresh for real-time updates
    const intervalId = setInterval(() => {
      refreshData();
    }, 3000);
    
    return () => clearInterval(intervalId);
  }, [currentUser, refreshData]);

  // Filter user bookings when currentUser changes
  useEffect(() => {
    if (currentUser) {
      setUserBookings(bookings.filter(booking => booking.userId === currentUser.id));
    } else {
      setUserBookings([]);
    }
  }, [currentUser, bookings]);

  const addSlot = useCallback((name: string, type: SlotType, floor: number) => {
    const newSlot: ParkingSlot = {
      id: `slot-${Date.now()}`,
      name,
      type,
      status: 'available' as SlotStatus,
      floor,
    };
    
    sharedDatabase.slots = [...sharedDatabase.slots, newSlot];
    refreshData();
    toast.success(`Added new ${type} parking slot: ${name}`);
    
    // Notify via WebSocket
    ws?.send(JSON.stringify({ action: 'slot_added', slot: newSlot }));
  }, [refreshData, ws]);

  const updateSlot = useCallback((id: string, updates: Partial<ParkingSlot>) => {
    sharedDatabase.slots = sharedDatabase.slots.map(slot => 
      slot.id === id ? { ...slot, ...updates } : slot
    );
    
    refreshData();
    toast.success(`Updated slot ${updates.name || id}`);
    
    // Notify via WebSocket
    ws?.send(JSON.stringify({ action: 'slot_updated', slotId: id, updates }));
  }, [refreshData, ws]);

  const deleteSlot = useCallback((id: string) => {
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
    
    sharedDatabase.slots = sharedDatabase.slots.filter(slot => slot.id !== id);
    refreshData();
    toast.success(`Deleted slot ${slotToDelete.name}`);
    
    // Notify via WebSocket
    ws?.send(JSON.stringify({ action: 'slot_deleted', slotId: id }));
  }, [slots, bookings, refreshData, ws]);

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
    
    // Add booking to database
    sharedDatabase.bookings = [...sharedDatabase.bookings, newBooking];
    
    // Immediately update slot status to occupied when booked
    // This ensures it shows as booked in all views right away
    sharedDatabase.slots = sharedDatabase.slots.map(s => 
      s.id === slotId ? { ...s, status: 'occupied' as SlotStatus } : s
    );
    
    refreshData();
    toast.success(`Successfully booked slot ${slot.name}`);
    
    // Notify via WebSocket
    ws?.send(JSON.stringify({ action: 'booking_created', booking: newBooking }));
    
    // For offline support, store in local storage
    try {
      const offlineBookings = JSON.parse(localStorage.getItem('userBookings') || '[]');
      offlineBookings.push(newBooking);
      localStorage.setItem('userBookings', JSON.stringify(offlineBookings));
    } catch (err) {
      console.error('Error saving booking to local storage', err);
    }
    
    return newBooking;
  }, [currentUser, slots, bookings, refreshData, ws]);

  const cancelBooking = useCallback((bookingId: string) => {
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
    sharedDatabase.bookings = sharedDatabase.bookings.map(b => 
      b.id === bookingId ? { ...b, status: 'cancelled' } : b
    );
    
    // Update slot status back to available
    const slotToUpdate = sharedDatabase.slots.find(s => s.id === booking.slotId);
    if (slotToUpdate) {
      sharedDatabase.slots = sharedDatabase.slots.map(s => 
        s.id === booking.slotId ? { ...s, status: 'available' as SlotStatus } : s
      );
    }
    
    refreshData();
    toast.success("Booking cancelled successfully");
    
    // Notify via WebSocket
    ws?.send(JSON.stringify({ action: 'booking_cancelled', bookingId }));
    
    // Update offline storage
    try {
      let offlineBookings = JSON.parse(localStorage.getItem('userBookings') || '[]');
      offlineBookings = offlineBookings.map((b: Booking) => 
        b.id === bookingId ? { ...b, status: 'cancelled' } : b
      );
      localStorage.setItem('userBookings', JSON.stringify(offlineBookings));
    } catch (err) {
      console.error('Error updating local storage', err);
    }
  }, [bookings, refreshData, ws]);

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
