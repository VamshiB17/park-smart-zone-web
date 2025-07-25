-- Create demo user accounts
-- First insert into auth.users (this will be handled by Supabase auth)
-- Then insert user profiles for demo accounts

-- Insert demo user profile (regular user)
INSERT INTO user_profiles (id, email, name, role, is_admin) 
VALUES (
  '11111111-1111-1111-1111-111111111111',
  'user@example.com',
  'Demo User',
  'user',
  false
) ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  name = EXCLUDED.name,
  role = EXCLUDED.role,
  is_admin = EXCLUDED.is_admin;

-- Insert demo admin profile
INSERT INTO user_profiles (id, email, name, role, is_admin) 
VALUES (
  '22222222-2222-2222-2222-222222222222',
  'admin@example.com',
  'Demo Admin',
  'admin',
  true
) ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  name = EXCLUDED.name,
  role = EXCLUDED.role,
  is_admin = EXCLUDED.is_admin;