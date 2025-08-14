-- Create the missing trigger for new user profile creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Update the user profiles table to ensure all demo users have consistent data
UPDATE public.user_profiles 
SET role = 'admin', is_admin = true 
WHERE email = 'admin@example.com';

UPDATE public.user_profiles 
SET role = 'user', is_admin = false 
WHERE email = 'user@example.com';