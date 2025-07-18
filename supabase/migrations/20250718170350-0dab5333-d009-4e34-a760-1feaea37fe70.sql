-- Add foreign key constraint between bookings and user_profiles
ALTER TABLE bookings 
ADD CONSTRAINT fk_bookings_user_profiles 
FOREIGN KEY (user_id) REFERENCES user_profiles(id) ON DELETE CASCADE;

-- Add foreign key constraint between bookings and parking_slots
ALTER TABLE bookings 
ADD CONSTRAINT fk_bookings_parking_slots 
FOREIGN KEY (slot_id) REFERENCES parking_slots(id) ON DELETE CASCADE;

-- Add foreign key constraint between feedback and user_profiles
ALTER TABLE feedback 
ADD CONSTRAINT fk_feedback_user_profiles 
FOREIGN KEY (user_id) REFERENCES user_profiles(id) ON DELETE CASCADE;

-- Add foreign key constraint between feedback and bookings
ALTER TABLE feedback 
ADD CONSTRAINT fk_feedback_bookings 
FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE;