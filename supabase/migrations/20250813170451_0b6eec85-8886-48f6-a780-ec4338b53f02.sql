-- Create sample bookings for testing
INSERT INTO public.bookings (user_id, slot_id, start_time, end_time, status)
SELECT 
  up.id as user_id,
  ps.id as slot_id,
  CURRENT_TIMESTAMP as start_time,
  CURRENT_TIMESTAMP + INTERVAL '2 hours' as end_time,
  'active' as status
FROM public.user_profiles up, public.parking_slots ps
WHERE up.email = 'user@example.com' AND ps.name = 'A-02'
LIMIT 1;

-- Create another booking for admin user
INSERT INTO public.bookings (user_id, slot_id, start_time, end_time, status)
SELECT 
  up.id as user_id,
  ps.id as slot_id,
  CURRENT_TIMESTAMP - INTERVAL '1 day' as start_time,
  CURRENT_TIMESTAMP - INTERVAL '22 hours' as end_time,
  'completed' as status
FROM public.user_profiles up, public.parking_slots ps
WHERE up.email = 'admin@example.com' AND ps.name = 'A-05'
LIMIT 1;

-- Create sample feedback
INSERT INTO public.feedback (user_id, rating, comment)
SELECT 
  up.id as user_id,
  5 as rating,
  'Great parking system! Very easy to use and convenient.' as comment
FROM public.user_profiles up
WHERE up.email = 'user@example.com'
LIMIT 1;

INSERT INTO public.feedback (user_id, rating, comment)
SELECT 
  up.id as user_id,
  4 as rating,
  'Good overall experience. The QR code system works well.' as comment
FROM public.user_profiles up
WHERE up.email = 'admin@example.com'
LIMIT 1;