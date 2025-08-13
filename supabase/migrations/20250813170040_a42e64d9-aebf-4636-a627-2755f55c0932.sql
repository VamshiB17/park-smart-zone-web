-- Update admin user to have proper admin role
UPDATE public.user_profiles 
SET role = 'admin', is_admin = true 
WHERE email = 'admin@example.com';

-- Also make sure user@example.com has proper user role
UPDATE public.user_profiles 
SET role = 'user', is_admin = false 
WHERE email = 'user@example.com';