-- Fix duplicate foreign key constraints causing booking query issues
-- Drop the duplicate foreign key constraint that's causing the relationship conflict
ALTER TABLE public.bookings DROP CONSTRAINT IF EXISTS fk_bookings_parking_slots;

-- Keep only the original bookings_slot_id_fkey constraint
-- This will resolve the "more than one relationship" error in queries