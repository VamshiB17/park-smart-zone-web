
// Slot Types
export type SlotType = 'normal' | 'electric';
export type SlotStatus = 'available' | 'occupied';

export interface ParkingSlot {
  id: string;
  name: string;
  type: SlotType;
  status: SlotStatus;
  floor: number;
}

// Booking Types
export interface Booking {
  id: string;
  userId: string;
  userName: string;
  slotId: string;
  slotName: string;
  slotType: SlotType;
  startTime: Date;
  endTime: Date;
  createdAt: Date;
  status: 'active' | 'completed' | 'cancelled';
}

// Feedback Types
export interface Feedback {
  id: string;
  userId: string;
  userName: string;
  bookingId: string;
  rating: string;
  experience: string;
  suggestions?: string;
  submittedAt: string;
}

// Mock Data Functions
export const generateMockSlots = (): ParkingSlot[] => {
  const slots: ParkingSlot[] = [];
  
  // Generate 30 normal slots
  for (let i = 1; i <= 30; i++) {
    slots.push({
      id: `normal-${i}`,
      name: `A-${i}`,
      type: 'normal',
      status: Math.random() > 0.3 ? 'available' : 'occupied',
      floor: Math.floor((i - 1) / 10) + 1,
    });
  }
  
  // Generate 10 electric slots
  for (let i = 1; i <= 10; i++) {
    slots.push({
      id: `electric-${i}`,
      name: `E-${i}`,
      type: 'electric',
      status: Math.random() > 0.5 ? 'available' : 'occupied',
      floor: Math.floor((i - 1) / 5) + 1,
    });
  }
  
  return slots;
};

export const generateMockBookings = (userId: string): Booking[] => {
  const bookings: Booking[] = [];
  const now = new Date();
  
  // Past bookings
  for (let i = 1; i <= 5; i++) {
    const startDate = new Date(now);
    startDate.setDate(startDate.getDate() - i * 2);
    startDate.setHours(10, 0, 0, 0);
    
    const endDate = new Date(startDate);
    endDate.setHours(startDate.getHours() + 3);
    
    bookings.push({
      id: `booking-past-${i}`,
      userId,
      userName: 'John Doe',
      slotId: `normal-${i}`,
      slotName: `A-${i}`,
      slotType: i % 3 === 0 ? 'electric' : 'normal',
      startTime: startDate,
      endTime: endDate,
      createdAt: new Date(startDate.getTime() - 86400000), // One day before
      status: 'completed',
    });
  }
  
  // Future bookings
  for (let i = 1; i <= 3; i++) {
    const startDate = new Date(now);
    startDate.setDate(startDate.getDate() + i);
    startDate.setHours(14, 0, 0, 0);
    
    const endDate = new Date(startDate);
    endDate.setHours(startDate.getHours() + 2);
    
    bookings.push({
      id: `booking-future-${i}`,
      userId,
      userName: 'John Doe',
      slotId: `normal-${i + 10}`,
      slotName: `A-${i + 10}`,
      slotType: i % 2 === 0 ? 'electric' : 'normal',
      startTime: startDate,
      endTime: endDate,
      createdAt: new Date(), // Today
      status: 'active',
    });
  }
  
  return bookings;
};

export const generateMockFeedback = (): Feedback[] => {
  return [];
};
