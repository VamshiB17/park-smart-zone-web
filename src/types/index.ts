// Database Types aligned with Supabase schema
export type SlotType = 'normal' | 'electric';
export type SlotStatus = 'available' | 'occupied';
export type BookingStatus = 'active' | 'completed' | 'cancelled';

// Database table interfaces matching Supabase schema
export interface ParkingSlot {
  id: string;
  name: string;
  type: SlotType;
  status: SlotStatus;
  floor: number;
  created_at: string;
  updated_at: string;
}

export interface Booking {
  id: string;
  user_id: string;
  slot_id: string;
  start_time: string;
  end_time: string;
  status: BookingStatus;
  created_at: string;
  updated_at: string;
}

// Client-side enriched types
export interface BookingWithDetails extends Booking {
  userName: string;
  slotName: string;
  slotType: SlotType;
  startTime: Date;
  endTime: Date;
  createdAt: Date;
}

export interface UserProfile {
  id: string;
  email: string | null;
  name: string | null;
  is_admin: boolean;
  created_at: string;
  updated_at: string;
}