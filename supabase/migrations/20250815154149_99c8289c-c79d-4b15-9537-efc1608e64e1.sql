-- Remove the duplicate foreign key constraint
ALTER TABLE bookings DROP CONSTRAINT IF EXISTS fk_bookings_parking_slots;

-- Add the proper foreign key constraint if it doesn't exist
ALTER TABLE bookings 
ADD CONSTRAINT bookings_slot_id_fkey 
FOREIGN KEY (slot_id) 
REFERENCES parking_slots(id) 
ON DELETE CASCADE;