-- Add unique constraint for name to parking_slots table
ALTER TABLE parking_slots ADD CONSTRAINT unique_parking_slot_name UNIQUE (name);

-- Update first user to be admin (Bandari Vamshi)
UPDATE user_profiles 
SET is_admin = true 
WHERE email = 'vamshimani2021@gmail.com';

-- Insert demo parking slots if they don't exist
INSERT INTO parking_slots (name, floor, type, status) VALUES
  ('A-01', 1, 'normal', 'available'),
  ('A-02', 1, 'normal', 'occupied'),
  ('A-03', 1, 'electric', 'available'),
  ('A-04', 1, 'normal', 'available'),
  ('A-05', 1, 'electric', 'occupied'),
  ('A-06', 1, 'normal', 'available'),
  ('B-01', 2, 'normal', 'available'),
  ('B-02', 2, 'normal', 'available'),
  ('B-03', 2, 'electric', 'available'),
  ('B-04', 2, 'normal', 'occupied'),
  ('B-05', 2, 'normal', 'available'),
  ('B-06', 2, 'electric', 'available')
ON CONFLICT (name) DO NOTHING;