
import React, { createContext, useContext, useState, useEffect } from 'react';
import { ParkingSlot, Booking, generateMockSlots, generateMockBookings, Feedback } from '@/types';

interface ParkingContextType {
  slots: ParkingSlot[];
  bookings: Booking[];
  userBookings: Booking[]; // Add this property that was missing
  feedback: Feedback[];
  refreshData: () => void;
  bookSlot: (booking: Omit<Booking, 'id' | 'createdAt'>) => Booking;
  cancelBooking: (bookingId: string) => void;
  submitFeedback: (feedbackData: Omit<Feedback, 'id'>) => void;
  addSlot?: (slot: Omit<ParkingSlot, 'id'>) => ParkingSlot; // Add these admin operations
  updateSlot?: (id: string, updates: Partial<ParkingSlot>) => ParkingSlot;
  deleteSlot?: (id: string) => void;
  isOnline: boolean;
  metrics: {
    totalBookings: number;
    cancelledBookings: number;
    completedBookings: number;
    lastRefreshTime: Date | null;
  };
}

const ParkingContext = createContext<ParkingContextType | undefined>(undefined);

export const useParkingContext = () => {
  const context = useContext(ParkingContext);
  if (!context) {
    throw new Error('useParkingContext must be used within a ParkingProvider');
  }
  return context;
};

interface ParkingProviderProps {
  children: React.ReactNode;
}

export const ParkingProvider: React.FC<ParkingProviderProps> = ({ children }) => {
  const [slots, setSlots] = useState<ParkingSlot[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [isOnline, setIsOnline] = useState(true);
  const [metrics, setMetrics] = useState({
    totalBookings: 0,
    cancelledBookings: 0,
    completedBookings: 0,
    lastRefreshTime: null as Date | null,
  });

  // Mock WebSocket for real-time updates
  useEffect(() => {
    const mockWebSocket = {
      onmessage: null as ((event: { data: string }) => void) | null,
      send: (data: string) => {
        console.info('WebSocket sent:', data);
        
        // Parse the message data
        const message = JSON.parse(data);
        
        // Handle different message types
        if (message.action === 'booking_cancelled') {
          // Update the UI as if the server responded
          setTimeout(() => {
            if (mockWebSocket.onmessage) {
              mockWebSocket.onmessage({
                data: JSON.stringify({
                  type: 'booking_cancelled',
                  bookingId: message.bookingId,
                  success: true,
                }),
              });
            }
          }, 300);
        } else if (message.action === 'booking_created') {
          // Update the UI as if the server responded
          setTimeout(() => {
            if (mockWebSocket.onmessage) {
              mockWebSocket.onmessage({
                data: JSON.stringify({
                  type: 'booking_created',
                  booking: message.booking,
                  success: true,
                }),
              });
            }
          }, 300);
        } else if (message.action === 'feedback_submitted') {
          // Update the UI as if the server responded
          setTimeout(() => {
            if (mockWebSocket.onmessage) {
              mockWebSocket.onmessage({
                data: JSON.stringify({
                  type: 'feedback_submitted',
                  feedback: message.feedback,
                  success: true,
                }),
              });
            }
          }, 300);
        }
      },
    };

    // Set up a listener for the mock WebSocket messages
    mockWebSocket.onmessage = (event) => {
      const message = JSON.parse(event.data);
      
      if (message.type === 'booking_cancelled' && message.success) {
        setBookings((prev) =>
          prev.map((booking) =>
            booking.id === message.bookingId
              ? { ...booking, status: 'cancelled' }
              : booking
          )
        );
        
        // Free up the slot
        setSlots((prev) => {
          const booking = bookings.find(b => b.id === message.bookingId);
          if (!booking) return prev;
          
          return prev.map((slot) =>
            slot.id === booking.slotId
              ? { ...slot, status: 'available' }
              : slot
          );
        });
      } else if (message.type === 'booking_created' && message.success) {
        // Add the new booking
        setBookings((prev) => [...prev, message.booking]);
        
        // Update the slot status
        setSlots((prev) =>
          prev.map((slot) =>
            slot.id === message.booking.slotId
              ? { ...slot, status: 'occupied' }
              : slot
          )
        );
      } else if (message.type === 'feedback_submitted' && message.success) {
        // Add the new feedback
        setFeedback((prev) => [...prev, message.feedback]);
      }
    };
    
    // Return cleanup function
    return () => {
      mockWebSocket.onmessage = null;
    };
  }, [bookings]);

  // Initial data load and periodic refresh
  const refreshData = React.useCallback(() => {
    // In a real app, this would fetch data from an API
    // For this demo, we'll use the mock data
    
    // Only regenerate on first load
    if (slots.length === 0) {
      const mockSlots = generateMockSlots();
      setSlots(mockSlots);
    }
    
    if (bookings.length === 0) {
      const mockBookings = generateMockBookings('1');
      setBookings(mockBookings);
    }
    
    // Update metrics
    const totalBookings = bookings.length;
    const cancelledBookings = bookings.filter((b) => b.status === 'cancelled').length;
    const completedBookings = bookings.filter((b) => b.status === 'completed').length;
    
    setMetrics({
      totalBookings,
      cancelledBookings,
      completedBookings,
      lastRefreshTime: new Date(),
    });
    
    // Simulate occasional network issues
    setIsOnline(Math.random() > 0.05); // 5% chance of being "offline"
  }, [slots.length, bookings.length, bookings]);

  // Book a slot
  const bookSlot = (bookingData: Omit<Booking, 'id' | 'createdAt'>) => {
    const newBooking: Booking = {
      ...bookingData,
      id: `booking-${Date.now()}`,
      createdAt: new Date(),
    };
    
    // Update slot status
    setSlots((prev) =>
      prev.map((slot) =>
        slot.id === bookingData.slotId ? { ...slot, status: 'occupied' } : slot
      )
    );
    
    // Add booking to the list
    setBookings((prev) => [...prev, newBooking]);
    
    // Send event to mock WebSocket
    // This would be a real API call in a production app
    const mockWebSocketMessage = {
      action: 'booking_created',
      booking: newBooking,
    };
    
    // Simulate WebSocket message
    console.info('WebSocket sent:', mockWebSocketMessage);
    
    return newBooking;
  };

  // Cancel a booking
  const cancelBooking = (bookingId: string) => {
    // Send event to mock WebSocket
    const mockWebSocketMessage = {
      action: 'booking_cancelled',
      bookingId,
    };
    
    // Simulate WebSocket message
    console.info('WebSocket sent:', mockWebSocketMessage);
    
    // Updates will be handled by the mock WebSocket response
  };
  
  // Submit feedback
  const submitFeedback = (feedbackData: Omit<Feedback, 'id'>) => {
    const newFeedback: Feedback = {
      ...feedbackData,
      id: `feedback-${Date.now()}`,
    };
    
    // Send event to mock WebSocket
    const mockWebSocketMessage = {
      action: 'feedback_submitted',
      feedback: newFeedback,
    };
    
    // Simulate WebSocket message
    console.info('WebSocket sent:', mockWebSocketMessage);
    
    // Add feedback directly for immediate UI update
    setFeedback((prev) => [...prev, newFeedback]);
    
    return newFeedback;
  };

  // Admin operations for slot management
  const addSlot = (slotData: Omit<ParkingSlot, 'id'>): ParkingSlot => {
    const newSlot: ParkingSlot = {
      ...slotData,
      id: `slot-${Date.now()}`,
    };
    
    setSlots(prev => [...prev, newSlot]);
    return newSlot;
  };
  
  const updateSlot = (id: string, updates: Partial<ParkingSlot>): ParkingSlot => {
    let updatedSlot: ParkingSlot | undefined;
    
    setSlots(prev => {
      const newSlots = prev.map(slot => {
        if (slot.id === id) {
          updatedSlot = { ...slot, ...updates };
          return updatedSlot;
        }
        return slot;
      });
      
      return newSlots;
    });
    
    return updatedSlot!;
  };
  
  const deleteSlot = (id: string): void => {
    setSlots(prev => prev.filter(slot => slot.id !== id));
  };

  // Filter bookings for current user (for user dashboard)
  const userBookings = bookings.filter(booking => booking.userId === '1'); // Mock user ID for demo

  return (
    <ParkingContext.Provider value={{ 
      slots, 
      bookings,
      userBookings, // Add the filtered user bookings
      feedback,
      refreshData, 
      bookSlot, 
      cancelBooking,
      submitFeedback,
      addSlot,
      updateSlot,
      deleteSlot,
      isOnline,
      metrics,
    }}>
      {children}
    </ParkingContext.Provider>
  );
};
