-- Remove only the duplicate foreign key constraint
ALTER TABLE bookings DROP CONSTRAINT IF EXISTS fk_bookings_parking_slots;