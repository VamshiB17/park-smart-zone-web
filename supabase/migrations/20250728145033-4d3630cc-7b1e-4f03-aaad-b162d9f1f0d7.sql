-- Fix the function search path security issue
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = 'public'
AS $$
  SELECT COALESCE(
    (SELECT role = 'admin' OR is_admin = true 
     FROM public.user_profiles 
     WHERE id = auth.uid()),
    false
  );
$$;